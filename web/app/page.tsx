export default function Home() {
  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', textAlign: 'center' }}>
        Sorteos Gratuito
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '40px', textAlign: 'center', color: '#666' }}>
        Sistema de sorteos para Instagram, TikTok y YouTube
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '10px' }}>📷 Instagram</h3>
          <p style={{ color: '#666' }}>Sorteos desde publicaciones y reels</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '10px' }}>🎵 TikTok</h3>
          <p style={{ color: '#666' }}>Sorteos desde videos de TikTok</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '10px' }}>▶️ YouTube</h3>
          <p style={{ color: '#666' }}>Sorteos desde videos de YouTube</p>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '15px' }}>Plan Free</h2>
        <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>3 sorteos por mes</p>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Sin costos, sin pagos, completamente gratuito
        </p>
        <a href="/auth/register" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Comenzar Gratis
        </a>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: '#666' }}>
          ¿Ya tenés cuenta? <a href="/auth/login" style={{ color: '#007bff' }}>Iniciá sesión</a>
        </p>
      </div>
    </div>
  );
}
