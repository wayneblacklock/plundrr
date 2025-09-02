'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }, // returns to "/"
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', maxWidth: 420 }}>
      <h1>Sign in</h1>
      {sent ? (
        <p>Check your email for a magic link to sign in.</p>
      ) : (
        <form onSubmit={onSubmit}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 8, width: '100%', margin: '12px 0' }}
          />
          <button type="submit" style={{ padding: '8px 12px' }}>Send magic link</button>
          {error && <p style={{ color: 'crimson' }}>{error}</p>}
        </form>
      )}
    </main>
  );
}
