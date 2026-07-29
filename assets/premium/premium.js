(function () {
    'use strict';

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- Broken-image fallback ------------------------------------------------
       A handful of bundled assets are corrupted (HTML saved with a .jpg
       extension from the original scrape). Rather than show a broken-image
       icon, collapse the empty slot: hide the <li> wrapper when the image is
       its only content, otherwise just hide the image itself. */
    var hideBrokenImage = function (img) {
        var parent = img.parentElement;
        if (parent && parent.tagName === 'LI' && parent.children.length === 1) {
            parent.style.display = 'none';
        } else {
            img.style.display = 'none';
        }
    };
    document.querySelectorAll('img').forEach(function (img) {
        if (img.complete && img.naturalWidth === 0) {
            hideBrokenImage(img);
        } else {
            img.addEventListener('error', function () { hideBrokenImage(img); }, { once: true });
        }
    });

    /* ---- Sticky header glass state on scroll -------------------------------- */
    var header = document.getElementById('masthead');
    if (header) {
        var onScroll = function () {
            if (window.scrollY > 24) {
                header.classList.add('cz-scrolled');
            } else {
                header.classList.remove('cz-scrolled');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---- Count-up for stat numbers (.countn) -------------------------------- */
    var counters = document.querySelectorAll('.countn');
    if (counters.length) {
        var parseCount = function (text) {
            var match = text.match(/^([^\d]*)([\d,.]+)(.*)$/);
            if (!match) return null;
            var prefix = match[1] || '';
            var numStr = match[2];
            var suffix = match[3] || '';
            var decimals = numStr.indexOf('.') > -1 ? numStr.split('.')[1].length : 0;
            var value = parseFloat(numStr.replace(/,/g, ''));
            if (isNaN(value)) return null;
            return { prefix: prefix, value: value, decimals: decimals, suffix: suffix };
        };

        var animateCount = function (el) {
            var parsed = parseCount(el.textContent.trim());
            if (!parsed) return;
            if (reduceMotion) return;

            var duration = 1400;
            var start = null;

            var frame = function (timestamp) {
                if (!start) start = timestamp;
                var progress = Math.min((timestamp - start) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = parsed.value * eased;
                el.textContent = parsed.prefix + current.toFixed(parsed.decimals) + parsed.suffix;
                if (progress < 1) {
                    window.requestAnimationFrame(frame);
                } else {
                    el.textContent = parsed.prefix + parsed.value.toFixed(parsed.decimals) + parsed.suffix;
                }
            };
            window.requestAnimationFrame(frame);
        };

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.6 });
            counters.forEach ? counters.forEach(function (c) { observer.observe(c); })
                : Array.prototype.forEach.call(counters, function (c) { observer.observe(c); });
        }
    }

    /* ---- Scroll-reveal blur-in (footer columns) ----------------------------- */
    var revealEls = document.querySelectorAll('.cz-reveal');
    if (revealEls.length) {
        if (reduceMotion || !('IntersectionObserver' in window)) {
            Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-visible'); });
        } else {
            var revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            Array.prototype.forEach.call(revealEls, function (el) { revealObserver.observe(el); });
        }
    }

    /* Note: the previous "magnetic hover" handler was removed deliberately.
       It wrote an inline transform on every mousemove, which fought the CSS
       hover transform and produced the visible wobble/jitter on the hero CTA
       and a layout jump on the percentage-width "Connect with us" button.
       Hover motion is now handled entirely in CSS. */
})();
