// Built-in style packs, bundled so Remotion Studio can preview them by name.
// render.sh also reads any folder in styles/ (including your own) from disk, so new packs don't need to be listed here.
import swapEdu from '../styles/swap-edu/style.json';
import swapAi from '../styles/swap-ai/style.json';
import chalkboard from '../styles/chalkboard/style.json';
import minimalMono from '../styles/minimal-mono/style.json';
import animePastel from '../styles/anime-pastel/style.json';
import newspaperRetro from '../styles/newspaper-retro/style.json';
import neonTech from '../styles/neon-tech/style.json';

export const BUILTIN_STYLES: Record<string, any> = {
  'swap-edu': swapEdu,
  'swap-ai': swapAi,
  chalkboard,
  'minimal-mono': minimalMono,
  'anime-pastel': animePastel,
  'newspaper-retro': newspaperRetro,
  'neon-tech': neonTech,
};
