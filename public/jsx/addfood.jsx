/* ============================================================
   קלוריפודי — Add food sheet (camera+AI / search / manual)
   ============================================================ */
function AddFood({ defaultMeal, onClose, onAdd }) {
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
          {tab === 'search' && <SearchTab onPick={setConfirm} />}
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
function SearchTab({ onPick }) {
  const [q, setQ] = React.useState('');
  const list = KP.FOODS.filter(f => f.name.includes(q.trim()));
  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{ position: 'absolute', insetInlineStart: 16, top: '50%', transform: 'translateY(-50%)' }}><Icon.search s={20} c="var(--ink-soft)" /></span>
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="חיפוש מאכל…" style={{ width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--card)', borderRadius: 16, padding: '15px 48px', fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map(f => (
          <button key={f.id} onClick={() => onPick(f)} style={searchRow}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>{f.icon}</div>
            <div style={{ flex: 1, textAlign: 'start' }}>
              <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--ink)' }}>{f.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{f.serving} · {f.kcal} קק״ל</div>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.plus s={18} c="var(--green-deep)" /></div>
          </button>
        ))}
        {list.length === 0 && <div style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '30px 0', fontSize: 14 }}>לא נמצא מאכל — נסי להוסיף ידנית</div>}
      </div>
    </div>
  );
}

// ---------- MANUAL ----------
function ManualTab({ onPick }) {
  const [f, setF] = React.useState({ name: '', serving: 'מנה', kcal: '', p: '', c: '', f: '' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const ok = f.name.trim() && f.kcal !== '';
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
      <div>
        <label style={manualLbl}>גודל מנה</label>
        <input value={f.serving} onChange={e => set('serving', e.target.value)} placeholder="מנה / 100ג / כוס" style={manualInput} />
      </div>
      <div>
        <label style={manualLbl}>קלוריות</label>
        <div style={{ position: 'relative' }}>
          <input type="number" inputMode="numeric" value={f.kcal} onChange={e => set('kcal', e.target.value)} placeholder="0" style={manualInput} />
          <span style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-soft)' }}>קק״ל</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {num('חלבון', 'p', 'ג׳')}
        {num('פחמימות', 'c', 'ג׳')}
        {num('שומן', 'f', 'ג׳')}
      </div>
      <Btn disabled={!ok} onClick={() => onPick({ name: f.name.trim(), icon: '🍽️', serving: f.serving || 'מנה', kcal: +f.kcal || 0, p: +f.p || 0, c: +f.c || 0, f: +f.f || 0 })}>המשך</Btn>
    </div>
  );
}

const searchRow = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none', background: 'var(--card)', borderRadius: 16, padding: '10px 12px', cursor: 'pointer' };
const manualLbl = { display: 'block', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500, marginBottom: 6, marginInlineStart: 2 };
const manualInput = { width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--card)', borderRadius: 14, padding: '14px 16px', fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none' };

Object.assign(window, { AddFood });
