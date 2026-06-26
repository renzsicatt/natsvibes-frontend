import { useState } from 'react';
import type { VerificationRequest } from '../types';

interface VerificationQueueProps {
  verifications: VerificationRequest[];
  onVerify: (id: number, status: 'approved' | 'declined') => void;
}

export default function VerificationQueue({ verifications, onVerify }: VerificationQueueProps) {
  const [selectedSelfie, setSelectedSelfie] = useState<string | null>(null);

  return (
    <section className="panel section" style={{ width: '100%' }}>
      <div className="panel-head">
        <div>
          <h2>User Verification Queue</h2>
          <p>Manual selfie verification to permit group hosting permissions.</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>City</th>
            <th>Selfie</th>
            <th>Request</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {verifications.map(req => (
            <tr key={req.id}>
              <td>
                {req.name}, {req.age}
                <span className="sub">Requested {req.requested_at}</span>
              </td>
              <td>{req.city}</td>
              <td>
                <img 
                  src={req.photo_url} 
                  alt="Selfie Preview" 
                  style={{ width: '40px', height: '40px', borderRadius: '6px', cursor: 'pointer', objectFit: 'cover', border: '1px solid var(--line)' }}
                  onClick={() => setSelectedSelfie(req.photo_url)}
                />
              </td>
              <td>
                <span className={`pill ${req.status === 'approved' ? 'ok' : req.status === 'declined' ? 'bad' : 'warn'}`}>
                  {req.request_kind ?? 'identity'}
                </span>
              </td>
              <td>
                {req.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn" 
                      style={{ height: '28px', fontSize: '11px', borderColor: 'var(--ok)', color: 'var(--ok)' }}
                      onClick={() => onVerify(req.id, 'approved')}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn" 
                      style={{ height: '28px', fontSize: '11px', borderColor: 'var(--bad)', color: 'var(--bad)' }}
                      onClick={() => onVerify(req.id, 'declined')}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Completed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Selfie Preview Modal */}
      {selectedSelfie && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(43, 37, 34, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedSelfie(null)}
        >
          <div 
            className="panel" 
            style={{ 
              padding: '16px', 
              maxWidth: '400px', 
              width: '90%', 
              background: 'white',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="panel-head" style={{ borderBottom: 'none', padding: '0 0 12px' }}>
              <h2>Verification Selfie Review</h2>
              <button 
                className="btn" 
                style={{ height: '28px', minWidth: '28px', padding: 0 }}
                onClick={() => setSelectedSelfie(null)}
              >
                ✕
              </button>
            </div>
            <img 
              src={selectedSelfie} 
              alt="Verification Closeup" 
              style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--line)' }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
