/* ============================================================
   קלוריפודי — core logic: nutrition math, food DB, persistence
   Plain JS, attaches everything to window.KP
   ============================================================ */
(function () {
  const TODAY = () => new Date().toISOString().slice(0, 10);

  // ---- nutrition targets (Mifflin–St Jeor) ----
  function calcTargets(p) {
    const w = +p.weight, h = +p.height, a = +p.age;
    let bmr = 10 * w + 6.25 * h - 5 * a + (p.gender === 'female' ? -161 : 5);
    const factor = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 }[p.activity] || 1.375;
    let tdee = bmr * factor;
    if (p.goal === 'lose') tdee -= 500;
    else if (p.goal === 'gain') tdee += 350;
    const calories = Math.max(1200, Math.round(tdee / 10) * 10);
    const proteinPerKg = p.goal === 'lose' ? 2.0 : p.goal === 'gain' ? 1.9 : 1.6;
    const protein = Math.round(w * proteinPerKg);
    const fat = Math.round((calories * 0.27) / 9);
    const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
    const water = Math.round((w * 33) / 50) * 50; // ml, round to 50
    return { calories, protein, carbs, fat, water, bmr: Math.round(bmr), tdee: Math.round(tdee) };
  }

  const ACTIVITY = [
    { id: 'sedentary', label: 'יושבני', desc: 'רוב היום בישיבה, מעט תנועה' },
    { id: 'light', label: 'קל', desc: 'אימון קל 1–3 פעמים בשבוע' },
    { id: 'moderate', label: 'בינוני', desc: 'אימון 3–5 פעמים בשבוע' },
    { id: 'active', label: 'פעיל', desc: 'אימון 6–7 פעמים בשבוע' },
    { id: 'athlete', label: 'ספורטיבי מאוד', desc: 'אימונים אינטנסיביים / עבודה פיזית' },
  ];
  const GOALS = [
    { id: 'lose', label: 'ירידה במשקל', desc: 'גירעון קלורי מתון', emoji: '🌿' },
    { id: 'maintain', label: 'שמירה על משקל', desc: 'איזון קלורי', emoji: '⚖️' },
    { id: 'gain', label: 'עלייה במסת שריר', desc: 'עודף קלורי מתון', emoji: '💪' },
  ];

  // ---- food database (per serving) ----
  // p=protein c=carbs f=fat (grams), kcal per the given serving
  const FOODS = [
    { id: 'egg', name: 'ביצה קשה', icon: '🥚', serving: 'יחידה', kcal: 78, p: 6, c: 1, f: 5 },
    { id: 'omelet', name: 'חביתה (2 ביצים)', icon: '🍳', serving: 'מנה', kcal: 180, p: 12, c: 2, f: 14 },
    { id: 'bread', name: 'פרוסת לחם מלא', icon: '🍞', serving: 'פרוסה', kcal: 80, p: 4, c: 14, f: 1 },
    { id: 'pita', name: 'פיתה', icon: '🫓', serving: 'יחידה', kcal: 165, p: 5, c: 33, f: 1 },
    { id: 'cottage', name: 'קוטג׳ 5%', icon: '🧀', serving: 'גביע (250ג)', kcal: 230, p: 28, c: 9, f: 12 },
    { id: 'yogurt', name: 'יוגורט יווני 0%', icon: '🥛', serving: 'גביע (150ג)', kcal: 90, p: 15, c: 6, f: 0 },
    { id: 'milk', name: 'חלב 3%', icon: '🥛', serving: 'כוס', kcal: 150, p: 8, c: 12, f: 8 },
    { id: 'cheese', name: 'גבינה צהובה', icon: '🧀', serving: 'פרוסה', kcal: 80, p: 6, c: 1, f: 6 },
    { id: 'chicken', name: 'חזה עוף צלוי', icon: '🍗', serving: '150ג', kcal: 248, p: 46, c: 0, f: 5 },
    { id: 'beef', name: 'בשר בקר רזה', icon: '🥩', serving: '150ג', kcal: 290, p: 39, c: 0, f: 14 },
    { id: 'salmon', name: 'סלמון אפוי', icon: '🐟', serving: '150ג', kcal: 280, p: 34, c: 0, f: 16 },
    { id: 'tuna', name: 'טונה במים', icon: '🐟', serving: 'קופסה (140ג)', kcal: 130, p: 29, c: 0, f: 1 },
    { id: 'rice', name: 'אורז לבן מבושל', icon: '🍚', serving: 'כוס (160ג)', kcal: 205, p: 4, c: 45, f: 0 },
    { id: 'pasta', name: 'פסטה מבושלת', icon: '🍝', serving: 'כוס (140ג)', kcal: 220, p: 8, c: 43, f: 1 },
    { id: 'potato', name: 'תפוח אדמה אפוי', icon: '🥔', serving: 'בינוני', kcal: 160, p: 4, c: 37, f: 0 },
    { id: 'sweetpotato', name: 'בטטה אפויה', icon: '🍠', serving: 'בינונית', kcal: 180, p: 4, c: 41, f: 0 },
    { id: 'quinoa', name: 'קינואה מבושלת', icon: '🌾', serving: 'כוס', kcal: 220, p: 8, c: 39, f: 4 },
    { id: 'oats', name: 'שיבולת שועל', icon: '🥣', serving: '50ג (יבש)', kcal: 190, p: 7, c: 33, f: 3 },
    { id: 'avocado', name: 'אבוקדו', icon: '🥑', serving: 'חצי', kcal: 160, p: 2, c: 9, f: 15 },
    { id: 'banana', name: 'בננה', icon: '🍌', serving: 'בינונית', kcal: 105, p: 1, c: 27, f: 0 },
    { id: 'apple', name: 'תפוח', icon: '🍎', serving: 'בינוני', kcal: 95, p: 0, c: 25, f: 0 },
    { id: 'orange', name: 'תפוז', icon: '🍊', serving: 'בינוני', kcal: 62, p: 1, c: 15, f: 0 },
    { id: 'berries', name: 'פירות יער', icon: '🫐', serving: 'כוס', kcal: 70, p: 1, c: 17, f: 0 },
    { id: 'salad', name: 'סלט ירקות', icon: '🥗', serving: 'קערה', kcal: 90, p: 3, c: 12, f: 4 },
    { id: 'tomato', name: 'עגבנייה', icon: '🍅', serving: 'בינונית', kcal: 22, p: 1, c: 5, f: 0 },
    { id: 'cucumber', name: 'מלפפון', icon: '🥒', serving: 'בינוני', kcal: 16, p: 1, c: 4, f: 0 },
    { id: 'broccoli', name: 'ברוקולי מאודה', icon: '🥦', serving: 'כוס', kcal: 55, p: 4, c: 11, f: 1 },
    { id: 'almonds', name: 'שקדים', icon: '🌰', serving: 'חופן (28ג)', kcal: 164, p: 6, c: 6, f: 14 },
    { id: 'peanutbutter', name: 'חמאת בוטנים', icon: '🥜', serving: 'כף', kcal: 95, p: 4, c: 3, f: 8 },
    { id: 'hummus', name: 'חומוס', icon: '🫛', serving: '100ג', kcal: 170, p: 8, c: 14, f: 9 },
    { id: 'lentils', name: 'עדשים מבושלות', icon: '🍲', serving: 'כוס', kcal: 230, p: 18, c: 40, f: 1 },
    { id: 'tofu', name: 'טופו', icon: '🧊', serving: '100ג', kcal: 144, p: 16, c: 3, f: 9 },
    { id: 'olive_oil', name: 'שמן זית', icon: '🫒', serving: 'כף', kcal: 120, p: 0, c: 0, f: 14 },
    { id: 'coffee', name: 'קפה הפוך', icon: '☕', serving: 'כוס', kcal: 90, p: 5, c: 8, f: 4 },
    { id: 'chocolate', name: 'שוקולד מריר', icon: '🍫', serving: '2 קוביות', kcal: 110, p: 1, c: 9, f: 8 },
    { id: 'icecream', name: 'גלידה', icon: '🍨', serving: 'כדור', kcal: 140, p: 2, c: 17, f: 7 },
    { id: 'pizza', name: 'פיצה', icon: '🍕', serving: 'משולש', kcal: 285, p: 12, c: 36, f: 10 },
    { id: 'burger', name: 'המבורגר', icon: '🍔', serving: 'יחידה', kcal: 350, p: 20, c: 33, f: 17 },
    { id: 'fries', name: 'צ׳יפס', icon: '🍟', serving: 'מנה (100ג)', kcal: 312, p: 4, c: 41, f: 15 },
    { id: 'shawarma', name: 'שווארמה בלאפה', icon: '🌯', serving: 'מנה', kcal: 620, p: 35, c: 55, f: 28 },
    { id: 'sushi', name: 'סושי', icon: '🍣', serving: '6 חתיכות', kcal: 230, p: 9, c: 38, f: 4 },
    { id: 'protein_shake', name: 'שייק חלבון', icon: '🥤', serving: 'מנה', kcal: 130, p: 25, c: 5, f: 1 },
  ];

  const MEALS = [
    { id: 'breakfast', label: 'ארוחת בוקר', icon: '🌅' },
    { id: 'lunch', label: 'ארוחת צהריים', icon: '☀️' },
    { id: 'dinner', label: 'ארוחת ערב', icon: '🌙' },
    { id: 'snack', label: 'חטיף', icon: '🍪' },
  ];

  // ---- persistence ----
  const UKEY = 'kp_user_v1';
  const LKEY = 'kp_logs_v1';

  function loadUser() {
    try { return JSON.parse(localStorage.getItem(UKEY)); } catch { return null; }
  }
  function saveUser(u) { localStorage.setItem(UKEY, JSON.stringify(u)); }
  function clearAll() { localStorage.removeItem(UKEY); localStorage.removeItem(LKEY); }

  function loadLogs() {
    let logs = {};
    try { logs = JSON.parse(localStorage.getItem(LKEY)) || {}; } catch { logs = {}; }
    // keep only last 7 days
    const keepFrom = new Date(); keepFrom.setDate(keepFrom.getDate() - 6);
    const minKey = keepFrom.toISOString().slice(0, 10);
    Object.keys(logs).forEach(k => { if (k < minKey) delete logs[k]; });
    return logs;
  }
  function saveLogs(logs) { localStorage.setItem(LKEY, JSON.stringify(logs)); }

  function emptyDay() { return { foods: [], water: 0 }; }

  function dayTotals(day) {
    const t = { kcal: 0, p: 0, c: 0, f: 0 };
    (day?.foods || []).forEach(it => {
      t.kcal += it.kcal * it.qty; t.p += it.p * it.qty; t.c += it.c * it.qty; t.f += it.f * it.qty;
    });
    return { kcal: Math.round(t.kcal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) };
  }

  // last 7 day keys, oldest→newest
  function weekKeys() {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
  }
  function dayName(key) {
    const names = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
    const d = new Date(key + 'T00:00:00');
    return names[d.getDay()];
  }

  window.KP = {
    TODAY, calcTargets, ACTIVITY, GOALS, FOODS, MEALS,
    loadUser, saveUser, clearAll, loadLogs, saveLogs, emptyDay,
    dayTotals, weekKeys, dayName,
  };
})();
