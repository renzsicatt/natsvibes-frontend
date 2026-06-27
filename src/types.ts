export interface Paginated<T> { data: T[]; next_cursor?: string | null }
export interface AdminUser { id: number; name: string; email: string; role: string; status: string; profile?: Profile }
export interface Profile { id: number; display_name?: string; name: string; city?: string; bio?: string; avatar_url?: string; verification_status: string }
export interface Venue {
  id: number; name: string; description?: string; area: string; city?: string; address: string;
  google_maps_url?: string; maps_link: string; venue_type: string; price_range: string;
  budget_min?: number; budget_max?: number; reservation_required: boolean;
  status: 'draft' | 'listed' | 'verified' | 'featured' | 'archived' | 'closed' | 'active';
  is_verified?: boolean; is_featured?: boolean; tags?: { id: number; name: string }[]; vibe_tags: string[];
}
export interface Hangout {
  id: number; title: string; date_time: string; group_size_limit: number; members_count: number;
  status: string; host: AdminUser; venue: Venue;
}
export interface VerificationRequest {
  id: number; name: string; display_name?: string; city?: string; avatar_url?: string;
  verification_status: 'pending' | 'approved' | 'declined'; status?: 'pending' | 'approved' | 'declined'; user?: AdminUser;
  age: number; requested_at: string; photo_url: string;
  photo_review_status?: 'pending' | 'approved' | 'declined';
  host_verification_status?: 'not_requested' | 'pending' | 'approved' | 'declined';
  request_kind?: 'identity' | 'photo' | 'host';
}
export interface UserReport {
  id: number; reason: string; details: string; status: string; severity: string; created_at: string;
  reporter: string; reported_user: string; reported_hangout?: Hangout; resolution?: string;
  hangout_title?: string;
  evidence?: ReportEvidence[];
}
export interface ReportEvidence { id: number; report_id: number; mime_type: string; size: number; review_status: string }
