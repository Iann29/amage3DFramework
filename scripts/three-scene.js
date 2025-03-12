/**
 * three-scene.js - Gerenciamento da cena Three.js
 * Este módulo centraliza toda a configuração e renderização da cena 3D
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getCurrentValues, cameraProps } from './theatre-manager.js';
import { updateSkateModel } from './skate-model.js';

// Variáveis da cena Three.js
let scene;
let camera;
let renderer;
let controls;
let container;
let animationFrameId;
let isSceneReady = false;

// Exportar variáveis para uso em outros módulos
export let threeContainer;

/**
 * Inicializar a cena Three.js
 * @param {HTMLElement} containerElement - Elemento HTML para render
 * @param {Object} cameraPropsTJ - Propriedades da câmera do Theatre.js
 * @returns {Promise} Promessa resolvida quando a inicialização for concluída
 */
export function initThreeScene(containerElement, cameraPropsTJ) {
  return new Promise((resolve, reject) => {
    try {
      container = containerElement;
      
      // Criar cena
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      
      // Criar câmera
      camera = new THREE.PerspectiveCamera(
        50, // FOV
        container.clientWidth / container.clientHeight, // Aspect ratio
        0.1, // Near plane
        1000 // Far plane
      );
      camera.position.set(0, 1.5, 3);
      camera.lookAt(0, 0, 0);
      
      // Criar renderer
      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      
      // Adicionar canvas ao container
      container.appendChild(renderer.domElement);
      
      // Salvar referência ao container Three.js para outros módulos
      threeContainer = container;
      
      // Configurar controles de câmera (desativados na intro do site)
      controls = new OrbitControls(camera, renderer.domElement);
      // Desabilitar interatividade para a intro do site
      controls.enabled = false;
      controls.enableDamping = true;
      controls.enableRotate = false;
      controls.enablePan = false;
      controls.enableZoom = false;
      
      // Configurar iluminação
      setupLighting();
      
      // Configurar redimensionamento responsivo
      window.addEventListener('resize', onWindowResize);
      
      // Expor objetos globalmente para o Theatre.js
      exposeGlobally();
      
      // Iniciar loop de animação
      animate();
      
      isSceneReady = true;
      resolve();
    } catch (error) {
      console.error('Erro ao inicializar a cena Three.js:', error);
      reject(error);
    }
  });
}

// Expor objetos para uso global (necessário para o Theatre.js)
function exposeGlobally() {
  if (typeof window !== 'undefined') {
    window.renderer = renderer;
    window.scene = scene;
    window.camera = camera;
    console.log('Objetos Three.js expostos globalmente para uso do Theatre.js');
  }
}

/**
 * Loop de animação da cena Three.js
 */
function animate() {
  animationFrameId = requestAnimationFrame(animate);
  
  if (isSceneReady) {
    // Chamar diretamente o corpo da função interna de animação
    // para evitar conflito com a exportação
    if (controls) {
      controls.update();
    }
    
    updateCameraFromProps();
    
    renderer.render(scene, camera);
  }
}

/**
 * Redimensionar a cena ao redimensionar a janela
 * Esta função também é exportada para uso externo
 */
export function updateSceneSize() {
  if (!camera || !renderer || !container) return;
  
  // Atualizar propriedades da câmera
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  
  // Atualizar tamanho do renderer
  renderer.setSize(container.clientWidth, container.clientHeight);
  
  console.log('Dimensões da cena atualizadas:', container.clientWidth, container.clientHeight);
}

/**
 * Método original para redimensionamento interno
 * Agora apenas chama updateSceneSize para evitar duplicação
 */
function onWindowResize() {
  updateSceneSize();
}

/**
 * Configurar a iluminação da cena
 */
function setupLighting() {
  // Adicionar luz ambiente
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Adicionar luz direcional (como luz solar)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // Adicionar uma luz extra de preenchimento para evitar sombras muito escuras
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-1, 0.5, -1);
  scene.add(fillLight);
  
  console.log('Iluminação da cena configurada para melhor visualização do modelo');
}

/**
 * Atualizar a câmera com base nas propriedades do Theatre.js
 */
export function updateCameraFromProps() {
  // Verificar se cameraProps está inicializado antes de tentar obter valores
  if (!cameraProps) {
    console.warn('⚠️ cameraProps não está definido!');
    return; // Sair da função se cameraProps não estiver definido
  }
  
  try {
    // Obter valores do Theatre.js
    const values = getCurrentValues(cameraProps);
    
    // Verificação robusta para garantir que todos os valores necessários existem
    if (values && values.position && values.lookAt) {
      // Atualizar posição da câmera
      if (values.position.x !== undefined) {
        camera.position.x = values.position.x;
      }
      if (values.position.y !== undefined) {
        camera.position.y = values.position.y;
      }
      if (values.position.z !== undefined) {
        camera.position.z = values.position.z;
      }
      
      // Atualizar ponto de foco
      camera.lookAt(
        values.lookAt.x || 0,
        values.lookAt.y || 0,
        values.lookAt.z || 0
      );
      
      // Atualizar campo de visão
      if (values.fov !== undefined) {
        camera.fov = values.fov;
        camera.updateProjectionMatrix();
      }
    }
    
    // Forçar renderização após atualizar a câmera
    if (renderer && scene) {
      renderer.render(scene, camera);
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar a câmera:', error);
  }
}

/**
 * Adicionar um objeto 3D à cena
 * @param {THREE.Object3D} object - Objeto Three.js para adicionar à cena
 */
export function addToScene(object) {
  if (!scene) return;
  scene.add(object);
}

/**
 * Remover um objeto 3D da cena
 * @param {THREE.Object3D} object - Objeto Three.js para remover da cena
 */
export function removeFromScene(object) {
  if (!scene) return;
  scene.remove(object);
}

/**
 * Limpar e desativar a cena Three.js
 */
export function cleanupThreeScene() {
  // Cancelar loop de animação
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  // Remover event listeners
  window.removeEventListener('resize', onWindowResize);
  
  // Limpar renderer
  if (renderer) {
    renderer.dispose();
    if (container && renderer.domElement) {
      container.removeChild(renderer.domElement);
    }
  }
  
  // Limpar controles
  if (controls) {
    controls.dispose();
  }
  
  // Limpar cena
  if (scene) {
    while (scene.children.length > 0) {
      const object = scene.children[0];
      scene.remove(object);
    }
  }
  
  // Resetar variáveis
  scene = null;
  camera = null;
  renderer = null;
  controls = null;
  isSceneReady = false;
}

/**
 * Obter a referência para a câmera atual
 * @returns {THREE.Camera} Câmera atual da cena
 */
export function getCamera() {
  return camera;
}

/**
 * Obter a referência para a cena atual
 * @returns {THREE.Scene} Cena atual
 */
export function getScene() {
  return scene;
}

/**
 * Obter a referência para o renderer atual
 * @returns {THREE.WebGLRenderer} Renderer atual
 */
export function getRenderer() {
  return renderer;
}

/**
 * Configurar as propriedades da câmera para o Theatre.js
 * @param {Object} props - Propriedades da câmera do Theatre.js
 */
export function setCameraProps(props) {
  cameraProps = props;
}

/**
 * Exportar a função de animação para uso externo
 * Esta função permite animar elementos do Three.js a partir de outros módulos
 */
export function animateThreeScene() {
  if (!isSceneReady) return;
  
  // Atualizar elementos dinâmicos da cena
  if (controls) {
    controls.update();
  }
  
  // Atualizar a câmera com base nos valores do Theatre.js
  updateCameraFromProps();
  
  // Atualizar o modelo do skate com base nas propriedades do Theatre.js
  updateSkateModel();
  
  // Renderizar a cena
  renderer.render(scene, camera);
}

/**
 * Ativar interatividade com o modelo 3D
 */
export function enableModelInteractivity() {
  if (!isSceneReady || !controls) return;
  
  // Configurar os controles de órbita para interação do usuário
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  
  // Opcionalmente, ajustar limites e comportamento dos controles
  controls.minDistance = 1;
  controls.maxDistance = 10;
  controls.dampingFactor = 0.1;
}
