/* global Hooks, Babele */

Hooks.on('init', () => {
  if (typeof Babele !== 'undefined') {
    Babele.get().register({
      module: 'pf2e_pt-BR',
      lang: 'pt-BR',
      dir: 'compendium'
    });
  }
});
