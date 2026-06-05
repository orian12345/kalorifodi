/* ============================================================
   קלוריפודי — Weekly history + progress graph
   ============================================================ */
function History({ user, logs }) {
  const t = user.targets;
  const keys = KP.weekKeys();
  const today = KP.TODAY();
  const days = keys.map(k => ({ key: k, ...KP.dayTotals(logs[k] || KP.emptyDay()), water: (logs[k] || {}).water || 0, has: !!(logs[k] && logs[k].foods && logs[k].foods.length) }));
  const maxVal = Math.max(t.calories, ...days.map(d => d.kcal), 1);

  const active = days.filter(d => d.has);
  const avg = (sel) => active.length ? Math.round(active.reduce((s, d) => s + sel(d), 0) / active.length) : 0;
  const avgK = avg(d => d.kcal), avgP = avg(d => d.p), avgC = avg(d => d.c), avgF = avg(d => d.f), avgW = avg(d => d.water);

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingBottom: 112 }}>
      <div style={{ padding: '60px 22px 4px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 27, color: 'var(--ink)', margin: 0, letterSpacing: '-.3px' }}>השבוע שלך</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '4px 0 0' }}>7 הימים האחרונים</p>
      </div>

      {/* SVG calorie + trend chart */}
      <div style={{ padding: '14px 18px 0' }}>
        <Card style={{ padding: '18px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>קלוריות ליום</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-soft)' }}>
              <span style={{ width: 16, height: 2, background: 'var(--pink)', borderRadius: 3, display: 'inline-block', verticalAlign: 'middle' }} />יעד {t.calories}
            </span>
          </div>
          <CalorieChart days={days} target={t.calories} today={today} />
        </Card>
      </div>

      {/* macro breakdown chart */}
      <div style={{ padding: '14px 18px 0' }}>
        <Card style={{ padding: '18px 16px 14px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 14 }}>מקרו יומי</div>
          <MacroChart days={days} targets={t} />
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
            {[['חלבון','var(--pink)'],['פחמימות','var(--carb)'],['שומן','var(--fat)']].map(([l,c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-soft)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />{l}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* weekly averages */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 4px 10px' }}>ממוצע יומי{active.length ? '' : ' — אין עדיין נתונים'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <AvgCard label="קלוריות" v={avgK} u="קק״ל" c="var(--green)" big />
          <AvgCard label="מים" v={(avgW / 1000).toFixed(1)} u="ליטר" c="var(--water)" big />
          <AvgCard label="חלבון" v={avgP} u="ג׳" c="var(--pink)" />
          <AvgCard label="פחמימות" v={avgC} u="ג׳" c="var(--carb)" />
        </div>
      </div>

      {/* per-day list */}
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 4px 10px' }}>פירוט יומי</div>
        <Card style={{ padding: 6 }}>
          {[...days].reverse().map((d, idx, arr) => {
            const dt = new Date(d.key + 'T00:00:00');
            const label = d.key === today ? 'היום' : dt.toLocaleDateString('he-IL', { weekday: 'long' });
            const pct = Math.min(100, Math.round((d.kcal / t.calories) * 100));
            return (
              <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--line)' }}>
                <div style={{ width: 44 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{dt.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}</div>
                </div>
                <div style={{ flex: 1, height: 8, borderRadius: 8, background: 'var(--track)', overflow: 'hidden' }}>
                  <div style={{ width: (d.has ? Math.min(100, pct) : 0) + '%', height: '100%', borderRadius: 8, background: d.kcal > t.calories ? 'var(--pink)' : 'var(--green)' }} />
                </div>
                <div style={{ width: 64, textAlign: 'end', fontSize: 13, color: d.has ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: 500 }}>{d.has ? `${d.kcal} קק״ל` : '—'}</div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function CalorieChart({ days, target, today }) {
  const W = 300, H = 170, LABEL_H = 22;
  const chartH = H - LABEL_H;
  const maxVal = Math.max(target * 1.15, ...days.map(d => d.kcal), 100);
  const barW = W / days.length;

  // trend line through active days
  const activePoints = days
    .map((d, i) => d.has ? { x: i * barW + barW / 2, y: chartH - (d.kcal / maxVal) * (chartH - 14) - 4 } : null)
    .filter(Boolean);
  const trendPath = activePoints.length > 1
    ? activePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* target dashed line */}
      {(() => {
        const ty = chartH - (target / maxVal) * (chartH - 14) - 4;
        return <line x1={0} y1={ty} x2={W} y2={ty} stroke="var(--pink)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.55" />;
      })()}

      {/* bars */}
      {days.map((d, i) => {
        const bh = d.has ? Math.max(5, (d.kcal / maxVal) * (chartH - 14)) : 3;
        const bx = i * barW + barW * 0.14;
        const bw = barW * 0.72;
        const by = d.has ? chartH - bh - 4 : chartH - 7;
        const isToday = d.key === today;
        const over = d.kcal > target;
        return (
          <g key={d.key}>
            <rect x={bx} y={by} width={bw} height={bh} rx="6"
              fill={d.has ? (over ? 'var(--pink)' : 'var(--green)') : 'var(--track)'}
              opacity={d.has ? (isToday ? 1 : 0.75) : 1} />
            {isToday && d.has && <rect x={bx - 2} y={by - 2} width={bw + 4} height={bh + 4} rx="8" fill="none" stroke="var(--green)" strokeWidth="1.5" opacity="0.4" />}
            {d.has && (
              <text x={bx + bw / 2} y={by - 5} textAnchor="middle" fontSize="9" fill="var(--ink-soft)" fontFamily="Rubik">{d.kcal}</text>
            )}
            <text x={bx + bw / 2} y={H - 3} textAnchor="middle" fontSize="10"
              fill={isToday ? 'var(--green-deep)' : 'var(--ink-soft)'}
              fontFamily="Rubik" fontWeight={isToday ? '700' : '500'}>{KP.dayName(d.key)}</text>
          </g>
        );
      })}

      {/* trend line */}
      {trendPath && (
        <path d={trendPath} stroke="var(--ink)" strokeWidth="1.5" fill="none"
          strokeDasharray="0" strokeLinejoin="round" strokeLinecap="round" opacity="0.22" />
      )}
    </svg>
  );
}

function MacroChart({ days, targets }) {
  const W = 300, H = 100, LABEL_H = 20;
  const chartH = H - LABEL_H;
  const barW = W / days.length;
  const maxP = targets.protein, maxC = targets.carbs, maxF = targets.fat;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {days.map((d, i) => {
        const bx = i * barW + barW * 0.1;
        const bw = barW * 0.8;
        const maxStack = Math.max(maxP + maxC + maxF, d.p + d.c + d.f, 1);
        const total = d.p + d.c + d.f;
        const scale = d.has ? Math.min(1, total / maxStack) * (chartH - 4) : 3;
        const pH = d.has ? (d.p / Math.max(total, 1)) * scale : 0;
        const cH = d.has ? (d.c / Math.max(total, 1)) * scale : 0;
        const fH = d.has ? (d.f / Math.max(total, 1)) * scale : 0;
        let y = chartH;
        return (
          <g key={d.key}>
            {d.has ? (
              <>
                {[{h: fH, c: 'var(--fat)'},{h: cH, c: 'var(--carb)'},{h: pH, c: 'var(--pink)'}].map(({h,c}, si) => {
                  y -= h;
                  return <rect key={si} x={bx} y={y} width={bw} height={h}
                    rx={si === 2 ? 4 : 0} fill={c} opacity="0.82" />;
                })}
              </>
            ) : (
              <rect x={bx} y={chartH - 3} width={bw} height={3} rx="3" fill="var(--track)" />
            )}
            <text x={bx + bw / 2} y={H - 3} textAnchor="middle" fontSize="10"
              fill={d.key === KP.TODAY() ? 'var(--green-deep)' : 'var(--ink-soft)'}
              fontFamily="Rubik" fontWeight={d.key === KP.TODAY() ? '700' : '500'}>{KP.dayName(d.key)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function AvgCard({ label, v, u, c, big }) {
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <div style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
        <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: big ? 30 : 24, color: 'var(--ink)' }}>{v}<span style={{ fontSize: 13, color: 'var(--ink-soft)', marginInlineStart: 4 }}>{u}</span></div>
    </Card>
  );
}

Object.assign(window, { History });
