/* ============================================================
   קלוריפודי — Side panel: recipe categories + nearby restaurants
   ============================================================ */

const CATEGORY_HE = {
  'Beef':'בקר','Chicken':'עוף','Seafood':'פירות ים','Lamb':'כבש',
  'Pork':'חזיר','Pasta':'פסטה','Dessert':'קינוח','Breakfast':'ארוחת בוקר',
  'Vegetarian':'צמחוני','Vegan':'טבעוני','Side':'תוספת','Starter':'מנה ראשונה',
  'Goat':'עז','Miscellaneous':'שונות',
};

const CATEGORY_KCAL = {
  'Beef':'450–650','Chicken':'350–520','Seafood':'250–420','Lamb':'430–620',
  'Pork':'380–560','Pasta':'420–620','Dessert':'280–480','Breakfast':'250–420',
  'Vegetarian':'200–380','Vegan':'180–350','Side':'100–280','Starter':'90–230',
  'Goat':'420–600','Miscellaneous':'300–500',
};

const CUISINE_HE = {
  'italian':'איטלקי','pizza':'פיצה','sushi':'סושי','japanese':'יפני',
  'chinese':'סיני','thai':'תאילנדי','indian':'הודי','mexican':'מקסיקני',
  'burger':'המבורגר','american':'אמריקאי','mediterranean':'ים תיכוני',
  'greek':'יווני','turkish':'טורקי','middle_eastern':'מזרח תיכוני',
  'french':'צרפתי','seafood':'פירות ים','coffee_shop':'בית קפה',
  'cafe':'בית קפה','bakery':'מאפייה','sandwich':'סנדוויצ׳','vegan':'טבעוני',
  'vegetarian':'צמחוני','steak':'סטייק','barbecue':'ברביקיו',
  'restaurant':'מסעדה','fast_food':'מזון מהיר','pub':'פאב','bar':'בר',
  'ice_cream':'גלידה','juice_bar':'בר מיצים','food_court':'פוד קורט',
};

const CUISINE_KCAL = {
  'italian':600,'pizza':700,'sushi':450,'japanese':450,'chinese':550,
  'thai':500,'indian':600,'mexican':650,'burger':750,'american':700,
  'mediterranean':500,'greek':520,'turkish':550,'middle_eastern':530,
  'french':620,'seafood':400,'coffee_shop':200,'cafe':200,'bakery':350,
  'sandwich':450,'vegan':380,'vegetarian':380,'steak':680,'barbecue':700,
  'restaurant':550,'fast_food':700,'pub':500,'bar':400,
  'ice_cream':300,'juice_bar':200,'food_court':600,
};

function cuisineLabel(raw) {
  if (!raw) return '';
  const first = raw.split(';')[0].split(',')[0].trim().toLowerCase();
  return CUISINE_HE[first] || first;
}

function cuisineKcal(raw) {
  if (!raw) return null;
  const first = raw.split(';')[0].split(',')[0].trim().toLowerCase();
  return CUISINE_KCAL[first] || null;
}

function distanceM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// ── Main side panel ─────────────────────────────────────────
function SidePanel({ user, onClose, onOpenRecipes }) {
  const [tab, setTab] = React.useState('recipes');
  const [categories, setCategories] = React.useState([]);
  const [mealType, setMealType] = React.useState(() => {
    const h = new Date().getHours();
    return h < 11 ? 'breakfast' : h < 17 ? 'lunch' : 'dinner';
  });
  const [restaurants, setRestaurants] = React.useState([]);
  const [userPos, setUserPos] = React.useState(null);
  const [locState, setLocState] = React.useState('idle'); // idle|locating|loading|done|error
  const [locErr, setLocErr] = React.useState('');

  React.useEffect(() => {
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const findRestaurants = () => {
    setLocErr(''); setLocState('locating'); setRestaurants([]);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });
        setLocState('loading');
        try {
          const r = await fetch(`/api/nearby-restaurants?lat=${lat}&lng=${lng}&meal=${mealType}`, {
            headers: { 'Authorization': 'Bearer ' + API.token() }
          });
          const data = await r.json();
          if (data.error) throw new Error(data.error);
          const sorted = (data.restaurants || [])
            .map(re => ({ ...re, dist: distanceM(lat, lng, re.lat, re.lng) }))
            .sort((a, b) => a.dist - b.dist);
          setRestaurants(sorted);
          setLocState('done');
        } catch (e) { setLocErr('לא הצלחנו למצוא מסעדות קרובות' + (e.message ? ': ' + e.message : '')); setLocState('error'); }
      },
      () => { setLocErr('לא ניתן לגשת למיקום. אפשרי גישה בהגדרות הדפדפן.'); setLocState('error'); }
    );
  };

  const mealTypes = [
    { id: 'breakfast', label: 'בוקר', icon: '🌅' },
    { id: 'lunch',     label: 'צהריים', icon: '☀️' },
    { id: 'dinner',    label: 'ערב', icon: '🌙' },
  ];

  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, backdropFilter: 'blur(2px)' }} />

      {/* drawer */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '88%', maxWidth: 400, background: 'var(--bg)', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 50px rgba(0,0,0,.25)' }}>

        {/* header */}
        <div style={{ padding: '52px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)' }}>תפריט</span>
          <button onClick={onClose} style={{ border: 'none', background: 'var(--track)', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.close s={18} c="var(--ink-soft)" />
          </button>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '12px 16px 0' }}>
          {[['recipes','🍽️ מתכונים'],['restaurants','🏪 מסעדות']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, border: 'none', cursor: 'pointer', borderRadius: 14, padding: '10px 0',
              background: tab === id ? 'var(--green)' : 'var(--card)',
              color: tab === id ? '#fff' : 'var(--ink-soft)',
              fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-body)',
            }}>{label}</button>
          ))}
        </div>

        {/* body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 32px' }}>

          {/* ── RECIPES TAB ── */}
          {tab === 'recipes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '0 0 4px 0' }}>לחצי על קטגוריה לפתיחת המתכונים</p>
              {categories.map(cat => {
                const he = CATEGORY_HE[cat.strCategory] || cat.strCategory;
                const kcal = CATEGORY_KCAL[cat.strCategory] || '300–500';
                return (
                  <button key={cat.idCategory} onClick={() => { onOpenRecipes(cat.strCategory); onClose(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none', background: 'var(--card)', borderRadius: 16, padding: '10px 14px', cursor: 'pointer', textAlign: 'start' }}>
                    <img src={cat.strCategoryThumb} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{he}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{cat.strCategory}</div>
                    </div>
                    <div style={{ background: 'var(--green-soft)', borderRadius: 10, padding: '4px 10px', textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-deep)' }}>{kcal}</div>
                      <div style={{ fontSize: 10, color: 'var(--green-deep)', opacity: 0.7 }}>קק״ל</div>
                    </div>
                  </button>
                );
              })}
              {categories.length === 0 && (
                <div className="kp-pulse" style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '40px 0', fontSize: 14 }}>טוען קטגוריות…</div>
              )}
            </div>
          )}

          {/* ── RESTAURANTS TAB ── */}
          {tab === 'restaurants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* meal type selector */}
              <div style={{ display: 'flex', gap: 7 }}>
                {mealTypes.map(m => (
                  <button key={m.id} onClick={() => { setMealType(m.id); setRestaurants([]); setLocState('idle'); }}
                    style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 12, padding: '9px 0',
                      background: mealType === m.id ? 'var(--green)' : 'var(--card)',
                      color: mealType === m.id ? '#fff' : 'var(--ink-soft)',
                      fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-body)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}>
                    <span style={{ fontSize: 16 }}>{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>

              {/* find button */}
              {(locState === 'idle' || locState === 'error') && (
                <button onClick={findRestaurants} style={{
                  border: 'none', cursor: 'pointer', background: 'var(--green)', borderRadius: 16,
                  padding: '14px', fontSize: 15, fontWeight: 600, color: '#fff',
                  fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 6px 18px -4px var(--green-shadow)',
                }}>
                  📍 {G(user?.gender, 'מצאי', 'מצא')} מסעדות קרובות אלי
                </button>
              )}

              {locErr && <div style={{ background: 'var(--pink-soft)', color: 'var(--pink-deep)', borderRadius: 12, padding: '10px 14px', fontSize: 13 }}>⚠️ {locErr}</div>}

              {(locState === 'locating' || locState === 'loading') && (
                <div className="kp-pulse" style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '30px 0', fontSize: 14 }}>
                  {locState === 'locating' ? '📍 מאתר מיקום…' : '🔍 מחפש מסעדות…'}
                </div>
              )}

              {locState === 'done' && restaurants.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '30px 0', fontSize: 14 }}>
                  לא נמצאו מסעדות קרובות באזור
                </div>
              )}

              {/* restaurant list */}
              {restaurants.map((re, i) => {
                const kcalVal = cuisineKcal(re.cuisine);
                const cuisLabel = cuisineLabel(re.cuisine);
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${re.lat},${re.lng}`;
                const woltUrl = `https://wolt.com/he/isr?q=${encodeURIComponent(re.name)}`;
                return (
                  <div key={i} style={{ background: 'var(--card)', borderRadius: 18, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        {mealType === 'breakfast' ? '☕' : '🍽️'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{re.name}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>
                          {cuisLabel && <span>{cuisLabel} · </span>}
                          <span>{re.dist < 1000 ? re.dist + 'מ׳' : (re.dist/1000).toFixed(1) + 'ק״מ'}</span>
                        </div>
                      </div>
                      {kcalVal && (
                        <div style={{ background: 'var(--green-soft)', borderRadius: 10, padding: '4px 10px', textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-deep)' }}>~{kcalVal}</div>
                          <div style={{ fontSize: 10, color: 'var(--green-deep)', opacity: 0.7 }}>קק״ל</div>
                        </div>
                      )}
                    </div>

                    {/* action buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        border: 'none', borderRadius: 12, padding: '9px 0', textDecoration: 'none',
                        background: 'var(--bg)', color: 'var(--ink)', fontSize: 13, fontWeight: 600,
                      }}>🗺️ ניווט</a>
                      <a href={woltUrl} target="_blank" rel="noopener noreferrer" style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        border: 'none', borderRadius: 12, padding: '9px 0', textDecoration: 'none',
                        background: '#009DE0', color: '#fff', fontSize: 13, fontWeight: 600,
                      }}>🛵 Wolt</a>
                      {re.website && (
                        <a href={re.website.startsWith('http') ? re.website : 'https://' + re.website}
                          target="_blank" rel="noopener noreferrer" style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                            border: 'none', borderRadius: 12, padding: '9px 0', textDecoration: 'none',
                            background: 'var(--green)', color: '#fff', fontSize: 13, fontWeight: 600,
                          }}>🌐 אתר</a>
                      )}
                    </div>
                  </div>
                );
              })}

              {locState === 'done' && restaurants.length > 0 && (
                <button onClick={findRestaurants} style={{
                  border: '1.5px dashed var(--line)', background: 'transparent', borderRadius: 14,
                  padding: '11px', fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>🔄 חפש שוב</button>
              )}

              <p style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center', margin: '4px 0 0' }}>
                * ערכי קלוריות הם הערכה לפי סוג מטבח. הנתונים מבוססים על OpenStreetMap.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { SidePanel });
