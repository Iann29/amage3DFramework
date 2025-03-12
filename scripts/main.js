/**
 * main.js - Script principal do projeto Skate 3D Experience
 * Responsável pela inicialização e coordenação de todos os módulos
 */

// Importação dos módulos da aplicação
import { 
  init as initTheatreManager,
  setupSequence,
  setSequenceDuration,
  TIMECODES,
  goToTimecode,
  setupKeyframes,
  playSequence
} from './theatre-manager.js';
import { initVideoHandler, videoElement } from './video-handler.js';
import { initThreeScene, animateThreeScene, updateSceneSize, updateCameraFromProps } from './three-scene.js';
import { loadSkateModel, updateSkateModel } from './skate-model.js';

// Variáveis globais
let assetsLoaded = false;
let applicationReady = false;

// Estado global da aplicação
const appState = {
  isInitialized: false,
  modelLoaded: false,
  sceneReady: false,
  videoReady: false,
  theatreReady: false
};

/**
 * Função de inicialização principal
 */
async function init() {
  console.log('Inicializando aplicação...');
  
  // Mostrar tela de carregamento
  const loadingScreen = document.getElementById('loading-screen');
  
  try {
    // Inicializar Theatre.js
    await initTheatreManager();
    console.log('Theatre.js inicializado');
    
    // Inicializar manipulador de vídeo
    initVideoHandler();
    console.log('Manipulador de vídeo inicializado');
    
    // Inicializar cena Three.js
    const threeContainer = document.getElementById('three-container');
    if (!threeContainer) {
      console.warn('Elemento three-container não encontrado, criando um novo elemento');
      const newContainer = document.createElement('div');
      newContainer.id = 'three-container';
      newContainer.style.width = '100%';
      newContainer.style.height = '100%';
      newContainer.style.position = 'absolute';
      newContainer.style.top = '0';
      newContainer.style.left = '0';
      newContainer.style.zIndex = '1';
      document.body.appendChild(newContainer);
      await initThreeScene(newContainer);
    } else {
      await initThreeScene(threeContainer);
    }
    console.log('Cena Three.js inicializada');
    
    // Carregar modelo 3D do skate
    await loadSkateModel();
    console.log('Modelo 3D carregado');
    
    // Configurar timeline e sequência depois que o vídeo estiver pronto
    setTimeout(() => {
      // Garantir que o videoElement esteja disponível para a timeline
      if (videoElement) {
        // Configurar a sequência em Theatre.js
        const sequenceInstance = setupSequence(videoElement);
        
        // Inicializar timeline somente após a sequência estar pronta
        if (sequenceInstance) {
          console.log('Sequência configurada com sucesso');
          
          // Configurar keyframes para controlar a visibilidade do modelo
          setupKeyframes();
          console.log('Keyframes configurados na timeline');
          
          // Iniciar a sequência imediatamente para sincronizar com o vídeo
          if (videoElement.paused === false) {
            console.log('Vídeo já está em reprodução, iniciando sequência automaticamente');
            playSequence();
          }
          
          // Nota: A configuração do sistema de transição foi removida
          // A visibilidade do modelo agora será controlada diretamente 
          // pela TIMELINE conforme solicitado pelo usuário
        } else {
          console.warn('Não foi possível configurar a sequência');
        }
      } else {
        console.warn('Elemento de vídeo não disponível para configurar a timeline');
      }
    }, 500); // Pequeno delay para garantir que tudo esteja carregado
    
    // Configurar listeners de eventos
    setupEventListeners();
    
    // Esconder tela de carregamento após carregamento completo
    if (loadingScreen) {
      loadingScreen.style.opacity = 0;
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
    
    // Aplicação inicializada com sucesso
    appState.isInitialized = true;
    applicationReady = true;
    
    // Adicionar métodos públicos ao objeto window para depuração
    setupPublicAPI();
    
  } catch (error) {
    console.error('Erro durante a inicialização da aplicação:', error);
    
    // Exibir mensagem de erro amigável
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="error-message">
          <h2>Erro na inicialização</h2>
          <p>${error.message || 'Não foi possível carregar a aplicação.'}</p>
          <button onclick="location.reload()">Tentar novamente</button>
        </div>
      `;
    }
  }
}

/**
 * Configurar listeners de eventos globais
 */
function setupEventListeners() {
  // Listener para redimensionamento da janela
  window.addEventListener('resize', handleResize);
  
  // Verificar compatibilidade WebGL
  checkWebGLCompatibility();
  
  // Listener para quando a duração do vídeo estiver disponível
  document.addEventListener('video-duration-ready', (event) => {
    const videoDuration = event.detail.duration;
    console.log('Evento video-duration-ready recebido. Duração:', videoDuration);
    
    // Configurar a sequência com a duração correta do vídeo
    if (typeof setSequenceDuration === 'function') {
      setSequenceDuration(videoDuration);
      console.log('Duração da sequência atualizada automaticamente para', videoDuration);
    }
    
    // Ajustar os timecodes para a duração do vídeo
    if (typeof adjustTimecodes === 'function') {
      adjustTimecodes(videoDuration);
      console.log('Timecodes ajustados automaticamente para a duração do vídeo');
    }
  });
}

/**
 * Manipulador de evento de redimensionamento da janela
 */
function handleResize() {
  // Atualizar tamanho da cena 3D
  updateSceneSize();
}

/**
 * Verificar compatibilidade com WebGL
 */
function checkWebGLCompatibility() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      showBrowserCompatibilityWarning();
    }
  } catch (e) {
    showBrowserCompatibilityWarning();
  }
}

/**
 * Exibir aviso de compatibilidade de navegador
 */
function showBrowserCompatibilityWarning() {
  const warningElement = document.createElement('div');
  warningElement.className = 'browser-warning';
  warningElement.innerHTML = `
    <div class="warning-content">
      <h3>Aviso de Compatibilidade</h3>
      <p>Seu navegador pode não suportar totalmente WebGL, necessário para a experiência 3D.</p>
      <p>Para melhor experiência, use Google Chrome, Firefox ou Edge atualizados.</p>
      <button onclick="this.parentNode.parentNode.style.display='none'">Entendi</button>
    </div>
  `;
  
  document.body.appendChild(warningElement);
}

/**
 * Configurar API pública para depuração
 */
function setupPublicAPI() {
  // Método auxiliar para forçar a exibição do modelo
  window.forceShowModelNow = () => {
    console.log('Tentando forçar a exibição do modelo...');
    const model = document.querySelector("#three-container");
    if (model) {
      model.style.opacity = 1;
      model.style.visibility = 'visible';
      model.style.display = 'block';
      return true;
    }
    return false;
  };
  
  // Método para acessar os timecodes diretamente
  window.getTimecodes = () => TIMECODES;
  
  // Método para ir para um ponto específico da timeline
  window.goToTimecode = (timecodeKey) => {
    if (typeof goToTimecode === 'function' && TIMECODES && TIMECODES[timecodeKey]) {
      goToTimecode(timecodeKey);
      return true;
    }
    return false;
  };
  
  // Método para obter o elemento de vídeo atual
  window.getCurrentVideoElement = () => videoElement;
  
  // Expor funções de atualização para o fix do Theatre.js
  window.updateSkateModel = updateSkateModel;
  window.updateCameraFromProps = updateCameraFromProps;
  
  // Objeto centralizador para funções de atualização (para o fix)
  window.theatreUpdateFunctions = {
    updateSkateModel,
    updateCameraFromProps
  };
  
  // Para depuração direta no console do navegador
  console.log('API pública para depuração configurada. Use window.forceShowModelNow(), window.getTimecodes() etc');
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

// Exportar funções principais
export {
  init,
  appState,
  videoElement
};
