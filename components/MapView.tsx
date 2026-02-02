
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair } from 'lucide-react';
import { Place, Coordinates, Route } from '../types';

// Fix Leaflet default icon issue using CDN
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for destination/favorites (Red)
const DestinationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Icon for the User (Blue Dot)
const UserIcon = L.divIcon({
  html: `
      <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: 0; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>
          <div style="position: absolute; inset: -4px; border: 2px solid #3b82f6; border-radius: 50%; animation: pulse 2s infinite;"></div>
      </div>
      <style>
          @keyframes pulse {
              0% { transform: scale(1); opacity: 0.8; }
              100% { transform: scale(2); opacity: 0; }
          }
      </style>
  `,
  className: 'user-location-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Custom icon for Partners (Yellow Star)
const PartnerIcon = L.divIcon({
    html: `
        <div style="display: flex; justify-content: center; align-items: center; width: 32px; height: 32px; background: #fbbf24; border: 2px solid #92400e; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transform: translateY(-50%);">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#92400e" stroke="#92400e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20]
});

interface MapViewProps {
  places: Place[];
  favorites: Place[];
  partners: Place[];
  userLocation?: Coordinates | null;
  activeRoute?: Route | null;
}

const RecenterControl = ({ location }: { location: Coordinates | null }) => {
  const map = useMap();
  
  const handleRecenter = () => {
    if (location) {
      map.flyTo([location.lat, location.lng], 15, { duration: 1.5 });
    }
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '60px' }}>
      <div className="leaflet-control leaflet-bar">
        <button 
          onClick={(e) => { e.preventDefault(); handleRecenter(); }}
          className="bg-white p-2 hover:bg-stone-100 transition-colors flex items-center justify-center border-none cursor-pointer"
          title="Centralizar em mim"
          style={{ width: '34px', height: '34px' }}
        >
          <Crosshair size={20} className="text-blue-600" />
        </button>
      </div>
    </div>
  );
};

export const MapView: React.FC<MapViewProps> = ({ places, favorites, partners, userLocation, activeRoute }) => {
  const [initialCentered, setInitialCentered] = useState(false);

  // Merge places, favorites and partners for display
  const displayedPlacesMap = new Map<string, Place>();
  
  partners.forEach(p => displayedPlacesMap.set(`${p.lat.toFixed(6)},${p.lng.toFixed(6)}`, { ...p, isPartner: true }));
  favorites.forEach(f => {
    const key = `${f.lat.toFixed(6)},${f.lng.toFixed(6)}`;
    if (!displayedPlacesMap.has(key)) displayedPlacesMap.set(key, f);
  });
  places.forEach(p => {
    const key = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
    if (!displayedPlacesMap.has(key)) displayedPlacesMap.set(key, p);
  });

  const allDisplayedPlaces = Array.from(displayedPlacesMap.values());
  const routeDestPlace = activeRoute && allDisplayedPlaces.find(p => p.name.includes(activeRoute.destination) || activeRoute.destination.includes(p.name));
  
  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : (allDisplayedPlaces.length > 0 ? [allDisplayedPlaces[0].lat, allDisplayedPlaces[0].lng] : [-23.5505, -46.6333]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative z-0">
       <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && <RecenterControl location={userLocation} />}

        {/* User Location Marker */}
        {userLocation && (
           <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
             <Popup>
               <div className="font-serif text-center">
                 <strong className="text-blue-700 block text-xs">Sua Localização</strong>
                 <p className="text-[9px] text-stone-500 italic">Posicionamento via Satélite</p>
               </div>
             </Popup>
           </Marker>
        )}

        {/* Places Markers */}
        {allDisplayedPlaces.map((place) => {
          const isPartner = place.isPartner || partners.some(p => p.id === place.id);
          const isFavorite = favorites.some(f => f.id === place.id);
          const isDestination = activeRoute && (place.name.includes(activeRoute.destination) || activeRoute.destination.includes(place.name));
          
          let icon = DefaultIcon;
          if (isPartner) icon = PartnerIcon;
          else if (isFavorite || isDestination) icon = DestinationIcon;

          return (
            <Marker 
              key={place.id} 
              position={[place.lat, place.lng]} 
              icon={icon}
            >
              <Popup>
                <div className="min-w-[150px] font-serif">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <strong className="block text-stone-900 text-xs">{place.name}</strong>
                    {isPartner && <span className="text-[8px] bg-amber-100 text-amber-800 px-1 rounded border border-amber-200 uppercase font-black">Parceiro</span>}
                  </div>
                  <p className="text-[10px] text-stone-600 mb-2">{place.category}</p>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-800 text-[10px] underline font-bold block"
                  >
                    Abrir no Google Maps
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Visual path line */}
        {userLocation && routeDestPlace && (
           <Polyline 
             positions={[[userLocation.lat, userLocation.lng], [routeDestPlace.lat, routeDestPlace.lng]]} 
             color="#115e59" 
             dashArray="5, 10"
             weight={3}
             opacity={0.6}
           />
        )}
      </MapContainer>
    </div>
  );
};
