/**
 * DzMahall - Plateforme E-Commerce Algérie & Moteur Logistique COD
 * Boutique publique mobile-first + Panneau d'administration full-stack
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ShippingDashboard } from './components/ShippingDashboard';
import { CarriersList } from './components/CarriersList';
import { RatesManager } from './components/RatesManager';
import { StopDeskManager } from './components/StopDeskManager';
import { ShipmentsManager } from './components/ShipmentsManager';
import { OrdersManager } from './components/OrdersManager';
import { ShippingLabelModal } from './components/ShippingLabelModal';
import { CreateShipmentModal } from './components/CreateShipmentModal';
import { NewOrderModal } from './components/NewOrderModal';

// Composants Store Client
import { StoreHeader } from './components/store/StoreHeader';
import { StoreHome } from './components/store/StoreHome';
import { StoreCatalog } from './components/store/StoreCatalog';
import { StoreProductDetail } from './components/store/StoreProductDetail';
import { StoreCheckout } from './components/store/StoreCheckout';
import { StoreOrderConfirmation } from './components/store/StoreOrderConfirmation';
import { StoreDeliveryInfo } from './components/store/StoreDeliveryInfo';
import { StoreContact } from './components/store/StoreContact';
import { StoreCartDrawer } from './components/store/StoreCartDrawer';
import { StoreAuthModal } from './components/store/StoreAuthModal';

// Composants Admin Métier & Rentabilité
import { ProductsManager } from './components/admin/ProductsManager';
import { ProfitabilityCalculator } from './components/admin/ProfitabilityCalculator';
import { AbandonedCartsAntiFraud } from './components/admin/AbandonedCartsAntiFraud';
import { GoogleWorkspaceManager } from './components/admin/GoogleWorkspaceManager';

import { 
  CarrierConfigPublic, 
  ShippingRateRule, 
  StopDeskOffice, 
  Shipment, 
  DzMahallOrder,
  ConnectionTestResult,
  ShipmentStatus
} from './lib/shipping/types';

import { 
  Product, 
  CartItem, 
  ProductVariant, 
  BundleOffer,
  AbandonedCart, 
  BlacklistEntry 
} from './lib/ecommerce/types';

import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation principale : 'store' (Boutique publique) ou 'admin' (Backoffice logistique & gestion)
  const [appMode, setAppMode] = useState<'store' | 'admin'>('store');

  // Sous-vues de la boutique publique
  const [storeView, setStoreView] = useState<string>('store-home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<DzMahallOrder | null>(null);

  // Onglet actif du panneau d'administration
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  
  // États de données
  const [stats, setStats] = useState<any>(null);
  const [carriers, setCarriers] = useState<CarrierConfigPublic[]>([]);
  const [rates, setRates] = useState<ShippingRateRule[]>([]);
  const [offices, setOffices] = useState<StopDeskOffice[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<DzMahallOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);

  // Panier client
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Authentification & Rôles
  const [currentUser, setCurrentUser] = useState<{ email?: string; role?: string } | null>({
    email: 'ntipro360@gmail.com',
    role: 'admin'
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales d'administration
  const [labelShipment, setLabelShipment] = useState<Shipment | null>(null);
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);
  const [preselectedOrderForShipment, setPreselectedOrderForShipment] = useState<DzMahallOrder | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  // Chargement de l'ensemble des données depuis les API Express
  const loadAllData = async () => {
    try {
      setError(null);
      const [
        statsRes,
        carriersRes,
        ratesRes,
        officesRes,
        shipmentsRes,
        ordersRes,
        productsRes,
        cartsRes,
        blacklistRes
      ] = await Promise.all([
        fetch('/api/shipping/dashboard').then(r => r.json()).catch(() => null),
        fetch('/api/shipping/providers').then(r => r.json()).catch(() => []),
        fetch('/api/shipping/rates').then(r => r.json()).catch(() => []),
        fetch('/api/shipping/offices').then(r => r.json()).catch(() => []),
        fetch('/api/shipping/shipments').then(r => r.json()).catch(() => []),
        fetch('/api/orders').then(r => r.json()).catch(() => []),
        fetch('/api/products?admin=true').then(r => r.json()).catch(() => []),
        fetch('/api/fraud/abandoned-carts').then(r => r.json()).catch(() => []),
        fetch('/api/fraud/blacklist').then(r => r.json()).catch(() => []),
      ]);

      if (statsRes) setStats(statsRes);
      if (Array.isArray(carriersRes)) setCarriers(carriersRes);
      if (Array.isArray(ratesRes)) setRates(ratesRes);
      if (Array.isArray(officesRes)) setOffices(officesRes);
      if (Array.isArray(shipmentsRes)) setShipments(shipmentsRes);
      if (Array.isArray(ordersRes)) setOrders(ordersRes);
      if (Array.isArray(productsRes)) setProducts(productsRes);
      if (Array.isArray(cartsRes)) setAbandonedCarts(cartsRes);
      if (Array.isArray(blacklistRes)) setBlacklist(blacklistRes);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Impossible de joindre le serveur DzMahall. Vérifiez le service Node.js.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Actions Panier & Boutique ---
  const handleAddToCart = (product: Product, quantity = 1, variant?: ProductVariant, bundle?: BundleOffer) => {
    const unitPrice = bundle 
      ? Math.round(product.price * (1 - (bundle.discountPercentage / 100))) 
      : (variant?.priceDzd || product.price);

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => 
        item.productId === product.id && item.variantId === variant?.id && item.bundleId === bundle?.id
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }

      return [...prev, {
        productId: product.id,
        product,
        quantity,
        variantId: variant?.id,
        selectedVariantName: variant?.name,
        bundleId: bundle?.id,
        unitPriceDzd: unitPrice
      }];
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId, variantId);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.productId === productId && item.variantId === variantId) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const handleRemoveCartItem = (productId: string, variantId?: string) => {
    setCartItems(prev => prev.filter(item => !(item.productId === productId && item.variantId === variantId)));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setStoreView('store-product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickOrder = (product: Product) => {
    handleAddToCart(product, 1);
    setIsCartOpen(false);
    setStoreView('store-checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitCodOrder = async (orderPayload: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erreur lors de l’enregistrement de votre commande.');
    }
    
    // Définir la dernière commande confirmée
    setLastPlacedOrder(data);
    handleClearCart();
    setStoreView('store-confirmation');
    await loadAllData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return data;
  };

  // --- Actions Administration ---
  const handleTestCarrier = async (id: string): Promise<ConnectionTestResult> => {
    const res = await fetch(`/api/shipping/providers/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  };

  const handleSaveCarrierConfig = async (id: string, data: any) => {
    const res = await fetch(`/api/shipping/providers/${id}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleSyncCarrier = async (id: string) => {
    const res = await fetch(`/api/shipping/providers/${id}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la synchronisation');
    }
  };

  const handleToggleCarrier = async (id: string, enabled: boolean) => {
    await fetch(`/api/shipping/providers/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    });
    await loadAllData();
  };

  const handleUpdateRate = async (id: string, updates: Partial<ShippingRateRule>) => {
    const res = await fetch(`/api/shipping/rates/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur mise à jour tarif');
    }
  };

  const handleBulkUpdateRates = async (adjustments: any[]) => {
    const res = await fetch('/api/shipping/rates/bulk-adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustments })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur bulk tarifs');
    }
  };

  const handleAddOffice = async (officeData: any) => {
    const res = await fetch('/api/shipping/offices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(officeData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur ajout bureau');
    }
  };

  const handleCreateShipment = async (shipmentData: any) => {
    const res = await fetch('/api/shipping/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shipmentData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Échec de création de l’expédition');
    }
    await loadAllData();
    if (data.shipment) {
      setLabelShipment(data.shipment);
    }
    return data;
  };

  const handleUpdateShipmentStatus = async (shipmentId: string, status: ShipmentStatus, label: string) => {
    const res = await fetch(`/api/shipping/shipments/${shipmentId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStatus: status, label })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur mise à jour statut');
    }
    await loadAllData();
  };

  const handleCreateOrder = async (orderData: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur création commande');
    }
    await loadAllData();
    setAdminTab('orders');
  };

  const handleDispatchOrder = (order: DzMahallOrder) => {
    setPreselectedOrderForShipment(order);
    setIsCreateShipmentOpen(true);
  };

  // Actions Produits
  const handleSaveProduct = async (prodData: Partial<Product>) => {
    const isNew = !products.some(p => p.id === prodData.id);
    const url = isNew ? '/api/products' : `/api/products/${prodData.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur enregistrement produit');
    }
    await loadAllData();
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur suppression produit');
    }
    await loadAllData();
  };

  // Actions Anti-Fraude & Liste Noire
  const handleAddBlacklist = async (entry: Omit<BlacklistEntry, 'id' | 'addedAt'>) => {
    const res = await fetch('/api/fraud/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!res.ok) throw new Error('Erreur ajout liste noire');
    await loadAllData();
  };

  const handleRemoveBlacklist = async (id: string) => {
    const res = await fetch(`/api/fraud/blacklist/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur suppression liste noire');
    await loadAllData();
  };

  const handleMarkCartRecovered = async (cartId: string) => {
    const res = await fetch(`/api/fraud/abandoned-carts/${cartId}/recover`, { method: 'POST' });
    if (!res.ok) throw new Error('Erreur mise à jour panier abandonné');
    await loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* ============================================================== */}
      {/* 1. EN-TÊTE SELON LE MODE (BOUTIQUE PUBLIQUE OU PANNEAU ADMIN) */}
      {/* ============================================================== */}
      {appMode === 'store' ? (
        <StoreHeader
          currentView={storeView}
          onNavigate={(view, param) => {
            if (view === 'store-product-detail' && param) {
              const p = products.find(x => x.id === param || x.slug === param);
              if (p) setSelectedProduct(p);
            }
            setStoreView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          userEmail={currentUser?.email}
          isAdminMode={false}
          onToggleAdminMode={() => setAppMode('admin')}
        />
      ) : (
        <Navbar
          currentTab={adminTab}
          onSelectTab={(tab) => setAdminTab(tab)}
          onOpenNewShipment={() => {
            setPreselectedOrderForShipment(null);
            setIsCreateShipmentOpen(true);
          }}
          onOpenNewOrder={() => setIsNewOrderOpen(true)}
          onSwitchToStore={() => setAppMode('store')}
        />
      )}

      {/* ============================================================== */}
      {/* 2. ZONE PRINCIPALE DE CONTENU                                 */}
      {/* ============================================================== */}
      <main className="flex-1 w-full">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-blue-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              Chargement de DzMahall Algérie...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Initialisation du catalogue et du moteur de transporteurs algériens
            </p>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto my-12 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h2 className="text-sm font-bold text-rose-900">Erreur de communication avec le serveur</h2>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={loadAllData}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* ============================== */}
            {/* VUES BOUTIQUE CLIENT PUBLIQUE */}
            {/* ============================== */}
            {appMode === 'store' && (
              <>
                {storeView === 'store-home' && (
                  <StoreHome
                    products={products}
                    onSelectProduct={handleSelectProduct}
                    onNavigate={(v) => {
                      setStoreView(v);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onQuickOrder={handleQuickOrder}
                  />
                )}

                {storeView === 'store-products' && (
                  <StoreCatalog
                    products={products}
                    onSelectProduct={handleSelectProduct}
                    onQuickOrder={handleQuickOrder}
                  />
                )}

                {storeView === 'store-product-detail' && selectedProduct && (
                  <StoreProductDetail
                    product={selectedProduct}
                    offices={offices}
                    onBack={() => setStoreView('store-products')}
                    onAddToCart={handleAddToCart}
                    onSubmitCodOrder={handleSubmitCodOrder}
                  />
                )}

                {storeView === 'store-checkout' && (
                  <StoreCheckout
                    items={cartItems}
                    offices={offices}
                    onBackToShopping={() => setStoreView('store-products')}
                    onSubmitOrder={handleSubmitCodOrder}
                  />
                )}

                {storeView === 'store-confirmation' && lastPlacedOrder && (
                  <StoreOrderConfirmation
                    order={lastPlacedOrder}
                    onContinueShopping={() => setStoreView('store-products')}
                    onTrackOrder={() => {
                      setAppMode('admin');
                      setAdminTab('orders');
                    }}
                  />
                )}

                {storeView === 'store-delivery' && (
                  <StoreDeliveryInfo />
                )}

                {storeView === 'store-contact' && (
                  <StoreContact />
                )}
              </>
            )}

            {/* ============================== */}
            {/* VUES ADMINISTRATION & COD      */}
            {/* ============================== */}
            {appMode === 'admin' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {adminTab === 'dashboard' && (
                  <ShippingDashboard
                    stats={stats}
                    carriers={carriers}
                    onNavigate={(tab) => setAdminTab(tab)}
                    onOpenShipmentLabel={(s) => setLabelShipment(s)}
                  />
                )}

                {adminTab === 'workspace' && (
                  <GoogleWorkspaceManager
                    orders={orders}
                    shipments={shipments}
                    products={products}
                    onRefreshOrders={loadAllData}
                  />
                )}

                {adminTab === 'products' && (
                  <ProductsManager
                    products={products}
                    onSaveProduct={handleSaveProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onRefresh={loadAllData}
                  />
                )}

                {adminTab === 'profitability' && (
                  <ProfitabilityCalculator />
                )}

                {adminTab === 'providers' && (
                  <CarriersList
                    carriers={carriers}
                    onRefresh={loadAllData}
                    onTestCarrier={handleTestCarrier}
                    onSaveConfig={handleSaveCarrierConfig}
                    onSyncCarrier={handleSyncCarrier}
                    onToggleCarrier={handleToggleCarrier}
                  />
                )}

                {adminTab === 'rates' && (
                  <RatesManager
                    rates={rates}
                    onUpdateRate={handleUpdateRate}
                    onBulkUpdate={handleBulkUpdateRates}
                    onRefresh={loadAllData}
                  />
                )}

                {adminTab === 'offices' && (
                  <StopDeskManager
                    offices={offices}
                    onAddOffice={handleAddOffice}
                    onSyncCarrier={handleSyncCarrier}
                    onRefresh={loadAllData}
                  />
                )}

                {adminTab === 'shipments' && (
                  <ShipmentsManager
                    shipments={shipments}
                    onOpenLabel={(s) => setLabelShipment(s)}
                    onOpenCreateModal={() => {
                      setPreselectedOrderForShipment(null);
                      setIsCreateShipmentOpen(true);
                    }}
                    onUpdateStatus={handleUpdateShipmentStatus}
                    onRefresh={loadAllData}
                  />
                )}

                {adminTab === 'orders' && (
                  <OrdersManager
                    orders={orders}
                    shipments={shipments}
                    onDispatchOrder={handleDispatchOrder}
                    onOpenNewOrderModal={() => setIsNewOrderOpen(true)}
                    onViewShipmentLabel={(s) => setLabelShipment(s)}
                  />
                )}

                {adminTab === 'fraud' && (
                  <AbandonedCartsAntiFraud
                    abandonedCarts={abandonedCarts}
                    blacklist={blacklist}
                    onAddBlacklist={handleAddBlacklist}
                    onRemoveBlacklist={handleRemoveBlacklist}
                    onMarkRecovered={handleMarkCartRecovered}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ============================================================== */}
      {/* 3. PIED DE PAGE DZMAHALL                                       */}
      {/* ============================================================== */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/logo_e0e2fa2a.jpg" 
              alt="DzMahall Logo" 
              className="w-6 h-6 rounded-full object-cover" 
            />
            <span className="font-bold text-slate-900">DzMahall Algérie</span>
            <span aria-hidden="true">·</span>
            <span>Paiement 100% à la livraison (COD)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button 
              onClick={() => {
                setAppMode(appMode === 'store' ? 'admin' : 'store');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-blue-700 hover:underline font-semibold"
            >
              {appMode === 'store' ? 'Accès Administrateur / Logistique' : 'Retour à la Boutique Publique'}
            </button>
            <span>·</span>
            <span>Expédition 58 Wilayas</span>
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* 4. TIROIR DU PANIER & MODALES GLOBALES                        */}
      {/* ============================================================== */}
      <StoreCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setStoreView('store-checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <StoreAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={async (email) => {
          setCurrentUser({ email, role: 'customer' });
        }}
        onRegister={async (email) => {
          setCurrentUser({ email, role: 'customer' });
        }}
        onLogout={() => setCurrentUser(null)}
      />

      {labelShipment && (
        <ShippingLabelModal
          shipment={labelShipment}
          onClose={() => setLabelShipment(null)}
        />
      )}

      {isCreateShipmentOpen && (
        <CreateShipmentModal
          orders={orders}
          carriers={carriers}
          offices={offices}
          preselectedOrder={preselectedOrderForShipment}
          onClose={() => {
            setIsCreateShipmentOpen(false);
            setPreselectedOrderForShipment(null);
          }}
          onCreateShipment={handleCreateShipment}
        />
      )}

      {isNewOrderOpen && (
        <NewOrderModal
          carriers={carriers}
          onClose={() => setIsNewOrderOpen(false)}
          onCreateOrder={handleCreateOrder}
        />
      )}
    </div>
  );
}
