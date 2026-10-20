import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export const StoreContact: React.FC = () => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setName('');
      setContact('');
      setMessage('');
      setSent(false);
    }, 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Contact & Support Client DzMahall
        </h1>
        <p className="text-xs text-slate-500">
          Une équipe dédiée à Alger à votre écoute pour le suivi de vos commandes COD et toute question produit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Contact info (5/12) */}
        <div className="md:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Coordonnées Directes
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Restons en Contact
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Commande & Contact Téléphonique</strong>
                <a href="tel:+213660769386" className="font-mono text-slate-300 hover:text-white transition-colors">
                  +213 (0)660 769 386
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">WhatsApp Officiel (Réponse Rapide)</strong>
                <a 
                  href="https://wa.me/213660769386" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline font-mono font-bold block mt-0.5"
                >
                  +213 660 769 386 (Discutez en direct sur WhatsApp)
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">E-mail Officiel</strong>
                <a href="mailto:ntipro360@gmail.com" className="text-slate-300 hover:text-white transition-colors">
                  ntipro360@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Boutique & Expéditions 58 Wilayas</strong>
                <span className="text-slate-300 leading-snug block">
                  DzMahall.store · Alger, Algérie
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Service Client</strong>
                <span className="text-slate-300">7j/7 : 08h30 - 21h00</span>
              </div>
            </div>
          </div>

          {/* Bouton direct WhatsApp */}
          <div className="pt-2">
            <a
              href="https://wa.me/213660769386"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ouvrir WhatsApp (+213 660 769 386)</span>
            </a>
          </div>
        </div>

        {/* Contact form (7/12) */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Envoyez-nous un Message
          </h2>
          <p className="text-xs text-slate-500">
            Nous répondons généralement en moins de 2 heures pendant les horaires ouvrés.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Votre Nom & Prénom *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Amina Mansouri"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Téléphone ou E-mail *</label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="05 / 06 / 07 XX XX XX ou email@..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Votre Message *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Question sur un produit, commande COD, suivi..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {sent && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Message envoyé avec succès ! Notre équipe vous répondra rapidement.</span>
              </div>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer mon message</span>
            </button>
          </form>
        </div>

      </div>

      {/* Carte de visite officielle DzMahall */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <span>✦ Carte de Visite & QR Code Officiel ✦</span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-white">
            DzMahall · Boutique en Ligne
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Scannez le QR Code officiel pour retrouver notre boutique en ligne ainsi que l'ensemble de nos réseaux sociaux (Instagram, Facebook, TikTok). Commandez vos articles avec livraison rapide dans les 58 wilayas et paiement en espèces à réception.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <a
              href="https://wa.me/213660769386"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp : +213 660 769 386</span>
            </a>
            <a
              href="mailto:ntipro360@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-all"
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span>ntipro360@gmail.com</span>
            </a>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-center">
          <div className="relative group p-2 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-[240px]">
            <img
              src="/assets/aistudio/carte_visite_dzmahall_1080x1920_d725b011.png"
              alt="Carte de visite officielle DzMahall"
              className="w-full rounded-xl object-contain group-hover:scale-102 transition-transform duration-300"
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-mono">
            DzMahall.store · Algérie
          </span>
        </div>
      </div>

    </div>
  );
};
