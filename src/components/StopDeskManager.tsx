import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Plus, 
  Phone, 
  Clock, 
  Building2, 
  ExternalLink, 
  RefreshCw,
  CheckCircle2,
  X
} from 'lucide-react';
import { StopDeskOffice, CarrierId } from '../lib/shipping/types';
import { ALGERIAN_WILAYAS } from '../lib/shipping/algerian-data';

interface StopDeskManagerProps {
  offices: StopDeskOffice[];
  onAddOffice: (officeData: any) => Promise<void>;
  onSyncCarrier: (carrierId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const StopDeskManager: React.FC<StopDeskManagerProps> = ({
  offices,
  onAddOffice,
  onSyncCarrier,
  onRefresh
}) => {
  const [selectedCarrier, setSelectedCarrier] = useState<string>('all');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New office form
  const [newOffice, setNewOffice] = useState({
    carrierId: 'yalidine' as CarrierId,
    code: '',
    name: '',
    wilayaCode: '16',
    commune: '',
    address: '',
    phone: '',
    openingHours: '08:30 - 18:30'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredOffices = offices.filter(off => {
    const matchesCarrier = selectedCarrier === 'all' || off.carrierId === selectedCarrier;
    const matchesWilaya = selectedWilaya === 'all' || off.wilayaCode === selectedWilaya;
    const matchesSearch = search === '' ||
      off.name.toLowerCase().includes(search.toLowerCase()) ||
      off.commune.toLowerCase().includes(search.toLowerCase()) ||
      off.address.toLowerCase().includes(search.toLowerCase()) ||
      off.code.toLowerCase().includes(search.toLowerCase());
    return matchesCarrier && matchesWilaya && matchesSearch;
  });

  const handleSyncYalidine = async () => {
    setIsSyncing(true);
    try {
      await onSyncCarrier('yalidine');
      showToast('Centres Yalidine synchronisés avec succès depuis l’API.');
      await onRefresh();
    } catch (e: any) {
      alert('Erreur: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffice.name || !newOffice.commune) {
      alert('Veuillez remplir au moins le nom et la commune.');
      return;
    }
    const wilayaObj = ALGERIAN_WILAYAS.find(w => w.code === newOffice.wilayaCode);
    try {
      await onAddOffice({
        ...newOffice,
        wilayaName: wilayaObj?.name || 'Algérie'
      });
      showToast(`Centre Stop Desk ${newOffice.name} ajouté.`);
      setShowAddModal(false);
      await onRefresh();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Bureaux & Points Relais Stop Desk
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {filteredOffices.length} centres répertoriés
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Agences et hubs où les clients DzMahall peuvent récupérer leurs commandes au tarif réduit Stop Desk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncYalidine}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Synchroniser API Yalidine</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un Bureau</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Transporteur */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Transporteur :</label>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les transporteurs</option>
              <option value="yalidine">Yalidine Fast Logistics</option>
              <option value="zr_express">ZR Express</option>
              <option value="guepex">Guepex Express</option>
              <option value="ecotrack">EcoTrack Delivery</option>
            </select>
          </div>

          {/* Wilaya Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Wilaya :</label>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
            >
              <option value="all">Toutes les wilayas (58)</option>
              {ALGERIAN_WILAYAS.map(w => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.name} ({w.arabicName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par commune, adresse..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Offices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOffices.map(off => (
          <div 
            key={off.id}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {off.wilayaCode}
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {off.wilayaName} · {off.commune}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {off.code}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                {off.name}
              </h3>
              
              <div className="text-xs text-slate-600 mb-3 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{off.address}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-[11px] text-slate-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {off.phone || 'Non renseigné'}
                </span>
                <span className="font-semibold text-slate-700">
                  {off.carrierName}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{off.openingHours}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredOffices.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Aucun centre Stop Desk ne correspond à votre recherche.</p>
          </div>
        )}
      </div>

      {/* Add Office Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900">
                Ajouter un Centre ou Point Relais Stop Desk
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOffice} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transporteur</label>
                  <select
                    value={newOffice.carrierId}
                    onChange={(e) => setNewOffice({ ...newOffice, carrierId: e.target.value as CarrierId })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="yalidine">Yalidine Fast Logistics</option>
                    <option value="zr_express">ZR Express</option>
                    <option value="guepex">Guepex Express</option>
                    <option value="ecotrack">EcoTrack Delivery</option>
                    <option value="custom">Relais Propre DzMahall</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code Bureau</label>
                  <input
                    type="text"
                    value={newOffice.code}
                    onChange={(e) => setNewOffice({ ...newOffice, code: e.target.value })}
                    placeholder="ex: YAL-16-KOUBA"
                    className="w-full font-mono px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du Centre Relais *</label>
                <input
                  type="text"
                  required
                  value={newOffice.name}
                  onChange={(e) => setNewOffice({ ...newOffice, name: e.target.value })}
                  placeholder="ex: Centre Yalidine Kouba Ben Omar"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wilaya *</label>
                  <select
                    value={newOffice.wilayaCode}
                    onChange={(e) => setNewOffice({ ...newOffice, wilayaCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {ALGERIAN_WILAYAS.map(w => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commune *</label>
                  <input
                    type="text"
                    required
                    value={newOffice.commune}
                    onChange={(e) => setNewOffice({ ...newOffice, commune: e.target.value })}
                    placeholder="ex: Kouba"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse Complète</label>
                <input
                  type="text"
                  value={newOffice.address}
                  onChange={(e) => setNewOffice({ ...newOffice, address: e.target.value })}
                  placeholder="ex: Rue Ben Omar, En face arrêt de bus"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Numéro de Téléphone</label>
                  <input
                    type="text"
                    value={newOffice.phone}
                    onChange={(e) => setNewOffice({ ...newOffice, phone: e.target.value })}
                    placeholder="ex: 0550 12 34 56"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horaires d'ouverture</label>
                  <input
                    type="text"
                    value={newOffice.openingHours}
                    onChange={(e) => setNewOffice({ ...newOffice, openingHours: e.target.value })}
                    placeholder="08:30 - 18:30"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Enregistrer le Bureau
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
