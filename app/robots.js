import { studio } from '@/lib/studio';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${studio.url}/sitemap.xml`,
    host: studio.url,
  };
}
