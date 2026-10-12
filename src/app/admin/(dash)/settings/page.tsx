import SettingsForm from '@/components/admin/SettingsForm';
import { getSettings } from '@/lib/data';
import { getAdminLang } from '@/lib/admin/page-data';
import { tr } from '@/lib/admin/i18n';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const lang = await getAdminLang();
  const settings = await getSettings();

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>{tr(lang, 'quickActionSettings')}</h1>
          <p>{tr(lang, 'settingsIntro')}</p>
        </div>
      </div>

      <SettingsForm lang={lang} values={settings} />
    </>
  );
}
