(() => {
  "use strict";
  // Backward compatibility forwarder
  if (!window.EnemyRegistry) {
    console.warn("[EnemyRegistry] Proxy fallback used.");
  }
})();
