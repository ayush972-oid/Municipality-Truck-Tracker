import React, { useState } from 'react';
import { 
  Truck as TruckIcon, 
  MapPin, 
  Fuel, 
  Battery, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Filter, 
  Navigation, 
  SlidersHorizontal,
  Clock,
  Zap,
  RotateCw,
  Search
} from 'lucide-react';
import { Truck, Zone, VehicleType, TruckStatus } from '../types';

interface FleetDashboardProps {
  trucks: Truck[];
  zones: Zone[];
  onSelectTruck: (truckId: string) => void;
  onTriggerCompaction: (truckId: string) => void;
  onTriggerDelay: (truckId: string) => void;
  onResolveDelay: (truckId: string) => void;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  trucks,
  zones,
  onSelectTruck,
  onTriggerCompaction,
  onTriggerDelay,
  onResolveDelay,
}) => {
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTrucks = trucks.filter((truck) => {
    if (filterZone !== 'all' && truck.currentZoneId !== filterZone) return false;
    if (filterStatus !== 'all' && truck.status !== filterStatus) return false;
    if (filterType !== 'all' && truck.vehicleType !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        truck.name.toLowerCase().includes(q) ||
        truck.code.toLowerCase().includes(q) ||
        truck.driver.toLowerCase().includes(q) ||
        truck.currentStreet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: TruckStatus) => {
    switch (status) {
      case 'collecting':
        return (
          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Collecting
          </span>
        );
      case 'en_route':
        return (
          <span className="bg-sky-950/80 text-sky-400 border border-sky-800/60 px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <Navigation className="w-2.5 h-2.5" />
            En Route
          </span>
        );
      case 'compacting':
        return (
          <span className="bg-amber-950/80 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 animate-pulse">
            <RefreshCw className="w-2.5 h-2.5" />
            Compacting
          </span>
        );
      case 'delayed':
        return (
          <span className="bg-rose-950/80 text-rose-400 border border-rose-800/60 px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            Delayed (+15m)
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full text-[11px] font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Console Title & Control Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-indigo-500/20 mb-1.5">
            <TruckIcon className="w-3.5 h-3.5" />
            Municipal Fleet Dispatch Command
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Vehicle Telemetry & Timing Console</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time vehicle load capacities, GPS speed, active stop progression, and driver assignments.
          </p>
        </div>

        {/* Search input */}
        <div className="w-full md:w-72">
          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              id="input-fleet-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search truck ID, driver, street..."
              className="w-full bg-transparent text-white focus:outline-none placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl text-xs text-slate-300">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
          <span>Filters:</span>
        </div>

        {/* Zone Selector */}
        <select
          id="filter-fleet-zone"
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
        >
          <option value="all">All Wards (6)</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.code}: {z.name.split(' - ')[1]}
            </option>
          ))}
        </select>

        {/* Status Selector */}
        <select
          id="filter-fleet-status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
        >
          <option value="all">All Operational Statuses</option>
          <option value="collecting">Collecting (Active)</option>
          <option value="en_route">En Route</option>
          <option value="compacting">Compacting Cycle</option>
          <option value="delayed">Delayed</option>
        </select>

        {/* Type Selector */}
        <select
          id="filter-fleet-type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
        >
          <option value="all">All Waste Streams</option>
          <option value="organic_compost">Organic Waste & Scraps</option>
          <option value="recyclables">Dry Recyclables</option>
          <option value="general_waste">General Trash</option>
          <option value="bulky_waste">Bulky / Hazardous</option>
        </select>

        <span className="ml-auto text-slate-400 font-mono text-[11px]">
          Showing {filteredTrucks.length} of {trucks.length} trucks
        </span>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTrucks.map((truck) => (
          <div
            key={truck.id}
            id={`truck-card-${truck.id}`}
            className={`bg-slate-900 border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-all hover:border-sky-500/80 ${
              truck.status === 'delayed' ? 'border-rose-800/80 bg-rose-950/10' : 'border-slate-800'
            }`}
          >
            <div className="space-y-3">
              {/* Header with code and badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-slate-800 text-sky-400 px-2 py-0.5 rounded border border-slate-700">
                      {truck.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{truck.zoneName}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mt-1.5 line-clamp-1">{truck.name}</h3>
                </div>
                {getStatusBadge(truck.status)}
              </div>

              {/* Delay Warning if active */}
              {truck.activeAlert && (
                <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-2 text-xs text-rose-200 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">{truck.activeAlert}</span>
                </div>
              )}

              {/* Load Capacity Bar */}
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Bin Load Fill:</span>
                  <span className={`font-bold font-mono ${
                    truck.loadPercent >= 80 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {truck.currentLoadTons} / {truck.capacityTons} T ({truck.loadPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      truck.loadPercent >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${truck.loadPercent}%` }}
                  />
                </div>
              </div>

              {/* Key Location Details */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Street:</span>
                  <span className="font-semibold text-white truncate max-w-[150px]">{truck.currentStreet}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Next Destination:</span>
                  <span className="text-sky-300 truncate max-w-[150px]">{truck.nextStreet}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stop Progress:</span>
                  <span className="font-bold text-emerald-400">{truck.stopsCompleted}/{truck.totalStops}</span>
                </div>
              </div>

              {/* Driver & Telemetry */}
              <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded-xl border border-slate-700/40 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Driver on Shift:</span>
                  <span className="font-semibold text-slate-200">{truck.driver}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Speed / Fuel:</span>
                  <span className="font-mono text-white">{truck.speedKmh} km/h • {truck.fuelLevelPercent}%</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <button
                id={`btn-view-map-${truck.id}`}
                onClick={() => onSelectTruck(truck.id)}
                className="flex-1 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-600/40 rounded-xl text-xs font-semibold text-center transition-colors"
              >
                Track on Map
              </button>

              {truck.status === 'delayed' ? (
                <button
                  id={`btn-resolve-delay-${truck.id}`}
                  onClick={() => onResolveDelay(truck.id)}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors"
                  title="Mark obstacle cleared"
                >
                  Resolve
                </button>
              ) : (
                <button
                  id={`btn-compact-${truck.id}`}
                  onClick={() => onTriggerCompaction(truck.id)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
                  title="Trigger hydraulic compaction"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
