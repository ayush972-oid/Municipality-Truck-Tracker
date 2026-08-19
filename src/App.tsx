import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { CoverageStats } from './components/CoverageStats';
import { LiveMap } from './components/LiveMap';
import { ResidentPortal } from './components/ResidentPortal';
import { FleetDashboard } from './components/FleetDashboard';
import { AiRouteOptimizer } from './components/AiRouteOptimizer';
import { TicketsView } from './components/TicketsView';
import { MissedPickupModal } from './components/MissedPickupModal';
import { CitizenChatAssistant } from './components/CitizenChatAssistant';
import { soundFx } from './utils/audio';

import { 
  INITIAL_TRUCKS, 
  INITIAL_ZONES, 
  INITIAL_STREETS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_TICKETS, 
  INITIAL_SUMMARY 
} from './data/mockMunicipalityData';

import { 
  Truck, 
  Zone, 
  StreetSegment, 
  NotificationLog, 
  MissedPickupTicket, 
  CityCoverageSummary 
} from './types';

export default function App() {
  // Navigation & View
  const [activeTab, setActiveTab] = useState<'map' | 'resident' | 'fleet' | 'ai' | 'tickets'>('map');
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedStreetFromMap, setSelectedStreetFromMap] = useState<string>('');

  // Core Data States
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [streets, setStreets] = useState<StreetSegment[]>(INITIAL_STREETS);
  const [notifications, setNotifications] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);
  const [tickets, setTickets] = useState<MissedPickupTicket[]>(INITIAL_TICKETS);
  const [summary, setSummary] = useState<CityCoverageSummary>(INITIAL_SUMMARY);

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [simMinuteOffset, setSimMinuteOffset] = useState<number>(0);

  // Modals
  const [isMissedPickupModalOpen, setIsMissedPickupModalOpen] = useState<boolean>(false);
  const [modalPrefilledStreet, setModalPrefilledStreet] = useState<string>('');

  // Compute Active Alerts count
  const activeAlertCount = useMemo(() => {
    return trucks.filter((t) => t.status === 'delayed' || t.activeAlert).length;
  }, [trucks]);

  // Compute Current Simulated Time string
  const currentSimTime = useMemo(() => {
    const baseHour = 9;
    const baseMinute = 15 + Math.floor(simMinuteOffset);
    const date = new Date();
    date.setHours(baseHour, baseMinute, 0);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [simMinuteOffset]);

  // Handle adding notification log
  const handleAddNotification = useCallback((notif: NotificationLog) => {
    setNotifications((prev) => [notif, ...prev]);
    if (soundEnabled) {
      if (notif.priority === 'alert') {
        soundFx.playWarningTone();
      } else {
        soundFx.playArrivalChime();
      }
    }
  }, [soundEnabled]);

  // Real-time Simulation Engine Loop
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMs = Math.max(800 / simSpeed, 200);

    const timer = setInterval(() => {
      setSimMinuteOffset((prev) => prev + 0.3 * simSpeed);

      setTrucks((prevTrucks) => {
        return prevTrucks.map((truck) => {
          if (truck.status === 'delayed' || truck.status === 'compacting') {
            return truck;
          }

          const route = truck.route;
          if (!route || route.length < 2) return truck;

          const nextIndex = (truck.currentWaypointIndex + 1) % route.length;
          const targetWaypoint = route[nextIndex];
          const currentPos = truck.position;

          // Calculate step vector
          const dx = targetWaypoint.x - currentPos.x;
          const dy = targetWaypoint.y - currentPos.y;
          const distance = Math.hypot(dx, dy);

          const stepSize = (truck.speedKmh > 0 ? truck.speedKmh / 6 : 2) * simSpeed;

          if (distance <= stepSize) {
            // Reached waypoint!
            const newIndex = nextIndex;
            const nextNextIndex = (newIndex + 1) % route.length;
            const nextWaypoint = route[nextNextIndex];

            // Heading calculation
            const newDx = nextWaypoint.x - targetWaypoint.x;
            const newDy = nextWaypoint.y - targetWaypoint.y;
            const angle = (Math.atan2(newDy, newDx) * 180) / Math.PI;

            // Increment stops completed and load
            const updatedStops = Math.min(truck.stopsCompleted + 1, truck.totalStops);
            const addedLoad = 0.08;
            const updatedLoad = Math.min(
              Number((truck.currentLoadTons + addedLoad).toFixed(2)),
              truck.capacityTons
            );
            const updatedLoadPercent = Math.min(
              100,
              Math.round((updatedLoad / truck.capacityTons) * 100)
            );

            return {
              ...truck,
              position: { x: targetWaypoint.x, y: targetWaypoint.y },
              currentWaypointIndex: newIndex,
              headingAngle: Math.round(angle),
              currentStreet: targetWaypoint.streetName,
              nextStreet: nextWaypoint.streetName,
              stopsCompleted: updatedStops,
              currentLoadTons: updatedLoad,
              loadPercent: updatedLoadPercent,
            };
          } else {
            // Step towards waypoint
            const ratio = stepSize / distance;
            const newX = currentPos.x + dx * ratio;
            const newY = currentPos.y + dy * ratio;
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

            return {
              ...truck,
              position: { x: newX, y: newY },
              headingAngle: Math.round(angle),
            };
          }
        });
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, simSpeed]);

  // Synchronize Street & Zone coverage stats based on trucks progress
  useEffect(() => {
    // Update street statuses based on truck stops
    setStreets((prevStreets) => {
      return prevStreets.map((st) => {
        const assignedTruck = trucks.find((t) => t.id === st.assignedTruckId);
        if (assignedTruck && assignedTruck.currentStreet === st.name) {
          return {
            ...st,
            status: assignedTruck.status === 'delayed' ? 'delayed' : 'in_progress',
            binsCollected: Math.min(st.households, st.binsCollected + 1),
          };
        }
        return st;
      });
    });

    // Update Zone completion percentages
    setZones((prevZones) => {
      return prevZones.map((z) => {
        const zoneStreets = streets.filter((s) => s.zoneId === z.id);
        const completed = zoneStreets.filter((s) => s.status === 'completed').length;
        const inProg = zoneStreets.filter((s) => s.status === 'in_progress').length;
        const pending = zoneStreets.filter((s) => s.status === 'pending').length;
        const total = zoneStreets.length || 1;
        const pct = Math.min(100, Math.round(((completed + inProg * 0.5) / total) * 100));

        return {
          ...z,
          completedStreets: completed,
          inProgressStreets: inProg,
          pendingStreets: pending,
          completionPercent: pct,
        };
      });
    });

    // Update Citywide Summary
    const totalSts = streets.length || 1;
    const completedSts = streets.filter((s) => s.status === 'completed').length;
    const inProgSts = streets.filter((s) => s.status === 'in_progress').length;
    const cityPct = Math.min(100, Number((((completedSts + inProgSts * 0.5) / totalSts) * 100).toFixed(1)));
    const totalTons = trucks.reduce((sum, t) => sum + t.currentLoadTons, 0);

    setSummary((prev) => ({
      ...prev,
      cityCompletionPercent: cityPct,
      completedStreets: completedSts,
      inProgressStreets: inProgSts,
      totalTonnageCollected: Number(totalTons.toFixed(1)),
    }));
  }, [trucks]);

  // Reset Simulation Day
  const handleResetSim = () => {
    setTrucks(INITIAL_TRUCKS);
    setZones(INITIAL_ZONES);
    setStreets(INITIAL_STREETS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setTickets(INITIAL_TICKETS);
    setSummary(INITIAL_SUMMARY);
    setSimMinuteOffset(0);
    setIsSimulating(true);
    if (soundEnabled) soundFx.playSuccessTone();
  };

  // Trigger Compaction Cycle on a truck
  const handleTriggerCompaction = (truckId: string) => {
    setTrucks((prev) =>
      prev.map((t) => {
        if (t.id === truckId) {
          return {
            ...t,
            status: 'compacting',
            speedKmh: 0,
            activeAlert: 'Compaction hydraulic cycle active (45s).',
          };
        }
        return t;
      })
    );

    const target = trucks.find((t) => t.id === truckId);
    handleAddNotification({
      id: `compact-${Date.now()}`,
      timestamp: currentSimTime,
      channel: 'system',
      targetZone: target?.zoneName || 'City Area',
      title: `${target?.code || 'Truck'} Compacting`,
      body: `Hydraulic compaction cycle running on ${target?.currentStreet || 'route'}.`,
      status: 'delivered',
      priority: 'normal',
    });

    // Auto resume after 4 seconds simulated
    setTimeout(() => {
      setTrucks((prev) =>
        prev.map((t) => {
          if (t.id === truckId) {
            return {
              ...t,
              status: 'collecting',
              speedKmh: 14,
              activeAlert: undefined,
            };
          }
          return t;
        })
      );
    }, 4000);
  };

  // Trigger Traffic Obstacle / Delay Event
  const handleTriggerDelay = (truckId: string) => {
    setTrucks((prev) =>
      prev.map((t) => {
        if (t.id === truckId) {
          return {
            ...t,
            status: 'delayed',
            speedKmh: 4,
            activeAlert: 'Road works & delivery vehicle congestion (+15m delay).',
            delayedByMinutes: 15,
          };
        }
        return t;
      })
    );

    const target = trucks.find((t) => t.id === truckId);
    handleAddNotification({
      id: `delay-${Date.now()}`,
      timestamp: currentSimTime,
      channel: 'system',
      targetZone: target?.zoneName || 'City Area',
      title: `Delay Alert: ${target?.code}`,
      body: `Congestion on ${target?.currentStreet || 'current corridor'} is slowing collection pace by ~15m.`,
      status: 'delivered',
      priority: 'alert',
    });
  };

  // Resolve Delay on a truck
  const handleResolveDelay = (truckId: string) => {
    setTrucks((prev) =>
      prev.map((t) => {
        if (t.id === truckId) {
          return {
            ...t,
            status: 'collecting',
            speedKmh: 16,
            activeAlert: undefined,
            delayedByMinutes: 0,
          };
        }
        return t;
      })
    );

    if (soundEnabled) soundFx.playSuccessTone();
  };

  // Trigger Random Incident for Demo
  const handleTriggerRandomIncident = () => {
    const activeNonDelayed = trucks.filter((t) => t.status !== 'delayed');
    if (activeNonDelayed.length > 0) {
      const pick = activeNonDelayed[Math.floor(Math.random() * activeNonDelayed.length)];
      handleTriggerDelay(pick.id);
    }
  };

  // Apply AI Dynamic Reroute suggestion
  const handleApplyDynamicReroute = (suggestion: any) => {
    if (!suggestion) return;
    setTrucks((prev) =>
      prev.map((t) => {
        if (t.code === suggestion.truckId || t.id === suggestion.truckId) {
          return {
            ...t,
            status: 'collecting',
            speedKmh: 20,
            activeAlert: 'AI Dynamic Reroute Applied - Bypassing congestion!',
            delayedByMinutes: 0,
          };
        }
        return t;
      })
    );

    handleAddNotification({
      id: `reroute-${Date.now()}`,
      timestamp: currentSimTime,
      channel: 'system',
      targetZone: 'City Operations',
      title: 'AI Dynamic Reroute Deployed',
      body: `Optimized route dispatched to fleet. Expected time saved: 18 minutes.`,
      status: 'delivered',
      priority: 'normal',
    });
  };

  // Log new ticket
  const handleAddTicket = (newTicket: MissedPickupTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    handleAddNotification({
      id: `ticket-log-${Date.now()}`,
      timestamp: currentSimTime,
      channel: 'sms',
      targetZone: newTicket.zoneId,
      title: `Ticket ${newTicket.id} Created`,
      body: `Missed pickup report received for ${newTicket.address}. Sweep truck queued.`,
      status: 'delivered',
      priority: 'normal',
    });
  };

  // Update ticket status
  const handleUpdateTicketStatus = (ticketId: string, status: MissedPickupTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            resolutionNote: status === 'collected' ? 'Collected during secondary sweep run.' : t.resolutionNote,
          };
        }
        return t;
      })
    );
    if (soundEnabled) soundFx.playSuccessTone();
  };

  const handleNavigateToResident = (streetName: string) => {
    setSelectedStreetFromMap(streetName);
    setActiveTab('resident');
  };

  const handleOpenMissedPickupModal = (prefilledStreet?: string) => {
    setModalPrefilledStreet(prefilledStreet || '');
    setIsMissedPickupModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Main Nav & Sim Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        onResetSim={handleResetSim}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        simTime={currentSimTime}
        activeAlertCount={activeAlertCount}
        onTriggerRandomIncident={handleTriggerRandomIncident}
      />

      {/* Citywide Live Telemetry KPI Bar */}
      <CoverageStats
        summary={summary}
        zones={zones}
        activeAlertCount={activeAlertCount}
      />

      {/* Main Tab Content Display */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'map' && (
          <LiveMap
            trucks={trucks}
            zones={zones}
            streets={streets}
            selectedTruckId={selectedTruckId}
            setSelectedTruckId={setSelectedTruckId}
            selectedZoneId={selectedZoneId}
            setSelectedZoneId={setSelectedZoneId}
            onNavigateToResidentWithStreet={handleNavigateToResident}
            onOpenAiOptimizer={() => setActiveTab('ai')}
            onTriggerCompaction={handleTriggerCompaction}
          />
        )}

        {activeTab === 'resident' && (
          <ResidentPortal
            trucks={trucks}
            zones={zones}
            streets={streets}
            notifications={notifications}
            onAddNotification={handleAddNotification}
            onOpenMissedPickupModal={handleOpenMissedPickupModal}
            selectedStreetFromMap={selectedStreetFromMap}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetDashboard
            trucks={trucks}
            zones={zones}
            onSelectTruck={(id) => {
              setSelectedTruckId(id);
              setActiveTab('map');
            }}
            onTriggerCompaction={handleTriggerCompaction}
            onTriggerDelay={handleTriggerDelay}
            onResolveDelay={handleResolveDelay}
          />
        )}

        {activeTab === 'ai' && (
          <AiRouteOptimizer
            trucks={trucks}
            zones={zones}
            cityCoveragePercent={summary.cityCompletionPercent}
            onApplyDynamicReroute={handleApplyDynamicReroute}
            onAddNotification={handleAddNotification}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketsView
            tickets={tickets}
            zones={zones}
            trucks={trucks}
            onOpenNewTicketModal={() => handleOpenMissedPickupModal()}
            onUpdateTicketStatus={handleUpdateTicketStatus}
          />
        )}
      </main>

      {/* Missed Pickup Modal */}
      <MissedPickupModal
        isOpen={isMissedPickupModalOpen}
        onClose={() => setIsMissedPickupModalOpen(false)}
        onSubmitTicket={handleAddTicket}
        zones={zones}
        prefilledStreet={modalPrefilledStreet}
      />

      {/* MuniBot Citizen Assistant AI Widget */}
      <CitizenChatAssistant
        trucks={trucks}
        zones={zones}
        userAddress={selectedStreetFromMap || 'Liberty Bell Way'}
        userZone="Ward 1 - Old Town"
      />
    </div>
  );
}
