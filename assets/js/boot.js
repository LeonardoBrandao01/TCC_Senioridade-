/* Executa antes da renderização: marca suporte a JS e aplica o tamanho de texto salvo. */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var s = window.localStorage.getItem('dss-scale');
    if (s === '1' || s === '1.15' || s === '1.3') d.style.setProperty('--scale', s);
  } catch (e) { /* armazenamento indisponível: segue com o padrão */ }
})();
