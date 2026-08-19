import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Send, 
  CheckCircle2, 
  Phone, 
  Trash2, 
  Recycle, 
  FileText,
  Clock
} from 'lucide-react';
import { MissedPickupTicket, VehicleType, Zone } from '../types';
import confetti from 'canvas-confetti';

interface MissedPickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTicket: (ticket: MissedPickupTicket) => void;
  zones: Zone[];
  prefilledStreet?: string;
}

export const MissedPickupModal: React.FC<MissedPickupModalProps> = ({
  isOpen,
  onClose,
  onSubmitTicket,
  zones,
  prefilledStreet,
}) => {
  const [address, setAddress] = useState<string>(prefilledStreet || '422 Pinecrest Way');
  const [zoneId, setZoneId] = useState<string>('ward-4');
  const [residentName, setResidentName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [wasteType, setWasteType] = useState<VehicleType>('recyclables');
  const [description, setDescription] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: MissedPickupTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      address,
      zoneId,
      residentName: residentName || 'Anonymous Resident',
      phone: phone || '+1 (555) 000-0000',
      wasteType,
      description: description || 'Bin placed curbside before 07:00 AM, skipped on morning route.',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'submitted',
    };

    onSubmitTicket(newTicket);
    setIsSuccess(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Report Missed Pickup / Bulky Item</h3>
              <p className="text-xs text-slate-400">Directly alerts municipal dispatch for immediate sweep</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Ticket Logged & Dispatched!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Our fleet supervisor has assigned a backup sweep truck to your street. You will receive an SMS update once collected.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Your Full Street Address:</label>
              <input
                id="input-ticket-address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 142 Liberty Bell Way, Apt 3B"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Ward / Neighborhood:</label>
                <select
                  id="select-ticket-zone"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.code}: {z.name.split(' - ')[1]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Waste Category:</label>
                <select
                  id="select-ticket-waste-type"
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value as VehicleType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="organic_compost">Green Organic Bin</option>
                  <option value="recyclables">Blue Recycling Bin</option>
                  <option value="general_waste">Black Trash Bin</option>
                  <option value="bulky_waste">Bulky / Electronics</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Your Name:</label>
                <input
                  type="text"
                  value={residentName}
                  onChange={(e) => setResidentName(e.target.value)}
                  placeholder="Resident Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone for SMS Alert:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Incident Notes / Photo Description:</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Bin was out by 7am, truck drove past without lifting. Or bulky couch curbside."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-ticket-form"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Incident Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
