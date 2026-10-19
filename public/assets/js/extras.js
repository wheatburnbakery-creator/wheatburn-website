(function () {
  var ADDRESS = 'KG 605 St, Kigali, Rwanda';

  function waLink(text) {
    if (window.WB && typeof WB.whatsappLink === 'function') return WB.whatsappLink(text);
    return '';
  }

  function addWhatsApp() {
    document.querySelectorAll('button').forEach(function (b) {
      if (b.dataset.waDone || !/add to basket/i.test(b.textContent)) return;
      b.dataset.waDone = '1';
      var card = b.closest('article, .product-card, .card, li') || b.parentElement;
      var h = card.querySelector('h2, h3, h4');
      var name = h ? h.textContent.trim() : 'a product';
      var href = waLink('Hello Wheatburn! I would like to order: ' + name + '.');
      if (!href) return;
      var a = document.createElement('a');
      a.className = 'btn btn-ghost';
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Order on WhatsApp';
      a.style.display = 'block';
      a.style.textAlign = 'center';
      a.style.marginTop = '.5rem';
      b.insertAdjacentElement('afterend', a);
    });
  }

  function addMap() {
    var page = document.body.dataset.page || '';
    if (page !== 'contact' && location.pathname.indexOf('contact') < 0) return;
    var main = document.querySelector('main');
    if (!main || document.getElementById('find-us')) return;
    var q = encodeURIComponent(ADDRESS);
    var s = document.createElement('section');
    s.className = 'section';
    s.id = 'find-us';
    s.innerHTML = '<div class="wrap"><p class="eyebrow">Find us</p><h2>Visit the counter</h2>' +
      '<p class="lede">KG 605 St, Kigali · Open every day, 07:00–24:00</p>' +
      '<iframe title="Map to Wheatburn Bakery" src="https://www.google.com/maps?q=' + q + '&output=embed" ' +
      'width="100%" height="320" style="border:0;border-radius:12px" loading="lazy"></iframe>' +
      '<div class="btn-row"><a class="btn btn-primary" target="_blank" rel="noopener" ' +
      'href="https://www.google.com/maps/dir/?api=1&destination=' + q + '">Get directions</a></div></div>';
    main.appendChild(s);
  }

  function run() { addMap(); }
  document.addEventListener('DOMContentLoaded', run);
  var t;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(run, 150); })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
