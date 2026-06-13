/* ============================================================
   קלוריפודי — Workouts tab
   ============================================================ */
const WORKOUT_TYPES = [
  { id: 'gym',             label: 'חדר כושר',        icon: '🏋️' },
  { id: 'run',             label: 'ריצה',            icon: '🏃' },
  { id: 'strength',        label: 'אימון כוח',       icon: '💪' },
  { id: 'walk',            label: 'הליכה',           icon: '🚶' },
  { id: 'cycle',           label: 'אופניים',         icon: '🚴' },
  { id: 'swim',            label: 'שחייה',           icon: '🏊' },
  { id: 'yoga',            label: 'יוגה',            icon: '🧘' },
  { id: 'pilates_mat',     label: 'פילאטיס מזרן',    icon: '🤸‍♀️' },
  { id: 'pilates_machine', label: 'פילאטיס מכשירים', icon: '🛠️' },
  { id: 'sport',           label: 'ספורט',           icon: '⚽' },
  { id: 'other',           label: 'אחר',             icon: '🤸' },
];

function Workouts({ user, logs, onAddWorkout }) {
  const [showAdd, setShowAdd] = React.useState(false);
  const today = KP.TODAY();
  const keys  = KP.weekKeys();

  const weekDays = keys.map(k => ({ key: k, workouts: logs[k]?.workouts || [] }));
  const totalWeek  = weekDays.reduce((s, d) => s + d.workouts.length, 0);
  const todayList  = logs[today]?.workouts || [];

  const weightHistory = (user.weightHistory || [])
    .slice().sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingBottom: 112 }}>
      <div style={{ padding: '60px 22px 4px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, color: 'var(--ink)', margin: 0, letterSpacing: '-.3px' }}>אימונים</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '4px 0 0' }}>מעקב פעילות גופנית והתקדמות במשקל</p>
      </div>

      {/* stats */}
      <div style={{ padding: '16px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card style={{ padding: 18, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--green-deep)', lineHeight: 1 }}>{totalWeek}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 6 }}>אימונים השבוע</div>
        </Card>
        <Card style={{ padding: 18, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--carb)', lineHeight: 1 }}>{todayList.length}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 6 }}>אימונים היום</div>
        </Card>
      </div>

      {/* add button */}
      <div style={{ padding: '14px 18px 0' }}>
        <button onClick={() => setShowAdd(true)} style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'var(--green)', borderRadius: 18, padding: '16px', fontSize: 16, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 20px -6px var(--green-shadow)' }}>
          <Icon.dumbbell s={22} c="#fff" /> הוסיפי אימון
        </button>
      </div>

      {/* weekly calendar */}
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 4px 10px' }}>השבוע</div>
        <Card style={{ padding: '14px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
            {weekDays.map(d => {
              const isToday = d.key === today;
              const count   = d.workouts.length;
              const dt      = new Date(d.key + 'T00:00:00');
              return (
                <div key={d.key} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: isToday ? 'var(--green-deep)' : 'var(--ink-soft)', fontWeight: isToday ? 700 : 400, marginBottom: 6 }}>
                    {KP.dayName(d.key)}
                  </div>
                  <div style={{ width: 34, height: 34, borderRadius: 11, background: count > 0 ? 'var(--green)' : 'var(--track)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: isToday ? '0 0 0 2px var(--green-deep)' : 'none' }}>
                    {count > 0
                      ? <span style={{ fontSize: 15 }}>💪</span>
                      : <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{dt.getDate()}</span>}
                  </div>
                  {count > 1 && <div style={{ fontSize: 9, color: 'var(--green-deep)', marginTop: 3, fontWeight: 700 }}>×{count}</div>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* weight history graph */}
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 4px 10px' }}>התקדמות במשקל</div>
        <Card style={{ padding: '18px 16px 14px' }}>
          {weightHistory.length >= 2 ? (
            <WeightHistoryChart history={weightHistory} targetWeight={user.targetWeight} />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              עדכני את המשקל שלך בפרופיל<br />
              <span style={{ fontSize: 12 }}>הגרף יופיע אחרי 2 מדידות</span>
            </div>
          )}
        </Card>
      </div>

      {/* today's workouts */}
      {todayList.length > 0 && (
        <div style={{ padding: '20px 18px 0' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 4px 10px' }}>האימונים של היום</div>
          <Card style={{ padding: 6 }}>
            {todayList.map((w, i) => {
              const wt = WORKOUT_TYPES.find(t => t.id === w.type) || WORKOUT_TYPES[8];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < todayList.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <span style={{ fontSize: 24 }}>{wt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{wt.label}</div>
                    {w.duration > 0 && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{w.duration} דקות</div>}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {showAdd && (
        <AddWorkoutModal
          onClose={() => setShowAdd(false)}
          onAdd={w => { onAddWorkout(w); setShowAdd(false); }}
        />
      )}
    </div>
  );
}

function AddWorkoutModal({ onClose, onAdd }) {
  const [type, setType]         = React.useState('gym');
  const [duration, setDuration] = React.useState('45');

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--card)', borderRadius: '24px 24px 0 0', padding: '24px 22px 44px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', margin: 0 }}>הוסיפי אימון</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'var(--bg)', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.close s={18} c="var(--ink-soft)" />
          </button>
        </div>

        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 10, fontWeight: 500 }}>סוג האימון</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
          {WORKOUT_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} style={{ border: 'none', cursor: 'pointer', borderRadius: 12, padding: '8px 14px', background: type === t.id ? 'var(--green)' : 'var(--bg)', color: type === t.id ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8, fontWeight: 500 }}>משך (דקות)</div>
        <input type="number" inputMode="numeric" value={duration} onChange={e => setDuration(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--bg)', borderRadius: 14, padding: '14px 18px', fontSize: 26, fontFamily: 'var(--font-display)', color: 'var(--green-deep)', outline: 'none', marginBottom: 22 }} />

        <Btn onClick={() => onAdd({ type, duration: parseInt(duration) || 0, ts: Date.now() })}>
          שמירה 💪
        </Btn>
      </div>
    </div>
  );
}

function WeightHistoryChart({ history, targetWeight }) {
  const pts = history.slice(-14);
  if (pts.length < 2) return null;

  const W = 300, H = 130, PL = 32, PR = 10, PT = 16, PB = 28;
  const cW = W - PL - PR, cH = H - PT - PB;

  const weights  = pts.map(d => d.weight);
  const allW     = targetWeight ? [...weights, targetWeight] : weights;
  const minW     = Math.min(...allW) - 1;
  const maxW     = Math.max(...allW) + 1;
  const toX = i  => PL + (i / (pts.length - 1)) * cW;
  const toY = w  => PT + cH - ((w - minW) / (maxW - minW)) * cH;

  const coords  = pts.map((d, i) => ({ x: toX(i), y: toY(d.weight), w: d.weight, date: d.date }));
  const pathD   = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD   = `${pathD} L ${coords[coords.length-1].x} ${PT+cH} L ${coords[0].x} ${PT+cH} Z`;

  const losing  = pts[pts.length-1].weight < pts[0].weight;
  const color   = losing ? 'var(--green)' : 'var(--pink)';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id="whG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={losing ? '#84A95C' : '#E78BA0'} stopOpacity="0.25" />
          <stop offset="100%" stopColor={losing ? '#84A95C' : '#E78BA0'} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* target dashed line */}
      {targetWeight && minW <= targetWeight && targetWeight <= maxW && (
        <line x1={PL} y1={toY(targetWeight)} x2={W-PR} y2={toY(targetWeight)}
          stroke="var(--pink)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.55" />
      )}

      {/* Y axis labels */}
      {[minW+1, Math.round((minW+maxW)/2), maxW-1].map(w => (
        <text key={w} x={PL-4} y={toY(w)+3} textAnchor="end" fontSize="8.5" fill="var(--ink-soft)" fontFamily="Rubik">{Math.round(w)}</text>
      ))}

      <path d={areaD} fill="url(#whG)" />
      <path d={pathD} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {coords.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === 0 || i === coords.length-1 ? 4.5 : 2.5} fill={color} />
      ))}

      {/* weight labels for first and last */}
      <text x={coords[0].x} y={coords[0].y - 8} textAnchor="middle" fontSize="9.5" fill="var(--ink-soft)" fontFamily="Rubik">{pts[0].weight}</text>
      <text x={coords[coords.length-1].x} y={coords[coords.length-1].y - 8} textAnchor="middle" fontSize="10" fill={color} fontFamily="Rubik" fontWeight="700">{pts[pts.length-1].weight}</text>

      {/* date labels */}
      {[0, coords.length-1].map(i => {
        const d = new Date(pts[i].date + 'T00:00:00');
        return <text key={i} x={coords[i].x} y={H-4} textAnchor="middle" fontSize="9" fill="var(--ink-soft)" fontFamily="Rubik">{d.getDate()}/{d.getMonth()+1}</text>;
      })}
    </svg>
  );
}

Object.assign(window, { Workouts });
