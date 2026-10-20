import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface StoreAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { email?: string; role?: string } | null;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string) => Promise<void>;
  onLogout: () => void;
}

export const StoreAuthModal: React.FC<StoreAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onRegister,
  onLogout
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, name);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’authentification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">
              {currentUser ? 'Mon Compte DzMahall' : mode === 'login' ? 'Connexion Client' : 'Créer un Compte'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentUser ? (
          <div className="p-6 space-y-4 text-xs text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block">{currentUser.email}</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                Rôle : {currentUser.role === 'admin' ? 'Administrateur' : 'Client Vérifié'}
              </span>
            </div>

            <p className="text-slate-500">
              Vous êtes connecté à votre espace DzMahall. Vous pouvez suivre vos commandes et gérer vos préférences.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-3">
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold"
              >
                Se Déconnecter
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Mode switch */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Se Connecter
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Nouveau Client
              </button>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-bold text-slate-900 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Yasmine Cherif"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-900 mb-1">Adresse E-mail *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre-email@domaine.com"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Mot de Passe *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? 'Chargement...' : mode === 'login' ? 'Connexion Sécurisée' : 'Créer mon Compte'}
              </button>
            </div>

            <div className="text-center text-[11px] text-slate-400">
              <p>Rappel : vous pouvez aussi commander directement en invité sans créer de compte !</p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
