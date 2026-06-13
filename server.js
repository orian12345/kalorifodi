const express   = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const path      = require('path');
const https     = require('https');
const Anthropic = require('@anthropic-ai/sdk');

const app       = express();
const PORT      = process.env.PORT || 3000;
const SECRET    = process.env.JWT_SECRET || 'kalorifodi_secret_2025';
const ADMIN_PASS= process.env.ADMIN_PASSWORD || 'admin123';
const MONGODB_URI = process.env.MONGODB_URI;

// ── Database setup ─────────────────────────────────────────
let usersCol, logsCol, dbReady = false;

async function connectDB() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable is not set');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('kalorifodi');
  usersCol = db.collection('users');
  logsCol  = db.collection('logs');
  await usersCol.createIndex({ username: 1 }, { unique: true });
  await logsCol.createIndex({ userId: 1 });
  await logsCol.createIndex({ userId: 1, date: 1 }, { unique: true });
  dbReady = true;
  console.log('✅ Connected to MongoDB Atlas');
}

// Guard: return 503 if DB not connected yet
function dbRequired(req, res, next) {
  if (!dbReady) return res.status(503).json({ error: 'מסד הנתונים אינו זמין. בדקי שה-MONGODB_URI מוגדר ב-Render ושה-Atlas מאפשר חיבור מכל כתובת IP (0.0.0.0/0).' });
  next();
}

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
app.post('/api/auth/register', dbRequired, async (req, res) => {
  try {
    const { username, password, name } = req.body || {};
    if (!username || !password || !name)
      return res.status(400).json({ error: 'חסרים שדות' });
    if (username.length < 3)
      return res.status(400).json({ error: 'שם משתמש קצר מדי' });
    if (password.length < 4)
      return res.status(400).json({ error: 'סיסמה קצרה מדי' });

    const hash = bcrypt.hashSync(password, 10);
    const result = await usersCol.insertOne({
      username: username.toLowerCase(), password_hash: hash,
      name, profile: null, createdAt: Date.now()
    });
    const userId = result.insertedId.toString();
    const token = jwt.sign({ id: userId, username: username.toLowerCase(), name }, SECRET, { expiresIn: '30d' });
    res.json({ token, name, username: username.toLowerCase(), hasProfile: false });
  } catch (e) {
    if (e.code === 11000)
      return res.status(409).json({ error: 'שם המשתמש תפוס' });
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', dbRequired, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ error: 'חסרים שדות' });
    const user = await usersCol.findOne({ username: username.toLowerCase() });
    if (!user || !bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
    const token = jwt.sign({ id: user._id.toString(), username: user.username, name: user.name }, SECRET, { expiresIn: '30d' });
    res.json({ token, name: user.name, username: user.username, hasProfile: !!user.profile });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── User routes ────────────────────────────────────────────
app.get('/api/user', dbRequired, auth, async (req, res) => {
  try {
    const u = await usersCol.findOne({ _id: new ObjectId(req.user.id) });
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json({ id: u._id.toString(), username: u.username, name: u.name, profile: u.profile || null });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/user', dbRequired, auth, async (req, res) => {
  try {
    await usersCol.updateOne({ _id: new ObjectId(req.user.id) }, { $set: { profile: req.body } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Logs routes ────────────────────────────────────────────
app.get('/api/logs/week', dbRequired, auth, async (req, res) => {
  try {
    const result = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      const row = await logsCol.findOne({ userId: req.user.id, date });
      result[date] = row ? { foods: row.foods, water: row.water, workouts: row.workouts || [] } : { foods: [], water: 0, workouts: [] };
    }
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/logs/:date', dbRequired, auth, async (req, res) => {
  try {
    const row = await logsCol.findOne({ userId: req.user.id, date: req.params.date });
    res.json(row ? { foods: row.foods, water: row.water, workouts: row.workouts || [] } : { foods: [], water: 0, workouts: [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/logs/:date', dbRequired, auth, async (req, res) => {
  try {
    const { foods = [], water = 0, workouts = [] } = req.body || {};
    await logsCol.updateOne(
      { userId: req.user.id, date: req.params.date },
      { $set: { foods, water, workouts, updatedAt: Date.now() } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Food search (Open Food Facts proxy) ───────────────────
app.get('/api/food-search', auth, (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ products: [] });
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=12&cc=il&fields=product_name,product_name_he,brands,serving_size,nutriments,code`;
  https.get(url, { headers: { 'User-Agent': 'KaloriFodi/1.0 (educational)' } }, apiRes => {
    let raw = '';
    apiRes.on('data', d => raw += d);
    apiRes.on('end', () => {
      try { res.json(JSON.parse(raw)); }
      catch { res.json({ products: [] }); }
    });
  }).on('error', () => res.json({ products: [] }));
});

// ── Meal recommendations ───────────────────────────────────
app.post('/api/meal-recommendations', auth, async (req, res) => {
  try {
    const { mealType, targets, remaining, round = 0 } = req.body || {};
    if (!process.env.ANTHROPIC_API_KEY)
      return res.status(503).json({ error: 'מפתח AI לא מוגדר' });

    const mealNames = { breakfast: 'ארוחת בוקר', lunch: 'ארוחת צהריים', dinner: 'ארוחת ערב', snack: 'חטיף' };
    const goalDesc  = { lose: 'ירידה במשקל', gain: 'עלייה במשקל', maintain: 'שמירה על משקל' };
    const mealStyle = {
      breakfast: 'הצעי מאכלי בוקר קלילים ואופייניים - כמו פנקייקים, קורנפלקס/דגני בוקר עם חלב, מעדן/פודינג חלבון, ביצים, לחם עם ממרחים, יוגורט עם גרנולה. הימנעי ממנות צהריים/ערב כבדות (לא בשר/דגים/פסטה).',
      lunch:     'הצעי ארוחות צהריים מבוססות ומשביעות - כמו דגים, בשר/עוף, קינואה, אורז, סלטים גדולים עם חלבון. ארוחה "כבדה" יותר מבוקר.',
      dinner:    'הצעי גם אפשרויות קלות וגם כבדות לערב - למשל שקשוקה, פסטה, סלט עם חלבון, מרק עם לחם, או ביצים/טוסט - תני מגוון של קל לכבד.',
      snack:     'הצעי חטיפים קטנים ומהירים - כמו פרי, יוגורט, אגוזים, חופן במבה/פופקורן, פרוסת לחם עם ממרח, גבינה.',
    };
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `אתה דיאטן ישראלי מוסמך. הצע בדיוק 3 אפשרויות ל${mealNames[mealType] || 'ארוחה'} בריאה ומאוזנת.
מידע על המשתמש:
- קלוריות שנותרו להיום: ${remaining || targets?.calories || 500} קק״ל
- יעד חלבון יומי: ${targets?.protein || 50}ג׳
- מטרה: ${goalDesc[targets?.goal] || 'שמירה על משקל'}
- ${mealStyle[mealType] || mealStyle.lunch}
${round > 0 ? `- בקשה מספר ${round + 1}: הצעי אפשרויות שונות לחלוטין מהפעמים הקודמות (אותו סוג ארוחה, אבל מאכלים אחרים)` : ''}

החזר JSON בלבד (ללא טקסט נוסף):
{"items":[{"name":"שם בעברית","desc":"תיאור קצר של המנה","kcal":מספר,"icon":"אמוגי"}]}`
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

// ── Recipe calorie estimate ───────────────────────────────
app.post('/api/estimate-recipe-calories', auth, async (req, res) => {
  try {
    const { ingredients, mealName } = req.body || {};
    if (!ingredients || !ingredients.length) return res.status(400).json({ error: 'חסרים מצרכים' });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'מפתח AI לא מוגדר' });
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const list = ingredients.map(i => `${i.msr} ${i.ing}`.trim()).join('\n');
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `אתה דיאטן מוסמך. העריכי קלוריות למתכון:\nמנה: ${mealName}\nמצרכים:\n${list}\n\nהחזר JSON בלבד:\n{"totalKcal":מספר,"servings":מספר,"perServing":מספר,"note":"משפט אחד בעברית"}`
      }]
    });
    let s = (msg.content[0].text || '').trim();
    const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) s = fence[1].trim();
    const st = s.indexOf('{'), en = s.lastIndexOf('}');
    if (st >= 0 && en > st) s = s.slice(st, en + 1);
    res.json(JSON.parse(s));
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
    const totalUsers  = await usersCol.countDocuments({});
    const totalLogs   = await logsCol.countDocuments({});
    const todayLogs   = await logsCol.find({ date: today }).toArray();
    res.json({ totalUsers, totalLogs, activeToday: new Set(todayLogs.map(l => l.userId)).size });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const all = await usersCol.find({}).sort({ createdAt: -1 }).toArray();
    res.json(all.map(u => ({ id: u._id.toString(), username: u.username, name: u.name, profile: u.profile, created_at: Math.floor(u.createdAt / 1000) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/users/:id/logs', adminAuth, async (req, res) => {
  try {
    const userLogs = await logsCol.find({ userId: req.params.id }).sort({ date: -1 }).limit(30).toArray();
    res.json(userLogs.map(l => ({ date: l.date, foods: l.foods, water: l.water })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
  try {
    await logsCol.deleteMany({ userId: req.params.id });
    await usersCol.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/admin', (req, res) =>
  res.sendFile(path.join(__dirname, 'admin', 'index.html'))
);

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// ── Start ──────────────────────────────────────────────────
// Start server immediately so Render health check passes even if DB is slow
app.listen(PORT, () => {
  console.log(`\n🥑 קלוריפודי  →  http://localhost:${PORT}`);
  console.log(`🔧 Admin       →  http://localhost:${PORT}/admin`);
  console.log(`   סיסמת Admin →  ${ADMIN_PASS}\n`);
});

// Connect to MongoDB after server is up
connectDB().catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.error('→ Go to MongoDB Atlas → Network Access → Add 0.0.0.0/0 to allow all IPs');
  console.error('→ Make sure MONGODB_URI is set correctly in Render environment variables');
});
