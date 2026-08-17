/* Harness Doctor guide: reading progress, active chapter and local copy affordances. */
(function () {
  'use strict';
  var progress = document.getElementById('guideProgress');
  var links = Array.prototype.slice.call(document.querySelectorAll('#guideNav a[data-section]'));
  var sections = links.map(function (link) { return document.getElementById(link.getAttribute('data-section')); }).filter(Boolean);

  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    if (progress) progress.style.width = (max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0) + '%';
  }

  function markActive() {
    var current = sections[0] && sections[0].id;
    var threshold = window.scrollY + 130;
    sections.forEach(function (section) {
      if (section.offsetTop <= threshold) current = section.id;
    });
    links.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-section') === current);
    });
  }

  function update() { updateProgress(); markActive(); }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}());
