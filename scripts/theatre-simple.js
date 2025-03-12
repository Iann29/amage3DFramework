/**
 * theatre-simple.js - Configuração simplificada do Theatre.js
 */

import Studio from '@theatre/studio';
import { getProject, types } from '@theatre/core';

// Variáveis Theatre.js
let project;
let sheet;
let sequence;
let skateObj;

/**
 * Inicializar o Theatre.js
 */
export function initTheatre() {
  // Inicializar Studio
  Studio.initialize();
  console.log('Theatre.js Studio inicializado');
  
  // Criar projeto
  project = getProject('Skate 3D');
  
  // Criar sheet (timeline)
  sheet = project.sheet('Main Animation');
  
  // Criar objeto para o skate
  skateObj = sheet.object('Skate', {
    visible: types.boolean(true),
    position: {
      x: types.number(0, { range: [-5, 5] }),
      y: types.number(0, { range: [-5, 5] }),
      z: types.number(0, { range: [-5, 5] })
    },
    rotation: {
      x: types.number(0, { range: [-Math.PI, Math.PI] }),
      y: types.number(0, { range: [-Math.PI, Math.PI] }),
      z: types.number(0, { range: [-Math.PI, Math.PI] })
    },
    scale: types.number(0.08, { range: [0.01, 0.5] })
  });
  
  // Definir listener para mudanças de valor
  skateObj.onValuesChange((values) => {
    updateModel(values);
  });
  
  return {
    project,
    sheet,
    skateObj
  };
}

/**
 * Criar a sequência e definir keyframes
 * @param {number} duration - Duração da sequência em segundos
 */
export function createSequence(duration = 10) {
  if (!sheet) {
    console.error('Sheet não inicializada. Execute initTheatre() primeiro');
    return null;
  }
  
  try {
    // Criar sequência
    sequence = sheet.sequence.create({
      duration: duration,
      loop: false
    });
    
    console.log('Sequência criada com duração:', duration);
    return sequence;
  } catch (error) {
    console.error('Erro ao criar sequência:', error);
    return null;
  }
}

/**
 * Configurar keyframes simples para demonstração
 */
export function setupKeyframes() {
  if (!sequence || !skateObj) {
    console.error('Sequência ou objeto não inicializados');
    return;
  }
  
  // Início - posição padrão
  sequence.position = 0;
  skateObj.props.position.x = 0;
  skateObj.props.position.y = 0;
  skateObj.props.rotation.y = 0;
  
  // Meio - rotação
  sequence.position = 2;
  skateObj.props.position.x = 1;
  skateObj.props.rotation.y = Math.PI / 4;
  
  // Fim - outra posição e rotação
  sequence.position = 4;
  skateObj.props.position.x = -1;
  skateObj.props.rotation.y = -Math.PI / 4;
  
  // Voltar para o início
  sequence.position = 0;
  
  console.log('Keyframes configurados na sequência');
}

/**
 * Atualizar posição da sequência com base no tempo do vídeo
 * @param {number} videoTime - Tempo atual do vídeo em segundos
 */
export function updateSequencePosition(videoTime) {
  if (!sequence) return;
  
  sequence.position = videoTime;
}

/**
 * Atualizar o modelo 3D com base nos valores do Theatre.js
 * @param {Object} values - Valores atuais do objeto no Theatre.js
 */
function updateModel(values) {
  if (!window.skateModel) return;
  
  // Atualizar visibilidade
  if (values.visible !== undefined) {
    window.skateModel.visible = values.visible;
  }
  
  // Atualizar posição
  if (values.position) {
    window.skateModel.position.x = values.position.x;
    window.skateModel.position.y = values.position.y;
    window.skateModel.position.z = values.position.z;
  }
  
  // Atualizar rotação
  if (values.rotation) {
    window.skateModel.rotation.x = values.rotation.x;
    window.skateModel.rotation.y = values.rotation.y;
    window.skateModel.rotation.z = values.rotation.z;
  }
  
  // Atualizar escala
  if (values.scale !== undefined) {
    window.skateModel.scale.set(values.scale, values.scale, values.scale);
  }
}