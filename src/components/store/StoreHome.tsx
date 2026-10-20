import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Banknote, 
  Clock, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  ChevronRight, 
  ShoppingBag,
  MapPin,
  HelpCircle,
  PhoneCall,
  MessageCircle,
  Mail
} from 'lucide-react';
import { Product } from '../../lib/ecommerce/types';

interface StoreHomeProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string) => void;
  onQuickOrder: (product: Product) => void;
}

export const StoreHome: React.FC<StoreHomeProps> = ({
  products,
  onSelectProduct,
  onNavigate,
  onQuickOrder
}) => {
  const featuredProducts = products.filter(p => p.isActive && p.isFeatured).slice(0, 4);

  const categories = [
    { name: 'Maison & Électroménager', count: 'Pro & Maison', icon: '☕' },
    { name: 'Audio & High-Tech', count: 'Sans fil Hi-Res', icon: '🎧' },
    { name: 'Beauté & Soins Naturels', count: '100% Bio Algérie', icon: '✨' },
    { name: 'Horlogerie & Accessoires', count: 'Automatique & Saphir', icon: '⌚' },
  ];

  const faqs = [
    {
      q: "Comment fonctionne le paiement à la livraison (COD) sur DzMahall ?",
      a: "C'est très simple et sans aucun risque pour vous : vous passez votre commande en indiquant vos coordonnées (Nom, Téléphone, Wilaya, Commune). Notre équipe prépare votre colis et l'expédie via notre réseau de transporteurs partenaires (Yalidine, Guepex, EcoTrack). Vous ne payez qu'en espèces au livreur ou au centre Stop Desk lors de la remise physique de votre colis."
    },
    {
      q: "Dans quelles wilayas livrez-vous ?",
      a: "DzMahall dessert la totalité des 58 wilayas d'Algérie, sans exception : du Nord (Alger, Oran, Constantine, Annaba...) jusqu'au Grand Sud (Tamanrasset, Adrar, Illizi, Djanet...). Vous pouvez choisir une livraison directement à votre domicile ou un retrait économique en bureau Stop Desk."
    },
    {
      q: "Quels sont les délais d'acheminement ?",
      a: "Les livraisons prennent généralement 24 à 48 heures pour les wilayas du Nord et du Centre, et 48 à 72 heures pour les wilayas des Hauts Plateaux et du Sud. Dès l'expédition, vous recevez un numéro de suivi pour suivre votre colis en direct."
    },
    {
      q: "Puis-je vérifier mon colis à la réception ?",
      a: "Absolument. Selon les protocoles de nos transporteurs partenaires, vous êtes invité à inspecter l'emballage extérieur et le contenu en présence du livreur avant le règlement final."
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-xl">
        <div className="absolute inset-0 z-0 opacity-50">
          <img 
            src="/src/assets/images/dzmahall_family_hero_1792452397893.jpg" 
            alt="Famille algérienne heureuse recevant leur colis DzMahall" 
            className="w-full h-full object-cover object-[center_25%]" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-24 lg:py-28 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-semibold mb-6 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Paiement à la livraison · 58 Wilayas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            La qualité premium,<br className="hidden sm:inline" /> livrée partout en Algérie.
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-8 max-w-xl font-medium">
            Commandez en toute sécurité, vous payez uniquement à la réception et vérification de votre colis.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('store-products')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Commander en Ligne (COD)</span>
            </button>

            <button
              onClick={() => onNavigate('store-delivery')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-xs transition-colors"
            >
              <span>Tarifs de livraison 58 Wilayas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Micro trust indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-10 mt-10 border-t border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zéro avance financière</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Expédition 24/48h</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Service client 7j/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS (Les 4 Piliers DzMahall) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Banknote className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Paiement à la Livraison
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aucune carte bancaire requise. Vous ne payez qu'après avoir reçu et inspecté votre colis auprès du coursier.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Les 58 Wilayas Couvertes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Partenariats certifiés avec Yalidine, Guepex et EcoTrack pour livrer jusque dans les communes les plus reculées.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Stop Desk ou Domicile
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choisissez le confort d'une livraison à domicile ou faites des économies en retirant dans l'un de nos 250+ centres relais.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Confirmation WhatsApp
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Une équipe locale vous contacte par appel ou WhatsApp avant l'expédition pour valider votre adresse et vos disponibilités.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Parcourir nos Univers
            </h2>
            <p className="text-xs text-slate-500">
              Des produits soigneusement sélectionnés pour leur qualité et leur durabilité
            </p>
          </div>

          <button
            onClick={() => onNavigate('store-products')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>Tout voir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('store-products')}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group text-center"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {cat.count}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (PRODUITS VEDETTES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Nos Meilleurs Succès en Algérie
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Paiement à la réception
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Commandez en quelques clics. Aucun paiement en ligne, règlement en espèces au livreur.
            </p>
          </div>

          <button
            onClick={() => onNavigate('store-products')}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
          >
            <span>Voir le catalogue complet</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => {
            const discountPercent = product.compareAtPrice 
              ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
              : 0;

            return (
              <div 
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Image container */}
                  <div 
                    onClick={() => onSelectProduct(product)}
                    className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    {discountPercent > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-md shadow-xs">
                        -{discountPercent}%
                      </span>
                    )}
                    <span className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white font-mono text-[10px] px-2 py-0.5 rounded">
                      Stock: {product.stockQuantity}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {product.category}
                    </span>

                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug cursor-pointer mb-2"
                    >
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 text-xs mb-3">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        ({product.reviewCount} avis)
                      </span>
                    </div>

                    {/* Price strip */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-mono text-lg font-black text-slate-900 tabular-nums">
                        {product.price.toLocaleString()} <span className="text-xs font-bold text-slate-600">DZD</span>
                      </span>
                      {product.compareAtPrice && (
                        <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                          {product.compareAtPrice.toLocaleString()} DZD
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => onQuickOrder(product)}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Commander · Paiement COD</span>
                  </button>

                  <button
                    onClick={() => onSelectProduct(product)}
                    className="w-full py-1.5 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors"
                  >
                    Voir la fiche détaillée
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. AVIS CLIENTS ALGÉRIENS VÉRIFIÉS */}
      <section className="bg-slate-100/70 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Ce que disent nos clients en Algérie
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Des milliers de colis livrés et payés en toute confiance chaque mois
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-4 italic">
                  « J'ai commandé la machine à café Fiamma. Livraison en 24h à Alger par Yalidine, emballage très soigné. J'ai vérifié le carton avant de donner l'argent au livreur. Produit 100% conforme, café délicieux. »
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="font-bold text-slate-900">Karim B.</span>
                <span className="text-slate-500">16 - Alger (Bab Ezzouar)</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-4 italic">
                  « Le sérum de figue de barbarie est d'une pureté incroyable. Arrivé en 48h à Oran en Stop Desk, ce qui m'a fait économiser sur les frais de port. Service WhatsApp très poli et disponible. »
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="font-bold text-slate-900">Amina M.</span>
                <span className="text-slate-500">31 - Oran</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-4 italic">
                  « La montre Royale avec verre saphir est encore plus belle en vrai que sur les photos. Le livreur m'a appelé 30 minutes avant d'arriver chez moi. Rien à redire sur le professionnalisme de DzMahall. »
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="font-bold text-slate-900">Yacine Z.</span>
                <span className="text-slate-500">25 - Constantine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.b. BANNIÈRE COMMANDE & ASSISTANCE WHATSAPP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Assistance & Commande Directe WhatsApp 7j/7</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Une question avant de commander ?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Discutez en direct avec notre équipe sur WhatsApp. Nous vous conseillons sur les produits, validons vos commandes personnalisées et assurons le suivi de votre colis en direct dans les 58 wilayas.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://wa.me/213660769386"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp : +213 660 769 386</span>
              </a>

              <a
                href="mailto:ntipro360@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-all"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>ntipro360@gmail.com</span>
              </a>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center z-10">
            <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl max-w-[210px]">
              <img
                src="/assets/aistudio/carte_visite_dzmahall_1080x1920_d725b011.png"
                alt="DzMahall Carte de Visite"
                className="w-full rounded-xl object-contain shadow-sm"
              />
            </div>
            <span className="text-[11px] text-amber-400 mt-2 font-mono font-semibold">
              DzMahall.store · Paiement COD
            </span>
          </div>
        </div>
      </section>

      {/* 6. FAQ PAIEMENT À LA LIVRAISON */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Foire Aux Questions · Paiement à la Réception
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tout savoir sur nos expéditions et garanties
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
