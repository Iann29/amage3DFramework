/**
 * skate-model.js - Carregamento e controle do modelo 3D do skate
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { addToScene, getScene } from './three-scene.js';
import { skateModelProps, getCurrentValues } from './theatre-manager.js';

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
  addToScene(skateModel);
  
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
  
  console.log('Modelo do skate carregado:', skateModel);
  
  // Configurar posição e escala inicial com os valores exatos
  skateModel.position.set(0.887, 0, 0);
  skateModel.scale.set(0.08860759493670611, 0.08860759493670611, 0.08860759493670611);
  skateModel.rotation.set(0.239, 0, 0);
  
  // Inicializar como invisível para que a timeline do Theatre.js controle a visibilidade
  skateModel.visible = false;
  console.log('Visibilidade do modelo definida como:', skateModel.visible);
  
  // Otimizar o modelo
  optimizeModel(skateModel);
  
  // Adicionar à cena
  addToScene(skateModel);
  
  // Configurar materiais
  setupModelMaterials(skateModel);
  
  // Configurar sombras
  setupModelShadows(skateModel);
  
  console.log('Modelo processado e adicionado à cena', skateModel);
  
  // Configurar o container Three.js para ser visível e transparente
  const threeContainer = document.getElementById('three-container');
  if (threeContainer) {
    threeContainer.style.opacity = 1;
    threeContainer.style.backgroundColor = 'transparent';
    threeContainer.style.pointerEvents = 'all';
    console.log('Container Three.js configurado para ser visível e transparente');
  }
  
  // Garantir que a cena tenha fundo transparente
  const sceneObj = getScene();
  if (sceneObj) {
    sceneObj.background = null;
  }
  
  // Adicionar um helper para visualizar o modelo
  addModelHelper();
}

/**
 * Adiciona um helper visual para identificar a posição do modelo
 */
function addModelHelper() {
  if (!skateModel) return;
  
  // Criar uma esfera para marcar o centro do modelo
  const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const centerSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  
  // Adicionar a esfera à cena
  skateModel.add(centerSphere);
  
  // Criar axes helper para mostrar as direções
  const axesHelper = new THREE.AxesHelper(2);
  skateModel.add(axesHelper);
  
  console.log('Helpers adicionados ao modelo para melhor visualização');
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
  // Detectar se o modelo tem materiais
  let hasMaterials = false;
  
  model.traverse((node) => {
    if (node.isMesh) {
      hasMaterials = true;
      
      // Melhorar materiais existentes
      if (node.material) {
        // Garantir que o material seja visível com boa qualidade visual
        node.material.side = THREE.DoubleSide; // Renderiza ambos os lados do material
        node.material.shadowSide = THREE.DoubleSide;
        node.material.needsUpdate = true;
        
        // Adicionar propriedades físicas ao material, se não existirem
        if (!node.material.metalness && node.material.metalness !== 0) {
          node.material.metalness = 0.5;
        }
        if (!node.material.roughness && node.material.roughness !== 0) {
          node.material.roughness = 0.7;
        }
        
        // Destacar o material para visualização mais clara
        node.material.emissive = new THREE.Color(0x222222);
      }
    }
  });
  
  // Se não tiver materiais, adicionar um material padrão
  if (!hasMaterials && model.children.length > 0) {
    console.warn('Modelo sem materiais detectáveis, aplicando material padrão');
    const defaultMaterial = new THREE.MeshStandardMaterial({
      color: 0x3366cc,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    
    model.traverse((node) => {
      if (node.isMesh) {
        node.material = defaultMaterial;
      }
    });
  }
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
    // Atualizar visibilidade (sem interpolação, é um valor booleano)
    skateModel.visible = values.visible;
    
    // Criar vetores alvo a partir dos valores do Theatre.js
    const targetPosition = new THREE.Vector3(
      values.position.x,
      values.position.y,
      values.position.z
    );
    
    const targetRotation = new THREE.Euler(
      values.rotation.x,
      values.rotation.y,
      values.rotation.z
    );
    
    const targetScale = values.scale;
    
    // Exibir logs para diagnóstico
    console.log('Valores do Theatre.js para o skate:',
      '\nPosição:', targetPosition, 
      '\nRotação:', targetRotation, 
      '\nEscala:', targetScale
    );
    
    // Aplicar os valores diretamente, mas com conversão adequada
    // O Theatre.js pode estar usando graus enquanto o Three.js usa radianos
    
    // Aplicar posição
    skateModel.position.copy(targetPosition);
    
    // Verificar se os valores de rotação estão em graus (valores grandes geralmente indicam graus)
    // Em Three.js, as rotações são em radianos (valores entre -PI e PI, ~3.14 e ~-3.14)
    const isLikelyDegrees = Math.abs(targetRotation.x) > Math.PI * 2 || 
                            Math.abs(targetRotation.y) > Math.PI * 2 || 
                            Math.abs(targetRotation.z) > Math.PI * 2;
    
    if (isLikelyDegrees) {
      // Converter de graus para radianos
      skateModel.rotation.set(
        THREE.MathUtils.degToRad(targetRotation.x),
        THREE.MathUtils.degToRad(targetRotation.y),
        THREE.MathUtils.degToRad(targetRotation.z)
      );
      console.log('Convertendo rotações de graus para radianos:', skateModel.rotation);
    } else {
      // Já está em radianos
      skateModel.rotation.set(targetRotation.x, targetRotation.y, targetRotation.z);
    }
    
    // Aplicar escala
    skateModel.scale.set(targetScale, targetScale, targetScale);
  }
}

/**
 * Definir a visibilidade do modelo do skate diretamente
 * @param {boolean} isVisible - Se o modelo deve estar visível ou não
 */
function setSkateModelVisible(isVisible) {
  if (!modelLoaded || !skateModel) return;
  
  console.log('Alterando visibilidade do modelo para:', isVisible);
  skateModel.visible = isVisible;
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
  getSkateModel,
  setSkateModelVisible
};
