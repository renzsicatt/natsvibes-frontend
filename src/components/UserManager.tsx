import { useMemo, useState } from 'react';
import type { ModeratedUser } from '../types';

interface Props {
  users: ModeratedUser[];
  onModerate: (id: number, input: { action: 'suspend' | 'ban' | 'restore'; reason: string; suspended_until?: string }) => Promise<void>;
}

export default function UserManager({ users, onModerate }: Props) {
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const visible = useMemo(() => users.filter(user => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())), [search, users]);
  const act = async (user: ModeratedUser, action: 'suspend' | 'ban' | 'restore') => {
    const reason = window.prompt(`Reason to ${action} ${user.name}:`);
    if (!reason || reason.trim().length < 5) return;
    const suspended_until = action === 'suspend' ? new Date(Date.now() + 7 * 86400000).toISOString() : undefined;
    setBusy(user.id);
    try { await onModerate(user.id, { action, reason: reason.trim(), suspended_until }); }
    catch (error) { alert(error instanceof Error ? error.message : 'Moderation failed.'); }
    finally { setBusy(null); }
  };

  return <section className="panel section"><div className="panel-head"><div><h2>User Management</h2><p>Suspend, ban, or restore member access. Every action is audited.</p></div><input className="search-input" placeholder="Search name or email" value={search} onChange={event => setSearch(event.target.value)} /></div>
    <table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Restriction</th><th>Actions</th></tr></thead><tbody>{visible.map(user => <tr key={user.id}>
      <td>{user.name}<span className="sub">{user.email}</span></td><td>{user.role}</td><td><span className={`pill ${user.status === 'active' ? 'ok' : user.status === 'banned' ? 'bad' : 'warn'}`}>{user.status}</span></td>
      <td>{user.suspended_until ? `Until ${new Date(user.suspended_until).toLocaleString()}` : user.banned_at ? `Since ${new Date(user.banned_at).toLocaleString()}` : '—'}</td>
      <td><div className="moderation-actions">{user.status === 'active' ? <><button className="btn" disabled={busy === user.id} onClick={() => void act(user, 'suspend')}>Suspend 7d</button><button className="btn danger" disabled={busy === user.id} onClick={() => void act(user, 'ban')}>Ban</button></> : <button className="btn" disabled={busy === user.id} onClick={() => void act(user, 'restore')}>Restore</button>}</div></td>
    </tr>)}</tbody></table>
  </section>;
}
