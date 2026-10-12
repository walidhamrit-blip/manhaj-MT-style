/**
 * Écran d'aide affiché lorsque la base de données n'est pas encore joignable.
 * Il explique, en arabe et en français, les deux réglages à effectuer.
 */
export default function SetupNotice({ message }: { message: string }) {
  const steps = [
    {
      fr: 'Créez une base PostgreSQL gratuite sur neon.com et copiez sa chaîne de connexion.',
      ar: 'أنشئ قاعدة بيانات PostgreSQL مجانية على neon.com وانسخ رابط الاتصال.',
    },
    {
      fr: 'Sur Vercel : Project → Settings → Environment Variables → ajoutez DATABASE_URL et ADMIN_PASSWORD.',
      ar: 'في Vercel: أضف المتغيّرين DATABASE_URL و ADMIN_PASSWORD في إعدادات المشروع.',
    },
    {
      fr: 'Redéployez : les tables et le contenu initial sont créés automatiquement au premier chargement.',
      ar: 'أعد النشر: تُنشأ الجداول والمحتوى الأولي تلقائياً عند أول زيارة.',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        fontFamily: 'Cairo, Inter, sans-serif',
        background: '#f4f5f6',
      }}
    >
      <div
        style={{
          maxWidth: 760,
          background: '#fff',
          border: '1px solid #dce1e4',
          borderRadius: 8,
          padding: '30px 28px',
          lineHeight: 1.9,
          color: '#2c3841',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: '#fff3cd',
            border: '1px solid #ffe08a',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          قاعدة البيانات غير مهيأة · Base de données non configurée
        </span>

        <h1 style={{ margin: '16px 0 8px', color: '#122b3f', fontSize: 24 }}>
          شركة المنهج للقرطاسية — Al Manhaj Stationery
        </h1>
        <p style={{ margin: '0 0 18px', color: '#56636b', fontSize: 14 }}>
          Le site est prêt, il ne manque que la connexion à la base de données (Neon) pour être lancé.
          · الموقع جاهز، ويحتاج فقط إلى ربط قاعدة البيانات.
        </p>

        <ol style={{ margin: '0 0 18px', paddingInlineStart: 22, fontSize: 13.5 }}>
          {steps.map((step) => (
            <li key={step.fr} style={{ marginBottom: 10 }}>
              <span dir="ltr" style={{ display: 'block', color: '#23313c' }}>{step.fr}</span>
              <span dir="rtl" style={{ display: 'block', color: '#56636b' }}>{step.ar}</span>
            </li>
          ))}
        </ol>

        <details dir="ltr" style={{ fontSize: 12, color: '#56636b' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Détail technique de l’erreur</summary>
          <pre
            style={{
              marginTop: 10,
              padding: 12,
              background: '#f6f8f9',
              border: '1px solid #e4e8ea',
              borderRadius: 6,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
            }}
          >
            {message}
          </pre>
        </details>

        <p style={{ marginTop: 18, marginBottom: 0, fontSize: 12, color: '#7a848b' }}>
          En développement local, aucune configuration n’est nécessaire : une base locale est créée automatiquement.
        </p>
      </div>
    </div>
  );
}
