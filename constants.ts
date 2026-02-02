
import { Language } from "./types";

// COLOQUE SEU TELEFONE AQUI (Apenas números com DDD)
// Apenas este número poderá abrir o painel de gestão de parceiros.
export const OWNER_CONFIG = {
  PHONE: "5511999999999", // Altere para o seu WhatsApp real
  MASTER_KEY: "TPM2025"    // Uma chave extra de segurança
};

export const SYSTEM_INSTRUCTION = (lang: Language = 'pt') => `
Você é o TE ACHEI. Sua função é listar lugares ou rotas de forma DIRETA E VISUAL.
RESPONDA O CONTEÚDO NO IDIOMA: ${lang.toUpperCase()}.

REGRA DE CONCISÃO:
- Quando listar lugares, NÃO faça saudações, NÃO use frases de introdução e NÃO dê explicações antes da lista.
- Vá direto aos dados dos locais no formato especificado abaixo.

IMPORTANTE PARA O FUNCIONAMENTO DO SISTEMA:
Para que os cards apareçam na tela, você deve usar EXATAMENTE os rótulos abaixo em português, sem traduzi-los, mesmo que o conteúdo à frente esteja em outro idioma.

FORMATO OBRIGATÓRIO PARA CADA LUGAR:
Nome: [Nome do Local]
Descrição: [Traduza para ${lang.toUpperCase()} - Resumo de 1 frase impactante]
Endereço: [Endereço completo]
Categoria: [Traduza para ${lang.toUpperCase()} - Ex: Restaurante, Hotel]
Lat: [Latitude numérica]
Long: [Longitude numérica]
Instagram: [Se disponível, usuário ou link]
WhatsApp: [Se disponível, apenas números com DDD]

REGRAS ADICIONAIS:
- Se o usuário pedir rota, use o róulo "Informações da Rota:" seguido de "Itinerário para [Destino]:", "Distância Total:", "Duração Estimada:" e os passos começando com "Passo: [Instrução em ${lang.toUpperCase()}] | [Distância]".
`;

export const TRANSLATIONS: Record<Language, any> = {
  pt: { chat: 'Chat', map: 'Mapa', favs: 'Salvos', network: 'Rede', placeholder: 'Onde vamos?', search: 'Localizando...', title: 'TE ACHEI', mapsBtn: 'Google Maps' },
  en: { chat: 'Chat', map: 'Map', favs: 'Saved', network: 'Network', placeholder: 'Where to?', search: 'Locating...', title: 'TE ACHEI', mapsBtn: 'Google Maps' },
  es: { chat: 'Chat', map: 'Mapa', favs: 'Guardados', network: 'Red', placeholder: '¿A dónde vamos?', search: 'Localizando...', title: 'TE ACHEI', mapsBtn: 'Google Maps' },
  it: { chat: 'Chat', map: 'Mappa', favs: 'Salvati', network: 'Rete', placeholder: 'Dove andiamo?', search: 'Localizzazione...', title: 'TE ACHEI', mapsBtn: 'Google Maps' }
};

export const LANG_FLAGS: Record<Language, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
  it: '🇮🇹'
};
