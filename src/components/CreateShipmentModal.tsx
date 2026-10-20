import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Truck, 
  MapPin, 
  Home, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';
import { DzMahallOrder, CarrierConfigPublic, StopDeskOffice } from '../lib/shipping/types';
import { ALGERIAN_WILAYAS } from '../lib/shipping/algerian-data';

interface CreateShipmentModalProps {
  orders: DzMahallOrder[];
  carriers: CarrierConfigPublic[];
  offices: StopDeskOffice[];
  preselectedOrder?: DzMahallOrder | null;
  onClose: () => void;
  onCreateShipment: (shipmentData: any) => Promise<any>;
}

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  orders,
  carriers,
  offices,
  preselectedOrder,
  onClose,
  onCreateShipment
}) => {
  // Filtrer les commandes éligibles (non encore expédiées)
  const eligibleOrders = orders.filter(o => o.status !== 'shipped' && o.status !== 'delivered' && o.status !== 'cancelled');

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    preselectedOrder?.id || (eligibleOrders[0]?.id || '')
  );

  const activeOrder = orders.find(o => o.id === selectedOrderId) || preselectedOrder;

  // Transporteur connecté par défaut
  const connectedCarriers = carriers.filter(c => c.enabled && (c.status === 'connected' || c.hasCredentials));
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>(
    activeOrder?.preferredCarrierId || connectedCarriers[0]?.id || 'yalidine'
  );

  const [deliveryMode, setDeliveryMode] = useState<'domicile' | 'stop_desk'>(
    activeOrder?.deliveryMode || 'domicile'
  );

  const [stopDeskOfficeId, setStopDeskOfficeId] = useState<string>(
    activeOrder?.stopDeskOfficeId || ''
  );

  const [parcelWeightKg, setParcelWeightKg] = useState<number>(1);
  const [parcelCount, setParcelCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stop Desk bureaux disponibles dans la wilaya de la commande
  const wilayaOffices = offices.filter(off => 
    off.wilayaCode === activeOrder?.wilayaCode &&
    (selectedCarrierId === 'all' || off.carrierId === selectedCarrierId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) {
      setErrorMessage('Veuillez sélectionner une commande valide.');
      return;
    }

    if (deliveryMode === 'stop_desk' && !stopDeskOfficeId && wilayaOffices.length > 0) {
      setErrorMessage('Veuillez sélectionner le centre Stop Desk de retrait du colis.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const chosenOffice = offices.find(o => o.id === stopDeskOfficeId);

    try {
      const result = await onCreateShipment({
        orderId: activeOrder.id,
        carrierId: selectedCarrierId,
        customerName: activeOrder.customerName,
        customerPhone: activeOrder.customerPhone,
        destinationWilayaCode: activeOrder.wilayaCode,
        destinationWilayaName: activeOrder.wilayaName,
        destinationCommune: activeOrder.commune,
        destinationAddress: activeOrder.customerAddress,
        deliveryMode,
        stopDeskOfficeId: deliveryMode === 'stop_desk' ? stopDeskOfficeId : undefined,
        stopDeskOfficeName: deliveryMode === 'stop_desk' ? chosenOffice?.name : undefined,
        parcelWeightKg: Number(parcelWeightKg) || 1,
        parcelCount: Number(parcelCount) || 1,
        productDescription: activeOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
        codAmountDzd: activeOrder.totalDzd,
        customerShippingFeeDzd: activeOrder.shippingFeeDzd
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la création de l’expédition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">
              Créer une Expédition · Génération de Colis
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Sélection Commande */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Commande client éligible à expédier *
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                const ord = orders.find(o => o.id === e.target.value);
                if (ord) {
                  setDeliveryMode(ord.deliveryMode);
                  if (ord.stopDeskOfficeId) setStopDeskOfficeId(ord.stopDeskOfficeId);
                }
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              {eligibleOrders.length === 0 ? (
                <option value="">Aucune commande en attente</option>
              ) : (
                eligibleOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} · {o.customerName} ({o.wilayaCode} - {o.wilayaName}) · {o.totalDzd.toLocaleString()} DZD COD
                  </option>
                ))
              )}
            </select>
          </div>

          {activeOrder && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{activeOrder.customerName}</span>
                <span className="font-mono text-slate-600">{activeOrder.customerPhone}</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                Destination : <strong>{activeOrder.wilayaCode} - {activeOrder.wilayaName}</strong> ({activeOrder.commune})
              </div>
              <div className="text-slate-500 text-[11px] truncate">
                {activeOrder.customerAddress}
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Paiement à la livraison (COD) :</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {activeOrder.totalDzd.toLocaleString()} DZD
                </span>
              </div>
            </div>
          )}

          {/* Choix du Transporteur */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transporteur logistique *
            </label>
            <select
              value={selectedCarrierId}
              onChange={(e) => setSelectedCarrierId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              {carriers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.status === 'connected' ? '✓ (Connecté)' : '(À tester)'}
                </option>
              ))}
            </select>
          </div>

          {/* Mode de livraison */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Mode de distribution
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryMode('domicile')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border transition-all ${
                  deliveryMode === 'domicile'
                    ? 'border-blue-700 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>À Domicile</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMode('stop_desk')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border transition-all ${
                  deliveryMode === 'stop_desk'
                    ? 'border-blue-700 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Stop Desk (Agence)</span>
              </button>
            </div>
          </div>

          {/* Si Stop Desk, sélectionner le bureau */}
          {deliveryMode === 'stop_desk' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sélection du centre Stop Desk ({activeOrder?.wilayaName}) *
              </label>
              {wilayaOffices.length > 0 ? (
                <select
                  value={stopDeskOfficeId}
                  onChange={(e) => setStopDeskOfficeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">Sélectionnez un centre Stop Desk...</option>
                  {wilayaOffices.map(off => (
                    <option key={off.id} value={off.id}>
                      {off.name} ({off.commune}) - {off.address}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                  Aucun bureau Stop Desk pré-enregistré pour la wilaya {activeOrder?.wilayaCode}. Vous pouvez en ajouter un dans l'onglet Bureaux.
                </div>
              )}
            </div>
          )}

          {/* Poids & Colis */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Poids du colis (KG)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={parcelWeightKg}
                onChange={(e) => setParcelWeightKg(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre de pièces</label>
              <input
                type="number"
                min="1"
                value={parcelCount}
                onChange={(e) => setParcelCount(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Anti-double creation notice */}
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Protection anti-doublon active : une commande ne peut être expédiée qu'une seule fois.</span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !activeOrder}
              className="inline-flex items-center gap-2 px-5 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Truck className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmission au transporteur...' : 'Créer le bordereau officiel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
