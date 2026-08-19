import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Truck as TruckIcon, 
  Smartphone, 
  Mail, 
  Volume2, 
  Send, 
  Calendar, 
  Trash2, 
  Recycle, 
  Sparkles,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Truck, Zone, StreetSegment, ResidentSubscription, NotificationLog } from '../types';
import confetti from 'canvas-confetti';

interface ResidentPortalProps {
  trucks: Truck[];
  zones: Zone[];
  streets: StreetSegment[];
  notifications: NotificationLog[];
  onAddNotification: (notif: NotificationLog) => void;
  onOpenMissedPickupModal: (prefilledStreet?: string) => void;
  selectedStreetFromMap?: string;
}

export const ResidentPortal: React.FC<ResidentPortalProps> = ({
  trucks,
  zones,
  streets,
  notifications,
  onAddNotification,
  onOpenMissedPickupModal,
  selectedStreetFromMap,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>(selectedStreetFromMap || 'Liberty Bell Way');
  const [selectedStreetId, setSelectedStreetId] = useState<string>('st-104');
  const [leadTime, setLeadTime] = useState<number>(15);
  const [channels, setChannels] = useState<{ sms: boolean; push: boolean; email: boolean }>({
    sms: true,
    push: true,
    email: false,
  });
  const [phoneNumber, setPhoneNumber] = useState<string>('+1 (555) 019-4820');
  const [emailAddress, setEmailAddress] = useState<string>('resident@citymail.org');
  const [subscribed, setSubscribed] = useState<boolean>(true);
  const [showTestToast, setShowTestToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Active street matching
  const currentStreet = useMemo(() => {
    return streets.find((s) => s.id === selectedStreetId || s.name.toLowerCase().includes(searchQuery.toLowerCase())) || streets[0];
  }, [streets, selectedStreetId, searchQuery]);

  const assignedZone = useMemo(() => {
    return zones.find((z) => z.id === currentStreet.zoneId) || zones[0];
  }, [zones, currentStreet]);

  const assignedTruck = useMemo(() => {
    return trucks.find((t) => t.id === currentStreet.assignedTruckId || t.currentZoneId === assignedZone.id) || trucks[0];
  }, [trucks, currentStreet, assignedZone]);

  // Autocomplete suggestions
  const streetSuggestions = useMemo(() => {
    if (!searchQuery) return streets.slice(0, 5);
    return streets.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [streets, searchQuery]);

  // Calculate ETA and stops away
  const calculateEtaMinutes = () => {
    if (currentStreet.status === 'completed') return 0;
    if (currentStreet.status === 'in_progress') return 4;
    if (assignedTruck.status === 'delayed') return 24;
    return 12;
  };

  const etaMinutes = calculateEtaMinutes();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });

    const newNotif: NotificationLog = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: channels.sms ? 'sms' : 'push',
      targetZone: assignedZone.name,
      title: 'Alert Preferences Updated',
      body: `You will receive a notification ${leadTime} minutes before Truck ${assignedTruck.code} reaches ${currentStreet.name}.`,
      status: 'delivered',
      priority: 'normal',
    };
    onAddNotification(newNotif);

    setToastMessage(`Subscribed for ${currentStreet.name}! Alert will send ${leadTime}m before arrival.`);
    setShowTestToast(true);
    setTimeout(() => setShowTestToast(false), 4500);
  };

  const handleSendTestNotification = () => {
    const newNotif: NotificationLog = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'push',
      targetZone: assignedZone.name,
      title: `Truck ${assignedTruck.code} is ~${etaMinutes} mins away!`,
      body: `Please roll out your ${assignedZone.wasteTypeToday} bins onto ${currentStreet.name}. Driver: ${assignedTruck.driver}.`,
      status: 'simulated',
      priority: 'normal',
    };
    onAddNotification(newNotif);

    setToastMessage(`Simulated Push Notification sent for ${assignedTruck.code} arriving at ${currentStreet.name}!`);
    setShowTestToast(true);
    setTimeout(() => setShowTestToast(false), 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full text-xs font-semibold border border-sky-500/20 mb-3">
            <Bell className="w-3.5 h-3.5" />
            Resident Timing & Notification Portal
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Track Your Municipality Waste Pickup in Real-Time
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 mb-4">
            Enter your street name or neighborhood to see live truck ETA, current block location, and receive proactive bin roll-out reminders.
          </p>

          {/* Search Input Box */}
          <div className="relative">
            <div className="flex items-center bg-slate-950/90 border border-slate-700 rounded-xl px-3.5 py-2.5 shadow-inner focus-within:border-sky-500 transition-colors">
              <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                id="input-street-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search street name (e.g. Liberty Bell Way, Pinecrest, Marina...)"
                className="w-full bg-transparent text-white text-xs sm:text-sm focus:outline-none placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white text-xs font-medium px-2 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Suggestions dropdown if user typing */}
            {searchQuery && streetSuggestions.length > 0 && searchQuery !== currentStreet.name && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden text-xs">
                {streetSuggestions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedStreetId(s.id);
                      setSearchQuery(s.name);
                    }}
                    className="px-4 py-2.5 hover:bg-slate-800 text-slate-200 cursor-pointer flex items-center justify-between border-b border-slate-800/60 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-semibold text-white">{s.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      s.status === 'completed' ? 'bg-emerald-950 text-emerald-300' :
                      s.status === 'in_progress' ? 'bg-amber-950 text-amber-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Street Live ETA Card + Notification Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Live Truck Tracker & Status Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Street Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: assignedZone.color }}
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    {assignedZone.name}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{currentStreet.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scheduled collection window: <strong className="text-slate-200">{currentStreet.scheduledTimeWindow}</strong>
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  currentStreet.status === 'completed' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' :
                  currentStreet.status === 'in_progress' ? 'bg-amber-950/80 text-amber-300 border-amber-700/60 animate-pulse' :
                  currentStreet.status === 'delayed' ? 'bg-rose-950/80 text-rose-300 border-rose-700/60' :
                  'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {currentStreet.status === 'completed' && '✓ Picked Up Today'}
                  {currentStreet.status === 'in_progress' && '⚡ Truck on Your Street Now'}
                  {currentStreet.status === 'pending' && '⏳ En Route - Approaching'}
                  {currentStreet.status === 'delayed' && '⚠ Delayed - Traffic Obstacle'}
                </span>
              </div>
            </div>

            {/* Countdown Banner */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Estimated Arrival Countdown</span>
                  <span className="text-2xl font-bold text-white tracking-tight">
                    {currentStreet.status === 'completed' ? (
                      <span className="text-emerald-400">Completed at 09:12 AM</span>
                    ) : (
                      `~${etaMinutes} Minutes Away`
                    )}
                  </span>
                </div>
              </div>

              {currentStreet.status !== 'completed' && (
                <div className="bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-700/80 text-xs text-slate-300 text-right">
                  <div className="text-[11px] text-slate-400">Assigned Municipal Unit:</div>
                  <div className="font-bold text-sky-400 font-mono">{assignedTruck.code} - {assignedTruck.name.split(' ')[0]}</div>
                </div>
              )}
            </div>

            {/* Visual Route Progression Stepper */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-300 block">Collection Progression on Route:</span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {/* Step 1 */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-emerald-800/40 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span className="font-semibold block text-[11px]">Depot Departed</span>
                  <span className="text-[10px] text-slate-400">06:30 AM</span>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-emerald-800/40 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span className="font-semibold block text-[11px]">Ward Entered</span>
                  <span className="text-[10px] text-slate-400">07:15 AM</span>
                </div>

                {/* Step 3 */}
                <div className={`p-2.5 rounded-xl border ${
                  currentStreet.status === 'completed' || currentStreet.status === 'in_progress'
                    ? 'bg-slate-800/60 border-emerald-800/40 text-emerald-300'
                    : 'bg-sky-950/40 border-sky-700/60 text-sky-300 animate-pulse'
                }`}>
                  <TruckIcon className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                  <span className="font-semibold block text-[11px]">Your Street</span>
                  <span className="text-[10px] text-slate-400">Next ~{etaMinutes}m</span>
                </div>

                {/* Step 4 */}
                <div className={`p-2.5 rounded-xl border ${
                  currentStreet.status === 'completed'
                    ? 'bg-slate-800/60 border-emerald-800/40 text-emerald-300'
                    : 'bg-slate-800/30 border-slate-700/40 text-slate-400'
                }`}>
                  <Check className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                  <span className="font-semibold block text-[11px]">Area Done</span>
                  <span className="text-[10px] text-slate-500">11:30 AM</span>
                </div>
              </div>
            </div>

            {/* Waste Stream for Today Guide */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
                  Today's Waste Category for {assignedZone.code}:
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Week Cycle 3</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-3 text-xs text-emerald-200">
                <Recycle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block text-white">{assignedZone.wasteTypeToday}</span>
                  <span className="text-emerald-300/90 text-[11px]">
                    Place green/blue bins at curb with 1-meter spacing. Keep lid closed.
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                id="btn-report-missed"
                onClick={() => onOpenMissedPickupModal(currentStreet.name)}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Report Missed Bin / Bulky Request
              </button>

              <button
                id="btn-simulate-alert-test"
                onClick={handleSendTestNotification}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                Test Live Resident Alert Ping
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Notification Subscription & Alerts Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Subscription Settings Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-400" />
                Live Notification Subscription
              </h3>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                Active
              </span>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4 text-xs">
              {/* Lead Time Selection */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  Proactive Alert Lead Time:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLeadTime(mins)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        leadTime === mins
                          ? 'bg-sky-600 text-white border-sky-500 shadow'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {mins} Min Before
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  You'll be notified when truck reaches within {leadTime} mins of {currentStreet.name}.
                </p>
              </div>

              {/* Delivery Channels */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Notification Channels:</label>
                <div className="space-y-2">
                  {/* SMS */}
                  <label className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 cursor-pointer">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Smartphone className="w-4 h-4 text-sky-400" />
                      <span>SMS Text Messages</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                      className="rounded accent-sky-500"
                    />
                  </label>

                  {/* Push */}
                  <label className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 cursor-pointer">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span>Browser / Mobile Push</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.push}
                      onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                      className="rounded accent-sky-500"
                    />
                  </label>

                  {/* Email */}
                  <label className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 cursor-pointer">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span>Email Morning Summary</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={channels.email}
                      onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                      className="rounded accent-sky-500"
                    />
                  </label>
                </div>
              </div>

              {/* Contact Inputs */}
              {channels.sms && (
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Mobile Phone for SMS:</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <button
                type="submit"
                id="btn-save-subscription"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Save Alert Preferences
              </button>
            </form>
          </div>

          {/* Recent Notification Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Live Notification Broadcast Log
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">{notifications.length} alerts</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    n.priority === 'alert' 
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' 
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      {n.channel === 'sms' && <Smartphone className="w-3 h-3 text-sky-400" />}
                      {n.channel === 'push' && <Bell className="w-3 h-3 text-emerald-400" />}
                      {n.channel === 'system' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                      {n.title}
                    </span>
                    <span className="text-slate-400 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Simulated Toast */}
      {showTestToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-emerald-500 text-white p-4 rounded-2xl shadow-2xl max-w-sm flex items-start gap-3 animate-bounce">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs text-emerald-400 block">MuniTrack Resident Alert</span>
            <p className="text-xs text-slate-200 mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
