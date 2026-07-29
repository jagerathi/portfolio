/* Terminal typing effect for the hero "whoami" line + active nav highlight. */
(function () {
  // Mark active nav item based on current path.
  var path = location.pathname.replace(/\/index\.html$/, "/").replace(/index\.html$/, "");
  document.querySelectorAll("nav.cmds a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    var match = a.getAttribute("data-match");
    if (match && path.indexOf(match) !== -1) a.classList.add("active");
  });

  // Typewriter for any element with [data-type].
  var el = document.querySelector("[data-type]");
  if (!el) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var full = el.getAttribute("data-type");
  el.textContent = "";
  var i = 0;
  function tick() {
    if (i <= full.length) {
      el.textContent = full.slice(0, i);
      i++;
      setTimeout(tick, 45 + Math.random() * 40);
    }
  }
  setTimeout(tick, 350);
})();
