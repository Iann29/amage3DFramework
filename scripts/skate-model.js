/**
 * skate-model.js - Carregamento e gerenciamento do modelo 3D do skate
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Variáveis globais
let skateModel;

/**
 * Carregar o modelo 3D do skate
 * @param {THREE.Scene} scene - Cena Three.js para adicionar o modelo
 * @returns {Promise} Promise que resolve quando o modelo for carregado
 */
export function loadSkateModel(scene) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    
    loader.load(
      'assets/models/skate.glb',
      (gltf) => {
        skateModel = gltf.scene;
        
        // IMPORTANTE: Configurar como invisível ANTES de adicionar à cena
        skateModel.visible = false;
        
        // Configurar propriedades iniciais
        skateModel.position.set(0, 0, 0);
        skateModel.scale.set(0.08, 0.08, 0.08);
        skateModel.rotation.set(0, 0, 0);
        
        // Configurar sombras
        skateModel.traverse(node => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        // Adicionar à cena (agora já invisível)
        scene.add(skateModel);
        
        // Expor globalmente para acesso do Theatre.js
        window.skateModel = skateModel;
        
        console.log('Modelo do skate carregado com sucesso (inicialmente invisível)');
        resolve(skateModel);
      },
      // Progresso
      (xhr) => {
        console.log(`Carregamento do modelo: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
      },
      // Erro
      (error) => {
        console.error('Erro ao carregar modelo:', error);
        createFallbackModel(scene);
        reject(error);
      }
    );
  });
}

/**
 * Criar um modelo substituto simples caso o carregamento falhe
 * @param {THREE.Scene} scene - Cena Three.js para adicionar o modelo
 */
function createFallbackModel(scene) {
  console.log('Criando modelo substituto simples');
  
  // Criar grupo
  const group = new THREE.Group();
  
  // Criar geométrica simples de skate (um deck retangular)
  const deckGeometry = new THREE.BoxGeometry(2, 0.1, 0.7);
  const deckMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const deck = new THREE.Mesh(deckGeometry, deckMaterial);
  deck.position.y = 0.1;
  group.add(deck);
  
  // Adicionar à cena
  scene.add(group);
  
  // Expor globalmente
  skateModel = group;
  window.skateModel = group;
  
  return group;
}

/**
 * Obter o modelo do skate
 * @returns {THREE.Object3D} Modelo do skate
 */
export function getSkateModel() {
  return skateModel;
}