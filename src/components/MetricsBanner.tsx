interface MetricsBannerProps {
  totalVenues: number;
  activeVenues: number;
  pendingVerifications: number;
  pendingReports: number;
}

export default function MetricsBanner({
  totalVenues,
  activeVenues,
  pendingVerifications,
  pendingReports
}: MetricsBannerProps) {
  return (
    <section className="stats">
      <div className="stat">
        <span>Active users</span>
        <strong>284</strong>
        <p>18 new this week</p>
      </div>
      
      <div className="stat">
        <span>Venues</span>
        <strong>{totalVenues}</strong>
        <p>{activeVenues} verified active</p>
      </div>

      <div className="stat">
        <span>Pending Selfies</span>
        <strong>{pendingVerifications}</strong>
        <p>Reviews required</p>
      </div>

      <div className="stat">
        <span>Open Reports</span>
        <strong>{pendingReports}</strong>
        <p>Moderation queue</p>
      </div>
    </section>
  );
}
