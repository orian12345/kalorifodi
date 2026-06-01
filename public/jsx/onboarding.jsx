/* ============================================================
   קלוריפודי — Onboarding / registration flow
   ============================================================ */
function Onboarding({ onComplete }) {
  const [step, setStep] = React.useState(0);
  const [p, setP] = React.useState({
    name: '', gender: 'female', age: 28, height: 165, weight: 65,
    activity: 'light', goal: 'maintain',
  });
  const set = (k, v) => setP(s => ({ ...s, [k]: v }));
  const TOTAL = 6; // steps 1..6 (0 is welcome)

  const targets = KP.calcTargets(p);
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const finish = () => {
    const user = { ...p, targets, createdAt: Date.now() };
    onComplete(user);
  };

  // ----- welcome -----
  if (step === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center', background: 'var(--bg)' }}>
        <Logo size={92} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--ink)', margin: '24px 0 0', letterSpacing: '-.5px' }}>קלוריפודי</h1>
        <p style={{ fontSize: 17, color: 'var(--ink-soft)', lineHeight: 1.6, margin: '12px 0 0', maxWidth: 280 }}>
          המעקב התזונתי הרך שלך.<br />מצלמים, מזינים — ואנחנו סופרים.
        </p>
        <div style={{ display: 'flex', gap: 10, margin: '32px 0' }}>
          {['🥑', '🍓', '💧', '✨'].map(e => (
            <div key={e} style={{ width: 52, height: 52, borderRadius: 18, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 4px 14px -8px rgba(120,90,70,.3)' }}>{e}</div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 46, left: 24, right: 24 }}>
          <Btn onClick={next}>בואי נתחיל</Btn>
        </div>
      </div>
    );
  }

  // ----- shared shell -----
  const Shell = ({ title, sub, children, canNext, onNext, cta = 'המשך' }) => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '52px 24px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={back} style={{ background: 'var(--card)', border: 'none', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px -5px rgba(0,0,0,.3)' }}>
          <Icon.back s={20} c="var(--ink)" />
        </button>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 6, background: i < step ? 'var(--green)' : 'var(--track)', transition: 'background .3s' }} />
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 24px 0' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: '-.4px' }}>{title}</h2>
        {sub && <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: '8px 0 0', lineHeight: 1.5 }}>{sub}</p>}
        <div style={{ marginTop: 26 }}>{children}</div>
      </div>
      <div style={{ padding: '12px 24px 40px' }}>
        <Btn onClick={onNext} disabled={!canNext}>{cta}</Btn>
      </div>
    </div>
  );

  // step 1: name
  if (step === 1) {
    return (
      <Shell title="איך לקרוא לך?" sub="כדי שנוכל לתת לך חוויה אישית" canNext={p.name.trim().length > 0} onNext={next}>
        <input
          autoFocus value={p.name} onChange={e => set('name', e.target.value)}
          placeholder="השם שלך"
          style={{ width: '100%', boxSizing: 'border-box', border: 'none', background: 'var(--card)', borderRadius: 18, padding: '18px 20px', fontSize: 19, fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none', boxShadow: 'inset 0 0 0 1.5px var(--line)' }}
        />
      </Shell>
    );
  }

  // step 2: gender
  if (step === 2) {
    const opts = [{ id: 'female', label: 'אישה', emoji: '👩' }, { id: 'male', label: 'גבר', emoji: '👨' }];
    return (
      <Shell title="מה המגדר שלך?" sub="משפיע על חישוב הצריכה הקלורית" canNext onNext={next}>
        <div style={{ display: 'flex', gap: 14 }}>
          {opts.map(o => {
            const on = p.gender === o.id;
            return (
              <button key={o.id} onClick={() => set('gender', o.id)} style={{
                flex: 1, border: 'none', cursor: 'pointer', borderRadius: 22, padding: '28px 0',
                background: on ? 'var(--green-soft)' : 'var(--card)',
                boxShadow: on ? 'inset 0 0 0 2px var(--green)' : 'inset 0 0 0 1.5px var(--line)',
                transition: 'all .2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 38 }}>{o.emoji}</span>
                <span style={{ fontSize: 17, fontWeight: 600, color: on ? 'var(--green-deep)' : 'var(--ink)', fontFamily: 'var(--font-body)' }}>{o.label}</span>
              </button>
            );
          })}
        </div>
      </Shell>
    );
  }

  // step 3: body metrics
  if (step === 3) {
    const Metric = ({ label, k, min, max, unit, step = 1 }) => (
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 16, color: 'var(--ink)', fontWeight: 500 }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--green-deep)' }}>{p[k]}<span style={{ fontSize: 14, color: 'var(--ink-soft)', marginInlineStart: 4 }}>{unit}</span></span>
        </div>
        <input type="range" min={min} max={max} step={step} value={p[k]} onChange={e => set(k, +e.target.value)} className="kp-slider" />
      </div>
    );
    return (
      <Shell title="קצת נתונים עלייך" sub="הזיני גיל, גובה ומשקל מדויקים ככל האפשר" canNext onNext={next}>
        <Metric label="גיל" k="age" min={14} max={90} unit="שנים" />
        <Metric label="גובה" k="height" min={130} max={210} unit='ס״מ' />
        <Metric label="משקל" k="weight" min={35} max={160} unit='ק״ג' />
      </Shell>
    );
  }

  // step 4: activity
  if (step === 4) {
    return (
      <Shell title="כמה את פעילה?" sub="רמת הפעילות היומיומית שלך" canNext onNext={next}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {KP.ACTIVITY.map(a => {
            const on = p.activity === a.id;
            return (
              <button key={a.id} onClick={() => set('activity', a.id)} style={{
                border: 'none', cursor: 'pointer', textAlign: 'start', borderRadius: 18, padding: '15px 18px',
                background: on ? 'var(--green-soft)' : 'var(--card)',
                boxShadow: on ? 'inset 0 0 0 2px var(--green)' : 'inset 0 0 0 1.5px var(--line)',
                transition: 'all .2s',
              }}>
                <div style={{ fontSize: 16.5, fontWeight: 600, color: on ? 'var(--green-deep)' : 'var(--ink)', fontFamily: 'var(--font-body)' }}>{a.label}</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 2 }}>{a.desc}</div>
              </button>
            );
          })}
        </div>
      </Shell>
    );
  }

  // step 5: goal
  if (step === 5) {
    return (
      <Shell title="מה המטרה שלך?" sub="נתאים את היעד הקלורי בהתאם" canNext onNext={next}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {KP.GOALS.map(g => {
            const on = p.goal === g.id;
            return (
              <button key={g.id} onClick={() => set('goal', g.id)} style={{
                border: 'none', cursor: 'pointer', textAlign: 'start', borderRadius: 20, padding: '18px 18px',
                background: on ? 'var(--pink-soft)' : 'var(--card)',
                boxShadow: on ? 'inset 0 0 0 2px var(--pink)' : 'inset 0 0 0 1.5px var(--line)',
                transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <span style={{ fontSize: 30 }}>{g.emoji}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: on ? 'var(--pink-deep)' : 'var(--ink)', fontFamily: 'var(--font-body)' }}>{g.label}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 2 }}>{g.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Shell>
    );
  }

  // step 6: targets reveal
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '70px 24px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>✨</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 27, color: 'var(--ink)', margin: '10px 0 0', letterSpacing: '-.4px' }}>היעדים היומיים שלך, {p.name}</h2>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', margin: '8px 0 24px' }}>חושב לפי הנתונים והמטרה שלך</p>

        <Card style={{ padding: 24, marginBottom: 14 }}>
          <div style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 500 }}>קלוריות ליום</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: 'var(--green-deep)', lineHeight: 1.1 }}>{targets.calories}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>קק״ל</div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'חלבון', v: targets.protein, u: 'ג׳', c: 'var(--pink)' },
            { label: 'פחמימות', v: targets.carbs, u: 'ג׳', c: 'var(--carb)' },
            { label: 'שומן', v: targets.fat, u: 'ג׳', c: 'var(--fat)' },
            { label: 'מים', v: (targets.water / 1000).toFixed(1), u: 'ליטר', c: 'var(--water)' },
          ].map(m => (
            <Card key={m.label} style={{ padding: 16, textAlign: 'start' }}>
              <div style={{ width: 10, height: 10, borderRadius: 4, background: m.c, marginBottom: 8 }} />
              <div style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)' }}>{m.v}<span style={{ fontSize: 13, color: 'var(--ink-soft)', marginInlineStart: 3 }}>{m.u}</span></div>
            </Card>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '18px 6px 0', lineHeight: 1.5 }}>היעדים הם הערכה כללית ואינם מהווים ייעוץ רפואי. אפשר לשנות בכל עת בהגדרות.</p>
      </div>
      <div style={{ padding: '12px 24px 40px' }}>
        <Btn onClick={finish}>מתחילים! 🎉</Btn>
      </div>
    </div>
  );
}

// ---- avocado-heart logo ----
function Logo({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M50 12c-18 0-30 14-30 34 0 22 16 38 30 42 14-4 30-20 30-42 0-20-12-34-30-34z" fill="var(--green-soft)" />
      <path d="M50 20c-13 0-22 10-22 26 0 17 12 29 22 33 10-4 22-16 22-33 0-16-9-26-22-26z" fill="var(--green)" />
      <circle cx="50" cy="52" r="15" fill="var(--pink-soft)" />
      <circle cx="50" cy="52" r="9" fill="var(--pink)" />
    </svg>
  );
}

Object.assign(window, { Onboarding, Logo });
