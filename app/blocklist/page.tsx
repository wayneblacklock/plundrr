'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Row = {
  seller_id: string;
  created_at: string;
};

export default function BlocklistPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [seller, setSeller] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const fetchRows = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from('user_blocklist')
      .select('seller_id, created_at')
      .order('created_at', { ascending: false });
    if (error) setErr(error.message);
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, [email]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const seller_id = seller.trim().toLowerCase();
    if (!seller_id) return;

    // fetch current user id for insert (RLS needs user_id match)
    const { data: auth } = await supabase.auth.getUser();
    const user_id = auth.user?.id;
    if (!user_id) {
      setErr('Please sign in first.');
      return;
    }

    const { error } = await supabase.from('user_blocklist').insert({ user_id, seller_id });
    if (error) {
      // handle duplicate key gracefully
      if (error.code === '23505') {
        setErr('Seller is already blocked.');
      } else {
        setErr(error.message);
      }
    } else {
      setSeller('');
      fetchRows();
    }
  };

  const onDelete = async (seller_id: string) => {
    setErr(null);
    const { error } = await supabase.from('user_blocklist').delete().eq('seller_id', seller_id);
    if (error) setErr(error.message);
    else setRows((r) => r.filter((x) => x.seller_id !== seller_id));
  };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Blocked sellers</h1>
      {!email ? (
        <p>Not signed in. <a href="/login">Sign in</a></p>
      ) : (
        <p>Signed in as <strong>{email}</strong></p>
      )}

      <section style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Add a seller</h2>
        <form onSubmit={onAdd}>
          <input
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            placeholder="seller username (e.g. pokecards123)"
            style={{ padding: 8, width: '100%', margin: '6px 0 12px' }}
          />
          <button type="submit" style={{ padding: '8px 12px' }}>Block seller</button>
          {err && <p style={{ color: 'crimson' }}>{err}</p>}
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Your blocklist</h2>
        {loading ? (
          <p>Loading…</p>
        ) : rows.length === 0 ? (
          <p>No blocked sellers yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {rows.map((r) => (
              <li key={r.seller_id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{r.seller_id}</strong>
                    <div style={{ fontSize: 12, color: '#555' }}>added {new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <button onClick={() => onDelete(r.seller_id)} style={{ color: 'crimson' }}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
