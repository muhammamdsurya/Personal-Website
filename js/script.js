document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Mobile menu ---
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const setMenu = (open) => {
        hamburger.classList.toggle('active', open);
        navMenu.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', open);
        document.body.classList.toggle('menu-open', open);
    };

    hamburger.addEventListener('click', () => setMenu(!navMenu.classList.contains('active')));
    navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));

    // --- 2. Navbar background on scroll ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // --- 3. Scroll reveal, staggered among siblings ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => {
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.setProperty('--i', siblings.indexOf(el));
        revealObserver.observe(el);
    });

    // --- 4. Active nav link ---
    const sections = document.querySelectorAll('section');
    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    // A thin band at 25–45% of the viewport: whichever section crosses it is current.
    // threshold must stay 0 — sections are taller than the band, so a ratio like 0.25 is never reached.
    }, { threshold: 0, rootMargin: '-25% 0px -55% 0px' });

    sections.forEach(sec => activeObserver.observe(sec));

    // --- 5. Contact form (Web3Forms) ---
    const contactForm = document.getElementById('portfolio-contact-form');
    const successAlert = document.getElementById('form-success-alert');
    const errorAlert = document.getElementById('form-error-alert');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        successAlert.classList.add('hidden');
        errorAlert.classList.add('hidden');

        let firstInvalid = null;
        contactForm.querySelectorAll('input[required], textarea[required]').forEach(field => {
            const value = field.value.trim();
            const invalid = !value || (field.type === 'email' && !emailRegex.test(value));
            field.parentElement.classList.toggle('invalid', invalid);
            field.setAttribute('aria-invalid', invalid);
            if (invalid && !firstInvalid) firstInvalid = field;
        });

        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const label = btnText.textContent;
        submitBtn.disabled = true;
        btnText.textContent = 'Sending…';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm)
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) throw new Error(data.message || 'Message not sent. Please try again.');

            successAlert.classList.remove('hidden');
            contactForm.reset();
            setTimeout(() => successAlert.classList.add('hidden'), 5000);
        } catch (error) {
            // fetch() rejects with TypeError on network failure; anything else is the API's message.
            errorAlert.querySelector('span').textContent = error instanceof TypeError
                ? 'Message not sent. Check your connection and try again.'
                : error.message;
            errorAlert.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            btnText.textContent = label;
        }
    });

    contactForm.querySelectorAll('input, textarea').forEach(f => {
        f.addEventListener('input', () => {
            f.parentElement.classList.remove('invalid');
            f.removeAttribute('aria-invalid');
        });
    });

    // --- 6. Project case studies (native <dialog> slide-over) ---
    // Each .project-card carries its screenshots (data-images) and a hidden .case-study block.
    const caseDialog = document.getElementById('case-study');
    const csBody = caseDialog.querySelector('.cs-body');
    const csImg = document.getElementById('cs-img');
    const csImgLink = document.getElementById('cs-img-link');
    const csCount = document.getElementById('cs-count');
    const csThumbs = document.getElementById('cs-thumbs');
    let images = [];
    let currentIndex = 0;

    const showImage = (i) => {
        currentIndex = (i + images.length) % images.length;
        csImg.src = csImgLink.href = images[currentIndex];
        csCount.textContent = `${currentIndex + 1} / ${images.length}`;
        [...csThumbs.children].forEach((t, n) => t.setAttribute('aria-current', n === currentIndex));
    };

    const makeThumb = (src, n) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = 'cs-thumb';
        thumb.setAttribute('aria-label', `Screenshot ${n + 1}`);
        const img = new Image();
        img.src = src;
        img.alt = '';
        thumb.append(img);
        thumb.addEventListener('click', () => showImage(n));
        return thumb;
    };

    document.querySelectorAll('.cs-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const card = trigger.closest('.project-card');
            images = card.dataset.images.split(',').map(src => src.trim());

            document.getElementById('cs-kicker').textContent = card.querySelector('.project-kicker').textContent;
            document.getElementById('cs-title').textContent = card.querySelector('.project-name').textContent;
            document.getElementById('cs-content').innerHTML = card.querySelector('.case-study').innerHTML;

            const links = document.createElement('div');
            links.className = 'cs-links';
            links.append(...[...card.querySelectorAll('.project-links a')].map(a => a.cloneNode(true)));
            document.getElementById('cs-footer').replaceChildren(card.querySelector('.project-tech').cloneNode(true), links);

            csImg.alt = card.querySelector('.project-img-wrapper img').alt;
            csThumbs.replaceChildren(...images.map(makeThumb));
            showImage(0);
            csBody.scrollTop = 0;
            caseDialog.showModal();
        });
    });

    caseDialog.querySelector('.cs-next').addEventListener('click', () => showImage(currentIndex + 1));
    caseDialog.querySelector('.cs-prev').addEventListener('click', () => showImage(currentIndex - 1));
    caseDialog.querySelector('.cs-close').addEventListener('click', () => caseDialog.close());
    // A click whose target is the dialog itself landed on the backdrop; Escape closes natively.
    caseDialog.addEventListener('click', (e) => { if (e.target === caseDialog) caseDialog.close(); });
    caseDialog.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    });

    // --- 7. Mirror portrait: tilts toward the pointer, drifts slowly when idle ---
    const stage = document.getElementById('portrait-stage');
    if (stage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const MAX_TILT = 14;      // degrees at full deflection
        const IDLE_AFTER = 1500;  // ms without input before the idle drift takes over
        const clamp = (v) => Math.max(-1, Math.min(1, v));
        const target = { x: 0, y: 0 };   // -1..1
        const current = { x: 0, y: 0 };
        let lastInput = -Infinity;
        let lastFrame = 0;
        let visible = false;

        const hero = document.querySelector('.hero');
        hero.addEventListener('pointermove', (e) => {
            const r = stage.getBoundingClientRect();
            target.x = clamp((e.clientX - (r.left + r.width / 2)) / r.width);
            target.y = clamp((e.clientY - (r.top + r.height / 2)) / r.height);
            lastInput = performance.now();
        });
        hero.addEventListener('pointerleave', () => { lastInput = -Infinity; });

        const frame = (now) => {
            if (!visible) return;
            if (now - lastInput > IDLE_AFTER) {
                const t = now / 1000;           // slow Lissajous drift: ~12 s and ~18 s periods
                target.x = Math.sin(t * 0.5) * 0.55;
                target.y = Math.sin(t * 0.35 + 1) * 0.4;
            }
            const dt = Math.min((now - lastFrame) / 1000, 0.1);
            lastFrame = now;
            const ease = 1 - Math.exp(-dt * 4);  // same feel at 60 Hz and 120 Hz
            current.x += (target.x - current.x) * ease;
            current.y += (target.y - current.y) * ease;

            const s = stage.style;
            s.setProperty('--ry', `${current.x * MAX_TILT}deg`);
            s.setProperty('--rx', `${-current.y * MAX_TILT}deg`);
            s.setProperty('--px', `${-current.x * 10}px`);
            s.setProperty('--py', `${-current.y * 10}px`);
            s.setProperty('--gx', `${50 + current.x * 45}%`);
            s.setProperty('--gy', `${40 + current.y * 45}%`);
            s.setProperty('--sx', `${50 - current.x * 60}%`);
            requestAnimationFrame(frame);
        };

        // Only animate while the portrait is on screen
        new IntersectionObserver(([entry]) => {
            const wasVisible = visible;
            visible = entry.isIntersecting;
            if (visible && !wasVisible) requestAnimationFrame((now) => { lastFrame = now; frame(now); });
        }).observe(stage);
    }
});
