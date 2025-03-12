/**
 * video-handler.js - Controle do vídeo e eventos relacionados
 * Agora com responsabilidades mais específicas após refatoração
 */

import { handleTimeUpdate, init as initVideoSync } from './video-sync.js';
import { playSequence, pauseSequence, goToTimecode, updateTimelineFromVideo } from './theatre-manager.js';

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
  
  // Inicializar sincronização de vídeo
  initVideoSync(videoElement, videoState);
  
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
    
    // Notificar que a duração do vídeo está disponível (para uso em outros módulos)
    const event = new CustomEvent('video-duration-ready', {
      detail: { duration: videoState.duration }
    });
    document.dispatchEvent(event);
  });
  
  // Evento de reprodução iniciada
  videoElement.addEventListener('play', () => {
    isPlaying = true;
    videoState.isBuffering = false;
    updatePlayPauseButton();
    startProgressUpdate();
    
    // Iniciar também a sequência do Theatre.js quando o vídeo começar
    try {
      console.log('🎬 Vídeo iniciado - Tentando sincronizar timeline automaticamente');
      playSequence({
        rate: videoElement.playbackRate, // Usar mesma velocidade de reprodução do vídeo
      });
      
      // Forçar a posição da timeline para corresponder ao vídeo
      if (typeof updateTimelineFromVideo === 'function') {
        updateTimelineFromVideo(videoElement.currentTime);
        console.log('🔄 Timeline sincronizada com tempo do vídeo:', videoElement.currentTime);
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar timeline com vídeo:', error);
    }
    
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
    
    // Pausar também a sequência do Theatre.js quando o vídeo for pausado
    pauseSequence();
    console.log('⏸️ Vídeo pausado - Timeline pausada automaticamente');
    
    // Atualizar o estado do vídeo
    videoState.currentTime = videoElement.currentTime;
    videoState.progress = calculateProgress(videoState.currentTime);
    updateVideoUI();
    
    // Garantir que os controles estejam visíveis
    showVideoControls();
  });
  
  // Evento de atualização de tempo
  videoElement.addEventListener('timeupdate', () => {
    // Atualizar o estado do vídeo internamente
    videoState.currentTime = videoElement.currentTime;
    videoState.progress = calculateProgress(videoState.currentTime);
    
    // Atualizar interface do vídeo
    updateProgressBar(videoState.progress);
    
    // Delegar para o módulo de sincronização
    handleTimeUpdate();
  });
  
  // Evento de término do vídeo
  videoElement.addEventListener('ended', () => {
    isPlaying = false;
    videoState.currentTime = videoState.duration;
    videoState.progress = 1;
    updatePlayPauseButton();
    stopProgressUpdate();
    updateVideoUI();
    
    // Pausar a sequência do Theatre.js e resetar para o início
    pauseSequence();
    // Voltar para o início da timeline
    if (typeof goToTimecode === 'function') {
      goToTimecode('START');
    }
    console.log('🔄 Vídeo terminado - Timeline reiniciada');
    
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
  if (!videoElement) return;
  
  // Garantir que o vídeo está visível com CSS
  videoElement.style.display = 'block';
  videoElement.style.opacity = '1';
  
  // Forçar o preload do vídeo
  videoElement.preload = 'auto';
  videoElement.muted = true; // Vídeos mutados têm maior chance de autoplay
  videoElement.playsInline = true; // Necessário para iOS
  
  // Se o vídeo já tiver metadados carregados, continuar com a inicialização
  if (videoElement.readyState >= 2) {
    console.log('Vídeo já carregado, prosseguindo com inicialização e autoplay');
    
    // Tentar reproduzir o vídeo automaticamente
    setTimeout(() => {
      videoElement.play()
        .then(() => console.log('✅ Autoplay do vídeo iniciado com sucesso'))
        .catch(error => {
          console.warn('⚠️ Erro ao reproduzir vídeo automaticamente:', error);
          // Mostrar um botão de play para interação do usuário
          showPlayButton();
        });
    }, 1000); // Pequeno delay para garantir que tudo esteja carregado
  } else {
    // Tentar carregar novamente
    videoElement.load();
    console.log('Forçando carregamento do vídeo');
    
    // Adicionar evento para tentar reproduzir quando estiver pronto
    videoElement.addEventListener('canplaythrough', () => {
      videoElement.play()
        .then(() => console.log('✅ Autoplay do vídeo iniciado após carregamento'))
        .catch(error => console.warn('⚠️ Erro ao reproduzir vídeo após carregamento:', error));
    }, { once: true }); // once: true garante que o evento só será disparado uma vez
  }
}

/**
 * Mostrar um botão de play grande no centro da tela
 * Usado quando o autoplay falha (comum em dispositivos móveis)
 */
function showPlayButton() {
  // Verificar se já existe um botão
  if (document.getElementById('big-play-button')) return;
  
  const button = document.createElement('button');
  button.id = 'big-play-button';
  button.innerHTML = '▶️';
  button.style.position = 'absolute';
  button.style.left = '50%';
  button.style.top = '50%';
  button.style.transform = 'translate(-50%, -50%)';
  button.style.fontSize = '5rem';
  button.style.background = 'rgba(0,0,0,0.5)';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '50%';
  button.style.width = '100px';
  button.style.height = '100px';
  button.style.cursor = 'pointer';
  button.style.zIndex = '1000';
  
  button.addEventListener('click', () => {
    videoElement.play()
      .then(() => {
        button.remove();
      })
      .catch(error => console.error('Erro ao reproduzir vídeo após clique:', error));
  });
  
  const videoContainer = document.getElementById('video-container');
  if (videoContainer) {
    videoContainer.appendChild(button);
  } else {
    document.body.appendChild(button);
  }
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
  // Reduzir a frequência de atualização para melhorar desempenho (de 50ms para 100ms)
  progressUpdateInterval = setInterval(() => {
    updateProgressBar(calculateProgress(videoElement.currentTime));
  }, 100);
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
function updateProgressBar(progress) {
  if (!videoElement || videoElement.duration <= 0) return;
  
  // Atualizar o estado do vídeo
  videoState.currentTime = videoElement.currentTime;
  videoState.progress = progress || calculateProgress(videoState.currentTime);
  videoState.lastUpdateTime = Date.now();
  
  // Atualizar a interface
  updateVideoUI();
}

/**
 * Definir o tempo do vídeo diretamente
 * @param {number} time - Tempo em segundos para definir o vídeo
 */
function setVideoTime(time) {
  if (!videoElement) return;
  
  // Limitar o tempo dentro da duração do vídeo
  const clampedTime = Math.max(0, Math.min(time, videoState.duration || 0));
  
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
  if (!videoElement) return;
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
  showVideoControls,
  showPlayButton
};
