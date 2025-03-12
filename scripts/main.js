/**
 * main.js - Script principal focado no Theatre.js para animar o skate
 */

import { initThreeScene } from './three-setup.js';
import { initTheatre, updateSequencePosition, setAutoPlay, setPlaybackRate, setSmoothSync, setSmoothness } from './theatre-simple.js';

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

/**
 * Inicialização principal
 */
async function init() {
  console.log('Inicializando aplicação...');
  
  try {
    // Obter elementos do DOM
    const threeContainer = document.getElementById('three-container');
    const videoElement = document.getElementById('skate-video');
    const loadingScreen = document.getElementById('loading-screen');
    
    if (!threeContainer || !videoElement) {
      throw new Error('Elementos necessários não encontrados');
    }
    
    // Configurar o container Three.js para ser visível
    threeContainer.style.opacity = 1;
    threeContainer.style.zIndex = 2;
    
    // Configurar controles de vídeo
    setupVideoControls(videoElement);
    
    // Inicializar cena Three.js
    await initThreeScene(threeContainer);
    console.log('Cena Three.js inicializada');
    
    // Inicializar Theatre.js
    const theatre = initTheatre();
    console.log('Theatre.js inicializado');
    
    // Quando o vídeo tiver seus metadados carregados
    videoElement.addEventListener('loadedmetadata', () => {
      const duration = videoElement.duration;
      console.log('Duração do vídeo:', duration);
      
      // Apenas mostrar a mensagem de ajuda
      showTheatreHelpMessage();
    });
    
    // Adicionar event listeners para o vídeo
    setupVideoTimelinesListeners(videoElement);
    
    // Esconder a tela de carregamento
    if (loadingScreen) {
      loadingScreen.style.opacity = 0;
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
    
    // Tentar reproduzir o vídeo
    tryPlayVideo(videoElement);
    
    // Adicionar botão de controle para a timeline
    addTimelineControlButton();
    
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
    showErrorMessage(error.message);
  }
}

/**
 * Configurar controles de vídeo
 * @param {HTMLVideoElement} videoElement - Elemento de vídeo
 */
function setupVideoControls(videoElement) {
  const playPauseBtn = document.getElementById('play-pause-btn');
  const progressBar = document.getElementById('progress-bar');
  const progressIndicator = document.getElementById('progress-indicator');
  
  if (!playPauseBtn || !progressBar || !progressIndicator) return;
  
  // Botão play/pause
  playPauseBtn.addEventListener('click', () => {
    if (videoElement.paused || videoElement.ended) {
      videoElement.play();
      playPauseBtn.textContent = '❚❚';
    } else {
      videoElement.pause();
      playPauseBtn.textContent = '▶';
    }
  });
  
  // Atualizar barra de progresso
  videoElement.addEventListener('timeupdate', () => {
    if (videoElement.duration) {
      const progress = videoElement.currentTime / videoElement.duration;
      progressIndicator.style.width = `${progress * 100}%`;
    }
  });
  
  // Clique na barra de progresso
  progressBar.addEventListener('click', (event) => {
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    videoElement.currentTime = pos * videoElement.duration;
  });
}

/**
 * Tentar reproduzir o vídeo
 * @param {HTMLVideoElement} videoElement - Elemento de vídeo
 */
function tryPlayVideo(videoElement) {
  videoElement.muted = true; // Para permitir autoplay em mais navegadores
  videoElement.play().catch(error => {
    console.warn('Autoplay bloqueado:', error);
    
    // Criar botão grande para iniciar o vídeo
    const playButton = document.createElement('button');
    playButton.textContent = '▶';
    playButton.style.position = 'absolute';
    playButton.style.top = '50%';
    playButton.style.left = '50%';
    playButton.style.transform = 'translate(-50%, -50%)';
    playButton.style.fontSize = '48px';
    playButton.style.background = 'rgba(0,0,0,0.6)';
    playButton.style.color = 'white';
    playButton.style.width = '80px';
    playButton.style.height = '80px';
    playButton.style.borderRadius = '50%';
    playButton.style.border = 'none';
    playButton.style.cursor = 'pointer';
    playButton.style.zIndex = '1000';
    
    playButton.addEventListener('click', () => {
      videoElement.play().then(() => {
        playButton.remove();
      }).catch(e => console.error('Erro ao iniciar vídeo:', e));
    });
    
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      videoContainer.appendChild(playButton);
    }
  });
}

/**
 * Mostrar mensagem de ajuda para o Theatre.js
 */
function showTheatreHelpMessage() {
  const helpMessage = document.createElement('div');
  helpMessage.style.position = 'fixed';
  helpMessage.style.top = '10px';
  helpMessage.style.left = '10px';
  helpMessage.style.background = 'rgba(0,0,0,0.7)';
  helpMessage.style.color = 'white';
  helpMessage.style.padding = '10px';
  helpMessage.style.borderRadius = '5px';
  helpMessage.style.zIndex = '1000';
  helpMessage.style.maxWidth = '300px';
  helpMessage.style.fontFamily = 'Arial, sans-serif';
  
  helpMessage.innerHTML = `
    <h3>Theatre.js está pronto!</h3>
    <p>Use o painel do Theatre.js para animar o modelo 3D do skate.</p>
    <p>Ajuste posição, rotação e escala enquanto o vídeo é reproduzido.</p>
    <p>A animação está sincronizada com o tempo do vídeo.</p>
    <button id="close-help" style="background:#f44336; border:none; color:white; padding:5px 10px; margin-top:10px; cursor:pointer;">Fechar</button>
  `;
  
  document.body.appendChild(helpMessage);
  
  document.getElementById('close-help').addEventListener('click', () => {
    helpMessage.remove();
  });
}

/**
 * Mostrar mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showErrorMessage(message) {
  const errorElement = document.createElement('div');
  errorElement.style.position = 'fixed';
  errorElement.style.top = '50%';
  errorElement.style.left = '50%';
  errorElement.style.transform = 'translate(-50%, -50%)';
  errorElement.style.background = 'rgba(255,0,0,0.8)';
  errorElement.style.color = 'white';
  errorElement.style.padding = '20px';
  errorElement.style.borderRadius = '5px';
  errorElement.style.zIndex = '9999';
  
  errorElement.innerHTML = `
    <h3>Erro!</h3>
    <p>${message}</p>
    <button onclick="location.reload()" style="background:white; color:black; border:none; padding:5px 10px; margin-top:10px; cursor:pointer;">Tentar novamente</button>
  `;
  
  document.body.appendChild(errorElement);
}

/**
 * Configurar listeners para gerenciar a sincronização do vídeo com a timeline
 */
function setupVideoTimelinesListeners(videoElement) {
  // Quando o vídeo começa a rodar, manter a timeline em sincronização suave
  videoElement.addEventListener('play', () => {
    console.log('Vídeo iniciou, ativando sincronização suave com o vídeo');
    // Forçar sincronização inicial exata
    updateSequencePosition(
      videoElement.currentTime, 
      true, 
      true, 
      videoElement.playbackRate
    );
    // Desativar reprodução automática própria durante a reprodução do vídeo
    setAutoPlay(false);
  });
  
  // Quando o vídeo é pausado, ativar autoplay da timeline (animação independente)
  videoElement.addEventListener('pause', () => {
    console.log('Vídeo pausado, ativando animação independente da timeline');
    // Informar que o vídeo está pausado
    updateSequencePosition(
      videoElement.currentTime, 
      false, 
      false, 
      videoElement.playbackRate
    );
    setAutoPlay(true);
  });
  
  // Durante a reprodução do vídeo, atualizar o tempo alvo para interpolação suave
  videoElement.addEventListener('timeupdate', () => {
    // Atualizar o tempo alvo (sem forçar posição imediata)
    // Passar o status de reprodução do vídeo e sua taxa de reprodução
    updateSequencePosition(
      videoElement.currentTime, 
      false, 
      !videoElement.paused, 
      videoElement.playbackRate
    );
  });
  
  // Quando o usuário navega no vídeo (seek), forçar sincronização imediata
  videoElement.addEventListener('seeking', () => {
    console.log('Usuário navegou no vídeo, sincronizando imediatamente');
    updateSequencePosition(
      videoElement.currentTime, 
      true, 
      !videoElement.paused, 
      videoElement.playbackRate
    );
  });
  
  // Adicionar listener para mudanças na taxa de reprodução do vídeo
  videoElement.addEventListener('ratechange', () => {
    console.log(`Taxa de reprodução do vídeo alterada para ${videoElement.playbackRate}x`);
    updateSequencePosition(
      videoElement.currentTime, 
      false, 
      !videoElement.paused, 
      videoElement.playbackRate
    );
  });
}

/**
 * Adicionar botão para controlar a reprodução automática da timeline
 */
function addTimelineControlButton() {
  // Botão para controlar modo automático
  const timelineButton = document.createElement('button');
  timelineButton.textContent = '⏱️ Timeline Auto';
  timelineButton.style.position = 'fixed';
  timelineButton.style.bottom = '130px';
  timelineButton.style.right = '20px';
  timelineButton.style.padding = '10px';
  timelineButton.style.background = '#1E88E5';
  timelineButton.style.color = 'white';
  timelineButton.style.border = 'none';
  timelineButton.style.borderRadius = '4px';
  timelineButton.style.zIndex = '9999';
  
  let autoPlayActive = true;
  
  timelineButton.addEventListener('click', () => {
    autoPlayActive = !autoPlayActive;
    setAutoPlay(autoPlayActive);
    timelineButton.style.background = autoPlayActive ? '#1E88E5' : '#757575';
    timelineButton.textContent = autoPlayActive ? '⏱️ Timeline Auto (ON)' : '⏱️ Timeline Auto (OFF)';
  });
  
  document.body.appendChild(timelineButton);
  
  // Botão para controlar velocidade
  const speedButton = document.createElement('button');
  speedButton.textContent = '🚀 Velocidade 1x';
  speedButton.style.position = 'fixed';
  speedButton.style.bottom = '180px';
  speedButton.style.right = '20px';
  speedButton.style.padding = '10px';
  speedButton.style.background = '#4CAF50';
  speedButton.style.color = 'white';
  speedButton.style.border = 'none';
  speedButton.style.borderRadius = '4px';
  speedButton.style.zIndex = '9999';
  
  const speeds = [0.5, 1, 2, 3];
  let currentSpeedIndex = 1;
  
  speedButton.addEventListener('click', () => {
    currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
    const newSpeed = speeds[currentSpeedIndex];
    setPlaybackRate(newSpeed);
    speedButton.textContent = `🚀 Velocidade ${newSpeed}x`;
  });
  
  document.body.appendChild(speedButton);
  
  // Botão para controlar o modo de sincronização
  const syncButton = document.createElement('button');
  syncButton.textContent = '🔄 Sync Suave (ON)';
  syncButton.style.position = 'fixed';
  syncButton.style.bottom = '230px';
  syncButton.style.right = '20px';
  syncButton.style.padding = '10px';
  syncButton.style.background = '#FF9800';
  syncButton.style.color = 'white';
  syncButton.style.border = 'none';
  syncButton.style.borderRadius = '4px';
  syncButton.style.zIndex = '9999';
  
  let smoothSyncActive = true;
  
  syncButton.addEventListener('click', () => {
    smoothSyncActive = !smoothSyncActive;
    setSmoothSync(smoothSyncActive);
    syncButton.style.background = smoothSyncActive ? '#FF9800' : '#757575';
    syncButton.textContent = smoothSyncActive ? '🔄 Sync Suave (ON)' : '🔄 Sync Suave (OFF)';
  });
  
  document.body.appendChild(syncButton);
  
  // Botão para controlar o nível de suavidade da interpolação
  const smoothnessButton = document.createElement('button');
  smoothnessButton.textContent = '🧈 Suavidade: Normal';
  smoothnessButton.style.position = 'fixed';
  smoothnessButton.style.bottom = '280px';
  smoothnessButton.style.right = '20px';
  smoothnessButton.style.padding = '10px';
  smoothnessButton.style.background = '#9C27B0';
  smoothnessButton.style.color = 'white';
  smoothnessButton.style.border = 'none';
  smoothnessButton.style.borderRadius = '4px';
  smoothnessButton.style.zIndex = '9999';
  
  const smoothnessLabels = ['Preciso', 'Normal', 'Super Suave'];
  let currentSmoothnessLevel = 2; // Começa com o nível 2 (equilibrado)
  
  smoothnessButton.addEventListener('click', () => {
    // Ciclar entre os níveis 1, 2 e 3
    currentSmoothnessLevel = (currentSmoothnessLevel % 3) + 1;
    setSmoothness(currentSmoothnessLevel);
    
    // Atualizar o texto do botão
    smoothnessButton.textContent = `🧈 Suavidade: ${smoothnessLabels[currentSmoothnessLevel - 1]}`;
  });
  
  document.body.appendChild(smoothnessButton);
}

// Adicionar botão de depuração
setTimeout(() => {
  const debugButton = document.createElement('button');
  debugButton.textContent = 'Debug Theatre';
  debugButton.style.position = 'fixed';
  debugButton.style.bottom = '70px';
  debugButton.style.right = '20px';
  debugButton.style.padding = '10px';
  debugButton.style.background = 'blue';
  debugButton.style.color = 'white';
  debugButton.style.border = 'none';
  debugButton.style.borderRadius = '4px';
  debugButton.style.zIndex = '9999';
  
  debugButton.addEventListener('click', () => {
    console.log('==== DEBUG THEATRE.JS ====');
    console.log('Projeto:', project);
    console.log('Sheet:', sheet);
    console.log('Sequence:', sequence);
    console.log('SkateObj:', skateObj);
    console.log('Modelo 3D:', window.skateModel);
    
    if (sequence) {
      console.log('Posição atual da sequência:', sequence.position);
      
      // Tente forçar uma animação
      sequence.position = 0;
      setTimeout(() => {
        sequence.position = 2;
        console.log('Forçado posição da sequência para 2s');
      }, 1000);
    }
  });
  
  document.body.appendChild(debugButton);
}, 3000);