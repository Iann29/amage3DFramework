/**
 * video-sync.js - Gerenciamento da sincronização entre vídeo e timeline
 * Separa a lógica de sincronização do manipulador de vídeo para melhorar manutenabilidade
 */

import { updateTimelineFromVideo, TIMECODES } from './theatre-manager.js';
import { setSkateModelVisible } from './skate-model.js';

// Variáveis para controlar a frequência de atualização
let lastTimelineUpdate = 0;
const TIMELINE_UPDATE_INTERVAL = 500; // Intervalo em ms para reduzir sobrecarga

// Elemento de vídeo e estado
let videoElement;
let videoState;

/**
 * Inicializar sincronização de vídeo
 * @param {HTMLVideoElement} videoEl - Elemento de vídeo
 * @param {Object} state - Estado do vídeo
 */
function init(videoEl, state) {
  videoElement = videoEl;
  videoState = state;
}

/**
 * Manipular evento de atualização de tempo do vídeo
 * Esta função é chamada pelo evento 'timeupdate' do vídeo
 */
function handleTimeUpdate() {
  if (!videoElement) return;
  
  try {
    // Atualizar timeline somente em intervalos definidos para reduzir carga de processamento
    const now = Date.now();
    if (now - lastTimelineUpdate >= TIMELINE_UPDATE_INTERVAL) {
      lastTimelineUpdate = now;
      
      // Atualizar posição da timeline
      updateTimelineFromVideo(videoElement.currentTime);
      
      // Verificar estado de transição e visibilidade dos modelos
      checkTransitionState(videoElement.currentTime);
    }
  } catch (error) {
    console.warn('Erro ao sincronizar vídeo com timeline:', error);
  }
}

/**
 * Verificar o estado de transição e visibilidade dos modelos
 * @param {number} currentTime - Tempo atual do vídeo em segundos
 */
function checkTransitionState(currentTime) {
  if (!TIMECODES) return;
  
  // Verificar se estamos na transição
  if (currentTime >= TIMECODES.TRANSITION_START && 
      currentTime <= TIMECODES.TRANSITION_END) {
    
    // Calcular o progresso da transição (0 a 1)
    const transitionProgress = 
      (currentTime - TIMECODES.TRANSITION_START) / 
      (TIMECODES.TRANSITION_END - TIMECODES.TRANSITION_START);
    
    // Nota: A lógica de transição agora é controlada pela Timeline e Theatre.js
    // e não mais pelo módulo transition.js que foi removido
  }
  
  // Garantir que o modelo esteja visível após a transição
  if (currentTime >= TIMECODES.TRANSITION_MID) {
    forceShowModel();
  }
}

/**
 * Forçar a exibição do modelo 3D
 */
function forceShowModel() {
  try {
    // Garantir que o modelo de skate esteja visível
    setSkateModelVisible(true);
    
    // Tornar o container 3D visível também
    const threeContainer = document.getElementById('three-container');
    if (threeContainer) {
      threeContainer.style.opacity = '1';
      threeContainer.style.visibility = 'visible';
      threeContainer.style.display = 'block';
      console.log('Container Three.js forçado a ficar visível');
    }
    
    return true;
  } catch (error) {
    console.warn('Erro ao forçar a exibição do modelo:', error);
    return false;
  }
}

/**
 * Definir o tempo do vídeo diretamente e sincronizar timeline
 * @param {number} time - Tempo em segundos para definir o vídeo
 */
function setVideoTimeAndSync(time) {
  if (!videoElement || !videoState) return;
  
  try {
    // Definir o tempo no elemento de vídeo
    videoElement.currentTime = time;
    
    // Atualizar a timeline
    updateTimelineFromVideo(time);
    
    return true;
  } catch (error) {
    console.error('Erro ao definir tempo do vídeo e sincronizar:', error);
    return false;
  }
}

// Adicionar ao objeto window para acesso global
window.forceShowModel = forceShowModel;

// Exportar funções
export {
  init,
  handleTimeUpdate,
  checkTransitionState,
  setVideoTimeAndSync,
  forceShowModel
};
