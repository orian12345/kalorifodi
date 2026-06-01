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

      {/* bar chart */}
      <div style={{ padding: '14px 18px 0' }}>
        <Card style={{ padding: '20px 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>קלוריות ליום</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-soft)' }}>
              <span style={{ width: 16, height: 3, background: 'var(--pink)', borderRadius: 3, display: 'inline-block' }} />יעד {t.calories}
            </span>
          </div>
          <div style={{ position: 'relative', height: 150, display: 'flex', alignItems: 'flex-end', gap: 8, paddingTop: 6 }}>
            {/* target line */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${(t.calories / maxVal) * 130 + 20}px`, height: 2, background: 'var(--pink)', opacity: .55, borderRadius: 2, zIndex: 2 }} />
            {days.map(d => {
              const h = d.has ? Math.max(6, (d.kcal / maxVal) * 130) : 0;
              const isToday = d.key === today;
              const over = d.kcal > t.calories;
              return (
                <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginBottom: 4, fontWeight: 500 }}>{d.has ? d.kcal : ''}</div>
                  <div style={{ width: '78%', height: h, borderRadius: 8, background: d.has ? (over ? 'var(--pink)' : 'var(--green)') : 'var(--track)', opacity: d.has ? (isToday ? 1 : .8) : 1, transition: 'height .5s', boxShadow: isToday && d.has ? '0 0 0 2px var(--green-soft)' : 'none' }} />
                  <div style={{ fontSize: 12, color: isToday ? 'var(--green-deep)' : 'var(--ink-soft)', marginTop: 8, fontWeight: isToday ? 700 : 500 }}>{KP.dayName(d.key)}</div>
                </div>
              );
            })}
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
