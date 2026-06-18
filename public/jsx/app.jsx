/* ============================================================
   קלוריפודי — Root app (auth gate + API persistence)
   ============================================================ */

function App() {
  // gate: 'loading' | 'auth' | 'onboarding' | 'app'
  const [gate, setGate]   = React.useState('loading');
  const [user, setUser]   = React.useState(null);
  const [logs, setLogs]   = React.useState({});
  const [tab,  setTab]    = React.useState('home');
  const [addMeal, setAddMeal] = React.useState(null);

  const today = KP.TODAY();

  const PROFILE_KEY = 'kp_profile_cache_v1';

  // ── bootstrap ──────────────────────────────────────────
  React.useEffect(() => {
    if (!API.isLoggedIn()) { setGate('auth'); return; }
    API.getUser()
      .then(data => {
        if (!data.profile) { setGate('onboarding'); return null; }
        setUser(data.profile);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
        return API.getWeek();
      })
      .then(week => {
        if (week) { setLogs(week); setGate('app'); }
      })
      .catch(e => {
        // 401/404 = bad token or account deleted → force re-login
        if (!e.status || e.status === 401 || e.status === 404) {
          API.logout();
          localStorage.removeItem(PROFILE_KEY);
          setGate('auth');
          return;
        }
        // Server temporarily unavailable → use cached profile if available
        const cached = localStorage.getItem(PROFILE_KEY);
        if (cached) { setUser(JSON.parse(cached)); setGate('app'); }
        else { API.logout(); setGate('auth'); }
      });
  }, []);

  // ── auth success ───────────────────────────────────────
  const onAuthSuccess = (data) => {
    if (!data.hasProfile) { setGate('onboarding'); }
    else {
      API.getUser().then(u => {
        setUser(u.profile);
        return API.getWeek();
      }).then(week => { setLogs(week || {}); setGate('app'); });
    }
  };

  // ── onboarding complete ────────────────────────────────
  const onOnboardingComplete = (u) => {
    API.saveUser(u).then(() => {
      setUser(u);
      return API.getWeek();
    }).then(week => { setLogs(week || {}); setGate('app'); });
  };

  // ── day mutations (sync to API) ────────────────────────
  const day = logs[today] || KP.emptyDay();

  const mutateDay = (fn) => {
    setLogs(prev => {
      const d = prev[today]
        ? { ...prev[today], foods: [...(prev[today].foods || [])] }
        : KP.emptyDay();
      fn(d);
      const next = { ...prev, [today]: d };
      API.saveDay(today, d).catch(() => {}); // fire-and-forget
      return next;
    });
  };

  const addFood      = (item) => mutateDay(d => d.foods.push({ ...item, ts: Date.now() }));
  const removeFood   = (i)    => mutateDay(d => d.foods.splice(i, 1));
  const changeWater  = (delta)=> mutateDay(d => { d.water = Math.max(0, (d.water || 0) + delta); });
  const addWorkout   = (w)    => mutateDay(d => { d.workouts = [...(d.workouts || []), w]; });

  const smartMeal = () => {
    const h = new Date().getHours();
    return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 21 ? 'dinner' : 'snack';
  };

  // ── profile update ─────────────────────────────────────
  const updateUser = (u) => {
    setUser(u);
    API.saveUser(u).catch(() => {});
  };

  // ── reset ──────────────────────────────────────────────
  const reset = () => {
    if (!window.confirm('לצאת מהחשבון ולאפס את כל הנתונים?')) return;
    API.logout();
    localStorage.removeItem(PROFILE_KEY);
    setUser(null); setLogs({}); setTab('home'); setGate('auth');
  };

  // ── render gates ───────────────────────────────────────
  if (gate === 'loading') return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <Logo size={72} />
        <div style={{ marginTop: 16, fontSize: 15, color: 'var(--ink-soft)' }} className="kp-pulse">טוען…</div>
      </div>
    </div>
  );

  if (gate === 'auth')       return <Auth onSuccess={onAuthSuccess} />;
  if (gate === 'onboarding') return <Onboarding onComplete={onOnboardingComplete} />;

  // ── main app ───────────────────────────────────────────
  return (
    <div style={{ height: '100%', position: 'relative', background: 'var(--bg)' }}>
      {tab === 'home'     && <Home     user={user} day={day} onAddFood={m => setAddMeal(m)} onWater={changeWater} onRemoveFood={removeFood} onOpenProfile={() => setTab('profile')} />}
      {tab === 'history'  && <History  user={user} logs={logs} />}
      {tab === 'workouts' && <Workouts user={user} logs={logs} onAddWorkout={addWorkout} onUpdate={updateUser} />}
      {tab === 'recipes'  && <Recipes />}
      {tab === 'profile'  && <Profile  user={user} logs={logs} onUpdate={updateUser} onReset={reset} />}

      {/* bottom nav */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg) 55%, transparent)', height: 110, top: 'auto', bottom: 0 }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 24px 30px', pointerEvents: 'auto' }}>
          <NavBtn icon={Icon.home}     label="בית"      on={tab === 'home'}     onClick={() => setTab('home')} />
          <NavBtn icon={Icon.chart}    label="היסטוריה" on={tab === 'history'}  onClick={() => setTab('history')} />
          <AddBtn onClick={() => setAddMeal(smartMeal())} />
          <NavBtn icon={Icon.dumbbell} label="אימונים"  on={tab === 'workouts'} onClick={() => setTab('workouts')} />
          <NavBtn icon={Icon.user}     label="פרופיל"   on={tab === 'profile'}  onClick={() => setTab('profile')} />
        </div>
      </div>

      {addMeal && <AddFood user={user} defaultMeal={addMeal} onClose={() => setAddMeal(null)} onAdd={addFood} />}
    </div>
  );
}

function NavBtn({ icon: I, label, on, onClick }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 4px', width: 56 }}>
      <I s={25} c={on ? 'var(--green-deep)' : 'var(--ink-soft)'} w={on ? 2.3 : 2} fill={on ? 'var(--green-soft)' : 'none'} />
      <span style={{ fontSize: 11, color: on ? 'var(--green-deep)' : 'var(--ink-soft)', fontWeight: on ? 700 : 500 }}>{label}</span>
    </button>
  );
}

function AddBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      border: 'none', cursor: 'pointer', width: 60, height: 60, borderRadius: 22,
      background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 10px 24px -6px var(--green-shadow)', marginBottom: 6, transition: 'transform .12s',
    }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(.92)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Icon.plus s={30} c="#fff" w={2.6} />
    </button>
  );
}

function Root() {
  return (
    <div style={{ width: '100%', height: '100dvh', overflow: 'hidden', background: 'var(--bg)' }}>
      <App />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<Root />);
