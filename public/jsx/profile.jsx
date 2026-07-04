/* ============================================================
   קלוריפודי — Profile / settings
   ============================================================ */
function Profile({ user, logs, onUpdate, onReset }) {
  const [edit, setEdit] = React.useState(false);
  const [p, setP]       = React.useState(user);
  React.useEffect(() => setP(user), [user]);
  const set = (k, v) => setP(s => ({ ...s, [k]: v }));
  const t = user.targets;

  const save = () => {
    const targets = KP.calcTargets(p);
    onUpdate({ ...p, targets });
    setEdit(false);
  };

  const goalLabel = (KP.GOALS.find(g => g.id === user.goal) || {}).label;
  const actLabel  = (KP.ACTIVITY.find(a => a.id === user.activity) || {}).label;

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingBottom: 112 }}>

      {/* ── header ── */}
      <div style={{ padding: '52px 22px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 78, height: 78, borderRadius: 26, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--green-deep)' }}>
          {user.name.trim().charAt(0) || '🙂'}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 25, color: 'var(--ink)', margin: '12px 0 0' }}>{user.name}</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '3px 0 0' }}>{goalLabel} · {actLabel}</p>
      </div>

      {/* ── weight widget (right below header) ── */}
      <div style={{ padding: '16px 18px 0' }}>
        <WeightWidget user={user} logs={logs} onUpdate={onUpdate} />
      </div>

      {/* ── daily targets ── */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 4px 10px' }}>היעדים היומיים</div>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 12px' }}>
            <TargetItem label="קלוריות"    v={t.calories}               u="קק״ל"  c="var(--green)" />
            <TargetItem label="מים"         v={(t.water/1000).toFixed(1)} u="ליטר"  c="var(--water)" />
            <TargetItem label="חלבון"       v={t.protein}                u="ג׳"    c="var(--pink)" />
            <TargetItem label="פחמימות"     v={t.carbs}                  u="ג׳"    c="var(--carb)" />
            <TargetItem label="שומן"        v={t.fat}                    u="ג׳"    c="var(--fat)" />
            <TargetItem label="קצב מטבולי" v={t.bmr}                    u="קק״ל"  c="var(--ink-soft)" />
          </div>
        </Card>
      </div>

      {/* ── personal data ── */}
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 4px 10px' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>הנתונים שלי</span>
          {!edit && <button onClick={() => setEdit(true)} style={{ border: 'none', background: 'transparent', color: 'var(--green-deep)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>עריכה</button>}
        </div>

        {!edit ? (
          <Card style={{ padding: '6px 4px' }}>
            <Row label="מגדר"         value={user.gender === 'male' ? 'גבר 👨' : 'אישה 👩'} />
            <Row label="גיל"          value={`${user.age} שנים`} />
            <Row label="גובה"         value={`${user.height} ס״מ`} />
            <Row label="משקל נוכחי"   value={`${user.weight} ק״ג`} />
            <Row label="משקל יעד"     value={user.targetWeight ? `${user.targetWeight} ק״ג` : '—'} />
            <Row label="רמת פעילות"   value={actLabel} />
            <Row label="מטרה"         value={goalLabel} last />
          </Card>
        ) : (
          <Card>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500, margin: '4px 2px 10px' }}>מגדר</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <Chip on={p.gender !== 'male'} onClick={() => set('gender', 'female')}>אישה 👩</Chip>
              <Chip on={p.gender === 'male'} onClick={() => set('gender', 'male')}>גבר 👨</Chip>
            </div>
            <EditMetric label="גיל"         k="age"          min={14}  max={90}  unit="שנים" p={p} set={set} />
            <EditMetric label="גובה"        k="height"       min={130} max={210} unit='ס״מ'  p={p} set={set} />
            <EditMetric label="משקל נוכחי" k="weight"       min={35}  max={200} unit='ק״ג'  p={p} set={set} />
            <EditMetric label="משקל יעד"   k="targetWeight" min={30}  max={200} unit='ק״ג'  p={p} set={set} />
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
        <button onClick={onReset} style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--pink-deep)', fontSize: 14.5, padding: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
          איפוס הנתונים והתחלה מחדש
        </button>
      </div>
    </div>
  );
}

// ── Weight widget ───────────────────────────────────────────
function WeightWidget({ user, logs, onUpdate }) {
  const g = (f, m) => G(user.gender, f, m);
  const [editW, setEditW]         = React.useState(false);
  const [newWeight, setNewWeight] = React.useState(String(user.weight));
  const [editT, setEditT]         = React.useState(false);
  const [newTarget, setNewTarget] = React.useState('');

  const hasTarget = !!user.targetWeight;
  const diff      = hasTarget ? +(user.weight - user.targetWeight).toFixed(1) : 0;
  const losing    = diff > 0.05;
  const gaining   = diff < -0.05;
  const reached   = hasTarget && Math.abs(diff) <= 0.05;

  // forecast from actual logs
  const activeDays  = logs ? Object.values(logs).filter(d => d?.foods?.length > 0) : [];
  const avgKcal     = activeDays.length > 0
    ? Math.round(activeDays.reduce((s, d) => s + KP.dayTotals(d).kcal, 0) / activeDays.length)
    : null;
  const TDEE        = user.goal === 'lose' ? user.targets.calories + 500
                    : user.goal === 'gain' ? user.targets.calories - 500
                    : user.targets.calories;
  const dailyDef    = avgKcal !== null ? TDEE - avgKcal : null;
  const kgPerWeek   = dailyDef !== null ? +(dailyDef * 7 / 7700).toFixed(2) : null;
  const kgPerMonth  = kgPerWeek  !== null ? +(kgPerWeek * 4.3).toFixed(1) : null;
  const weeksToGoal = (hasTarget && kgPerWeek && Math.abs(kgPerWeek) > 0.01 && Math.abs(diff) > 0.05)
    ? Math.ceil(Math.abs(diff) / Math.abs(kgPerWeek))
    : null;

  const saveWeight = () => {
    const w = parseFloat(newWeight);
    if (!w || w < 20 || w > 300) { setEditW(false); return; }
    const today = KP.TODAY();
    const history = (user.weightHistory || []).filter(e => e.date !== today);
    history.push({ date: today, weight: w });
    onUpdate({ ...user, weight: w, targets: KP.calcTargets({ ...user, weight: w }), weightHistory: history });
    setEditW(false);
  };

  const saveTarget = () => {
    const w = parseFloat(newTarget);
    if (!w || w < 20 || w > 300) { setEditT(false); return; }
    const updated = { ...user, targetWeight: w };
    onUpdate({ ...updated, targets: KP.calcTargets(updated) });
    setEditT(false);
  };

  return (
    <Card>
      {/* current ↔ target */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* current weight */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>משקל נוכחי</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--ink)', lineHeight: 1 }}>
            {user.weight}<span style={{ fontSize: 14, color: 'var(--ink-soft)', marginInlineStart: 2 }}>ק״ג</span>
          </div>
          {editW ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 7 }}>
              <input type="number" inputMode="decimal" value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveWeight()}
                autoFocus
                style={{ width: 66, border: 'none', background: 'var(--bg)', borderRadius: 9, padding: '6px 8px', fontSize: 17, fontFamily: 'var(--font-display)', color: 'var(--green-deep)', outline: 'none', textAlign: 'center' }} />
              <button onClick={saveWeight} style={{ border: 'none', background: 'var(--green)', borderRadius: 9, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon.check s={15} c="#fff" />
              </button>
              <button onClick={() => setEditW(false)} style={{ border: 'none', background: 'var(--track)', borderRadius: 9, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon.close s={15} c="var(--ink-soft)" />
              </button>
            </div>
          ) : (
            <button onClick={() => { setNewWeight(String(user.weight)); setEditW(true); }}
              style={{ border: 'none', background: 'var(--green-soft)', borderRadius: 9, padding: '4px 14px', fontSize: 12, color: 'var(--green-deep)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 7 }}>
              {g('עדכני', 'עדכן')}
            </button>
          )}
        </div>

        {/* arrow + diff badge */}
        {hasTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{ fontSize: 20, color: 'var(--ink-soft)' }}>→</div>
            {reached ? (
              <div style={{ fontSize: 13 }}>🎉</div>
            ) : (
              <div style={{ fontSize: 11.5, fontWeight: 700, color: losing ? 'var(--green-deep)' : 'var(--pink-deep)', background: losing ? 'var(--green-soft)' : 'var(--pink-soft)', borderRadius: 7, padding: '3px 8px' }}>
                {losing ? '−' : '+'}{Math.abs(diff)} ק״ג
              </div>
            )}
          </div>
        )}

        {/* target weight */}
        {hasTarget && (
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 4 }}>יעד</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--green-deep)', lineHeight: 1 }}>
              {user.targetWeight}<span style={{ fontSize: 14, color: 'var(--ink-soft)', marginInlineStart: 2 }}>ק״ג</span>
            </div>
            {editT ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 7 }}>
                <input type="number" inputMode="decimal" value={newTarget}
                  onChange={e => setNewTarget(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveTarget()}
                  autoFocus
                  style={{ width: 66, border: 'none', background: 'var(--bg)', borderRadius: 9, padding: '6px 8px', fontSize: 17, fontFamily: 'var(--font-display)', color: 'var(--green-deep)', outline: 'none', textAlign: 'center' }} />
                <button onClick={saveTarget} style={{ border: 'none', background: 'var(--green)', borderRadius: 9, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon.check s={15} c="#fff" />
                </button>
                <button onClick={() => setEditT(false)} style={{ border: 'none', background: 'var(--track)', borderRadius: 9, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon.close s={15} c="var(--ink-soft)" />
                </button>
              </div>
            ) : (
              <button onClick={() => { setNewTarget(String(user.targetWeight)); setEditT(true); }}
                style={{ border: 'none', background: 'var(--green-soft)', borderRadius: 9, padding: '4px 14px', fontSize: 12, color: 'var(--green-deep)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 7 }}>
                שנייה
              </button>
            )}
          </div>
        )}

        {/* no target yet — inline setter */}
        {!hasTarget && (
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 6 }}>משקל יעד</div>
            {editT ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <input type="number" inputMode="decimal" value={newTarget}
                  onChange={e => setNewTarget(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveTarget()}
                  autoFocus placeholder="ק״ג"
                  style={{ width: 80, border: 'none', background: 'var(--bg)', borderRadius: 12, padding: '10px 10px', fontSize: 24, fontFamily: 'var(--font-display)', color: 'var(--green-deep)', outline: 'none', textAlign: 'center' }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={saveTarget} style={{ border: 'none', background: 'var(--green)', borderRadius: 9, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.check s={16} c="#fff" />
                  </button>
                  <button onClick={() => setEditT(false)} style={{ border: 'none', background: 'var(--track)', borderRadius: 9, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.close s={16} c="var(--ink-soft)" />
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setNewTarget(''); setEditT(true); }}
                style={{ border: 'none', background: 'var(--green-soft)', borderRadius: 14, padding: '12px 16px', fontSize: 13, color: 'var(--green-deep)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', lineHeight: 1.4, width: '100%' }}>
                ＋ {g('הגדרי', 'הגדר')} יעד
              </button>
            )}
          </div>
        )}
      </div>

      {/* projection line chart */}
      {hasTarget && !reached && (
        <div style={{ marginTop: 16 }}>
          <WeightChart currentWeight={user.weight} targetWeight={user.targetWeight} weeksToGoal={weeksToGoal} kgPerWeek={kgPerWeek} />
        </div>
      )}

      {/* forecast */}
      {avgKcal !== null ? (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>📊 תחזית לפי התפריט</span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>ממוצע {avgKcal} קק״ל · {activeDays.length} ימים</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: weeksToGoal ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
            <ForecastCell label="שבוע"  kg={kgPerWeek} />
            <ForecastCell label="חודש"  kg={kgPerMonth} />
            {weeksToGoal && (
              <div style={{ background: 'var(--green-soft)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--green-deep)' }}>{weeksToGoal}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 2 }}>שבועות ליעד</div>
              </div>
            )}
          </div>
          {dailyDef !== null && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center' }}>
              {dailyDef > 0 ? `גירעון של ${dailyDef} קק״ל/יום` : dailyDef < 0 ? `עודף של ${Math.abs(dailyDef)} קק״ל/יום` : 'מאוזן — ללא שינוי משקל'}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)', fontSize: 12.5, color: 'var(--ink-soft)', textAlign: 'center' }}>
          {g('הוסיפי', 'הוסף')} מזון לפחות יום אחד כדי לראות תחזית
        </div>
      )}
    </Card>
  );
}

function ForecastCell({ label, kg }) {
  const losing  = kg  >  0.01;
  const gaining = kg  < -0.01;
  return (
    <div style={{ background: losing ? 'var(--green-soft)' : gaining ? 'var(--pink-soft)' : 'var(--bg)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: losing ? 'var(--green-deep)' : gaining ? 'var(--pink-deep)' : 'var(--ink)' }}>
        {losing ? '−' : gaining ? '+' : ''}{Math.abs(kg)}<span style={{ fontSize: 11 }}>ק״ג</span>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function WeightChart({ currentWeight, targetWeight, weeksToGoal, kgPerWeek }) {
  const W = 280, H = 68;
  const sx = 28, ex = W - 28, trackY = 22;

  const mids = weeksToGoal
    ? [Math.round(weeksToGoal / 3), Math.round(weeksToGoal * 2 / 3)].map((w, i) => ({
        x: sx + (ex - sx) * ((i + 1) / 3),
        weeks: w,
      }))
    : [];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* track */}
      <line x1={sx} y1={trackY} x2={ex} y2={trackY} stroke="var(--track)" strokeWidth="4" strokeLinecap="round" />
      <line x1={sx} y1={trackY} x2={ex} y2={trackY} stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" strokeDasharray="6 5" />

      {/* milestone ticks */}
      {mids.map(({ x, weeks }) => (
        <g key={weeks}>
          <line x1={x} y1={trackY - 6} x2={x} y2={trackY + 6} stroke="var(--green-deep)" strokeWidth="1.5" opacity="0.35" />
          <text x={x} y={trackY - 10} textAnchor="middle" fontSize="9" fill="var(--ink-soft)" fontFamily="Rubik">{`+${weeks}שב׳`}</text>
        </g>
      ))}

      {/* start dot — היום */}
      <circle cx={sx} cy={trackY} r="8" fill="var(--card)" stroke="var(--ink-soft)" strokeWidth="2" />
      <circle cx={sx} cy={trackY} r="3.5" fill="var(--ink-soft)" />

      {/* end dot — יעד */}
      <circle cx={ex} cy={trackY} r="10" fill="var(--green-soft)" stroke="var(--green)" strokeWidth="2.5" />
      <circle cx={ex} cy={trackY} r="4.5" fill="var(--green)" />

      {/* bottom labels */}
      <text x={sx} y={trackY + 18} textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontFamily="Rubik">היום</text>
      <text x={sx} y={trackY + 30} textAnchor="middle" fontSize="11.5" fill="var(--ink)" fontFamily="Rubik" fontWeight="700">{currentWeight} ק״ג</text>

      <text x={ex} y={trackY + 18} textAnchor="middle" fontSize="10" fill="var(--green-deep)" fontFamily="Rubik">
        {weeksToGoal ? `~${weeksToGoal} שב׳` : 'יעד'}
      </text>
      <text x={ex} y={trackY + 30} textAnchor="middle" fontSize="11.5" fill="var(--green-deep)" fontFamily="Rubik" fontWeight="700">{targetWeight} ק״ג</text>
    </svg>
  );
}

// ── small helpers ───────────────────────────────────────────
function TargetItem({ label, v, u, c }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <div style={{ width: 8, height: 8, borderRadius: 3, background: c }} />
        <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)' }}>
        {v}<span style={{ fontSize: 12, color: 'var(--ink-soft)', marginInlineStart: 3 }}>{u}</span>
      </div>
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
  const [val, setVal] = React.useState(p[k] != null ? String(p[k]) : '');
  const commit = (str) => {
    if (!str.trim()) return;
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
          placeholder={String(min)}
          style={{ width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--card)', borderRadius: 14, padding: '16px 60px 16px 20px', fontSize: 38, fontFamily: 'var(--font-display)', color: 'var(--green-deep)', outline: 'none' }}
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
