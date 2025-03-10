/**
 * skate-model.js - Carregamento e controle do modelo 3D do skate
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { addObjectToScene, getSceneObject, scene } from './three-scene.js';
import { skateModelProps, getCurrentValues } from './animation.js';

// Variáveis globais
let skateModel;
let modelLoaded = false;
let modelPath = 'assets/models/skate.glb';

// Gerenciador de carregamento para feedback visual
const loadingManager = new THREE.LoadingManager();

/**
 * Carregar o modelo 3D do skate
 * @returns {Promise} Promise que resolve quando o modelo for carregado
 */
function loadSkateModel() {
  return new Promise((resolve, reject) => {
    // Configurar gerenciador de carregamento
    setupLoadingManager();
    
    try {
      // Primeiro tentar carregar o modelo 3D
      loadModelFromFile()
        .then(model => {
          processModel(model);
          modelLoaded = true;
          resolve(skateModel);
        })
        .catch(error => {
          console.warn('Não foi possível carregar o modelo do arquivo. Criando modelo substituto:', error);
          // Se falhar, criar um modelo substituto
          createFallbackModel();
          modelLoaded = true;
          resolve(skateModel);
        });
    } catch (error) {
      console.error('Erro durante o carregamento do modelo:', error);
      // Em caso de erro, criar um modelo substituto
      createFallbackModel();
      modelLoaded = true;
      resolve(skateModel);
    }
  });
}

/**
 * Carregar o modelo a partir do arquivo
 * @returns {Promise} Promise que resolve com o modelo carregado
 */
function loadModelFromFile() {
  return new Promise((resolve, reject) => {
    // Configurar Draco loader para descompressão de modelos
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
    
    // Criar loader GLTF
    const loader = new GLTFLoader(loadingManager);
    loader.setDRACOLoader(dracoLoader);
    
    // Carregar modelo
    loader.load(
      modelPath,
      (gltf) => {
        console.log('Modelo carregado com sucesso', gltf);
        resolve(gltf);
      },
      (progress) => {
        // Atualizações de progresso são tratadas pelo LoadingManager
      },
      (error) => {
        console.error('Erro ao carregar modelo:', error);
        reject(error);
      }
    );
  });
}

/**
 * Criar um modelo substituto simples para quando o carregamento falhar
 */
function createFallbackModel() {
  console.log('Criando modelo substituto');
  
  // Criar uma geometria simples de skate
  const group = new THREE.Group();
  
  // Shape (deck) principal do skate
  const deckGeometry = new THREE.BoxGeometry(2, 0.1, 0.7);
  const deckMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const deck = new THREE.Mesh(deckGeometry, deckMaterial);
  deck.position.y = 0.1;
  group.add(deck);
  
  // Trucks (eixos)
  const truckGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.8);
  const truckMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });
  
  const frontTruck = new THREE.Mesh(truckGeometry, truckMaterial);
  frontTruck.position.set(0.7, 0, 0);
  group.add(frontTruck);
  
  const backTruck = new THREE.Mesh(truckGeometry, truckMaterial);
  backTruck.position.set(-0.7, 0, 0);
  group.add(backTruck);
  
  // Rodas
  const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  
  const wheels = [];
  
  // Posições das rodas
  const wheelPositions = [
    [0.7, -0.1, 0.4],  // Frente direita
    [0.7, -0.1, -0.4], // Frente esquerda
    [-0.7, -0.1, 0.4], // Traseira direita
    [-0.7, -0.1, -0.4], // Traseira esquerda
  ];
  
  wheelPositions.forEach(position => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(position[0], position[1], position[2]);
    wheel.rotation.z = Math.PI / 2; // Rotacionar para a orientação correta
    wheels.push(wheel);
    group.add(wheel);
  });
  
  // Configurar o skateModel com o modelo substituto
  skateModel = group;
  
  // Adicionar à cena
  addObjectToScene(skateModel, 'skateModel');
  
  // Configurar propriedades iniciais
  skateModel.visible = false;
  skateModel.position.set(0, 0, 0);
  skateModel.rotation.set(0, 0, 0);
  skateModel.scale.set(1, 1, 1);
  
  // Configurar sombras
  skateModel.traverse(node => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
}

/**
 * Configurar gerenciador de carregamento
 */
function setupLoadingManager() {
  // Quando iniciar o carregamento
  loadingManager.onStart = function(url, itemsLoaded, itemsTotal) {
    console.log('Iniciando carregamento do modelo:', url);
  };
  
  // Durante o carregamento
  loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    console.log(`Progresso: ${Math.round(progress)}% (${url})`);
  };
  
  // Quando todos os itens forem carregados
  loadingManager.onLoad = function() {
    console.log('Carregamento de todos os recursos concluído');
  };
  
  // Em caso de erro
  loadingManager.onError = function(url) {
    console.error('Erro ao carregar:', url);
  };
}

/**
 * Processar o modelo carregado
 * @param {Object} gltf - Objeto GLTF carregado
 */
function processModel(gltf) {
  // Obter o modelo do objeto GLTF
  skateModel = gltf.scene;
  
  // Configurar posição e escala inicial
  skateModel.position.set(0, 0, 0);
  skateModel.scale.set(1, 1, 1);
  skateModel.rotation.set(0, 0, 0);
  
  // Inicialmente invisível
  skateModel.visible = false;
  
  // Otimizar o modelo
  optimizeModel(skateModel);
  
  // Adicionar à cena
  addObjectToScene(skateModel, 'skateModel');
  
  // Configurar materiais
  setupModelMaterials(skateModel);
  
  // Configurar sombras
  setupModelShadows(skateModel);
}

/**
 * Otimizar o modelo para melhor performance
 * @param {THREE.Object3D} model - Modelo 3D a ser otimizado
 */
function optimizeModel(model) {
  // Otimização de geometrias e materiais
  model.traverse((node) => {
    if (node.isMesh) {
      // Otimizar buffers de geometria
      node.geometry.attributes.position.needsUpdate = true;
      
      // Configurar para não atualizar matrizes continuamente
      node.matrixAutoUpdate = false;
      node.updateMatrix();
    }
  });
}

/**
 * Configurar materiais do modelo
 * @param {THREE.Object3D} model - Modelo 3D para configurar materiais
 */
function setupModelMaterials(model) {
  // Configuração avançada de materiais
  model.traverse((node) => {
    if (node.isMesh) {
      // Garantir que materiais tenham configurações de PBR corretas
      if (node.material) {
        node.material.envMapIntensity = 1.0;
        node.material.needsUpdate = true;
        
        // Adicionar leve emissão para destacar o modelo
        node.material.emissive = new THREE.Color(0x111111);
      }
    }
  });
}

/**
 * Configurar sombras para o modelo
 * @param {THREE.Object3D} model - Modelo 3D para configurar sombras
 */
function setupModelShadows(model) {
  model.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
}

/**
 * Atualizar o modelo do skate com base nas propriedades do Theatre.js
 */
function updateSkateModel() {
  if (!modelLoaded || !skateModel) return;
  
  // Obter valores atuais das propriedades animadas
  const values = getCurrentValues(skateModelProps);
  
  if (values) {
    // Atualizar visibilidade
    skateModel.visible = values.visible;
    
    // Atualizar posição
    skateModel.position.x = values.position.x;
    skateModel.position.y = values.position.y;
    skateModel.position.z = values.position.z;
    
    // Atualizar rotação
    skateModel.rotation.x = values.rotation.x;
    skateModel.rotation.y = values.rotation.y;
    skateModel.rotation.z = values.rotation.z;
    
    // Atualizar escala
    const scale = values.scale;
    skateModel.scale.set(scale, scale, scale);
  }
}

/**
 * Verificar se o modelo está carregado
 * @returns {boolean} true se o modelo estiver carregado
 */
function isModelLoaded() {
  return modelLoaded;
}

/**
 * Obter o modelo do skate
 * @returns {THREE.Object3D|null} Modelo do skate ou null se não carregado
 */
function getSkateModel() {
  return skateModel || null;
}

// Exportar funções e variáveis para uso em outros módulos
export {
  loadSkateModel,
  updateSkateModel,
  isModelLoaded,
  getSkateModel
};
