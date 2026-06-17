(function(){
  window.dataLayer = window.dataLayer || [];
  function track(eventName, params){
    var payload = Object.assign({event: eventName, page_path: location.pathname, page_title: document.title}, params || {});
    window.dataLayer.push(payload);
    if (window.DataseedAnalyticsDebug) console.info('[Dataseed event]', payload);
  }
  window.DataseedTrack = track;
  track('page_view_dataseed');
  document.addEventListener('click', function(e){
    var el = e.target.closest('a,button,[data-track]');
    if(!el) return;
    var label = el.getAttribute('data-track') || el.textContent.trim().slice(0,80) || el.href || 'unknown';
    track('cta_click', {cta_label: label, cta_href: el.href || '', cta_location: el.closest('section')?.id || ''});
  });
  document.addEventListener('submit', function(e){
    if(e.target.matches('form')) track('form_submit_attempt', {form_id: e.target.id || e.target.className || 'form'});
  });
})();
