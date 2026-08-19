import React, { useState } from 'react';
import { 
  Truck as TruckIcon, 
  MapPin, 
  Eye, 
  Layers, 
  Navigation, 
  Fuel, 
  Battery, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Maximize2, 
  Compass, 
  Flame, 
  Building2, 
  Home,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';
import { Truck, Zone, StreetSegment, VehicleType } from '../types';

interface LiveMapProps {
  trucks: Truck[];
  zones: Zone[];
  streets: StreetSegment[];
  selectedTruckId: string | null;
  setSelectedTruckId: (id: string | null) => void;
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;
  onNavigateToResidentWithStreet?: (streetName: string) => void;
  onOpenAiOptimizer?: () => void;
  onTriggerCompaction?: (truckId: string) => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  trucks,
  zones,
  streets,
  selectedTruckId,
  setSelectedTruckId,
  selectedZoneId,
  setSelectedZoneId,
  onNavigateToResidentWithStreet,
  onOpenAiOptimizer,
  onTriggerCompaction,
}) => {
  // Layer toggles
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showStreets, setShowStreets] = useState<boolean>(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState<boolean>(true);
  const [showDepots, setShowDepots] = useState<boolean>(true);
  const [showTrafficHotspots, setShowTrafficHotspots] = useState<boolean>(false);
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  const selectedTruck = trucks.find((t) => t.id === selectedTruckId);
  const selectedZone = zones.find((z) => z.id === selectedZoneId);

  const filteredTrucks = trucks.filter((truck) => {
    if (vehicleFilter === 'all') return true;
    return truck.vehicleType === vehicleFilter;
  });

  const getVehicleBadgeColor = (type: VehicleType) => {
    switch (type) {
      case 'organic_compost':
        return 'bg-emerald-600 text-white';
      case 'recyclables':
        return 'bg-sky-600 text-white';
      case 'general_waste':
        return 'bg-slate-700 text-white';
      case 'bulky_waste':
        return 'bg-purple-600 text-white';
      case 'street_sweeper':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collecting':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-700/60';
      case 'en_route':
        return 'text-sky-400 bg-sky-950/80 border-sky-700/60';
      case 'compacting':
        return 'text-amber-400 bg-amber-950/80 border-amber-700/60';
      case 'delayed':
        return 'text-rose-400 bg-rose-950/80 border-rose-700/60';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-950 overflow-hidden">
      {/* Map Main Canvas Container */}
      <div className="flex-1 relative flex flex-col min-h-[500px] lg:min-h-[640px] bg-slate-950 overflow-hidden border-r border-slate-800">
        {/* Floating Top Controls & Layer Selector */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-full">
          {/* Layer Pills */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl text-xs text-white">
            <button
              id="toggle-layer-zones"
              onClick={() => setShowZones(!showZones)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                showZones ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Wards
            </button>
            <button
              id="toggle-layer-streets"
              onClick={() => setShowStreets(!showStreets)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                showStreets ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Streets
            </button>
            <button
              id="toggle-layer-breadcrumbs"
              onClick={() => setShowBreadcrumbs(!showBreadcrumbs)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                showBreadcrumbs ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live GPS Trails
            </button>
            <button
              id="toggle-layer-hotspots"
              onClick={() => setShowTrafficHotspots(!showTrafficHotspots)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                showTrafficHotspots ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Traffic Chokepoints
            </button>
          </div>

          {/* Vehicle Filter Dropdown */}
          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/80 shadow-xl text-xs flex items-center gap-1.5 text-slate-300">
            <TruckIcon className="w-3.5 h-3.5 text-emerald-400" />
            <select
              id="select-vehicle-filter"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Vehicle Types ({trucks.length})</option>
              <option value="organic_compost" className="bg-slate-900 text-white">Organics / Compost</option>
              <option value="recyclables" className="bg-slate-900 text-white">Dry Recyclables</option>
              <option value="general_waste" className="bg-slate-900 text-white">General Trash</option>
              <option value="bulky_waste" className="bg-slate-900 text-white">Bulky / Hazardous</option>
            </select>
          </div>
        </div>

        {/* Legend Overlay at Bottom Left */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl text-xs text-slate-300 pointer-events-auto hidden sm:block max-w-xs">
          <div className="font-semibold text-white mb-1.5 flex items-center justify-between">
            <span>Live Street Status</span>
            <span className="text-[10px] text-slate-400">GIS Real-Time</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-400 rounded-full animate-pulse"></span>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-slate-600 rounded-full border border-slate-500"></span>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-rose-500 rounded-full"></span>
              <span>Delayed / Obstacle</span>
            </div>
          </div>
        </div>

        {/* Interactive SVG GIS Map Canvas */}
        <div className="w-full h-full flex-1 flex items-center justify-center p-2 sm:p-4 select-none relative overflow-auto">
          <svg
            viewBox="0 0 1000 620"
            className="w-full h-full max-h-[75vh] object-contain drop-shadow-2xl"
            style={{ backgroundColor: '#090d16' }}
          >
            {/* Definitions / Gradients */}
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>

              {/* Glowing filters */}
              <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Grid Lines */}
            <rect width="1000" height="620" fill="url(#grid-pattern)" />

            {/* River / Natural Waterway in Background */}
            <path
              d="M 345 30 Q 360 180 350 320 T 360 600"
              fill="none"
              stroke="#0369a1"
              strokeWidth="24"
              strokeOpacity="0.25"
              strokeLinecap="round"
            />
            <path
              d="M 345 30 Q 360 180 350 320 T 360 600"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="6"
              strokeOpacity="0.3"
            />

            {/* 1. Zone Polygons & Boundaries */}
            {showZones &&
              zones.map((zone) => {
                const isSelected = selectedZoneId === zone.id;
                const pathStr = zone.polygon
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                  .join(' ') + ' Z';

                return (
                  <g 
                    key={zone.id} 
                    onClick={() => {
                      setSelectedZoneId(isSelected ? null : zone.id);
                    }}
                    className="cursor-pointer transition-all duration-300"
                  >
                    {/* Zone Fill */}
                    <path
                      d={pathStr}
                      fill={zone.fillColor}
                      stroke={zone.color}
                      strokeWidth={isSelected ? 3 : 1.5}
                      strokeDasharray={isSelected ? 'none' : '4,3'}
                      strokeOpacity={isSelected ? 0.9 : 0.4}
                      className="hover:stroke-opacity-100 hover:fill-opacity-30 transition-all"
                    />

                    {/* Zone Label & Stats */}
                    <g transform={`translate(${zone.center.x}, ${zone.center.y - 65})`}>
                      <rect
                        x="-65"
                        y="-14"
                        width="130"
                        height="28"
                        rx="6"
                        fill="#0f172a"
                        fillOpacity="0.85"
                        stroke={zone.color}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#f8fafc"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {zone.code}: {zone.completionPercent}% done
                      </text>
                    </g>
                  </g>
                );
              })}

            {/* 2. Municipal Depots & Disposal Facilities */}
            {showDepots && (
              <g id="map-depots">
                {/* Central Depot */}
                <g transform="translate(490, 270)" className="cursor-pointer">
                  <circle r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <Building2 x="-8" y="-8" width="16" height="16" color="#38bdf8" />
                  <text x="0" y="24" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="bold">
                    Central Eco Hub
                  </text>
                </g>

                {/* West Sorting Facility */}
                <g transform="translate(80, 270)" className="cursor-pointer">
                  <circle r="13" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                  <Building2 x="-6" y="-6" width="12" height="12" color="#10b981" />
                  <text x="0" y="20" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    West Yard
                  </text>
                </g>

                {/* East Recycling Center */}
                <g transform="translate(920, 270)" className="cursor-pointer">
                  <circle r="13" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.5" />
                  <Building2 x="-6" y="-6" width="12" height="12" color="#8b5cf6" />
                  <text x="0" y="20" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    East Bio Center
                  </text>
                </g>
              </g>
            )}

            {/* 3. Street Network Segments */}
            {showStreets &&
              streets.map((street) => {
                const pathStr = street.path
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                  .join(' ');

                let strokeColor = '#334155';
                let strokeWidth = 3;
                let isDashed = false;
                let glowFilter = '';

                if (street.status === 'completed') {
                  strokeColor = '#10b981'; // emerald
                  strokeWidth = 3.5;
                } else if (street.status === 'in_progress') {
                  strokeColor = '#f59e0b'; // amber
                  strokeWidth = 4;
                  glowFilter = 'url(#glow-amber)';
                } else if (street.status === 'delayed') {
                  strokeColor = '#f43f5e'; // rose
                  strokeWidth = 4;
                } else {
                  strokeColor = '#334155'; // pending
                  isDashed = true;
                }

                return (
                  <g key={street.id} className="cursor-pointer group">
                    {/* Background wider hit target */}
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="14"
                      onClick={() => {
                        if (onNavigateToResidentWithStreet) {
                          onNavigateToResidentWithStreet(street.name);
                        }
                      }}
                    />
                    {/* Visible Road Segment */}
                    <path
                      d={pathStr}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={isDashed ? '6,6' : 'none'}
                      filter={glowFilter}
                      className="transition-all duration-300"
                    />

                    {/* Street Name Label on Midpoint (optional subtle text) */}
                    {street.path.length >= 2 && (
                      <text
                        x={(street.path[0].x + street.path[street.path.length - 1].x) / 2}
                        y={(street.path[0].y + street.path[street.path.length - 1].y) / 2 - 6}
                        fill="#64748b"
                        fontSize="7.5"
                        textAnchor="middle"
                        className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono"
                      >
                        {street.name} ({street.binsCollected}/{street.households} bins)
                      </text>
                    )}
                  </g>
                );
              })}

            {/* 4. Truck Route Breadcrumbs Trails */}
            {showBreadcrumbs &&
              filteredTrucks.map((truck) => {
                if (truck.route.length < 2) return null;
                const pathStr = truck.route
                  .slice(0, truck.currentWaypointIndex + 1)
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                  .join(' ');

                return (
                  <path
                    key={`trail-${truck.id}`}
                    d={pathStr}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="2,3"
                    strokeOpacity="0.6"
                  />
                );
              })}

            {/* 5. Live Municipal Trucks */}
            {filteredTrucks.map((truck) => {
              const isSelected = selectedTruckId === truck.id;

              return (
                <g
                  key={truck.id}
                  transform={`translate(${truck.position.x}, ${truck.position.y})`}
                  onClick={() => setSelectedTruckId(isSelected ? null : truck.id)}
                  className="cursor-pointer transition-transform duration-700 ease-out"
                >
                  {/* Selection Ripple Ring */}
                  {isSelected && (
                    <circle
                      r="22"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Pulsing Aura if Collecting or Compacting */}
                  {truck.status === 'collecting' && (
                    <circle r="18" fill="rgba(16, 185, 129, 0.2)" className="animate-pulse" />
                  )}
                  {truck.status === 'delayed' && (
                    <circle r="18" fill="rgba(244, 63, 94, 0.25)" className="animate-pulse" />
                  )}

                  {/* Vehicle Body Circle */}
                  <circle
                    r="12"
                    fill="#0f172a"
                    stroke={
                      truck.status === 'delayed' ? '#f43f5e' :
                      truck.status === 'compacting' ? '#f59e0b' :
                      '#10b981'
                    }
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Direction Heading Pointer */}
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.cos((truck.headingAngle * Math.PI) / 180) * 16}
                    y2={Math.sin((truck.headingAngle * Math.PI) / 180) * 16}
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Vehicle Type Icon Representation */}
                  <TruckIcon
                    x="-6"
                    y="-6"
                    width="12"
                    height="12"
                    className={`${
                      truck.vehicleType === 'organic_compost' ? 'text-emerald-400' :
                      truck.vehicleType === 'recyclables' ? 'text-sky-400' :
                      truck.vehicleType === 'bulky_waste' ? 'text-purple-400' :
                      'text-slate-200'
                    }`}
                  />

                  {/* Floating Truck Badge Label */}
                  <g transform="translate(0, -18)">
                    <rect
                      x="-24"
                      y="-12"
                      width="48"
                      height="14"
                      rx="3"
                      fill="#020617"
                      fillOpacity="0.9"
                      stroke={isSelected ? '#38bdf8' : '#334155'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-3"
                      fill="#ffffff"
                      fontSize="8.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {truck.code}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Side Inspector Drawer (for selected truck or zone) */}
      <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[500px] lg:max-h-full">
        {selectedTruck ? (
          /* TRUCK INSPECTOR PANEL */
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded border border-sky-500/30">
                    {selectedTruck.code}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor(selectedTruck.status)}`}>
                    {selectedTruck.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">{selectedTruck.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  {selectedTruck.zoneName}
                </p>
              </div>
              <button
                id="btn-close-inspector"
                onClick={() => setSelectedTruckId(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 p-1.5 rounded-lg border border-slate-700"
              >
                Close
              </button>
            </div>

            {/* Alert banner if delayed or compacting */}
            {selectedTruck.activeAlert && (
              <div className="bg-amber-950/60 border border-amber-800/80 rounded-xl p-2.5 text-xs text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Active Telemetry Alert</span>
                  <span>{selectedTruck.activeAlert}</span>
                </div>
              </div>
            )}

            {/* Key Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Current Speed</span>
                <span className="text-base font-bold text-white font-mono">{selectedTruck.speedKmh} km/h</span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Bin Load Weight</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {selectedTruck.currentLoadTons} / {selectedTruck.capacityTons} T ({selectedTruck.loadPercent}%)
                </span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Fuel / Battery</span>
                  <span className="font-bold text-white">{selectedTruck.fuelLevelPercent}%</span>
                </div>
                <Fuel className="w-4 h-4 text-sky-400" />
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Est. Zone Finish</span>
                  <span className="font-bold text-purple-300">{selectedTruck.estimatedZoneFinishTime}</span>
                </div>
                <Navigation className="w-4 h-4 text-purple-400" />
              </div>
            </div>

            {/* Active Street & Next Waypoint */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Street:</span>
                <span className="font-semibold text-white">{selectedTruck.currentStreet}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-700/50 pt-2">
                <span className="text-slate-400">Next Destination:</span>
                <span className="font-semibold text-sky-300">{selectedTruck.nextStreet}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-700/50 pt-2">
                <span className="text-slate-400">Stops Progress:</span>
                <span className="font-bold text-emerald-400">
                  {selectedTruck.stopsCompleted} / {selectedTruck.totalStops} completed
                </span>
              </div>
            </div>

            {/* Driver Profile */}
            <div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-600/30 text-sky-300 flex items-center justify-center font-bold">
                  {selectedTruck.driver.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-slate-200 block">{selectedTruck.driver}</span>
                  <span className="text-[11px] text-slate-400">Driver on duty</span>
                </div>
              </div>
              <a
                href={`tel:${selectedTruck.driverPhone}`}
                className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded-lg transition-colors text-[11px]"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                Call
              </a>
            </div>

            {/* Quick Actions for this truck */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-truck-resident-view"
                onClick={() => {
                  if (onNavigateToResidentWithStreet) {
                    onNavigateToResidentWithStreet(selectedTruck.currentStreet);
                  }
                }}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
              >
                <Eye className="w-3.5 h-3.5" />
                Track in Resident Portal
              </button>

              {onTriggerCompaction && selectedTruck.status !== 'compacting' && (
                <button
                  id="btn-truck-compact-cycle"
                  onClick={() => onTriggerCompaction(selectedTruck.id)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  Run Compactor Cycle
                </button>
              )}
            </div>
          </div>
        ) : selectedZone ? (
          /* ZONE INSPECTOR PANEL */
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: selectedZone.color }}>
                  {selectedZone.code}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{selectedZone.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Population: {selectedZone.populationServed.toLocaleString()} residents</p>
              </div>
              <button
                onClick={() => setSelectedZoneId(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 p-1.5 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Progress Box */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Zone Coverage</span>
                <span className="font-bold text-emerald-400 text-sm">{selectedZone.completionPercent}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${selectedZone.completionPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                <span>Completed: {selectedZone.completedStreets} sts</span>
                <span>In Progress: {selectedZone.inProgressStreets}</span>
                <span>Pending: {selectedZone.pendingStreets}</span>
              </div>
            </div>

            {/* Waste Type Today */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-xs space-y-1.5">
              <span className="text-slate-400 block">Today's Collection Service:</span>
              <span className="font-semibold text-sky-300 block">{selectedZone.wasteTypeToday}</span>
              <span className="text-[11px] text-slate-400 block">Window: {selectedZone.collectionWindow}</span>
            </div>

            {/* Hotspots */}
            {selectedZone.hotspots && (
              <div className="space-y-1 text-xs">
                <span className="text-slate-400 font-medium">Key Neighborhood Hotspots:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedZone.hotspots.map((spot, i) => (
                    <span key={i} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                      {spot}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* DEFAULT MAP INSTRUCTIONS & QUICK STATS */
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-400" />
                Live Fleet Telemetry Explorer
              </h3>
              <p className="text-slate-400 mt-1">
                Click any animated vehicle or street corridor to inspect instant speed, fuel, bin load, and ETA timing.
              </p>
            </div>

            {/* Quick Fleet Highlights */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300 block text-xs">Active Vehicles On Route:</span>
              <div className="space-y-1.5">
                {trucks.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTruckId(t.id)}
                    className="flex items-center justify-between bg-slate-800/60 hover:bg-slate-800 p-2 rounded-xl border border-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] text-sky-400">{t.code}</span>
                      <span className="text-slate-200 truncate max-w-[130px] font-medium">{t.name.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        t.status === 'collecting' ? 'bg-emerald-950 text-emerald-300' :
                        t.status === 'delayed' ? 'bg-rose-950 text-rose-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Optimization Trigger CTA */}
            {onOpenAiOptimizer && (
              <div className="bg-gradient-to-br from-purple-950/60 to-indigo-950/60 border border-purple-800/50 rounded-xl p-3 text-purple-200 mt-4">
                <div className="flex items-center gap-2 font-bold text-white text-xs mb-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Gemini Route Intelligence
                </div>
                <p className="text-[11px] text-purple-300 mb-2">
                  Analyze citywide congestion, bin fill levels, and recommend dynamic reroutes.
                </p>
                <button
                  id="btn-open-ai-from-map"
                  onClick={onOpenAiOptimizer}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Analyze Efficiency
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
