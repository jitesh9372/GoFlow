import React, { useState, useEffect } from 'react';
import {
  Train,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
  Compass,
  Bus,
  MapPin,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Station, TransitLine, TransportMode } from '../../types';
import { ModeIcon } from '../../components/ModeIcon';

export const TransportManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stations' | 'lines'>('stations');
  const [stations, setStations] = useState<Station[]>([]);
  const [lines, setLines] = useState<TransitLine[]>([]);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<TransportMode | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // Station Modal
  const [stationModalOpen, setStationModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [stationForm, setStationForm] = useState({
    name: '',
    marathiName: '',
    code: '',
    mode: 'train' as TransportMode,
    lineIds: ['western-line'],
    latitude: 19.0760,
    longitude: 72.8777,
    zone: 'South Mumbai',
    isInterchange: false,
    facilities: 'Ticket Counters, ATVM'
  });

  // Feedback notifications
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stnRes, lineRes] = await Promise.all([
        api.getStations(),
        api.getLines()
      ]);
      setStations(stnRes.stations);
      setLines(lineRes.lines);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Failed to fetch transport data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleOpenAddStation = () => {
    setEditingStation(null);
    setStationForm({
      name: '',
      marathiName: '',
      code: '',
      mode: 'train',
      lineIds: ['western-line'],
      latitude: 19.0760,
      longitude: 72.8777,
      zone: 'Mumbai Suburban Area',
      isInterchange: false,
      facilities: 'Ticket Counters, Foot Overbridge'
    });
    setStationModalOpen(true);
  };

  const handleOpenEditStation = (stn: Station) => {
    setEditingStation(stn);
    setStationForm({
      name: stn.name,
      marathiName: stn.marathiName || '',
      code: stn.code,
      mode: stn.mode,
      lineIds: stn.lineIds,
      latitude: stn.latitude,
      longitude: stn.longitude,
      zone: stn.zone || '',
      isInterchange: stn.isInterchange,
      facilities: (stn.facilities || []).join(', ')
    });
    setStationModalOpen(true);
  };

  const handleSaveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const facArray = stationForm.facilities.split(',').map(s => s.trim()).filter(Boolean);

      if (editingStation) {
        // Update existing station
        const res = await api.updateStation(editingStation.id, {
          name: stationForm.name,
          marathiName: stationForm.marathiName || undefined,
          code: stationForm.code.toUpperCase(),
          mode: stationForm.mode,
          lineIds: stationForm.lineIds,
          latitude: Number(stationForm.latitude),
          longitude: Number(stationForm.longitude),
          zone: stationForm.zone || undefined,
          isInterchange: stationForm.isInterchange,
          facilities: facArray
        });
        setStations(stations.map(s => (s.id === res.station.id ? res.station : s)));
        showFeedback('success', `Station ${res.station.name} updated successfully!`);
      } else {
        // Create new station
        const newId = `stn-${stationForm.code.toLowerCase()}-${Date.now().toString().slice(-4)}`;
        const res = await api.createStation({
          id: newId,
          name: stationForm.name,
          marathiName: stationForm.marathiName || undefined,
          code: stationForm.code.toUpperCase(),
          mode: stationForm.mode,
          lineIds: stationForm.lineIds,
          latitude: Number(stationForm.latitude),
          longitude: Number(stationForm.longitude),
          zone: stationForm.zone || undefined,
          isInterchange: stationForm.isInterchange,
          facilities: facArray
        });
        setStations([res.station, ...stations]);
        showFeedback('success', `Station ${res.station.name} created successfully!`);
      }
      setStationModalOpen(false);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save station.');
    }
  };

  const handleDeleteStation = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from Mumbai transit records?`)) {
      return;
    }
    try {
      await api.deleteStation(id);
      setStations(stations.filter(s => s.id !== id));
      showFeedback('success', `Station ${name} removed.`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete station.');
    }
  };

  const filteredStations = stations.filter(s => {
    const matchesMode = modeFilter === 'all' || s.mode === modeFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (
      s.name.toLowerCase().includes(q) ||
      (s.marathiName && s.marathiName.includes(q)) ||
      s.code.toLowerCase().includes(q) ||
      (s.zone && s.zone.toLowerCase().includes(q))
    );
    return matchesMode && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-transit-navy tracking-tight flex items-center gap-2">
            <Train size={24} className="text-transit-teal" />
            <span>Transport Network Management</span>
          </h1>
          <p className="text-xs text-transit-muted mt-1">
            Configure Mumbai suburban rail lines, metro corridors, bus stops, and junction connectivity.
          </p>
        </div>

        <button
          onClick={handleOpenAddStation}
          className="px-3.5 py-2 bg-transit-teal hover:bg-transit-teal-hover text-white text-xs font-semibold rounded-transit flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>Add Transit Station</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-transit text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('stations')}
          className={`py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'stations'
              ? 'border-transit-teal text-transit-teal font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Stations &amp; Stops ({stations.length})
        </button>
        <button
          onClick={() => setActiveTab('lines')}
          className={`py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'lines'
              ? 'border-transit-teal text-transit-teal font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Transit Lines &amp; Routes ({lines.length})
        </button>
      </div>

      {/* Stations Tab */}
      {activeTab === 'stations' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-transit-border rounded-card shadow-subtle">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search station by name, Marathi name, or code..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-transit focus:outline-none focus:ring-1 focus:ring-transit-teal"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className="text-slate-400 uppercase text-[10px]">Filter Mode:</span>
              {(['all', 'train', 'metro', 'bus'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className={`px-2.5 py-1 rounded capitalize transition-colors ${
                    modeFilter === m
                      ? 'bg-transit-teal text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Stations Table */}
          <div className="bg-white border border-transit-border rounded-card shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Station Name &amp; Marathi</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Line &amp; Zone</th>
                  <th className="py-2.5 px-3">Interchange</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStations.map((station) => (
                  <tr key={station.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-transit-navy text-sm">
                        {station.name}
                      </div>
                      {station.marathiName && (
                        <div className="text-[11px] text-slate-500 font-normal">
                          {station.marathiName}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                      {station.code}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        <ModeIcon mode={station.mode} size={12} />
                        {station.mode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{station.zone || 'Mumbai'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {station.lineIds.join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {station.isInterchange ? (
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-medium text-[11px]">
                          Junction
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                      {station.latitude.toFixed(3)}, {station.longitude.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditStation(station)}
                          className="p-1.5 text-slate-500 hover:text-transit-teal hover:bg-teal-50 rounded transition-colors"
                          title="Edit Station"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteStation(station.id, station.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Station"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lines Tab */}
      {activeTab === 'lines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lines.map((line) => (
            <div
              key={line.id}
              className="bg-white border border-transit-border rounded-card p-4 shadow-subtle flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: line.color }}
                    />
                    <span className="font-mono text-xs font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {line.code}
                    </span>
                  </div>
                  <span className="text-[11px] capitalize text-slate-500 font-medium">
                    {line.operator}
                  </span>
                </div>

                <h3 className="font-bold text-base text-transit-navy">
                  {line.name}
                </h3>

                <div className="text-xs text-slate-600 space-y-1 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Terminals:</span>
                    <span className="font-medium text-slate-800">{line.terminalA} ↔ {line.terminalB}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Stations:</span>
                    <span className="font-mono">{line.stationIds.length} stops</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Average Headway:</span>
                    <span className="font-mono">Every {line.averageFrequencyMins} mins</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Hours: {line.operatingHours.start} – {line.operatingHours.end}</span>
                <span className="font-mono">{line.totalDistanceKm} km</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Station Modal */}
      {stationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-card border border-transit-border shadow-elevated w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-transit-navy text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {editingStation ? `Edit Station: ${editingStation.name}` : 'Add New Mumbai Station / Stop'}
              </h3>
              <button
                onClick={() => setStationModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStation} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Station Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={stationForm.name}
                    onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                    placeholder="e.g. Lower Parel"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit focus:outline-none focus:ring-1 focus:ring-transit-teal text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Marathi Name (स्थानकाचे नाव)
                  </label>
                  <input
                    type="text"
                    value={stationForm.marathiName}
                    onChange={(e) => setStationForm({ ...stationForm, marathiName: e.target.value })}
                    placeholder="e.g. लोअर परळ"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit focus:outline-none focus:ring-1 focus:ring-transit-teal text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Station Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={stationForm.code}
                    onChange={(e) => setStationForm({ ...stationForm, code: e.target.value })}
                    placeholder="e.g. PL"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit focus:outline-none focus:ring-1 focus:ring-transit-teal text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Transport Mode
                  </label>
                  <select
                    value={stationForm.mode}
                    onChange={(e) => setStationForm({ ...stationForm, mode: e.target.value as TransportMode })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit text-xs focus:outline-none focus:ring-1 focus:ring-transit-teal"
                  >
                    <option value="train">Local Train (Suburban)</option>
                    <option value="metro">Mumbai Metro</option>
                    <option value="bus">BEST Bus Stop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={stationForm.latitude}
                    onChange={(e) => setStationForm({ ...stationForm, latitude: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={stationForm.longitude}
                    onChange={(e) => setStationForm({ ...stationForm, longitude: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Zone / Area Description
                </label>
                <input
                  type="text"
                  value={stationForm.zone}
                  onChange={(e) => setStationForm({ ...stationForm, zone: e.target.value })}
                  placeholder="e.g. Central Mumbai / Commercial Mills"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_interchange"
                  checked={stationForm.isInterchange}
                  onChange={(e) => setStationForm({ ...stationForm, isInterchange: e.target.checked })}
                  className="text-transit-teal rounded"
                />
                <label htmlFor="is_interchange" className="font-semibold text-slate-700 cursor-pointer">
                  Is Transfer / Junction Interchange Station
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Facilities (comma-separated)
                </label>
                <input
                  type="text"
                  value={stationForm.facilities}
                  onChange={(e) => setStationForm({ ...stationForm, facilities: e.target.value })}
                  placeholder="Ticket Counters, ATVM, Skywalk, Escalators"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-transit text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setStationModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-transit-teal hover:bg-transit-teal-hover text-white rounded text-xs font-semibold"
                >
                  {editingStation ? 'Update Station' : 'Create Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
