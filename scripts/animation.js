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

// Adicionar função para criar um botão de toggle para o Studio
function createTheatreToggleButton() {
  // Verificar se o botão já existe
  if (document.getElementById('theatre-toggle-btn')) return;
  
  // Criar o botão
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'theatre-toggle-btn';
  toggleBtn.innerHTML = 'Minimizar Theatre.js';
  toggleBtn.style.position = 'fixed';
  toggleBtn.style.bottom = '20px';
  toggleBtn.style.right = '20px';
  toggleBtn.style.zIndex = '9999';
  toggleBtn.style.padding = '8px 12px';
  toggleBtn.style.backgroundColor = '#2196F3';
  toggleBtn.style.color = 'white';
  toggleBtn.style.border = 'none';
  toggleBtn.style.borderRadius = '4px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.fontFamily = 'Arial, sans-serif';
  toggleBtn.style.fontSize = '14px';
  
  // Estado de visibilidade
  let isVisible = true;
  
  // Função para alternar visibilidade
  const toggleStudio = () => {
    if (isVisible) {
      Studio.ui.hide();
      toggleBtn.innerHTML = 'Mostrar Theatre.js';
    } else {
      Studio.ui.restore();
      toggleBtn.innerHTML = 'Minimizar Theatre.js';
    }
    isVisible = !isVisible;
  };
  
  // Adicionar evento de clique
  toggleBtn.addEventListener('click', toggleStudio);
  
  // Adicionar o botão ao body
  document.body.appendChild(toggleBtn);
}

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
    
    // Criar botão para minimizar/maximizar o painel do Theatre.js
    setTimeout(() => {
      createTheatreToggleButton();
    }, 1000); // Pequeno delay para garantir que o Theatre.js já foi carregado
    
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
    visible: types.boolean(true),
    position: {
      x: types.number(0.887, { range: [-10, 10] }),
      y: types.number(0, { range: [-10, 10] }),
      z: types.number(0, { range: [-10, 10] }),
    },
    rotation: {
      x: types.number(0.239, { range: [-Math.PI, Math.PI] }),
      y: types.number(0, { range: [-Math.PI, Math.PI] }),
      z: types.number(0, { range: [-Math.PI, Math.PI] }),
    },
    scale: types.number(0.08860759493670611, { range: [0, 5] }),
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
  if (!mainSheet) {
    console.error('mainSheet não está inicializado');
    return false;
  }
  
  try {
    // Criar sequência sem o audio attachment (erro)
    sequence = mainSheet.sequence;
    
    // Definir duração manualmente em vez de usar play
    if (videoElement && videoElement.duration) {
      sequence.duration = videoElement.duration;
    } else {
      // Fallback - definir duração igual aos timecodes
      sequence.duration = TIMECODES.INTERACTIVE_START + 2;
    }
    
    // Configurar keyframes para cada objeto
    Studio.transaction(({ set }) => {
      // Início do vídeo - 100% opaco
      sequence.position = 0;
      set(videoProps.props.opacity, 1);
      set(blurProps.props.intensity, 0);
      if (skateModelProps) {
        set(skateModelProps.props.visible, true);
        set(skateModelProps.props.scale, 0.08860759493670611);
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
        set(skateModelProps.props.scale, 0.08860759493670611);
      }
      
      // Fim da transição - vídeo quase invisível, modelo 3D totalmente visível
      sequence.position = TIMECODES.TRANSITION_END;
      set(videoProps.props.opacity, 0.3);
      set(blurProps.props.intensity, 10);
      if (skateModelProps) {
        set(skateModelProps.props.visible, true);
        set(skateModelProps.props.scale, 0.08860759493670611);
      }
      
      // Estado interativo - vídeo invisível, modelo 3D totalmente visível
      sequence.position = TIMECODES.INTERACTIVE_START;
      set(videoProps.props.opacity, 0);
      set(blurProps.props.intensity, 0);
      if (skateModelProps) {
        set(skateModelProps.props.visible, true);
        set(skateModelProps.props.scale, 0.08860759493670611);
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
 * Atualizar posição da timeline com base no tempo do vídeo
 * @param {number} time - Tempo do vídeo em segundos
 */
function updateTimelineFromVideo(time) {
  if (!sequence) return;
  
  try {
    // Definir a posição da sequência usando o tempo do vídeo
    sequence.position = time;
    
    // Verificar se estamos no modo interativo
    const isInteractive = time >= TIMECODES.INTERACTIVE_START;
    
    // Se estamos no modo interativo, garantir que o modelo esteja visível
    if (isInteractive && skateModelProps) {
      // Usar a API do Theatre para definir a visibilidade
      Studio.transaction(({ set }) => {
        set(skateModelProps.props.visible, true);
        set(videoProps.props.opacity, 0);
      });
    }
    
    // O Theatre.js vai automaticamente atualizar todas as propriedades
    // baseadas na posição da timeline
  } catch (error) {
    console.error('Erro ao atualizar timeline:', error);
    // Em caso de erro, forçar a visibilidade do modelo de skate
    setSkateModelVisible(true);
  }
}

/**
 * Ir para um ponto específico na timeline
 * @param {string} timecodeKey - Chave do timecode (ex: 'TRANSITION_START')
 */
function goToTimecode(timecodeKey) {
  if (!sequence || !TIMECODES[timecodeKey]) return;
  
  try {
    sequence.position = TIMECODES[timecodeKey];
    
    // Se o vídeo estiver disponível, sincronizar o vídeo com a timeline
    if (videoElement) {
      videoElement.currentTime = TIMECODES[timecodeKey];
    }
  } catch (error) {
    console.error(`Erro ao ir para o timecode ${timecodeKey}:`, error);
  }
}

// Exportar funções e variáveis para uso em outros módulos
export {
  initTheatre,
  setupSequence,
  TIMECODES,
  updateTimelineFromVideo,
  goToTimecode,
  cameraProps,
  videoProps,
  blurProps,
  skateModelProps
};

/**
 * Obter os valores atuais de uma propriedade Theatre.js
 * @param {Object} prop - Propriedade do Theatre.js
 * @returns {Object} Valores atuais da propriedade
 */
function getCurrentValues(prop) {
  return prop.value;
}

// Adicionando função getCurrentValues à lista de exportações
export { getCurrentValues };