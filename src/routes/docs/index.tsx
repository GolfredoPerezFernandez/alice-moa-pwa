import { component$, useSignal, useStylesScoped$, useVisibleTask$, $ } from '@builder.io/qwik';
// Custom icon components since @qwikest/icons has undefined components
interface IconProps {
  class?: string;
}

const CodeIcon = component$<IconProps>(({ class: className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className || "w-5 h-5"}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
));

const ShieldIcon = component$<IconProps>(({ class: className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className || "w-5 h-5"}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
));

const ChartIcon = component$<IconProps>(({ class: className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className || "w-5 h-5"}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
));

const CreditCardIcon = component$<IconProps>(({ class: className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className || "w-5 h-5"}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
));

const BuildingIcon = component$<IconProps>(({ class: className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className || "w-5 h-5"}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="6" x2="15" y2="6" />
    <line x1="9" y1="10" x2="15" y2="10" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </svg>
));

const LockIcon = component$<IconProps>(({ class: className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className || "w-5 h-5"}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
));

const DatabaseIcon = component$<IconProps>(({ class: className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className || "w-5 h-5"}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
));

const LeftIcon = component$<IconProps>(({ class: className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className || "w-5 h-5"}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
));

const RightIcon = component$<IconProps>(({ class: className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={className || "w-5 h-5"}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
));

export default component$(() => {
  useStylesScoped$(/* css */`
    .code-block {
      @apply bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6 overflow-x-auto font-mono text-sm;
      position: relative;
    }
    
    .copy-button {
      @apply absolute top-2 right-2 p-2 bg-indigo-500 text-white rounded opacity-0 transition-opacity;
    }
    
    .code-block:hover .copy-button {
      @apply opacity-100;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
      animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .tab {
      @apply px-4 py-2 text-gray-600 dark:text-gray-400 cursor-pointer transition-colors;
    }
    
    .tab.active {
      @apply text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 font-medium;
    }
    
    .section {
      @apply opacity-0;
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      transform: translateY(20px);
    }
    
    .section.visible {
      @apply opacity-100;
      transform: translateY(0);
    }
    
    .toc-link {
      @apply block py-2 px-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors;
    }
    
    .diagram-box {
      @apply border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 relative;
      min-height: 100px;
    }
    
    .diagram-arrow {
      @apply absolute border-t-2 border-indigo-300 dark:border-indigo-700;
      width: 40px;
      transform: translateY(-50%);
    }
    
    .diagram-arrow::after {
      content: '';
      @apply absolute h-3 w-3 border-t-2 border-r-2 border-indigo-300 dark:border-indigo-700 transform rotate-45;
      right: -1px;
      top: -7px;
    }
    
    .snippet-tag {
      @apply inline-flex text-xs font-medium px-2 py-1 rounded-md;
    }
    
    .animated-bg {
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
    }
    
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .toc-link.active {
      @apply bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium;
    }
  `);

  // Signals for active tab and sections visibility
  const activeTab = useSignal('architecture');
  const activeTocItem = useSignal('arch-overview');
  
  // References for intersection observer
  const section1Ref = useSignal<Element>();
  const section2Ref = useSignal<Element>();
  const section3Ref = useSignal<Element>();
  
  // Function to set active tab
  const setActiveTab = $((tab: string) => {
    activeTab.value = tab;
  });
  
  // Function to set active TOC item and scroll to section
  const setActiveTocItem = $((item: string) => {
    activeTocItem.value = item;
    const element = document.getElementById(item);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Hook for intersection observer
  useVisibleTask$(() => {
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });
    
    // Observe all sections with class 'section'
    document.querySelectorAll('.section').forEach(section => {
      observer.observe(section);
    });
    
    // Set up copy code functionality
    document.querySelectorAll('.copy-button').forEach(button => {
      button.addEventListener('click', () => {
        const codeBlock = button.parentElement?.querySelector('pre')?.textContent;
        if (codeBlock) {
          navigator.clipboard.writeText(codeBlock)
            .then(() => {
              const originalText = button.textContent;
              button.textContent = '✓ Copiado';
              setTimeout(() => {
                button.textContent = originalText;
              }, 2000);
            })
            .catch(err => {
              console.error('Error al copiar el código:', err);
            });
        }
      });
    });
    
    return () => {
      observer.disconnect(); // Clean up
    };
  });

  return (
    <div class="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Hero header */}
      <div class="bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-16 px-4">
        <div class="max-w-5xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-extrabold mb-4">Documentación Técnica</h1>
          <p class="text-xl text-indigo-100 max-w-3xl">
            Guía completa de la plataforma TokenEstate para desarrolladores, arquitectos y usuarios técnicos
          </p>
        </div>
      </div>
      
      {/* Main content area with sidebar */}
      <div class="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        {/* Left sidebar (TOC) - Fixed on desktop */}
        <div class="md:w-64 flex-shrink-0">
          <div class="sticky top-8">
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
              <h3 class="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">Contenido</h3>
              <nav class="space-y-1">
                <a 
                  href="#arch-overview" 
                  class={`toc-link ${activeTocItem.value === 'arch-overview' ? 'active' : ''}`}
                  onClick$={() => setActiveTocItem('arch-overview')}
                >
                  Arquitectura
                </a>
                <a 
                  href="#system-layers" 
                  class={`toc-link ${activeTocItem.value === 'system-layers' ? 'active' : ''}`}
                  onClick$={() => setActiveTocItem('system-layers')}
                >
                  Capas del Sistema
                </a>
                <a 
                  href="#smart-contracts" 
                  class={`toc-link ${activeTocItem.value === 'smart-contracts' ? 'active' : ''}`}
                  onClick$={() => setActiveTocItem('smart-contracts')}
                >
                  Contratos Inteligentes
                </a>
                <a 
                  href="#security" 
                  class={`toc-link ${activeTocItem.value === 'security' ? 'active' : ''}`}
                  onClick$={() => setActiveTocItem('security')}
                >
                  Seguridad y Auditoría
                </a>
                <a 
                  href="#timeline" 
                  class={`toc-link ${activeTocItem.value === 'timeline' ? 'active' : ''}`}
                  onClick$={() => setActiveTocItem('timeline')}
                >
                  Cronograma
                </a>
              </nav>
            </div>
            
            <div class="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <h3 class="font-semibold text-lg mb-3 text-indigo-800 dark:text-indigo-300">Recursos</h3>
              <ul class="space-y-2 text-sm">
                <li>
                  <a href="#" class="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                    <span class="mr-2">📄</span> Whitepaper técnico
                  </a>
                </li>
                <li>
                  <a href="#" class="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                    <span class="mr-2">💻</span> Repositorio de código
                  </a>
                </li>
                <li>
                  <a href="#" class="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                    <span class="mr-2">🧪</span> Testnet Demo
                  </a>
                </li>
                <li>
                  <a href="#" class="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                    <span class="mr-2">💬</span> Canal de Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div class="flex-1">
          {/* Tabs */}
          <div class="border-b border-gray-200 dark:border-gray-700 mb-8">
            <div class="flex">
              <button 
                class={`tab ${activeTab.value === 'architecture' ? 'active' : ''}`}
                onClick$={() => setActiveTab('architecture')}
              >
                Arquitectura
              </button>
              <button 
                class={`tab ${activeTab.value === 'contracts' ? 'active' : ''}`}
                onClick$={() => setActiveTab('contracts')}
              >
                Contratos
              </button>
              <button 
                class={`tab ${activeTab.value === 'security' ? 'active' : ''}`}
                onClick$={() => setActiveTab('security')}
              >
                Seguridad
              </button>
              <button 
                class={`tab ${activeTab.value === 'implementation' ? 'active' : ''}`}
                onClick$={() => setActiveTab('implementation')}
              >
                Implementación
              </button>
            </div>
          </div>
          
          {/* Tab content: Architecture */}
          <div class={`tab-content ${activeTab.value === 'architecture' ? 'active' : ''}`}>
            <section id="arch-overview" class="mb-12 section" ref={section1Ref}>
              <h2 class="text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300">
                Arquitectura del Sistema
              </h2>
              
              <p class="text-gray-700 dark:text-gray-300 mb-6">
                La plataforma TokenEstate está diseñada con una arquitectura modular y escalable que permite la tokenización, 
                comercialización y gestión de propiedades inmobiliarias a través de tecnología blockchain. Esta sección describe 
                la arquitectura general y los componentes clave del sistema.
              </p>
              
              <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Componentes Principales</h3>
                
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 class="font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400">Frontend</h4>
                    <ul class="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                      <li>Aplicación web desarrollada con Qwik y React</li>
                      <li>Interfaz para usuarios, propietarios y administradores</li>
                      <li>Integración con billeteras Web3</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 class="font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400">Blockchain</h4>
                    <ul class="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                      <li>Implementado sobre red EVM-compatible</li>
                      <li>Smart Contracts para tokens NFT (propiedades)</li>
                      <li>Smart Contracts para tokens KNRT (pagos)</li>
                    </ul>
                  </div>
                  
                  <div class="border border-gray-100 dark:border-gray-700 p-4 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                    <h4 class="font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center">
                      <DatabaseIcon class="w-5 h-5 mr-2" />
                      Backend
                    </h4>
                    <ul class="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                      <li>API REST para metadatos y funciones auxiliares</li>
                      <li>Base de datos SQL para información no-blockchain</li>
                      <li>Servicios de autenticación y verificación</li>
                    </ul>
                    <div class="snippet-tag bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                      TursoDb & Node.js
                    </div>
                  </div>
                  
                  <div class="border border-gray-100 dark:border-gray-700 p-4 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                    <h4 class="font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center">
                      <CodeIcon class="w-5 h-5 mr-2" />
                      Integración
                    </h4>
                    <ul class="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                      <li>Oráculos blockchain (Chainlink)</li>
                      <li>IPFS para almacenamiento descentralizado</li>
                      <li>Servicios KYC y verificación legal</li>
                    </ul>
                    <div class="snippet-tag bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                      Integraciones API
                    </div>
                  </div>
                </div>
                
                <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <h4 class="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Tecnologías Clave
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium">Solidity</span>
                    <span class="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium">Qwik.js</span>
                    <span class="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium">ERC721</span>
                    <span class="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium">ERC20</span>
                    <span class="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium">IPFS</span>
                    <span class="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full text-xs font-medium">TursoDb</span>
                  </div>
                </div>
              </div>
              
              <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Flujo de Datos</h3>
                
                <p class="text-gray-700 dark:text-gray-300 mb-4">
                  El flujo de datos entre los componentes del sistema sigue un patrón de comunicación asíncrono con 
                  verificaciones en múltiples niveles para garantizar la integridad y consistencia:
                </p>
                
                <ol class="list-decimal pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>Solicitud de usuario</strong>: Iniciada desde la interfaz frontend</li>
                  <li><strong>Validación local</strong>: Verificación preliminar en el cliente</li>
                  <li><strong>API Backend</strong>: Procesamiento y preparación de transacciones</li>
                  <li><strong>Firma de transacción</strong>: Usuario firma con su billetera Web3</li>
                  <li><strong>Procesamiento blockchain</strong>: Transacción procesada por smart contracts</li>
                  <li><strong>Confirmación</strong>: Resultados verificados y notificados al usuario</li>
                </ol>
              </div>
            </section>
            
            <section id="system-layers" class="mb-12 section" ref={section2Ref}>
              <h2 class="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300">
                Capas del Sistema
              </h2>
              
              <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">1. Capa de Blockchain</h3>
                <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4">
                  <p class="text-gray-700 dark:text-gray-300">
                    <span class="font-medium">Red:</span> Ethereum o red EVM-compatible (como Base) para optimizar costos de transacción.
                  </p>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-4">
                  Esta capa proporciona la infraestructura descentralizada sobre la que se ejecutan los contratos inteligentes. 
                  Se accede a través de nodos RPC y se monitorea mediante servicios de indexación para un rendimiento óptimo.
                </p>
              </div>
              
              <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">2. Capa de Smart Contracts</h3>
                <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4">
                  <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                    <li><span class="font-medium">Contrato ERC721:</span> Tokenización y registro de inmuebles.</li>
                    <li><span class="font-medium">Contrato ERC20:</span> Gestión del token de pago KNRT.</li>
                    <li><span class="font-medium">Contrato Marketplace:</span> Listado, compra/venta y transferencia de NFTs.</li>
                    <li><span class="font-medium">Contrato de Alquiler:</span> Gestión de contratos de arrendamiento.</li>
                    <li><span class="font-medium">Contrato de Escrow:</span> Bloqueo y liberación de tokens según condiciones.</li>
                  </ul>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-4">
                  Los contratos inteligentes están implementados en Solidity v0.8.22 o superior, con un enfoque en la 
                  seguridad, eficiencia de gas y facilidad de actualización. Siguen patrones establecidos como proxy 
                  actualizable y control de acceso basado en roles.
                </p>
              </div>
              
              <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">3. Capa de Interfaz de Usuario</h3>
                <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4">
                  <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                    <li><span class="font-medium">Frontend:</span> Aplicación web desarrollada en Qwik.js</li>
                    <li><span class="font-medium">Integración Web3:</span> Ethers.js para interactuar con la blockchain</li>
                  </ul>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-4">
                  La interfaz de usuario está diseñada para ser intuitiva y responsiva, con soporte para múltiples 
                  billeteras y optimización para dispositivos móviles y de escritorio. Implementa principios de 
                  diseño centrado en el usuario y accesibilidad.
                </p>
              </div>
              
              <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">4. Capa de Backend</h3>
                <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4">
                  <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                    <li><span class="font-medium">Servidores:</span> Node.js para API y servicios auxiliares</li>
                    <li><span class="font-medium">Base de datos:</span> SQL para almacenamiento estructurado</li>
                    <li><span class="font-medium">IPFS:</span> Almacenamiento descentralizado para metadatos</li>
                  </ul>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-4">
                  La capa de backend gestiona operaciones que requieren procesamiento fuera de la cadena, como 
                  la generación de metadatos, el almacenamiento de documentos legales y la indexación para búsquedas 
                  eficientes de propiedades.
                </p>
              </div>
              
              <div>
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">5. Integraciones Adicionales</h3>
                <div class="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4">
                  <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                    <li><span class="font-medium">Oráculos:</span> Chainlink para validar condiciones externas</li>
                    <li><span class="font-medium">KYC/AML:</span> Servicios de verificación de identidad</li>
                    <li><span class="font-medium">Pasarelas de Pago:</span> Integración fiat-cripto (opcional)</li>
                  </ul>
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-4">
                  Estas integraciones extienden la funcionalidad del sistema, permitiendo una conexión 
                  segura con sistemas externos y cumplimiento de requisitos regulatorios.
                </p>
              </div>
            </section>
            
            <section id="smart-contracts" class="mb-12 section" ref={section3Ref}>
              <h2 class="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300">
                Contratos Inteligentes
              </h2>
              
              <p class="text-gray-700 dark:text-gray-300 mb-6">
                Los contratos inteligentes son el núcleo de la plataforma TokenEstate, proporcionando la lógica de negocio 
                descentralizada que permite la tokenización y gestión de propiedades inmobiliarias. Están desarrollados 
                en Solidity y siguen las mejores prácticas de seguridad y optimización.
              </p>
              
              <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                  <CodeIcon class="w-5 h-5 mr-2 text-indigo-500" />
                  Estructura de Contratos
                </h3>
                
                <div class="grid md:grid-cols-2 gap-6 mb-6">
                  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <h4 class="font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400">PropertyNFT.sol</h4>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      Contrato ERC721 para tokenización de propiedades inmobiliarias
                    </p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                      <li>Registro de propiedades con metadatos</li>
                      <li>Sistema de verificación de autenticidad</li>
                      <li>Actualización controlada de metadatos</li>
                    </ul>
                  </div>
                  
                  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                    <h4 class="font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center">
                      <CreditCardIcon class="w-4 h-4 mr-2" /> KNRT.sol
                    </h4>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      Token ERC20 utilizado para pagos en la plataforma
                    </p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                      <li>Transferencias con permisos específicos</li>
                      <li>Funciones de congelamiento para escrow</li>
                      <li>Controles anti-inflación</li>
                    </ul>
                  </div>
                  
                  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                    <h4 class="font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center">
                      <LockIcon class="w-4 h-4 mr-2" /> Marketplace.sol
                    </h4>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      Facilita la compra/venta de PropertyNFTs
                    </p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                      <li>Listado de propiedades con precios</li>
                      <li>Funciones de oferta y contraoferta</li>
                      <li>Comisiones configurables</li>
                    </ul>
                  </div>
                  
                  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                    <h4 class="font-medium text-lg mb-2 text-indigo-700 dark:text-indigo-400 flex items-center">
                      <BuildingIcon class="w-4 h-4 mr-2" /> RentalManager.sol
                    </h4>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      Gestión de contratos de alquiler para propiedades
                    </p>
                    <ul class="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                      <li>Creación de acuerdos de arrendamiento</li>
                      <li>Programación de pagos periódicos</li>
                      <li>Gestión de disputas y terminación</li>
                    </ul>
                  </div>
                </div>
                
                <div class="mb-8">
                  <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                    <CodeIcon class="w-5 h-5 mr-2 text-indigo-500" />
                    Ejemplo de Código: PropertyNFT.sol
                  </h3>
                  <div class="code-block">
                    <button class="copy-button">Copiar</button>
                    <pre>{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PropertyNFT
 * @dev ERC721 token representing unique real estate properties.
 * Metadata URI should point to detailed property information (potentially on IPFS).
 */
contract PropertyNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, AccessControl, ERC721Burnable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant METADATA_UPDATER_ROLE = keccak256("METADATA_UPDATER_ROLE");

    uint256 private _nextTokenId;

    // --- Events ---
    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event TokenMetadataUpdated(uint256 indexed tokenId, string newUri);

    // Funciones y lógica contractual...
}`}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Próximos Pasos para Despliegue</h3>
                  <ol class="list-decimal pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2">
                    <li>Despliegue de tokens ERC721 para representación de propiedades.</li>
                    <li>Despliegue del token KNRT (ERC20) para pagos en la plataforma.</li>
                    <li>Despliegue de contrato RentalEscrow para gestión de garantías.</li>
                    <li>Despliegue de Marketplace para compra/venta de propiedades.</li>
                    <li>Configuración de roles y permisos en cada contrato.</li>
                    <li>Auditoría de seguridad completa antes del lanzamiento en mainnet.</li>
                  </ol>
                </div>
              </div>
            </section>
            
            <section id="security" class="mb-12">
              <h2 class="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300">
                Seguridad y Auditoría
              </h2>
              
              <p class="text-gray-700 dark:text-gray-300 mb-6">
                La seguridad es una prioridad crítica en la plataforma TokenEstate. Se implementan múltiples capas de 
                seguridad y procesos de auditoría rigurosos para proteger los activos y datos de los usuarios.
              </p>
              
              <div class="grid md:grid-cols-2 gap-6 mb-8">
                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md">
                  <h3 class="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Seguridad de Smart Contracts</h3>
                  <ul class="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Auditorías por firmas especializadas</li>
                    <li>Tests de penetración y análisis estático</li>
                    <li>Control de acceso basado en roles</li>
                    <li>Patrones de diseño seguros (Checks-Effects-Interactions)</li>
                    <li>Implementación gradual con pausas de emergencia</li>
                  </ul>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md">
                  <h3 class="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Seguridad de Aplicación</h3>
                  <ul class="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Autenticación multifactor</li>
                    <li>Conexiones cifradas (HTTPS/TLS)</li>
                    <li>Validación de entradas en frontend y backend</li>
                    <li>Protección contra ataques comunes (XSS, CSRF)</li>
                    <li>Monitoreo y alertas en tiempo real</li>
                  </ul>
                </div>
              </div>
              
              <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Proceso de Auditoría</h3>
                <ol class="list-decimal pl-5 mb-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li><strong>Auditoría Interna:</strong> Revisión de código por el equipo de desarrollo.</li>
                  <li><strong>Auditoría Comunitaria:</strong> Programa de recompensas para encontrar vulnerabilidades.</li>
                  <li><strong>Auditoría Profesional:</strong> Contratación de firmas especializadas en seguridad blockchain.</li>
                  <li><strong>Testnet Público:</strong> Despliegue en redes de prueba para validación amplia.</li>
                  <li><strong>Despliegue Mainnet:</strong> Lanzamiento progresivo con límites y monitoreo continuo.</li>
                </ol>
              </div>
              
              <div>
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Gestión de Riesgos</h3>
                <div class="overflow-x-auto">
                  <table class="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead>
                      <tr class="bg-gray-50 dark:bg-gray-700 text-left">
                        <th class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200">Escenario</th>
                        <th class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200">Medidas de Mitigación</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">Impago de alquiler</td>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">Garantías en escrow, ejecución automática por contrato</td>
                      </tr>
                      <tr>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">Disputa contractual</td>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">Sistema de resolución con árbitros designados</td>
                      </tr>
                      <tr>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">Fallo en oráculo</td>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">Múltiples fuentes de datos, mecanismo de fallback</td>
                      </tr>
                      <tr>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">Vulnerabilidad en contrato</td>
                        <td class="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">Pausa de emergencia, actualizaciones por proxy</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
            
            <section id="timeline" class="mb-12">
              <h2 class="text-2xl font-bold mb-6 text-indigo-800 dark:text-indigo-300">
                Cronograma y Estimación de Tiempos
              </h2>
              
              <p class="text-gray-700 dark:text-gray-300 mb-6">
                El desarrollo e implementación de la plataforma TokenEstate seguirá un enfoque iterativo, con fases 
                bien definidas y entregables específicos para cada etapa.
              </p>
              
              <div class="overflow-x-auto mb-8">
                <table class="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <thead>
                    <tr class="bg-indigo-50 dark:bg-indigo-900/30">
                      <th class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300">Fase</th>
                      <th class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300">Actividades</th>
                      <th class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-left font-semibold text-indigo-800 dark:text-indigo-300">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200">1. Diseño y Planificación</td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        Arquitectura, especificaciones técnicas, planificación de sprints
                      </td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">2 - 3 semanas</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200">2. Desarrollo de Smart Contracts</td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        Implementación, pruebas unitarias, auditoría interna
                      </td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">8 - 12 semanas</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200">3. Desarrollo Frontend/Backend</td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        Interfaz de usuario, API, integración Web3
                      </td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">4 - 6 semanas</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200">4. Integración y Testing</td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        Pruebas de integración, testnet público
                      </td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">2 - 3 semanas</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200">5. Auditoría de Seguridad</td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        Auditoría externa, correcciones, validación final
                      </td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">3 - 4 semanas</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200">6. Despliegue y Launch</td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                        Mainnet, monitoreo, lanzamiento público
                      </td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">1 semana</td>
                    </tr>
                    <tr class="bg-indigo-50 dark:bg-indigo-900/20">
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200">Total Estimado</td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700"></td>
                      <td class="py-3 px-4 border-b border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200">20 - 29 semanas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Hitos Clave</h3>
                <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><span class="font-medium">MVP en Testnet:</span> Semana 14 - Funcionalidades básicas operativas</li>
                  <li><span class="font-medium">Beta Pública:</span> Semana 18 - Versión preliminar para testers seleccionados</li>
                  <li><span class="font-medium">Auditoría Completa:</span> Semana 24 - Finalización de auditorías de seguridad</li>
                  <li><span class="font-medium">Launch en Mainnet:</span> Semana 26-29 - Despliegue en red principal</li>
                </ul>
              </div>
            </section>
          </div>
          
          {/* Tab Content: Contracts */}
          <div class={`tab-content ${activeTab.value === 'contracts' ? 'active' : ''}`}>
            <h2 class="text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300">
              Contratos Inteligentes
            </h2>
            {/* Contenido para la pestaña de Contratos */}
          </div>
          
          {/* Tab Content: Security */}
          <div class={`tab-content ${activeTab.value === 'security' ? 'active' : ''}`}>
            <h2 class="text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300">
              Seguridad y Auditoría
            </h2>
            {/* Contenido para la pestaña de Seguridad */}
          </div>
          
          {/* Tab Content: Implementation */}
          <div class={`tab-content ${activeTab.value === 'implementation' ? 'active' : ''}`}>
            <h2 class="text-3xl font-bold mb-6 text-indigo-800 dark:text-indigo-300">
              Implementación y Despliegue
            </h2>
            {/* Contenido para la pestaña de Implementación */}
          </div>
          
          {/* Page navigation */}
          <div class="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <a href="/about" class="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Volver a la Información General
            </a>
            <a href="/marketplace" class="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
              Explorar Marketplace
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});