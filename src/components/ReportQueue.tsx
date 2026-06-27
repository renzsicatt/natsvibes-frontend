import type { UserReport } from '../types';

interface ReportQueueProps {
  reports: UserReport[];
  onResolve: (id: number, status: 'resolved' | 'dismissed') => void;
  onOpenEvidence: (reportId: number, evidenceId: number) => void;
}

export default function ReportQueue({ reports, onResolve, onOpenEvidence }: ReportQueueProps) {
  const handleBan = (report: UserReport) => {
    alert(`User ${report.reported_user} has been restricted and blocked from hosting or joining groups.`);
    onResolve(report.id, 'resolved');
  };

  return (
    <div className="panel" style={{ width: '100%' }}>
      <div className="panel-head">
        <div>
          <h2>User Reports & Moderation</h2>
          <p>Safety and moderation queue for offline meetings.</p>
        </div>
      </div>
      
      <div className="side-list">
        {reports.map(report => (
          <div key={report.id} className="item" style={{ borderLeft: report.status === 'pending' ? '3px solid var(--bad)' : '3px solid var(--ok)' }}>
            <div className="item-row">
              <div>
                <h3 style={{ textTransform: 'capitalize' }}>
                  {report.reason}
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400, marginLeft: '8px' }}>
                    ({report.created_at})
                  </span>
                </h3>
                <p style={{ color: 'var(--ink)', marginBottom: '8px' }}>
                  Reported User: <strong>{report.reported_user}</strong> • Reported by: {report.reporter}
                </p>
                <p style={{ fontStyle: 'italic', color: 'var(--muted)', marginBottom: '10px' }}>
                  "{report.details}"
                </p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  Group: {report.hangout_title}
                </p>
                {!!report.evidence?.length && <div className="evidence-list">
                  {report.evidence.map((evidence, index) => <button key={evidence.id} className="btn" onClick={() => onOpenEvidence(report.id, evidence.id)}>Evidence {index + 1} · {evidence.mime_type}</button>)}
                </div>}
              </div>

              <span className={`pill ${report.status === 'pending' ? 'bad' : report.status === 'resolved' ? 'ok' : ''}`}>
                {report.status}
              </span>
            </div>

            {report.status === 'pending' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px dashed var(--line)', paddingTop: '10px' }}>
                <button 
                  className="btn" 
                  style={{ height: '28px', fontSize: '11px', borderColor: 'var(--bad)', color: 'var(--bad)' }}
                  onClick={() => handleBan(report)}
                >
                  Ban User
                </button>
                <button 
                  className="btn" 
                  style={{ height: '28px', fontSize: '11px' }}
                  onClick={() => onResolve(report.id, 'dismissed')}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}

        {reports.length === 0 && (
          <div style={{ padding: '24px', color: 'var(--muted)', textAlign: 'center' }}>
            No reports logged.
          </div>
        )}
      </div>
    </div>
  );
}
