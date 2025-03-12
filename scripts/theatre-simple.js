/**
 * theatre-simple.js - Configuração simplificada do Theatre.js com estado predefinido
 */

import Studio from '@theatre/studio';
import { getProject, types } from '@theatre/core';

// Estado predefinido da animação
const savedState = {
  "sheetsById": {
    "Main Animation": {
      "staticOverrides": {
        "byObject": {}
      },
      "sequence": {
        "subUnitsPerUnit": 30,
        "length": 10,
        "type": "PositionalSequence",
        "tracksByObject": {
          "Skate": {
            "trackData": {
              "7svZIkqfeq": {
                "type": "BasicKeyframedTrack",
                "__debugName": "Skate:[\"visible\"]",
                "keyframes": [
                  {
                    "id": "17Se6C_oHY",
                    "position": 0,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": false
                  },
                  {
                    "id": "ITB5gw8Job",
                    "position": 0.833,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": true
                  },
                  {
                    "id": "VC7lCw9DN3",
                    "position": 1.233,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": true
                  }
                ]
              },
              "kzwfZFrQcH": {
                "type": "BasicKeyframedTrack",
                "__debugName": "Skate:[\"position\",\"x\"]",
                "keyframes": [
                  {
                    "id": "ZtIGiBWlXM",
                    "position": 0.833,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -2.468110353010975
                  },
                  {
                    "id": "QI9HtLDHD6",
                    "position": 1.233,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": 0.18985464253930606
                  },
                  {
                    "id": "192jZUVVl9",
                    "position": 1.967,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": 2.088401067932364
                  }
                ]
              },
              "kZtShGtnol": {
                "type": "BasicKeyframedTrack",
                "__debugName": "Skate:[\"position\",\"y\"]",
                "keyframes": [
                  {
                    "id": "CcWMwRjSqZ",
                    "position": 1.233,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -0.9492732126965292
                  },
                  {
                    "id": "U8LcP2jfYv",
                    "position": 1.967,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -0.5695639276179175
                  }
                ]
              },
              "28kVjdiMlG": {
                "type": "BasicKeyframedTrack",
                "__debugName": "Skate:[\"position\",\"z\"]",
                "keyframes": [
                  {
                    "id": "6A2OfMmgIv",
                    "position": 1.233,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": 1.8985464253930582
                  }
                ]
              },
              "xIbCd60j0b": {
                "type": "BasicKeyframedTrack",
                "__debugName": "Skate:[\"rotation\",\"x\"]",
                "keyframes": [
                  {
                    "id": "ikDTDRGaPt",
                    "position": 1.233,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -0.5964459502513995
                  },
                  {
                    "id": "MlF8cpI3q9",
                    "position": 1.967,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -0.9543135204022393
                  }
                ]
              },
              "rwTkgHPBVK": {
                "type": "BasicKeyframedTrack",
                "__debugName": "Skate:[\"rotation\",\"y\"]",
                "keyframes": [
                  {
                    "id": "-aPRwiidyu",
                    "position": 1.233,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": 0.8350243303519593
                  },
                  {
                    "id": "R8CoTf9d8L",
                    "position": 1.967,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": 2.7755575615628914e-17
                  }
                ]
              },
              "IhDOWPovBb": {
                "type": "BasicKeyframedTrack",
                "__debugName": "Skate:[\"rotation\",\"z\"]",
                "keyframes": [
                  {
                    "id": "dqCM8TW1UJ",
                    "position": 1.233,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -0.11928919005027987
                  },
                  {
                    "id": "akoI6hcjGm",
                    "position": 1.967,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": 0.11928919005027992
                  }
                ]
              },
              "ezjiRZZEcY": {
                "type": "BasicKeyframedTrack",
                "__debugName": "Skate:[\"scale\"]",
                "keyframes": []
              }
            },
            "trackIdByPropPath": {
              "[\"visible\"]": "7svZIkqfeq",
              "[\"position\",\"x\"]": "kzwfZFrQcH",
              "[\"position\",\"y\"]": "kZtShGtnol",
              "[\"position\",\"z\"]": "28kVjdiMlG",
              "[\"rotation\",\"x\"]": "xIbCd60j0b",
              "[\"rotation\",\"y\"]": "rwTkgHPBVK",
              "[\"rotation\",\"z\"]": "IhDOWPovBb",
              "[\"scale\"]": "ezjiRZZEcY"
            }
          }
        }
      }
    }
  },
  "definitionVersion": "0.4.0",
  "revisionHistory": [
    "QMziZ8aRQeZt5oji",
    "XyeWyCUqNSDe6nM7",
    "FwlwRiXTqyvlCWjk",
    "vmALOWmckJeVwOQF"
  ]
};

// Inicializar o Studio
Studio.initialize();
console.log('Theatre.js Studio inicializado corretamente');

// Variáveis Theatre.js
let project;
let sheet;
let sequence;
let skateObj;

// Variáveis para a animação independente
let isAutoPlayEnabled = true;
let lastTimeUpdate = 0;
let animationFrameId = null;
let playbackRate = 1;
let targetVideoTime = 0; // Tempo alvo do vídeo para sincronização suave
let isSmoothSyncEnabled = true; // Habilitar sincronização suave
let lastKnownVideoTime = 0; // Última posição conhecida do vídeo
let isVideoPlaying = false; // Status de reprodução do vídeo
let lastVideoUpdateTime = 0; // Timestamp da última atualização do tempo do vídeo
let videoPlaybackRate = 1.0; // Taxa de reprodução do vídeo
let smoothnessLevel = 2; // Nível de suavidade: 1=mais preciso, 2=equilibrado, 3=mais suave

/**
 * Inicializar o Theatre.js
 */
export function initTheatre() {
  try {
    // Criar projeto COM o estado predefinido
    project = getProject('Skate 3D', { state: savedState });
    console.log('Projeto Theatre.js criado com estado predefinido');
    
    // Obter a sheet que já foi definida no estado
    sheet = project.sheet('Main Animation');
    console.log('Sheet obtida do estado predefinido');
    
    // Criar/obter o objeto do skate com as mesmas propriedades definidas no estado
    skateObj = sheet.object('Skate', {
      visible: types.boolean(false),
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
    console.log('Objeto skate criado/obtido no Theatre.js');
    
    // Adicionar listener para mudanças de valores
    skateObj.onValuesChange((values) => {
      updateModel(values);
    });
    
    // Obter a sequência existente
    sequence = sheet.sequence;
    console.log('Sequência obtida:', sequence ? 'Sucesso' : 'Falha');
    
    // Forçar a posição inicial da timeline
    if (sequence) {
      sequence.position = 0;
      console.log('Posição da timeline definida para 0');
      
      // Iniciar o loop de animação independente
      startAnimationLoop();
    }
    
    // Expor globalmente para depuração
    window.theatreProject = project;
    window.theatreSheet = sheet;
    window.theatreSequence = sequence;
    window.theatreObj = skateObj;
    
    return {
      project,
      sheet,
      skateObj,
      sequence
    };
  } catch (error) {
    console.error('Erro ao inicializar o Theatre.js:', error);
    throw error;
  }
}

/**
 * Iniciar o loop de animação que roda independentemente do vídeo
 */
function startAnimationLoop() {
  if (!sequence) return;
  
  lastTimeUpdate = performance.now() / 1000;
  lastVideoUpdateTime = performance.now() / 1000;
  
  function animate() {
    if (!sequence) return;
    
    // Calcular o delta de tempo (em segundos)
    const now = performance.now() / 1000;
    const delta = (now - lastTimeUpdate) * playbackRate;
    const videoTimeSinceUpdate = now - lastVideoUpdateTime;
    lastTimeUpdate = now;
    
    if (isAutoPlayEnabled) {
      // Modo de reprodução automática independente do vídeo
      const newPosition = sequence.position + delta;
      
      // Verificar se chegamos ao final da duração da sequência
      if (newPosition >= sequence.length) {
        // Voltar para o início (ou parar, dependendo da configuração)
        sequence.position = 0; // Loop
      } else {
        sequence.position = newPosition;
      }
    } else if (isSmoothSyncEnabled && isVideoPlaying) {
      // Modo de sincronização suave com o vídeo
      const currentPos = sequence.position;
      
      // Previsão mais precisa da posição atual do vídeo
      // Considera quanto tempo se passou desde que recebemos o último tempo do vídeo
      // e a taxa de reprodução do vídeo
      const estimatedVideoTime = targetVideoTime + (videoTimeSinceUpdate * videoPlaybackRate);
      
      // Calcular a diferença entre a posição estimada do vídeo e a posição atual da timeline
      const diff = estimatedVideoTime - currentPos;
      
      // Sistema de easing adaptativo com base no nível de suavidade selecionado
      let easingFactor;
      
      // Ajustar fatores de easing com base no nível de suavidade
      if (smoothnessLevel === 1) {
        // Modo mais preciso - segue o vídeo mais de perto
        if (Math.abs(diff) < 0.02) easingFactor = 0.08;
        else if (Math.abs(diff) < 0.1) easingFactor = 0.15;
        else if (Math.abs(diff) < 0.3) easingFactor = 0.25;
        else easingFactor = 0.4; // Diferenças grandes - movimento rápido
      } 
      else if (smoothnessLevel === 2) {
        // Modo equilibrado (padrão)
        if (Math.abs(diff) < 0.02) easingFactor = 0.04;
        else if (Math.abs(diff) < 0.1) easingFactor = 0.1;
        else if (Math.abs(diff) < 0.3) easingFactor = 0.18;
        else easingFactor = 0.25;
      }
      else if (smoothnessLevel === 3) {
        // Modo super suave - prioriza transições mais suaves, ignorando precisão
        if (Math.abs(diff) < 0.02) easingFactor = 0.02;
        else if (Math.abs(diff) < 0.1) easingFactor = 0.05;
        else if (Math.abs(diff) < 0.3) easingFactor = 0.08;
        else easingFactor = 0.12;
      }
      
      // Aplicar o movimento com easing
      if (Math.abs(diff) > 0.0005) { // Limiar de movimento mínimo
        sequence.position = currentPos + (diff * easingFactor);
      }
    }
    
    // Continuar o loop de animação
    animationFrameId = requestAnimationFrame(animate);
  }
  
  // Iniciar o loop
  animationFrameId = requestAnimationFrame(animate);
  console.log('Loop de animação independente iniciado');
}

/**
 * Parar o loop de animação
 */
function stopAnimationLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    console.log('Loop de animação independente parado');
  }
}

/**
 * Atualizar posição da sequência com base no tempo do vídeo
 * @param {number} videoTime - Tempo atual do vídeo em segundos
 * @param {boolean} forceSync - Forçar sincronização imediata sem interpolação
 * @param {boolean} playing - Status de reprodução do vídeo
 * @param {number} playbackRate - Taxa de reprodução do vídeo (opcional)
 */
export function updateSequencePosition(videoTime, forceSync = false, playing = false, vidPlaybackRate = 1.0) {
  if (!sequence) {
    console.warn('Sequência não encontrada, não é possível atualizar posição');
    return;
  }
  
  try {
    // Atualizar o tempo alvo para interpolação suave
    targetVideoTime = videoTime;
    lastKnownVideoTime = videoTime;
    isVideoPlaying = playing;
    videoPlaybackRate = vidPlaybackRate;
    
    // Atualizar o timestamp da última atualização do vídeo
    lastVideoUpdateTime = performance.now() / 1000;
    
    // Se forceSync for true, pular a interpolação e definir imediatamente
    if (forceSync) {
      sequence.position = videoTime;
    }
    // Caso contrário, a animationLoop fará a interpolação suave
  } catch (error) {
    console.error('Erro ao atualizar posição da sequência:', error);
  }
}

/**
 * Ativar ou desativar a reprodução automática da timeline
 * @param {boolean} enable - Se deve ativar a reprodução automática
 */
export function setAutoPlay(enable) {
  isAutoPlayEnabled = enable;
  console.log(`Reprodução automática ${enable ? 'ativada' : 'desativada'}`);
  
  if (enable && !animationFrameId) {
    startAnimationLoop();
  }
}

/**
 * Definir a velocidade de reprodução da animação
 * @param {number} rate - Velocidade de reprodução (1 = normal, 0.5 = metade, 2 = dobro)
 */
export function setPlaybackRate(rate) {
  playbackRate = rate;
  console.log(`Velocidade de reprodução definida para ${rate}x`);
}

/**
 * Ativar ou desativar a sincronização suave com o vídeo
 * @param {boolean} enable - Se deve ativar a sincronização suave
 */
export function setSmoothSync(enable) {
  isSmoothSyncEnabled = enable;
  console.log(`Sincronização suave ${enable ? 'ativada' : 'desativada'}`);
}

/**
 * Definir o nível de suavidade da interpolação
 * @param {number} level - Nível de suavidade (1=preciso, 2=equilibrado, 3=suave)
 */
export function setSmoothness(level) {
  if (level >= 1 && level <= 3) {
    smoothnessLevel = level;
    console.log(`Nível de suavidade definido para ${level}`);
  } else {
    console.warn('Nível de suavidade inválido. Use um valor entre 1 e 3.');
  }
}

/**
 * Atualizar o modelo 3D com base nos valores do Theatre.js
 */
function updateModel(values) {
  if (!window.skateModel) return;
  
  // Atualizar visibilidade
  if (values.visible !== undefined) {
    window.skateModel.visible = values.visible;
    console.log(`Modelo visível: ${values.visible}`);
  }
  
  // Atualizar posição
  if (values.position) {
    window.skateModel.position.x = values.position.x || 0;
    window.skateModel.position.y = values.position.y || 0;
    window.skateModel.position.z = values.position.z || 0;
  }
  
  // Atualizar rotação
  if (values.rotation) {
    window.skateModel.rotation.x = values.rotation.x || 0;
    window.skateModel.rotation.y = values.rotation.y || 0;
    window.skateModel.rotation.z = values.rotation.z || 0;
  }
  
  // Atualizar escala
  if (values.scale !== undefined) {
    const scale = values.scale || 0.08;
    window.skateModel.scale.set(scale, scale, scale);
  }
  
  // Forçar renderização
  if (window.renderer && window.scene && window.camera) {
    window.renderer.render(window.scene, window.camera);
  }
}

/**
 * Criar a sequência - função de compatibilidade
 */
export function createSequence(duration = 10) {
  console.log('createSequence chamada - usando sequência existente');
  return sequence;
}

/**
 * Configurar keyframes - função de compatibilidade
 */
export function setupKeyframes() {
  console.log('setupKeyframes chamada - keyframes já definidos no estado predefinido');
  // Não faz nada - os keyframes já estão definidos no estado predefinido
}