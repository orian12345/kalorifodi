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

      {/* plan */}
      <div style={{ padding: '20px 18px 0' }}>
        <PlanSection user={user} onUpdate={onUpdate} />
      </div>

      {/* targets */}
      <div style={{ padding: '16px 18px 0' }}>
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

function PlanSection({ user, onUpdate }) {
  const plan = user.plan || {};
  const hasPlan = !!plan.targetWeight && !!plan.targetDate;
  const [editing, setEditing] = React.useState(!hasPlan);
  const [tw, setTw] = React.useState(String(plan.targetWeight || Math.round(user.weight * 0.95)));
  const [td, setTd] = React.useState(plan.targetDate || '');

  const savePlan = () => {
    const targetWeight = parseFloat(tw) || user.weight;
    const today = new Date().toISOString().slice(0, 10);
    onUpdate({ ...user, plan: { targetWeight, targetDate: td, startWeight: plan.startWeight || user.weight, startDate: plan.startDate || today } });
    setEditing(false);
  };

  const startWeight = plan.startWeight || user.weight;
  const targetWeight = plan.targetWeight || user.weight;
  const targetDate = plan.targetDate ? new Date(plan.targetDate) : null;
  const today = new Date();
  const daysLeft = targetDate ? Math.max(0, Math.ceil((targetDate - today) / 86400000)) : 0;
  const weeksLeft = Math.ceil(daysLeft / 7);
  const startDate = plan.startDate ? new Date(plan.startDate) : today;
  const totalDays = targetDate ? Math.max(1, Math.ceil((targetDate - startDate) / 86400000)) : 1;
  const elapsed = Math.min(1, Math.max(0, (today - startDate) / (totalDays * 86400000)));
  const totalChange = startWeight - targetWeight;
  const weeklyChange = weeksLeft > 0 ? Math.abs(totalChange / weeksLeft).toFixed(1) : '0';
  const direction = totalChange > 0.1 ? 'ירידה' : totalChange < -0.1 ? 'עלייה' : 'שמירה';

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().slice(0, 10);

  if (editing || !hasPlan) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 4px 10px' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>התוכנית שלי</span>
        {hasPlan && <button onClick={() => setEditing(false)} style={{ border: 'none', background: 'transparent', color: 'var(--ink-soft)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>ביטול</button>}
      </div>
      <Card>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '0 0 16px', lineHeight: 1.5 }}>
          הגדרי יעד משקל ותאריך — ואנחנו נחשב את הצעדים הנחוצים להגיע לשם.
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 6, marginInlineStart: 2 }}>משקל יעד (ק״ג)</label>
            <div style={{ position: 'relative' }}>
              <input type="number" inputMode="decimal" value={tw} onChange={e => setTw(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--bg)', borderRadius: 14, padding: '14px 40px 14px 16px', fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--green-deep)', outline: 'none' }} />
              <span style={{ position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>ק״ג</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 6, marginInlineStart: 2 }}>תאריך יעד</label>
            <input type="date" value={td} onChange={e => setTd(e.target.value)} min={minDateStr}
              style={{ width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--bg)', borderRadius: 14, padding: '14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none' }} />
          </div>
        </div>
        <Btn onClick={savePlan} disabled={!tw || !td}>שמרי תוכנית</Btn>
      </Card>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 4px 10px' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>התוכנית שלי</span>
        <button onClick={() => setEditing(true)} style={{ border: 'none', background: 'transparent', color: 'var(--green-deep)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>שנה</button>
      </div>
      <Card style={{ marginBottom: 0 }}>
        {/* weights */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', textAlign: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)' }}>{startWeight}<span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>ק״ג</span></div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>התחלה</div>
          </div>
          <div style={{ fontSize: 20, color: 'var(--ink-soft)' }}>→</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--green-deep)' }}>{targetWeight}<span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>ק״ג</span></div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>יעד</div>
          </div>
        </div>

        {/* weight projection SVG */}
        <WeightChart startWeight={startWeight} targetWeight={targetWeight} elapsed={elapsed} daysLeft={daysLeft} />

        {/* progress bar */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink-soft)', marginBottom: 5 }}>
            <span>0%</span>
            <span>עברו {Math.round(elapsed * 100)}% מהתקופה</span>
            <span>100%</span>
          </div>
          <div style={{ background: 'var(--track)', borderRadius: 8, height: 8 }}>
            <div style={{ background: 'var(--green)', height: '100%', borderRadius: 8, width: Math.round(elapsed * 100) + '%', transition: 'width .5s' }} />
          </div>
        </div>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
          {[
            { v: weeksLeft, label: 'שבועות נותרו' },
            { v: weeklyChange + 'ק״ג', label: 'שינוי/שבוע' },
            { v: direction, label: 'כיוון' },
          ].map(({ v, label }) => (
            <div key={label} style={{ background: 'var(--bg)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--ink)' }}>{v}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WeightChart({ startWeight, targetWeight, elapsed, daysLeft }) {
  const W = 280, H = 90;
  const minW = Math.min(targetWeight, startWeight) - 1;
  const maxW = Math.max(targetWeight, startWeight) + 1;
  const toY = w => H - 20 - ((w - minW) / Math.max(maxW - minW, 0.1)) * (H - 32);
  const toX = t => 14 + t * (W - 28);

  const pts = [0, 0.25, 0.5, 0.75, 1].map(t => ({ x: toX(t), y: toY(startWeight - (startWeight - targetWeight) * t) }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${toX(1)} ${H} L ${toX(0)} ${H} Z`;

  const nowX = toX(Math.min(1, elapsed));
  const nowY = toY(startWeight - (startWeight - targetWeight) * Math.min(1, elapsed));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--green)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--green)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#planGrad)" />
      <path d={pathD} stroke="var(--green)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      {/* "you are here" dot */}
      <circle cx={nowX} cy={nowY} r="5" fill="var(--green)" />
      <circle cx={nowX} cy={nowY} r="9" fill="none" stroke="var(--green)" strokeWidth="1.5" opacity="0.35" />
      {/* labels */}
      <text x={toX(0)} y={toY(startWeight) - 8} textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontFamily="Rubik">{startWeight}</text>
      <text x={toX(1)} y={toY(targetWeight) - 8} textAnchor="middle" fontSize="10" fill="var(--green-deep)" fontFamily="Rubik">{targetWeight}</text>
    </svg>
  );
}

Object.assign(window, { Profile });
