import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShoppingBag, 
  MessageCircle, 
  Plus, 
  Trash2, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Ban,
  Search,
  AlertTriangle
} from 'lucide-react';
import { AbandonedCart, BlacklistEntry } from '../../lib/ecommerce/types';

interface AbandonedCartsAntiFraudProps {
  abandonedCarts: AbandonedCart[];
  blacklist: BlacklistEntry[];
  onAddBlacklist: (entry: Omit<BlacklistEntry, 'id' | 'addedAt'>) => Promise<void>;
  onRemoveBlacklist: (id: string) => Promise<void>;
  onMarkRecovered: (cartId: string) => Promise<void>;
}

export const AbandonedCartsAntiFraud: React.FC<AbandonedCartsAntiFraudProps> = ({
  abandonedCarts,
  blacklist,
  onAddBlacklist,
  onRemoveBlacklist,
  onMarkRecovered
}) => {
  const [activeTab, setActiveTab] = useState<'abandoned' | 'blacklist'>('abandoned');
  
  // New blacklist entry state
  const [newPhone, setNewPhone] = useState('');
  const [newReason, setNewReason] = useState('Refus de colis répétés sans motif');
  const [isAddingBlacklist, setIsAddingBlacklist] = useState(false);

  const handleCreateBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;
    setIsAddingBlacklist(true);
    try {
      await onAddBlacklist({
        phone: newPhone.replace(/[\s.-]/g, ''),
        reason: newReason,
        orderCountBeforeBlock: 2
      });
      setNewPhone('');
    } finally {
      setIsAddingBlacklist(false);
    }
  };

  const getWhatsAppRecoveryUrl = (cart: AbandonedCart) => {
    const text = encodeURIComponent(
      `Bonjour ${cart.customerName || ''}, nous avons remarqué que vous n'avez pas finalisé votre commande sur DzMahall. Vos articles sont réservés en paiement à la livraison. Avez-vous besoin d'aide pour choisir votre wilaya ou finaliser ?`
    );
    const cleanPhone = (cart.phone || '').replace(/[\s.-]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '213' + cleanPhone.slice(1) : cleanPhone;
    return `https://wa.me/${intlPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Anti-Fraude & Paniers Abandonnés
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Protection E-Commerce Algérie
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Relancez vos prospects par WhatsApp et bloquez les numéros récidivistes de fausses commandes.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('abandoned')}
            className={`py-1.5 px-3.5 rounded-lg transition-all ${
              activeTab === 'abandoned' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Paniers Abandonnés ({abandonedCarts.filter(c => !c.recovered).length})
          </button>
          <button
            onClick={() => setActiveTab('blacklist')}
            className={`py-1.5 px-3.5 rounded-lg transition-all ${
              activeTab === 'blacklist' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Liste Noire Téléphones & IP ({blacklist.length})
          </button>
        </div>
      </div>

      {activeTab === 'abandoned' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-900">
              Formulaires COD commencés mais non finalisés
            </div>
            <span className="text-[11px] text-slate-500">
              Relance en 1 clic par WhatsApp
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Date & Prospect</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Wilaya ciblée</th>
                  <th className="py-3 px-4">Articles dans le panier</th>
                  <th className="py-3 px-4 text-right">Montant (DZD)</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Action Relance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {abandonedCarts.map(cart => (
                  <tr key={cart.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{cart.customerName || 'Visiteur anonyme'}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(cart.createdAt).toLocaleString('fr-DZ')}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {cart.phone || 'Non saisi'}
                    </td>

                    <td className="py-3 px-4">
                      {cart.wilayaName ? (
                        <span className="font-semibold text-slate-800">
                          {cart.wilayaCode} - {cart.wilayaName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Non sélectionnée</span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate">
                      {cart.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {cart.totalDzd.toLocaleString()} DZD
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        cart.recovered ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {cart.recovered ? 'Converti en commande' : 'En attente'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {cart.phone && !cart.recovered && (
                        <a
                          href={getWhatsAppRecoveryUrl(cart)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Relancer WhatsApp</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}

                {abandonedCarts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Aucun panier abandonné pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Blacklist View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Add form (4/12) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <Ban className="w-4 h-4" />
              <span>Bloquer un Numéro Fraudeur</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Tout numéro sur cette liste verra ses commandes automatiquement bloquées pour éviter les frais de retour inutiles.
            </p>

            <form onSubmit={handleCreateBlacklist} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Numéro de téléphone</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="05 / 06 / 07 XX XX XX"
                  className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Motif du blocage</label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Refus de colis répétés sans motif">Refus de colis répétés sans motif</option>
                  <option value="Client injoignable après confirmation">Client injoignable après confirmation</option>
                  <option value="Numéro faux / fantôme">Numéro faux / fantôme</option>
                  <option value="Tentatives d'abus automatisées">Tentatives d'abus automatisées</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isAddingBlacklist}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold transition-colors"
              >
                Ajouter à la liste noire
              </button>
            </form>
          </div>

          {/* Table (8/12) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
              Numéros et IP Suspects Enregistrés ({blacklist.length})
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-4">Numéro / Identifiant</th>
                  <th className="py-2.5 px-4">Motif</th>
                  <th className="py-2.5 px-4">Date d'inscription</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blacklist.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {entry.phone || entry.ipAddress}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">
                      {entry.reason}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                      {new Date(entry.addedAt).toLocaleDateString('fr-DZ')}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onRemoveBlacklist(entry.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Débloquer ce numéro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {blacklist.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Aucun numéro bloqué. Votre boutique est saine.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
