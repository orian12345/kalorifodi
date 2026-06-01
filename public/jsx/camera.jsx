/* ============================================================
   קלוריפודי — Camera/AI tab + food confirm panel
   ============================================================ */

// downscale an image File to a small jpeg base64 (for the vision API)
function fileToScaledB64(file, maxDim = 768) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        width = Math.round(width * scale); height = Math.round(height * scale);
        const cv = document.createElement('canvas');
        cv.width = width; cv.height = height;
        cv.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve({ b64: cv.toDataURL('image/jpeg', 0.82).split(',')[1], preview: cv.toDataURL('image/jpeg', 0.7) });
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseItems(text) {
  let s = (text || '').trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf('{'); const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  try {
    const obj = JSON.parse(s);
    const items = Array.isArray(obj) ? obj : obj.items || [];
    return items.map(it => ({
      name: String(it.name || 'מאכל'),
      serving: String(it.serving || 'מנה'),
      icon: it.icon || '🍽️',
      kcal: Math.round(+it.kcal || 0),
      p: Math.round(+it.p || 0), c: Math.round(+it.c || 0), f: Math.round(+it.f || 0),
    })).filter(it => it.kcal > 0);
  } catch (e) { return null; }
}

function CameraTab({ onPick, onAdd, defaultMeal, onClose }) {
  const [status, setStatus] = React.useState('idle'); // idle|loading|done|error
  const [preview, setPreview] = React.useState(null);
  const [items, setItems] = React.useState([]);
  const [err, setErr] = React.useState('');
  const fileRef = React.useRef(null);
  const galRef = React.useRef(null);

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setErr(''); setStatus('loading'); setItems([]);
    try {
      const { b64, preview } = await fileToScaledB64(file);
      setPreview(preview);
      const res = await window.claude.complete({
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
          { type: 'text', text: 'אתה דיאטן מומחה. זהה את כל פריטי המזון בתמונה והערך את הכמות. החזר JSON תקין בלבד ללא טקסט נוסף, במבנה המדויק: {"items":[{"name":"שם המאכל בעברית","serving":"תיאור הכמות בעברית","icon":"אימוג׳י מזון אחד","kcal":מספר_שלם,"p":גרם_חלבון,"c":גרם_פחמימה,"f":גרם_שומן}]}. הערך ערכים ריאליים לכל מנה שנראית בצלחת. אם אין מזון, החזר {"items":[]}.' },
        ]}],
      });
      const parsed = parseItems(res);
      if (parsed === null) { setStatus('error'); setErr('לא הצלחנו לקרוא את התשובה. נסי שוב או הזיני ידנית.'); return; }
      if (parsed.length === 0) { setStatus('error'); setErr('לא זוהה מזון בתמונה. נסי תמונה ברורה יותר או הזיני ידנית.'); return; }
      setItems(parsed); setStatus('done');
    } catch (e) {
      setStatus('error'); setErr('הזיהוי נכשל. בדקי חיבור ונסי שוב, או הזיני ידנית.');
    }
    e.target.value = '';
  }

  const addAll = () => { items.forEach(it => onAdd({ ...it, qty: 1, meal: defaultMeal })); onClose(); };
  const total = items.reduce((s, it) => s + it.kcal, 0);

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {preview && <img src={preview} alt="" style={{ width: '100%', maxHeight: 230, objectFit: 'cover', borderRadius: 20, marginBottom: 22 }} />}
        <div className="kp-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--green-deep)', fontSize: 16, fontWeight: 600 }}>
          <Icon.spark s={22} c="var(--green)" /> מנתחים את הצלחת…
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 8 }}>הבינה המלאכותית מזהה את המאכלים ומעריכה ערכים תזונתיים</p>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div>
        {preview && <img src={preview} alt="" style={{ width: '100%', maxHeight: 190, objectFit: 'cover', borderRadius: 20, marginBottom: 8 }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '12px 2px 12px', color: 'var(--green-deep)', fontSize: 14.5, fontWeight: 600 }}>
          <Icon.spark s={18} c="var(--green)" /> זוהו {items.length} פריטים · {total} קק״ל
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((it, i) => (
            <button key={i} onClick={() => onPick(it)} style={searchRow}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>{it.icon}</div>
              <div style={{ flex: 1, textAlign: 'start' }}>
                <div style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--ink)' }}>{it.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{it.serving} · {it.kcal} קק״ל · ח{it.p} פ{it.c} ש{it.f}</div>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.edit s={16} c="var(--green-deep)" /></div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <Btn onClick={addAll}>הוספת הכול ({items.length})</Btn>
          <button onClick={() => { setStatus('idle'); setPreview(null); }} style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--ink-soft)', fontSize: 14.5, padding: '14px 0 0', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>צילום חדש</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 6, lineHeight: 1.5 }}>הערכים הם הערכה אוטומטית — אפשר לערוך בלחיצה על פריט</p>
      </div>
    );
  }

  // idle / error
  return (
    <div style={{ textAlign: 'center', padding: '6px 0' }}>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
      <input ref={galRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <div style={{ background: 'var(--green-soft)', borderRadius: 24, padding: '34px 20px', marginBottom: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: 24, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 6px 18px -10px rgba(0,0,0,.3)' }}>
          <Icon.camera s={34} c="var(--green)" />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--green-deep)' }}>צלמי את הצלחת</div>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '6px auto 0', maxWidth: 250, lineHeight: 1.5 }}>הבינה המלאכותית תזהה את המאכלים ותחשב קלוריות ומאקרו אוטומטית</p>
      </div>
      {err && <div style={{ background: 'var(--pink-soft)', color: 'var(--pink-deep)', borderRadius: 14, padding: '12px 14px', fontSize: 13.5, marginBottom: 14, lineHeight: 1.5 }}>{err}</div>}
      <Btn onClick={() => fileRef.current.click()}>פתיחת מצלמה</Btn>
      <div style={{ height: 10 }} />
      <Btn variant="ghost" onClick={() => galRef.current.click()}>בחירה מהגלריה</Btn>
    </div>
  );
}

// ---------- confirm qty + meal ----------
function FoodConfirm({ base, defaultMeal, onCancel, onConfirm }) {
  const [qty, setQty] = React.useState(1);
  const [meal, setMeal] = React.useState(defaultMeal || 'breakfast');
  const k = Math.round(base.kcal * qty);
  const step = (d) => setQty(q => Math.max(0.5, Math.round((q + d) * 2) / 2));

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 120, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(60,40,35,.4)' }} />
      <div style={{ marginTop: 'auto', position: 'relative', background: 'var(--bg)', borderRadius: '28px 28px 0 0', padding: '22px 22px 38px', boxShadow: '0 -10px 40px rgba(0,0,0,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{base.icon || '🍽️'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{base.name}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>{base.serving}</div>
          </div>
        </div>

        {/* qty stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', borderRadius: 18, padding: '12px 16px', marginBottom: 14 }}>
          <span style={{ fontSize: 15.5, color: 'var(--ink)', fontWeight: 500 }}>כמות מנות</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => step(-0.5)} style={stepBtn}><Icon.minus s={20} c="var(--green-deep)" /></button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', minWidth: 36, textAlign: 'center' }}>{qty}</span>
            <button onClick={() => step(0.5)} style={stepBtn}><Icon.plus s={20} c="var(--green-deep)" /></button>
          </div>
        </div>

        {/* meal select */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 16 }}>
          {KP.MEALS.map(m => {
            const on = meal === m.id;
            return (
              <button key={m.id} onClick={() => setMeal(m.id)} style={{
                flex: 1, border: 'none', cursor: 'pointer', borderRadius: 14, padding: '10px 0',
                background: on ? 'var(--green)' : 'var(--card)', color: on ? '#fff' : 'var(--ink-soft)',
                fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all .2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}>
                <span style={{ fontSize: 17 }}>{m.icon}</span>{m.label.replace('ארוחת ', '')}
              </button>
            );
          })}
        </div>

        {/* nutrition summary */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[['קלוריות', k, 'var(--green)'], ['חלבון', Math.round(base.p * qty) + 'ג', 'var(--pink)'], ['פחמ׳', Math.round(base.c * qty) + 'ג', 'var(--carb)'], ['שומן', Math.round(base.f * qty) + 'ג', 'var(--fat)']].map(([l, v, c]) => (
            <div key={l} style={{ flex: 1, background: 'var(--card)', borderRadius: 14, padding: '10px 4px', textAlign: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: 3, background: c, margin: '0 auto 5px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{l}</div>
            </div>
          ))}
        </div>

        <Btn onClick={() => onConfirm({ name: base.name, icon: base.icon || '🍽️', serving: base.serving, kcal: base.kcal, p: base.p, c: base.c, f: base.f, qty, meal })}>הוספה ליומן</Btn>
      </div>
    </div>
  );
}

const stepBtn = { border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: 12, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' };

Object.assign(window, { CameraTab, FoodConfirm });
