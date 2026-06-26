import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Venue } from '../types';

interface VenueManagerProps {
  venues: Venue[];
  onAddVenue: (venue: Omit<Venue, 'id' | 'status'>) => void;
  onUpdateVenue: (id: number, venue: Omit<Venue, 'id' | 'status'>) => void;
  onDeleteVenue: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export default function VenueManager({
  venues,
  onAddVenue,
  onUpdateVenue,
  onDeleteVenue,
  onToggleStatus
}: VenueManagerProps) {
  // Form State
  const [editingVenueId, setEditingVenueId] = useState<number | null>(null);
  const [venueName, setVenueName] = useState('');
  const [venueArea, setVenueArea] = useState('Poblacion');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueMapsLink, setVenueMapsLink] = useState('');
  const [venueType, setVenueType] = useState('Bar');
  const [venuePrice, setVenuePrice] = useState('$$');
  const [venueResRequired, setVenueResRequired] = useState(false);
  const [venueTags, setVenueTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueName.trim() || !venueAddress.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const tagsArray = venueTags.split(',').map(tag => tag.trim()).filter(Boolean);
    const venueData = {
      name: venueName,
      area: venueArea,
      address: venueAddress,
      maps_link: venueMapsLink,
      venue_type: venueType,
      price_range: venuePrice,
      reservation_required: venueResRequired,
      vibe_tags: tagsArray
    };

    if (editingVenueId !== null) {
      onUpdateVenue(editingVenueId, venueData);
      setEditingVenueId(null);
    } else {
      onAddVenue(venueData);
    }

    // Reset Form fields
    setVenueName('');
    setVenueAddress('');
    setVenueMapsLink('');
    setVenueType('Bar');
    setVenuePrice('$$');
    setVenueResRequired(false);
    setVenueTags('');
  };

  const handleEditClick = (venue: Venue) => {
    setEditingVenueId(venue.id);
    setVenueName(venue.name);
    setVenueArea(venue.area);
    setVenueAddress(venue.address);
    setVenueMapsLink(venue.maps_link);
    setVenueType(venue.venue_type);
    setVenuePrice(venue.price_range);
    setVenueResRequired(venue.reservation_required);
    setVenueTags(venue.vibe_tags.join(', '));
  };

  const handleCancelEdit = () => {
    setEditingVenueId(null);
    setVenueName('');
    setVenueAddress('');
    setVenueMapsLink('');
    setVenueTags('');
  };

  // Filter venues by search
  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.venue_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Search Bar Block */}
      <div className="panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} color="var(--muted)" />
        <input 
          type="text" 
          className="search-input"
          style={{ width: '100%', border: 'none', background: 'transparent', height: 'auto', padding: 0 }}
          placeholder="Search venues by name, area, or type..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <section className="split">
        {/* Left Side: Directory Table */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Venues Directory</h2>
              <p>Curated venue list for mobile discovery.</p>
            </div>
            {editingVenueId !== null && (
              <button className="btn" onClick={handleCancelEdit}>Add New Mode</button>
            )}
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Area</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVenues.map(venue => (
                <tr key={venue.id} style={{ opacity: venue.status === 'active' ? 1 : 0.6 }}>
                  <td>
                    {venue.name}
                    <span className="sub">{venue.address}</span>
                  </td>
                  <td>{venue.area}</td>
                  <td>{venue.venue_type}</td>
                  <td>
                    <span className={`pill ${venue.status === 'active' ? 'ok' : 'warn'}`}>
                      {venue.status === 'active' ? 'Listed' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn" 
                        style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}
                        onClick={() => handleEditClick(venue)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn" 
                        style={{ height: '28px', fontSize: '11px', padding: '0 8px', color: 'var(--bad)', borderColor: 'rgba(155,91,91,0.2)' }}
                        onClick={() => onDeleteVenue(venue.id)}
                      >
                        Delete
                      </button>
                      <button 
                        className="btn" 
                        style={{ height: '28px', fontSize: '11px', padding: '0 8px', color: venue.status === 'active' ? 'var(--warn)' : 'var(--ok)' }}
                        onClick={() => onToggleStatus(venue.id)}
                      >
                        {venue.status === 'active' ? 'Archive' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredVenues.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                    No venues found matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side: Form Editor Panel */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{editingVenueId !== null ? 'Edit Venue Details' : 'Create New Venue'}</h2>
              <p>Minimalist form parameters.</p>
            </div>
          </div>
          
          <form onSubmit={handleSaveVenue} className="form">
            <div className="field wide">
              <label>Name</label>
              <input 
                type="text" 
                required 
                placeholder="Lowlight Wine Room" 
                value={venueName} 
                onChange={e => setVenueName(e.target.value)} 
              />
            </div>

            <div className="field">
              <label>Area</label>
              <select value={venueArea} onChange={e => setVenueArea(e.target.value)}>
                <option value="Poblacion">Poblacion</option>
                <option value="BGC">BGC</option>
                <option value="Legaspi Village">Legaspi Village</option>
                <option value="Salcedo Village">Salcedo Village</option>
              </select>
            </div>

            <div className="field">
              <label>Type</label>
              <input 
                type="text" 
                placeholder="e.g. Wine Bar" 
                value={venueType} 
                onChange={e => setVenueType(e.target.value)} 
              />
            </div>

            <div className="field wide">
              <label>Address</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. 5921 Algier, Makati" 
                value={venueAddress} 
                onChange={e => setVenueAddress(e.target.value)} 
              />
            </div>

            <div className="field wide">
              <label>Google Maps URL</label>
              <input 
                type="url" 
                placeholder="e.g. https://maps.google.com/..." 
                value={venueMapsLink} 
                onChange={e => setVenueMapsLink(e.target.value)} 
              />
            </div>

            <div className="field">
              <label>Budget Level</label>
              <select value={venuePrice} onChange={e => setVenuePrice(e.target.value)}>
                <option value="$">$ (Under ₱500)</option>
                <option value="$$">$$ (₱500 - ₱1,500)</option>
                <option value="$$$">$$$ (₱1,500+)</option>
              </select>
            </div>

            <div className="field" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="resRequired"
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                checked={venueResRequired} 
                onChange={e => setVenueResRequired(e.target.checked)} 
              />
              <label htmlFor="resRequired" style={{ margin: 0, fontSize: '13px', color: 'var(--ink)', cursor: 'pointer' }}>
                Reservation Required
              </label>
            </div>

            <div className="field wide">
              <label>Vibe Tags (Comma-separated)</label>
              <input 
                type="text" 
                placeholder="e.g. Chill, Rooftop, Live music" 
                value={venueTags} 
                onChange={e => setVenueTags(e.target.value)} 
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn primary" style={{ flex: 1 }}>
                {editingVenueId !== null ? 'Save Changes' : 'Publish Venue'}
              </button>
              {editingVenueId !== null && (
                <button type="button" className="btn" onClick={handleCancelEdit} style={{ flex: 0.5 }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
