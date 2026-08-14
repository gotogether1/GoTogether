// GoTogether Landing Page Interactive Script

function handleSearchRides() {
  const pickup = document.getElementById('pickup-input').value.trim();
  const dropoff = document.getElementById('dropoff-input').value.trim();
  const mode = document.getElementById('mode-select').value;

  if (!pickup || !dropoff) {
    alert('Please enter both pickup and destination locations.');
    return;
  }

  // Smooth scroll to sample rides feed
  const ridesFeedSection = document.getElementById('live-rides');
  ridesFeedSection.scrollIntoView({ behavior: 'smooth' });

  // Update sample feed banner dynamically
  const sampleFeed = document.getElementById('sample-rides-feed');
  const modeBadge = mode === 'carpool' ? '🚘 CARPOOL' : '🚲 BIKE POOL';

  sampleFeed.innerHTML = `
    <div class="ride-card-demo" style="border-color: var(--primary); background: var(--primary-light);">
      <div class="ride-meta-group">
        <span class="route-pill">${modeBadge}</span>
        <div>
          <div class="route-title">${pickup} → ${dropoff}</div>
          <div class="route-sub">Today • Departure at your chosen time • Custom Pick-up</div>
        </div>
      </div>
      <div class="driver-pill">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" class="driver-avatar" alt="Driver">
        <div>
          <div style="font-weight:700;">Verified Commuter</div>
          <div style="font-size:12px; color:var(--text-muted);">★ 4.9 (Live Matching)</div>
        </div>
        <a href="../mobile" class="btn btn-primary" style="margin-left:16px;">Book Seat</a>
      </div>
    </div>
  `;
}
