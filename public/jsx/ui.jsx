/* ============================================================
   קלוריפודי — shared UI: Ring, icons, buttons
   ============================================================ */

// ---- Circular progress ring ----
function Ring({ size = 200, stroke = 16, value = 0, max = 100, color = 'var(--green)', track = 'var(--green-soft)', children, rounded = true }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const dash = circ * pct;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap={rounded ? 'round' : 'butt'}
          style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}>{children}</div>
    </div>
  );
}

// ---- thin macro bar ----
function MacroBar({ label, value, max, color, unit = 'ג׳' }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0)) * 100;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }} dir="ltr">
          <span style={{ color: 'var(--ink)' }}>{Math.round(value)}</span>
          <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> / {max} {unit}</span>
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 8, background: 'var(--track)', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', borderRadius: 8, background: color, transition: 'width .6s cubic-bezier(.22,1,.36,1)' }} />
      </div>
    </div>
  );
}

// ---- icons ----
const Icon = {
  home: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M3 10.5L12 3l9 7.5M5 9.5V20a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V9.5" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round" strokeLinejoin="round" fill={p.fill || 'none'} /></svg>,
  chart: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round" strokeLinejoin="round" /></svg>,
  user: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><circle cx="12" cy="8" r="4" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} /><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round" /></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M12 5v14M5 12h14" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2.4} strokeLinecap="round" /></svg>,
  camera: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M3 8a2 2 0 012-2h2l1.5-2h7L18 6h1a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinejoin="round" /><circle cx="12" cy="13" r="3.5" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} /></svg>,
  search: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><circle cx="11" cy="11" r="7" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} /><path d="M20 20l-3.5-3.5" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round" /></svg>,
  edit: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M4 20h4L18 10l-4-4L4 16v4z" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinejoin="round" /><path d="M14 6l4 4" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} /></svg>,
  back: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M9 6l6 6-6 6" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2.2} strokeLinecap="round" strokeLinejoin="round" /></svg>,
  close: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M6 6l12 12M18 6L6 18" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2.2} strokeLinecap="round" /></svg>,
  drop: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M12 3c4 5 6 8 6 11a6 6 0 11-12 0c0-3 2-6 6-11z" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinejoin="round" fill={p.fill || 'none'} /></svg>,
  check: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2.4} strokeLinecap="round" strokeLinejoin="round" /></svg>,
  trash: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round" strokeLinejoin="round" /></svg>,
  spark: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill={p.c || 'currentColor'} /><path d="M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" fill={p.c || 'currentColor'} /></svg>,
  minus: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M5 12h14" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2.4} strokeLinecap="round" /></svg>,
  book: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinejoin="round" fill={p.fill || 'none'} /></svg>,
  flag: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><path d="M4 21V4" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round" /><path d="M4 4l14 4-14 5" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinejoin="round" fill={p.fill || 'none'} /></svg>,
  dumbbell: (p) => <svg viewBox="0 0 24 24" width={p.s || 24} height={p.s || 24} fill="none"><rect x="2" y="10" width="3" height="4" rx="1" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} fill={p.fill||'none'}/><rect x="19" y="10" width="3" height="4" rx="1" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} fill={p.fill||'none'}/><rect x="5" y="8" width="2.5" height="8" rx="1" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} fill={p.fill||'none'}/><rect x="16.5" y="8" width="2.5" height="8" rx="1" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} fill={p.fill||'none'}/><line x1="7.5" y1="12" x2="16.5" y2="12" stroke={p.c || 'currentColor'} strokeWidth={p.w || 2} strokeLinecap="round"/></svg>,
};

// ---- primary button ----
function Btn({ children, onClick, variant = 'primary', disabled, style = {} }) {
  const base = {
    border: 'none', borderRadius: 18, fontFamily: 'var(--font-body)', fontWeight: 600,
    fontSize: 17, padding: '16px 22px', cursor: disabled ? 'default' : 'pointer',
    width: '100%', transition: 'transform .12s, opacity .2s', opacity: disabled ? 0.45 : 1,
    WebkitTapHighlightColor: 'transparent',
  };
  const variants = {
    primary: { background: 'var(--green)', color: '#fff', boxShadow: '0 8px 20px -6px var(--green-shadow)' },
    pink: { background: 'var(--pink)', color: '#fff', boxShadow: '0 8px 20px -6px rgba(217,116,141,.5)' },
    ghost: { background: 'var(--card)', color: 'var(--ink)', boxShadow: 'inset 0 0 0 1.5px var(--line)' },
    soft: { background: 'var(--green-soft)', color: 'var(--green-deep)' },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(.97)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >{children}</button>
  );
}

// ---- card ----
function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--card)', borderRadius: 24, padding: 18,
      boxShadow: '0 2px 14px -8px rgba(120,90,70,.25)', ...style,
    }}>{children}</div>
  );
}

// Gender-aware text helper: G(user.gender, 'נקבה', 'זכר')
function G(gender, fem, masc) { return gender === 'male' ? masc : fem; }

Object.assign(window, { Ring, MacroBar, Icon, Btn, Card, G });
