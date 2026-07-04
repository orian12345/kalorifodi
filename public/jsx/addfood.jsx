/* ============================================================
   קלוריפודי — Add food sheet (camera+AI / search / manual)
   ============================================================ */
function AddFood({ user, defaultMeal, onClose, onAdd }) {
  const g = (f, m) => G(user?.gender, f, m);
  const [tab, setTab] = React.useState('search');
  const [confirm, setConfirm] = React.useState(null);

  const tabs = [
    { id: 'search', label: 'חיפוש', icon: Icon.search },
    { id: 'manual', label: 'ידני', icon: Icon.edit },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(60,40,35,.35)', backdropFilter: 'blur(2px)' }} />
      <div style={{ marginTop: 'auto', position: 'relative', background: 'var(--bg)', borderRadius: '30px 30px 0 0', height: '92%', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,.2)' }}>
        {/* grabber + header */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 5, borderRadius: 5, background: 'var(--line)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 4px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 23, color: 'var(--ink)', margin: 0 }}>הוספת מאכל</h2>
          <button onClick={onClose} style={{ border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.close s={20} c="var(--ink-soft)" />
          </button>
        </div>

        {/* tab switch */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--card)', margin: '10px 20px 0', padding: 5, borderRadius: 16 }}>
          {tabs.map(tb => {
            const on = tab === tb.id;
            return (
              <button key={tb.id} onClick={() => setTab(tb.id)} style={{
                flex: 1, border: 'none', cursor: 'pointer', borderRadius: 12, padding: '10px 0',
                background: on ? 'var(--green)' : 'transparent', color: on ? '#fff' : 'var(--ink-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .2s',
                fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: 600,
              }}>
                <tb.icon s={18} c={on ? '#fff' : 'var(--ink-soft)'} />{tb.label}
              </button>
            );
          })}
        </div>

        {/* body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px 28px' }}>
          {tab === 'search' && <SearchTab gender={user?.gender} onPick={setConfirm} />}
          {tab === 'manual' && <ManualTab onPick={setConfirm} />}
        </div>
      </div>

      {confirm && (
        <FoodConfirm base={confirm} defaultMeal={defaultMeal} onCancel={() => setConfirm(null)} onConfirm={(item) => { onAdd(item); setConfirm(null); onClose(); }} />
      )}
    </div>
  );
}

// ---------- SEARCH ----------
function SearchTab({ gender, onPick }) {
  const g = (f, m) => G(gender, f, m);
  const [q, setQ] = React.useState('');
  const [online, setOnline]   = React.useState([]);
  const [moh,    setMoh]      = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const localList = q.trim() ? KP.FOODS.filter(f => f.name.includes(q.trim())) : [];

  React.useEffect(() => {
    const query = q.trim();
    if (query.length < 2) { setOnline([]); setMoh([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const headers = { 'Authorization': 'Bearer ' + API.token() };
      const localNames = new Set(KP.FOODS.filter(f => f.name.includes(query)).map(f => f.name));

      const [offResp, mohResp] = await Promise.allSettled([
        fetch(`/api/food-search?q=${encodeURIComponent(query)}`, { headers }),
        fetch(`/api/il-food-search?q=${encodeURIComponent(query)}`, { headers }),
      ]);

      // OpenFoodFacts
      try {
        const data = offResp.status === 'fulfilled' ? await offResp.value.json() : {};
        const parsed = (data.products || [])
          .filter(p => {
            const n = p.nutriments || {};
            return (n['energy-kcal_100g'] || n['energy-kcal']) && (p.product_name_he || p.product_name);
          })
          .map(p => {
            const name  = (p.product_name_he || p.product_name || '').trim();
            const n     = p.nutriments || {};
            const k100  = Math.round(+(n['energy-kcal_100g'] || n['energy-kcal'] || 0));
            const p100  = Math.round(+(n['proteins_100g'] || 0));
            const c100  = Math.round(+(n['carbohydrates_100g'] || 0));
            const f100  = Math.round(+(n['fat_100g'] || 0));
            const sStr  = (p.serving_size || '100g');
            const gm    = sStr.match(/(\d+(?:\.\d+)?)\s*g/i);
            const grams = gm ? Math.round(+gm[1]) : 100;
            const ratio = grams / 100;
            return {
              id: 'off_' + (p.code || Math.random()), name, icon: '🌐',
              serving: `${grams}ג׳`,
              kcal: Math.round(k100 * ratio), p: Math.round(p100 * ratio),
              c: Math.round(c100 * ratio),    f: Math.round(f100 * ratio),
              grams, brand: (p.brands || '').split(',')[0].trim(),
            };
          })
          .filter(p => p.kcal > 0 && p.name.length > 1 && !localNames.has(p.name));
        setOnline(parsed);
      } catch { setOnline([]); }

      // Israeli MOH database
      try {
        const data = mohResp.status === 'fulfilled' ? await mohResp.value.json() : {};
        const allNames = new Set([...localNames]);
        const mohParsed = (data.records || [])
          .filter(r => r.kcal100 > 0 && r.name && r.name.length > 1 && !allNames.has(r.name))
          .map(r => ({
            id: 'moh_' + Math.random(), name: r.name, icon: '🇮🇱',
            serving: '100ג׳', kcal: r.kcal100, p: r.p100, c: r.c100, f: r.f100, grams: 100,
          }));
        setMoh(mohParsed);
      } catch { setMoh([]); }

      setLoading(false);
    }, 650);
    return () => clearTimeout(t);
  }, [q]);

  const hasQuery = q.trim().length > 0;

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{ position: 'absolute', insetInlineStart: 16, top: '50%', transform: 'translateY(-50%)' }}>
          <Icon.search s={20} c="var(--ink-soft)" />
        </span>
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="חיפוש מאכל…"
          style={{ width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--card)', borderRadius: 16, padding: '15px 48px', fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none' }} />
        {loading && (
          <span className="kp-pulse" style={{ position: 'absolute', insetInlineEnd: 16, top: '50%', transform: 'translateY(-50%)' }}>
            <Icon.spark s={16} c="var(--green)" />
          </span>
        )}
      </div>

      {!hasQuery && (
        <div style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '40px 0 20px', fontSize: 14 }}>
          🔍 {g('הקלידי', 'הקלד')} שם מאכל לחיפוש
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* ── תוצאות מקומיות ── */}
        {localList.map(f => (
          <button key={f.id} onClick={() => onPick(f)} style={searchRow}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>{f.icon}</div>
            <div style={{ flex: 1, textAlign: 'start' }}>
              <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--ink)' }}>{f.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{f.serving} · {f.kcal} קק״ל</div>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.plus s={18} c="var(--green-deep)" /></div>
          </button>
        ))}

        {/* ── תוצאות מ-Open Food Facts ── */}
        {online.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, whiteSpace: 'nowrap' }}>🌐 נתונים אמיתיים · Open Food Facts</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            {online.map(f => (
              <button key={f.id} onClick={() => onPick(f)} style={searchRow}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌐</div>
                <div style={{ flex: 1, textAlign: 'start' }}>
                  <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--ink)' }}>{f.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                    {f.brand ? f.brand + ' · ' : ''}{f.serving} · {f.kcal} קק״ל
                  </div>
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.plus s={18} c="var(--green-deep)" /></div>
              </button>
            ))}
          </>
        )}

        {/* ── תוצאות ממאגר משרד הבריאות ── */}
        {moh.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, whiteSpace: 'nowrap' }}>🇮🇱 מאגר משרד הבריאות · 4,600+ מאכלים</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            {moh.map(f => (
              <button key={f.id} onClick={() => onPick(f)} style={searchRow}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--water-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🇮🇱</div>
                <div style={{ flex: 1, textAlign: 'start' }}>
                  <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--ink)' }}>{f.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{f.serving} · {f.kcal} קק״ל</div>
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--water-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.plus s={18} c="var(--water)" /></div>
              </button>
            ))}
          </>
        )}

        {/* ── מצב ריק ── */}
        {hasQuery && !loading && localList.length === 0 && online.length === 0 && moh.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '30px 0', fontSize: 14 }}>
            לא נמצא מאכל — {g('נסי', 'נסה')} להוסיף ידנית
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- MANUAL ----------
function ManualTab({ onPick }) {
  const [f, setF] = React.useState({ name: '', grams: '100', kcal: '', p: '', c: '', f: '' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const ok = f.name.trim() && f.kcal !== '';
  const g = +f.grams || 100;
  const kcal100 = +f.kcal || 0;
  const totalKcal = Math.round(kcal100 * g / 100);
  const num = (label, k, unit) => (
    <div style={{ flex: 1 }}>
      <label style={manualLbl}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type="number" inputMode="numeric" value={f[k]} onChange={e => set(k, e.target.value)} placeholder="0" style={manualInput} />
        <span style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-soft)' }}>{unit}</span>
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={manualLbl}>שם המאכל</label>
        <input autoFocus value={f.name} onChange={e => set('name', e.target.value)} placeholder="למשל: סלט יווני ביתי" style={manualInput} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={manualLbl}>קלוריות ל-100 גרם</label>
          <div style={{ position: 'relative' }}>
            <input type="number" inputMode="numeric" value={f.kcal} onChange={e => set('kcal', e.target.value)} placeholder="0" style={manualInput} />
            <span style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-soft)' }}>קק״ל</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={manualLbl}>גרמים שאכלת</label>
          <div style={{ position: 'relative' }}>
            <input type="number" inputMode="numeric" value={f.grams} onChange={e => set('grams', e.target.value)} placeholder="100" style={manualInput} />
            <span style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-soft)' }}>ג׳</span>
          </div>
        </div>
      </div>
      {ok && (
        <div style={{ background: 'var(--green-soft)', borderRadius: 14, padding: '10px 14px', textAlign: 'center', color: 'var(--green-deep)', fontSize: 15, fontWeight: 600 }}>
          סה״כ: {totalKcal} קק״ל
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        {num('חלבון ל-100ג׳', 'p', 'ג׳')}
        {num('פחמימות ל-100ג׳', 'c', 'ג׳')}
        {num('שומן ל-100ג׳', 'f', 'ג׳')}
      </div>
      <Btn disabled={!ok} onClick={() => onPick({
        name: f.name.trim(), icon: '🍽️',
        serving: g + 'ג׳',
        kcal: Math.round(kcal100 * g / 100),
        p: Math.round((+f.p || 0) * g / 100),
        c: Math.round((+f.c || 0) * g / 100),
        f: Math.round((+f.f || 0) * g / 100),
        grams: g,
      })}>המשך</Btn>
    </div>
  );
}

const searchRow = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none', background: 'var(--card)', borderRadius: 16, padding: '10px 12px', cursor: 'pointer' };
const manualLbl = { display: 'block', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500, marginBottom: 6, marginInlineStart: 2 };
const manualInput = { width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--card)', borderRadius: 14, padding: '14px 16px', fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none' };
const stepBtn = { border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const unitToggleBtn = (on, full = true) => ({
  flex: full ? 1 : '0 0 auto', border: 'none', cursor: 'pointer', borderRadius: 14,
  padding: full ? '10px 0' : '10px 16px',
  background: on ? 'var(--green)' : 'var(--card)', color: on ? '#fff' : 'var(--ink-soft)',
  fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all .2s',
});

function FoodConfirm({ base, defaultMeal, onCancel, onConfirm }) {
  const servingGrams = base.grams || null;
  const servingLabel = (base.serving || '').trim();
  const hasUnitOption = !!servingGrams && !/ג[׳']?$/.test(servingLabel);
  const altUnits = servingGrams ? (base.units || []).filter(u => u.grams && u.label) : [];
  const multiUnit = altUnits.length > 0;
  const showUnitRow = hasUnitOption || multiUnit;

  const [unit, setUnit] = React.useState(servingGrams ? 'grams' : 'serving');
  const [grams, setGrams] = React.useState(servingGrams || 100);
  const [qty, setQty] = React.useState(1);
  const [meal, setMeal] = React.useState(defaultMeal || 'breakfast');

  const altUnit = altUnits.find(u => u.label === unit);
  const unitLabel = unit === 'grams' ? 'ג׳' : unit === 'serving' ? (servingLabel || 'יחידות') : unit;
  const gramsPerUnit = unit === 'serving' ? servingGrams : (altUnit ? altUnit.grams : servingGrams);
  const gramsNum = parseFloat(grams) || 0;
  const ratio = unit === 'grams'
    ? (servingGrams ? gramsNum / servingGrams : gramsNum / 100)
    : (servingGrams ? qty * (gramsPerUnit / servingGrams) : qty);
  const k  = Math.round(base.kcal * ratio);
  const kp = Math.round(base.p * ratio);
  const kc = Math.round(base.c * ratio);
  const kf = Math.round(base.f * ratio);

  const stepQty = (d) => setQty(q => Math.max(0.5, Math.round((q + d) * 2) / 2));

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 120, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(60,40,35,.4)' }} />
      <div style={{ marginTop: 'auto', position: 'relative', background: 'var(--bg)', borderRadius: '28px 28px 0 0', padding: '22px 22px 38px', boxShadow: '0 -10px 40px rgba(0,0,0,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{base.icon || '🍽️'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{base.name}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>{base.serving}{servingGrams ? ` · מנה ${servingGrams}ג׳` : ''}</div>
          </div>
        </div>

        {showUnitRow && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: multiUnit ? 'wrap' : 'nowrap' }}>
            <button onClick={() => setUnit('grams')} style={unitToggleBtn(unit === 'grams', !multiUnit)}>גרמים</button>
            {hasUnitOption && (
              <button onClick={() => setUnit('serving')} style={unitToggleBtn(unit === 'serving', !multiUnit)}>{servingLabel || 'יחידות'}</button>
            )}
            {altUnits.map(u => (
              <button key={u.label} onClick={() => setUnit(u.label)} style={unitToggleBtn(unit === u.label, !multiUnit)}>{u.label}</button>
            ))}
          </div>
        )}

        {unit === 'grams' && servingGrams ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', borderRadius: 18, padding: '12px 16px', marginBottom: 14 }}>
            <span style={{ fontSize: 15.5, color: 'var(--ink)', fontWeight: 500 }}>כמות בגרמים</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" inputMode="decimal" step="0.5"
                value={grams}
                onChange={e => setGrams(e.target.value)}
                style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', width: 80, textAlign: 'center', border: 'none', background: 'var(--bg)', borderRadius: 10, padding: '4px 8px', outline: 'none' }}
              />
              <span style={{ fontSize: 16, color: 'var(--ink-soft)' }}>ג׳</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--card)', borderRadius: 18, padding: '12px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15.5, color: 'var(--ink)', fontWeight: 500 }}>{servingGrams ? `כמות ${unitLabel}` : 'כמות מנות'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => stepQty(-0.5)} style={stepBtn}><Icon.minus s={20} c="var(--green-deep)" /></button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', minWidth: 36, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => stepQty(0.5)} style={stepBtn}><Icon.plus s={20} c="var(--green-deep)" /></button>
              </div>
            </div>
            {servingGrams && (
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', textAlign: 'end' }}>≈ {Math.round(qty * gramsPerUnit)}ג׳</div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 7, marginBottom: 16 }}>
          {KP.MEALS.map(m => {
            const on = meal === m.id;
            return (
              <button key={m.id} onClick={() => setMeal(m.id)} style={{
                flex: 1, border: 'none', cursor: 'pointer', borderRadius: 14, padding: '10px 0',
                background: on ? 'var(--green)' : 'var(--card)', color: on ? '#fff' : 'var(--ink-soft)',
                fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all .2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}>
                <span style={{ fontSize: 17 }}>{m.icon}</span>{m.label.replace('ארוחת ', '')}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[['קלוריות', k, 'var(--green)'], ['חלבון', kp + 'ג׳', 'var(--pink)'], ['פחמ׳', kc + 'ג׳', 'var(--carb)'], ['שומן', kf + 'ג׳', 'var(--fat)']].map(([l, v, c]) => (
            <div key={l} style={{ flex: 1, background: 'var(--card)', borderRadius: 14, padding: '10px 4px', textAlign: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: 3, background: c, margin: '0 auto 5px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{l}</div>
            </div>
          ))}
        </div>

        <Btn onClick={() => onConfirm({
          name: base.name, icon: base.icon || '🍽️', serving: base.serving,
          kcal: base.kcal, p: base.p, c: base.c, f: base.f, qty: ratio,
          unitQty: unit === 'grams' ? gramsNum : qty, unitLabel,
          meal,
        })}>הוספה ליומן</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { AddFood });
