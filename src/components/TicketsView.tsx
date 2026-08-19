import React, { useState } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Truck as TruckIcon, 
  Plus, 
  Search, 
  Filter,
  Check
} from 'lucide-react';
import { MissedPickupTicket, Zone, Truck } from '../types';

interface TicketsViewProps {
  tickets: MissedPickupTicket[];
  zones: Zone[];
  trucks: Truck[];
  onOpenNewTicketModal: () => void;
  onUpdateTicketStatus: (ticketId: string, status: 'submitted' | 'dispatched' | 're_scheduled' | 'collected') => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets,
  zones,
  trucks,
  onOpenNewTicketModal,
  onUpdateTicketStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q) ||
        t.residentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: MissedPickupTicket['status']) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="bg-amber-950/80 text-amber-400 border border-amber-800/60 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Under Review
          </span>
        );
      case 'dispatched':
        return (
          <span className="bg-sky-950/80 text-sky-400 border border-sky-800/60 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <TruckIcon className="w-3 h-3" />
            Truck Dispatched
          </span>
        );
      case 're_scheduled':
        return (
          <span className="bg-purple-950/80 text-purple-400 border border-purple-800/60 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Re-scheduled Sweep
          </span>
        );
      case 'collected':
        return (
          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Resolved & Picked Up
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-rose-500/20 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Resident Incident & Missed Collection Dispatch
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reported Missed Bins & Bulky Waste Queue</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track real-time resolution of reported skipped curbs, double-back routes, and heavy item pickup requests.
          </p>
        </div>

        <button
          id="btn-log-new-ticket"
          onClick={onOpenNewTicketModal}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Incident / Bulky Request
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-sky-400" />
          <span>Status:</span>
          <select
            id="select-ticket-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:outline-none"
          >
            <option value="all">All Incident Tickets ({tickets.length})</option>
            <option value="submitted">Under Review</option>
            <option value="dispatched">Dispatched</option>
            <option value="re_scheduled">Re-Scheduled</option>
            <option value="collected">Collected & Closed</option>
          </select>
        </div>

        <div className="w-full sm:w-64">
          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, street, name..."
              className="w-full bg-transparent text-white focus:outline-none placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">No Pending Incident Tickets</h4>
            <p className="text-xs text-slate-400">All reported missed pickups in the city have been collected!</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const ticketZone = zones.find((z) => z.id === ticket.zoneId);

            return (
              <div
                key={ticket.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-800 text-sky-400 px-2 py-0.5 rounded border border-slate-700">
                      {ticket.id}
                    </span>
                    {getStatusBadge(ticket.status)}
                    <span className="text-[11px] text-slate-400 font-mono">Logged at {ticket.createdAt}</span>
                    {ticketZone && (
                      <span className="text-[11px] text-slate-300 font-medium bg-slate-800 px-2 py-0.5 rounded">
                        {ticketZone.code}: {ticketZone.name.split(' - ')[1]}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                    {ticket.address}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    {ticket.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Resident: <strong className="text-slate-200">{ticket.residentName}</strong></span>
                    <span>Contact: <strong className="text-slate-200">{ticket.phone}</strong></span>
                    {ticket.resolutionNote && (
                      <span className="text-sky-300">Dispatch Plan: {ticket.resolutionNote}</span>
                    )}
                  </div>
                </div>

                {/* Dispatch Action Buttons */}
                <div className="flex flex-row md:flex-col items-end gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                  {ticket.status === 'submitted' && (
                    <button
                      onClick={() => onUpdateTicketStatus(ticket.id, 'dispatched')}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
                    >
                      <TruckIcon className="w-3.5 h-3.5" />
                      Dispatch Sweep Truck
                    </button>
                  )}

                  {ticket.status === 'dispatched' && (
                    <button
                      onClick={() => onUpdateTicketStatus(ticket.id, 'collected')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Collected
                    </button>
                  )}

                  {ticket.status === 'collected' && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
