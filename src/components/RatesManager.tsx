import React, { useState } from 'react';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Edit3, 
  Save, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  MapPin, 
  Home,
  CheckCircle2,
  X
} from 'lucide-react';
import { ShippingRateRule, CarrierId, DeliveryMode } from '../lib/shipping/types';
import { ALGERIAN_WILAYAS, CARRIERS_METADATA } from '../lib/shipping/algerian-data';

interface RatesManagerProps {
  rates: ShippingRateRule[];
  onUpdateRate: (id: string, updates: Partial<ShippingRateRule>) => Promise<void>;
  onBulkUpdate: (adjustments: any[]) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const RatesManager: React.FC<RatesManagerProps> = ({
  rates,
  onUpdateRate,
  onBulkUpdate,
  onRefresh
}) => {
  const [selectedCarrier, setSelectedCarrier] = useState<string>('yalidine');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [searchWilaya, setSearchWilaya] = useState<string>('');
  const [editingRate, setEditingRate] = useState<ShippingRateRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkAdjustmentAmount, setBulkAdjustmentAmount] = useState<number>(100);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRates = rates.filter(r => {
    const matchesCarrier = selectedCarrier === 'all' || r.carrierId === selectedCarrier;
    const matchesMode = selectedMode === 'all' || r.deliveryMode === selectedMode;
    const matchesWilaya = searchWilaya === '' || 
      r.wilayaName.toLowerCase().includes(searchWilaya.toLowerCase()) || 
      r.wilayaCode.includes(searchWilaya);
    return matchesCarrier && matchesMode && matchesWilaya;
  });

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;
    setIsSaving(true);
    try {
      await onUpdateRate(editingRate.id, {
        carrierRate: editingRate.carrierRate,
        customerRate: editingRate.customerRate,
        realCost: editingRate.realCost,
        estimatedDays: editingRate.estimatedDays,
        active: editingRate.active
      });
      showToast(`Tarif Wilaya ${editingRate.wilayaCode} (${editingRate.wilayaName}) mis à jour.`);
      setEditingRate(null);
      await onRefresh();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyBulkMargin = async () => {
    if (!bulkAdjustmentAmount) return;
    setIsSaving(true);
    try {
      const adjustments = filteredRates.map(r => ({
        id: r.id,
        customerRate: r.realCost + bulkAdjustmentAmount
      }));
      await onBulkUpdate(adjustments);
      showToast(`Marge client ajustée de +${bulkAdjustmentAmount} DZD sur ${adjustments.length} tarifs.`);
      setShowBulkModal(false);
      await onRefresh();
    } catch (e: any) {
      alert('Erreur bulk: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const exportRatesCSV = () => {
    const headers = ['Wilaya_Code', 'Wilaya_Nom', 'Transporteur', 'Mode', 'Tarif_Transporteur_DZD', 'Tarif_Client_DZD', 'Cout_Reel_DZD', 'Marge_DZD', 'Delai'];
    const rows = filteredRates.map(r => [
      r.wilayaCode,
      `"${r.wilayaName}"`,
      `"${r.carrierName}"`,
      r.deliveryMode,
      r.carrierRate,
      r.customerRate,
      r.realCost,
      r.customerRate - r.realCost,
      `"${r.estimatedDays}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dzmahall_tarifs_wilayas_${selectedCarrier}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Grille Tarifaire des 58 Wilayas Algériennes
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredRates.length} règles tarifaires
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Distingue le coût réel supporté par DzMahall, le tarif officiel du transporteur et le montant facturé au client final.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Ajuster Marges en Masse</span>
          </button>
          <button
            onClick={exportRatesCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Distinction explanation banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            1
          </div>
          <div>
            <strong className="text-blue-900 block">Tarif Transporteur</strong>
            <span className="text-blue-700/80">Prix catalogue officiel facturé par la société (Yalidine, etc.)</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            2
          </div>
          <div>
            <strong className="text-indigo-900 block">Tarif Facturé au Client DzMahall</strong>
            <span className="text-indigo-700/80">Montant de livraison affiché dans le panier d'achat client</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            3
          </div>
          <div>
            <strong className="text-emerald-900 block">Coût Réel Supporté DzMahall</strong>
            <span className="text-emerald-700/80">Coût net après remises grands comptes, volume ou assurance</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Transporteur select */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Transporteur :</label>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les transporteurs</option>
              <option value="yalidine">Yalidine Fast Logistics</option>
              <option value="guepex">Guepex Express</option>
              <option value="ecotrack">EcoTrack Delivery</option>
              <option value="zr_express">ZR Express</option>
            </select>
          </div>

          {/* Mode select */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Mode :</label>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setSelectedMode('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedMode('domicile')}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedMode === 'domicile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Domicile
              </button>
              <button
                onClick={() => setSelectedMode('stop_desk')}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedMode === 'stop_desk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Stop Desk
              </button>
            </div>
          </div>
        </div>

        {/* Search Wilaya */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchWilaya}
            onChange={(e) => setSearchWilaya(e.target.value)}
            placeholder="Filtrer wilaya (ex: Alger, 31, Oran)..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3.5">Wilaya Algérie</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3 text-right">1. Tarif Transporteur</th>
                <th className="py-3 px-3 text-right">2. Facturé Client DzMahall</th>
                <th className="py-3 px-3 text-right">3. Coût Réel DzMahall</th>
                <th className="py-3 px-3 text-right">Marge Brute</th>
                <th className="py-3 px-3">Délai Annoncé</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRates.map(r => {
                const margin = r.customerRate - r.realCost;
                const marginPercent = r.realCost > 0 ? Math.round((margin / r.realCost) * 100) : 0;
                
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {r.wilayaCode}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {r.wilayaName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {r.carrierName}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      {r.deliveryMode === 'domicile' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          <Home className="w-3 h-3 text-slate-500" />
                          Domicile
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          Stop Desk
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                      {r.carrierRate.toLocaleString()} DZD
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-800 tabular-nums">
                      {r.customerRate.toLocaleString()} DZD
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                      {r.realCost.toLocaleString()} DZD
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <span className={`inline-flex items-center gap-0.5 font-bold ${
                        margin >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {margin > 0 ? `+${margin.toLocaleString()}` : margin.toLocaleString()} DZD
                        <span className="text-[10px] font-normal opacity-75">
                          ({marginPercent}%)
                        </span>
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-medium text-[11px]">
                      {r.estimatedDays}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setEditingRate(r)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Modifier le tarif"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRates.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucun tarif trouvé pour cette sélection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rate Modal */}
      {editingRate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900">
                Modifier le Tarif · {editingRate.wilayaCode} {editingRate.wilayaName}
              </h2>
              <button onClick={() => setEditingRate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Tarif Transporteur Officiel (DZD)
                </label>
                <input
                  type="number"
                  value={editingRate.carrierRate}
                  onChange={(e) => setEditingRate({ ...editingRate, carrierRate: Number(e.target.value) })}
                  className="w-full font-mono px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Tarif Facturé au Client DzMahall (DZD)
                </label>
                <input
                  type="number"
                  value={editingRate.customerRate}
                  onChange={(e) => setEditingRate({ ...editingRate, customerRate: Number(e.target.value) })}
                  className="w-full font-mono font-bold text-blue-800 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Coût Réel Supporté par DzMahall (DZD)
                </label>
                <input
                  type="number"
                  value={editingRate.realCost}
                  onChange={(e) => setEditingRate({ ...editingRate, realCost: Number(e.target.value) })}
                  className="w-full font-mono px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <span className="font-semibold text-emerald-900">Marge Brute DzMahall :</span>
                <span className="font-mono font-bold text-emerald-800">
                  {(editingRate.customerRate - editingRate.realCost).toLocaleString()} DZD
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Délai Annoncé (ex: 24h, 24-48h, 3j)
                </label>
                <input
                  type="text"
                  value={editingRate.estimatedDays}
                  onChange={(e) => setEditingRate({ ...editingRate, estimatedDays: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Margins Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900">
                Ajustement en Masse des Marges DzMahall
              </h2>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Appliquez une marge fixe à facturer aux clients au-dessus du coût réel supporté par DzMahall sur les <strong>{filteredRates.length}</strong> lignes actuellement filtrées.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Marge forfaitaire ajoutée (DZD)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bulkAdjustmentAmount}
                    onChange={(e) => setBulkAdjustmentAmount(Number(e.target.value))}
                    step="50"
                    min="0"
                    className="w-full font-mono text-sm font-bold px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-500">DZD</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Exemple : un coût réel de 450 DZD sera facturé 550 DZD au client.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkMargin}
                  disabled={isSaving}
                  className="px-4 py-1.5 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  {isSaving ? 'Application...' : `Appliquer à ${filteredRates.length} wilayas`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
