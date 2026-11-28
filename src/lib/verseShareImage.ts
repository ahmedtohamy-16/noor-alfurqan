import background from '@/assets/verse-share-dark-stone.webp.asset.json';
import quranFont from '@/assets/verse-share-quran.ttf.asset.json';
import uiFont from '@/assets/verse-share-ui.ttf.asset.json';
import { fullTextLines } from './textLines';
import { IMAGE_WEBSITE_URL } from './exportBranding';
import { arabicDigits } from './displayFormat';

export const verseShareColors = [
  { id: 'brass', name: 'نحاسي', token: '--share-brass' },
  { id: 'silver', name: 'فضي', token: '--share-silver' },
  { id: 'sage', name: 'أخضر', token: '--share-sage' },
  { id: 'rose', name: 'وردي', token: '--share-rose' },
] as const;
export type VerseShareColor = typeof verseShareColors[number]['id'];
let resources: Promise<HTMLImageElement> | undefined;
function loadResources() {
  resources ||= (async () => {
    for (const [family, url] of [['Verse Quran', quranFont.url], ['Verse UI', uiFont.url]]) {
      const face = await new FontFace(family, `url(${url})`).load();
      document.fonts.add(face);
    }
    const image = new Image(); image.src = background.url; await image.decode(); return image;
  })();
  return resources.catch(error => { resources = undefined; throw error; });
}
export async function renderVerseShare(text: string, surah: string, ayah: number, color: VerseShareColor): Promise<Blob> {
  const image = await loadResources();
  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('تعذّر تجهيز الصورة');
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => `hsl(${css.getPropertyValue(name).trim()})`;
  const accent = token(verseShareColors.find(c => c.id === color)?.token || '--share-brass');
  const words = text.trim().split(/\s+/);
  let size = words.length <= 8 ? 94 : words.length <= 25 ? 72 : 54;
  ctx.font = `${size}px 'Verse Quran'`;
  while (size > 28 && words.some(w => ctx.measureText(w).width > 830)) { size -= 2; ctx.font = `${size}px 'Verse Quran'`; }
  let lines = fullTextLines(text, 830, line => ctx.measureText(line).width);
  if (lines.length === 1 && words.length >= 4 && words.length <= 8) { const split = Math.ceil(words.length / 2); lines = [words.slice(0, split).join(' '), words.slice(split).join(' ')]; }
  const lineSizes = lines.map((_, i) => words.length <= 8 && i === lines.length - 1 ? size * 1.16 : size);
  const steps = lineSizes.map(s => s * 1.85);
  const blockHeight = steps.reduce((n, s) => n + s, 0);
  const width = 1000, height = Math.max(1000, blockHeight + 650), scale = 2.4;
  canvas.width = width * scale; canvas.height = Math.ceil(height * scale); ctx.scale(scale, scale);
  ctx.drawImage(image, 0, 0, image.width * 0.7, image.height, 0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, width);
  ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = accent; ctx.font = "600 30px 'Verse UI'"; ctx.fillText('نور الفرقان', 500, 120);
  let y = (height - blockHeight) / 2 - 25;
  lines.forEach((line, i) => { y += steps[i] / 2; ctx.font = `${lineSizes[i]}px 'Verse Quran'`; ctx.fillStyle = token('--share-verse'); ctx.fillText(line, 500, y); y += steps[i] / 2; });
  const dividerY = Math.max(y + 48, height - 280);
  ctx.strokeStyle = accent; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(465, dividerY); ctx.lineTo(535, dividerY); ctx.stroke();
  ctx.fillStyle = accent; ctx.font = "22px 'Verse UI'"; ctx.fillText(`سورة ${surah.replace(/^سورة\s*/, '')} · الآية ${arabicDigits(ayah)}`, 500, dividerY + 60);
  ctx.direction = 'ltr'; ctx.font = "17px 'Verse UI'"; ctx.fillText(IMAGE_WEBSITE_URL, 500, height - 65);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('تعذّر تجهيز الصورة')), 'image/png'));
}
