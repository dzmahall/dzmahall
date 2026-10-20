import React from 'react';
import { 
  CheckCircle2, 
  Truck, 
  MapPin, 
  PhoneCall, 
  MessageCircle, 
  Home, 
  Clock, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { DzMahallOrder } from '../../lib/shipping/types';

interface StoreOrderConfirmationProps {
  order: DzMahallOrder;
  onContinueShopping: () => void;
  onTrackOrder?: () => void;
}

export const StoreOrderConfirmation: React.FC<StoreOrderConfirmationProps> = ({
  order,
  onContinueShopping,
  onTrackOrder
}) => {
  // Pre-filled WhatsApp message
  const whatsappMessage = encodeURIComponent(
    `Bonjour DzMahall, je confirme ma commande N° ${order.orderNumber} d'un montant de ${order.totalDzd.toLocaleString()} DZD pour livraison à ${order.wilayaName} (${order.commune}). Mon nom est ${order.customerName}. Merci !`
  );
  const whatsappUrl = `https://wa.me/213660769386?text=${whatsappMessage}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Success banner */}
      <div className="text-center space-y-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          Commande Enregistrée avec Succès
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Merci pour votre commande, {order.customerName} !
        </h1>

        <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
          Votre commande a bien été transmise à notre équipe logistique à Alger. Notre service de confirmation va vous appeler sur le <strong className="text-slate-900 font-mono">{order.customerPhone}</strong> pour valider l'expédition.
        </p>

        {/* WhatsApp Fast Confirmation CTA */}
        <div className="pt-4 max-w-md mx-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Confirmer instantanément sur WhatsApp</span>
          </a>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Accélérez la préparation de votre colis en envoyant un message direct à notre équipe
          </span>
        </div>
      </div>

      {/* Order Summary Receipt Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Numéro de Commande</span>
            <span className="font-mono text-lg font-black text-blue-900">{order.orderNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mode de Paiement</span>
            <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Paiement à la Livraison (COD)
            </span>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Coordonnées du Destinataire</span>
            <div className="font-bold text-slate-900">{order.customerName}</div>
            <div className="font-mono text-slate-600">{order.customerPhone}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination & Mode</span>
            <div className="font-bold text-slate-900">
              {order.wilayaCode} - {order.wilayaName} ({order.commune})
            </div>
            <div className="text-slate-600 flex items-center gap-1">
              {order.deliveryMode === 'stop_desk' ? (
                <>
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Retrait en Agence Stop Desk</span>
                </>
              ) : (
                <>
                  <Home className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Livraison à Domicile : {order.customerAddress}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Articles commandés
          </h3>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-none">
                <span className="font-semibold text-slate-800">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {(item.priceDzd * item.quantity).toLocaleString()} DZD
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Recap */}
        <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Sous-total articles :</span>
            <span className="font-mono">{order.subtotalDzd.toLocaleString()} DZD</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Frais de port ({order.deliveryMode === 'stop_desk' ? 'Stop Desk' : 'Domicile'}) :</span>
            <span className="font-mono">{order.shippingFeeDzd.toLocaleString()} DZD</span>
          </div>
          <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-slate-900">
            <div>
              <span className="font-black text-sm block">TOTAL À PAYER AU LIVREUR :</span>
              <span className="text-[10px] text-slate-400">Règlement en espèces à la réception du colis</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl font-black text-blue-900 tabular-nums">
                {order.totalDzd.toLocaleString()} <span className="text-sm font-bold">DZD</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer action button */}
      <div className="text-center">
        <button
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continuer mes achats sur DzMahall</span>
        </button>
      </div>

    </div>
  );
};
