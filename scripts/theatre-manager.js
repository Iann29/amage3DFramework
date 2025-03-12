/**
 * theatre-manager.js - Gerenciamento específico do Theatre.js
 * Este módulo centraliza toda a configuração e interação com o Theatre.js
 */

import Studio from '@theatre/studio';
import { getProject, types, val, onChange } from '@theatre/core';
import { setSkateModelVisible, updateSkateModel } from './skate-model.js';
import { setVideoTime } from './video-handler.js';
import * as THREE from 'three';

// Variáveis para Theatre.js
let project;
let mainSheet;
let sequence;
let initialized = false;

// Objetos animáveis
let videoProps;
let blurProps;
let skateModelProps;
let cameraProps;

// Timecodes específicos para a timeline (em segundos)
const TIMECODES = {
  START: 0,
  PRE_TRICK: 1.1,
  TRANSITION_START: 3,
  TRANSITION_MID: 3.5,
  TRANSITION_END: 4.5,
  INTERACTIVE_START: 5
};

/**
 * Inicializar Theatre.js
 * @returns {Promise} Promessa resolvida quando a inicialização for concluída
 */
function init() {
  if (initialized) return Promise.resolve();
  
  try {
    // Inicializar Theatre Studio (editor visual)
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
    }, 1000);
    
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
    visible: types.boolean(true),
  });
  
  // Propriedades do efeito de blur
  blurProps = mainSheet.object('Blur Effect', {
    intensity: types.number(0, { range: [0, 30] }),
  });
  
  // Propriedades do modelo 3D do skate
  skateModelProps = mainSheet.object('3D Skate', {
    visible: types.boolean(true),
    position: {
      x: types.number(0.887, { range: [-25, 25] }),
      y: types.number(0, { range: [-25, 25] }),
      z: types.number(0, { range: [-25, 25] }),
    },
    rotation: {
      x: types.number(0.239, { range: [-Math.PI, Math.PI] }),
      y: types.number(0, { range: [-Math.PI, Math.PI] }),
      z: types.number(0, { range: [-Math.PI, Math.PI] }),
    },
    scale: types.number(1, { range: [0.1, 5] }),
  });
  
  // Propriedades da câmera
  cameraProps = mainSheet.object('Camera', {
    position: {
      x: types.number(0, { range: [-25, 25] }),
      y: types.number(1.5, { range: [-25, 25] }),
      z: types.number(3, { range: [-25, 25] }),
    },
    lookAt: {
      x: types.number(0, { range: [-25, 25] }),
      y: types.number(0, { range: [-25, 25] }),
      z: types.number(0, { range: [-25, 25] }),
    },
    fov: types.number(50, { range: [10, 100] }),
  });
  
  // Configurar observadores CORRETAMENTE, de acordo com a documentação
  
  // Observar mudanças no objeto de vídeo
  videoProps.onValuesChange((values) => {
    const videoElement = document.getElementById('skate-video');
    if (!videoElement) return;
    
    // Aplicar opacidade
    if (values.opacity !== undefined) {
      videoElement.style.opacity = values.opacity;
    }
    
    // Aplicar visibilidade
    if (values.visible !== undefined) {
      videoElement.style.display = values.visible ? 'block' : 'none';
    }
  });
  
  // Observar mudanças no modelo do skate
  skateModelProps.onValuesChange((values) => {
    // De acordo com a documentação do Theatre.js, onValuesChange já recebe
    // o objeto com os valores atualizados (similar a object.value)
    console.log('Skate model - valores atualizados:', values);
    
    // Chamar a função que atualiza todas as propriedades do modelo
    updateSkateModel();
    
    // Forçar renderização da cena
    if (window.renderer && window.scene && window.camera) {
      window.renderer.render(window.scene, window.camera);
    }
  });
  
  // Observar mudanças na câmera
  cameraProps.onValuesChange((values) => {
    console.log('Camera - valores atualizados:', values);
    
    // Aplicar todos os parâmetros da câmera diretamente, sem depender da função updateCameraFromProps
    if (window.camera) {
      try {
        // Criar vetores a partir dos valores do Theatre.js para uso com a API Three.js
        if (values.position) {
          const targetPosition = new THREE.Vector3(
            values.position.x || 0,
            values.position.y || 0, 
            values.position.z || 0
          );
          
          console.log('Theatre.js - Definindo posição da câmera para:', targetPosition);
          
          // Aplicar diretamente para controle preciso
          window.camera.position.copy(targetPosition);
        }
        
        // Atualizar FOV
        if (values.fov !== undefined) {
          console.log('Theatre.js - Definindo FOV da câmera para:', values.fov);
          window.camera.fov = values.fov;
          window.camera.updateProjectionMatrix();
        }
        
        // Atualizar lookAt por último, depois que a posição estiver definida
        if (values.lookAt) {
          // Verificar se os valores estão em graus (valores acima de 360° são improváveis)
          const isLikelyDegrees = Math.abs(values.lookAt.x) > 360 || 
                                Math.abs(values.lookAt.y) > 360 ||
                                Math.abs(values.lookAt.z) > 360;
          
          let x = values.lookAt.x || 0;
          let y = values.lookAt.y || 0;
          let z = values.lookAt.z || 0;
          
          if (isLikelyDegrees) {
            // Converter de graus para uma posição relativa mais razoável
            console.log('Convertendo lookAt de valores grandes para escala relativa');
            x = x / 100;
            y = y / 100;
            z = z / 100;
          }
          
          const lookAtTarget = new THREE.Vector3(x, y, z);
          console.log('Theatre.js - Definindo lookAt da câmera para:', lookAtTarget);
          
          // Usar lookAt como vetor diretamente
          window.camera.lookAt(lookAtTarget);
        }
        
        // Forçar renderização para aplicar todas as mudanças de uma vez
        if (window.renderer && window.scene) {
          window.renderer.render(window.scene, window.camera);
        }
      } catch (error) {
        console.error('Erro ao atualizar câmera do Theatre.js:', error);
      }
    }
  });
  
  // Observar mudanças no efeito de blur
  blurProps.onValuesChange((values) => {
    const videoElement = document.getElementById('skate-video');
    if (videoElement && values.intensity !== undefined) {
      videoElement.style.filter = `blur(${values.intensity}px)`;
    }
  });
}

/**
 * Criar botão para minimizar/maximizar o painel do Theatre.js Studio
 */
function createTheatreToggleButton() {
  const button = document.createElement('button');
  button.id = 'theatre-toggle';
  button.textContent = 'Toggle Studio';
  button.style.position = 'fixed';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.padding = '5px 10px';
  button.style.backgroundColor = '#333';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  
  button.addEventListener('click', () => {
    const studioElements = document.querySelectorAll('[data-reactroot]');
    studioElements.forEach(el => {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    });
  });
  
  document.body.appendChild(button);
}

/**
 * Configurar a sequência de animação
 * @param {number} duration - Duração da sequência em segundos
 * @returns {Object} Objeto da sequência do Theatre.js
 */
function setupSequence(duration = 10) {
  if (!mainSheet) {
    console.error('Sheet não inicializada. Execute init() primeiro.');
    return null;
  }
  
  // Criar sequência usando a API correta do Theatre.js
  try {
    // Verificar qual método está disponível
    if (typeof mainSheet.createSequence === 'function') {
      sequence = mainSheet.createSequence({
        duration: duration,
        pace: 1,
        direction: 'normal',
        loop: false,
      });
    } else if (typeof project.getSequence === 'function') {
      sequence = project.getSequence();
      if (!sequence) {
        sequence = project.createSequence(mainSheet.name, {
          duration: duration,
          pace: 1,
          direction: 'normal',
          loop: false,
        });
      }
    } else {
      console.warn('API do Theatre.js não reconhecida. Usando fallback.');
      // Fallback: armazenar a configuração para uso posterior
      sequence = {
        duration: duration,
        pace: 1,
        direction: 'normal',
        loop: false,
        play: () => console.warn('Método play não disponível na API atual'),
        pause: () => console.warn('Método pause não disponível na API atual')
      };
    }
    console.log('Sequência configurada com sucesso');
  } catch (error) {
    console.error('Erro ao configurar sequência:', error);
    // Criar um objeto mínimo para evitar erros em outros lugares
    sequence = {
      play: () => {},
      pause: () => {}
    };
  }
  
  return sequence;
}

/**
 * Definir a duração da sequência
 * @param {number} duration - Nova duração em segundos
 */
function setSequenceDuration(duration) {
  if (!sequence) {
    console.error('Sequência não inicializada. Execute setupSequence() primeiro.');
    return;
  }
  
  sequence.position = 0;
  sequence.length = duration;
}

/**
 * Obter os valores atuais de uma propriedade Theatre.js
 * @param {Object} prop - Propriedade do Theatre.js
 * @returns {Object} Valores atuais da propriedade
 */
function getCurrentValues(prop) {
  // Verificar se prop é um objeto válido antes de tentar acessar seus valores
  if (!prop || typeof prop !== 'object') {
    console.warn('Theatre.js prop inválida:', prop);
    return null;
  }
  
  try {
    // De acordo com a documentação em theatreJSFunctions:
    // 1. Para objetos do Theatre.js, devemos usar a propriedade .value diretamente
    // 2. Para pointers, devemos usar a função val()
    
    if (prop.value !== undefined) {
      // Caso 1: O objeto tem uma propriedade value (objetos do Theatre.js)
      return prop.value;
    } else if (typeof val === 'function') {
      // Caso 2: Usar a função val() para pointers (recomendado)
      return val(prop);
    } else if (prop.props) {
      // Caso 3: Se tivermos o objeto Sheet e precisamos dos props
      return val(prop.props);
    } else {
      console.warn('Não foi possível obter valores do Theatre.js:', prop);
      return null;
    }
  } catch (error) {
    console.warn('Erro ao obter valores do Theatre.js:', error);
    // Retornar um objeto vazio para evitar erros em cascata
    return {};
  }
}

/**
 * Configurar a sequência de animação
 */
function setupKeyframes() {
  if (!sequence) {
    console.error('Sequência não inicializada. Execute setupSequence() primeiro.');
    return;
  }
  
  // Exemplo: Definir keyframes para o modelo
  sequence.position = TIMECODES.START;
  skateModelProps.visible = false;
  
  sequence.position = TIMECODES.PRE_TRICK;
  skateModelProps.visible = true;
  
  sequence.position = TIMECODES.INTERACTIVE_START;
  
  // Resetar posição da timeline para o início
  sequence.position = 0;
}

/**
 * Atualizar a timeline com base no tempo atual do vídeo
 * @param {number} currentTime - Tempo atual do vídeo em segundos
 */
function updateTimelineFromVideo(currentTime) {
  if (!sequence) return;
  
  try {
    // Setar posição da timeline para corresponder ao tempo do vídeo
    sequence.position = currentTime;
  } catch (error) {
    console.warn('Erro ao atualizar timeline:', error);
  }
}

/**
 * Ir para um timecode específico
 * @param {string} timecode - Nome do timecode (deve estar em TIMECODES)
 */
function goToTimecode(timecode) {
  if (!sequence || !TIMECODES[timecode]) return;
  
  try {
    // Ir para o tempo específico
    sequence.position = TIMECODES[timecode];
    
    // Se houver vídeo, sincronizar o vídeo com a timeline
    const videoElement = document.getElementById('skate-video');
    if (videoElement) {
      setVideoTime(TIMECODES[timecode]);
    }
  } catch (error) {
    console.warn(`Erro ao ir para timecode ${timecode}:`, error);
  }
}

/**
 * Iniciar a reprodução da sequência do Theatre.js
 * @param {Object} options - Opções para a reprodução
 * @returns {boolean} - true se a sequência foi iniciada com sucesso
 */
function playSequence(options = {}) {
  if (!sequence) {
    console.error('Sequência não inicializada. Execute setupSequence() primeiro.');
    return false;
  }
  
  try {
    console.log('▶️ Iniciando reprodução da sequência Theatre.js');
    
    // Configurar opções padrão
    const defaultOptions = {
      rate: 1.0,          // Taxa de reprodução normal
      range: undefined,   // Reproduzir a sequência completa
      iterationCount: 1   // Reproduzir apenas uma vez
    };
    
    // Mesclar opções fornecidas com as padrão
    const playOptions = { ...defaultOptions, ...options };
    
    // Iniciar a sequência
    sequence.play(playOptions);
    
    return true;
  } catch (error) {
    console.error('Erro ao iniciar a sequência Theatre.js:', error);
    return false;
  }
}

/**
 * Pausar a reprodução da sequência do Theatre.js
 * @returns {boolean} - true se a sequência foi pausada com sucesso
 */
function pauseSequence() {
  if (!sequence) {
    console.error('Sequência não inicializada. Execute setupSequence() primeiro.');
    return false;
  }
  
  try {
    console.log('⏸️ Pausando sequência Theatre.js');
    sequence.pause();
    return true;
  } catch (error) {
    console.error('Erro ao pausar a sequência Theatre.js:', error);
    return false;
  }
}

// Exportar funções e variáveis para uso em outros módulos
export {
  init,
  project,
  mainSheet,
  sequence,
  setupSequence,
  setSequenceDuration,
  TIMECODES,
  skateModelProps,
  videoProps,
  cameraProps,
  getCurrentValues,
  updateTimelineFromVideo,
  goToTimecode,
  setupKeyframes,
  playSequence,
  pauseSequence
};
