(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  root.classList.add('js');
  var langButton = document.getElementById('lang-toggle');
  var themeButton = document.getElementById('theme-toggle');
  var menuButton = document.getElementById('menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // The page remains usable when storage is disabled.
    }
  }

  function applyLanguage(language) {
    var isChinese = language === 'zh';
    body.classList.toggle('zh', isChinese);
    root.lang = isChinese ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-en]').forEach(function (element) {
      var value = isChinese ? element.getAttribute('data-zh') : element.getAttribute('data-en');
      if (value !== null) {
        element.innerHTML = value;
      }
    });
    document.querySelectorAll('[data-aria-en]').forEach(function (element) {
      var value = isChinese ? element.getAttribute('data-aria-zh') : element.getAttribute('data-aria-en');
      if (value) {
        element.setAttribute('aria-label', value);
      }
    });
    if (langButton) {
      langButton.textContent = isChinese ? 'EN' : '中文';
      langButton.setAttribute('aria-pressed', String(isChinese));
    }
    writeStorage('homepage-language', isChinese ? 'zh' : 'en');
  }

  var initialLanguage = readStorage('homepage-language') === 'zh' ? 'zh' : 'en';
  applyLanguage(initialLanguage);

  if (langButton) {
    langButton.addEventListener('click', function () {
      applyLanguage(body.classList.contains('zh') ? 'en' : 'zh');
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    if (themeButton) {
      var isDark = theme === 'dark';
      themeButton.setAttribute('aria-pressed', String(isDark));
      themeButton.setAttribute('title', isDark ? 'Use light theme' : 'Use dark theme');
    }
    writeStorage('homepage-theme', theme);
  }

  var savedTheme = readStorage('homepage-theme');
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

  if (themeButton) {
    themeButton.addEventListener('click', function () {
      var nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  function closeMenu() {
    if (!mobileNav || !menuButton) {
      return;
    }
    mobileNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  }

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      body.classList.toggle('menu-open', isOpen);
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
  }

  var progress = document.getElementById('reading-progress');
  function updateProgress() {
    if (!progress) {
      return;
    }
    var height = root.scrollHeight - window.innerHeight;
    var ratio = height > 0 ? window.scrollY / height : 0;
    progress.style.width = Math.max(0, Math.min(100, ratio * 100)) + '%';
  }
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  var revealElements = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealElements.forEach(function (element) { revealObserver.observe(element); });
  } else {
    revealElements.forEach(function (element) { element.classList.add('in'); });
  }

  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-observe]'));
  var railLinks = Array.prototype.slice.call(document.querySelectorAll('.chapter-rail a[data-section]'));
  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        railLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('data-section') === entry.target.id);
        });
      });
    }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }
})();
