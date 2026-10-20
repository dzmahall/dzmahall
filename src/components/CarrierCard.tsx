import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Settings, 
  RefreshCw, 
  Power, 
  Play, 
  MapPin, 
  Home, 
  ShieldCheck,
  ExternalLink 
} from 'lucide-react';
import { CarrierConfigPublic, CarrierMeta } from '../lib/shipping/types';

interface CarrierCardProps {
  carrier: CarrierConfigPublic;
  meta: CarrierMeta;
  onConfigure: (carrier: CarrierConfigPublic) => void;
  onTestConnection: (id: string) => Promise<void>;
  onSync: (id: string) => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  isTesting: boolean;
  isSyncing: boolean;
}

export const CarrierCard: React.FC<CarrierCardProps> = ({
  carrier,
  meta,
  onConfigure,
  onTestConnection,
  onSync,
  onToggle,
  isTesting,
  isSyncing,
}) => {
  const [toggleLoading, setToggleLoading] = useState(false);

  const getStatusBadge = () => {
    switch (carrier.status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Connecté & Opérationnel
          </span>
        );
      case 'ready_to_test':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Clés saisies · À tester
          </span>
        );
      case 'incomplete':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
            <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
            Configuration incomplète
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Erreur de connexion
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            <Power className="w-3.5 h-3.5 text-slate-400" />
            Désactivé
          </span>
        );
      case 'unconfigured':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Non configuré
          </span>
        );
    }
  };

  const handleToggle = async () => {
    setToggleLoading(true);
    try {
      await onToggle(carrier.id, !carrier.enabled);
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
      carrier.status === 'connected' ? 'border-slate-300' : 'border-slate-200'
    } ${!carrier.enabled ? 'opacity-85' : ''}`}>
      
      {/* Header section */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Visual avatar badge with carrier initial & brand color */}
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0"
              style={{ backgroundColor: meta.brandColor }}
            >
              {meta.id === 'yalidine' ? 'YL' :
               meta.id === 'guepex' ? 'GP' :
               meta.id === 'ecotrack' ? 'ET' :
               meta.id === 'zr_express' ? 'ZR' :
               meta.id === 'maystro' ? 'MY' :
               meta.id === 'noest' ? 'NO' :
               meta.id === 'anderson' ? 'AD' :
               meta.id === 'dhd' ? 'DH' : 'DZ'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {carrier.name}
                </h3>
                {meta.officialWebsite && (
                  <a 
                    href={meta.officialWebsite} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Site officiel"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                <span>{carrier.environment === 'production' ? 'Production' : 'Sandbox (Test)'}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{meta.fields.filter(f => f.required).length} clés requises</span>
              </div>
            </div>
          </div>

          <div>
            {getStatusBadge()}
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {meta.description}
        </p>

        {/* Supported modes & stats strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Modes:</span>
            <div className="flex items-center gap-1.5">
              {meta.supportedModes.includes('domicile') && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                  <Home className="w-3 h-3 text-slate-500" />
                  Domicile
                </span>
              )}
              {meta.supportedModes.includes('stop_desk') && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  Stop Desk
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span>Expéditions :</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {carrier.shipmentCount}
            </span>
          </div>
        </div>

        {/* Diagnostic info banner if tested */}
        {carrier.lastTestedAt && (
          <div className={`mt-3 p-2.5 rounded-lg text-xs ${
            carrier.lastTestSuccess 
              ? 'bg-slate-50 text-slate-700 border border-slate-100' 
              : 'bg-rose-50 text-rose-800 border border-rose-100'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-medium">
                {carrier.lastTestSuccess ? 'Dernier test réussi' : 'Dernier test en échec'}
              </span>
              {carrier.lastTestLatencyMs !== undefined && (
                <span className="font-mono text-[11px] opacity-75 tabular-nums">
                  {carrier.lastTestLatencyMs}ms
                </span>
              )}
            </div>
            <p className="text-[11px] leading-snug line-clamp-2">
              {carrier.lastTestMessage || 'Test effectué.'}
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onConfigure(carrier)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Configurer</span>
          </button>

          <button
            onClick={() => onTestConnection(carrier.id)}
            disabled={isTesting || !carrier.hasCredentials}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${
              isTesting 
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : carrier.hasCredentials
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
            title={carrier.hasCredentials ? "Exécuter un test réel de connexion à l'API" : "Veuillez d'abord renseigner vos clés API"}
          >
            <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : 'text-blue-600'}`} />
            <span>{isTesting ? 'Test en cours...' : 'Tester'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {meta.supportsStopDesk && (
            <button
              onClick={() => onSync(carrier.id)}
              disabled={isSyncing || carrier.status !== 'connected'}
              className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-500 rounded hover:bg-slate-200 transition-colors"
              title="Synchroniser les centres et points relais Stop Desk"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={handleToggle}
            disabled={toggleLoading}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors border ${
              carrier.enabled 
                ? 'text-rose-700 hover:bg-rose-50 border-rose-200' 
                : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200 bg-white'
            }`}
          >
            {carrier.enabled ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>
    </div>
  );
};
