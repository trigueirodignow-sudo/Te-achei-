
import React, { useState } from 'react';
import { MapPin, Navigation, Heart, ExternalLink, Star, MessageSquare, ChevronDown, ChevronUp, Instagram, MessageCircle } from 'lucide-react';
import { Place, Review } from '../types';

interface PlaceCardProps {
  place: Place;
  isFavorite?: boolean;
  onToggleFavorite?: (place: Place) => void;
  reviews?: Review[];
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, isFavorite, onToggleFavorite, reviews = [] }) => {
  const [showReviews, setShowReviews] = useState(false);

  const handleExternalMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    window.open(url, '_blank');
  };

  const handleWhatsApp = () => {
    if (!place.whatsapp) return;
    const cleanNumber = place.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}`;
    window.open(url, '_blank');
  };

  const handleInstagram = () => {
    if (!place.instagram) return;
    let url = place.instagram;
    if (!url.startsWith('http')) {
      url = `https://instagram.com/${url.replace('@', '')}`;
    }
    window.open(url, '_blank');
  };

  // Lógica de Ranking: Ranking começa em 0. 
  // Cada 2 favoritos ganha uma estrela
  const count = place.favoriteCount || 0;
  const rating = Math.min(5, Math.floor(count / 2));

  return (
    <div className="bg-texture-paper rounded-xl shadow-md border-2 border-[#d0c0a0] border-b-[4px] mb-3 flex flex-col hover:translate-y-[-1px] transition-all relative overflow-hidden active:border-b-[1px] active:translate-y-[1px]">
      
      {place.imageUrl && (
        <div className="w-full h-20 relative border-b border-[#d0c0a0]">
          <img 
            src={place.imageUrl} 
            alt={place.name} 
            className="w-full h-full object-cover opacity-80"
            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
          />
        </div>
      )}

      <div className="p-2 flex flex-col gap-1.5">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <h3 className="font-bold text-stone-900 text-lg leading-none font-serif truncate">{place.name}</h3>
            <div className="flex items-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={10} 
                  className={i < rating ? "fill-amber-500 text-amber-600" : "text-stone-300"} 
                />
              ))}
              <span className="text-[8px] font-black text-stone-400 ml-1 uppercase tracking-tighter">
                {count} {count === 1 ? 'voto' : 'votos'}
              </span>
            </div>
          </div>
          {onToggleFavorite && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(place); }} 
              className="text-stone-400 p-1 hover:scale-110 transition-transform"
            >
              <Heart size={18} className={isFavorite ? 'fill-rose-500 text-rose-600' : ''} />
            </button>
          )}
        </div>
        
        <p className="text-xl text-stone-950 leading-tight font-serif italic font-black bg-stone-100/40 p-2 rounded-lg border border-stone-200/50">
          {place.description}
        </p>
        
        <div className="flex items-center text-[10px] text-stone-500 gap-1 font-serif font-bold">
          <MapPin size={10} className="text-stone-400 shrink-0" />
          <span className="truncate">{place.address}</span>
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex gap-1.5 flex-wrap">
              <button 
                  onClick={handleExternalMaps}
                  className="flex-[2] min-w-[100px] flex items-center justify-center gap-1 text-[11px] font-black text-white bg-stone-800 border-b-2 border-stone-950 py-2 rounded-lg font-serif active:border-b-0 active:translate-y-0.5 transition-all uppercase shadow-sm"
              >
                  <Navigation size={12} /> Direções
              </button>

              {place.whatsapp && (
                <button 
                  onClick={handleWhatsApp}
                  className="w-10 h-10 flex items-center justify-center text-white bg-emerald-500 border-b-2 border-emerald-700 rounded-lg active:border-b-0 active:translate-y-0.5 transition-all shadow-sm"
                  title="WhatsApp"
                >
                  <MessageCircle size={18} />
                </button>
              )}

              {place.instagram && (
                <button 
                  onClick={handleInstagram}
                  className="w-10 h-10 flex items-center justify-center text-white bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 border-b-2 border-purple-800 rounded-lg active:border-b-0 active:translate-y-0.5 transition-all shadow-sm"
                  title="Instagram"
                >
                  <Instagram size={18} />
                </button>
              )}
              
              {reviews.length > 0 && (
                <button 
                  onClick={() => setShowReviews(!showReviews)}
                  className={`px-3 flex items-center justify-center gap-1 text-[10px] font-bold rounded-lg border transition-all ${showReviews ? 'bg-stone-800 text-white border-stone-900' : 'bg-white text-stone-700 border-[#d0c0a0]'}`}
                >
                  <MessageSquare size={12} />
                  {reviews.length}
                  {showReviews ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
              )}

              {place.website && (
                  <button 
                      onClick={() => window.open(place.website, '_blank')}
                      className="px-3 flex items-center justify-center text-teal-900 bg-[#e8dec0] border border-[#c0b090] rounded-lg active:scale-95 transition-transform"
                      title="Sítio Eletrônico"
                  >
                      <ExternalLink size={14} />
                  </button>
              )}
            </div>
        </div>

        {/* Depoimentos / Reviews Section */}
        {showReviews && reviews.length > 0 && (
          <div className="mt-2 space-y-2 border-t border-stone-200 pt-2 animate-fade-in">
             <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Crônicas dos Viajantes</h4>
             {reviews.map(review => (
               <div key={review.id} className="bg-[#f2ece4]/50 p-2 rounded-lg border border-[#d0c0a0]/50 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-stone-800 font-serif">{review.userName}</span>
                    <span className="text-[8px] text-stone-400">{review.date}</span>
                  </div>
                  <p className="text-[11px] text-stone-700 font-serif italic leading-snug">"{review.text}"</p>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
