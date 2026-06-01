/* ============================================================
   קלוריפודי — Home dashboard
   ============================================================ */
function Home({ user, day, onAddFood, onWater, onRemoveFood, onOpenProfile }) {
  const t = user.targets;
  const tot = KP.dayTotals(day);
  const remaining = Math.max(0, t.calories - tot.kcal);
  const over = tot.kcal > t.calories;

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
            <Ring size={210} stroke={20} value={tot.kcal} max={t.calories} color={over ? 'var(--pink)' : 'var(--green)'}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 50, color: 'var(--ink)', lineHeight: 1 }}>{over ? tot.kcal - t.calories : remaining}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 4 }}>{over ? 'קק״ל מעל היעד' : 'קק״ל נותרו'}</div>
            </Ring>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginTop: 18 }}>
            <Stat label="נצרכו" value={tot.kcal} />
            <div style={{ width: 1, background: 'var(--line)', margin: '4px 0' }} />
            <Stat label="יעד" value={t.calories} />
            <div style={{ width: 1, background: 'var(--line)', margin: '4px 0' }} />
            <Stat label="פעילות" value="—" />
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
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{it.qty !== 1 ? `${it.qty} × ` : ''}{it.serving} · ח{Math.round(it.p * it.qty)} פ{Math.round(it.c * it.qty)} ש{Math.round(it.f * it.qty)}</div>
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

const waterBtn = { border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, background: 'var(--water-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

Object.assign(window, { Home });
