import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  MapPin, 
  Home, 
  ExternalLink, 
  ChevronRight, 
  RefreshCw,
  Plus,
  RotateCcw
} from 'lucide-react';
import { Shipment, ShipmentStatus } from '../lib/shipping/types';

interface ShipmentsManagerProps {
  shipments: Shipment[];
  onOpenLabel: (shipment: Shipment) => void;
  onOpenCreateModal: () => void;
  onUpdateStatus: (shipmentId: string, status: ShipmentStatus, label: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const ShipmentsManager: React.FC<ShipmentsManagerProps> = ({
  shipments,
  onOpenLabel,
  onOpenCreateModal,
  onUpdateStatus,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = 
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.orderId.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.destinationWilayaName.toLowerCase().includes(search.toLowerCase());
    const matchesCarrier = carrierFilter === 'all' || s.carrierId === carrierFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesCarrier && matchesStatus;
  });

  const handleSimulateStatus = async (shipmentId: string, status: ShipmentStatus, label: string) => {
    setStatusUpdating(true);
    try {
      await onUpdateStatus(shipmentId, status, label);
      await onRefresh();
      // Mettre à jour la sélection courante si ouverte
      if (selectedShipment?.id === shipmentId) {
        const updated = shipments.find(s => s.id === shipmentId);
        if (updated) setSelectedShipment(updated);
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadge = (status: ShipmentStatus, label: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {label}
          </span>
        );
      case 'in_transit':
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Truck className="w-3 h-3 text-blue-600" />
            {label}
          </span>
        );
      case 'failed':
      case 'returning':
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            {label}
          </span>
        );
      case 'created':
      case 'accepted':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            {label}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Expéditions & Suivi des Colis
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredShipments.length} colis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des numéros d'acheminement, impression des bordereaux thermiques et contrôle des paiements COD.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Créer une Expédition</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Transporteur select */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Transporteur :</label>
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="yalidine">Yalidine</option>
              <option value="guepex">Guepex</option>
              <option value="ecotrack">EcoTrack</option>
              <option value="zr_express">ZR Express</option>
            </select>
          </div>

          {/* Statut filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Statut :</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="created">Colis créé</option>
              <option value="in_transit">En transit</option>
              <option value="out_for_delivery">En cours de livraison</option>
              <option value="delivered">Livré & Encaissé</option>
              <option value="failed">Échec / En retour</option>
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
            placeholder="Rechercher par n° suivi, client..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3.5">Numéro de Suivi (Tracking)</th>
                <th className="py-3 px-3">Réf. Commande</th>
                <th className="py-3 px-3">Client & Téléphone</th>
                <th className="py-3 px-3">Destination Algérie</th>
                <th className="py-3 px-3 text-right">Montant COD (DZD)</th>
                <th className="py-3 px-3">Statut Actuel</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>{s.trackingNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>{s.carrierName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(s.createdAt).toLocaleDateString('fr-DZ')}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {s.orderId}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{s.customerName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{s.customerPhone}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">
                      {s.destinationWilayaCode} - {s.destinationWilayaName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      {s.deliveryMode === 'stop_desk' ? (
                        <>
                          <MapPin className="w-3 h-3 text-blue-600" />
                          <span>Stop Desk: {s.stopDeskOfficeName || s.destinationCommune}</span>
                        </>
                      ) : (
                        <>
                          <Home className="w-3 h-3 text-slate-400" />
                          <span>Domicile: {s.destinationCommune}</span>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {s.codAmountDzd.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">DZD</span>
                  </td>

                  <td className="py-3 px-3">
                    {getStatusBadge(s.status, s.statusLabel)}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenLabel(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        title="Imprimer l'étiquette thermique officielle"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Bordereau</span>
                      </button>

                      <button
                        onClick={() => setSelectedShipment(s)}
                        className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                        title="Détails du suivi & événements"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Aucune expédition trouvée. Créez votre premier colis avec le bouton ci-dessus.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Details Drawer / Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Détail de l'Acheminement
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedShipment.trackingNumber} · {selectedShipment.carrierName}
                </h2>
              </div>
              <button onClick={() => setSelectedShipment(null)} className="text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Montant COD</span>
                  <span className="font-mono text-base font-bold text-slate-900">
                    {selectedShipment.codAmountDzd.toLocaleString()} DZD
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Destination</span>
                  <span className="font-bold text-slate-900 block truncate">
                    {selectedShipment.destinationWilayaCode} - {selectedShipment.destinationWilayaName}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Mode</span>
                  <span className="font-bold text-blue-700 block">
                    {selectedShipment.deliveryMode === 'stop_desk' ? 'Stop Desk' : 'À Domicile'}
                  </span>
                </div>
              </div>

              {/* Status Simulation Controls (To test lifecycle) */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                  Simulateur de statut & Webhook ({selectedShipment.carrierName})
                </span>
                <p className="text-[11px] text-slate-400">
                  Faites avancer le colis dans les étapes de la livraison pour vérifier le suivi et le recouvrement du paiement à la livraison (COD) :
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    disabled={statusUpdating}
                    onClick={() => handleSimulateStatus(selectedShipment.id, 'in_transit', 'En transit vers le centre de distribution')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                  >
                    1. En transit
                  </button>
                  <button
                    disabled={statusUpdating}
                    onClick={() => handleSimulateStatus(selectedShipment.id, 'out_for_delivery', 'En cours de livraison avec le livreur')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-blue-700 hover:bg-blue-600 rounded text-white"
                  >
                    2. En livraison
                  </button>
                  <button
                    disabled={statusUpdating}
                    onClick={() => handleSimulateStatus(selectedShipment.id, 'delivered', 'Colis livré avec succès - Fonds COD encaissés')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-600 rounded text-white"
                  >
                    3. Livré & Encaissé
                  </button>
                  <button
                    disabled={statusUpdating}
                    onClick={() => handleSimulateStatus(selectedShipment.id, 'failed', 'Tentative échouée - Client injoignable')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-rose-900 hover:bg-rose-800 rounded text-rose-200"
                  >
                    Échec / Relance
                  </button>
                </div>
              </div>

              {/* Events Timeline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Historique Horodaté des Événements
                </h3>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedShipment.events?.map(ev => (
                    <div key={ev.id} className="relative">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{ev.statusLabel}</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {new Date(ev.timestamp).toLocaleString('fr-DZ')}
                          </span>
                        </div>
                        {ev.location && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{ev.location}</span>
                          </div>
                        )}
                        {ev.notes && (
                          <div className="text-[11px] text-slate-600 mt-1 italic">
                            {ev.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onOpenLabel(selectedShipment);
                    setSelectedShipment(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le Bordereau A6</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShipment(null)}
                  className="px-4 py-1.5 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Fermer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
