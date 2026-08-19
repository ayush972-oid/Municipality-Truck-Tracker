import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Truck, 
  Leaf, 
  AlertCircle, 
  Map, 
  Percent,
  Gauge
} from 'lucide-react';
import { CityCoverageSummary, Zone } from '../types';

interface CoverageStatsProps {
  summary: CityCoverageSummary;
  zones: Zone[];
  activeAlertCount: number;
}

export const CoverageStats: React.FC<CoverageStatsProps> = ({
  summary,
  zones,
  activeAlertCount,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: City Area Covered */}
          <div id="stat-card-coverage" className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">City Area Covered</span>
              <Map className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {summary.cityCompletionPercent.toFixed(1)}%
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {summary.completedStreets}/{summary.totalStreets} sts
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${summary.cityCompletionPercent}%` }}
              />
            </div>
          </div>

          {/* Card 2: On-Time Performance */}
          <div id="stat-card-ontime" className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">On-Time Timing</span>
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {summary.onTimeRatePercent.toFixed(1)}%
              </span>
              <span className="text-[11px] text-sky-400 font-medium">
                Target &gt;90%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
              <span>Pacing 18m ahead</span>
            </div>
          </div>

          {/* Card 3: Active Fleet */}
          <div id="stat-card-fleet" className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">Active Fleet</span>
              <Truck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {summary.activeFleetCount}/8
              </span>
              <span className="text-[11px] text-indigo-400 font-medium">
                100% Deployed
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>All 6 Wards staffed</span>
            </div>
          </div>

          {/* Card 4: Tonnage Collected */}
          <div id="stat-card-tonnage" className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">Collected Tonnage</span>
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {summary.totalTonnageCollected.toFixed(1)} <span className="text-sm font-normal text-slate-300">Tons</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary.totalDistanceTraversedKm.toFixed(0)} km traversed today
            </div>
          </div>

          {/* Card 5: Estimated Finish */}
          <div id="stat-card-finish-time" className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">Projected Completion</span>
              <Clock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-purple-200 tracking-tight">
                {summary.estimatedCityFinishTime}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Full city route cleared
            </div>
          </div>

          {/* Card 6: CO2 Offset */}
          <div id="stat-card-co2" className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-medium">CO₂ Optimized</span>
              <Leaf className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-teal-300 tracking-tight">
                {summary.co2SavedKg.toFixed(0)} <span className="text-sm font-normal text-teal-400/80">kg</span>
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">
              -14% Idle emissions
            </div>
          </div>
        </div>

        {/* Sector Quick Progression Ribbons */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">
            Ward Progress:
          </span>
          <div className="flex items-center gap-2 flex-nowrap">
            {zones.map((zone) => (
              <div 
                key={zone.id} 
                className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/60 whitespace-nowrap"
              >
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: zone.color }}
                />
                <span className="font-medium text-slate-200">{zone.code}:</span>
                <span className={`font-semibold ${
                  zone.completionPercent >= 90 ? 'text-emerald-400' :
                  zone.completionPercent >= 70 ? 'text-sky-400' :
                  'text-amber-400'
                }`}>
                  {zone.completionPercent}%
                </span>
                {zone.status === 'delayed' && (
                  <span className="bg-rose-900/60 text-rose-300 text-[10px] px-1 rounded font-bold">
                    +15m
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
