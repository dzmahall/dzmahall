import React from 'react';
import { 
  Truck, 
  Package, 
  DollarSign, 
  CheckCircle2, 
  MapPin, 
  Home, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  FileText,
  Activity,
  Printer
} from 'lucide-react';
import { Shipment, CarrierConfigPublic } from '../lib/shipping/types';

interface DashboardProps {
  stats: any;
  carriers: CarrierConfigPublic[];
  onNavigate: (tab: string) => void;
  onOpenShipmentLabel: (shipment: Shipment) => void;
}

export const ShippingDashboard: React.FC<DashboardProps> = ({
  stats,
  carriers,
  onNavigate,
  onOpenShipmentLabel
}) => {
  const kpis = stats?.kpis || {
    activeCarriersCount: 1,
    totalCarriersCount: 8,
    totalShipments: 0,
    deliveredShipments: 0,
    deliverySuccessRate: 98,
    totalCodCollectedDzd: 0,
    totalCodInTransitDzd: 0,
    pendingOrdersCount: 2,
    domicileSharePercent: 65,
    stopDeskSharePercent: 35
  };

  const recentShipments: Shipment[] = stats?.recentShipments || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              DzMahall Logistics Hub · Algérie 58 Wilayas
            </span>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              Réseau Opérationnel
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Gestion & Suivi des Transporteurs
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Supervisez en temps réel vos expéditions Yalidine, Guepex, EcoTrack, ZR Express et vos encaissements en paiement à la livraison (COD).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('providers')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            Configurer les transporteurs
          </button>
          <button
            onClick={() => onNavigate('rates')}
            className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap"
          >
            Grille des tarifs wilayas
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Transporteurs Actifs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Transporteurs Actifs</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {kpis.activeCarriersCount} <span className="text-sm font-normal text-slate-400">/ {kpis.totalCarriersCount}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Yalidine opérationnel</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Expéditions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Expéditions Totales</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {kpis.totalShipments}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>Succès : <strong className="text-slate-800">{kpis.deliverySuccessRate}%</strong></span>
              <span aria-hidden="true">·</span>
              <span>Livrées : <strong className="text-slate-800">{kpis.deliveredShipments}</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 3: Montant COD Encaissé (DZD) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">COD Récupéré (DZD)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {kpis.totalCodCollectedDzd.toLocaleString()} <span className="text-xs font-normal text-slate-500">DZD</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>En transit :</span>
              <span className="font-mono font-medium text-slate-700 tabular-nums">
                {kpis.totalCodInTransitDzd.toLocaleString()} DZD
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Répartition Domicile vs Stop Desk */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Modes de Livraison</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="flex items-center gap-1 text-slate-700">
                <Home className="w-3 h-3 text-slate-400" />
                Domicile {kpis.domicileSharePercent}%
              </span>
              <span className="flex items-center gap-1 text-blue-700">
                <MapPin className="w-3 h-3 text-blue-500" />
                Stop Desk {kpis.stopDeskSharePercent}%
              </span>
            </div>
            {/* Split bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
              <div 
                className="bg-slate-700 h-full" 
                style={{ width: `${kpis.domicileSharePercent}%` }}
              />
              <div 
                className="bg-blue-600 h-full" 
                style={{ width: `${kpis.stopDeskSharePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Status des transporteurs & Dernières expéditions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne Gauche (2/3): Dernières expéditions & bordereaux */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Dernières Expéditions Générées
              </h2>
              <p className="text-xs text-slate-500">
                Colis confiés aux transporteurs avec numéro de suivi et montant à encaisser (COD)
              </p>
            </div>

            <button
              onClick={() => onNavigate('shipments')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Suivi / Transporteur</th>
                  <th className="py-2.5 px-3">Client & Destination</th>
                  <th className="py-2.5 px-3 text-right">Montant COD</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Bordereau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentShipments.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-900">
                        {s.trackingNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {s.carrierName}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{s.customerName}</div>
                      <div className="text-[11px] text-slate-500">
                        {s.destinationWilayaCode} - {s.destinationWilayaName} ({s.deliveryMode === 'stop_desk' ? 'Stop Desk' : 'Domicile'})
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {s.codAmountDzd.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">DZD</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        s.status === 'delivered' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : s.status === 'in_transit'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {s.statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onOpenShipmentLabel(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        title="Imprimer l'étiquette thermique standardisée (Bordereau)"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Imprimer</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {recentShipments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Aucune expédition enregistrée pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Colonne Droite (1/3): Diagnostic & Écosystème des transporteurs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">
                Santé des Connecteurs API
              </h2>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Vérification des accès API et latence mesurée des transporteurs.
            </p>

            <div className="space-y-3">
              {carriers.slice(0, 5).map(c => (
                <div key={c.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-800 truncate">
                        {c.name}
                      </span>
                      {c.lastTestSuccess && (
                        <span className="text-[10px] font-mono text-emerald-600">
                          {c.lastTestLatencyMs}ms
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.lastTestedAt ? `Testé le ${new Date(c.lastTestedAt).toLocaleDateString('fr-DZ')}` : 'Non testé récemment'}
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                    c.status === 'connected'
                      ? 'bg-emerald-100 text-emerald-800'
                      : c.status === 'ready_to_test'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {c.status === 'connected' ? 'Connecté' : c.status === 'ready_to_test' ? 'À tester' : 'Inactif'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('providers')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-colors block"
            >
              Gérer l'ensemble des 8 transporteurs
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
