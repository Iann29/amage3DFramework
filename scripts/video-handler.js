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

// Estado do vídeo
let videoState = {
  currentTime: 0,
  duration: 0,
  progress: 0,
  lastUpdateTime: 0,
  isBuffering: false,
  volume: 1,
  playbackRate: 1
};

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
    videoState.duration = videoElement.duration;
    console.log('Metadados do vídeo carregados. Duração:', videoState.duration);
    
    // Atualizar interface com a duração
    updateVideoUI();
    
    // Garantir que os controles de vídeo estejam visíveis e interativos
    ensureVideoControlsInteractivity();
    
    // Forçar exibição dos controles
    showVideoControls();
  });
  
  // Evento de reprodução iniciada
  videoElement.addEventListener('play', () => {
    isPlaying = true;
    videoState.isBuffering = false;
    updatePlayPauseButton();
    startProgressUpdate();
    
    // Garantir interatividade dos controles
    ensureVideoControlsInteractivity();
    
    // Forçar exibição dos controles
    showVideoControls();
  });
  
  // Evento de pausa
  videoElement.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseButton();
    stopProgressUpdate();
    
    // Atualizar o estado do vídeo
    videoState.currentTime = videoElement.currentTime;
    videoState.progress = calculateProgress(videoState.currentTime);
    updateVideoUI();
    
    // Garantir que os controles estejam visíveis
    showVideoControls();
  });
  
  // Evento de atualização de tempo
  videoElement.addEventListener('timeupdate', handleTimeUpdate);
  
  // Evento de término do vídeo
  videoElement.addEventListener('ended', () => {
    isPlaying = false;
    videoState.currentTime = videoState.duration;
    videoState.progress = 1;
    updatePlayPauseButton();
    stopProgressUpdate();
    updateVideoUI();
    
    // Mostrar controles no final do vídeo
    showVideoControls();
  });
  
  // Evento de buffering
  videoElement.addEventListener('waiting', () => {
    videoState.isBuffering = true;
    updateVideoUI();
  });
  
  // Evento de pronto para reproduzir
  videoElement.addEventListener('canplay', () => {
    videoState.isBuffering = false;
    updateVideoUI();
  });
  
  // Evento de erro no vídeo
  videoElement.addEventListener('error', (error) => {
    console.error('Erro no vídeo:', error);
  });
  
  // Evento de alteração de taxa de reprodução
  videoElement.addEventListener('ratechange', () => {
    videoState.playbackRate = videoElement.playbackRate;
  });
}

/**
 * Configurar controles de vídeo personalizados
 */
function setupVideoControls() {
  // Botão de play/pause
  playPauseBtn.addEventListener('click', togglePlay);
  
  // Barra de progresso - Clique para buscar posição
  progressBar.addEventListener('click', seekVideo);
  
  // Barra de progresso - Arraste para buscar posição
  let isDragging = false;
  progressBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    seekVideo(e);
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      seekVideo(e);
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
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
 * Calcular progresso baseado no tempo atual e duração
 * @param {number} currentTime - Tempo atual em segundos
 * @returns {number} Progresso entre 0 e 1
 */
function calculateProgress(currentTime) {
  return videoState.duration > 0 ? currentTime / videoState.duration : 0;
}

/**
 * Atualizar a interface do usuário com base no estado do vídeo
 */
function updateVideoUI() {
  // Atualizar indicador de progresso
  if (progressIndicator) {
    progressIndicator.style.width = `${videoState.progress * 100}%`;
  }
  
  // Atualizar botão de play/pause
  updatePlayPauseButton();
  
  // Atualizar outros elementos de UI, se necessário
  if (videoState.isBuffering) {
    // Poderia mostrar um indicador de buffer
  }
}

/**
 * Buscar uma posição específica no vídeo
 * @param {Event} event - Evento de clique/arraste na barra de progresso
 */
function seekVideo(event) {
  // Obter a posição relativa do clique na barra de progresso
  const rect = progressBar.getBoundingClientRect();
  const clickPos = (event.clientX - rect.left) / rect.width;
  
  // Limitar entre 0 e 1
  const progress = Math.max(0, Math.min(1, clickPos));
  
  // Calcular o tempo baseado no progresso
  const seekTime = progress * videoState.duration;
  
  // Atualizar o elemento de vídeo
  videoElement.currentTime = seekTime;
  
  // Atualizar o estado do vídeo
  videoState.currentTime = seekTime;
  videoState.progress = progress;
  
  // Atualizar a UI
  updateVideoUI();
  
  // Atualizar a timeline do Theatre.js
  updateTimelineFromVideo(seekTime);
}

/**
 * Atualizar o botão de play/pause conforme o estado do vídeo
 */
function updatePlayPauseButton() {
  if (playPauseBtn) {
    playPauseBtn.textContent = isPlaying ? '❚❚' : '▶';
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  }
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
  if (!videoElement || videoElement.duration <= 0) return;
  
  // Atualizar o estado do vídeo
  videoState.currentTime = videoElement.currentTime;
  videoState.progress = calculateProgress(videoState.currentTime);
  videoState.lastUpdateTime = Date.now();
  
  // Atualizar a interface
  updateVideoUI();
}

/**
 * Manipular atualizações de tempo do vídeo
 */
function handleTimeUpdate() {
  // Atualizar o estado do vídeo
  videoState.currentTime = videoElement.currentTime;
  videoState.progress = calculateProgress(videoState.currentTime);
  
  console.log("Tempo do vídeo atualizado:", videoState.currentTime);
  
  // Atualizar a timeline do Theatre.js com o tempo atual do vídeo
  updateTimelineFromVideo(videoState.currentTime);
  
  // Atualizar a interface do usuário
  updateVideoUI();
  
  // Garantir que o modelo do skate esteja sempre visível, independentemente do tempo do vídeo
  if (typeof window.forceShowModel === 'function') {
    window.forceShowModel();
  }
  
  // Verificar se é o momento de iniciar a transição
  if (videoState.currentTime >= TIMECODES.TRANSITION_START && 
      videoState.currentTime <= TIMECODES.TRANSITION_END) {
    
    // Calcular o progresso da transição (0 a 1)
    const transitionProgress = 
      (videoState.currentTime - TIMECODES.TRANSITION_START) / 
      (TIMECODES.TRANSITION_END - TIMECODES.TRANSITION_START);
    
    // Iniciar/atualizar a transição
    startTransition(transitionProgress);
  }
}

/**
 * Definir o tempo do vídeo diretamente
 * @param {number} time - Tempo em segundos para definir o vídeo
 */
function setVideoTime(time) {
  if (!videoElement) return;
  
  // Limitar o tempo dentro da duração do vídeo
  const clampedTime = Math.max(0, Math.min(time, videoState.duration));
  
  // Definir o tempo no elemento de vídeo
  videoElement.currentTime = clampedTime;
  
  // Atualizar o estado do vídeo
  videoState.currentTime = clampedTime;
  videoState.progress = calculateProgress(clampedTime);
  
  // Atualizar a interface
  updateVideoUI();
}

/**
 * Obter o estado atual do vídeo
 * @returns {Object} Estado atual do vídeo
 */
function getVideoState() {
  return { ...videoState };
}

/**
 * Aplicar efeito de blur ao vídeo
 * @param {number} intensity - Intensidade do blur (0-30)
 */
function applyBlurEffect(intensity) {
  videoElement.style.filter = `blur(${intensity}px)`;
}

/**
 * Garantir que os controles de vídeo estejam interativos
 */
function ensureVideoControlsInteractivity() {
  // Garantir que o container de vídeo possa receber eventos
  const videoContainer = document.getElementById('video-container');
  if (videoContainer) {
    videoContainer.style.pointerEvents = 'auto';
  }
  
  // Garantir que os controles estejam acima da cena 3D e sejam interativos
  const videoControls = document.getElementById('video-controls');
  if (videoControls) {
    videoControls.style.zIndex = 10;
    videoControls.style.pointerEvents = 'auto';
  }
}

/**
 * Forçar a exibição dos controles de vídeo
 */
function showVideoControls() {
  const videoControls = document.getElementById('video-controls');
  if (videoControls) {
    videoControls.style.opacity = '1';
    videoControls.style.zIndex = '100';
    videoControls.style.pointerEvents = 'auto';
    
    // Garantir que o container também permita eventos de mouse
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      videoContainer.style.pointerEvents = 'auto';
    }
  }
}

// Exportar funções e variáveis para uso em outros módulos
export {
  initVideoHandler,
  videoElement,
  togglePlay,
  seekVideo,
  setVideoTime,
  getVideoState,
  applyBlurEffect,
  ensureVideoControlsInteractivity,
  showVideoControls
};
