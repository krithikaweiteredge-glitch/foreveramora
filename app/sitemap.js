import { studio } from '@/lib/studio';

export default function sitemap() {
  const now = new Date();
  const anchors = ['', '#services', '#about', '#book'];
  return anchors.map((a, i) => ({
    url: `${studio.url}/${a}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: i === 0 ? 1 : 0.7,
  }));
}
