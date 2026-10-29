(function(l) {
  if (l.search.startsWith('?p=')) {
    var path = l.search.slice(3);
    // Only allow same-origin paths (start with /) and reject absolute URLs
    if (!path.startsWith('/') || path.includes('://') || path.includes(':')) {
      return;
    }
    try {
      var decoded = decodeURIComponent(path);
      // Ensure decoded path stays relative and safe
      if (!decoded.startsWith('/') || decoded.includes('://') || decoded.includes(':')) {
        return;
      }
      window.history.replaceState({}, document.title, decoded);
    } catch {
      // Ignore invalid URI
    }
  }
})(window.location);
