
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Compass, Lock, Navigation, ShieldCheck, RefreshCw, 
  Map as MapIcon, MessageCircle, AlertCircle, RotateCcw
} from 'lucide-react';

export const LandingPage: React.FC<{ onLogin: (userData: any) => void }> = ({ onLogin }) => {
  const [step, setStep] = useState<'name' | 'pattern' | 'confirm'>('name');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pattern, setPattern] = useState<number[]>([]);
  const [firstPattern, setFirstPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [error, setError] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedPattern = localStorage.getItem(`tpm_pattern_${name.toLowerCase().trim()}`);
    
    setIsNewUser(!savedPattern);
    setStep('pattern');
    setPattern([]);
    setFirstPattern([]);
    setErrorCount(0);
  };

  const handleDotInteraction = (index: number) => {
    if (!isDrawing) {
      setIsDrawing(true);
      setPattern([index]);
    } else if (!pattern.includes(index)) {
      setPattern(prev => [...prev, index]);
      // Feedback tátil se disponível
      if (window.navigator.vibrate) window.navigator.vibrate(10);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element) {
      // Procura o index do ponto nos atributos de dados
      const dotIndexStr = element.closest('[data-dot-index]')?.getAttribute('data-dot-index');
      if (dotIndexStr !== null && dotIndexStr !== undefined) {
        const index = parseInt(dotIndexStr, 10);
        if (!pattern.includes(index)) {
          handleDotInteraction(index);
        }
      }
    }
  };

  const getDotCenter = (index: number) => {
    const el = dotsRef.current[index];
    if (!el || !containerRef.current) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const parentRect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top + rect.height / 2
    };
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (pattern.length < 3) {
      triggerError();
      return;
    }

    const patternKey = `tpm_pattern_${name.toLowerCase().trim()}`;
    const savedPattern = localStorage.getItem(patternKey);

    if (isNewUser) {
      if (step === 'pattern') {
        setFirstPattern(pattern);
        setPattern([]);
        setStep('confirm');
      } else {
        if (JSON.stringify(pattern) === JSON.stringify(firstPattern)) {
          localStorage.setItem(patternKey, JSON.stringify(pattern));
          proceedToLogin();
        } else {
          triggerError();
        }
      }
    } else {
      try {
        const parsedSaved = JSON.parse(savedPattern || '[]');
        if (JSON.stringify(parsedSaved) === JSON.stringify(pattern)) {
          proceedToLogin();
        } else {
          triggerError();
        }
      } catch (e) {
        triggerError();
      }
    }
  };

  const triggerError = () => {
    setError(true);
    setErrorCount(prev => prev + 1);
    if (window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
    setTimeout(() => {
      setPattern([]);
      setError(false);
    }, 800);
  };

  const handleResetApp = () => {
    if (confirm("ATENÇÃO: Isso limpará todos os seus dados locais (favoritos e parceiros). Deseja prosseguir?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const proceedToLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const userData = {
        name: name,
        id: crypto.randomUUID(),
        method: 'pattern-lock',
        role: 'Explorador Oficial'
      };
      onLogin(userData);
    }, 1000);
  };

  return (
    <div className="relative h-full w-full bg-texture-parchment flex items-center justify-center overflow-hidden p-6 select-none touch-none">
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.12] scale-110"
        style={{
            backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/7/7f/1852_Levasseur_Map_of_the_World_%28World_Map%29_-_Geographicus_-_Monde-levasseur-1852.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.2) sepia(0.5)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-[#5c4d3c]/30 rounded-[2.5rem] p-1 shadow-2xl backdrop-blur-sm border border-[#c0b090]/50">
          <div className="bg-texture-paper border-2 border-[#c0b090] rounded-[2.3rem] p-8 border-b-[10px] relative overflow-hidden transition-all duration-500">
            <div className="relative z-10 text-center mb-8">
              <div className="w-16 h-16 bg-stone-800 rounded-full mx-auto flex items-center justify-center shadow-xl mb-4 border-2 border-[#c0b090] relative group">
                {step === 'name' ? (
                   <Compass className="text-amber-400" size={32} />
                ) : step === 'confirm' ? (
                   <ShieldCheck className="text-green-500" size={32} />
                ) : (
                   <Lock className="text-amber-400" size={32} />
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold text-stone-900 font-serif uppercase mb-1">TE ACHEI</h1>
                <div className="vintage-banner">
                  <div className="vintage-banner-inner"></div>
                  <span className="relative z-10 text-[10px] font-black tracking-[0.25em] px-2">TURISMO</span>
                </div>
              </div>
            </div>

            {step === 'name' ? (
              <form onSubmit={handleNextStep} className="relative z-10 space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-stone-400 px-1">Identificação</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu Nome..."
                    className="w-full bg-white border-2 border-[#d0c0a0] rounded-2xl px-5 py-4 text-stone-800 placeholder-stone-300 outline-none focus:border-stone-800 shadow-inner font-serif text-sm font-bold"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-4 bg-stone-800 border-stone-950 border-b-[6px] text-white rounded-2xl font-serif font-black uppercase tracking-widest text-xs active:border-b-0 active:translate-y-1 transition-all shadow-xl flex items-center justify-center gap-2 mt-4"
                >
                  <MapIcon size={14} /> Abrir Caderneta
                </button>
              </form>
            ) : (
              <div className="relative z-10 animate-fade-in flex flex-col items-center">
                <div 
                  ref={containerRef}
                  className={`grid grid-cols-3 gap-6 p-6 bg-[#e8dec0]/30 backdrop-blur-sm rounded-3xl border-2 border-stone-300 relative touch-none select-none ${error ? 'animate-shake border-rose-500' : ''}`}
                  onMouseUp={finishDrawing}
                  onTouchEnd={finishDrawing}
                  onTouchMove={handleTouchMove}
                  style={{ touchAction: 'none' }}
                >
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      data-dot-index={i}
                      ref={el => dotsRef.current[i] = el}
                      onMouseDown={() => handleDotInteraction(i)}
                      onTouchStart={(e) => { e.preventDefault(); handleDotInteraction(i); }}
                      onMouseEnter={() => isDrawing && handleDotInteraction(i)}
                      className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer relative z-10
                        ${pattern.includes(i) ? 'bg-stone-800 border-stone-900 scale-110 shadow-lg' : 'bg-white border-[#d0c0a0]'}
                      `}
                    >
                      <span className={`text-xs font-serif font-black ${pattern.includes(i) ? 'text-amber-400' : 'text-stone-400'}`}>{i + 1}</span>
                      {pattern.includes(i) && (
                        <div className="absolute inset-[-4px] border border-amber-400/50 rounded-full animate-pulse pointer-events-none" />
                      )}
                    </div>
                  ))}
                  
                  {/* SVG para desenhar as linhas conectoras */}
                  <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
                    <polyline
                      points={pattern.map(idx => {
                        const { x, y } = getDotCenter(idx);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke={error ? "#e11d48" : "#5c4d3c"}
                      strokeWidth="6"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="opacity-60 transition-colors duration-300"
                    />
                  </svg>
                </div>
                
                <p className={`text-[10px] font-serif italic mt-4 text-center transition-colors ${error ? 'text-rose-600 font-bold' : 'text-stone-500'}`}>
                  {error ? 'Padrão incorreto!' : (isNewUser ? (step === 'confirm' ? 'Confirme o padrão' : 'Crie um padrão de acesso') : 'Desenhe sua chave')}
                </p>

                {errorCount >= 3 && (
                   <button 
                    onClick={handleResetApp}
                    className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-rose-500 transition-colors"
                   >
                     <RotateCcw size={10} /> Esqueci meu padrão / Limpar
                   </button>
                )}

                {isLoading && (
                   <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in rounded-3xl">
                      <Loader2 className="animate-spin text-stone-800 mb-2" size={32} />
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Carregando Diário...</span>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
