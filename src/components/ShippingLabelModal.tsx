import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { Shipment } from '../lib/shipping/types';

interface ShippingLabelModalProps {
  shipment: Shipment;
  onClose: () => void;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  shipment,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Action Header (hidden during print) */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Bordereau d'Expédition Algérie (Format Thermique A6)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le Bordereau</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Label Section (A6 Format) */}
        <div className="p-6 bg-slate-100 print:p-0 print:bg-white flex justify-center">
          <div 
            id="printable-label"
            className="w-full max-w-[420px] bg-white border-2 border-slate-900 p-5 rounded-md shadow-xs text-slate-900 font-sans print:border-none print:shadow-none print:p-0"
          >
            {/* Top Bar with Carrier & DzMahall */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <img 
                  src="/assets/aistudio/logo_e0e2fa2a.jpg" 
                  alt="DzMahall" 
                  className="w-9 h-9 rounded-full object-cover" 
                />
                <div>
                  <div className="font-extrabold text-sm tracking-tight">DzMahall</div>
                  <div className="text-[10px] text-slate-600 font-mono">Boutique & Logistique</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                  {shipment.carrierName}
                </div>
                <div className="inline-block px-1.5 py-0.5 mt-0.5 text-[10px] font-bold uppercase rounded bg-slate-900 text-white">
                  {shipment.deliveryMode === 'stop_desk' ? '★ STOP DESK ★' : 'DOMICILE'}
                </div>
              </div>
            </div>

            {/* Wilaya Destination Hero Box */}
            <div className="border-2 border-slate-900 rounded p-2 mb-3 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Wilaya Destination</span>
                <span className="text-xl font-extrabold text-slate-900 leading-none">
                  {shipment.destinationWilayaCode} - {shipment.destinationWilayaName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Commune</span>
                <span className="text-sm font-bold text-slate-900">
                  {shipment.destinationCommune}
                </span>
              </div>
            </div>

            {/* Barcode & Tracking Number */}
            <div className="text-center py-2 border-b border-slate-300 mb-3">
              {/* Simulated Code-128 Barcode bars */}
              <div className="flex justify-center items-end gap-[2px] h-12 w-full max-w-[280px] mx-auto mb-1">
                {[3,1,2,4,1,3,2,1,4,2,1,3,1,4,2,3,1,2,4,1,2,3,1,4,2,1,3,2,4,1,3,2,1,4,2,3,1,2].map((w, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-900 h-full" 
                    style={{ width: `${w * 1.5}px` }} 
                  />
                ))}
              </div>
              <div className="font-mono font-extrabold text-base tracking-widest text-slate-900">
                {shipment.trackingNumber.toUpperCase()}
              </div>
              <div className="text-[10px] text-slate-500">
                Réf. Commande : {shipment.orderId}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-1.5 border-b border-slate-300 pb-3 mb-3 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Destinataire</span>
                  <span className="font-bold text-sm text-slate-900">{shipment.customerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Téléphone</span>
                  <span className="font-mono font-bold text-sm text-slate-900">{shipment.customerPhone}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  {shipment.deliveryMode === 'stop_desk' ? 'Point Relais de Retrait' : 'Adresse de Livraison'}
                </span>
                <span className="font-medium text-xs leading-snug">
                  {shipment.deliveryMode === 'stop_desk' 
                    ? `${shipment.stopDeskOfficeName || 'Bureau Stop Desk'} (${shipment.destinationCommune})`
                    : shipment.destinationAddress}
                </span>
              </div>
            </div>

            {/* COD Amount Banner (MONTANT À ENCAISSER) */}
            <div className="bg-slate-900 text-white p-3 rounded text-center mb-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Montant Total à Encaisser (Cash on Delivery)
              </div>
              <div className="text-2xl font-black font-mono tracking-tight mt-0.5">
                {shipment.codAmountDzd.toLocaleString()} <span className="text-sm font-semibold">DZD</span>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
                Paiement en espèces à la livraison · Ne pas ouvrir avant paiement
              </div>
            </div>

            {/* Parcel Meta Specs */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-t border-slate-200 pt-2 text-slate-600">
              <div>
                <span className="block font-bold text-slate-400 uppercase">Poids</span>
                <span className="font-mono font-bold text-slate-900">{shipment.parcelWeightKg} KG</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400 uppercase">Colis</span>
                <span className="font-mono font-bold text-slate-900">{shipment.parcelCount} Pièce(s)</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400 uppercase">Date</span>
                <span className="font-mono font-bold text-slate-900">
                  {new Date(shipment.createdAt).toLocaleDateString('fr-DZ')}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-500">
              DzMahall Plateforme E-Commerce · Support Client : 0550 00 00 00 · www.dzmahall.com
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
