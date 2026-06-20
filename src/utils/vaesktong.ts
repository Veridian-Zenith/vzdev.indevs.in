export const VAESKTONG_MAP: Record<string, string> = {
  "forge": "Kjorg",
  "digital": "Vae",
  "nordic": "Nord",
  "system": "Sys",
  "beauty": "Fae",
  "code": "Runa",
  "speed": "Vind",
};

export const translateToVaesktong = (text: string) => {
  return text.split(' ').map(word => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    return VAESKTONG_MAP[cleanWord] || word;
  }).join(' ');
};
