(function(l) {
  if (l.search.startsWith('?p=')) {
    var path = l.search.slice(3);
    window.history.replaceState({}, document.title, decodeURIComponent(path));
  }
})(window.location);
