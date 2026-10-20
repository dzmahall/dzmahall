import React, { useState } from 'react';
import { Search, Filter, Star, ShoppingBag, ArrowUpDown, Check, X } from 'lucide-react';
import { Product } from '../../lib/ecommerce/types';

interface StoreCatalogProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
}

export const StoreCatalog: React.FC<StoreCatalogProps> = ({
  products,
  onSelectProduct,
  onQuickOrder
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const categories = ['all', 'Maison & Électroménager', 'Audio & High-Tech', 'Beauté & Soins Naturels', 'Horlogerie & Accessoires', 'Maison & Décoration'];

  const filteredProducts = products
    .filter(p => p.isActive)
    .filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStock = !onlyInStock || p.stockQuantity > 0;
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Catalogue Produits DzMahall
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tous nos articles sont éligibles au paiement à la livraison dans les 58 wilayas d'Algérie.
        </p>
      </div>

      {/* Control Bar: Categories, Search, Sort & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Category Pills (Functional filter buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Toutes les catégories' : cat}
            </button>
          ))}
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>En stock seulement</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Populaires & Vedettes</option>
                <option value="price-asc">Prix : croissant</option>
                <option value="price-desc">Prix : décroissant</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const discountPercent = product.compareAtPrice 
            ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
            : 0;

          return (
            <div 
              key={product.id}
              className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              <div>
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
                  <span className={`absolute top-2.5 right-2.5 font-mono text-[10px] px-2 py-0.5 rounded ${
                    product.stockQuantity > 5 
                      ? 'bg-slate-900/80 text-white' 
                      : 'bg-amber-600 text-white font-bold'
                  }`}>
                    {product.stockQuantity > 5 ? `Stock: ${product.stockQuantity}` : `Urgent: ${product.stockQuantity} restants`}
                  </span>
                </div>

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

                  <div className="flex items-center gap-1 text-xs mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({product.reviewCount || 24} avis)
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
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

              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => onQuickOrder(product)}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Commander en 1 Clic (COD)</span>
                </button>

                <button
                  onClick={() => onSelectProduct(product)}
                  className="w-full py-1.5 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors"
                >
                  Consulter la fiche
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Aucun produit ne correspond à vos critères de recherche.</p>
          <button 
            onClick={() => { setSearch(''); setSelectedCategory('all'); setOnlyInStock(false); }}
            className="mt-3 px-4 py-2 text-xs font-semibold text-blue-700 hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

    </div>
  );
};
