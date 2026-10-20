import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  MapPin, 
  Home, 
  CheckCircle2, 
  Clock, 
  Package, 
  Plus,
  ArrowRight
} from 'lucide-react';
import { DzMahallOrder, Shipment } from '../lib/shipping/types';

interface OrdersManagerProps {
  orders: DzMahallOrder[];
  shipments: Shipment[];
  onDispatchOrder: (order: DzMahallOrder) => void;
  onOpenNewOrderModal: () => void;
  onViewShipmentLabel: (shipment: Shipment) => void;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({
  orders,
  shipments,
  onDispatchOrder,
  onOpenNewOrderModal,
  onViewShipmentLabel
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.wilayaName.toLowerCase().includes(search.toLowerCase()) ||
      o.commune.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrderStatusBadge = (order: DzMahallOrder) => {
    switch (order.status) {
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Truck className="w-3 h-3 text-blue-600" />
            Expédiée
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Livrée & Encaissée
          </span>
        );
      case 'ready_for_shipping':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Prête à expédier
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            En attente
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
              Commandes E-Commerce & Paiement à la Livraison (COD)
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredOrders.length} commandes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Commandes passées sur la boutique DzMahall. Cliquez sur « Créer l'expédition » pour confier le colis à un transporteur.
          </p>
        </div>

        <button
          onClick={onOpenNewOrderModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Simuler une Commande Client</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Statut commande :</label>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'ready_for_shipping', label: 'À expédier' },
              { id: 'shipped', label: 'Expédiées' },
              { id: 'delivered', label: 'Livrées' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher n° commande, client..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3.5">N° Commande</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Client & Téléphone</th>
                <th className="py-3 px-3">Articles & Wilaya</th>
                <th className="py-3 px-3 text-right">Total COD (DZD)</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3 text-right">Action Logistique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(o => {
                const existingShipment = shipments.find(s => s.orderId === o.id);

                return (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-slate-900">
                        {o.orderNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {o.id}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString('fr-DZ')}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{o.customerName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{o.customerPhone}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 max-w-xs truncate">
                        {o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="font-semibold text-slate-700">{o.wilayaCode} - {o.wilayaName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{o.deliveryMode === 'stop_desk' ? 'Stop Desk' : 'Domicile'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {o.totalDzd.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">DZD</span>
                    </td>

                    <td className="py-3 px-3">
                      {getOrderStatusBadge(o)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {existingShipment ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewShipmentLabel(existingShipment)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          >
                            <span>Bordereau ({existingShipment.trackingNumber})</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onDispatchOrder(o)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Expédier</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Aucune commande trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
