import { useState, useEffect } from 'react';
import type { Venue, VerificationRequest, UserReport } from '../types';

export interface Hangout {
  id: number;
  title: string;
  host: string;
  venue: string;
  date_time: string;
  slots: string;
  status: 'Open' | 'Full';
}

const API_BASE = 'http://127.0.0.1:8080/api';

export default function useAdminData() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [hangouts, setHangouts] = useState<Hangout[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [vibeTags, setVibeTags] = useState<string[]>([]);

  // Fetch initial data
  useEffect(() => {
    fetchVenues();
    fetchHangouts();
    fetchVerifications();
    fetchReports();
    fetchVibeTags();
  }, []);

  const fetchVenues = () => {
    fetch(`${API_BASE}/venues`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch venues');
        return res.json();
      })
      .then(data => {
        setVenues(data);
      })
      .catch(err => {
        console.error('Error fetching venues:', err);
      });
  };

  const fetchHangouts = () => {
    fetch(`${API_BASE}/hangouts`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch hangouts');
        return res.json();
      })
      .then(data => {
        const transformed: Hangout[] = data.map((h: any) => ({
          id: h.id,
          title: h.title,
          host: h.host.name,
          venue: h.venue.name,
          date_time: h.date_time,
          slots: `${h.members_count}/${h.group_size_limit}`,
          status: h.members_count >= h.group_size_limit ? 'Full' : 'Open'
        }));
        setHangouts(transformed);
      })
      .catch(err => {
        console.error('Error fetching hangouts:', err);
      });
  };

  const fetchVerifications = () => {
    fetch(`${API_BASE}/profiles/verifications`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch verifications');
        return res.json();
      })
      .then(data => {
        setVerifications(data);
      })
      .catch(err => {
        console.error('Error fetching verifications:', err);
      });
  };

  const fetchReports = () => {
    fetch(`${API_BASE}/reports`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch reports');
        return res.json();
      })
      .then(data => {
        setReports(data);
      })
      .catch(err => {
        console.error('Error fetching reports:', err);
      });
  };

  const fetchVibeTags = () => {
    fetch(`${API_BASE}/vibe-tags`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch vibe tags');
        return res.json();
      })
      .then(data => {
        setVibeTags(data);
      })
      .catch(err => {
        console.error('Error fetching vibe tags:', err);
      });
  };

  // Venue action handlers
  const handleAddVenue = (venueData: Omit<Venue, 'id' | 'status'>) => {
    fetch(`${API_BASE}/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(venueData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add venue');
        return res.json();
      })
      .then((newVenue: Venue) => {
        setVenues(prev => [newVenue, ...prev]);
      })
      .catch(err => {
        console.error('Error adding venue:', err);
        alert('Error adding venue.');
      });
  };

  const handleUpdateVenue = (id: number, venueData: Omit<Venue, 'id' | 'status'>) => {
    fetch(`${API_BASE}/venues/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(venueData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update venue');
        return res.json();
      })
      .then((updatedVenue: Venue) => {
        setVenues(prev => prev.map(v => v.id === id ? updatedVenue : v));
      })
      .catch(err => {
        console.error('Error updating venue:', err);
        alert('Error updating venue.');
      });
  };

  const handleDeleteVenue = (id: number) => {
    if (window.confirm('Are you sure you want to remove this venue from NatsVibe?')) {
      fetch(`${API_BASE}/venues/${id}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete venue');
          setVenues(prev => prev.filter(v => v.id !== id));
        })
        .catch(err => {
          console.error('Error deleting venue:', err);
          alert('Error deleting venue.');
        });
    }
  };

  const handleToggleStatus = (id: number) => {
    const venue = venues.find(v => v.id === id);
    if (!venue) return;
    const nextStatus = venue.status === 'active' ? 'inactive' : 'active';
    
    fetch(`${API_BASE}/venues/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to toggle status');
        return res.json();
      })
      .then((updatedVenue: Venue) => {
        setVenues(prev => prev.map(v => v.id === id ? updatedVenue : v));
      })
      .catch(err => {
        console.error('Error toggling status:', err);
        alert('Error toggling status.');
      });
  };

  // Verification review handler
  const handleVerify = (id: number, status: 'approved' | 'declined') => {
    fetch(`${API_BASE}/profiles/${id}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to verify user');
        return res.json();
      })
      .then(() => {
        setVerifications(prev => prev.map(v => v.id === id ? { ...v, status } : v));
      })
      .catch(err => {
        console.error('Error updating user verification:', err);
        alert('Error updating user verification.');
      });
  };

  // Report resolution handler
  const handleResolveReport = (id: number, status: 'resolved' | 'dismissed') => {
    fetch(`${API_BASE}/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to resolve report');
        return res.json();
      })
      .then(() => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      })
      .catch(err => {
        console.error('Error resolving report:', err);
        alert('Error resolving report.');
      });
  };

  const handleAddTag = (tag: string) => {
    fetch(`${API_BASE}/vibe-tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: tag })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add tag');
        return res.json();
      })
      .then((newTagName: string) => {
        setVibeTags(prev => [...prev, newTagName]);
      })
      .catch(err => {
        console.error('Error adding vibe tag:', err);
        alert('Error adding vibe tag.');
      });
  };

  // Stats calculation
  const totalVenues = venues.length;
  const activeVenues = venues.filter(v => v.status === 'active').length;
  const pendingVerifications = verifications.filter(v => v.status === 'pending').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

  return {
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
  };
}
