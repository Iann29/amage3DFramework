/**
 * three-scene.js - Configuração e gerenciamento da cena Three.js
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as Animation from './animation.js';

// Variáveis globais para Three.js
let scene, camera, renderer, controls;
let container;

// Variáveis para controle de estado
let isSceneReady = false;
let sceneObjects = {};

/**
 * Inicializar a cena Three.js
 */
function initThreeScene() {
  // Obter o container para a cena Three.js
  container = document.getElementById('three-container');
  
  // Criar a cena
  scene = new THREE.Scene();
  scene.background = null; // Fundo transparente para permitir a visualização do vídeo
  
  // Configurar a câmera
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
  
  // MODIFICAR: Posição da câmera para melhor visualização do skate
  camera.position.set(0, 1, 5); // Ajustar altura e distância
  camera.lookAt(0, 0, 0);
  
  // Configurar o renderer
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true, // Permitir transparência
    premultipliedAlpha: false // Importante para transparência correta
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); // Configurar cor de limpeza como transparente
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  
  // Garantir que o container seja transparente
  container.style.backgroundColor = 'transparent';
  container.style.opacity = 1;
  
  container.appendChild(renderer.domElement);
  
  // Adicionar iluminação
  setupLighting();
  
  // Configurar controles de órbita para interatividade
  setupOrbitControls();
  
  // Adicionar listener para redimensionamento da janela
  window.addEventListener('resize', onWindowResize);
  
  isSceneReady = true;
  
  return true;
}

/**
 * Configurar a iluminação da cena
 */
function setupLighting() {
  // Luz ambiente - aumentada para melhor visibilidade geral
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  sceneObjects.ambientLight = ambientLight;
  
  // Luz direcional principal - ajustada para iluminar o modelo frontalmente
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(2, 5, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);
  sceneObjects.mainLight = mainLight;
  
  // Configurações de sombra melhoradas
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 50;
  mainLight.shadow.bias = -0.0005;
  
  // Luz de preenchimento - aumentada e reposicionada
  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.7);
  fillLight.position.set(-5, 2, -2);
  scene.add(fillLight);
  sceneObjects.fillLight = fillLight;
  
  // Luz de destaque (rim light) - intensificada para destacar bordas
  const rimLight = new THREE.DirectionalLight(0xffffaa, 1.0);
  rimLight.position.set(0, 5, -10);
  scene.add(rimLight);
  sceneObjects.rimLight = rimLight;
  
  // Luz adicional inferior para eliminar áreas escuras
  const bottomLight = new THREE.DirectionalLight(0xaaaaff, 0.5);
  bottomLight.position.set(0, -5, 0);
  scene.add(bottomLight);
  sceneObjects.bottomLight = bottomLight;
  
  console.log('Iluminação da cena configurada para melhor visualização do modelo');
}

/**
 * Configurar controles de órbita para interação com o modelo 3D
 */
function setupOrbitControls() {
  // Criar controles de órbita
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Adicionar amortecimento para movimentos suaves
  controls.dampingFactor = 0.05;
  
  // Limitar zoom
  controls.minDistance = 2;
  controls.maxDistance = 10;
  
  // Desabilitar pan (arrastar)
  controls.enablePan = false;
  
  // Configurar limites de rotação vertical
  controls.minPolarAngle = Math.PI / 6; // 30 graus do topo
  controls.maxPolarAngle = Math.PI - Math.PI / 6; // 30 graus do fundo
  
  // Inicialmente desabilitado (será ativado após a transição)
  controls.enabled = false;
}

/**
 * Lidar com redimensionamento da janela
 */
function onWindowResize() {
  updateSceneSize();
}

/**
 * Atualizar o tamanho da cena com base nas dimensões da janela
 */
function updateSceneSize() {
  if (!renderer || !camera) return;
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Atualizar aspecto da câmera
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  // Atualizar tamanho do renderer
  renderer.setSize(width, height);
}

/**
 * Atualizar a cena Three.js (chamada no loop de animação)
 */
function animateThreeScene() {
  if (!isSceneReady) return;
  
  // Atualizar controles de órbita (para amortecimento)
  if (controls) {
    controls.update();
  }
  
  // Atualizar a câmera com base nos valores do Theatre.js
  updateCameraFromProps();
  
  // Renderizar a cena
  renderer.render(scene, camera);
}

/**
 * Atualizar a câmera com base nas propriedades do Theatre.js
 */
function updateCameraFromProps() {
  const values = Animation.getCurrentValues(Animation.cameraProps);
  
  if (values) {
    // Atualizar posição da câmera
    camera.position.x = values.position.x;
    camera.position.y = values.position.y;
    camera.position.z = values.position.z;
    
    // Atualizar ponto de foco
    camera.lookAt(
      values.lookAt.x,
      values.lookAt.y,
      values.lookAt.z
    );
    
    // Atualizar campo de visão
    camera.fov = values.fov;
    camera.updateProjectionMatrix();
  }
}

/**
 * Ativar interatividade com o modelo 3D
 */
function enableModelInteraction() {
  if (controls) {
    controls.enabled = true;
  }
  
  // Adicionar classe para permitir interatividade
  container.classList.add('interactive');
  
  // Mostrar dicas de interação
  const interactionHints = document.getElementById('interaction-hints');
  interactionHints.classList.remove('hidden');
  
  // Esconder dicas após alguns segundos
  setTimeout(() => {
    interactionHints.classList.add('fade-out');
    setTimeout(() => {
      interactionHints.classList.add('hidden');
    }, 1000);
  }, 5000);
}

/**
 * Adicionar um objeto à cena
 * @param {THREE.Object3D} object - Objeto 3D a ser adicionado
 * @param {string} name - Nome para referência do objeto
 */
function addObjectToScene(object, name) {
  scene.add(object);
  
  if (name) {
    sceneObjects[name] = object;
  }
  
  return object;
}

/**
 * Obter um objeto da cena pelo nome
 * @param {string} name - Nome do objeto a ser obtido
 * @returns {THREE.Object3D|null} O objeto da cena ou null se não encontrado
 */
function getSceneObject(name) {
  return sceneObjects[name] || null;
}

// Exportar funções e variáveis para uso em outros módulos
export {
  initThreeScene,
  animateThreeScene,
  enableModelInteraction,
  addObjectToScene,
  getSceneObject,
  updateSceneSize,
  scene,
  camera,
  renderer
};

// Criar aliases para manter compatibilidade com importações existentes
export const initScene = initThreeScene;
export const setupSceneInteractivity = enableModelInteraction;