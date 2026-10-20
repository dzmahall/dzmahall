import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { CartItem } from '../../lib/ecommerce/types';

interface StoreCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  onRemoveItem: (productId: string, variantId?: string) => void;
  onProceedToCheckout: () => void;
}

export const StoreCartDrawer: React.FC<StoreCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const subtotalDzd = items.reduce((sum, item) => sum + (item.unitPriceDzd * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">
              Votre Panier ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map(item => (
            <div 
              key={`${item.productId}-${item.variantId || 'default'}`}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-center"
            >
              <img 
                src={item.product.imageUrl} 
                alt={item.product.name}
                className="w-16 h-16 rounded-xl object-cover bg-white shrink-0 border border-slate-200" 
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {item.product.name}
                </h4>
                {item.selectedVariantName && (
                  <span className="text-[11px] text-slate-500 block truncate">
                    Variante: {item.selectedVariantName}
                  </span>
                )}
                <div className="font-mono font-bold text-xs text-blue-800 mt-1">
                  {(item.unitPriceDzd * item.quantity).toLocaleString()} DZD
                </div>

                {/* Quantity steppers */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center border border-slate-200 bg-white rounded-lg">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="p-1 text-slate-500 hover:text-slate-900"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-mono font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="p-1 text-slate-500 hover:text-slate-900"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.productId, item.variantId)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="py-20 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Votre panier est vide</p>
              <p className="text-xs text-slate-400 mt-1">
                Découvrez nos articles et profitez du paiement à la réception.
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Sous-total articles :</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {subtotalDzd.toLocaleString()} DZD
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-700">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>Paiement à la livraison garanti</span>
              </span>
              <span>58 Wilayas</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Valider ma Commande COD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
