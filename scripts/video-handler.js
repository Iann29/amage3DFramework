/**
 * video-handler.js - Controle do vídeo e eventos relacionados
 */

import { updateTimelineFromVideo, TIMECODES } from './animation.js';
import { startTransition } from './transition.js';

// Elementos do DOM - serão inicializados após o DOM estar carregado
let videoElement;
let playPauseBtn;
let progressBar;
let progressIndicator;

// Variáveis de controle
let isPlaying = false;
let progressUpdateInterval;

/**
 * Inicializar manipulador de vídeo
 */
function initVideoHandler() {
  // Obter elementos do DOM
  videoElement = document.getElementById('skate-video');
  playPauseBtn = document.getElementById('play-pause-btn');
  progressBar = document.getElementById('progress-bar');
  progressIndicator = document.getElementById('progress-indicator');
  
  if (!videoElement) {
    console.error('Elemento de vídeo não encontrado');
    return false;
  }
  
  // Configurar eventos para o vídeo
  setupVideoEvents();
  
  // Configurar controles de vídeo
  setupVideoControls();
  
  // Pré-carregar o vídeo
  preloadVideo();
  
  return true;
}

/**
 * Configurar eventos para o elemento de vídeo
 */
function setupVideoEvents() {
  // Evento de carregamento de metadados do vídeo
  videoElement.addEventListener('loadedmetadata', () => {
    console.log('Metadados do vídeo carregados. Duração:', videoElement.duration);
  });
  
  // Evento de reprodução iniciada
  videoElement.addEventListener('play', () => {
    isPlaying = true;
    updatePlayPauseButton();
    startProgressUpdate();
  });
  
  // Evento de pausa
  videoElement.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseButton();
    stopProgressUpdate();
  });
  
  // Evento de atualização de tempo
  videoElement.addEventListener('timeupdate', handleTimeUpdate);
  
  // Evento de término do vídeo
  videoElement.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayPauseButton();
    stopProgressUpdate();
  });
  
  // Evento de erro no vídeo
  videoElement.addEventListener('error', (error) => {
    console.error('Erro no vídeo:', error);
  });
}

/**
 * Configurar controles de vídeo personalizados
 */
function setupVideoControls() {
  // Botão de play/pause
  playPauseBtn.addEventListener('click', togglePlay);
  
  // Barra de progresso
  progressBar.addEventListener('click', seekVideo);
}

/**
 * Pré-carregar o vídeo
 */
function preloadVideo() {
  videoElement.load();
}

/**
 * Alternar entre reprodução e pausa do vídeo
 */
function togglePlay() {
  if (videoElement.paused || videoElement.ended) {
    videoElement.play();
  } else {
    videoElement.pause();
  }
}

/**
 * Buscar uma posição específica no vídeo
 * @param {Event} event - Evento de clique na barra de progresso
 */
function seekVideo(event) {
  const rect = progressBar.getBoundingClientRect();
  const pos = (event.clientX - rect.left) / rect.width;
  videoElement.currentTime = pos * videoElement.duration;
}

/**
 * Atualizar o botão de play/pause conforme o estado do vídeo
 */
function updatePlayPauseButton() {
  playPauseBtn.textContent = isPlaying ? '❚❚' : '▶';
  playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
}

/**
 * Iniciar atualização contínua da barra de progresso
 */
function startProgressUpdate() {
  stopProgressUpdate(); // Limpar intervalo anterior, se existir
  progressUpdateInterval = setInterval(updateProgressBar, 50);
}

/**
 * Parar atualização contínua da barra de progresso
 */
function stopProgressUpdate() {
  if (progressUpdateInterval) {
    clearInterval(progressUpdateInterval);
  }
}

/**
 * Atualizar a barra de progresso com base no tempo atual do vídeo
 */
function updateProgressBar() {
  if (!videoElement.duration) return;
  
  const progress = videoElement.currentTime / videoElement.duration;
  progressIndicator.style.width = `${progress * 100}%`;
}

/**
 * Manipular atualizações de tempo do vídeo
 */
function handleTimeUpdate() {
  // Atualizar a timeline do Theatre.js com o tempo atual do vídeo
  updateTimelineFromVideo(videoElement.currentTime);
  
  // Verificar se é o momento de iniciar a transição
  if (videoElement.currentTime >= TIMECODES.TRANSITION_START && 
      videoElement.currentTime <= TIMECODES.TRANSITION_END) {
    
    // Calcular o progresso da transição (0 a 1)
    const transitionProgress = 
      (videoElement.currentTime - TIMECODES.TRANSITION_START) / 
      (TIMECODES.TRANSITION_END - TIMECODES.TRANSITION_START);
    
    // Iniciar/atualizar a transição
    startTransition(transitionProgress);
  }
}

/**
 * Aplicar efeito de blur ao vídeo
 * @param {number} intensity - Intensidade do blur (0-30)
 */
function applyBlurEffect(intensity) {
  videoElement.style.filter = `blur(${intensity}px)`;
}

// Exportar funções e variáveis para uso em outros módulos
export {
  initVideoHandler,
  videoElement,
  togglePlay,
  seekVideo,
  applyBlurEffect
};
