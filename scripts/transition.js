/**
 * transition.js - Lógica de transição entre o vídeo e o modelo 3D
 */

import { gsap } from 'gsap';
import { applyBlurEffect } from './video-handler.js';
import { blurProps, skateModelProps, getCurrentValues, TIMECODES } from './animation.js';
import { updateSkateModel } from './skate-model.js';
import { enableModelInteraction } from './three-scene.js';

// Variáveis de controle para a transição
let transitionActive = false;
let transitionComplete = false;
let transitionProgress = 0;

// Elementos do DOM - serão inicializados no setupTransition
let videoContainer;
let threeContainer;
let interactionHints;

/**
 * Configurar o sistema de transição
 */
function setupTransition() {
  // Obter elementos do DOM
  videoContainer = document.getElementById('video-container');
  threeContainer = document.getElementById('three-container');
  interactionHints = document.getElementById('interaction-hints');
  
  // Verificar se os elementos existem
  if (!videoContainer || !threeContainer) {
    console.error('Elementos necessários para transição não encontrados');
    return false;
  }
  
  // Configurar eventos do sistema de transição
  setupTransitionEvents();
  
  // Inicializar estado inicial
  resetTransitionState();
  
  return true;
}

/**
 * Configurar eventos relacionados ao sistema de transição
 */
function setupTransitionEvents() {
  // Verificar se as propriedades de blur existem
  if (blurProps) {
    // Listener para atualização das propriedades de blur do Theatre.js
    blurProps.onValuesChange((values) => {
      if (values && typeof values.intensity !== 'undefined') {
        applyBlurEffect(values.intensity);
      }
    });
  } else {
    console.warn('Propriedades de blur não disponíveis');
  }
  
  // Verificar se as propriedades do modelo 3D existem
  if (skateModelProps) {
    // Listener para atualização das propriedades do modelo 3D do Theatre.js
    skateModelProps.onValuesChange(() => {
      updateSkateModel();
    });
  } else {
    console.warn('Propriedades do modelo 3D não disponíveis');
  }
}

/**
 * Resetar o estado da transição
 */
function resetTransitionState() {
  transitionActive = false;
  transitionComplete = false;
  transitionProgress = 0;
  
  // Resetar estilos CSS se os elementos existirem
  if (videoContainer) {
    videoContainer.style.opacity = 1;
  }
  
  if (threeContainer) {
    threeContainer.style.opacity = 0;
    threeContainer.style.pointerEvents = 'none';
  }
  
  // Remover classes relacionadas à transição
  if (videoContainer) {
    videoContainer.classList.remove('blur-active');
  }
  
  if (threeContainer) {
    threeContainer.classList.remove('interactive');
  }
}

/**
 * Iniciar ou atualizar a transição
 * @param {number} progress - Progresso da transição (0 a 1)
 */
function startTransition(progress) {
  // Verificar se os elementos necessários existem
  if (!videoContainer || !threeContainer) {
    console.error('Elementos necessários para transição não encontrados');
    return;
  }
  
  // Atualizar o progresso
  transitionProgress = Math.max(0, Math.min(1, progress));
  
  // Marcar como ativa se esta for a primeira chamada
  if (!transitionActive) {
    transitionActive = true;
    console.log('Iniciando transição');
    
    // Aplicar efeitos visuais iniciais
    threeContainer.style.opacity = 0;
    threeContainer.classList.add('fade-in');
  }
  
  // Atualizar a transição conforme o progresso
  updateTransition(transitionProgress);
  
  // Verificar se a transição está completa
  if (transitionProgress >= 1 && !transitionComplete) {
    completeTransition();
  }
}

/**
 * Atualizar a transição com base no progresso
 * @param {number} progress - Progresso da transição (0 a 1)
 */
function updateTransition(progress) {
  // Verificar se os elementos necessários existem
  if (!videoContainer || !threeContainer) {
    return;
  }
  
  // Calcular valores com base no progresso
  const videoOpacity = 1 - (progress * 0.9); // Fade out gradual do vídeo
  const modelOpacity = progress;             // Fade in gradual do modelo 3D
  
  // Aplicar valores calculados
  videoContainer.style.opacity = videoOpacity;
  threeContainer.style.opacity = modelOpacity;
  
  // Atualizar a intensidade do blur com base no progresso
  const blurValues = getCurrentValues(blurProps);
  if (blurValues && typeof blurValues.intensity !== 'undefined') {
    const blurIntensity = blurValues.intensity;
    videoContainer.style.filter = `blur(${blurIntensity}px)`;
  }
}

/**
 * Completar a transição
 */
function completeTransition() {
  // Verificar se os elementos necessários existem
  if (!videoContainer || !threeContainer) {
    console.error('Elementos necessários para completar a transição não encontrados');
    return;
  }
  
  transitionComplete = true;
  console.log('Transição completa');
  
  // Adicionar classe flash para efeito visual
  threeContainer.classList.add('flash');
  setTimeout(() => {
    if (threeContainer) {
      threeContainer.classList.remove('flash');
    }
  }, 500);
  
  // Esconder completamente o vídeo
  gsap.to(videoContainer, {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
    onComplete: () => {
      if (videoContainer) {
        videoContainer.style.display = 'none';
      }
    }
  });
  
  // Mostrar completamente o modelo 3D
  gsap.to(threeContainer, {
    opacity: 1,
    duration: 0.7,
    ease: 'power2.out',
    onComplete: () => {
      // Habilitar interatividade com o modelo 3D
      enableModelInteraction();
      
      // Mostrar dicas de interação
      showInteractionHints();
    }
  });
}

/**
 * Mostrar dicas de interação para o modelo 3D
 */
function showInteractionHints() {
  if (!interactionHints) {
    console.warn('Elemento de dicas de interação não encontrado');
    return;
  }
  
  interactionHints.classList.remove('hidden');
  
  // Adicionar classes para animação
  interactionHints.classList.add('ui-element-entry');
  
  // Esconder as dicas após alguns segundos
  setTimeout(() => {
    if (interactionHints) {
      interactionHints.classList.add('fade-out');
      setTimeout(() => {
        if (interactionHints) {
          interactionHints.classList.add('hidden');
        }
      }, 1000);
    }
  }, 5000);
}

/**
 * Verificar se a transição está completa
 * @returns {boolean} true se a transição estiver completa
 */
function isTransitionComplete() {
  return transitionComplete;
}

/**
 * Verificar se a transição está ativa
 * @returns {boolean} true se a transição estiver ativa
 */
function isTransitionActive() {
  return transitionActive;
}

/**
 * Obter o progresso atual da transição
 * @returns {number} Progresso atual da transição (0 a 1)
 */
function getTransitionProgress() {
  return transitionProgress;
}

// Exportar funções e variáveis para uso em outros módulos
export {
  setupTransition,
  startTransition,
  isTransitionComplete,
  isTransitionActive,
  getTransitionProgress
};
