/* ============================================================
   Forgeline — self-managed auth.

   We store the signed-in session under OUR OWN localStorage key and
   restore it explicitly on every page. Supabase's auto-refresh, token
   rotation and cross-tab locking are all turned OFF, because those were
   what logged users out when moving between pages.

   - Sign in once -> session saved under 'fg-session'.
   - Every page -> read it back and setSession() on the client.
   - Token still valid  -> set instantly, no network, no race.
   - Token expired      -> one controlled refresh, then re-saved.
   ============================================================ */
(function(){
  var URL = window.FG_SUPABASE_URL, KEY = window.FG_SUPABASE_ANON_KEY;
  var configured = !!(URL && URL.indexOf('http') === 0 && KEY && KEY.indexOf('YOUR_') !== 0);
  var STORE = 'fg-session';
  var client = null;

  function getClient(){
    if (!client && configured && window.supabase){
      client = window.supabase.createClient(URL, KEY, {
        auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false }
      });
    }
    return client;
  }
  function save(session){
    if (session && session.access_token){
      try { localStorage.setItem(STORE, JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        email: (session.user && session.user.email) || ''
      })); } catch(e){}
    }
  }
  function clear(){ try { localStorage.removeItem(STORE); } catch(e){} }
  function read(){ try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch(e){ return null; } }

  async function restore(){
    var c = getClient(); if (!c) return null;
    var s = read(); if (!s || !s.access_token || !s.refresh_token) return null;
    try {
      // setSession sets the token instantly if valid; only refreshes if expired.
      var r = await c.auth.setSession({ access_token: s.access_token, refresh_token: s.refresh_token });
      if (r.error || !r.data || !r.data.session){ clear(); return null; }
      save(r.data.session); // persist possibly-rotated tokens
      return r.data.session;
    } catch(e){ clear(); return null; }
  }

  async function signIn(email, password){
    var c = getClient(); if (!c) return { error: { message: 'Not configured' } };
    var res = await c.auth.signInWithPassword({ email: email, password: password });
    if (!res.error && res.data && res.data.session) save(res.data.session);
    return res;
  }

  async function signOut(){
    clear();
    var c = getClient(); if (c){ try { await c.auth.signOut({ scope:'local' }); } catch(e){} }
  }

  window.FGAuth = { configured: configured, client: getClient, restore: restore, signIn: signIn, signOut: signOut };
})();
