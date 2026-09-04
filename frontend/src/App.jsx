import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EventMap from './components/EventMap';
import DetectionsSidebar from './components/DetectionsSidebar';
import PriorityPanel from './components/PriorityPanel';
import SelectedDetectionPanel from './components/SelectedDetectionPanel';
import AllIncidentDataTable from './components/AllIncidentDataTable';
import EventFeed from './components/EventFeed';
import SystemStatusBar from './components/SystemStatusBar';
import EvidenceModal from './components/EvidenceModal';
import ReceiverStatus from './components/ReceiverStatus';
import MissionHistory from './components/MissionHistory';

import { fetchEvents, fetchStats, updateEventStatus, sendMockEvent, fetchHealth } from './services/api';
import { wsClient } from './services/websocket';

export default function App() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ total_events: 0, active_high_priority: 0, hazard_breakdown: {}, channel_breakdown: {} });
  const [healthData, setHealthData] = useState(null);
  const [filters, setFilters] = useState({ hazard: '', priority: '', channel: '', search: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalEvent, setModalEvent] = useState(null); // Event currently open in EvidenceModal lightbox
  const [mapFilter, setMapFilter] = useState('ALL'); // 'ALL', 'person', 'fire', 'flood', 'smoke', 'landslide', 'debris', or 'SINGLE_EVENT'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Drone Telemetry Position State (simulated or real from health API/WebSocket)
  const [dronePosition, setDronePosition] = useState({
    latitude: 27.7172,
    longitude: 85.3240,
    altitude: 45.0,
    heading: 45,
    speed: 12.4,
    battery: 88
  });

  // Count total persons detected
  const personCount = events.filter(e => (e.hazard || '').toLowerCase() === 'person' && e.status !== 'RESOLVED').length;

  // Update simulated/real drone position whenever new telemetry event arrives
  useEffect(() => {
    if (events.length > 0) {
      const latest = events[0];
      if (typeof latest.latitude === 'number' && typeof latest.longitude === 'number') {
        setDronePosition(prev => ({
          ...prev,
          latitude: latest.latitude + 0.0012,
          longitude: latest.longitude + 0.0015,
          altitude: latest.altitude || 45.0
        }));
      }
    }
  }, [events]);

  // Internet online/offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load initial dataset from backend
  const loadData = useCallback(async () => {
    try {
      const [eventsRes, statsRes, healthRes] = await Promise.all([
        fetchEvents(filters).catch(() => ({ events: [] })),
        fetchStats().catch(() => ({ total_events: 0, active_high_priority: 0 })),
        fetchHealth().catch(() => null)
      ]);
      const fetchedEvents = eventsRes.events || [];
      setEvents(fetchedEvents);
      setStats(statsRes);
      if (healthRes) setHealthData(healthRes);

      if (fetchedEvents.length > 0) {
        setLastUpdate(fetchedEvents[0].timestamp || new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to load Ground Station dataset:', err);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Connect WebSocket & Listen for Real-Time Person Detections
  useEffect(() => {
    wsClient.connect();

    const unsubStatus = wsClient.onStatusChange((status) => {
      setIsConnected(status);
    });

    const unsubMessage = wsClient.onMessage((msg) => {
      if (msg.type === 'EVENT_CREATED') {
        const newEvent = msg.payload;

        // Prepend new event to list immediately
        setEvents((prev) => [newEvent, ...prev.filter(e => e.event_id !== newEvent.event_id)]);
        setLastUpdate(newEvent.timestamp || new Date().toISOString());

        // Refresh stats metrics
        fetchStats().then(setStats).catch(() => {});
      } else if (msg.type === 'EVENT_STATUS_UPDATED') {
        const updated = msg.payload;
        setEvents((prev) => prev.map(e => e.event_id === updated.event_id ? updated : e));
        if (selectedEvent && selectedEvent.event_id === updated.event_id) {
          setSelectedEvent(updated);
        }
        setLastUpdate(new Date().toISOString());
        fetchStats().then(setStats).catch(() => {});
      }
    });

    return () => {
      unsubStatus();
      unsubMessage();
      wsClient.disconnect();
    };
  }, [selectedEvent]);

  // Trigger Mock Detection Ingest
  const handleTriggerMock = async (channel = 'WIFI') => {
    try {
      await sendMockEvent(null, channel);
    } catch (err) {
      console.error('Failed to emit mock event:', err);
    }
  };

  // Status Update Handler (RESOLVE / ACKNOWLEDGE)
  const handleUpdateStatus = async (eventId, status, notes) => {
    try {
      const updatedRes = await updateEventStatus(eventId, status, notes);
      const updatedEvent = updatedRes.data;

      setEvents((prev) => prev.map(e => e.event_id === eventId ? updatedEvent : e));
      if (selectedEvent && selectedEvent.event_id === eventId) {
        setSelectedEvent(updatedEvent);
      }
      setLastUpdate(new Date().toISOString());
      fetchStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to update event status:', err);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#090d16] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Compact Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        personCount={personCount}
      />

      {/* Main Ground Station Work Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header Telemetry Status Bar */}
        <Header
          isConnected={isConnected}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onTriggerMock={handleTriggerMock}
          isOnline={isOnline}
          dronePosition={dronePosition}
        />

        {/* Content Workspace */}
        <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 flex flex-col gap-3 overflow-y-auto">
          
          {/* OVERVIEW WORKSPACE (3-Column Operator Layout) */}
          {activeTab === 'dashboard' && (
            <>
              {/* Core 3-Column Grid: [ DETECTIONS ] | [ LIVE MAP ] | [ PRIORITY ] */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[580px]">
                
                {/* Left Column (3 cols): DETECTIONS Category Filter Sidebar */}
                <div className="lg:col-span-3 h-full">
                  <DetectionsSidebar
                    events={events}
                    mapFilter={mapFilter}
                    onSelectCategoryFilter={(cat) => {
                      setMapFilter(cat);
                      if (cat !== 'SINGLE_EVENT') setSelectedEvent(null);
                    }}
                    onNavigateToCategoryView={(cat) => {
                      setFilters({ ...filters, hazard: cat });
                      setActiveTab('detections');
                    }}
                  />
                </div>

                {/* Center Column (6 cols): Dominant LIVE MAP Workspace */}
                <div className="lg:col-span-6 h-full">
                  <EventMap
                    events={events.filter(e => e.status !== 'RESOLVED')}
                    selectedEvent={selectedEvent}
                    onSelectEvent={(evt) => {
                      setSelectedEvent(evt);
                      setMapFilter('SINGLE_EVENT');
                    }}
                    mapFilter={mapFilter}
                    onClearFilter={() => {
                      setMapFilter('ALL');
                      setSelectedEvent(null);
                    }}
                    dronePosition={dronePosition}
                    isOnline={isOnline}
                  />
                </div>

                {/* Right Column (3 cols): PRIORITY List & Event Details Panel */}
                <div className="lg:col-span-3 h-full">
                  {selectedEvent && mapFilter === 'SINGLE_EVENT' ? (
                    <SelectedDetectionPanel
                      selectedEvent={selectedEvent}
                      onInspectEvidence={(evt) => setModalEvent(evt)}
                      onResolve={(id) => handleUpdateStatus(id, 'RESOLVED')}
                      onClose={() => {
                        setSelectedEvent(null);
                        setMapFilter('ALL');
                      }}
                    />
                  ) : (
                    <PriorityPanel
                      events={events}
                      selectedEvent={selectedEvent}
                      mapFilter={mapFilter}
                      onSelectPriorityCategory={(priorityLevel) => {
                        setMapFilter(priorityLevel);
                        setSelectedEvent(null);
                      }}
                      onSelectPriorityEvent={(evt) => {
                        setSelectedEvent(evt);
                        setMapFilter('SINGLE_EVENT');
                      }}
                      onClearFilter={() => {
                        setMapFilter('ALL');
                        setSelectedEvent(null);
                      }}
                      onResolveEvent={(id) => handleUpdateStatus(id, 'RESOLVED')}
                    />
                  )}
                </div>

              </div>

              {/* Bottom Workspace: ALL INCIDENT DATA Table */}
              <div className="w-full">
                <AllIncidentDataTable
                  events={events}
                  selectedEvent={selectedEvent}
                  onSelectEvent={(evt) => {
                    setSelectedEvent(evt);
                    setMapFilter('SINGLE_EVENT');
                  }}
                  onInspectEvidence={(evt) => setModalEvent(evt)}
                  onResolveEvent={(id) => handleUpdateStatus(id, 'RESOLVED')}
                />
              </div>
            </>
          )}

          {/* CATEGORY DETECTIONS TAB (Full History & Audit Review) */}
          {activeTab === 'detections' && (
            <div className="w-full">
              <EventFeed
                events={events}
                filters={filters}
                setFilters={setFilters}
                onSelectEvent={(evt) => {
                  setSelectedEvent(evt);
                  setMapFilter('SINGLE_EVENT');
                  setActiveTab('dashboard');
                }}
                onInspectEvidence={(evt) => setModalEvent(evt)}
              />
            </div>
          )}

          {/* MISSIONS HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="my-2">
              <MissionHistory
                events={events}
                onSelectEvent={(evt) => {
                  setSelectedEvent(evt);
                  setActiveTab('dashboard');
                }}
              />
            </div>
          )}

          {/* NET & SIK SETUP TAB */}
          {activeTab === 'receiver' && (
            <div className="my-2">
              <ReceiverStatus
                healthData={healthData}
              />
            </div>
          )}

        </main>

        {/* System Status Footer Bar */}
        <SystemStatusBar
          isConnected={isConnected}
          stats={stats}
          lastUpdate={lastUpdate}
        />

      </div>

      {/* Optical Evidence Lightbox Modal */}
      {modalEvent && (
        <EvidenceModal
          event={modalEvent}
          onClose={() => setModalEvent(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

    </div>
  );
}
