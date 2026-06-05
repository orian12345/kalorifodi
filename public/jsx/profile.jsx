/* ============================================================
   קלוריפודי — Profile / settings
   ============================================================ */
function Profile({ user, onUpdate, onReset }) {
  const [edit, setEdit] = React.useState(false);
  const [p, setP] = React.useState(user);
  React.useEffect(() => setP(user), [user]);
  const set = (k, v) => setP(s => ({ ...s, [k]: v }));
  const t = user.targets;

  const save = () => {
    const targets = KP.calcTargets(p);
    onUpdate({ ...p, targets });
    setEdit(false);
  };

  const goalLabel = (KP.GOALS.find(g => g.id === user.goal) || {}).label;
  const actLabel = (KP.ACTIVITY.find(a => a.id === user.activity) || {}).label;

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingBottom: 112 }}>
      <div style={{ padding: '58px 22px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 78, height: 78, borderRadius: 26, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--green-deep)' }}>
          {user.name.trim().charAt(0) || '🙂'}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 25, color: 'var(--ink)', margin: '12px 0 0' }}>{user.name}</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '3px 0 0' }}>{goalLabel} · {actLabel}</p>
      </div>

      {/* targets */}
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 4px 10px' }}>היעדים היומיים</div>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 12px' }}>
            <TargetItem label="קלוריות" v={t.calories} u="קק״ל" c="var(--green)" />
            <TargetItem label="מים" v={(t.water / 1000).toFixed(1)} u="ליטר" c="var(--water)" />
            <TargetItem label="חלבון" v={t.protein} u="ג׳" c="var(--pink)" />
            <TargetItem label="פחמימות" v={t.carbs} u="ג׳" c="var(--carb)" />
            <TargetItem label="שומן" v={t.fat} u="ג׳" c="var(--fat)" />
            <TargetItem label="קצב מטבולי" v={t.bmr} u="קק״ל" c="var(--ink-soft)" />
          </div>
        </Card>
      </div>

      {/* details / edit */}
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 4px 10px' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>הנתונים שלי</span>
          {!edit && <button onClick={() => setEdit(true)} style={{ border: 'none', background: 'transparent', color: 'var(--green-deep)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>עריכה</button>}
        </div>

        {!edit ? (
          <Card style={{ padding: '6px 4px' }}>
            <Row label="גיל" value={`${user.age} שנים`} />
            <Row label="גובה" value={`${user.height} ס״מ`} />
            <Row label="משקל" value={`${user.weight} ק״ג`} />
            <Row label="רמת פעילות" value={actLabel} />
            <Row label="מטרה" value={goalLabel} last />
          </Card>
        ) : (
          <Card>
            <EditMetric label="גיל" k="age" min={14} max={90} unit="שנים" p={p} set={set} />
            <EditMetric label="גובה" k="height" min={130} max={210} unit="ס״מ" p={p} set={set} />
            <EditMetric label="משקל" k="weight" min={35} max={160} unit="ק״ג" p={p} set={set} />
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500, margin: '4px 2px 8px' }}>רמת פעילות</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
              {KP.ACTIVITY.map(a => <Chip key={a.id} on={p.activity === a.id} onClick={() => set('activity', a.id)}>{a.label}</Chip>)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500, margin: '0 2px 8px' }}>מטרה</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
              {KP.GOALS.map(g => <Chip key={g.id} on={p.goal === g.id} onClick={() => set('goal', g.id)}>{g.label}</Chip>)}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={() => { setP(user); setEdit(false); }} style={{ flex: 1 }}>ביטול</Btn>
              <Btn onClick={save} style={{ flex: 1 }}>שמירה</Btn>
            </div>
          </Card>
        )}
      </div>

      <div style={{ padding: '20px 18px 0' }}>
        <button onClick={onReset} style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--pink-deep)', fontSize: 14.5, padding: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>איפוס הנתונים והתחלה מחדש</button>
      </div>
    </div>
  );
}

function TargetItem({ label, v, u, c }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <div style={{ width: 8, height: 8, borderRadius: 3, background: c }} />
        <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)' }}>{v}<span style={{ fontSize: 12, color: 'var(--ink-soft)', marginInlineStart: 3 }}>{u}</span></div>
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 14px', borderBottom: last ? 'none' : '1px solid var(--line)' }}>
      <span style={{ fontSize: 15, color: 'var(--ink-soft)' }}>{label}</span>
      <span style={{ fontSize: 15.5, color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function EditMetric({ label, k, min, max, unit, p, set }) {
  const [val, setVal] = React.useState(String(p[k]));
  const commit = (str) => {
    const n = Math.min(max, Math.max(min, parseInt(str, 10) || min));
    set(k, n);
    setVal(String(n));
  };
  return (
    <div style={{ marginBottom: 14, background: 'var(--bg)', borderRadius: 16, padding: '12px 14px' }}>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500, marginBottom: 10 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <input
          type="number" inputMode="numeric"
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={e => commit(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box', border: 'none',
            background: 'var(--card)', borderRadius: 14,
            padding: '16px 60px 16px 20px',
            fontSize: 38, fontFamily: 'var(--font-display)',
            color: 'var(--green-deep)', outline: 'none',
          }}
        />
        <span style={{ position: 'absolute', insetInlineEnd: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--ink-soft)', fontWeight: 500 }}>{unit}</span>
      </div>
    </div>
  );
}

function Chip({ children, on, onClick }) {
  return (
    <button onClick={onClick} style={{
      border: 'none', cursor: 'pointer', borderRadius: 12, padding: '9px 14px',
      background: on ? 'var(--green)' : 'var(--bg)', color: on ? '#fff' : 'var(--ink)',
      fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all .2s',
    }}>{children}</button>
  );
}

Object.assign(window, { Profile });
