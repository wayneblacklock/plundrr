'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const [msg, setMsg] = useState('Completing sign-in...');

  useEffect(() => {
    // Supabase JS will parse the hash and persist the session because
    // we set detectSessionInUrl: true in the client config.
    // We just need to ensure this runs on a client page.
    const run = async () => {
      // give the client a tick to process the URL hash
      await new Promise(r => setTimeout(r, 50));
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setMsg('Signed in! Redirecting…');
        window.location.replace('/account');
      } else {
        setMsg('Could not complete sign-in. Try again.');
        // Optionally dump hash errors or send back to /login
        setTimeout(() => window.location.replace('/login'), 800);
      }
    };
    run();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>{msg}</h1>
    </main>
  );
}
