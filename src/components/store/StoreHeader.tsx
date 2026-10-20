import React from 'react';
import { ShoppingBag, Search, User, ShieldCheck, Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';

interface StoreHeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  userEmail?: string | null;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenAuth,
  userEmail,
  isAdminMode,
  onToggleAdminMode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { id: 'store-home', label: 'Accueil' },
    { id: 'store-products', label: 'Boutique' },
    { id: 'store-delivery', label: 'Livraison 58 Wilayas' },
    { id: 'store-contact', label: 'Contact & WhatsApp' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top micro-announcement banner */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-emerald-400">Paiement 100% à la livraison (COD)</span>
            <span className="hidden sm:inline text-slate-400">· Expédition express dans les 58 wilayas d'Algérie</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <a 
              href="https://wa.me/213660769386" 
              target="_blank" 
              rel="noreferrer"
              className="hidden md:inline hover:text-emerald-400 transition-colors"
            >
              Contact & WhatsApp : <strong className="text-white font-mono">+213 660 769 386</strong>
            </a>
            <button
              onClick={onToggleAdminMode}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-mono"
            >
              <LayoutDashboard className="w-3 h-3 text-blue-400" />
              <span>{isAdminMode ? 'Voir Boutique Client' : 'Panneau Admin / Transporteurs'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Top Bar Contract: 3 zones) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Single text element Brand Zone */}
          <div 
            onClick={() => onNavigate('store-home')}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            <img 
              src="/assets/aistudio/logo_e0e2fa2a.jpg" 
              alt="DzMahall Logo" 
              className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-xs group-hover:scale-105 transition-transform" 
            />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                DzMahall
              </span>
              <span className="text-[10px] font-semibold text-amber-600 tracking-wide mt-0.5">
                Boutique Officielle Algérie
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-line, unboxed, hover underline) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map(link => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                    isActive ? 'text-blue-700 font-bold border-b-2 border-blue-700 pb-0.5' : ''
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action / Cart & User */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('store-products')}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Rechercher</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">
                {userEmail ? 'Mon Compte' : 'Connexion'}
              </span>
            </button>

            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-mono">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onToggleAdminMode();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50"
              >
                Accès Administration & Transporteurs
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
