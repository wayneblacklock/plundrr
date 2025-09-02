'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // try current session on mount
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    // keep in sync while browsing
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (!email) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Account</h1>
        <p>Not signed in. <a href="/login">Sign in</a></p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Account</h1>
      <p>Signed in as <strong>{email}</strong></p>
      <button onClick={signOut} style={{ padding: '8px 12px', marginTop: 12 }}>
        Sign out
      </button>
    </main>
  );
}
