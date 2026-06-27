import { useCallback, useEffect, useState } from 'react';
import type { AdminMessage, AdminUser, Hangout, ModeratedUser, Paginated, UserReport, Venue, VerificationRequest } from '../types';

type VibeTagOption = { id: number; name: string };

const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
const BACKEND_BASE = API_BASE.replace(/\/api\/v1$/, '');
const assetUrl = (path?: string) => !path ? '' : /^https?:\/\//.test(path) ? path : `${BACKEND_BASE}/storage/${path.replace(/^\//, '')}`;

type Envelope<T> = { data: T; error?: { message?: string; fields?: Record<string, string[]> } };

async function request<T>(path: string, token: string | null, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as Envelope<T>;
  if (!response.ok) throw new Error(payload.error?.message ?? `Request failed (${response.status})`);
  return payload.data;
}

export default function useAdminData() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('natsvibe_admin_token'));
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [hangouts, setHangouts] = useState<Hangout[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [vibeTags, setVibeTags] = useState<string[]>([]);
  const [users, setUsers] = useState<ModeratedUser[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);
  const [mfa, setMfa] = useState<{ token: string; user: AdminUser; mode: 'enroll' | 'challenge'; secret?: string } | null>(null);
  const [health, setHealth] = useState<'checking' | 'ok' | 'degraded'>('checking');

  const login = async (email: string, password: string) => {
    const result = await request<{ token: string; user: AdminUser; mfa_required?: boolean; mfa_enrollment_required?: boolean }>('/auth/login', null, {
      method: 'POST', body: JSON.stringify({ email, password, device_name: 'admin-web' }),
    });
    if (!['admin', 'super_admin'].includes(result.user.role)) throw new Error('Admin access is required.');
    if (result.mfa_enrollment_required) {
      const setup = await request<{ secret: string }>('/admin/mfa/setup', result.token, { method: 'POST' });
      setMfa({ token: result.token, user: result.user, mode: 'enroll', secret: setup.secret });
      return;
    }
    if (result.mfa_required) {
      setMfa({ token: result.token, user: result.user, mode: 'challenge' });
      return;
    }
    localStorage.setItem('natsvibe_admin_token', result.token);
    setToken(result.token);
    setAdmin(result.user);
  };

  const confirmMfa = async (code: string) => {
    if (!mfa) return;
    const result = await request<{ token: string }>('/admin/mfa/confirm', mfa.token, { method: 'POST', body: JSON.stringify({ code }) });
    localStorage.setItem('natsvibe_admin_token', result.token);
    setToken(result.token); setAdmin(mfa.user); setMfa(null);
  };

  const logout = async () => {
    if (token) await request('/auth/logout', token, { method: 'POST' }).catch(() => undefined);
    localStorage.removeItem('natsvibe_admin_token');
    setToken(null); setAdmin(null);
  };

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const [me, venuePage, hangoutPage, verificationPage, reportPage, userPage, messagePage, tags] = await Promise.all([
        request<AdminUser>('/me', token),
        request<Paginated<Venue>>('/venues', token),
        request<Paginated<Hangout>>('/hangouts', token),
        request<Paginated<VerificationRequest>>('/admin/verifications', token),
        request<Paginated<UserReport>>('/admin/reports', token),
        request<Paginated<ModeratedUser>>('/admin/users', token),
        request<Paginated<AdminMessage>>('/admin/messages', token),
        request<VibeTagOption[]>('/vibe-tags', token),
      ]);
      if (!['admin', 'super_admin'].includes(me.role)) throw new Error('Admin access is required.');
      setAdmin(me);
      setVenues(venuePage.data.map(venue => ({
        ...venue,
        maps_link: venue.google_maps_url ?? venue.maps_link ?? '',
        price_range: venue.price_range ?? (venue.budget_min ? `PHP ${venue.budget_min}–${venue.budget_max ?? venue.budget_min}` : '$$'),
        vibe_tags: venue.tags?.map(tag => tag.name) ?? venue.vibe_tags ?? [],
      })));
      setHangouts(hangoutPage.data);
      setVerifications(verificationPage.data.map(profile => ({
        ...profile,
        name: profile.display_name ?? profile.name ?? profile.user?.name ?? 'Unknown',
        age: 0,
        requested_at: 'Pending review',
        photo_url: assetUrl(profile.avatar_url),
        request_kind: profile.verification_status === 'pending' ? 'identity' : profile.photo_review_status === 'pending' ? 'photo' : 'host',
        status: 'pending',
      })));
      setReports(reportPage.data.map(report => ({
        ...report,
        reporter: typeof report.reporter === 'string' ? report.reporter : (report.reporter as unknown as { name?: string })?.name ?? 'Unknown',
        reported_user: typeof report.reported_user === 'string' ? report.reported_user : (report.reported_user as unknown as { name?: string })?.name ?? 'N/A',
        hangout_title: report.reported_hangout?.title ?? 'N/A',
      })));
      setUsers(userPage.data);
      setMessages(messagePage.data);
      setVibeTags(tags.map(tag => tag.name));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin data.');
      if (err instanceof Error && /auth|account|admin/i.test(err.message)) {
        localStorage.removeItem('natsvibe_admin_token'); setToken(null); setAdmin(null);
      }
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    void request<{ status: string }>('/health', null).then(result => setHealth(result.status === 'ok' ? 'ok' : 'degraded')).catch(() => setHealth('degraded'));
  }, []);

  const addVenue = async (input: Partial<Venue>) => {
    const venue = await request<Venue>('/admin/venues', token, { method: 'POST', body: JSON.stringify(input) });
    setVenues(previous => [venue, ...previous]);
  };
  const updateVenue = async (id: number, input: Partial<Venue>) => {
    const venue = await request<Venue>(`/admin/venues/${id}`, token, { method: 'PUT', body: JSON.stringify(input) });
    setVenues(previous => previous.map(item => item.id === id ? venue : item));
  };
  const deleteVenue = async (id: number) => {
    await request(`/admin/venues/${id}`, token, { method: 'DELETE' });
    setVenues(previous => previous.filter(item => item.id !== id));
  };
  const toggleStatus = async (id: number) => {
    const venue = venues.find(item => item.id === id); if (!venue) return;
    await updateVenue(id, { status: venue.status === 'listed' ? 'archived' : 'listed' });
  };
  const verify = async (id: number, status: 'approved' | 'declined') => {
    const item = verifications.find(profile => profile.id === id);
    const body = item?.request_kind === 'host'
      ? { status: item.verification_status, host_status: status }
      : { status };
    await request(`/admin/verifications/${id}`, token, { method: 'PUT', body: JSON.stringify(body) });
    setVerifications(previous => previous.filter(item => item.id !== id));
  };
  const resolveReport = async (id: number, status: 'resolved' | 'dismissed') => {
    const report = await request<UserReport>(`/admin/reports/${id}`, token, { method: 'PUT', body: JSON.stringify({ status }) });
    setReports(previous => previous.map(item => item.id === id ? report : item));
  };
  const addTag = async (name: string) => {
    const result = await request<VibeTagOption>('/admin/vibe-tags', token, { method: 'POST', body: JSON.stringify({ name }) });
    setVibeTags(previous => [...previous, result.name]);
  };
  const openEvidence = async (reportId: number, evidenceId: number) => {
    if (!token) return;
    const response = await fetch(`${API_BASE}/admin/reports/${reportId}/evidence/${evidenceId}`, { headers: { Accept: '*/*', Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error(`Evidence download failed (${response.status})`);
    const url = URL.createObjectURL(await response.blob());
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  const moderateUser = async (id: number, input: { action: 'suspend' | 'ban' | 'restore'; reason: string; suspended_until?: string }) => {
    const updated = await request<ModeratedUser>(`/admin/users/${id}/moderate`, token, { method: 'POST', body: JSON.stringify(input) });
    setUsers(items => items.map(item => item.id === id ? updated : item));
  };
  const deleteMessage = async (id: number) => {
    await request(`/messages/${id}`, token, { method: 'DELETE' });
    setMessages(items => items.map(item => item.id === id ? { ...item, deleted_at: new Date().toISOString() } : item));
  };

  return {
    isAuthenticated: Boolean(token && admin), admin, loading, error, login, logout, refresh, mfa, confirmMfa, health,
    venues, hangouts, verifications, reports, vibeTags, users, messages,
    totalVenues: venues.length,
    activeVenues: venues.filter(v => ['listed', 'verified', 'featured', 'active'].includes(v.status)).length,
    pendingVerifications: verifications.length,
    pendingReports: reports.filter(r => !['resolved', 'dismissed'].includes(r.status)).length,
    handleAddVenue: addVenue, handleUpdateVenue: updateVenue, handleDeleteVenue: deleteVenue,
    handleToggleStatus: toggleStatus, handleVerify: verify, handleResolveReport: resolveReport, handleAddTag: addTag, handleOpenEvidence: openEvidence, handleModerateUser: moderateUser, handleDeleteMessage: deleteMessage,
  };
}
