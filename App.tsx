
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Settings, Heart, LogOut, Map as MapIcon, MessageSquare, Languages, Compass, Navigation } from 'lucide-react';
import { sendMessageToGemini } from './services/geminiService';
import { parsePlacesFromText, parseRouteFromText } from './utils/parser';
import { PlaceCard } from './components/PlaceCard';
import { RouteCard } from './components/RouteCard';
import { MapView } from './components/MapView';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { PartnerCarousel } from './components/PartnerCarousel';
import { Message, Coordinates, Place, Route, Language, Review } from './types';
import { TRANSLATIONS, LANG_FLAGS } from './constants';

const safeParse = (key: string, fallback: any) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed || fallback;
  } catch (e) {
    console.error(`Erro ao carregar ${key}:`, e);
    return fallback;
  }
};

function App() {
  const [user, setUser] = useState<any>(() => safeParse('tpm_user', null));
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('tpm_user'));
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('tpm_lang') as Language) || 'pt');
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Place | null>(null);
  const [reviewText, setReviewText] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS['pt'];

  const [viewMode, setViewMode] = useState<'chat' | 'map' | 'favorites'>('chat');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAccessEnabled, setIsAdminAccessEnabled] = useState(false);
  
  const [currentPlaces, setCurrentPlaces] = useState<Place[]>([]);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isClickingTitle, setIsClickingTitle] = useState(false);
  const titleClickCount = useRef(0);
  const lastTitleClickTime = useRef(0);

  const [favCounts, setFavCounts] = useState<Record<string, number>>(() => safeParse('tpm_fav_counts', {}));
  const [allReviews, setAllReviews] = useState<Record<string, Review[]>>(() => safeParse('tpm_all_reviews', {}));
  const [favorites, setFavorites] = useState<Place[]>(() => safeParse('tpm_favorites', []));

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        null,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tpm_favorites', JSON.stringify(favorites));
    localStorage.setItem('tpm_fav_counts', JSON.stringify(favCounts));
    localStorage.setItem('tpm_all_reviews', JSON.stringify(allReviews));
    localStorage.setItem('tpm_lang', lang);
  }, [favorites, favCounts, allReviews, lang]);

  useEffect(() => {
    if (isLoggedIn && viewMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, viewMode, isLoggedIn]);

  const handleSecretTrigger = () => {
    const now = Date.now();
    setIsClickingTitle(true);
    setTimeout(() => setIsClickingTitle(false), 200);

    if (now - lastTitleClickTime.current < 1000) {
      titleClickCount.current += 1;
    } else {
      titleClickCount.current = 1;
    }
    
    lastTitleClickTime.current = now;

    if (titleClickCount.current === 5) {
      setIsAdminAccessEnabled(true);
      setIsAdminOpen(true);
      titleClickCount.current = 0;
    }
  };

  const enrichPlaceWithStats = (p: Place) => ({
    ...p,
    favoriteCount: favCounts[p.name] || 0,
    reviews: allReviews[p.name] || []
  });

  const handleToggleFavorite = (place: Place) => {
    const isFav = favorites.some(f => f.name === place.name);
    const placeName = place.name;
    
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.name !== placeName));
      setFavCounts(prev => ({ ...prev, [placeName]: Math.max(0, (prev[placeName] || 0) - 1) }));
    } else {
      const enriched = enrichPlaceWithStats(place);
      setFavorites(prev => [{...enriched, favoriteCount: (favCounts[placeName] || 0) + 1}, ...prev]);
      setFavCounts(prev => ({ ...prev, [placeName]: (prev[placeName] || 0) + 1 }));
      setReviewTarget(place);
      setShowReviewModal(true);
    }
  };

  const handleUpdatePlace = (updatedPlace: Place) => {
    setFavorites(prev => prev.map(p => p.id === updatedPlace.id ? updatedPlace : p));
    setCurrentPlaces(prev => prev.map(p => p.id === updatedPlace.id ? updatedPlace : p));
  };

  const handleSaveReview = () => {
    if (!reviewTarget || !reviewText.trim()) {
      setShowReviewModal(false);
      return;
    }

    const newReview: Review = {
      id: crypto.randomUUID(),
      userName: user?.name || 'Viajante Anônimo',
      text: reviewText,
      date: new Date().toLocaleDateString('pt-BR')
    };

    setAllReviews(prev => ({
      ...prev,
      [reviewTarget.name]: [newReview, ...(prev[reviewTarget.name] || [])]
    }));

    setReviewText('');
    setReviewTarget(null);
    setShowReviewModal(false);
  };

  const handleSend = async (customMessage?: string) => {
    const msgText = customMessage || input;
    if (!msgText.trim() || loading) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: msgText }]);
    if (!customMessage) setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendMessageToGemini(
        msgText,
        history,
        location || undefined,
        lang
      );

      const foundPlaces = parsePlacesFromText(responseText).map(enrichPlaceWithStats);
      const foundRoute = parseRouteFromText(responseText);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        places: foundPlaces.length > 0 ? foundPlaces : undefined,
        route: foundRoute
      }]);

      if (foundRoute) setActiveRoute(foundRoute);
      if (foundPlaces.length > 0) setCurrentPlaces(foundPlaces);

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'model',
        text: "Desculpe, viajante. Tivemos um problema com a bússola mágica."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tpm_user');
    setUser(null);
    setIsLoggedIn(false);
    setMessages([]);
    setIsAdminAccessEnabled(false);
    setViewMode('chat');
  };

  if (!isLoggedIn || !user) {
    return <LandingPage onLogin={(userData) => { 
      localStorage.setItem('tpm_user', JSON.stringify(userData));
      setUser(userData); 
      setIsLoggedIn(true); 
    }} />;
  }

  // REGRAS DO CARROSSEL: Apenas favoritos que possuem imagem (Curadoria Admin)
  const carouselItems = favorites.filter(p => !!p.imageUrl);

  return (
    <div className="h-screen w-full bg-texture-parchment flex flex-col overflow-hidden max-w-md mx-auto border-x-2 border-[#5c4d3c]/20 relative shadow-2xl">
      {/* Header */}
      <header className="bg-texture-paper p-4 border-b-4 border-[#c0b090] shadow-md flex justify-between items-center relative z-20 shrink-0">
        <div 
          className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-all"
          onClick={handleSecretTrigger}
        >
          <div className={`w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center border border-[#c0b090] shadow-sm transition-transform ${isClickingTitle ? 'scale-125 rotate-12' : ''}`}>
            <Compass className={`${isClickingTitle ? 'text-white' : 'text-amber-400'}`} size={18} />
          </div>
          <h1 className="font-serif font-black text-xl text-stone-900 tracking-tighter uppercase">{t.title}</h1>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-2 hover:bg-stone-200 rounded-lg transition text-stone-600 relative"
          >
            <Languages size={20} />
            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 bg-texture-paper border-2 border-[#c0b090] rounded-xl shadow-xl p-1 w-24 animate-fade-in z-50">
                {(['pt', 'en', 'es', 'it'] as Language[]).map(l => (
                  <button 
                    key={l}
                    onClick={() => { setLang(l); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${lang === l ? 'bg-stone-800 text-white' : 'text-stone-700 hover:bg-[#e8dec0]'}`}
                  >
                    <span>{LANG_FLAGS[l]}</span> {l.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </button>
          
          {isAdminAccessEnabled && (
            <button 
              onClick={() => setIsAdminOpen(true)} 
              className="p-2 bg-stone-800 text-amber-400 rounded-lg transition border-2 border-stone-950 shadow-lg"
              title="Dashboard"
            >
              <Settings size={20} />
            </button>
          )}
          
          <button onClick={handleLogout} className="p-2 hover:bg-rose-50 rounded-lg transition text-rose-600" title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* Carrossel de Favoritos (Apenas os com imagem ativa) */}
        {carouselItems.length > 0 && (
          <div className="p-2 pt-3 bg-texture-parchment/50 border-b border-[#c0b090]/30 shrink-0 overflow-hidden">
            <PartnerCarousel partners={carouselItems} />
          </div>
        )}

        {viewMode === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide pb-24">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-6">
                   <Compass size={48} className="text-stone-300 mb-2 animate-pulse" />
                   <p className="font-serif italic font-bold text-stone-500">{t.placeholder}</p>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[90%] rounded-2xl p-4 shadow-sm border-2 ${
                    m.role === 'user' ? 'bg-stone-800 text-white border-stone-900 rounded-tr-none' : 'bg-texture-paper text-stone-900 border-[#d0c0a0] rounded-tl-none'
                  }`}>
                    {/* Oculta texto se houver lugares/rota, conforme pedido */}
                    {(m.role === 'user' || (!m.places && !m.route)) && (
                      <p className="font-serif text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    )}
                    
                    {m.route && <RouteCard route={m.route} />}
                    {m.places && m.places.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {m.places.map((p, idx) => (
                          <PlaceCard 
                            key={idx} 
                            place={enrichPlaceWithStats(p)} 
                            isFavorite={favorites.some(f => f.name === p.name)}
                            onToggleFavorite={handleToggleFavorite}
                            reviews={allReviews[p.name] || []}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-texture-parchment via-texture-parchment to-transparent z-10">
              <div className="flex gap-2 bg-white rounded-2xl p-2 border-2 border-[#d0c0a0] shadow-xl">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.placeholder}
                  className="flex-1 bg-transparent px-3 py-2 outline-none text-sm font-serif font-bold text-stone-800"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading}
                  className="p-3 bg-stone-800 text-amber-400 rounded-xl shadow-lg active:scale-95 transition-transform"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'map' && (
          <div className="flex-1 p-2 h-full min-h-0">
            <MapView places={currentPlaces} favorites={favorites} partners={[]} userLocation={location} activeRoute={activeRoute} />
          </div>
        )}

        {viewMode === 'favorites' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20 scrollbar-hide">
             <h2 className="font-serif font-black text-lg text-stone-800 border-b-2 border-[#c0b090] pb-1 flex items-center gap-2">
               <Heart size={20} className="fill-rose-500 text-rose-500" /> Lugares Salvos
             </h2>
             {favorites.length === 0 ? (
               <div className="py-20 text-center text-stone-400 italic font-serif">Sua caderneta está vazia.</div>
             ) : (
               favorites.map((p, idx) => (
                 <PlaceCard key={idx} place={enrichPlaceWithStats(p)} isFavorite={true} onToggleFavorite={handleToggleFavorite} reviews={allReviews[p.name] || []} />
               ))
             )}
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <nav className="bg-texture-paper border-t-4 border-[#c0b090] p-2 flex justify-around items-center z-20 shrink-0">
        {[
          { id: 'chat', icon: MessageSquare, label: t.chat },
          { id: 'map', icon: MapIcon, label: t.map },
          { id: 'favorites', icon: Heart, label: t.favs }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setViewMode(item.id as any)}
            className={`flex flex-col items-center gap-1 p-2 ${viewMode === item.id ? 'text-stone-900 scale-105' : 'text-stone-400'}`}
          >
            <item.icon size={18} className={viewMode === item.id ? 'fill-current' : ''} />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Admin Dashboard */}
      {isAdminOpen && (
        <AdminDashboard 
          onClose={() => setIsAdminOpen(false)} 
          favorites={favorites}
          onUpdatePlace={handleUpdatePlace}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && reviewTarget && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-texture-paper border-4 border-[#c0b090] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative">
            <h2 className="font-serif font-black text-xl text-stone-900 mb-2 uppercase tracking-tighter">Deixe seu Relato</h2>
            <p className="text-xs text-stone-500 font-serif italic mb-4">Relate sua experiência em <span className="text-stone-900 font-bold">"{reviewTarget.name}"</span>:</p>
            <textarea 
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="O que achou deste lugar?"
              className="w-full h-32 bg-white/50 border-2 border-[#d0c0a0] rounded-2xl p-4 text-sm font-serif outline-none focus:border-stone-800 transition-all resize-none shadow-inner"
            />
            <div className="flex gap-3 mt-6">
               <button onClick={() => { setShowReviewModal(false); setReviewTarget(null); setReviewText(''); }} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-stone-400">Pular</button>
               <button onClick={handleSaveReview} className="flex-1 py-3 bg-stone-800 text-amber-400 text-[10px] font-black uppercase rounded-xl border-b-4 border-stone-950 active:border-b-0 active:translate-y-1">Publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
