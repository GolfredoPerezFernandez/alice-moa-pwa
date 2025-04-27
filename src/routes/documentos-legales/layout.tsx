import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$, Link, useLocation } from '@builder.io/qwik-city';
import { LuFileText, LuHome, LuMessageSquare } from '@qwikest/icons/lucide';
import { verifyAuth, getUserType } from '~/utils/auth';

// Verificar autenticación y permisos
export const useAuthCheck = routeLoader$(async (requestEvent) => {
  console.log('[DOCUMENTOS-LEGALES] Verificando autenticación y permisos');
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = await verifyAuth(requestEvent);
  if (!isAuthenticated) {
    console.log('[DOCUMENTOS-LEGALES] Usuario no autenticado, redirigiendo a login');
    throw requestEvent.redirect(302, '/auth');
  }
  
  // Get user type from cookie
  const userType = getUserType(requestEvent);
  console.log('[DOCUMENTOS-LEGALES] User type from cookie:', userType);

  // Verificar si el usuario es de tipo despacho o sindicato
  const userIsDespachoOrSindicato = userType === 'despacho' || userType === 'sindicato';
  
  // Si no es ni despacho ni sindicato, no puede acceder a esta sección
  if (!userIsDespachoOrSindicato) {
    console.log('[DOCUMENTOS-LEGALES] User type not authorized for this section, redirecting to home');
    throw requestEvent.redirect(302, '/');
  }
  
  // Usuario autorizado
  return {
    isAuthenticated: true,
    userType: userType,
    isDespachoOrSindicato: userIsDespachoOrSindicato,
    userId: requestEvent.cookie.get('auth_token')?.value || null
  };
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