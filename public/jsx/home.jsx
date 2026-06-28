/* ============================================================
   קלוריפודי — Home dashboard
   ============================================================ */
const WORKOUT_KCAL_PER_MIN = {
  gym: 6, run: 10, strength: 7, walk: 4, cycle: 8, swim: 9, yoga: 3,
  pilates_mat: 4, pilates_machine: 5, sport: 8, other: 5,
};

function Home({ user, day, onAddFood, onWater, onRemoveFood, onOpenProfile }) {
  const t = user.targets;
  const tot = KP.dayTotals(day);
  const burned = (day.workouts || []).reduce((s, w) => s + (WORKOUT_KCAL_PER_MIN[w.type] || 5) * (w.duration || 0), 0);
  const budget = t.calories + burned;
  const remaining = Math.max(0, budget - tot.kcal);
  const over = tot.kcal > budget;

  const hour = new Date().getHours();
  const greet = hour < 11 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : hour < 21 ? 'ערב טוב' : 'לילה טוב';
  const dateStr = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });

  const cupSize = 250;
  const cupsTarget = Math.round(t.water / cupSize);
  const cupsDone = Math.round(day.water / cupSize);

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingBottom: 112 }}>
      {/* header */}
      <div style={{ padding: '60px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14.5, color: 'var(--ink-soft)', fontWeight: 500 }}>{greet},</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 25, color: 'var(--ink)', letterSpacing: '-.3px' }}>{user.name}</div>
        </div>
        <button onClick={onOpenProfile} style={{ border: 'none', cursor: 'pointer', width: 46, height: 46, borderRadius: 16, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--green-deep)' }}>
          {user.name.trim().charAt(0) || '🙂'}
        </button>
      </div>
      <div style={{ padding: '2px 22px 0', fontSize: 13, color: 'var(--ink-soft)' }}>{dateStr}</div>

      {/* calorie ring card */}
      <div style={{ padding: '18px 18px 0' }}>
        <Card style={{ padding: '26px 18px 22px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Ring size={210} stroke={20} value={tot.kcal} max={budget} color={over ? 'var(--pink)' : 'var(--green)'}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 50, color: 'var(--ink)', lineHeight: 1 }}>{over ? tot.kcal - budget : remaining}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 4 }}>{over ? 'קק״ל מעל היעד' : 'קק״ל נותרו'}</div>
            </Ring>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginTop: 18 }}>
            <Stat label="נצרכו" value={tot.kcal} />
            <div style={{ width: 1, background: 'var(--line)', margin: '4px 0' }} />
            <Stat label="יעד" value={t.calories} />
            <div style={{ width: 1, background: 'var(--line)', margin: '4px 0' }} />
            <Stat label="פעילות" value={burned > 0 ? `+${burned}` : '—'} />
          </div>
        </Card>
      </div>

      {/* macros */}
      <div style={{ padding: '14px 18px 0' }}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MacroBar label="חלבון" value={tot.p} max={t.protein} color="var(--pink)" />
            <MacroBar label="פחמימות" value={tot.c} max={t.carbs} color="var(--carb)" />
            <MacroBar label="שומן" value={tot.f} max={t.fat} color="var(--fat)" />
          </div>
        </Card>
      </div>

      {/* water */}
      <div style={{ padding: '14px 18px 0' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon.drop s={20} c="var(--water)" fill="var(--water-soft)" />
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>מים</span>
            </div>
            <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>
              {(day.water / 1000).toFixed(2)}<span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> / {(t.water / 1000).toFixed(1)} ליטר</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => onWater(-cupSize)} style={waterBtn}><Icon.minus s={20} c="var(--water)" /></button>
            <div style={{ flex: 1, display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
              {Array.from({ length: cupsTarget }).map((_, i) => (
                <div key={i} onClick={() => onWater((i + 1) * cupSize - day.water)} style={{
                  width: 18, height: 26, borderRadius: '4px 4px 7px 7px', cursor: 'pointer',
                  background: i < cupsDone ? 'var(--water)' : 'var(--water-soft)',
                  boxShadow: i < cupsDone ? 'inset 0 -3px 0 rgba(0,0,0,.06)' : 'none', transition: 'background .2s',
                }} />
              ))}
            </div>
            <button onClick={() => onWater(cupSize)} style={waterBtn}><Icon.plus s={20} c="var(--water)" /></button>
          </div>
        </Card>
      </div>

      {/* meal recommendations */}
      <MealRecommendations user={user} remaining={remaining} />

      {/* meals */}
      <div style={{ padding: '20px 18px 0' }}>
        {KP.MEALS.map(meal => {
          const items = (day.foods || []).map((f, i) => ({ ...f, _i: i })).filter(f => f.meal === meal.id);
          const mk = items.reduce((s, it) => s + it.kcal * it.qty, 0);
          return (
            <div key={meal.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{meal.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{meal.label}</span>
                  {mk > 0 && <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>· {Math.round(mk)} קק״ל</span>}
                </div>
                <button onClick={() => onAddFood(meal.id)} style={{ border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: 10, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.plus s={18} c="var(--green-deep)" />
                </button>
              </div>
              {items.length === 0 ? (
                <button onClick={() => onAddFood(meal.id)} style={{ width: '100%', border: '1.5px dashed var(--line)', background: 'transparent', borderRadius: 16, padding: '14px', color: 'var(--ink-soft)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  להוספת מאכל
                </button>
              ) : (
                <Card style={{ padding: 6 }}>
                  {items.map((it, idx) => (
                    <FoodRow key={it._i} it={it} isLast={idx === items.length - 1} onRemove={() => onRemoveFood(it._i)} />
                  ))}
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 1 }}>{label}</div>
    </div>
  );
}

function FoodRow({ it, isLast, onRemove }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{it.icon || '🍽️'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{(it.unitQty ?? it.qty) !== 1 ? `${it.unitQty ?? it.qty} × ` : ''}{it.unitLabel || it.serving} · ח{Math.round(it.p * it.qty)} פ{Math.round(it.c * it.qty)} ש{Math.round(it.f * it.qty)}</div>
      </div>
      <div onClick={() => setOpen(o => !o)} style={{ textAlign: 'end', cursor: 'pointer' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--ink)' }}>{Math.round(it.kcal * it.qty)}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>קק״ל</div>
      </div>
      {open && (
        <button onClick={onRemove} style={{ border: 'none', cursor: 'pointer', background: 'var(--pink-soft)', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.trash s={17} c="var(--pink-deep)" />
        </button>
      )}
    </div>
  );
}

const MEAL_TYPES = [
  { id: 'breakfast', label: 'בוקר',   icon: '🌅' },
  { id: 'lunch',     label: 'צהריים', icon: '☀️' },
  { id: 'dinner',    label: 'ערב',    icon: '🌙' },
  { id: 'snack',     label: 'חטיף',   icon: '🍎' },
];

function MealRecommendations({ user, remaining }) {
  const g = (f, m) => G(user.gender, f, m);
  const [recs, setRecs]       = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [errMsg, setErrMsg]   = React.useState('');
  const [round, setRound]     = React.useState(0);

  const h = new Date().getHours();
  const defaultType = h < 10 ? 'breakfast' : h < 15 ? 'lunch' : h < 21 ? 'dinner' : 'snack';
  const [mealType, setMealType] = React.useState(defaultType);

  const fetchRecs = async (type, r) => {
    const mt = type || mealType;
    const rd = r !== undefined ? r : round;
    setLoading(true); setErrMsg('');
    try {
      const res = await fetch('/api/meal-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API.token() },
        body: JSON.stringify({ mealType: mt, targets: user.targets, remaining, round: rd }),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error || 'שגיאה בשרת'); setRecs(null); }
      else { setRecs(data.items || []); setRound(rd + 1); }
    } catch { setErrMsg('לא ניתן להתחבר לשרת'); setRecs(null); }
    setLoading(false);
  };

  const switchMeal = (id) => {
    setMealType(id);
    setRecs(null);
    setErrMsg('');
  };

  return (
    <div style={{ padding: '14px 18px 0' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.spark s={18} c="var(--carb)" />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>מה לאכול?</span>
          </div>
          <button onClick={() => fetchRecs(mealType, round)} disabled={loading}
            style={{ border: 'none', cursor: loading ? 'default' : 'pointer', background: 'var(--green-soft)', borderRadius: 10, padding: '7px 13px', fontSize: 13, fontWeight: 600, color: 'var(--green-deep)', fontFamily: 'var(--font-body)', opacity: loading ? 0.6 : 1 }}>
            {loading ? '…' : recs ? '🔄 עוד רעיונות' : 'רעיונות'}
          </button>
        </div>

        {/* meal type selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: (recs || loading || errMsg) ? 14 : 0 }}>
          {MEAL_TYPES.map(m => (
            <button key={m.id} onClick={() => switchMeal(m.id)} style={{
              flex: 1, border: 'none', cursor: 'pointer', borderRadius: 10, padding: '7px 4px',
              background: mealType === m.id ? 'var(--green)' : 'var(--bg)',
              color: mealType === m.id ? '#fff' : 'var(--ink-soft)',
              fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <span style={{ fontSize: 14 }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="kp-pulse" style={{ textAlign: 'center', paddingTop: 6, paddingBottom: 6, fontSize: 13.5, color: 'var(--ink-soft)' }}>
            Claude מכינה המלצות…
          </div>
        )}

        {errMsg && !loading && (
          <div style={{ background: 'var(--pink-soft)', color: 'var(--pink-deep)', borderRadius: 12, padding: '10px 14px', fontSize: 13, textAlign: 'center' }}>
            ⚠️ {errMsg}
          </div>
        )}

        {recs && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recs.length === 0 ? (
              <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-soft)', padding: '8px 0' }}>לא התקבלו המלצות, {g('נסי', 'נסה')} שוב</div>
            ) : recs.map((rec, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', borderRadius: 14, padding: '12px 14px' }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{rec.icon || '🍽️'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{rec.name}</div>
                  {rec.desc && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2, lineHeight: 1.4 }}>{rec.desc}</div>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--green-deep)', fontWeight: 700, flexShrink: 0 }}>{rec.kcal} קק״ל</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

const waterBtn = { border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, background: 'var(--water-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

Object.assign(window, { Home });
