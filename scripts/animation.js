/**
 * animation.js - Configuração do Theatre.js para controle de animação e timeline
 */

// Importações corretas do Theatre.js
import * as THREE from 'three';
import Studio from '@theatre/studio';
import { getProject, types } from '@theatre/core';

// Declarações iniciais - videoElement será definido depois
let videoElement;
setTimeout(() => {
  videoElement = document.getElementById('skate-video');
}, 100);

// Variáveis para Theatre.js
let project;
let mainSheet;
let sequence;

// Objetos animáveis
let videoProps;
let blurProps;
let skateModelProps;
let cameraProps;

// Timecodes específicos para a timeline (em segundos)
const TIMECODES = {
  START: 0,
  PRE_TRICK: 2,
  TRANSITION_START: 3,
  TRANSITION_MID: 3.5,
  TRANSITION_END: 4.5,
  INTERACTIVE_START: 5
};

// Inicializar Theatre.js imediatamente
let initialized = false;

/**
 * Inicializar Theatre.js
 */
async function initTheatre() {
  if (initialized) return Promise.resolve();
  
  try {
    // Inicializar o Studio do Theatre.js
    Studio.initialize();
    console.log('Theatre Studio inicializado com sucesso');
    
    // Criar projeto Theatre.js
    project = getProject('Skate 3D Experience');
    
    // Criar sheet principal
    mainSheet = project.sheet('Main Timeline');
    
    // Configurar objetos animáveis
    setupAnimatableObjects();
    
    initialized = true;
    return Promise.resolve();
  } catch (error) {
    console.error('Erro ao inicializar Theatre.js:', error);
    return Promise.reject(error);
  }
}

/**
 * Configurar objetos animáveis no Theatre.js
 */
function setupAnimatableObjects() {
  // Propriedades do vídeo
  videoProps = mainSheet.object('Video', {
    opacity: types.number(1, { range: [0, 1] }),
  });
  
  // Propriedades do efeito de blur
  blurProps = mainSheet.object('Blur Effect', {
    intensity: types.number(0, { range: [0, 30] }),
  });
  
  // Propriedades do modelo 3D do skate
  skateModelProps = mainSheet.object('3D Skate', {
    visible: types.boolean(false),
    position: {
      x: types.number(0, { range: [-10, 10] }),
      y: types.number(0, { range: [-10, 10] }),
      z: types.number(0, { range: [-10, 10] }),
    },
    rotation: {
      x: types.number(0, { range: [-Math.PI, Math.PI] }),
      y: types.number(0, { range: [-Math.PI, Math.PI] }),
      z: types.number(0, { range: [-Math.PI, Math.PI] }),
    },
    scale: types.number(0, { range: [0, 2] }),
  });
  
  // Propriedades da câmera
  cameraProps = mainSheet.object('Camera', {
    position: {
      x: types.number(0, { range: [-10, 10] }),
      y: types.number(0, { range: [-10, 10] }),
      z: types.number(5, { range: [0, 20] }),
    },
    lookAt: {
      x: types.number(0, { range: [-10, 10] }),
      y: types.number(0, { range: [-10, 10] }),
      z: types.number(0, { range: [-10, 10] }),
    },
    fov: types.number(75, { range: [30, 100] }),
  });
}

/**
 * Configurar a sequência de animação
 */
function setupSequence() {
  // Verificar se o mainSheet foi inicializado
  if (!mainSheet) {
    console.error('MainSheet não inicializado. Não é possível configurar a sequência.');
    return false;
  }
  
  try {
    // Criar sequência de animação
    sequence = mainSheet.sequence.create({ 
      name: 'Main Sequence',
      length: TIMECODES.INTERACTIVE_START + 1
    });
    
    if (!sequence) {
      console.error('Falha ao criar sequência');
      return false;
    }
    
    console.log('Sequência criada com sucesso:', sequence);
    
    // Configurar keyframes para o vídeo
    videoProps.onValuesChange((values) => {
      const videoEl = document.getElementById('skate-video');
      if (videoEl) {
        videoEl.style.opacity = values.opacity;
      }
    });
    
    // Adicionar keyframes para o vídeo
    sequence.position = 0;
    
    // Início do vídeo - 100% opaco
    videoProps.set({ opacity: 1 });
    blurProps.set({ intensity: 0 });
    skateModelProps.set({ 
      visible: false, 
      scale: 0,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    });
    
    // Pré-manobra
    sequence.position = TIMECODES.PRE_TRICK;
    videoProps.set({ opacity: 1 });
    blurProps.set({ intensity: 0 });
    
    // Início da transição - começar blur
    sequence.position = TIMECODES.TRANSITION_START;
    blurProps.set({ intensity: 5 });
    
    // Meio da transição - blur máximo, começar a aparecer o modelo 3D
    sequence.position = TIMECODES.TRANSITION_MID;
    videoProps.set({ opacity: 0.7 });
    blurProps.set({ intensity: 20 });
    skateModelProps.set({ 
      visible: true, 
      scale: 0.5,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 6, z: 0 }
    });
    
    // Fim da transição - vídeo quase invisível, modelo 3D quase totalmente visível
    sequence.position = TIMECODES.TRANSITION_END;
    videoProps.set({ opacity: 0.3 });
    blurProps.set({ intensity: 10 });
    skateModelProps.set({ 
      visible: true, 
      scale: 0.8,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 4, z: 0 }
    });
    
    // Estado interativo - vídeo invisível, modelo 3D totalmente visível
    sequence.position = TIMECODES.INTERACTIVE_START;
    videoProps.set({ opacity: 0 });
    blurProps.set({ intensity: 0 });
    skateModelProps.set({ 
      visible: true, 
      scale: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: Math.PI / 3, z: 0 }
    });
    
    // Resetar posição da sequência
    sequence.position = 0;
    
    return true;
  } catch (error) {
    console.error('Erro ao configurar sequência:', error);
    return false;
  }
}

/**
 * Atualizar a timeline baseado no tempo do vídeo
 * @param {number} currentTime - Tempo atual do vídeo em segundos
 */
function updateTimelineFromVideo(currentTime) {
  // Verificar se a sequência foi inicializada antes de tentar acessá-la
  if (!sequence) {
    console.warn('Sequência ainda não inicializada');
    return;
  }
  
  // Ajustar a posição da sequência com base no tempo do vídeo
  sequence.position = currentTime;
}

/**
 * Obter os valores atuais de uma propriedade Theatre.js
 * @param {Object} prop - Propriedade do Theatre.js
 * @returns {Object} Valores atuais da propriedade
 */
function getCurrentValues(prop) {
  return prop.value;
}

// Exportar funções e variáveis para uso em outros módulos
export {
  initTheatre,
  setupSequence,
  updateTimelineFromVideo,
  getCurrentValues,
  TIMECODES,
  videoProps,
  blurProps,
  skateModelProps,
  cameraProps
};
