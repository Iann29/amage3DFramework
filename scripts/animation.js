/**
 * animation.js - Configuração do Theatre.js para controle de animação e timeline
 */

// Importações corretas do Theatre.js
import * as THREE from 'three';
import Studio from '@theatre/studio';
import { getProject, types } from '@theatre/core';
import { setSkateModelVisible } from './skate-model.js';

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
  // Verificar se o projeto e mainSheet foram inicializados
  if (!project || !mainSheet) {
    console.error('Projeto ou MainSheet não inicializado. Não é possível configurar a sequência.');
    return false;
  }
  
  try {
    // A sequência já existe como uma propriedade do mainSheet
    // Não precisamos criar - apenas acessar
    sequence = mainSheet.sequence;
    
    if (!sequence) {
      console.error('Falha ao acessar sequência do mainSheet');
      return false;
    }
    
    console.log('Sequência acessada com sucesso:', sequence);
    
    // Configurar propriedades da sequência
    sequence.length = TIMECODES.INTERACTIVE_START + 1;
    
    // Configurar keyframes usando o Studio para criar transações
    Studio.transaction(({ set }) => {
      // Início do vídeo - 100% opaco
      sequence.position = 0;
      set(videoProps.props.opacity, 1);
      set(blurProps.props.intensity, 0);
      if (skateModelProps) {
        set(skateModelProps.props.visible, false);
        set(skateModelProps.props.scale, 0);
      }
      
      // Início da transição - começar blur
      sequence.position = TIMECODES.TRANSITION_START;
      set(blurProps.props.intensity, 5);
      
      // Meio da transição - blur máximo, começar a aparecer o modelo 3D
      sequence.position = TIMECODES.TRANSITION_MID;
      set(videoProps.props.opacity, 0.7);
      set(blurProps.props.intensity, 20);
      if (skateModelProps) {
        set(skateModelProps.props.visible, true);
        set(skateModelProps.props.scale, 2);
      }
      
      // Fim da transição - vídeo quase invisível, modelo 3D totalmente visível
      sequence.position = TIMECODES.TRANSITION_END;
      set(videoProps.props.opacity, 0.3);
      set(blurProps.props.intensity, 10);
      if (skateModelProps) {
        set(skateModelProps.props.visible, true);
        set(skateModelProps.props.scale, 3);
      }
      
      // Estado interativo - vídeo invisível, modelo 3D totalmente visível
      sequence.position = TIMECODES.INTERACTIVE_START;
      set(videoProps.props.opacity, 0);
      set(blurProps.props.intensity, 0);
      if (skateModelProps) {
        set(skateModelProps.props.visible, true);
        set(skateModelProps.props.scale, 3);
      }
    });
    
    // Resetar posição da sequência
    sequence.position = 0;
    
    return true;
  } catch (error) {
    console.error('Erro ao configurar sequência:', error);
    // Se ainda temos erro, usar nossa solução alternativa
    setSkateModelVisible(true);
    return false;
  }
}

/**
 * Atualizar a timeline baseado no tempo do vídeo
 * @param {number} currentTime - Tempo atual do vídeo em segundos
 */
function updateTimelineFromVideo(currentTime) {
  if (!sequence) {
    console.warn('Sequência ainda não inicializada');
    
    // Se não temos sequência mas o vídeo chegou ao ponto de transição,
    // forçar a exibição do modelo diretamente
    if (currentTime >= TIMECODES.TRANSITION_START) {
      console.log('Ativando modelo diretamente via tempo de vídeo:', currentTime);
      setSkateModelVisible(true);
    }
    return;
  }
  
  try {
    // Atualizar posição da sequência com base no tempo do vídeo
    sequence.position = currentTime;
    
    // Ativar visibilidade do modelo quando chegamos ao ponto de transição
    // Isso serve como backup caso a animação do Theatre.js não funcione
    if (currentTime >= TIMECODES.TRANSITION_MID) {
      setSkateModelVisible(true);
    }
  } catch (error) {
    console.error('Erro ao atualizar timeline:', error);
    
    // Em caso de erro, ativar o modelo diretamente se estamos no tempo correto
    if (currentTime >= TIMECODES.TRANSITION_START) {
      setSkateModelVisible(true);
    }
  }
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
