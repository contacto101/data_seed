(function(){
  const cfg = window.DS_HUBSPOT_FORM_CONFIG || {};
  if(!cfg.portalId || !cfg.formGuid){
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({event:'hubspot_adapter_inactive', reason:'missing_portal_or_form_guid'});
    return;
  }
  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${cfg.portalId}/${cfg.formGuid}`;
  const map = cfg.fieldMap || {
    nombre: 'firstname',
    email: 'email',
    empresa: 'company',
    sistemas: 'sistemas_principales',
    objetivo: 'objetivo_del_cliente',
    producto_interes: 'producto_interes',
    lead_source: 'lead_source',
    sitio_web: 'website',
    que_vende: 'que_vende',
    rubro: 'rubro',
    region_objetivo: 'region_objetivo',
    palabras_clave: 'palabras_clave',
    vende_estado: 'vende_estado'
  };
  document.addEventListener('submit', async function(event){
    const form = event.target;
    if(!form.matches('[data-hubspot-ready="true"]')) return;
    event.preventDefault();
    const fd = new FormData(form);
    const fields = [];
    Object.entries(map).forEach(([local, hubspot]) => {
      const value = fd.get(local);
      if(value !== null && String(value).trim() !== '') fields.push({name: hubspot, value: String(value)});
    });
    fields.push({name:'page_url', value: window.location.href});
    const payload = { fields, context: { pageUri: window.location.href, pageName: document.title } };
    const submit = form.querySelector('[type="submit"]');
    const old = submit ? submit.textContent : '';
    if(submit){ submit.disabled = true; submit.textContent = 'Enviando…'; }
    try{
      const response = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
      if(!response.ok) throw new Error(`HubSpot ${response.status}`);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event:'hubspot_form_success', form_id: form.id || form.className});
      window.location.href = cfg.redirectUrl || '/gracias.html';
    }catch(err){
      console.warn('HubSpot form failed; falling back to native form submit', err);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event:'hubspot_form_error', message:String(err)});
      form.removeAttribute('data-hubspot-ready');
      form.submit();
    }finally{
      if(submit){ submit.disabled = false; submit.textContent = old; }
    }
  });
})();
