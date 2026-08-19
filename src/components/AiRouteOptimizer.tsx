import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  Fuel, 
  Clock, 
  Send, 
  CheckCircle2, 
  RefreshCw, 
  Smartphone, 
  Bell, 
  Mail, 
  Compass, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';
import { Truck, Zone, RouteOptimizationReport, ResidentBroadcast, NotificationLog } from '../types';
import { requestAiRouteOptimization, requestAiBroadcast } from '../services/api';
import confetti from 'canvas-confetti';

interface AiRouteOptimizerProps {
  trucks: Truck[];
  zones: Zone[];
  cityCoveragePercent: number;
  onApplyDynamicReroute: (suggestion: any) => void;
  onAddNotification: (notif: NotificationLog) => void;
}

export const AiRouteOptimizer: React.FC<AiRouteOptimizerProps> = ({
  trucks,
  zones,
  cityCoveragePercent,
  onApplyDynamicReroute,
  onAddNotification,
}) => {
  // Optimization report state
  const [report, setReport] = useState<RouteOptimizationReport | null>(null);
  const [loadingOptimization, setLoadingOptimization] = useState<boolean>(false);
  const [rerouteApplied, setRerouteApplied] = useState<boolean>(false);

  // Broadcast generator state
  const [broadcastZone, setBroadcastZone] = useState<string>(zones[4].name); // Ward 5 default (delayed)
  const [issueType, setIssueType] = useState<string>('Commercial Traffic Delay & Reroute');
  const [delayMinutes, setDelayMinutes] = useState<number>(15);
  const [weatherCondition, setWeatherCondition] = useState<string>('Clear Skies');
  const [generatedBroadcast, setGeneratedBroadcast] = useState<ResidentBroadcast | null>(null);
  const [loadingBroadcast, setLoadingBroadcast] = useState<boolean>(false);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  // Run Route Optimization
  const handleRunOptimization = async () => {
    setLoadingOptimization(true);
    setRerouteApplied(false);
    try {
      const activeAlerts = trucks.filter((t) => t.activeAlert).map((t) => ({
        truck: t.code,
        alert: t.activeAlert,
        zone: t.zoneName,
      }));

      const res = await requestAiRouteOptimization({
        fleetData: trucks.map((t) => ({
          code: t.code,
          zone: t.zoneName,
          status: t.status,
          loadPercent: t.loadPercent,
          currentLoadTons: t.currentLoadTons,
          speedKmh: t.speedKmh,
          stopsCompleted: t.stopsCompleted,
          totalStops: t.totalStops,
        })),
        zonesData: zones.map((z) => ({
          name: z.name,
          completionPercent: z.completionPercent,
          status: z.status,
          wasteTypeToday: z.wasteTypeToday,
        })),
        cityCoveragePercent,
        activeAlerts,
      });

      setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOptimization(false);
    }
  };

  // Run Broadcast Generator
  const handleGenerateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingBroadcast(true);
    setBroadcastSent(false);
    try {
      const affectedStreets = ['Metro Center Plaza', 'Financial District Way', 'Commerce Exchange Ave'];
      const res = await requestAiBroadcast({
        zoneName: broadcastZone,
        issueType,
        delayMinutes,
        affectedStreets,
        weatherCondition,
      });
      setGeneratedBroadcast(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBroadcast(false);
    }
  };

  // Apply reroute
  const handleApplyReroute = () => {
    setRerouteApplied(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
    });
    if (report && report.dynamicRerouteSuggestions.length > 0) {
      onApplyDynamicReroute(report.dynamicRerouteSuggestions[0]);
    }
  };

  // Dispatch broadcast to residents
  const handleSendBroadcast = () => {
    if (!generatedBroadcast) return;
    setBroadcastSent(true);

    const newNotif: NotificationLog = {
      id: `broadcast-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'push',
      targetZone: broadcastZone,
      title: generatedBroadcast.pushTitle,
      body: generatedBroadcast.pushBody,
      status: 'delivered',
      priority: 'alert',
    };
    onAddNotification(newNotif);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/60 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold border border-purple-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Powered by Google Gemini 3.7 Flash
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AI Route Efficiency & Intelligent Citizen Advisory Engine
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Dynamically analyze live fleet loads, road friction points, and generate automated natural-language broadcast bulletins for residents.
            </p>
          </div>

          <button
            id="btn-run-ai-optimization"
            onClick={handleRunOptimization}
            disabled={loadingOptimization}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {loadingOptimization ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Analyzing Telemetry...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                Analyze City Route Efficiency
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Route Optimization Report + Broadcast Notice Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Route Efficiency Report */}
        <div className="lg:col-span-7 space-y-6">
          {report ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
              {/* Score & Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider block">
                    City Route Optimization Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {report.efficiencyScore}/100
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      High Efficiency (+8% above avg)
                    </span>
                  </div>
                </div>

                <div className="bg-purple-950/40 border border-purple-800/50 px-3 py-2 rounded-xl text-xs text-purple-200 sm:text-right">
                  <span className="text-[11px] text-purple-400 block">Estimated City Finish:</span>
                  <span className="font-bold text-white font-mono">{report.estimatedCityCompletion}</span>
                </div>
              </div>

              {/* Summary Text */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                {report.summary}
              </p>

              {/* Identified Bottlenecks */}
              {report.bottlenecks && report.bottlenecks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Identified Bottlenecks & Friction Points:
                  </span>
                  <div className="space-y-2">
                    {report.bottlenecks.map((b, i) => (
                      <div
                        key={i}
                        className="bg-amber-950/30 border border-amber-800/50 p-3 rounded-xl text-xs space-y-1 text-amber-200"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-white">{b.zone}</span>
                          <span className="bg-amber-900/60 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {b.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-300/90">{b.issue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Action Recommendations */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Dynamic Route Recommendations:
                </span>
                <div className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="bg-slate-800/70 border border-slate-700/80 p-3.5 rounded-xl text-xs space-y-1.5 text-slate-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{rec.action}</span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-400 font-semibold font-mono">
                            +{rec.expectedTimeSavedMinutes}m saved
                          </span>
                          <span className="text-sky-400 font-mono">
                            -{rec.fuelSavedLiters}L fuel
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">{rec.reasoning}</p>
                      <div className="text-[10px] font-mono text-purple-300">
                        Target Unit: {rec.targetTruck}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Dynamic Reroute CTA */}
              <div className="pt-2">
                <button
                  id="btn-apply-dynamic-reroute"
                  onClick={handleApplyReroute}
                  disabled={rerouteApplied}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    rerouteApplied
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-600/50 cursor-default'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg'
                  }`}
                >
                  {rerouteApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Dynamic Route Rebalancing Active & Dispatched to Trucks!
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      Apply AI Dynamic Reroute to Active Fleet
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg text-center space-y-3">
              <div className="w-12 h-12 bg-purple-950/80 border border-purple-700/60 rounded-2xl mx-auto flex items-center justify-center text-purple-400">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Route Efficiency Engine Ready</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Analyze City Route Efficiency" above to trigger a full Gemini AI audit of fleet capacity, road traffic friction, and delay recovery paths.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Automated Citizen Advisory Broadcast Generator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                AI Resident Broadcast Generator
              </h3>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-semibold border border-purple-500/30">
                Gemini GenAI
              </span>
            </div>

            <form onSubmit={handleGenerateBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Ward / Area:</label>
                <select
                  id="select-broadcast-zone"
                  value={broadcastZone}
                  onChange={(e) => setBroadcastZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.name}>
                      {z.code}: {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Situation / Advisory Reason:</label>
                <select
                  id="select-broadcast-reason"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
                >
                  <option value="Commercial Traffic Delay & Reroute">Commercial Traffic Delay & Reroute</option>
                  <option value="Heavy Morning Rain & Slick Roads">Heavy Morning Weather / Road Conditions</option>
                  <option value="Festival Street Closure Reroute">Street Fair / Festival Reroute</option>
                  <option value="Hydraulic Maintenance Compaction Pause">Routine Equipment Compaction Delay</option>
                  <option value="Early Route Completion Reminder">Early Morning Route Completion Notice</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Timing Shift (Mins):</label>
                  <input
                    type="number"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Weather Condition:</label>
                  <input
                    type="text"
                    value={weatherCondition}
                    onChange={(e) => setWeatherCondition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-generate-broadcast"
                disabled={loadingBroadcast}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow"
              >
                {loadingBroadcast ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Drafting Broadcast...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                    Draft Multi-Channel Bulletin
                  </>
                )}
              </button>
            </form>

            {/* Generated Broadcast Result */}
            {generatedBroadcast && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-white block">Generated Resident Notice:</span>

                {/* SMS Card */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-sky-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3" /> SMS Preview (160 char)
                    </span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px]">{generatedBroadcast.smsText}</p>
                </div>

                {/* Push Notification Card */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Bell className="w-3 h-3" /> Mobile Push Banner
                    </span>
                  </div>
                  <div className="font-bold text-white">{generatedBroadcast.pushTitle}</div>
                  <p className="text-slate-300 text-[11px]">{generatedBroadcast.pushBody}</p>
                </div>

                {/* Recommended Action */}
                <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/50 text-[11px] text-purple-200">
                  <strong className="text-white block">Resident Guidance:</strong>
                  {generatedBroadcast.recommendedAction}
                </div>

                {/* Send Broadcast Action */}
                <button
                  id="btn-send-resident-broadcast"
                  onClick={handleSendBroadcast}
                  disabled={broadcastSent}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    broadcastSent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-sky-600 hover:bg-sky-500 text-white shadow'
                  }`}
                >
                  {broadcastSent ? (
                    <>
                      <Check className="w-4 h-4" />
                      Notice Broadcasted to Residents!
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Broadcast Notice to Residents in {broadcastZone.split(' - ')[0]}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
