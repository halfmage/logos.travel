import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { slugifyTag, formatTag } from '@/utils/tags';

export const GET: APIRoute = async () => {
  const logos = await getCollection('logos');

  // Extract logo IDs and create search entries
  const logoEntries = logos.map((logo) => {
    const idParts = logo.id.split('/');
    const simpleId = idParts.length > 1 ? idParts[0] : logo.id;
    return {
      type: 'logo' as const,
      title: logo.data.name,
      id: simpleId,
      url: `/logos/${simpleId}/`,
    };
  });

  // Get all unique tags
  const allTags = new Set<string>();
  logos.forEach(logo => {
    if (logo.data.tags) {
      logo.data.tags.forEach(tag => allTags.add(tag));
    }
  });

  // Create tag entries
  const tagEntries = Array.from(allTags).map((tag) => ({
    type: 'tag' as const,
    title: formatTag(tag),
    url: `/tags/${slugifyTag(tag)}/`,
  }));

  return new Response(
    JSON.stringify({
      logos: logoEntries,
      tags: tagEntries,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

