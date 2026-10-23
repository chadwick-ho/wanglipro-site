/* WangLi static enquiries: FormSubmit forwards mail; GitHub never stores enquiries. */
(() => {
  'use strict';
  const assetRoot = new URL('.', document.currentScript.src);
  const email = 'gieng9rhskien4377@gmail.com';
  const names = {name:'Nom',email:'E-mail',company:'Entreprise / organisme',country:'Pays de destination',profile:'Profil',phone:'Téléphone / WhatsApp',product:'Produit / modèle',quantity:'Quantité estimée',message:'Projet et personnalisation',dimensions:'Dimensions / matériau / couleur',deadline:'Date / destination',spec_url:'Cahier des charges',source_url:'Page produit'};
  const productId = new URLSearchParams(location.search).get('produit');
  const products = productId ? fetch(new URL('products.json', assetRoot)).then(r => r.ok ? r.json() : {}).catch(() => ({})) : Promise.resolve({});
  document.querySelectorAll('form.wl-form').forEach(form => {
    const button = form.querySelector('button[type="submit"]');
    const status = document.createElement('p');
    status.className = 'wl-notice'; status.hidden = true;
    status.setAttribute('role','status'); status.tabIndex = -1;
    form.querySelector('.wl-form-intro').after(status);
    const say = (text, failure = false) => {
      status.textContent = text; status.hidden = false;
      status.className = 'wl-notice '+(failure ? 'wl-error' : 'wl-success');
      status.focus();
    };
    const setHidden = (name, value) => {
      let field = form.elements.namedItem(name);
      if (!field) { field = document.createElement('input'); field.type='hidden'; field.name=name; form.append(field); }
      field.value = value;
    };
    setHidden('_url', location.origin+location.pathname);
    setHidden('_next', new URL('../merci/', new URL('.', assetRoot)).href);
    products.then(map => {
      const product = map[productId];
      if (product && !form.elements.namedItem('product').value) {
        form.elements.namedItem('product').value = product.name;
        setHidden('source_url', product.url);
      }
    });
    const emailButton = document.createElement('button');
    emailButton.type='button'; emailButton.className='wl-email-backup';
    emailButton.textContent='Envoyer depuis ma messagerie';
    form.querySelector('.wl-form-actions').after(emailButton);
    emailButton.addEventListener('click', () => {
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const body = Object.entries(names).map(([key,label]) => data.get(key) ? label+': '+data.get(key) : '').filter(Boolean).join('\n\n');
      let draft = form.querySelector('.wl-email-draft');
      if (!draft) {
        draft=document.createElement('div'); draft.className='wl-email-draft wl-form-full';
        form.querySelector('.wl-form-grid').append(draft);
      }
      draft.replaceChildren();
      const hint=document.createElement('p');
      hint.textContent='Copiez cette demande dans votre e-mail ou ouvrez votre messagerie. La demande est envoyée seulement lorsque vous validez l’envoi dans votre messagerie.';
      const summary=document.createElement('textarea'); summary.readOnly=true; summary.rows=9;
      summary.setAttribute('aria-label','Résumé de votre demande'); summary.value=body;
      const link=document.createElement('a'); link.className='wl-whatsapp-link';
      link.textContent='Ouvrir ma messagerie';
      link.href='mailto:'+email+'?subject='+encodeURIComponent('WangLi Pro — demande de devis')+'&body='+encodeURIComponent(body);
      const copy=document.createElement('button'); copy.type='button'; copy.className='wl-email-backup'; copy.textContent='Copier la demande';
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(body); copy.textContent='Demande copiée'; }
        catch { summary.focus(); summary.select(); copy.textContent='Sélectionnez et copiez le texte'; }
      });
      draft.append(hint,summary,link,copy); summary.focus();
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (form.dataset.sending === '1' || !form.reportValidity()) return;
      const spec = form.elements.namedItem('spec_url');
      spec.setCustomValidity('');
      if (spec.value && !/^https?:\/\//i.test(spec.value)) {
        spec.setCustomValidity('Utilisez un lien commençant par https:// ou http://.');
        spec.reportValidity(); return;
      }
      if (form.elements.namedItem('_honey').value) return;
      form.dataset.sending='1'; button.disabled=true;
      const oldText=button.textContent; button.textContent='Envoi en cours…';
      const controller=new AbortController();
      const timer=setTimeout(() => controller.abort(),25000);
      try {
        const response=await fetch('https://formsubmit.co/ajax/'+email, {
          method:'POST',body:new FormData(form),headers:{Accept:'application/json'},signal:controller.signal
        });
        const result=await response.json();
        if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Not accepted');
        say('Votre demande a été transmise au service d’envoi. Vous pouvez aussi nous contacter sur WhatsApp pour compléter votre projet.');
        button.textContent='Demande transmise';
      } catch {
        say('L’envoi n’a pas pu être confirmé. Vos informations sont conservées dans ce formulaire. Utilisez WhatsApp ou « Envoyer depuis ma messagerie », ou réessayez.',true);
        button.disabled=false; button.textContent=oldText;
      } finally {
        clearTimeout(timer); delete form.dataset.sending;
      }
    });
    form.elements.namedItem('spec_url').addEventListener('input',event => event.target.setCustomValidity(''));
    form.addEventListener('input',() => { if (!form.dataset.sending) {button.disabled=false;button.textContent='Demander mon devis personnalisé →';} });
    button.disabled=false;
  });
})();
