const Auth = (() => {
  const client = () => SupabaseConfig.client;

  async function session() {
    if (!client()) return null;
    const { data, error } = await client().auth.getSession();
    if (error) throw error;
    return data.session;
  }

  function signUp({ fullName, email, password }) {
    return client().auth.signUp({
      email: email.trim().toLowerCase(), password,
      options: { data: { full_name: fullName.trim() } },
    });
  }

  function signIn(email, password) {
    return client().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  }

  function signOut() { return client().auth.signOut(); }
  function reset(email) {
    return client().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${location.origin}${location.pathname}#reset-password`,
    });
  }
  function updatePassword(password) { return client().auth.updateUser({ password }); }
  function onChange(callback) { return client()?.auth.onAuthStateChange((event, activeSession) => callback(event, activeSession)); }

  return { session, signUp, signIn, signOut, reset, updatePassword, onChange };
})();
