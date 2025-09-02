'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type SearchRow = {
  id: string;
  name: string;
  terms: string[];
  excludes: string[];
  strict_title: boolean;
  active: boolean;
  created_at: string;
};

export default function SearchesPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [terms, setTerms] = useState('');     // comma-separated
  const [excludes, setExcludes] = useState('reprint, proxy, lot, bundle'); // sensible default
  const [strict, setStrict] = useState(true);
  const [active, setActive] = useState(true);

  const [rows, setRows] = useState<SearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // load session
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setEmail(u?.email ?? null);
      setUserId(u?.id ?? null);
    });
  }, []);

  const fetchRows = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from('searches')
      .select('id,name,terms,excludes,strict_title,active,created_at')
      .order('created_at', { ascending: false });
    if (error) setErr(error.message);
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, [email]);

  const toArray = (s: string) =>
    s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!userId) {
      setErr('Please sign in first.');
      return;
    }
    const payload = {
      user_id: userId,
      name: name || 'Untitled',
      terms: toArray(terms),
      excludes: toArray(excludes),
      strict_title: strict,
      active,
    };
    const { error } = await supabase.from('searches').insert(payload);
    if (error) setErr(error.message);
    else {
      setName('');
      setTerms('');
      await fetchRows();
    }
  };

  const onDelete = async (id: string) => {
    setErr(null);
    const { error } = await supabase.from('searches').delete().eq('id', id);
    if (error) setErr(error.message);
    else setRows((r) => r.filter((x) => x.id !== id));
  };

  const onToggleActive = async (id: string, next: boolean) => {
    setErr(null);
    const { error } = await supabase.from('searches').update({ active: next }).eq('id', id);
    if (error) setErr(error.message);
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, active: next } : x)));
  };

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Searches</h1>
      {!email ? (
        <p>Not signed in. <a href="/login">Sign in</a></p>
      ) : (
        <p>Signed in as <strong>{email}</strong></p>
      )}

      <section style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Create a search</h2>
        <form onSubmit={onCreate}>
          <label>
            Name
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Moltres plushes"
              style={{ display:'block', width:'100%', padding:8, margin:'6px 0 12px' }} />
          </label>

          <label>
            Terms (comma-separated)
            <input value={terms} onChange={(e)=>setTerms(e.target.value)} placeholder="moltres, plush"
              style={{ display:'block', width:'100%', padding:8, margin:'6px 0 12px' }} />
          </label>

          <label>
            Excludes (comma-separated)
            <input value={excludes} onChange={(e)=>setExcludes(e.target.value)}
              style={{ display:'block', width:'100%', padding:8, margin:'6px 0 12px' }} />
          </label>

          <label style={{ display:'block', margin:'6px 0' }}>
            <input type="checkbox" checked={strict} onChange={(e)=>setStrict(e.target.checked)} /> Title-only strict
          </label>

          <label style={{ display:'block', margin:'6px 0 12px' }}>
            <input type="checkbox" checked={active} onChange={(e)=>setActive(e.target.checked)} /> Active
          </label>

          <button type="submit" style={{ padding:'8px 12px' }}>Save search</button>
          {err && <p style={{ color:'crimson' }}>{err}</p>}
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Your searches</h2>
        {loading ? <p>Loading…</p> : rows.length === 0 ? <p>No searches yet.</p> : (
          <ul style={{ listStyle:'none', padding:0, margin:0 }}>
            {rows.map(row => (
              <li key={row.id} style={{ padding:12, border:'1px solid #eee', borderRadius:8, marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <strong>{row.name}</strong> {row.active ? '• Active' : '• Paused'}
                    <div style={{ fontSize:12, color:'#555' }}>
                      terms: {row.terms.join(', ')} | excludes: {row.excludes.join(', ')} | strict: {String(row.strict_title)}
                    </div>
                  </div>
                  <div>
                    <button onClick={()=>onToggleActive(row.id, !row.active)} style={{ marginRight:8 }}>
                      {row.active ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={()=>onDelete(row.id)} style={{ color:'crimson' }}>Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
