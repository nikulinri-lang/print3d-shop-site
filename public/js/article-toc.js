(function () {
  var nav = document.querySelector(".article-toc-nav");
  if (!nav || !("IntersectionObserver" in window)) return;

  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var byId = {};
  var targets = [];
  links.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (!el) return;
    byId[id] = a;
    targets.push(el);
  });
  if (!targets.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("is-active"); });
        link.classList.add("is-active");
      });
    },
    { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
  );
  targets.forEach(function (el) { observer.observe(el); });
})();
