import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export const ProfitabilityCalculator: React.FC = () => {
  // Inputs
  const [productCostDzd, setProductCostDzd] = useState<number>(2500);
  const [sellingPriceDzd, setSellingPriceDzd] = useState<number>(6900);
  const [adCostDzd, setAdCostDzd] = useState<number>(1200);      // Coût pub / commande confirmée
  const [packagingDzd, setPackagingDzd] = useState<number>(150);      // Carton, adhésif, flyer
  const [otherChargesDzd, setOtherChargesDzd] = useState<number>(100);  // Centre d'appel, SMS
  const [shippingOutboundDzd, setShippingOutboundDzd] = useState<number>(650); // Transporteur aller
  const [returnFeeDzd, setReturnFeeDzd] = useState<number>(350);       // Frais retour transporteur en cas de refus
  const [deliveryRatePercent, setDeliveryRatePercent] = useState<number>(80); // Taux de livraison réel ex: 80%
  const [batchQuantity, setBatchQuantity] = useState<number>(100);    // Taille du lot

  // Mathematical modeling of Algerian COD E-Commerce
  const deliveryRate = deliveryRatePercent / 100;
  const returnRate = 1 - deliveryRate;

  // Par lot de N commandes expédiées :
  const deliveredOrders = Math.round(batchQuantity * deliveryRate);
  const returnedOrders = batchQuantity - deliveredOrders;

  // Chiffre d'affaires total encaissé (uniquement sur les commandes livrées)
  const totalRevenueDzd = deliveredOrders * sellingPriceDzd;

  // Coûts totaux :
  // 1. Coût d'achat produits vendus (les retours réintègrent le stock)
  const totalProductCostDzd = deliveredOrders * productCostDzd;
  // 2. Publicité engagée sur la totalité des commandes expédiées
  const totalAdCostDzd = batchQuantity * adCostDzd;
  // 3. Emballage (souvent perdu lors de l'expédition)
  const totalPackagingDzd = batchQuantity * packagingDzd;
  // 4. Frais de centre d'appel / charges fixes
  const totalOtherChargesDzd = batchQuantity * otherChargesDzd;
  // 5. Frais d'expédition aller (facturés sur TOUTES les commandes expédiées)
  const totalOutboundShippingDzd = batchQuantity * shippingOutboundDzd;
  // 6. Frais de retour transporteur (facturés sur les commandes refusées/non abouties)
  const totalReturnFeesDzd = returnedOrders * returnFeeDzd;

  const totalExpensesDzd = 
    totalProductCostDzd + 
    totalAdCostDzd + 
    totalPackagingDzd + 
    totalOtherChargesDzd + 
    totalOutboundShippingDzd + 
    totalReturnFeesDzd;

  const netProfitTotalDzd = totalRevenueDzd - totalExpensesDzd;
  const netProfitPerDeliveredOrderDzd = deliveredOrders > 0 ? Math.round(netProfitTotalDzd / deliveredOrders) : 0;
  const netMarginPercent = totalRevenueDzd > 0 ? Math.round((netProfitTotalDzd / totalRevenueDzd) * 100) : 0;

  // Seuil de rentabilité (Break-even delivery rate)
  // Formule : Taux min de livraison = (Ad + Pack + Other + ShippingOutbound) / (SellingPrice - ProductCost + ReturnFee - ShippingOutbound...)
  const fixedPerShipment = adCostDzd + packagingDzd + otherChargesDzd + shippingOutboundDzd + returnFeeDzd;
  const grossProfitPerDelivery = sellingPriceDzd - productCostDzd + returnFeeDzd;
  const breakEvenRate = grossProfitPerDelivery > 0 ? Math.min(100, Math.max(0, Math.round((fixedPerShipment / grossProfitPerDelivery) * 100))) : 100;

  // Scénarios de sensibilité
  const scenarios = [60, 70, 75, 80, 85, 90].map(rate => {
    const dRate = rate / 100;
    const deliv = Math.round(batchQuantity * dRate);
    const ret = batchQuantity - deliv;
    const rev = deliv * sellingPriceDzd;
    const exp = (deliv * productCostDzd) + (batchQuantity * (adCostDzd + packagingDzd + otherChargesDzd + shippingOutboundDzd)) + (ret * returnFeeDzd);
    const profit = rev - exp;
    return { rate, delivered: deliv, returned: ret, profit, margin: rev > 0 ? Math.round((profit / rev) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Calculateur de Rentabilité E-Commerce Algérien (COD)
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Formules Réelles & Prise en Compte des Retours
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Modélisation financière intégrant les frais de retour transporteur, le coût publicitaire et le taux de livraison réel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Colonne Gauche: Paramètres & Entrées (5/12) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Hypothèses Financières & Coûts
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prix de Vente Client (DZD)</label>
              <input
                type="number"
                value={sellingPriceDzd}
                onChange={(e) => setSellingPriceDzd(Number(e.target.value))}
                className="w-full font-mono font-bold text-blue-900 px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coût d'Achat Produit (DZD)</label>
              <input
                type="number"
                value={productCostDzd}
                onChange={(e) => setProductCostDzd(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coût Pub / Commande (DZD)</label>
              <input
                type="number"
                value={adCostDzd}
                onChange={(e) => setAdCostDzd(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emballage & Carton (DZD)</label>
              <input
                type="number"
                value={packagingDzd}
                onChange={(e) => setPackagingDzd(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Livraison Aller (DZD)</label>
              <input
                type="number"
                value={shippingOutboundDzd}
                onChange={(e) => setShippingOutboundDzd(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Frais Retour Échec (DZD)</label>
              <input
                type="number"
                value={returnFeeDzd}
                onChange={(e) => setReturnFeeDzd(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Taux de livraison Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>Taux de Livraison Estimé :</span>
              <span className="font-mono text-blue-700 text-sm">{deliveryRatePercent}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="95"
              step="1"
              value={deliveryRatePercent}
              onChange={(e) => setDeliveryRatePercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>40% (Critique)</span>
              <span>80% (Moyenne DZ)</span>
              <span>95% (Excellent)</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Taille du Lot (Nombre de colis expédiés)</label>
            <input
              type="number"
              value={batchQuantity}
              onChange={(e) => setBatchQuantity(Number(e.target.value))}
              className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Colonne Droite: Résultats & KPIs (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Bénéfice Net Total</span>
              <div className={`text-2xl font-black font-mono mt-1 ${netProfitTotalDzd >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {netProfitTotalDzd.toLocaleString()} <span className="text-xs font-normal text-slate-600">DZD</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Marge nette : <strong>{netMarginPercent}%</strong>
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Profit Net / Colis Livré</span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {netProfitPerDeliveredOrderDzd.toLocaleString()} <span className="text-xs font-normal text-slate-600">DZD</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Sur {deliveredOrders} commandes livrées
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold block uppercase">Seuil de Rentabilité</span>
              <div className="text-2xl font-black font-mono text-blue-800 mt-1">
                {breakEvenRate}%
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Taux min. pour ne pas être en perte
              </span>
            </div>
          </div>

          {/* Dépouillement des dépenses */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">
              Récapitulatif Financier pour {batchQuantity} Colis Expédiés
            </h3>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-slate-600">
                <span>Chiffre d'affaires encaissé ({deliveredOrders} livraisons) :</span>
                <span className="font-mono font-bold text-slate-900">{totalRevenueDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Coût d'achat marchandises vendues :</span>
                <span className="font-mono text-slate-700">-{totalProductCostDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dépenses publicitaires totales :</span>
                <span className="font-mono text-slate-700">-{totalAdCostDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Frais d'expédition transporteur aller :</span>
                <span className="font-mono text-slate-700">-{totalOutboundShippingDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between text-rose-700 font-semibold">
                <span>Frais de retour supportés ({returnedOrders} colis refusés) :</span>
                <span className="font-mono">-{totalReturnFeesDzd.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Emballages & charges fixes :</span>
                <span className="font-mono text-slate-700">-{(totalPackagingDzd + totalOtherChargesDzd).toLocaleString()} DZD</span>
              </div>

              <div className="pt-3 border-t border-slate-300 flex justify-between font-bold text-slate-900 text-sm">
                <span>BÉNÉFICE NET FINAL ENCAISSÉ :</span>
                <span className={`font-mono text-base ${netProfitTotalDzd >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {netProfitTotalDzd.toLocaleString()} DZD
                </span>
              </div>
            </div>
          </div>

          {/* Table de Sensibilité selon le Taux de Livraison */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">
                Tableau de Sensibilité aux Retours
              </h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-4">Taux Livraison</th>
                  <th className="py-2.5 px-4 text-center">Livrés / Retours</th>
                  <th className="py-2.5 px-4 text-right">Bénéfice Net</th>
                  <th className="py-2.5 px-4 text-right">Marge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scenarios.map(sc => (
                  <tr key={sc.rate} className={sc.rate === deliveryRatePercent ? 'bg-blue-50 font-bold' : ''}>
                    <td className="py-2.5 px-4 font-mono">{sc.rate}%</td>
                    <td className="py-2.5 px-4 text-center font-mono text-slate-600">
                      {sc.delivered} / {sc.returned}
                    </td>
                    <td className={`py-2.5 px-4 text-right font-mono font-bold ${sc.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {sc.profit.toLocaleString()} DZD
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">{sc.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
