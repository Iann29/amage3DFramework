/**
 * three-setup.js - Configuração básica da cena Three.js
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadSkateModel } from './skate-model.js';

// Variáveis globais do Three.js
let scene, camera, renderer, controls;

/**
 * Inicializar a cena Three.js
 * @param {HTMLElement} container - Container para a cena
 * @returns {Promise} Promise que resolve quando a cena estiver pronta
 */
export function initThreeScene(container) {
  return new Promise(async (resolve, reject) => {
    try {
      // Criar cena
      scene = new THREE.Scene();
      scene.background = null; // Fundo transparente para sobrepor ao vídeo
      
      // Criar câmera
      camera = new THREE.PerspectiveCamera(
        75, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
      );
      camera.position.set(0, 1, 5);
      camera.lookAt(0, 0, 0);
      
      // Criar renderer
      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true // Fundo transparente
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      
      // Adicionar ao container
      container.appendChild(renderer.domElement);
      
      // Configurar controles de órbita
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enabled = true; // Já habilitados para início imediato
      
      // Configurar iluminação
      setupLighting();
      
      // Carregar modelo
      try {
        await loadSkateModel(scene);
      } catch (error) {
        console.warn('Erro ao carregar modelo:', error);
      }
      
      // Iniciar loop de animação
      animate();
      
      // Adicionar evento de redimensionamento
      window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      });
      
      // Expor objetos globalmente
      window.scene = scene;
      window.camera = camera;
      window.renderer = renderer;
      
      resolve({ scene, camera, renderer });
      
    } catch (error) {
      console.error('Erro ao configurar cena Three.js:', error);
      reject(error);
    }
  });
}

/**
 * Configurar iluminação da cena
 */
function setupLighting() {
  // Luz ambiente
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  
  // Luz direcional principal
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
  mainLight.position.set(5, 5, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);
  
  // Luz de preenchimento
  const fillLight = new THREE.DirectionalLight(0xaaaaff, 0.3);
  fillLight.position.set(-5, 2, -2);
  scene.add(fillLight);
}

/**
 * Loop de animação
 */
function animate() {
  requestAnimationFrame(animate);
  
  if (controls) {
    controls.update();
  }
  
  renderer.render(scene, camera);
}

/**
 * Obter a cena
 */
export function getScene() {
  return scene;
}