import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import HazardClassificationPanel from './components/HazardClassificationPanel';
import EventMap from './components/EventMap';
import EmergencyAlertsPanel from './components/EmergencyAlertsPanel';
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load initial dataset
  const loadData = useCallback(async () => {
    try {
      const [eventsRes, statsRes, healthRes] = await Promise.all([
        fetchEvents(filters),
        fetchStats(),
        fetchHealth().catch(() => null)
      ]);
      setEvents(eventsRes.events || []);
      setStats(statsRes);
      if (healthRes) setHealthData(healthRes);
      if (eventsRes.events && eventsRes.events.length > 0) {
        setLastUpdate(eventsRes.events[0].timestamp || new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to load Ground Station dataset:', err);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Connect WebSocket & Listen for Live Detection Broadcasts
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
        setLastUpdate(new Date().toISOString());
        fetchStats().then(setStats).catch(() => {});
      }
    });

    return () => {
      unsubStatus();
      unsubMessage();
      wsClient.disconnect();
    };
  }, []);

  // Trigger Mock Event Ingest
  const handleTriggerMock = async (channel = 'WIFI') => {
    try {
      await sendMockEvent(null, channel);
    } catch (err) {
      console.error('Failed to emit mock event:', err);
    }
  };

  // Status Update Handler
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
    <div className="min-h-screen flex flex-col bg-[#060911] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Top Command Center Telemetry Header */}
      <Header
        isConnected={isConnected}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onTriggerMock={handleTriggerMock}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Command Console Workspace Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 flex flex-col gap-3 pb-2 min-h-0">
        
        {activeTab === 'dashboard' && (
          <>
            {/* Top KPI Metric Cards Bar */}
            <StatsOverview
              stats={stats}
              activeFilter={filters}
              onSelectFilter={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
            />

            {/* 3-Column Command Center Upper Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[540px]">
              
              {/* Left Column (3 cols): AI Hazard Classification Panel */}
              <div className="lg:col-span-3 h-full">
                <HazardClassificationPanel
                  stats={stats}
                  events={events}
                  activeFilter={filters}
                  onSelectFilter={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
                  onSelectEvent={setSelectedEvent}
                />
              </div>

              {/* Center Column (6 cols): Dominant Live GIS Map */}
              <div className="lg:col-span-6 h-full">
                <EventMap
                  events={events}
                  selectedEvent={selectedEvent}
                  onSelectEvent={setSelectedEvent}
                />
              </div>

              {/* Right Column (3 cols): Emergency Alerts Panel */}
              <div className="lg:col-span-3 h-full">
                <EmergencyAlertsPanel
                  events={events}
                  onSelectEvent={setSelectedEvent}
                  onAcknowledgeStatus={(id) => handleUpdateStatus(id, 'ACKNOWLEDGED')}
                />
              </div>

            </div>

            {/* Bottom Panel: Recent Events Feed & Telemetry Table */}
            <div className="w-full">
              <EventFeed
                events={events}
                filters={filters}
                setFilters={setFilters}
                onSelectEvent={setSelectedEvent}
                onAcknowledgeStatus={(id) => handleUpdateStatus(id, 'ACKNOWLEDGED')}
              />
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="my-2">
            <MissionHistory
              events={events}
              onSelectEvent={setSelectedEvent}
            />
          </div>
        )}

        {activeTab === 'receiver' && (
          <div className="my-2">
            <ReceiverStatus
              healthData={healthData}
            />
          </div>
        )}

      </main>

      {/* Tactical System Status Bar */}
      <SystemStatusBar
        isConnected={isConnected}
        stats={stats}
        lastUpdate={lastUpdate}
      />

      {/* Optical Evidence Lightbox Modal */}
      <EvidenceModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onUpdateStatus={handleUpdateStatus}
      />

    </div>
  );
}
