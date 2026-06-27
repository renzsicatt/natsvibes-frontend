import type { AdminMessage } from '../types';

interface Props { messages: AdminMessage[]; onDelete: (id: number) => Promise<void> }

export default function MessageModeration({ messages, onDelete }: Props) {
  return <section className="panel section"><div className="panel-head"><div><h2>Message Moderation</h2><p>Review recent and reported group messages.</p></div></div>
    <table><thead><tr><th>Message</th><th>Sender</th><th>Group</th><th>Status</th><th>Action</th></tr></thead><tbody>{messages.map(message => <tr key={message.id}>
      <td>{message.message_text}<span className="sub">{new Date(message.created_at).toLocaleString()}{message.edited_at ? ' · edited' : ''}</span></td>
      <td>{message.sender?.name ?? 'Unknown'}</td><td>{message.hangout?.title ?? 'Unknown'}</td>
      <td><span className={`pill ${message.deleted_at ? 'bad' : message.reported_at ? 'warn' : 'ok'}`}>{message.deleted_at ? 'deleted' : message.reported_at ? 'reported' : 'active'}</span></td>
      <td><button className="btn danger" disabled={Boolean(message.deleted_at)} onClick={() => confirm('Remove this message?') && void onDelete(message.id)}>{message.deleted_at ? 'Removed' : 'Remove'}</button></td>
    </tr>)}</tbody></table>
  </section>;
}
