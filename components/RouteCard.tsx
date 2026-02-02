
import React from 'react';
import { Navigation, Clock, MapPin, ChevronRight, ArrowUp, ArrowLeft, ArrowRight, CornerUpLeft, CornerUpRight } from 'lucide-react';
import { Route } from '../types';

interface RouteCardProps {
  route: Route;
}

const DirectionIcon = ({ instruction }: { instruction: string }) => {
  const text = instruction.toLowerCase();
  if (text.includes('esquerda')) return <CornerUpLeft size={16} className="text-teal-700" />;
  if (text.includes('direita')) return <CornerUpRight size={16} className="text-teal-700" />;
  if (text.includes('mantenha')) return <ArrowUp size={16} className="text-teal-700 opacity-60" />;
  return <ArrowUp size={16} className="text-teal-700" />;
};

export const RouteCard: React.FC<RouteCardProps> = ({ route }) => {
  return (
    <div className="bg-[#fcf8ed] border-2 border-[#c0b090] border-b-4 rounded-xl overflow-hidden shadow-lg mt-3 mb-2 animate-fade-in font-serif">
      {/* Header Itinerário */}
      <div className="bg-[#e8dec0] p-3 border-b-2 border-[#c0b090] flex justify-between items-center">
        <h4 className="font-bold text-stone-800 flex items-center gap-2 text-sm uppercase tracking-tight">
          <Navigation size={16} className="fill-stone-800" />
          Itinerário de Viagem
        </h4>
        <div className="flex gap-3 text-[10px] font-bold text-teal-900 bg-[#f2ece4] px-2 py-1 rounded-md border border-[#d0c0a0]">
          <span className="flex items-center gap-1"><Navigation size={10} /> {route.totalDistance}</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {route.totalDuration}</span>
        </div>
      </div>

      {/* Destination Marker */}
      <div className="p-3 bg-white/40 flex items-center gap-2 border-b border-dashed border-[#c0b090]">
        <MapPin size={16} className="text-rose-700" />
        <span className="text-xs font-bold text-stone-700">Destino: {route.destination}</span>
      </div>

      {/* Steps List */}
      <div className={`max-h-60 overflow-y-auto bg-[url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="1" cy="1" r="1" fill="%23c0b090" fill-opacity="0.1"/%3E%3C/svg%3E')]`}>
        {route.steps.map((step, idx) => (
          <div key={idx} className="p-3 border-b border-[#c0b090]/30 last:border-0 flex gap-3 hover:bg-[#f2ece4]/50 transition-colors">
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full border border-[#c0b090] bg-white flex items-center justify-center text-[10px] font-bold text-stone-500 shadow-sm">
                {idx + 1}
              </div>
              {idx !== route.steps.length - 1 && <div className="w-0.5 h-full bg-[#c0b090]/30 mt-1"></div>}
            </div>
            
            <div className="flex-1">
              <p className="text-base text-stone-800 leading-tight flex items-start gap-2">
                <span className="mt-0.5"><DirectionIcon instruction={step.instruction} /></span>
                {step.instruction}
              </p>
              {step.distance && (
                <span className="text-[10px] font-bold text-stone-400 uppercase mt-1 block">
                  em {step.distance}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Action */}
      <div className="p-2 bg-[#f2ece4] text-center">
         <button 
           onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(route.destination)}`, '_blank')}
           className="text-[10px] font-black text-teal-900 uppercase tracking-widest hover:underline"
         >
           Abrir no Navegador GPS Oficial
         </button>
      </div>
    </div>
  );
};
