/**
 * theatre-fix.js - Corrige problemas de atualização do Theatre.js
 * Este script força a atualização dos objetos 3D quando os valores são alterados na interface
 */

// Contador para limitar tentativas
let retryCount = 0;
const MAX_RETRIES = 20; // Limitar a 20 tentativas (20 segundos)

// Este script será executado após tudo estar carregado
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    console.log('🛠️ Aplicando correção para o Theatre.js...');
    fixTheatreUpdates();
  }, 3500); // Aumentar para 3.5 segundos para garantir que tudo está carregado
});

/**
 * Aplicar correção para o Theatre.js
 */
function fixTheatreUpdates() {
  // Monitorar cliques e movimentos na interface do Theatre.js
  // Verificar múltiplos seletores possíveis
  const studioElement = 
    document.querySelector('.theatre-studio-root') || 
    document.querySelector('[data-reactroot]') || 
    document.querySelector('#theatrejs-studio-root');
  
  if (!studioElement) {
    retryCount++;
    if (retryCount > MAX_RETRIES) {
      console.warn('❌ Theatre Studio não encontrado após múltiplas tentativas. Fix não aplicado.');
      return;
    }
    console.warn(`⚠️ Elemento do Theatre Studio não encontrado. Tentativa ${retryCount}/${MAX_RETRIES}...`);
    setTimeout(fixTheatreUpdates, 1000);
    return;
  }
  
  console.log('✅ Elemento do Theatre Studio encontrado, aplicando fix...');
  
  // Monitorar eventos de interação
  studioElement.addEventListener('mousedown', forceUpdate);
  studioElement.addEventListener('mousemove', forceUpdate);
  studioElement.addEventListener('mouseup', forceUpdate);
  studioElement.addEventListener('input', forceUpdate);
  studioElement.addEventListener('change', forceUpdate);
  
  // Implantar correção a cada 200ms
  setInterval(forceUpdate, 200);
  
  console.log('✅ Correção do Theatre.js aplicada com sucesso!');
}

/**
 * Forçar atualização de todos os objetos da cena
 */
function forceUpdate() {
  try {
    // Tentar importações dinâmicas
    const updateFunctions = window.theatreUpdateFunctions || {};
    
    if (typeof updateFunctions.updateSkateModel === 'function') {
      updateFunctions.updateSkateModel();
    }
    
    if (typeof updateFunctions.updateCameraFromProps === 'function') {
      updateFunctions.updateCameraFromProps();
    }
    
    // Verificar se temos acesso às funções diretamente
    if (window.updateSkateModel) {
      window.updateSkateModel();
    }
    
    if (window.updateCameraFromProps) {
      window.updateCameraFromProps();
    }
    
    // Renderizar a cena
    if (window.renderer && window.scene && window.camera) {
      window.renderer.render(window.scene, window.camera);
    }
  } catch (error) {
    // Silenciar erros para evitar spam
  }
}
