export interface RankedTeam {
  id: string;
  name: string;
  tag: string;
  avatar: string;
  points: number;
  season: string;
  matchesPlayed?: number;
  winRate?: string;
  trend?: "up" | "down" | "same";
}

export const DEFAULT_SEASONS = [
  "Сезон 1 (2026)",
  "Сезон 2 (2026)",
  "Предсезон 2026",
];

// Clean fallback SVG crest for teams without an uploaded avatar
export const DEFAULT_TEAM_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' rx='20' fill='%23171717'/%3E%3Cpath d='M50 20 L75 32 V55 C75 70 50 82 50 82 C50 82 25 70 25 55 V32 Z' fill='%23262626' stroke='%23f59e0b' stroke-width='2'/%3E%3Cpath d='M50 35 L55 45 L66 46 L58 54 L60 65 L50 60 L40 65 L42 54 L34 46 L45 45 Z' fill='%23f59e0b'/%3E%3C/svg%3E";

// Initially empty: no preset/mock teams as requested
export const INITIAL_RANKED_TEAMS: RankedTeam[] = [];

/**
 * Reads an image file (e.g. from gallery or camera), crops it to a square,
 * resizes to a max resolution (default 256x256), and returns a compact Data URL.
 */
export function processImageFile(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Пожалуйста, выберите файл изображения (PNG, JPG, WEBP)"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const width = img.width;
          const height = img.height;

          // Square center crop
          const cropSize = Math.min(width, height);
          const startX = (width - cropSize) / 2;
          const startY = (height - cropSize) / 2;

          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, startX, startY, cropSize, cropSize, 0, 0, maxSize, maxSize);
          // Convert to efficient WebP (with fallback to JPEG if unsupported)
          let dataUrl = canvas.toDataURL("image/webp", 0.85);
          if (!dataUrl || dataUrl.indexOf("image/webp") === -1) {
            dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          }
          resolve(dataUrl);
        } catch {
          // If canvas security or other issue occurs, fallback to raw read
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error("Не удалось прочитать выбранное изображение"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Ошибка чтения файла из галереи"));
    reader.readAsDataURL(file);
  });
}
