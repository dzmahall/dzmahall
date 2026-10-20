import React from 'react';
import { 
  Truck, 
  Package, 
  Layers, 
  MapPin, 
  DollarSign, 
  ShoppingBag, 
  Plus, 
  Calculator, 
  ShieldAlert, 
  Box,
  Store,
  Cloud
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewShipment: () => void;
  onOpenNewOrder: () => void;
  onSwitchToStore: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewShipment,
  onOpenNewOrder,
  onSwitchToStore
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Layers },
    { id: 'workspace', label: 'Google Workspace', icon: Cloud },
    { id: 'products', label: 'Produits & Stocks', icon: Box },
    { id: 'profitability', label: 'Rentabilité COD', icon: Calculator },
    { id: 'providers', label: 'Transporteurs', icon: Truck },
    { id: 'rates', label: 'Tarifs & Wilayas', icon: DollarSign },
    { id: 'offices', label: 'Bureaux Stop Desk', icon: MapPin },
    { id: 'shipments', label: 'Expéditions & Suivi', icon: Package },
    { id: 'orders', label: 'Commandes COD', icon: ShoppingBag },
    { id: 'fraud', label: 'Anti-Fraude & WhatsApp', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text/logo Brand Zone */}
          <div 
            onClick={() => onSelectTab('dashboard')} 
            className="flex items-center gap-3 cursor-pointer whitespace-nowrap shrink-0 group"
          >
            <img 
              src="/assets/aistudio/logo_e0e2fa2a.jpg" 
              alt="DzMahall Logo" 
              className="w-10 h-10 rounded-full shadow-xs object-cover border border-slate-100 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                DzMahall
              </span>
              <span className="text-xs text-blue-700 font-semibold">
                Administration & Logistique
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (single line, no wrap) */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'bg-slate-100 text-slate-900 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action buttons & Store Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSwitchToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Aller sur la boutique en ligne DzMahall (vue client)"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voir Boutique</span>
            </button>
            <button
              onClick={onOpenNewShipment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nouvelle Expédition</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-2 py-2 border-t border-slate-100 overflow-x-auto text-xs font-medium no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                  isActive 
                    ? 'bg-slate-900 text-white font-semibold' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
