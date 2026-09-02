const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return await res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error(`Fetch stats failed: ${res.statusText}`);
  return await res.json();
}

export async function fetchEvents(filters = {}) {
  const query = new URLSearchParams();
  if (filters.hazard) query.append('hazard', filters.hazard);
  if (filters.priority) query.append('priority', filters.priority);
  if (filters.channel) query.append('channel', filters.channel);
  if (filters.search) query.append('search', filters.search);
  if (filters.startDate) query.append('startDate', filters.startDate);
  if (filters.endDate) query.append('endDate', filters.endDate);
  if (filters.limit) query.append('limit', filters.limit);
  if (filters.offset) query.append('offset', filters.offset);

  const res = await fetch(`${API_BASE}/events?${query.toString()}`);
  if (!res.ok) throw new Error(`Fetch events failed: ${res.statusText}`);
  return await res.json();
}

export async function fetchEventDetails(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}`);
  if (!res.ok) throw new Error(`Fetch event details failed: ${res.statusText}`);
  return await res.json();
}

export async function updateEventStatus(eventId, status, notes = '') {
  const res = await fetch(`${API_BASE}/events/${eventId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  if (!res.ok) throw new Error(`Update status failed: ${res.statusText}`);
  return await res.json();
}

export async function sendMockEvent(hazard = null, channel = 'WIFI') {
  const endpoint = channel === 'LORA' ? `${API_BASE}/events/lora` : `${API_BASE}/events`;
  
  const hazards = ['flood', 'smoke', 'fire', 'debris', 'landslide', 'person'];
  const selectedHazard = hazard || hazards[Math.floor(Math.random() * hazards.length)];
  
  const lat = 18.5204 + (Math.random() - 0.5) * 0.08;
  const lng = 73.8567 + (Math.random() - 0.5) * 0.08;
  const confidence = parseFloat((0.70 + Math.random() * 0.28).toFixed(2));
  const priority = ['fire', 'landslide', 'person'].includes(selectedHazard) ? 'HIGH' : 'MEDIUM';

  const mockPayload = {
    event_id: `EVT-${Date.now().toString().slice(-5)}`,
    hazard: selectedHazard,
    confidence,
    priority,
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6)),
    altitude: parseFloat((35 + Math.random() * 60).toFixed(1)),
    timestamp: new Date().toISOString(),
    channel
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockPayload)
  });

  if (!res.ok) throw new Error(`Mock trigger failed: ${res.statusText}`);
  return await res.json();
}
