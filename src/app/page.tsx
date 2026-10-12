import type { Metadata } from 'next';
import Storefront from '@/components/Storefront';
import SetupNotice from '@/components/SetupNotice';
import { loadSiteContent } from '@/lib/data';

/**
 * La page d'accueil est rendue dynamiquement à chaque visite : toute
 * modification faite dans le panneau d'administration est donc visible
 * immédiatement, sur tous les appareils.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const content = await loadSiteContent();
    const title = String(content.settings['seo.title_ar'] ?? '') || undefined;
    const description = String(content.settings['seo.description_ar'] ?? '') || undefined;
    return { title, description };
  } catch {
    return {};
  }
}

export default async function HomePage() {
  try {
    const content = await loadSiteContent();
    return <Storefront content={content} />;
  } catch (error) {
    console.error('[manhaj] chargement du contenu impossible :', error);
    return <SetupNotice message={error instanceof Error ? error.message : String(error)} />;
  }
}
