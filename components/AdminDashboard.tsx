
import React, { useState, useRef } from 'react';
import { X, LayoutDashboard, ShieldCheck, Heart, Image as ImageIcon, CheckCircle, Upload, Star } from 'lucide-react';
import { Place } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
  favorites: Place[];
  onUpdatePlace: (updatedPlace: Place) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, favorites, onUpdatePlace }) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, place: Place) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(place.id);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const updated = { ...place, imageUrl: base64String };
      onUpdatePlace(updated);
      
      setSaveFeedback(place.id);
      setUploadingId(null);
      setTimeout(() => setSaveFeedback(null), 2000);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = (id: string) => {
    setUploadingId(id);
    fileInputRef.current?.click();
  };

  // Separar favoritos com e sem foto para facilitar a curadoria
  const pendingHighlights = favorites.filter(p => !p.imageUrl);
  const activeHighlights = favorites.filter(p => p.imageUrl);

  return (
    <div className="absolute inset-0 bg-texture-parchment text-stone-900 z-50 flex flex-col animate-fade-in overflow-hidden border-4 border-[#5c4d3c] shadow-2xl">
      {/* Admin Header */}
      <div className="bg-texture-paper p-4 shadow-lg flex justify-between items-center border-b-4 border-[#c0b090] relative z-10">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={20} className="text-stone-800" />
          <h2 className="font-serif font-bold text-lg text-3d tracking-tight uppercase">Curadoria de Destaques</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition text-stone-700 border-2 border-[#d0c0a0] bg-[#f2ece4]">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-0 scrollbar-hide">
        {/* Info Box */}
        <div className="bg-stone-800 rounded-2xl p-5 text-center shadow-xl border-b-4 border-stone-950">
           <div className="w-12 h-12 bg-amber-400 rounded-full mx-auto flex items-center justify-center mb-3">
              <Star className="text-stone-900 fill-stone-900" size={24} />
           </div>
           <h3 className="font-serif font-black text-sm text-amber-400 uppercase tracking-widest">Painel de Ativação</h3>
           <p className="text-stone-300 font-serif italic text-[11px] mt-1 leading-tight">
             Os locais abaixo foram favoritados pela comunidade. <br/>
             <span className="text-white font-bold">Adicione uma foto da galeria</span> para que eles apareçam no carrossel de destaques.
           </p>
        </div>

        {/* Seção: Pendentes */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
            Aguardando Foto (Invisíveis no Topo)
          </h4>
          
          {pendingHighlights.length === 0 && (
            <p className="text-[11px] text-stone-400 italic font-serif p-4 text-center">Nenhum local novo aguardando curadoria.</p>
          )}

          {pendingHighlights.map((place) => (
            <div key={place.id} className="bg-texture-paper rounded-xl border-2 border-dashed border-[#d0c0a0] p-4 flex items-center justify-between group transition-all">
              <div className="flex-1 min-w-0">
                <h5 className="font-serif font-black text-stone-800 text-sm truncate uppercase">{place.name}</h5>
                <p className="text-[9px] text-stone-400 uppercase font-black">{place.category}</p>
              </div>
              <button 
                onClick={() => triggerFileInput(place.id)}
                className="bg-stone-800 text-amber-400 p-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Upload size={16} />
                <span className="text-[10px] font-black uppercase">Foto</span>
              </button>
            </div>
          ))}
        </div>

        {/* Seção: Ativos */}
        {activeHighlights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-[0.2em] flex items-center gap-2">
              <CheckCircle size={10} className="text-emerald-500" />
              Destaques Ativos no Carrossel
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              {activeHighlights.map((place) => (
                <div key={place.id} className="bg-white rounded-xl border-2 border-[#d0c0a0] p-3 shadow-md flex gap-3 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden border border-stone-200 shrink-0 relative">
                    <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
                    {saveFeedback === place.id && (
                       <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center text-white animate-fade-in">
                          <CheckCircle size={24} />
                       </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h5 className="font-serif font-black text-stone-800 text-xs truncate uppercase leading-none mb-1">{place.name}</h5>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => triggerFileInput(place.id)}
                        className="text-[8px] font-black uppercase text-stone-400 hover:text-stone-900 transition-colors"
                      >
                        Trocar Foto
                      </button>
                      <button 
                        onClick={() => onUpdatePlace({...place, imageUrl: undefined})}
                        className="text-[8px] font-black uppercase text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        Remover do Topo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => {
            const place = favorites.find(f => f.id === uploadingId);
            if (place) handleFileChange(e, place);
          }}
        />
      </div>
      
      <div className="p-4 bg-texture-paper border-t-2 border-[#c0b090] text-center">
         <span className="text-[10px] font-serif font-bold text-stone-500 uppercase tracking-widest">Painel Administrativo - TE ACHEI</span>
      </div>
    </div>
  );
};
