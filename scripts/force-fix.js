/**
 * force-fix.js - Script para forçar correções de visibilidade e sincronização
 */

(function() {
  // Esta função será executada 1 segundo após o carregamento da página
  setTimeout(() => {
    // Verificar se o modelo do skate existe
    if (window.skateModel) {
      // Forçar visibilidade de acordo com o tempo do vídeo
      const videoElement = document.getElementById('skate-video');
      if (videoElement) {
        // Se o vídeo acabou de começar (< 2s), o skate deve estar invisível 
        if (videoElement.currentTime < 2) {
          window.skateModel.visible = false;
          console.log('FORÇA-FIX: Skate definido como invisível');
        } else {
          window.skateModel.visible = true;
          console.log('FORÇA-FIX: Skate definido como visível');
        }
      }
    }
  }, 1000);
})(); 