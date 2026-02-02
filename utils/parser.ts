
import { Place, Route, RouteStep } from "../types";

export const parsePlacesFromText = (text: string): Place[] => {
  const places: Place[] = [];
  const clean = (str: string) => str.replace(/\*\*/g, '').trim();
  const blocks = text.split(/(?=Nome:)/g);

  blocks.forEach((block) => {
    const nameMatch = block.match(/Nome:\s*(.+)/);
    const descMatch = block.match(/Descrição:\s*(.+)/);
    const addrMatch = block.match(/Endereço:\s*(.+)/);
    const distMatch = block.match(/Distância:\s*(.+)/);
    const catMatch = block.match(/Categoria:\s*(.+)/);
    const latMatch = block.match(/Lat:\s*([-\d.]+)/);
    const lngMatch = block.match(/Long:\s*([-\d.]+)/);
    const instaMatch = block.match(/Instagram:\s*(.+)/);
    const zapMatch = block.match(/WhatsApp:\s*(.+)/);

    if (nameMatch && latMatch && lngMatch) {
      places.push({
        id: crypto.randomUUID(),
        name: clean(nameMatch[1]),
        description: descMatch ? clean(descMatch[1]) : "",
        address: addrMatch ? clean(addrMatch[1]) : "",
        distance: distMatch ? clean(distMatch[1]) : undefined,
        category: catMatch ? clean(catMatch[1]) : "geral",
        lat: parseFloat(latMatch[1]),
        lng: parseFloat(lngMatch[1]),
        instagram: instaMatch ? clean(instaMatch[1]) : undefined,
        whatsapp: zapMatch ? clean(zapMatch[1]).replace(/\D/g, '') : undefined,
      });
    }
  });

  return places;
};

export const parseRouteFromText = (text: string): Route | undefined => {
  if (!text.includes("Informações da Rota:")) return undefined;

  const destMatch = text.match(/Itinerário para\s*(.+)/);
  const distMatch = text.match(/Distância Total:\s*(.+)/);
  const durMatch = text.match(/Duração Estimada:\s*(.+)/);
  
  const steps: RouteStep[] = [];
  const stepLines = text.split('\n').filter(line => line.startsWith('Passo:'));
  
  stepLines.forEach(line => {
    const parts = line.replace('Passo:', '').split('|');
    if (parts.length >= 1) {
      steps.push({
        instruction: parts[0].trim(),
        distance: parts[1] ? parts[1].trim() : undefined
      });
    }
  });

  if (steps.length > 0) {
    return {
      destination: destMatch ? destMatch[1].trim() : "Destino",
      totalDistance: distMatch ? distMatch[1].trim() : "N/A",
      totalDuration: durMatch ? durMatch[1].trim() : "N/A",
      steps: steps
    };
  }

  return undefined;
};
