const API_BASE = process.env.REACT_APP_API_URL || '';
const SERVER_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${SERVER_ORIGIN}${imageUrl}`;
}
