// Tag emoji mapping
export const tagEmojis: Record<string, string> = {
  'Airlines': '✈️',
  'Travel Tech Platforms': '💻',
  'Tour Operators': '🗺️',
  'Travel Agencies': '🏢',
  'Travel Associations': '🤝',
  'Car Rental': '🚗',
  'Aviation Services': '🛫',
  'Travel Security': '🔒',
  'Web3': '🌐',
  'Sustainability': '🌱',
  'Insurance': '🛡️',
};

// Get emoji for a tag
export function getTagEmoji(tag: string): string {
  return tagEmojis[tag] || '🏷️';
}

// Create a slug from tag (removes emojis and special chars)
export function slugifyTag(tag: string): string {
  return tag
    .replace(/[^\w\s-]/g, '') // Remove emojis and special chars
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
}

// Format tag with emoji
export function formatTag(tag: string): string {
  return `${getTagEmoji(tag)} ${tag}`;
}
