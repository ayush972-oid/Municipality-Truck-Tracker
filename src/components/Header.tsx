import React from 'react';
import { 
  Truck as TruckIcon, 
  MapPin, 
  Bell, 
  Sparkles, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  FileText,
  Radio,
  Zap
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'map' | 'resident' | 'fleet' | 'ai' | 'tickets';
  setActiveTab: (tab: 'map' | 'resident' | 'fleet' | 'ai' | 'tickets') => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  onResetSim: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  simTime: string;
  activeAlertCount: number;
  onTriggerRandomIncident: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSimulating,
  setIsSimulating,
  simSpeed,
  setSimSpeed,
  onResetSim,
  soundEnabled,
  setSoundEnabled,
  simTime,
  activeAlertCount,
  onTriggerRandomIncident,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top Banner / Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-950/80 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wide uppercase">Live Telemetry GPS Feed</span>
          </div>
          <span className="hidden sm:inline text-slate-400">|</span>
          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Sim Clock: <strong className="text-white">{simTime}</strong></span>
          </div>
        </div>

        {/* Simulation Controls & Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Play / Pause */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              id="btn-play-pause"
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isSimulating 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-amber-600/90 text-white hover:bg-amber-500'
              }`}
              title={isSimulating ? 'Pause live movement' : 'Start live movement'}
            >
              {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isSimulating ? 'Live' : 'Paused'}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center px-1 text-slate-400 gap-1 border-l border-slate-700 ml-1">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  id={`btn-speed-${speed}x`}
                  onClick={() => setSimSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    simSpeed === speed 
                      ? 'bg-sky-500 text-white font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Reset */}
            <button
              id="btn-reset-sim"
              onClick={onResetSim}
              className="p-1 hover:text-white text-slate-400 hover:bg-slate-700 rounded transition-colors border-l border-slate-700 ml-1"
              title="Reset simulation day"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Random Incident Generator (for demo) */}
          <button
            id="btn-trigger-incident"
            onClick={onTriggerRandomIncident}
            className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded text-xs font-medium transition-colors"
            title="Simulate traffic congestion or compaction hold"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Simulate</span> Event
          </button>

          {/* Audio toggle */}
          <button
            id="btn-sound-toggle"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled 
                ? 'bg-slate-800 text-sky-400 border-slate-700' 
                : 'bg-slate-800/50 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Mute notification sound' : 'Enable notification audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Header Brand & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <TruckIcon className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                MuniTrack
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Fleet & Waste Ops
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Real-time municipal truck timing, area coverage telemetry & resident notifications
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            id="tab-nav-map"
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'map'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Live GIS Map
          </button>

          <button
            id="tab-nav-resident"
            onClick={() => setActiveTab('resident')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'resident'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Resident Tracker & ETA
          </button>

          <button
            id="tab-nav-fleet"
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'fleet'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TruckIcon className="w-3.5 h-3.5" />
            Fleet Command
            {activeAlertCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {activeAlertCount}
              </span>
            )}
          </button>

          <button
            id="tab-nav-ai"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                : 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            AI Route Optimizer
          </button>

          <button
            id="tab-nav-tickets"
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'tickets'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Missed Pickups
          </button>
        </nav>
      </div>
    </header>
  );
};
