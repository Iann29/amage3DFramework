/**
 * main.js - Script principal do projeto Skate 3D Experience
 * Responsável pela inicialização e coordenação de todos os módulos
 */

// Importação dos módulos da aplicação
import './animation.js';  // Apenas importar o módulo para que ele se inicialize
import { initTheatre, setupSequence, TIMECODES } from './animation.js';
import { initVideoHandler, videoElement, ensureVideoControlsInteractivity, getVideoState, setVideoTime, showVideoControls } from './video-handler.js';
import { initThreeScene, animateThreeScene, updateSceneSize, getSceneObject, scene, initScene, setupSceneInteractivity } from './three-scene.js';
import { loadSkateModel, setSkateModelVisible } from './skate-model.js';
import { setupTransition } from './transition.js';

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
    await initTheatre();
    console.log('Theatre.js inicializado');
    
    // Inicializar manipulador de vídeo
    initVideoHandler();
    console.log('Manipulador de vídeo inicializado');
    
    // Inicializar cena Three.js
    initThreeScene();
    console.log('Cena Three.js inicializada');
    
    // Carregar modelo 3D do skate
    await loadSkateModel();
    console.log('Modelo 3D carregado');
    
    // Configurar sequência e timeline
    setupSequence();
    console.log('Sequência configurada');
    
    // Configurar sistema de transição
    setupTransition();
    console.log('Sistema de transição configurado');
    
    // Configurar listeners de eventos
    setupEventListeners();
    
    // Marcar aplicação como pronta
    assetsLoaded = true;
    applicationReady = true;
    
    // Esconder tela de carregamento depois de tudo carregado
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 1000);
    
    // Iniciar o vídeo automaticamente
    startExperience();
    
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
    showErrorMessage('Ocorreu um erro ao carregar a experiência. Por favor, recarregue a página.');
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
}

/**
 * Lidar com redimensionamento da janela
 */
function handleResize() {
  // Atualizar dimensões da cena Three.js
  // NÃO dispare outro evento 'resize' para evitar recursão infinita
  if (typeof updateSceneSize === 'function') {
    updateSceneSize();
  }
}

/**
 * Verificar compatibilidade com WebGL
 */
function checkWebGLCompatibility() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      showErrorMessage('Seu navegador não suporta WebGL, necessário para esta experiência.');
    }
  } catch (e) {
    showErrorMessage('Ocorreu um erro ao verificar compatibilidade com WebGL.');
  }
}

/**
 * Exibir mensagem de erro na interface
 * @param {string} message - Mensagem de erro a ser exibida
 */
function showErrorMessage(message) {
  const loadingScreen = document.getElementById('loading-screen');
  const loader = loadingScreen.querySelector('.loader');
  
  if (loader) {
    loader.remove();
  }
  
  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-message';
  errorMessage.textContent = message;
  
  loadingScreen.appendChild(errorMessage);
  loadingScreen.classList.remove('hidden');
  loadingScreen.classList.remove('fade-out');
}

/**
 * Iniciar a experiência
 */
function startExperience() {
  if (applicationReady) {
    // Forçar a visibilidade do modelo antes de iniciar o vídeo
    forceShowModel();
    
    // Garantir que os controles de vídeo funcionem
    ensureVideoControlsInteractivity();
    
    // Mostrar controles de vídeo
    showVideoControls();
    
    videoElement.play().catch(error => {
      console.error('Erro ao reproduzir vídeo:', error);
      
      // Criar botão para iniciar manualmente devido a políticas de autoplay
      const startButton = document.createElement('button');
      startButton.textContent = 'Iniciar Experiência';
      startButton.className = 'start-button';
      startButton.addEventListener('click', () => {
        videoElement.play();
        // Forçar novamente a exibição do modelo quando o usuário clicar no botão
        forceShowModel();
        // Garantir interatividade dos controles
        ensureVideoControlsInteractivity();
        // Mostrar controles de vídeo novamente
        showVideoControls();
        startButton.remove();
      });
      
      document.getElementById('ui-overlay').appendChild(startButton);
    });
    
    // Adicionar um listener para garantir que o modelo seja exibido quando o vídeo começar
    videoElement.addEventListener('playing', () => {
      forceShowModel();
      ensureVideoControlsInteractivity();
      showVideoControls();
    });
  }
}

// Iniciar a aplicação quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', init);

// Loop de animação principal
function animate() {
  requestAnimationFrame(animate);
  
  if (applicationReady) {
    // Animar cena Three.js
    animateThreeScene();
  }
}

// Iniciar loop de animação
animate();

/**
 * Função de debugging para forçar a visibilidade do modelo
 * Pode ser chamada no console do navegador com: window.forceShowModel()
 */
function forceShowModel() {
  console.log('Tentando forçar a exibição do modelo...');
  const skateModel = getSceneObject('skateModel');
  if (skateModel) {
    // Forçar visibilidade
    skateModel.visible = true;
    
    // Ajustar posição e rotação exatamente como no Theatre.js
    skateModel.position.set(0.887, 0, 0);
    skateModel.rotation.set(0.239, 0, 0);
    
    // Ajustar escala exata
    const exactScale = 0.08860759493670611;
    skateModel.scale.set(exactScale, exactScale, exactScale);
    
    console.log('Modelo forçado a ficar visível:', skateModel);
    
    // Forçar container a ficar visível e garantir fundo transparente
    const threeContainer = document.getElementById('three-container');
    if (threeContainer) {
      threeContainer.style.opacity = 1;
      threeContainer.style.pointerEvents = 'all';
      threeContainer.style.zIndex = 2;
      threeContainer.style.backgroundColor = 'transparent';
    }
    
    // Garantir que a cena tenha fundo transparente
    if (typeof scene !== 'undefined' && scene) {
      scene.background = null;
    }
    
    // Garantir que o vídeo esteja visível e com controles funcionais
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      videoContainer.style.opacity = 1;
      videoContainer.style.zIndex = 1;
      videoContainer.style.pointerEvents = 'auto';
      
      // Garantir que os controles de vídeo fiquem acima de tudo
      const videoControls = document.getElementById('video-controls');
      if (videoControls) {
        videoControls.style.zIndex = 10;
        videoControls.style.pointerEvents = 'auto';
      }
    }
    
    return true;
  } else {
    console.error('Modelo não encontrado na cena');
    return false;
  }
}

// Expor função ao escopo global para poder chamar no console
window.forceShowModel = forceShowModel;

/**
 * Pular diretamente para o estado interativo
 * Isso pula a animação/sequência e vai direto para o estado onde o modelo 3D é interativo
 */
function skipToInteractive() {
  if (!appState.isInitialized) return;
  
  // Definir o tempo do vídeo para o ponto em que a interatividade começa
  setVideoTime(TIMECODES.INTERACTIVE_START);
  
  // Forçar a exibição do modelo
  forceShowModel();
  
  // Mostrar dicas de interação
  showInteractionHints();
  
  console.log('Pulando para estado interativo');
}

/**
 * Obter o estado atual da aplicação
 * @returns {Object} Estado atual da aplicação
 */
function getAppState() {
  return {
    ...appState,
    videoState: getVideoState(),
  };
}

/**
 * Ocultar tela de carregamento
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    
    // Remover completamente após a animação terminar
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

/**
 * Mostrar dicas de interação
 */
function showInteractionHints() {
  const hints = document.getElementById('interaction-hints');
  if (hints) {
    hints.classList.remove('hidden');
    
    // Ocultar após alguns segundos
    setTimeout(() => {
      hints.classList.add('hidden');
    }, 5000);
  }
}

// Exportar funções e variáveis para uso em outros módulos
export {
  assetsLoaded,
  applicationReady,
  forceShowModel,
  skipToInteractive,
  getAppState
};