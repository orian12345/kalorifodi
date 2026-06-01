/* ============================================================
   קלוריפודי — Auth screen (כניסה בלבד, ללא הרשמה ציבורית)
   ============================================================ */
function Auth({ onSuccess }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading,  setLoading]  = React.useState(false);
  const [err,      setErr]      = React.useState('');

  const doLogin = async () => {
    if (!username || !password) { setErr('אנא מלאי שם משתמש וסיסמה'); return; }
    setErr(''); setLoading(true);
    try {
      const d = await API.login(username.trim(), password);
      onSuccess(d);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = (val, set, opts = {}) => (
    <input
      value={val}
      onChange={e => { setErr(''); set(e.target.value); }}
      onKeyDown={e => e.key === 'Enter' && doLogin()}
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
      <Logo size={80} />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--ink)', margin: '16px 0 6px', letterSpacing: '-.5px' }}>
        קלוריפודי
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-soft)', marginBottom: 36 }}>
        מעקב תזונה אישי ומותאם
      </p>

      <div style={{ width: '100%' }}>
        {inp(username, setUsername, { placeholder: 'שם משתמש', autoFocus: true, autoComplete: 'username' })}
        {inp(password, setPassword, { placeholder: 'סיסמה', type: 'password', autoComplete: 'current-password' })}

        {err && (
          <div style={{ background: 'var(--pink-soft)', color: 'var(--pink-deep)', borderRadius: 12, padding: '10px 14px', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>
            ⚠️ {err}
          </div>
        )}

        <Btn onClick={doLogin} disabled={loading}>
          {loading ? '...' : 'כניסה 🚀'}
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, { Auth });
