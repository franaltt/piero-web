// Herramientas que cuelgan en el inicio.
// Para usar el logo oficial, poné el archivo en public/logos/<slug>.svg (o .png).
// Mientras no exista, se muestra el cuadrado provisorio con color y sigla.
export const TOOLS = [
  { slug: 'claude',      name: 'Claude',      mark: 'Cl', color: '#E8673C', text: '#FFFFFF' },
  { slug: 'chatgpt',     name: 'ChatGPT',     mark: 'GPT', color: '#0C0C0D', text: '#FFFFFF' },
  { slug: 'gemini',      name: 'Gemini',      mark: 'Ge', color: '#3B6BFF', text: '#FFFFFF' },
  { slug: 'seedance',    name: 'Seedance',    mark: 'Sd', color: '#19C37D', text: '#0C0C0D' },
  { slug: 'kling',       name: 'Kling',       mark: 'K',  color: '#FFFFFF', text: '#0C0C0D' },
  { slug: 'elevenlabs',  name: 'ElevenLabs',  mark: '11', color: '#1C1C1F', text: '#FFFFFF' },
  { slug: 'heygen',      name: 'HeyGen',      mark: 'Hg', color: '#7B5CFF', text: '#FFFFFF' },
  { slug: 'suno',        name: 'Suno',        mark: 'Su', color: '#FF8A3D', text: '#0C0C0D' },
  { slug: 'canva',       name: 'Canva',       mark: 'Ca', color: '#16B8D4', text: '#FFFFFF', full: true }, // su logo ya es un ícono de app completo
  { slug: 'nano-banana', name: 'Nano Banana', mark: 'Nb', color: '#FFD23F', text: '#0C0C0D' },
  { slug: 'gpt-image',   name: 'GPT Image',   mark: 'Gi', color: '#E9E9E4', text: '#0C0C0D' },
];

// Qué logo baja a cada hueco de la frase de la segunda sección ({0} … {5})
export const STATEMENT_TOOLS = ['nano-banana', 'gpt-image', 'claude', 'kling', 'seedance', 'heygen'];
