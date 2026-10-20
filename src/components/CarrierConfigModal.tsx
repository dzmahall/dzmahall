import React, { useState, useEffect } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Save, 
  Play, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  HelpCircle,
  Activity,
  Webhook
} from 'lucide-react';
import { CarrierConfigPublic, CarrierMeta, ConnectionTestResult } from '../lib/shipping/types';

interface CarrierConfigModalProps {
  carrier: CarrierConfigPublic;
  meta: CarrierMeta;
  onClose: () => void;
  onSave: (configData: any) => Promise<void>;
  onTest: (id: string) => Promise<ConnectionTestResult>;
}

export const CarrierConfigModal: React.FC<CarrierConfigModalProps> = ({
  carrier,
  meta,
  onClose,
  onSave,
  onTest
}) => {
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>(carrier.environment || 'sandbox');
  const [baseUrl, setBaseUrl] = useState<string>(carrier.baseUrl || meta.defaultBaseUrl || '');
  const [enabled, setEnabled] = useState<boolean>(carrier.enabled);
  const [webhookSecret, setWebhookSecret] = useState<string>('');
  
  // Clés en cours d'édition (ne contient que les nouvelles saisies)
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  // État de visibilité (œil) pour chaque champ masqué
  const [showSecretMap, setShowSecretMap] = useState<Record<string, boolean>>({});
  // Liste des clés marquées pour suppression
  const [keysToDelete, setKeysToDelete] = useState<string[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Charger les valeurs par défaut
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    meta.fields.forEach(f => {
      if (f.defaultValue && !carrier.configuredFields.includes(f.key)) {
        initialValues[f.key] = f.defaultValue;
      }
    });
    setFormValues(initialValues);
  }, [carrier, meta]);

  const handleFieldChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    // Si l'utilisateur tape une nouvelle valeur, retirer de la liste à supprimer
    setKeysToDelete(prev => prev.filter(k => k !== key));
  };

  const handleClearField = (key: string) => {
    setKeysToDelete(prev => [...prev, key]);
    setFormValues(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const toggleShowSecret = (key: string) => {
    setShowSecretMap(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMessage(null);

    const payloadCredentials: Record<string, string> = {};
    
    // Pour chaque champ modifié
    for (const [k, v] of Object.entries(formValues)) {
      if (v !== undefined) {
        payloadCredentials[k] = v;
      }
    }

    // Pour les champs supprimés
    keysToDelete.forEach(k => {
      payloadCredentials[k] = '';
    });

    try {
      await onSave({
        enabled,
        environment,
        baseUrl,
        credentials: payloadCredentials,
        webhookSecret: webhookSecret || undefined
      });
      setSaveSuccessMessage('Configuration enregistrée avec succès sur le serveur DzMahall.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err: any) {
      alert('Erreur lors de la sauvegarde : ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTest(carrier.id);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Erreur lors du déclenchement du test : ' + err.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
              style={{ backgroundColor: meta.brandColor }}
            >
              {meta.id === 'yalidine' ? 'YL' : meta.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Configuration · {carrier.name}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Algérie (58 Wilayas)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Paramètres d'API, clés de sécurité et validation du connecteur
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Notice Sécurité Serveur */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">Stockage sécurisé côté serveur (Node.js AES-256)</span>
              Vos identifiants et clés privées sont chiffrés et stockés exclusivement sur le serveur. Aucune clé secrète n'est exposée au navigateur ou stockée en clair.
            </div>
          </div>

          {/* Statut & Environnement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Environnement d'exécution
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setEnvironment('sandbox')}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
                    environment === 'sandbox' 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sandbox (Test)
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment('production')}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
                    environment === 'production' 
                      ? 'bg-white text-blue-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Production Live
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Activation du service
              </label>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-600">
                  {enabled ? 'Proposé aux clients à la commande' : 'Désactivé pour les commandes'}
                </span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* URL de base de l'API */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL de base de l'API (Endpoint)
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={meta.defaultBaseUrl}
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Par défaut : <code className="text-slate-700">{meta.defaultBaseUrl}</code>
            </p>
          </div>

          {/* Champs dynamiques selon le transporteur */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Identifiants & Paramètres Requis par {meta.name}
              </h3>
              <span className="text-xs text-slate-400">
                {meta.fields.filter(f => f.required).length} obligatoire(s)
              </span>
            </div>

            {meta.fields.map((field) => {
              const isConfiguredOnServer = carrier.configuredFields.includes(field.key);
              const isMarkedDelete = keysToDelete.includes(field.key);
              const hasNewInput = formValues[field.key] !== undefined && formValues[field.key] !== '';
              const showSecret = showSecretMap[field.key] || false;
              const maskedVal = carrier.maskedCredentials[field.key] || '••••••••';

              return (
                <div key={field.key} className="space-y-1.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {field.label}
                      {field.required && (
                        <span className="text-rose-500" title="Champ obligatoire">*</span>
                      )}
                    </label>

                    {isConfiguredOnServer && !isMarkedDelete && !hasNewInput && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        Clé configurée & chiffrée
                      </span>
                    )}
                  </div>

                  {field.type === 'select' && field.options ? (
                    <select
                      value={formValues[field.key] || field.defaultValue || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      {isConfiguredOnServer && !isMarkedDelete && !hasNewInput ? (
                        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white">
                          <span className="text-xs font-mono text-slate-500 tracking-wider">
                            {maskedVal}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleFieldChange(field.key, '')}
                              className="text-xs font-medium text-blue-700 hover:text-blue-900 px-2 py-0.5 rounded hover:bg-blue-50"
                            >
                              Remplacer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClearField(field.key)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100"
                              title="Supprimer cette clé"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative flex items-center">
                          <input
                            type={field.isSecret && !showSecret ? 'password' : 'text'}
                            value={formValues[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder || `Entrez votre ${field.label}`}
                            className="w-full text-xs font-mono px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {field.isSecret && (
                            <button
                              type="button"
                              onClick={() => toggleShowSecret(field.key)}
                              className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 rounded"
                              title={showSecret ? "Masquer la valeur" : "Afficher temporairement"}
                            >
                              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {field.description && (
                    <p className="text-[11px] text-slate-500">
                      {field.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Webhooks (si supporté par le transporteur) */}
          {meta.supportsWebhooks && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-slate-900">
                  Notification Webhook (Mises à jour de statut automatiques)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Configurez cette URL dans votre espace partenaire {carrier.name} pour recevoir les notifications d'expédition en direct :
              </p>
              <div className="p-2.5 rounded-lg bg-slate-100 font-mono text-xs text-slate-700 select-all border border-slate-200">
                {window.location.origin}/api/shipping/webhooks/{carrier.id}
              </div>
            </div>
          )}

          {/* Section Test de connexion & Diagnostic en direct */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Diagnostic & Test Réel de l'API
                </span>
              </div>

              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting || (!carrier.hasCredentials && Object.keys(formValues).length === 0)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isTesting 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Test en cours...' : 'Tester la connexion maintenant'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs border ${
                testResult.success 
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200' 
                  : 'bg-rose-950/60 border-rose-700/60 text-rose-200'
              }`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-semibold flex items-center gap-1.5">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    {testResult.success ? 'Succès de la validation' : 'Erreur de diagnostic'}
                  </span>
                  {testResult.latencyMs && (
                    <span className="font-mono text-[11px] opacity-80 tabular-nums">
                      Latence: {testResult.latencyMs}ms
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed">
                  {testResult.message}
                </p>
                {testResult.diagnosticDetails?.verifiedFeatures && (
                  <div className="mt-2 pt-2 border-t border-emerald-800/60 flex flex-wrap gap-2 text-[11px]">
                    <span className="opacity-75">Fonctions validées :</span>
                    {testResult.diagnosticDetails.verifiedFeatures.map(feat => (
                      <span key={feat} className="bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {saveSuccessMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Fermer
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
