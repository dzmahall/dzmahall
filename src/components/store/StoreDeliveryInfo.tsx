import React, { useState } from 'react';
import { Truck, MapPin, Search, ShieldCheck, Home, Banknote } from 'lucide-react';
import { ALGERIAN_WILAYAS } from '../../lib/shipping/algerian-data';

export const StoreDeliveryInfo: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredWilayas = ALGERIAN_WILAYAS.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.code.includes(search) ||
    w.arabicName.includes(search)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
          <Truck className="w-3.5 h-3.5" />
          <span>Réseau Logistique Algérie 58 Wilayas</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Délais & Tarifs de Livraison
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          DzMahall dessert toutes les communes d'Algérie en partenariat avec Yalidine Fast Logistics, Guepex Express et EcoTrack.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Home className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Livraison à Domicile</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Le livreur se déplace jusqu'à votre adresse. Vous recevez un appel téléphonique pour fixer l'heure de passage.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Retrait Stop Desk (Économique)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Récupérez votre colis dans l'une des 250+ agences relais réparties sur les 58 wilayas. Tarif avantageux avec une remise de 150 DZD.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Banknote className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Paiement à la Réception (COD)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Aucun paiement en ligne. Vous réglez le montant exact en espèces auprès du livreur ou de l'agent d'accueil.
          </p>
        </div>
      </div>

      {/* Search & Rates Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Grille Officielle par Wilaya
            </h2>
            <p className="text-xs text-slate-500">
              Recherchez votre wilaya pour connaître les frais exacts
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher wilaya (ex: Alger, Oran, 25)..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Wilaya</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4 text-right">À Domicile (DZD)</th>
                <th className="py-3 px-4 text-right">Stop Desk (DZD)</th>
                <th className="py-3 px-4 text-right">Délai Estimé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWilayas.map(w => {
                const domicileFee = w.zone === 'Grand Sud' ? 1400 : w.zone === 'Sud' ? 950 : w.code === '16' ? 500 : 650;
                const stopDeskFee = Math.max(300, domicileFee - 150);
                const delay = w.zone === 'Grand Sud' ? '3-5 jours' : w.zone === 'Sud' ? '48-72h' : w.code === '16' ? '24h' : '24-48h';

                return (
                  <tr key={w.code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{w.code}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {w.name} <span className="text-[11px] text-slate-400 font-normal">({w.arabicName})</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">{w.zone}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {domicileFee.toLocaleString()} DZD
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                      {stopDeskFee.toLocaleString()} DZD
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-600">{delay}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
