import React, { useState } from 'react';
import { CarrierConfigPublic, ConnectionTestResult } from '../lib/shipping/types';
import { CARRIERS_METADATA } from '../lib/shipping/algerian-data';
import { CarrierCard } from './CarrierCard';
import { CarrierConfigModal } from './CarrierConfigModal';
import { Search, Plus, Filter, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CarriersListProps {
  carriers: CarrierConfigPublic[];
  onRefresh: () => Promise<void>;
  onTestCarrier: (id: string) => Promise<ConnectionTestResult>;
  onSaveConfig: (id: string, data: any) => Promise<void>;
  onSyncCarrier: (id: string) => Promise<void>;
  onToggleCarrier: (id: string, enabled: boolean) => Promise<void>;
}

export const CarriersList: React.FC<CarriersListProps> = ({
  carriers,
  onRefresh,
  onTestCarrier,
  onSaveConfig,
  onSyncCarrier,
  onToggleCarrier
}) => {
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierConfigPublic | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await onTestCarrier(id);
      showToast(res.message);
      await onRefresh();
    } finally {
      setTestingId(null);
    }
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await onSyncCarrier(id);
      showToast('Centres Stop Desk et tarifs synchronisés avec succès.');
      await onRefresh();
    } finally {
      setSyncingId(null);
    }
  };

  const filteredCarriers = carriers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Sociétés de Livraison & Transporteurs Algériens
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {carriers.length} disponibles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez, testez et connectez en toute sécurité les API des prestataires logistiques opérant sur le territoire algérien.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const custom = carriers.find(c => c.id === 'custom');
              if (custom) setSelectedCarrier(custom);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter Transporteur / Flotte</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-lg text-xs font-medium">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'connected', label: 'Connectés' },
            { id: 'ready_to_test', label: 'À tester' },
            { id: 'unconfigured', label: 'Non configurés' },
            { id: 'disabled', label: 'Désactivés' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 ${
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

      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-lg bg-slate-900 text-white text-xs font-medium flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white text-xs">
            Fermer
          </button>
        </div>
      )}

      {/* Carriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCarriers.map(carrier => {
          const meta = CARRIERS_METADATA[carrier.id];
          return (
            <CarrierCard
              key={carrier.id}
              carrier={carrier}
              meta={meta}
              onConfigure={(c) => setSelectedCarrier(c)}
              onTestConnection={handleTest}
              onSync={handleSync}
              onToggle={onToggleCarrier}
              isTesting={testingId === carrier.id}
              isSyncing={syncingId === carrier.id}
            />
          );
        })}
      </div>

      {filteredCarriers.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Aucun transporteur ne correspond à vos filtres.</p>
        </div>
      )}

      {/* Configuration Modal */}
      {selectedCarrier && (
        <CarrierConfigModal
          carrier={selectedCarrier}
          meta={CARRIERS_METADATA[selectedCarrier.id]}
          onClose={() => setSelectedCarrier(null)}
          onSave={async (data) => {
            await onSaveConfig(selectedCarrier.id, data);
            await onRefresh();
            // Mettre à jour l'état local du modal
            const updated = carriers.find(c => c.id === selectedCarrier.id);
            if (updated) setSelectedCarrier(updated);
          }}
          onTest={async (id) => {
            const res = await onTestCarrier(id);
            await onRefresh();
            return res;
          }}
        />
      )}
    </div>
  );
};
