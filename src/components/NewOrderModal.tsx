import React, { useState } from 'react';
import { X, ShoppingBag, MapPin, Home, CheckCircle2, DollarSign } from 'lucide-react';
import { ALGERIAN_WILAYAS } from '../lib/shipping/algerian-data';
import { CarrierConfigPublic, DeliveryMode } from '../lib/shipping/types';

interface NewOrderModalProps {
  carriers: CarrierConfigPublic[];
  onClose: () => void;
  onCreateOrder: (orderData: any) => Promise<void>;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  carriers,
  onClose,
  onCreateOrder
}) => {
  const [customerName, setCustomerName] = useState('Sofiane Meziani');
  const [customerPhone, setCustomerPhone] = useState('0550 44 33 22');
  const [wilayaCode, setWilayaCode] = useState('16');
  const [commune, setCommune] = useState('Hydra');
  const [customerAddress, setCustomerAddress] = useState('Rue Djenane El Malik, Villa 12');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('domicile');
  const [selectedProduct, setSelectedProduct] = useState('Pack Café Découverte DzMahall');
  const [priceDzd, setPriceDzd] = useState(4800);
  const [shippingFeeDzd, setShippingFeeDzd] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWilaya = ALGERIAN_WILAYAS.find(w => w.code === wilayaCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateOrder({
        customerName,
        customerPhone,
        customerAddress,
        wilayaCode,
        wilayaName: selectedWilaya?.name || 'Alger',
        commune,
        deliveryMode,
        items: [
          { id: `p_${Date.now()}`, name: selectedProduct, priceDzd, quantity: 1 }
        ],
        subtotalDzd: priceDzd,
        shippingFeeDzd
      });
      onClose();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Passer une Commande Test (Paiement COD)
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nom complet du client</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Téléphone mobile (Algérie)</label>
            <input
              type="text"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full font-mono px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Wilaya de livraison</label>
              <select
                value={wilayaCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setWilayaCode(code);
                  if (code === '16') setCommune('Hydra');
                  else if (code === '31') setCommune('Oran Centre');
                  else if (code === '25') setCommune('Constantine');
                }}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
              >
                {ALGERIAN_WILAYAS.map(w => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Commune</label>
              <input
                type="text"
                required
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Adresse détaillée</label>
            <input
              type="text"
              required
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Mode de livraison souhaité</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeliveryMode('domicile');
                  setShippingFeeDzd(500);
                }}
                className={`py-1.5 px-3 rounded-lg border text-center transition-all ${
                  deliveryMode === 'domicile'
                    ? 'border-blue-700 bg-blue-50 font-bold text-blue-900'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                À Domicile (500 DZD)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeliveryMode('stop_desk');
                  setShippingFeeDzd(350);
                }}
                className={`py-1.5 px-3 rounded-lg border text-center transition-all ${
                  deliveryMode === 'stop_desk'
                    ? 'border-blue-700 bg-blue-50 font-bold text-blue-900'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Stop Desk (350 DZD)
              </button>
            </div>
          </div>

          {/* Produit & Total COD */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>{selectedProduct}</span>
              <span className="font-mono">{priceDzd.toLocaleString()} DZD</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Frais de livraison {deliveryMode === 'stop_desk' ? 'Stop Desk' : 'Domicile'}</span>
              <span className="font-mono">{shippingFeeDzd.toLocaleString()} DZD</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
              <span>Total à payer à la livraison (COD)</span>
              <span className="font-mono text-sm text-blue-800">
                {(priceDzd + shippingFeeDzd).toLocaleString()} DZD
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
            >
              {isSubmitting ? 'Validation...' : 'Créer la commande COD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
