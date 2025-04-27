import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$, Link, useLocation } from '@builder.io/qwik-city';
import { LuFileText, LuHome, LuMessageSquare } from '@qwikest/icons/lucide';

// Verificar autenticación y permisos
export const useAuthCheck = routeLoader$(async ({ cookie, redirect }) => {
  const authToken = cookie.get('auth_token')?.value;
  
  // Para simplificar durante el desarrollo, hacemos que la verificación sea más flexible
  // En una aplicación real, esto debería ser más estricto
  
  try {
    // Si hay un token, verificamos el tipo de usuario (despacho o sindicato)
    if (authToken) {
      // Para este ejemplo, asumimos que cualquier usuario autenticado
      // puede ser despacho o sindicato
      // En un caso real, aquí verificaríamos en la BD el tipo de usuario
      
      // Para compatibilidad con la lógica existente, simular tipos basados en el token
      // Si el token comienza con d_ es despacho, si comienza con s_ es sindicato
      const isDespacho = authToken.startsWith('d_') || true; // Temporalmente permitimos todos
      const isSindicato = authToken.startsWith('s_') || false;
      
      return {
        isAuthenticated: true,
        isDespacho,
        isSindicato,
        userId: authToken
      };
    }
    
    // Si no hay token de autenticación, por ahora retornamos un usuario de prueba
    // En producción esto debería redirigir a login
    console.log("Sin token de autenticación: creando usuario de prueba");
    return {
      isAuthenticated: true,
      isDespacho: true,
      isSindicato: false,
      userId: "test_user"
    };
    
  } catch (error) {
    // Si hay algún error en la verificación, creamos un usuario de prueba
    console.error("Error al verificar permisos:", error);
    return {
      isAuthenticated: true,
      isDespacho: true,
      isSindicato: false,
      userId: "error_user"
    };
  }
});

export default component$(() => {
  const location = useLocation();
  const currentPath = location.url.pathname;
  
  // Lista de enlaces de navegación
  const navLinks = [
    { 
      href: '/documentos-legales/', 
      label: 'Inicio', 
      icon: LuHome,
      active: currentPath === '/documentos-legales/' 
    },
    { 
      href: '/documentos-legales/asistente/', 
      label: 'Asistente IA', 
      icon: LuMessageSquare,
      active: currentPath.includes('/documentos-legales/asistente/') 
    },
    { 
      href: '/documentos-legales/mis-documentos/', 
      label: 'Mis Documentos', 
      icon: LuFileText,
      active: currentPath.includes('/documentos-legales/mis-documentos/') 
    }
  ];
  
  return (
    <div class="documentos-legal-layout">
      <header class="layout-header">
        <div class="header-content">
          <h1 class="site-title">Sistema Legal</h1>
          
          <nav class="site-nav">
            <ul class="nav-list">
              {navLinks.map((link) => (
                <li key={link.href} class={`nav-item ${link.active ? 'active' : ''}`}>
                  <Link href={link.href} class="nav-link">
                    <link.icon class="nav-icon" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      
      <main class="layout-main">
        <Slot />
      </main>
      
      <style>
        {`
        .documentos-legal-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #f9fafb;
        }
        
        .layout-header {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem;
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .site-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
        }
        
        .site-nav {
          margin-left: auto;
        }
        
        .nav-list {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 1rem;
        }
        
        .nav-item {
          position: relative;
        }
        
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -0.75rem;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #e53e3e;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #6b7280;
          font-weight: 500;
          padding: 0.5rem;
          border-radius: 0.25rem;
          transition: color 0.2s;
        }
        
        .nav-item.active .nav-link {
          color: #e53e3e;
        }
        
        .nav-link:hover {
          color: #111827;
        }
        
        .nav-icon {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .layout-main {
          flex: 1;
          padding: 1rem;
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .site-nav {
            width: 100%;
            margin-left: 0;
          }
          
          .nav-list {
            justify-content: space-between;
          }
        }
        `}
      </style>
    </div>
  );
});