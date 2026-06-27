import { useState } from 'react';
import useAdminData from './hooks/useAdminData';
import MetricsBanner from './components/MetricsBanner';
import VenueManager from './components/VenueManager';
import VerificationQueue from './components/VerificationQueue';
import ReportQueue from './components/ReportQueue';
import UserManager from './components/UserManager';
import MessageModeration from './components/MessageModeration';
import AppealQueue from './components/AppealQueue';
import logoImg from './assets/logo.png';

export default function App() {
  const [activePanel, setActivePanel] = useState<'dashboard' | 'venues' | 'users' | 'reports' | 'messages' | 'appeals' | 'tags'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [email, setEmail] = useState('admin@natsvibe.com');
  const [password, setPassword] = useState('password');
  const [loginError, setLoginError] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  // Pull all states and functions from hook
  const {
    isAuthenticated,
    admin,
    loading,
    error,
    login,
    mfa,
    confirmMfa,
    health,
    logout,
    venues,
    hangouts,
    verifications,
    reports,
    users,
    messages,
    appeals,
    vibeTags,
    totalVenues,
    activeVenues,
    pendingVerifications,
    pendingReports,
    handleAddVenue,
    handleUpdateVenue,
    handleDeleteVenue,
    handleToggleStatus,
    handleVerify,
    handleResolveReport,
    handleAddTag,
    handleOpenEvidence,
    handleModerateUser,
    handleDeleteMessage,
    handleDecideAppeal
  } = useAdminData();

  if (!isAuthenticated) {
    if (mfa) return <main className="auth-shell"><form className="auth-card" onSubmit={async event => {
      event.preventDefault(); setLoginError('');
      try { await confirmMfa(mfaCode); } catch (reason) { setLoginError(reason instanceof Error ? reason.message : 'Invalid authenticator code.'); }
    }}>
      <img src={logoImg} alt="NatsVibe" className="auth-logo" />
      <h1>{mfa.mode === 'enroll' ? 'Secure your admin account' : 'Authenticator check'}</h1>
      <p>{mfa.mode === 'enroll' ? 'Add this key to Google or Microsoft Authenticator, then enter the current code.' : 'Enter the six-digit code from your authenticator app.'}</p>
      {mfa.secret && <div className="mfa-secret"><span>Setup key</span><strong>{mfa.secret}</strong></div>}
      <label>Authenticator code<input value={mfaCode} onChange={event => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" required /></label>
      {loginError && <div className="error-banner">{loginError}</div>}
      <button className="btn primary" type="submit" disabled={mfaCode.length !== 6}>Verify and continue</button>
    </form></main>;
    return (
      <main className="auth-shell">
        <form className="auth-card" onSubmit={async event => {
          event.preventDefault(); setLoginError('');
          try { await login(email, password); } catch (reason) { setLoginError(reason instanceof Error ? reason.message : 'Login failed.'); }
        }}>
          <img src={logoImg} alt="NatsVibe" className="auth-logo" />
          <h1>Admin sign in</h1>
          <p>Safety and operations workspace</p>
          <label>Email<input value={email} onChange={event => setEmail(event.target.value)} type="email" required /></label>
          <label>Password<input value={password} onChange={event => setPassword(event.target.value)} type="password" required /></label>
          {(loginError || error) && <div className="error-banner">{loginError || error}</div>}
          <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </main>
    );
  }

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      handleAddTag(newTagInput);
      setNewTagInput('');
    }
  };

  return (
    <div className="layout">
      
      {/* Sidebar Navigation */}
      <aside>
        <div className="brand">
          <img src={logoImg} alt="NV Logo" className="logo" style={{ objectFit: 'cover' }} />
          <div className="brand-name">NatsVibe</div>
        </div>
        
        <nav>
          <button 
            className={activePanel === 'dashboard' ? 'active' : ''} 
            onClick={() => setActivePanel('dashboard')}
          >
            Dashboard <span className="count">12</span>
          </button>
          
          <button 
            className={activePanel === 'venues' ? 'active' : ''} 
            onClick={() => setActivePanel('venues')}
          >
            Venues <span className="count">{venues.length}</span>
          </button>
          
          <button 
            className={activePanel === 'users' ? 'active' : ''} 
            onClick={() => setActivePanel('users')}
          >
            Users <span className="count">{verifications.length}</span>
          </button>
          
          <button 
            className={activePanel === 'reports' ? 'active' : ''} 
            onClick={() => setActivePanel('reports')}
          >
            Reports <span className="count">{reports.filter(r => r.status === 'pending').length}</span>
          </button>
          <button className={activePanel === 'messages' ? 'active' : ''} onClick={() => setActivePanel('messages')}>Messages <span className="count">{messages.filter(message => message.reported_at && !message.deleted_at).length}</span></button>
          <button className={activePanel === 'appeals' ? 'active' : ''} onClick={() => setActivePanel('appeals')}>Appeals <span className="count">{appeals.filter(appeal => appeal.status === 'pending').length}</span></button>
          
          <button 
            className={activePanel === 'tags' ? 'active' : ''} 
            onClick={() => setActivePanel('tags')}
          >
            Tags
          </button>
        </nav>
      </aside>

      {/* Main Panel Content */}
      <main>
        {/* Header bar */}
        <header className="top">
          <div>
            <h1>Admin Panel</h1>
            <p>Signed in as {admin?.name}. Safety, venues, groups, and moderation.</p>
            <span className={`health ${health}`}>API {health}</span>
          </div>
          <div className="top-actions">
            <input type="text" className="search-input" placeholder="Global search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <button className="btn" onClick={() => void logout()}>Log out</button>
          </div>
        </header>

        {/* Global Statistics Summary Row */}
        <MetricsBanner 
          totalVenues={totalVenues}
          activeVenues={activeVenues}
          pendingVerifications={pendingVerifications}
          pendingReports={pendingReports}
        />

        {/* TAB 1: OPERATIONAL DASHBOARD */}
        {activePanel === 'dashboard' && (
          <section className="grid">
            
            {/* Hangouts Table Panel */}
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Hangouts</h2>
                  <p>Upcoming groups created by hosts.</p>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Host</th>
                    <th>Venue</th>
                      <th>Slots</th>
                      <th>Waitlist</th>
                      <th>Status</th>
                      <th>Invite</th>
                  </tr>
                </thead>
                <tbody>
                  {hangouts.filter(hangout => hangout.title.toLowerCase().includes(searchQuery.toLowerCase())).map(hangout => (
                    <tr key={hangout.id}>
                      <td>
                        {hangout.title}
                        <span className="sub">{hangout.date_time}</span>
                      </td>
                      <td>{hangout.host?.name ?? 'Unknown'}</td>
                      <td>{hangout.venue?.name ?? 'Unknown'}</td>
                      <td>{hangout.members_count}/{hangout.group_size_limit}</td>
                      <td>{hangout.waitlist_count ?? 0}</td>
                      <td>
                        <span className={`pill ${hangout.status === 'open' ? 'ok' : 'warn'}`}>
                          {hangout.status}
                        </span>
                      </td>
                      <td><button className="btn" disabled={!hangout.invite_code} onClick={() => hangout.invite_code && void navigator.clipboard.writeText(`natsvibe://hangouts/${hangout.invite_code}`)}>Copy link</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reports Side List Panel */}
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h2>Reports Queue</h2>
                  <p>Safety and moderation items.</p>
                </div>
              </div>
              
              <div className="side-list">
                {reports.slice(0, 3).map(report => (
                  <div key={report.id} className="item" style={{ borderLeft: report.status === 'pending' ? '2.5px solid var(--bad)' : '2.5px solid var(--ok)' }}>
                    <div className="item-row">
                      <div>
                        <h3 style={{ textTransform: 'capitalize' }}>{report.reason}</h3>
                        <p>{report.hangout_title}</p>
                      </div>
                      <span className={`pill ${report.status === 'pending' ? 'bad' : 'ok'}`}>
                        {report.status === 'pending' ? 'New' : 'Resolved'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* TAB 2: VENUES MANAGEMENT */}
        {activePanel === 'venues' && (
          <VenueManager 
            venues={venues}
            onAddVenue={handleAddVenue}
            onUpdateVenue={handleUpdateVenue}
            onDeleteVenue={handleDeleteVenue}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {/* TAB 3: USER VERIFICATIONS */}
        {activePanel === 'users' && (
          <div className="admin-stack"><VerificationQueue verifications={verifications} onVerify={handleVerify} /><UserManager users={users} onModerate={handleModerateUser} /></div>
        )}

        {/* TAB 4: REPORTS LIST */}
        {activePanel === 'reports' && (
          <ReportQueue 
            reports={reports}
            onResolve={handleResolveReport}
            onOpenEvidence={(reportId, evidenceId) => void handleOpenEvidence(reportId, evidenceId).catch(reason => alert(reason instanceof Error ? reason.message : 'Could not open evidence.'))}
          />
        )}

        {activePanel === 'messages' && <MessageModeration messages={messages} onDelete={handleDeleteMessage} />}
        {activePanel === 'appeals' && <AppealQueue appeals={appeals} onDecide={handleDecideAppeal} />}

        {/* TAB 5: TAGS CLOUD EDITOR */}
        {activePanel === 'tags' && (
          <section className="panel section">
            <div className="panel-head">
              <div>
                <h2>Vibe Tags Directory</h2>
                <p>Used for profiles, venues, and group filters.</p>
              </div>
              
              <form onSubmit={handleAddTagSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ height: '36px', width: '200px' }}
                  placeholder="New tag name..." 
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                />
                <button type="submit" className="btn primary" style={{ height: '36px' }}>
                  Add tag
                </button>
              </form>
            </div>
            
            <div className="tags">
              {vibeTags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
