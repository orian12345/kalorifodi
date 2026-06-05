/* ============================================================
   קלוריפודי — Auth screen (כניסה + הרשמה)
   ============================================================ */
function Auth({ onSuccess }) {
  const [mode, setMode]         = React.useState('login'); // 'login' | 'register'
  const [name, setName]         = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading]   = React.useState(false);
  const [err, setErr]           = React.useState('');

  const reset = () => { setErr(''); setName(''); setUsername(''); setPassword(''); };
  const switchMode = (m) => { setMode(m); reset(); };

  const doLogin = async () => {
    if (!username || !password) { setErr('אנא מלאי שם משתמש וסיסמה'); return; }
    setErr(''); setLoading(true);
    try {
      const d = await API.login(username.trim(), password);
      onSuccess(d);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const doRegister = async () => {
    if (!name.trim() || !username || !password) { setErr('אנא מלאי את כל השדות'); return; }
    if (username.trim().length < 3) { setErr('שם משתמש חייב להכיל לפחות 3 תווים'); return; }
    if (password.length < 4) { setErr('סיסמה חייבת להכיל לפחות 4 תווים'); return; }
    setErr(''); setLoading(true);
    try {
      const d = await API.register(username.trim(), password, name.trim());
      onSuccess(d);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const inp = (val, set, opts = {}) => (
    <input
      value={val}
      onChange={e => { setErr(''); set(e.target.value); }}
      onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? doLogin() : doRegister())}
      style={{
        width: '100%', boxSizing: 'border-box', border: 'none',
        background: 'var(--bg)', borderRadius: 16, padding: '15px 18px',
        fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--ink)',
        outline: 'none', boxShadow: 'inset 0 0 0 1.5px var(--line)',
        marginBottom: 12,
      }}
      {...opts}
    />
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '0 28px' }}>
      <Logo size={72} />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--ink)', margin: '14px 0 4px', letterSpacing: '-.5px' }}>
        קלוריפודי
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28 }}>
        מעקב תזונה אישי ומותאם
      </p>

      {/* mode toggle */}
      <div style={{ display: 'flex', background: 'var(--track)', borderRadius: 14, padding: 4, marginBottom: 24, width: '100%' }}>
        {[['login','כניסה'],['register','הרשמה']].map(([m, label]) => (
          <button key={m} onClick={() => switchMode(m)} style={{
            flex: 1, border: 'none', cursor: 'pointer', borderRadius: 10,
            padding: '10px 0', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)',
            background: mode === m ? 'var(--card)' : 'transparent',
            color: mode === m ? 'var(--green-deep)' : 'var(--ink-soft)',
            boxShadow: mode === m ? '0 2px 8px -4px rgba(0,0,0,.15)' : 'none',
            transition: 'all .2s',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ width: '100%' }}>
        {mode === 'register' && inp(name, setName, { placeholder: 'שם מלא', autoFocus: true, autoComplete: 'name' })}
        {inp(username, setUsername, { placeholder: 'שם משתמש', autoFocus: mode === 'login', autoComplete: 'username' })}
        {inp(password, setPassword, { placeholder: 'סיסמה (לפחות 4 תווים)', type: 'password', autoComplete: mode === 'login' ? 'current-password' : 'new-password' })}

        {err && (
          <div style={{ background: 'var(--pink-soft)', color: 'var(--pink-deep)', borderRadius: 12, padding: '10px 14px', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>
            ⚠️ {err}
          </div>
        )}

        <Btn onClick={mode === 'login' ? doLogin : doRegister} disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'כניסה 🚀' : 'הרשמה ✨'}
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, { Auth });
