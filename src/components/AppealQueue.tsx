import type { ModerationAppeal } from '../types';

interface Props { appeals: ModerationAppeal[]; onDecide: (id: number, decision: 'approved' | 'declined', notes: string) => Promise<void> }

export default function AppealQueue({ appeals, onDecide }: Props) {
  const decide = async (appeal: ModerationAppeal, decision: 'approved' | 'declined') => {
    const notes = prompt(`Decision notes for ${appeal.user.name}:`);
    if (!notes || notes.trim().length < 5) return;
    try { await onDecide(appeal.id, decision, notes.trim()); } catch (error) { alert(error instanceof Error ? error.message : 'Decision failed.'); }
  };
  return <section className="panel section"><div className="panel-head"><div><h2>Account Appeals</h2><p>Review requests from suspended and banned members.</p></div></div><div className="side-list">
    {appeals.map(appeal => <div className="item" key={appeal.id}><div className="item-row"><div><h3>{appeal.user.name} · {appeal.account_status}</h3><p>{appeal.statement}</p><span className="sub">{new Date(appeal.created_at).toLocaleString()}</span></div><span className={`pill ${appeal.status === 'pending' ? 'warn' : appeal.status === 'approved' ? 'ok' : 'bad'}`}>{appeal.status}</span></div>
      {appeal.status === 'pending' && <div className="moderation-actions"><button className="btn" onClick={() => void decide(appeal, 'approved')}>Approve & restore</button><button className="btn danger" onClick={() => void decide(appeal, 'declined')}>Decline</button></div>}
    </div>)}{!appeals.length && <div className="item">No appeals submitted.</div>}
  </div></section>;
}
