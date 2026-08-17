/* Harness Check product page: language, scorecard, evidence interactions. */
(function () {
  'use strict';

  var DATA_URL = 'data/demo-scorecard.json';
  var command = 'python3 harness_score.py /path/to/harness --mode working-tree --mode ci --format json --output scorecard.json';
  var data = null;
  var activeMode = 'working-tree';
  var selectedId = null;
  var FALLBACK = {
    target: 'Harness', targetLabel: 'demo scorecard',
    score: { value: 86, max: 100, confidence: 71, decision: 'CONDITIONAL', maturity: { name: 'Cross-host governance', nameEn: 'Cross-host governance' }, caps: [] },
    dimensions: [], executions: [], hosts: [],
    profile: { score: { value: 35, max: 35, confidence: 35, decision: 'CONDITIONAL' }, controls: [] }
  };

  function lang() { return document.documentElement.classList.contains('lang-zh') ? 'zh' : 'en'; }
  function text(zh, en) { return lang() === 'zh' ? zh : en; }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }
  function setTitle() {
    document.title = text('hekouwang Harness Doctor — 让 Harness 不只会跑，还能被证明', 'hekouwang Harness Doctor — Make every Harness provable');
  }
  function syncLanguageUrl(value) {
    try {
      var url = new URL(location.href);
      url.searchParams.set('lang', value);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) {}
  }
  function setLanguage(value, remember) {
    var isZh = value === 'zh';
    document.documentElement.classList.toggle('lang-zh', isZh);
    document.documentElement.lang = isZh ? 'zh-CN' : 'en';
    var en = document.getElementById('btnEn');
    var zh = document.getElementById('btnZh');
    if (en) en.setAttribute('aria-pressed', String(!isZh));
    if (zh) zh.setAttribute('aria-pressed', String(isZh));
    if (remember) {
      try { localStorage.setItem('hkw-harness-lang', value); } catch (e) {}
      syncLanguageUrl(value);
    }
    setTitle();
    if (data) renderAll();
  }

  function statusClass(status) {
    return status === 'fail' ? 'fail' : status === 'partial' ? 'partial' : 'pass';
  }
  function statusLabel(status) {
    if (status === 'fail') return text('失败', 'fail');
    if (status === 'partial') return text('部分', 'partial');
    return text('通过', 'pass');
  }
  function activeItems() {
    if (activeMode === 'profile') {
      return (data.profile && data.profile.controls ? data.profile.controls : []).map(function (item, index) {
        return {
          id: 'profile-' + index,
          name: item.name,
          nameEn: item.nameEn || item.name,
          weight: item.weight,
          earned: item.earned,
          status: item.earned === item.weight ? 'pass' : 'partial',
          evidence: ['references/profiles/content-agent.json'],
          evidenceKind: item.evidenceKind || 'policy',
          description: text('内容 Profile 的策略声明；需要运行记录或人工凭证才能增加置信度。', 'A profile policy declaration; runtime or human evidence is still needed for confidence.')
        };
      });
    }
    return data.dimensions || [];
  }
  function activeSummary() {
    if (activeMode === 'profile' && data.profile) return data.profile.score;
    return data.score || FALLBACK.score;
  }
  function setDecisionClass(node, decision) {
    if (!node) return;
    node.classList.remove('ready', 'blocked', 'conditional');
    node.classList.add(String(decision || '').toLowerCase() === 'ready' ? 'ready' : String(decision || '').toLowerCase() === 'blocked' ? 'blocked' : 'conditional');
  }
  function renderOverview() {
    var summary = activeSummary();
    var score = document.getElementById('scoreValue');
    var max = document.querySelector('.big-score small');
    var decision = document.getElementById('decisionValue');
    var maturity = document.getElementById('maturityValue');
    var confidence = document.getElementById('confidenceValue');
    var confidenceBar = document.getElementById('confidenceBar');
    if (score) score.textContent = summary.value;
    if (max) max.textContent = '/' + (summary.max || 100);
    if (decision) { decision.textContent = summary.decision || 'CONDITIONAL'; setDecisionClass(decision, summary.decision); }
    if (maturity) maturity.textContent = activeMode === 'profile' ? text('领域 Profile', 'domain profile') : ((data.score.maturity && (lang() === 'zh' ? data.score.maturity.name : data.score.maturity.nameEn)) || '—');
    if (confidence) confidence.textContent = summary.confidence;
    if (confidenceBar) confidenceBar.style.width = Math.max(0, Math.min(100, summary.confidence || 0)) + '%';
    var label = document.getElementById('targetLabel');
    if (label) label.textContent = (data.targetLabel || data.target || 'Harness') + ' · ' + (activeMode === 'profile' ? 'content-agent' : activeMode);
  }
  function renderDimensionList() {
    var node = document.getElementById('dimensionList');
    if (!node) return;
    var items = activeItems();
    if (!items.length) { node.innerHTML = '<div class="loading-block">scorecard data unavailable</div>'; return; }
    if (!selectedId || !items.some(function (item) { return item.id === selectedId; })) selectedId = items[0].id;
    node.innerHTML = items.map(function (item) {
      var pct = item.weight ? Math.round(item.earned / item.weight * 100) : 0;
      var selected = item.id === selectedId ? ' selected' : '';
      var status = statusClass(item.status);
      return '<button class="dimension-item ' + status + selected + '" type="button" data-dimension="' + escapeHtml(item.id) + '" aria-pressed="' + (item.id === selectedId) + '">' +
        '<span class="dimension-name"><i class="dimension-status ' + status + '"></i>' + escapeHtml(lang() === 'zh' ? item.name : (item.nameEn || item.name)) + '</span>' +
        '<span class="dimension-score">' + item.earned + '/' + item.weight + '</span>' +
        '<span class="dimension-meter"><i style="width:' + pct + '%"></i></span>' +
        '</button>';
    }).join('');
    Array.prototype.forEach.call(node.querySelectorAll('[data-dimension]'), function (button) {
      button.addEventListener('click', function () {
        selectedId = button.getAttribute('data-dimension');
        renderDimensionList();
        renderEvidence();
      });
    });
  }
  function renderEvidence() {
    var node = document.getElementById('evidenceContent');
    var kind = document.getElementById('ledgerKind');
    if (!node) return;
    var item = activeItems().find(function (candidate) { return candidate.id === selectedId; });
    if (!item) { node.innerHTML = '<p class="empty-state">select a dimension</p>'; return; }
    var evidence = item.evidence && item.evidence.length ? item.evidence : ['references/profiles/content-agent.json'];
    if (kind) kind.textContent = (item.evidenceKind || (item.status === 'pass' ? 'direct' : 'mixed')).toUpperCase();
    node.innerHTML = '<span class="evidence-strength">' + escapeHtml((item.evidenceKind || (item.status === 'pass' ? 'direct' : 'mixed')).toUpperCase()) + ' · ' + escapeHtml(statusLabel(item.status)) + '</span>' +
      '<h3 class="evidence-title">' + escapeHtml(lang() === 'zh' ? item.name : (item.nameEn || item.name)) + '</h3>' +
      '<p class="evidence-detail">' + escapeHtml(item.description || text('自动评分维度；打开 JSON 可查看完整证据。', 'Scored dimension; open the JSON for the complete evidence set.')) + '</p>' +
      '<ul class="evidence-list">' + evidence.map(function (entry) { return '<li title="' + escapeHtml(entry) + '">' + escapeHtml(entry) + '</li>'; }).join('') + '</ul>';
  }
  function renderHosts() {
    var node = document.getElementById('hostMatrix');
    if (!node) return;
    node.innerHTML = (data.hosts || []).map(function (host) {
      return '<div class="host-cell"><b>' + escapeHtml(host.short || host.host) + '</b><span>' + escapeHtml(String(host.smokeTest || 'unknown').toUpperCase()) + '</span></div>';
    }).join('');
  }
  function renderProfile() {
    var node = document.getElementById('profileBars');
    if (!node || !data.profile || !data.profile.controls) return;
    node.innerHTML = data.profile.controls.map(function (item) {
      var pct = item.weight ? Math.round(item.earned / item.weight * 100) : 0;
      return '<div class="profile-row"><span>' + escapeHtml(lang() === 'zh' ? item.name : (item.nameEn || item.name)) + '</span><b>' + item.earned + '/' + item.weight + '</b><i style="--fill:' + pct + '%"></i></div>';
    }).join('');
  }
  function renderMode() {
    Array.prototype.forEach.call(document.querySelectorAll('.mode-tab'), function (tab) {
      var active = tab.getAttribute('data-mode') === activeMode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    renderOverview();
    renderDimensionList();
    renderEvidence();
  }
  function renderAll() {
    renderMode();
    renderHosts();
    renderProfile();
  }
  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () { toast.classList.remove('show'); }, 1700);
  }
  function copyCommand() {
    function done() { showToast(text('命令已复制', 'Command copied')); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(command).then(done).catch(function () { showToast(command); });
    } else { showToast(command); }
  }
  function setupLanguage() {
    var en = document.getElementById('btnEn');
    var zh = document.getElementById('btnZh');
    if (en) en.addEventListener('click', function () { setLanguage('en', true); });
    if (zh) zh.addEventListener('click', function () { setLanguage('zh', true); });
    setLanguage(lang(), false);
  }
  function setupTabs() {
    Array.prototype.forEach.call(document.querySelectorAll('.mode-tab'), function (tab) {
      tab.addEventListener('click', function () {
        activeMode = tab.getAttribute('data-mode') || 'working-tree';
        selectedId = null;
        renderMode();
      });
    });
  }
  function setupScroll() {
    var line = document.getElementById('scrollLine');
    function tick() {
      var total = document.documentElement.scrollHeight - window.innerHeight;
      if (line) line.style.width = (total > 0 ? window.scrollY / total * 100 : 0) + '%';
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }
  function setupReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { Array.prototype.forEach.call(elements, function (element) { element.classList.add('revealed'); }); return; }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    Array.prototype.forEach.call(elements, function (element) { observer.observe(element); });
    window.setTimeout(function () { Array.prototype.forEach.call(elements, function (element) { element.classList.add('revealed'); }); }, 1800);
  }
  function setupCopy() {
    var button = document.getElementById('copyCommand');
    if (button) button.addEventListener('click', copyCommand);
  }
  function loadData() {
    fetch(DATA_URL, { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('scorecard unavailable');
      return response.json();
    }).then(function (payload) { data = payload; renderAll(); }).catch(function () { data = FALLBACK; renderAll(); });
  }

  setupLanguage();
  setupTabs();
  setupScroll();
  setupReveal();
  setupCopy();
  loadData();
}());
