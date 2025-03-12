/**
 * main.js - Script principal focado no Theatre.js para animar o skate
 */

import { initThreeScene } from './three-setup.js';
import { initTheatre, createSequence, setupKeyframes, updateSequencePosition } from './theatre-simple.js';

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
    
    // Quando o vídeo tiver seus metadados carregados, criar a sequência
    videoElement.addEventListener('loadedmetadata', () => {
      const duration = videoElement.duration;
      console.log('Duração do vídeo:', duration);
      
      // Criar sequência com a duração do vídeo
      const sequence = createSequence(duration);
      
      // Configurar keyframes de exemplo
      setupKeyframes();
      
      // Mostrar a interface do Theatre.js
      showTheatreHelpMessage();
    });
    
    // Sincronizar o tempo do vídeo com a sequência do Theatre.js
    videoElement.addEventListener('timeupdate', () => {
      updateSequencePosition(videoElement.currentTime);
    });
    
    // Esconder a tela de carregamento
    if (loadingScreen) {
      loadingScreen.style.opacity = 0;
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
    
    // Tentar reproduzir o vídeo
    tryPlayVideo(videoElement);
    
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