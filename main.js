/* ============================================================
   DE TERUGKEER — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. Navigation: scroll class + mobile hamburger ── */
  const nav = document.querySelector('.main-nav');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav a');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── 2. Scroll Reveal (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ── 3. Hero background zoom on load ── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('load', () => heroBg.classList.add('loaded'), { once: true });
  }

  /* ── 4. FAQ Accordion ── */
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-question');
      if (btn) {
        btn.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          // Close all
          faqItems.forEach(i => i.classList.remove('open'));
          // Open clicked if it wasn't open
          if (!isOpen) item.classList.add('open');
        });
      }
    });
  }

  /* ── 5. "De Reis" Journey Timeline ── */
  const journeySection = document.getElementById('de-reis');
  const journeyNodes = document.querySelectorAll('.journey-node');
  const journeyFill = document.querySelector('.journey-line-fill');

  if (journeySection && journeyNodes.length) {
    const updateJourney = () => {
      const rect = journeySection.getBoundingClientRect();
      const sectionH = journeySection.offsetHeight;
      const windowH = window.innerHeight;

      // Progress: 0 when section top enters bottom of screen, 1 when section bottom reaches top
      const progress = Math.min(1, Math.max(0,
        (windowH - rect.top) / (sectionH + windowH * 0.5)
      ));

      if (journeyFill) {
        // Desktop: width, Mobile: height (handled via CSS)
        if (window.innerWidth > 1024) {
          journeyFill.style.width = (progress * 100) + '%';
        } else {
          journeySection.style.setProperty('--journey-fill', (progress * 100) + '%');
        }
      }

      // Activate nodes sequentially
      const nodeCount = journeyNodes.length;
      journeyNodes.forEach((node, i) => {
        const threshold = i / (nodeCount - 1);
        node.classList.toggle('active', progress >= threshold - 0.05);
      });
    };

    // Initial call + always-on first node
    if (journeyNodes[0]) journeyNodes[0].classList.add('active');
    window.addEventListener('scroll', updateJourney, { passive: true });
    updateJourney();
  }

  /* ── 6. Photo Grid Parallax ── */
  const photoMasonry = document.querySelector('.photo-masonry');
  if (photoMasonry) {
    const cols = Array.from(photoMasonry.querySelectorAll('.masonry-col'));
    const speeds = [0.06, 0, -0.06];
    let ticking = false;

    const applyParallax = () => {
      const rect = photoMasonry.getBoundingClientRect();
      // Offset from viewport center — clamped so shift never exceeds ~30px
      const rawOffset = (rect.top + rect.height / 2) - window.innerHeight / 2;
      const offset = Math.max(-500, Math.min(500, rawOffset));

      cols.forEach((col, i) => {
        const speed = speeds[i] || 0;
        col.style.transform = `translateY(${offset * speed}px)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });

    applyParallax();
  }

  /* ── 7. Donation Capsule: hide when #doneer is visible ── */
  const capsule = document.querySelector('.donation-capsule');
  const doneerSection = document.getElementById('doneer');

  if (capsule && doneerSection) {
    const capsuleObserver = new IntersectionObserver((entries) => {
      capsule.classList.toggle('hidden', entries[0].isIntersecting);
    }, { threshold: 0.3 });
    capsuleObserver.observe(doneerSection);
  }

  /* ── 8. Events Filter Tabs ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const eventCards = document.querySelectorAll('.event-card');

  if (filterBtns.length && eventCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.filter;

        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        eventCards.forEach(card => {
          const show = type === 'all' || card.dataset.type === type;
          card.style.display = show ? '' : 'none';
          card.style.opacity = show ? '' : '0';
        });
      });
    });
  }

  /* ── 9. Contact Form Validation ── */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.querySelector('.form-success');

  if (contactForm) {
    const requiredFields = contactForm.querySelectorAll('[required]');

    const validateField = (field) => {
      const group = field.closest('.form-group');
      if (!group) return true;
      const errorEl = group.querySelector('.form-error');
      let valid = true;

      if (!field.value.trim()) {
        valid = false;
        if (errorEl) errorEl.textContent = 'Dit veld is verplicht.';
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        valid = false;
        if (errorEl) errorEl.textContent = 'Voer een geldig e-mailadres in.';
      }

      group.classList.toggle('error', !valid);
      return valid;
    };

    // Live validation on blur
    requiredFields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.form-group')?.classList.contains('error')) {
          validateField(field);
        }
      });
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let allValid = true;

      requiredFields.forEach(field => {
        if (!validateField(field)) allValid = false;
      });

      if (allValid) {
        const formAction = contactForm.action;
        const submitBtn = contactForm.querySelector('[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        fetch(formAction, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        })
        .then(res => {
          if (res.ok) {
            contactForm.style.display = 'none';
            if (formSuccess) formSuccess.classList.add('show');
          } else {
            if (submitBtn) submitBtn.disabled = false;
          }
        })
        .catch(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
      }
    });
  }

  /* ── 10. Arabic Dividers: fade in on scroll ── */
  const dividers = document.querySelectorAll('.arabic-divider');
  if (dividers.length) {
    const dividerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          dividerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    dividers.forEach(d => {
      d.style.opacity = '0';
      d.style.transition = 'opacity 1s ease';
      dividerObserver.observe(d);
    });
  }

})();
