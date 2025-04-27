import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { useAuthCheck } from './layout';
import { LuMessageSquare, LuFileText, LuFileSignature, LuClipboardEdit } from '@qwikest/icons/lucide';

// Categorías para usuario tipo Despacho
const categoriasDespacho = [
  {
    id: 'contratos-laborales',
    title: 'Contratos Laborales',
    description: 'Plantillas para diferentes tipos de contratos laborales',
    icon: LuFileSignature
  },
  {
    id: 'despidos',
    title: 'Cartas de Despido',
    description: 'Documentos relacionados con la terminación de relaciones laborales',
    icon: LuFileText
  },
  {
    id: 'demandas',
    title: 'Demandas Laborales',
    description: 'Documentos para procesos judiciales laborales',
    icon: LuClipboardEdit
  },
  {
    id: 'reclamaciones',
    title: 'Reclamaciones',
    description: 'Documentos para reclamar derechos laborales e indemnizaciones',
    icon: LuFileText
  }
];

// Categorías para usuario tipo Sindicato
const categoriasSindicato = [
  {
    id: 'afiliaciones',
    title: 'Afiliaciones',
    description: 'Documentos para gestionar la afiliación sindical',
    icon: LuFileSignature
  },
  {
    id: 'convenios',
    title: 'Convenios Colectivos',
    description: 'Documentos relacionados con convenios y pactos colectivos',
    icon: LuFileText
  },
  {
    id: 'conflictos',
    title: 'Conflictos Laborales',
    description: 'Documentos para la gestión de huelgas y conflictos',
    icon: LuClipboardEdit
  },
  {
    id: 'derechos',
    title: 'Derechos Laborales',
    description: 'Información y recursos sobre derechos de los trabajadores',
    icon: LuFileText
  }
];

export default component$(() => {
  const authCheck = useAuthCheck();
  
  // Determinar qué categorías mostrar según el tipo de usuario
  const categorias = authCheck.value.isDespacho ? categoriasDespacho : categoriasSindicato;
  
  return (
    <div class="documentos-page">
      <div class="page-header">
        <h1 class="page-title">Documentos Legales</h1>
        <p class="page-description">
          Genera documentos legales personalizados para tus necesidades laborales
        </p>
      </div>
      
      <div class="options-section">
        <div class="option-card ai-assistant">
          <div class="option-icon">
            <LuMessageSquare class="w-12 h-12 text-white" />
          </div>
          <div class="option-content">
            <h2 class="option-title">Asistente de IA</h2>
            <p class="option-description">
              Genera documentos personalizados con la ayuda de nuestro asistente de inteligencia artificial.
              Ideal para documentos complejos o casos específicos.
            </p>
            <Link href="/documentos-legales/asistente/" class="option-btn">
              Usar Asistente
            </Link>
          </div>
        </div>
        
        <div class="option-card templates">
          <div class="option-icon">
            <LuFileText class="w-12 h-12 text-white" />
          </div>
          <div class="option-content">
            <h2 class="option-title">Plantillas Prediseñadas</h2>
            <p class="option-description">
              Utiliza nuestras plantillas prediseñadas para generar documentos rápidamente.
              Solo completa los campos requeridos y obtén tu documento al instante.
            </p>
            <div class="categories-container">
              <h3 class="categories-title">Elige una categoría:</h3>
              <div class="categories-grid">
                {categorias.map((categoria) => (
                  <Link 
                    key={categoria.id}
                    href={`/documentos-legales/generar/${categoria.id}/`}
                    class="category-card"
                  >
                    <categoria.icon class="w-6 h-6 category-icon" />
                    <div class="category-info">
                      <h4 class="category-title">{categoria.title}</h4>
                      <p class="category-description">{categoria.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div class="documents-history">
          <h2 class="history-title">Mis Documentos Recientes</h2>
          <Link href="/documentos-legales/mis-documentos/" class="history-link">
            Ver todos mis documentos
          </Link>
        </div>
      </div>
      
      <style>
        {`
        .documentos-page {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .page-description {
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .options-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .option-card {
          display: flex;
          background-color: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          width: 100px;
          flex-shrink: 0;
        }
        
        .ai-assistant .option-icon {
          background-color: #e53e3e;
        }
        
        .templates .option-icon {
          background-color: #3b82f6;
        }
        
        .option-content {
          padding: 2rem;
          flex-grow: 1;
        }
        
        .option-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #111827;
        }
        
        .option-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        
        .option-btn {
          display: inline-block;
          padding: 0.625rem 1.25rem;
          background-color: #e53e3e;
          color: white;
          font-weight: 500;
          border-radius: 0.375rem;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        
        .option-btn:hover {
          background-color: #dc2626;
        }
        
        .categories-container {
          margin-top: 1.5rem;
        }
        
        .categories-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }
        
        .category-card {
          display: flex;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        
        .category-card:hover {
          border-color: #d1d5db;
          background-color: #f9fafb;
          transform: translateY(-2px);
        }
        
        .category-icon {
          margin-right: 0.75rem;
          color: #3b82f6;
          flex-shrink: 0;
        }
        
        .category-info {
          flex-grow: 1;
        }
        
        .category-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }
        
        .category-description {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .documents-history {
          background-color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .history-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        .history-link {
          color: #e53e3e;
          text-decoration: none;
          font-size: 0.875rem;
        }
        
        .history-link:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .option-card {
            flex-direction: column;
          }
          
          .option-icon {
            width: 100%;
            padding: 1.5rem;
          }
          
          .categories-grid {
            grid-template-columns: 1fr;
          }
        }
        `}
      </style>
    </div>
  );
});