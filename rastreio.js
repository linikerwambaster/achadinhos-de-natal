// Achadinhos de Natal: vitrine do grupo, botão "Entrar no grupo" e Pixel da Meta só depois do "Aceitar" (LGPD).
(function () {
  var CONFIG = {
    pixel: '1677757857186086',
    vitrine: 'https://webhook.linikerwambaster.com.br/webhook/achadinhos-vitrine',
    convite: 'https://chat.whatsapp.com/KCUySoRezpXLLUjYpcBWch'
  };
  var CHAVE = 'ach-cookies';
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';

  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, v); } catch (e) {} }

  // ---------- Pixel da Meta (carrega só com consentimento; em localhost só loga)
  var pixelOn = false;
  function ligarPixel() {
    if (pixelOn) return; pixelOn = true;
    if (local) { console.log('[achadinhos] pixel ligado (localhost: não envia)'); return; }
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', CONFIG.pixel);
    window.fbq('track', 'PageView');
  }
  function evento(nome, dados) {
    if (!pixelOn) return;
    if (local) { console.log('[achadinhos] evento', nome, dados || ''); return; }
    if (window.fbq) window.fbq('track', nome, dados || {});
  }

  // ---------- aviso de cookies
  var aviso = document.getElementById('cookies');
  function mostrarAviso(on) { aviso.classList.toggle('on', on); document.body.classList.toggle('com-aviso', on); }
  var escolha = ler();
  if (escolha === 'aceito') ligarPixel(); else if (escolha !== 'recusado') mostrarAviso(true);
  document.getElementById('ck-sim').onclick = function () { gravar('aceito'); mostrarAviso(false); ligarPixel(); };
  document.getElementById('ck-nao').onclick = function () {
    gravar('recusado'); mostrarAviso(false);
    if (window.fbq) window.fbq('consent', 'revoke');
    document.cookie = '_fbp=; Max-Age=0; path=/'; document.cookie = '_fbc=; Max-Age=0; path=/';
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-cookies]'), function (a) {
    a.onclick = function (e) { e.preventDefault(); mostrarAviso(true); };
  });

  // ---------- botões "Entrar no grupo": Lead e depois o convite
  function convite() { return CONFIG.convite; }
  Array.prototype.forEach.call(document.querySelectorAll('.entrar'), function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      evento('Lead', { content_name: 'grupo_whatsapp_achadinhos' });
      var destino = convite();
      setTimeout(function () { location.href = destino; }, pixelOn && !local ? 350 : 0);
    });
  });

  // ---------- botão fixo aparece depois do primeiro botão sair da tela
  var fixo = document.getElementById('fixo'), topo = document.getElementById('btn-topo');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { fixo.classList.toggle('on', !es[0].isIntersecting && es[0].boundingClientRect.top < 0); }).observe(topo);
  }

  // ---------- vitrine: últimas ofertas que caíram no grupo + link do grupo que está aceitando gente
  function brl(v) { return 'R$ ' + Number(v).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  fetch(CONFIG.vitrine, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
    if (j && /^https:\/\/chat\.whatsapp\.com\//.test(j.convite || '')) {
      CONFIG.convite = j.convite;
      Array.prototype.forEach.call(document.querySelectorAll('.entrar'), function (b) { b.href = j.convite; });
    }
    var of = (j && j.ofertas || []).filter(function (o) { return o.imagem && o.por; }).slice(0, 6);
    if (!of.length) return;
    document.getElementById('vitrine').innerHTML = of.map(function (o) {
      return '<div class="card"><div class="img"><img loading="lazy" src="' + esc(o.imagem) + '" alt="' + esc(o.titulo) + '">' +
        (o.desconto ? '<span class="off">-' + o.desconto + '%</span>' : '') + '</div><div class="txt">' +
        '<span class="g">' + esc(o.gancho || o.titulo) + '</span>' +
        (o.de > o.por ? '<span class="de">' + brl(o.de) + '</span>' : '') +
        '<span class="por">' + brl(o.por) + '</span><span class="q">Postado ' + esc(o.quando) + '</span></div></div>';
    }).join('');
    document.getElementById('caiu').hidden = false;
  }).catch(function () {});
})();
