/* ============================================================
   קלוריפודי — API client (talks to Express backend)
   ============================================================ */
const API = (() => {
  const TOKEN_KEY = 'kp_token_v2';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  function headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    const t = getToken();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }

  async function req(method, url, body) {
    const opts = { method, headers: headers() };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const r = await fetch(url, opts);
    const data = await r.json();
    if (!r.ok) {
      const err = new Error(data.error || 'שגיאה');
      err.status = r.status;
      throw err;
    }
    return data;
  }

  return {
    isLoggedIn: () => !!getToken(),
    token: getToken,
    logout: clearToken,

    async register(username, password, name) {
      const d = await req('POST', '/api/auth/register', { username, password, name });
      setToken(d.token);
      return d;
    },

    async login(username, password) {
      const d = await req('POST', '/api/auth/login', { username, password });
      setToken(d.token);
      return d;
    },

    async getUser()       { return req('GET',  '/api/user'); },
    async saveUser(data)  { return req('PUT',  '/api/user', data); },

    async getDay(date)          { return req('GET', `/api/logs/${date}`); },
    async saveDay(date, data)   { return req('PUT', `/api/logs/${date}`, data); },
    async getWeek()             { return req('GET', '/api/logs/week'); },
  };
})();

window.API = API;
