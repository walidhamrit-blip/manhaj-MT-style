'use client';

/**
 * Filet de sécurité : affiché si une page rencontre une erreur inattendue
 * (par exemple une base de données injoignable).
 */
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        fontFamily: 'Cairo, Inter, sans-serif',
        background: '#f4f5f6',
        direction: 'rtl',
      }}
    >
      <div
        style={{
          maxWidth: 660,
          background: '#fff',
          border: '1px solid #dce1e4',
          borderRadius: 8,
          padding: '28px 26px',
          lineHeight: 1.9,
        }}
      >
        <h1 style={{ margin: '0 0 12px', color: '#122b3f', fontSize: 22 }}>حدث خطأ غير متوقع</h1>
        <p style={{ margin: '0 0 10px', color: '#4b5560' }}>
          Une erreur est survenue. Vérifiez que la variable{' '}
          <code style={{ background: '#eef1f3', padding: '2px 6px', borderRadius: 4 }}>DATABASE_URL</code> pointe vers
          votre base Neon, puis réessayez.
        </p>
        <pre
          style={{
            margin: '0 0 18px',
            padding: 12,
            background: '#f6f8f9',
            border: '1px solid #e4e8ea',
            borderRadius: 6,
            fontSize: 11,
            direction: 'ltr',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          {error?.message || 'Erreur inconnue'}
        </pre>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '10px 18px',
            color: '#fff',
            background: '#e30613',
            border: 0,
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          إعادة المحاولة / Réessayer
        </button>
      </div>
    </div>
  );
}
