import { useState } from 'react';
import useAdminData from './hooks/useAdminData';
import MetricsBanner from './components/MetricsBanner';
import VenueManager from './components/VenueManager';
import VerificationQueue from './components/VerificationQueue';
import ReportQueue from './components/ReportQueue';
import logoImg from './assets/logo.png';

export default function App() {
  const [activePanel, setActivePanel] = useState<'dashboard' | 'venues' | 'users' | 'reports' | 'tags'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  // Pull all states and functions from hook
  const {
    venues,
    hangouts,
    verifications,
    reports,
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
    handleAddTag
  } = useAdminData();

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
            <p>Simple operations view for venues, groups, users, and reports.</p>
          </div>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Global search..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hangouts.map(hangout => (
                    <tr key={hangout.id}>
                      <td>
                        {hangout.title}
                        <span className="sub">{hangout.date_time}</span>
                      </td>
                      <td>{hangout.host}</td>
                      <td>{hangout.venue}</td>
                      <td>{hangout.slots}</td>
                      <td>
                        <span className={`pill ${hangout.status === 'Open' ? 'ok' : 'warn'}`}>
                          {hangout.status}
                        </span>
                      </td>
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
          <VerificationQueue 
            verifications={verifications}
            onVerify={handleVerify}
          />
        )}

        {/* TAB 4: REPORTS LIST */}
        {activePanel === 'reports' && (
          <ReportQueue 
            reports={reports}
            onResolve={handleResolveReport}
          />
        )}

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
