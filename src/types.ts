export interface Venue {
  id: number;
  name: string;
  area: string;
  address: string;
  maps_link: string;
  venue_type: string;
  price_range: string; // $, $$, $$$
  reservation_required: boolean;
  status: 'active' | 'inactive';
  vibe_tags: string[];
}

export interface VerificationRequest {
  id: number;
  name: string;
  age: number;
  city: string;
  photo_url: string;
  status: 'pending' | 'approved' | 'declined';
  requested_at: string;
}

export interface UserReport {
  id: number;
  reporter: string;
  reported_user: string;
  reason: string;
  details: string;
  hangout_title: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}
