/**
 * main.js - Script principal do projeto Skate 3D Experience
 * Responsável pela inicialização e coordenação de todos os módulos
 */

// Importação dos módulos da aplicação
import './animation.js';  // Apenas importar o módulo para que ele se inicialize
import { initTheatre, setupSequence } from './animation.js';
import { initVideoHandler, videoElement } from './video-handler.js';
import { initThreeScene, animateThreeScene, updateSceneSize } from './three-scene.js';
import { loadSkateModel } from './skate-model.js';
import { setupTransition } from './transition.js';

// Variáveis globais
let assetsLoaded = false;
let applicationReady = false;

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
    videoElement.play().catch(error => {
      console.error('Erro ao reproduzir vídeo:', error);
      
      // Criar botão para iniciar manualmente devido a políticas de autoplay
      const startButton = document.createElement('button');
      startButton.textContent = 'Iniciar Experiência';
      startButton.className = 'start-button';
      startButton.addEventListener('click', () => {
        videoElement.play();
        startButton.remove();
      });
      
      document.getElementById('ui-overlay').appendChild(startButton);
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

// Exportar funções e variáveis para uso em outros módulos
export {
  assetsLoaded,
  applicationReady
};
