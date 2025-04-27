import { component$ } from '@builder.io/qwik';
import { useLocation, Link } from '@builder.io/qwik-city';
import { LuArrowLeft } from '@qwikest/icons/lucide';

export default component$(() => {
  const location = useLocation();
  const categoria = location.params.categoria;
  
  // Mapear nombres de categorías para mostrar
  const categoriasNombres: Record<string, string> = {
    'contratos-laborales': 'Contratos Laborales',
    'despidos': 'Cartas de Despido',
    'demandas': 'Demandas Laborales',
    'reclamaciones': 'Reclamaciones',
    'afiliaciones': 'Afiliaciones',
    'convenios': 'Convenios Colectivos',
    'conflictos': 'Conflictos Laborales',
    'derechos': 'Derechos Laborales'
  };
  
  const categoriaNombre = categoriasNombres[categoria] || 'Categoría';
  
  return (
    <div class="categoria-page">
      <div class="page-header">
        <Link href="/documentos-legales/" class="back-link">
          <LuArrowLeft class="w-5 h-5" />
          <span>Volver</span>
        </Link>
        <h1 class="page-title">{categoriaNombre}</h1>
        <p class="page-description">
          Selecciona una plantilla para generar un documento legal
        </p>
      </div>
      
      <div class="page-content">
        <div class="info-message">
          <p>Las plantillas para la categoría <strong>{categoriaNombre}</strong> están en desarrollo.</p>
          <p>Mientras tanto, puedes usar el <Link href="/documentos-legales/asistente/" class="link-text">Asistente de IA</Link> para generar documentos personalizados.</p>
        </div>
      </div>
      
      <style>
        {`
        .categoria-page {
          padding: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          text-decoration: none;
        }
        
        .back-link:hover {
          color: #111827;
        }
        
        .page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .page-description {
          color: #6b7280;
          margin-bottom: 2rem;
        }
        
        .page-content {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 2rem;
        }
        
        .info-message {
          background-color: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 0.375rem;
          padding: 1.5rem;
          text-align: center;
        }
        
        .info-message p {
          margin-bottom: 0.75rem;
        }
        
        .info-message p:last-child {
          margin-bottom: 0;
        }
        
        .link-text {
          color: #e53e3e;
          text-decoration: none;
          font-weight: 500;
        }
        
        .link-text:hover {
          text-decoration: underline;
        }
        `}
      </style>
    </div>
  );
});