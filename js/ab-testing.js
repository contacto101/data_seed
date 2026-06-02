(function(){
  var EXPERIMENT = 'hero_cta_copy_v1';
  var variants = ['control','publica'];
  var key = 'dataseed_ab_' + EXPERIMENT;
  var variant = localStorage.getItem(key);
  if(!variant){
    variant = variants[Math.floor(Math.random()*variants.length)];
    localStorage.setItem(key, variant);
  }
  document.documentElement.setAttribute('data-ab-'+EXPERIMENT, variant);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event:'ab_exposure', experiment:EXPERIMENT, variant:variant, page_path:location.pathname});
  document.addEventListener('DOMContentLoaded', function(){
    if(variant === 'publica' && location.pathname.endsWith('/index.html') || (variant === 'publica' && location.pathname === '/')){
      var secondary = document.querySelector('.hero-btns .btn-o');
      if(secondary){
        secondary.textContent = 'Ver Pública AI →';
        secondary.setAttribute('href','publica-ai.html');
        secondary.setAttribute('data-track','hero_publica_ai_variant');
      }
    }
  });
})();
