import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Save,
  X
} from 'lucide-react';
import { Product } from '../../lib/ecommerce/types';

interface ProductsManagerProps {
  products: Product[];
  onSaveProduct: (product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenNew = () => {
    setEditingProduct({
      id: `prod_dz_${Date.now()}`,
      name: '',
      slug: '',
      category: 'Maison & Électroménager',
      price: 5000,
      compareAtPrice: 6500,
      costPrice: 2800,
      stockQuantity: 20,
      imageUrl: '/src/assets/images/dzmahall_espresso_machine_1792449781597.jpg',
      images: ['/src/assets/images/dzmahall_espresso_machine_1792449781597.jpg'],
      description: '',
      shortDescription: '',
      isActive: true,
      isFeatured: false,
      variants: [],
      bundleOffers: []
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      alert('Veuillez remplir au moins le nom et le prix.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveProduct(editingProduct);
      showToast(`Produit "${editingProduct.name}" enregistré avec succès.`);
      setEditingProduct(null);
      await onRefresh();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${name}" ?`)) {
      await onDeleteProduct(id);
      showToast('Produit supprimé.');
      await onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestion du Catalogue & des Stocks
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {products.length} références
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ajoutez, modifiez et contrôlez les stocks, prix publics, et coûts d'achat confidentiels.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou catégorie..."
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3.5">Produit</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3 text-right">Prix Public (DZD)</th>
                <th className="py-3 px-3 text-right">Coût Achat (Privé)</th>
                <th className="py-3 px-3 text-right">Marge Brute</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const margin = p.costPrice ? p.price - p.costPrice : p.price * 0.4;
                const marginPercent = p.costPrice ? Math.round((margin / p.costPrice) * 100) : 40;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.imageUrl} 
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate max-w-xs">{p.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{p.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {p.category}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {p.price.toLocaleString()} DZD
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                      {p.costPrice ? `${p.costPrice.toLocaleString()} DZD` : 'Non renseigné'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-bold tabular-nums">
                      +{margin.toLocaleString()} DZD ({marginPercent}%)
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] ${
                        p.stockQuantity <= 5 
                          ? 'bg-rose-100 text-rose-800' 
                          : p.stockQuantity <= 15
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {p.stockQuantity} un.
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded"
                          title="Modifier le produit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit / Create Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900">
                {editingProduct.id?.startsWith('prod_dz_1') ? 'Modifier le Produit' : 'Créer / Configurer un Produit'}
              </h2>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Nom du produit *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Catégorie</label>
                  <select
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Maison & Électroménager">Maison & Électroménager</option>
                    <option value="Audio & High-Tech">Audio & High-Tech</option>
                    <option value="Beauté & Soins Naturels">Beauté & Soins Naturels</option>
                    <option value="Horlogerie & Accessoires">Horlogerie & Accessoires</option>
                    <option value="Maison & Décoration">Maison & Décoration</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Quantité en Stock *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stockQuantity ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                    className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Prix Public (DZD) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price ?? 5000}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full font-mono font-bold text-blue-900 px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Prix Barré (DZD)</label>
                  <input
                    type="number"
                    value={editingProduct.compareAtPrice ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: Number(e.target.value) })}
                    className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-rose-800 mb-1">Coût d'Achat Privé (DZD)</label>
                  <input
                    type="number"
                    value={editingProduct.costPrice ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                    className="w-full font-mono px-3 py-2 rounded-xl border border-rose-300 bg-rose-50/50"
                  />
                  <span className="text-[10px] text-rose-600 block mt-0.5">Strictement masqué aux clients</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">URL de l'image</label>
                <input
                  type="text"
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Description Complète</label>
                <textarea
                  rows={4}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isActive ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">Actif dans la boutique</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">Mettre en vedette (Accueil)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Enregistrement...' : 'Enregistrer le Produit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
