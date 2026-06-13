/* ============================================================
   קלוריפודי — Recipes browser (TheMealDB)
   ============================================================ */
const RECIPE_CATS = [
  { id: 'Chicken',    label: 'עוף',        emoji: '🍗' },
  { id: 'Beef',       label: 'בקר',         emoji: '🥩' },
  { id: 'Pasta',      label: 'פסטה',        emoji: '🍝' },
  { id: 'Vegetarian', label: 'צמחוני',      emoji: '🥗' },
  { id: 'Seafood',    label: 'פירות ים',    emoji: '🐟' },
  { id: 'Breakfast',  label: 'בוקר',        emoji: '🍳' },
  { id: 'Salad',      label: 'סלט',         emoji: '🥙' },
  { id: 'Side',       label: 'תוספות',      emoji: '🍚' },
  { id: 'Dessert',    label: 'קינוחים',     emoji: '🍰' },
  { id: 'Lamb',       label: 'כבש',         emoji: '🫕' },
  { id: 'Vegan',      label: 'טבעוני',      emoji: '🌱' },
  { id: 'Pork',       label: 'חזיר',        emoji: '🥓' },
];

function Recipes() {
  const [view, setView]       = React.useState('categories');
  const [category, setCategory] = React.useState(null);
  const [meals, setMeals]     = React.useState([]);
  const [detail, setDetail]   = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [searchQ, setSearchQ] = React.useState('');
  const [searchRes, setSearchRes] = React.useState(null);
  const [calories, setCalories]   = React.useState(null);
  const [calLoading, setCalLoading] = React.useState(false);

  const loadMeals = async (cat) => {
    setCategory(cat);
    setView('meals');
    setMeals([]);
    setLoading(true);
    try {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat.id}`);
      const data = await r.json();
      setMeals(data.meals || []);
    } catch { setMeals([]); }
    setLoading(false);
  };

  const loadDetail = async (meal) => {
    setDetail(null);
    setCalories(null);
    setView('detail');
    setLoading(true);
    try {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const data = await r.json();
      setDetail(data.meals?.[0] || null);
    } catch {}
    setLoading(false);
  };

  const estimateCalories = async () => {
    if (!detail) return;
    setCalLoading(true);
    try {
      const ings = getIngredients(detail);
      const r = await fetch('/api/estimate-recipe-calories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API.token() },
        body: JSON.stringify({ mealName: detail.strMeal, ingredients: ings }),
      });
      const data = await r.json();
      setCalories(data.error ? null : data);
    } catch {}
    setCalLoading(false);
  };

  const doSearch = async () => {
    if (!searchQ.trim()) return;
    setCategory(null);
    setView('meals');
    setMeals([]);
    setLoading(true);
    setSearchRes(null);
    try {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchQ.trim())}`);
      const data = await r.json();
      setSearchRes(data.meals || []);
    } catch { setSearchRes([]); }
    setLoading(false);
  };

  const getIngredients = (m) => {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ing = (m[`strIngredient${i}`] || '').trim();
      const msr = (m[`strMeasure${i}`] || '').trim();
      if (ing) list.push({ ing, msr });
    }
    return list;
  };

  // ─── detail view ───────────────────────────────────────────────
  if (view === 'detail') {
    const ings = detail ? getIngredients(detail) : [];
    return (
      <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingBottom: 112 }}>
        <div style={{ position: 'relative' }}>
          {detail?.strMealThumb
            ? <img src={detail.strMealThumb} alt={detail.strMeal} style={{ width: '100%', height: 230, objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: 230, background: 'var(--card)' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.0) 50%, rgba(0,0,0,.4))' }} />
          <button onClick={() => setView(category ? 'meals' : 'categories')}
            style={{ position: 'absolute', top: 50, right: 18, border: 'none', background: 'rgba(255,255,255,.88)', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
            <Icon.back s={20} c="var(--ink)" />
          </button>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.6)', backdropFilter: 'blur(4px)' }}>
              <span className="kp-pulse" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>טוען…</span>
            </div>
          )}
        </div>

        {detail && (
          <div style={{ padding: '20px 20px 0' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', margin: '0 0 4px', lineHeight: 1.3 }}>{detail.strMeal}</h2>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {detail.strArea && <span style={{ background: 'var(--card)', borderRadius: 8, padding: '3px 10px' }}>{detail.strArea}</span>}
              {detail.strCategory && <span style={{ background: 'var(--card)', borderRadius: 8, padding: '3px 10px' }}>{detail.strCategory}</span>}
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>מרכיבים ({ings.length})</div>
            <Card style={{ padding: '6px 16px', marginBottom: 18 }}>
              {ings.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < ings.length - 1 ? '1px solid var(--line)' : 'none', fontSize: 14 }}>
                  <span style={{ color: 'var(--ink)' }}>{it.ing}</span>
                  <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{it.msr}</span>
                </div>
              ))}
            </Card>

            {/* calorie estimate */}
            <div style={{ marginBottom: 18 }}>
              {!calories && !calLoading && (
                <button onClick={estimateCalories} style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'var(--green-soft)', borderRadius: 16, padding: '14px', fontSize: 14, fontWeight: 600, color: 'var(--green-deep)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Icon.spark s={16} c="var(--green-deep)" /> חשבי קלוריות למתכון 🤖
                </button>
              )}
              {calLoading && (
                <div className="kp-pulse" style={{ textAlign: 'center', padding: '14px', fontSize: 13.5, color: 'var(--ink-soft)' }}>Claude מחשבת קלוריות…</div>
              )}
              {calories && !calLoading && (
                <Card style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Icon.spark s={16} c="var(--carb)" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>הערכה קלורית</span>
                    <span style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginInlineStart: 'auto' }}>הערכת AI</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--green-deep)' }}>{calories.totalKcal}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>קק״ל סה״כ</div>
                    </div>
                    <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)' }}>{calories.perServing}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>קק״ל למנה ({calories.servings} מנות)</div>
                    </div>
                  </div>
                  {calories.note && <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--ink-soft)', textAlign: 'center', lineHeight: 1.4 }}>{calories.note}</div>}
                </Card>
              )}
            </div>

            {detail.strInstructions && (
              <>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>הוראות הכנה</div>
                <Card style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {detail.strInstructions.replace(/\r\n/g, '\n').trim()}
                  </p>
                </Card>
              </>
            )}

            {detail.strYoutube && (
              <a href={detail.strYoutube} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--pink-soft)', borderRadius: 16, padding: '14px', textDecoration: 'none', marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>▶️</span>
                <span style={{ color: 'var(--pink-deep)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)' }}>סרטון הכנה ביוטיוב</span>
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── meals grid ────────────────────────────────────────────────
  if (view === 'meals') {
    const list = searchRes !== null ? searchRes : meals;
    return (
      <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingBottom: 112 }}>
        <div style={{ padding: '58px 22px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => { setView('categories'); setSearchRes(null); setSearchQ(''); }}
            style={{ border: 'none', background: 'var(--card)', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <Icon.back s={20} c="var(--ink)" />
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', margin: 0 }}>
            {category ? `${category.emoji} ${category.label}` : `חיפוש: "${searchQ}"`}
          </h1>
        </div>
        <div style={{ padding: '16px 18px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)' }} className="kp-pulse">טוען מתכונים…</div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)', fontSize: 14 }}>לא נמצאו מתכונים</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {list.map(m => (
                <button key={m.idMeal} onClick={() => loadDetail(m)}
                  style={{ border: 'none', cursor: 'pointer', background: 'var(--card)', borderRadius: 20, padding: 0, overflow: 'hidden', boxShadow: '0 2px 14px -8px rgba(120,90,70,.25)', textAlign: 'start', display: 'flex', flexDirection: 'column' }}>
                  <img src={m.strMealThumb + '/preview'} alt={m.strMeal}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} loading="lazy" />
                  <div style={{ padding: '10px 12px 14px', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)', lineHeight: 1.3 }}>
                    {m.strMeal}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── categories view ────────────────────────────────────────────
  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingBottom: 112 }}>
      <div style={{ padding: '60px 22px 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, color: 'var(--ink)', margin: 0, letterSpacing: '-.3px' }}>מתכונים</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '4px 0 16px' }}>קלים ובריאים מהאינטרנט</p>

        {/* search */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', insetInlineStart: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <Icon.search s={18} c="var(--ink-soft)" />
            </span>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="חיפוש מתכון…"
              style={{ width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--card)', borderRadius: 14, padding: '13px 14px 13px 42px', fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none' }} />
          </div>
          <button onClick={doSearch}
            style={{ border: 'none', cursor: 'pointer', background: 'var(--green)', borderRadius: 14, padding: '0 18px', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
            חפשי
          </button>
        </div>
      </div>

      <div style={{ padding: '0 18px' }}>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500, margin: '0 2px 10px' }}>קטגוריות</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {RECIPE_CATS.map(cat => (
            <button key={cat.id} onClick={() => loadMeals(cat)}
              style={{ border: 'none', cursor: 'pointer', background: 'var(--card)', borderRadius: 20, padding: '22px 18px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, boxShadow: '0 2px 14px -8px rgba(120,90,70,.25)', textAlign: 'start' }}>
              <span style={{ fontSize: 32 }}>{cat.emoji}</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Recipes });
