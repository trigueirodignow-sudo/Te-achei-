
import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { Star, ChevronLeft, ChevronRight, Heart, MapPin } from 'lucide-react';

interface PartnerCarouselProps {
  partners: Place[];
}

export const PartnerCarousel: React.FC<PartnerCarouselProps> = ({ partners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (partners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [partners.length]);

  if (partners.length === 0) return null;

  const current = partners[currentIndex];
  
  // Lógica de Ranking baseada em favoritos para manter o padrão do Card
  const count = current.favoriteCount || 0;
  const rating = Math.min(5, Math.floor(count / 2));

  return (
    <div className="relative w-full h-36 animate-fade-in group px-1">
      {/* Container que imita o PlaceCard (A cópia do Card pedida) */}
      <div className="w-full h-full bg-texture-paper rounded-2xl border-2 border-[#d0c0a0] border-b-[4px] shadow-lg flex overflow-hidden relative transition-all duration-500">
        
        {/* Imagem (Canto Esquerdo) */}
        <div className="w-1/3 h-full relative border-r border-[#d0c0a0] bg-stone-100 flex items-center justify-center">
          {current.imageUrl ? (
            <img 
              src={current.imageUrl} 
              alt={current.name} 
              className="w-full h-full object-cover sepia-[0.1] opacity-90"
              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
            />
          ) : (
            <Star size={32} className="text-[#c0b090] opacity-30" />
          )}
          <div className="absolute top-2 left-2">
             <div className="bg-amber-500 text-stone-900 text-[6px] font-black px-1 py-0.5 rounded uppercase tracking-widest border border-amber-600 shadow-sm">
                Top Salvo
             </div>
          </div>
        </div>

        {/* Conteúdo (Canto Direito) */}
        <div className="w-2/3 p-3 flex flex-col justify-between">
          <div className="overflow-hidden">
             <div className="flex justify-between items-start">
                <h3 className="font-serif font-black text-stone-900 text-sm leading-tight uppercase truncate mr-6">
                  {current.name}
                </h3>
                <Heart size={14} className="fill-rose-500 text-rose-500 absolute top-3 right-3" />
             </div>
             
             <div className="flex items-center gap-0.5 mt-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={8} 
                    className={i < rating ? "fill-amber-500 text-amber-600" : "text-stone-300"} 
                  />
                ))}
                <span className="text-[7px] font-black text-stone-400 ml-1 uppercase">{count} votos</span>
             </div>

             <p className="text-[10px] text-stone-700 font-serif italic line-clamp-2 leading-tight bg-stone-50/50 p-1.5 rounded border border-stone-100">
               "{current.description}"
             </p>
          </div>

          <div className="flex items-center text-[8px] text-stone-400 gap-1 font-serif truncate">
            <MapPin size={8} className="shrink-0" />
            <span className="truncate">{current.address}</span>
          </div>
        </div>
      </div>

      {/* Controles de Navegação Compactos */}
      {partners.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev - 1 + partners.length) % partners.length)}
            className="absolute left-[-5px] top-1/2 -translate-y-1/2 p-1.5 bg-stone-800 text-amber-400 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-stone-950"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % partners.length)}
            className="absolute right-[-5px] top-1/2 -translate-y-1/2 p-1.5 bg-stone-800 text-amber-400 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-stone-950"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Indicadores de Página (Dots) */}
      <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 flex gap-1">
        {partners.slice(0, 10).map((_, i) => (
          <div 
            key={i} 
            className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-amber-600 w-3' : 'bg-stone-300'}`} 
          />
        ))}
      </div>
    </div>
  );
};
