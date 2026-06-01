const express    = require('express');
const Datastore  = require('@seald-io/nedb');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const path       = require('path');
const fs         = require('fs');
const Anthropic  = require('@anthropic-ai/sdk');

const app       = express();
const PORT      = process.env.PORT || 3000;
const SECRET    = process.env.JWT_SECRET || 'kalorifodi_secret_2025';
const ADMIN_PASS= process.env.ADMIN_PASSWORD || 'admin123';

// ── Database setup ─────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const users = new Datastore({ filename: path.join(dataDir, 'users.db'), autoload: true });
const logs  = new Datastore({ filename: path.join(dataDir, 'logs.db'),  autoload: true });

users.ensureIndex({ fieldName: 'username', unique: true });
logs.ensureIndex({ fieldName: 'userId' });

// ── Middleware ─────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function auth(req, res, next) {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}
function adminAuth(req, res, next) {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const d = jwt.verify(token, SECRET);
    if (!d.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    req.admin = d; next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ── Auth routes ────────────────────────────────────────────
// הרשמה — רק דרך פאנל הניהול (adminAuth)
app.post('/api/auth/register', adminAuth, async (req, res) => {
  try {
    const { username, password, name } = req.body || {};
    if (!username || !password || !name)
      return res.status(400).json({ error: 'חסרים שדות' });
    if (username.length < 3)
      return res.status(400).json({ error: 'שם משתמש קצר מדי' });
    if (password.length < 4)
      return res.status(400).json({ error: 'סיסמה קצרה מדי' });

    const hash = bcrypt.hashSync(password, 10);
    const user = await users.insertAsync({
      username: username.toLowerCase(), password_hash: hash,
      name, profile: null, createdAt: Date.now()
    });
    const token = jwt.sign({ id: user._id, username: user.username, name }, SECRET, { expiresIn: '30d' });
    res.json({ token, name, username: user.username, hasProfile: false });
  } catch (e) {
    if (e.errorType === 'uniqueViolated')
      return res.status(409).json({ error: 'שם המשתמש תפוס' });
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ error: 'חסרים שדות' });
    const user = await users.findOneAsync({ username: username.toLowerCase() });
    if (!user || !bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
    const token = jwt.sign({ id: user._id, username: user.username, name: user.name }, SECRET, { expiresIn: '30d' });
    res.json({ token, name: user.name, username: user.username, hasProfile: !!user.profile });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── User routes ────────────────────────────────────────────
app.get('/api/user', auth, async (req, res) => {
  try {
    const u = await users.findOneAsync({ _id: req.user.id });
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json({ id: u._id, username: u.username, name: u.name, profile: u.profile || null });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/user', auth, async (req, res) => {
  try {
    await users.updateAsync({ _id: req.user.id }, { $set: { profile: req.body } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Logs routes ────────────────────────────────────────────
app.get('/api/logs/week', auth, async (req, res) => {
  try {
    const result = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      const row = await logs.findOneAsync({ userId: req.user.id, date });
      result[date] = row ? { foods: row.foods, water: row.water } : { foods: [], water: 0 };
    }
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/logs/:date', auth, async (req, res) => {
  try {
    const row = await logs.findOneAsync({ userId: req.user.id, date: req.params.date });
    res.json(row ? { foods: row.foods, water: row.water } : { foods: [], water: 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/logs/:date', auth, async (req, res) => {
  try {
    const { foods = [], water = 0 } = req.body || {};
    const existing = await logs.findOneAsync({ userId: req.user.id, date: req.params.date });
    if (existing) {
      await logs.updateAsync({ _id: existing._id }, { $set: { foods, water, updatedAt: Date.now() } });
    } else {
      await logs.insertAsync({ userId: req.user.id, date: req.params.date, foods, water, updatedAt: Date.now() });
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Food analysis ─────────────────────────────────────────
app.post('/api/analyze-food', auth, async (req, res) => {
  try {
    const { b64, mediaType = 'image/jpeg' } = req.body || {};
    if (!b64) return res.status(400).json({ error: 'חסרת תמונה' });
    if (!process.env.ANTHROPIC_API_KEY)
      return res.status(503).json({ error: 'מפתח AI לא מוגדר בשרת' });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } },
          { type: 'text', text: `אתה דיאטן מומחה. נתח את התמונה ובדוק אם יש בה מזון.

אם אין מזון בתמונה (רק אנשים, נוף, חפצים וכו'): החזר {"hasFood":false}

אם יש מזון:
1. זהה כל פריט מזון נפרד
2. האם הכמות ניתנת לזיהוי בבירור מהתמונה? (למשל: נראה משקל, מידה, כמה יחידות ספורות ברורות)
   - אם כן: needsQty:false ורשום את הכמות ב-serving
   - אם לא (ערימה, קערה לא ברורה, כמות לא ניתנת להערכה): needsQty:true ורשום מנה בסיסית ב-serving

החזר JSON תקני בלבד, ללא טקסט נוסף:
{"hasFood":true,"needsQty":false,"items":[{"name":"שם בעברית","serving":"תיאור כמות","icon":"אמוג׳י אחד","kcal":מספר,"p":מספר,"c":מספר,"f":מספר}]}` }
        ]
      }]
    });

    let s = (msg.content[0].text || '').trim();
    const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) s = fence[1].trim();
    const start = s.indexOf('{'); const end = s.lastIndexOf('}');
    if (start >= 0 && end > start) s = s.slice(start, end + 1);
    res.json(JSON.parse(s));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Admin routes ───────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  if ((req.body || {}).password !== ADMIN_PASS)
    return res.status(401).json({ error: 'סיסמה שגויה' });
  const token = jwt.sign({ isAdmin: true }, SECRET, { expiresIn: '8h' });
  res.json({ token });
});

app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const totalUsers  = await users.countAsync({});
    const totalLogs   = await logs.countAsync({});
    const todayLogs   = await logs.findAsync({ date: today });
    res.json({ totalUsers, totalLogs, activeToday: new Set(todayLogs.map(l => l.userId)).size });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const all = await users.findAsync({}).sort({ createdAt: -1 });
    res.json(all.map(u => ({ id: u._id, username: u.username, name: u.name, profile: u.profile, created_at: Math.floor(u.createdAt / 1000) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/users/:id/logs', adminAuth, async (req, res) => {
  try {
    const userLogs = await logs.findAsync({ userId: req.params.id }).sort({ date: -1 }).limit(30);
    res.json(userLogs.map(l => ({ date: l.date, foods: l.foods, water: l.water })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
  try {
    await logs.removeAsync({ userId: req.params.id }, { multi: true });
    await users.removeAsync({ _id: req.params.id }, {});
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/admin', (req, res) =>
  res.sendFile(path.join(__dirname, 'admin', 'index.html'))
);

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.listen(PORT, () => {
  console.log(`\n🥑 קלוריפודי  →  http://localhost:${PORT}`);
  console.log(`🔧 Admin       →  http://localhost:${PORT}/admin`);
  console.log(`   סיסמת Admin →  ${ADMIN_PASS}\n`);
});
