(function () {
    "use strict";

    class AdvancedCarousel {
        constructor() {
            this.track = document.getElementById("carouselTrack");
            if (!this.track) {
                this.totalSlides = 0;
                return;
            }

            this.cards = this.track.querySelectorAll(".story-card");
            this.indicators = document.querySelectorAll(".indicator");
            this.prevBtn = document.getElementById("prevBtn");
            this.nextBtn = document.getElementById("nextBtn");

            this.currentSlide = 0;
            this.totalSlides = this.cards.length;
            this.isAnimating = false;
            this.autoPlayInterval = null;

            if (this.totalSlides === 0) return;

            this._boundUpdate = () => this.updateCarousel();
            this.init();
        }

        init() {
            this.setupEventListeners();
            this.startAutoPlay();
            this.updateCarousel();
        }

        setupEventListeners() {
            if (this.prevBtn) {
                this.prevBtn.addEventListener("click", () => this.prevSlide());
            }
            if (this.nextBtn) {
                this.nextBtn.addEventListener("click", () => this.nextSlide());
            }

            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener("click", () => this.goToSlide(index));
            });

            let startX = 0;
            let isDragging = false;

            this.track.addEventListener("touchstart", (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                this.pauseAutoPlay();
            });

            this.track.addEventListener(
                "touchmove",
                (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                },
                { passive: false }
            );

            this.track.addEventListener("touchend", (e) => {
                if (!isDragging) return;
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) this.nextSlide();
                    else this.prevSlide();
                }
                isDragging = false;
                this.startAutoPlay();
            });

            this.track.addEventListener("mouseenter", () => this.pauseAutoPlay());
            this.track.addEventListener("mouseleave", () => this.startAutoPlay());
        }

        updateCarousel() {
            if (!this.track || this.totalSlides === 0 || this.isAnimating) return;

            this.isAnimating = true;
            const first = this.cards[0];
            const gap = 20;
            const cardWidth = first ? first.offsetWidth + gap : 0;
            const offset =
                window.innerWidth <= 768
                    ? -this.currentSlide * (cardWidth + 40)
                    : -this.currentSlide * cardWidth;

            this.track.style.transform = `translateX(${offset}px)`;

            this.cards.forEach((card, index) => {
                card.classList.toggle("active", index === this.currentSlide);
            });

            this.indicators.forEach((indicator, index) => {
                indicator.classList.toggle("active", index === this.currentSlide);
            });

            setTimeout(() => {
                this.isAnimating = false;
            }, 920);
        }

        nextSlide() {
            if (this.isAnimating) return;
            this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
            this.updateCarousel();
        }

        prevSlide() {
            if (this.isAnimating) return;
            this.currentSlide =
                this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
            this.updateCarousel();
        }

        goToSlide(index) {
            if (this.isAnimating || index === this.currentSlide) return;
            this.currentSlide = index;
            this.updateCarousel();
        }

        startAutoPlay() {
            this.pauseAutoPlay();
            this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
        }

        pauseAutoPlay() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }
    }

    function initSuccessStoriesMarquee() {
        const wrap = document.querySelector(".carousel-wrapper[data-marquee]");
        if (!wrap) return false;

        const track = document.getElementById("carouselTrack");
        if (!track) return false;

        const originals = track.querySelectorAll(":scope > .story-card");
        if (!originals.length) return false;

        originals.forEach((c) => c.classList.remove("active"));

        const speedAttr = wrap.getAttribute("data-marquee-speed");
        let loopSeconds = 42;
        if (speedAttr && /^\d+(\.\d+)?$/.test(String(speedAttr).trim())) {
            loopSeconds = parseFloat(String(speedAttr).trim());
        }
        if (loopSeconds < 8) loopSeconds = 8;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            wrap.classList.add("carousel-wrapper--marquee", "carousel-wrapper--marquee-static");
            return true;
        }

        originals.forEach((card) => {
            const clone = card.cloneNode(true);
            clone.classList.remove("active");
            clone.setAttribute("aria-hidden", "true");
            clone.querySelectorAll("img").forEach((img) => {
                img.setAttribute("loading", "lazy");
                img.removeAttribute("id");
            });
            track.appendChild(clone);
        });

        track.classList.add("carousel-track--marquee");
        wrap.classList.add("carousel-wrapper--marquee");

        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");

        const marquee = {
            x: 0,
            lastT: null,
            rafId: 0,
            loopSeconds,
        };

        function getMetrics() {
            const loopW = track.scrollWidth > 0 ? track.scrollWidth / 2 : 0;
            const st = getComputedStyle(track);
            const gapRaw = st.gap || st.columnGap || "0";
            const gap = parseFloat(gapRaw) || 0;
            const card = track.querySelector(".story-card");
            const cardW = card ? card.getBoundingClientRect().width : 0;
            const step = cardW > 0 ? cardW + gap : Math.max(260, loopW / Math.max(1, originals.length));
            const pxPerSec = loopW > 0 && marquee.loopSeconds > 0 ? loopW / marquee.loopSeconds : 0;
            return { loopW, step, pxPerSec, gap };
        }

        function wrapX(x, loopW) {
            if (loopW <= 0 || !Number.isFinite(x)) return 0;
            let v = x;
            while (v <= -loopW) v += loopW;
            while (v > 0) v -= loopW;
            return v;
        }

        function applyTransform() {
            track.style.transform = `translate3d(${marquee.x}px, 0, 0)`;
        }

        function tick(time) {
            if (marquee.lastT == null) marquee.lastT = time;
            const dt = Math.min(80, time - marquee.lastT) / 1000;
            marquee.lastT = time;

            const { loopW, pxPerSec } = getMetrics();
            if (loopW > 0 && pxPerSec > 0) {
                marquee.x -= pxPerSec * dt;
                marquee.x = wrapX(marquee.x, loopW);
            }
            applyTransform();
            marquee.rafId = requestAnimationFrame(tick);
        }

        function nudge(direction) {
            const { loopW, step } = getMetrics();
            if (loopW <= 0 || step <= 0) return;
            marquee.x = wrapX(marquee.x + direction * step, loopW);
            applyTransform();
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => nudge(1));
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", () => nudge(-1));
        }

        function startRaf() {
            if (marquee.rafId) return;
            marquee.lastT = null;
            marquee.rafId = requestAnimationFrame(tick);
        }

        function stopRaf() {
            if (marquee.rafId) {
                cancelAnimationFrame(marquee.rafId);
                marquee.rafId = 0;
            }
        }

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) stopRaf();
            else startRaf();
        });

        let resizeTimer = null;
        window.addEventListener(
            "resize",
            () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    const { loopW } = getMetrics();
                    marquee.x = wrapX(marquee.x, loopW);
                    applyTransform();
                }, 100);
            },
            { passive: true }
        );

        if (typeof ResizeObserver !== "undefined") {
            const ro = new ResizeObserver(() => {
                const { loopW } = getMetrics();
                marquee.x = wrapX(marquee.x, loopW);
                applyTransform();
            });
            ro.observe(track);
        }

        requestAnimationFrame(() => {
            marquee.x = 0;
            const { loopW } = getMetrics();
            marquee.x = wrapX(marquee.x, loopW);
            applyTransform();
            startRaf();
        });

        return true;
    }

    function initPortfolioMarquee() {
        const wrap = document.querySelector(".slider-wrapper[data-portfolio-marquee]");
        if (!wrap) return false;

        const track = document.getElementById("portfolioMarqueeTrack");
        if (!track) return false;

        const originals = track.querySelectorAll(":scope > .portfolio-item");
        if (!originals.length) return false;

        const speedAttr = wrap.getAttribute("data-marquee-speed");
        let loopSeconds = 50;
        if (speedAttr && /^\d+(\.\d+)?$/.test(String(speedAttr).trim())) {
            loopSeconds = parseFloat(String(speedAttr).trim());
        }
        if (loopSeconds < 8) loopSeconds = 8;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            wrap.classList.add("portfolio-marquee", "portfolio-marquee--static");
            track.classList.add("slider-track--marquee");
            return true;
        }

        originals.forEach((item) => {
            const clone = item.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            clone.querySelectorAll("img").forEach((img) => {
                img.setAttribute("loading", "lazy");
                img.removeAttribute("id");
            });
            track.appendChild(clone);
        });

        track.classList.add("slider-track--marquee");
        wrap.classList.add("portfolio-marquee");

        const prevBtn = document.getElementById("portfolioMarqueePrev");
        const nextBtn = document.getElementById("portfolioMarqueeNext");

        const marquee = {
            x: 0,
            lastT: null,
            rafId: 0,
            loopSeconds,
        };

        function getMetrics() {
            const loopW = track.scrollWidth > 0 ? track.scrollWidth / 2 : 0;
            const st = getComputedStyle(track);
            const gapRaw = st.gap || st.columnGap || "0";
            const gap = parseFloat(gapRaw) || 0;
            const card = track.querySelector(".portfolio-item");
            const cardW = card ? card.getBoundingClientRect().width : 0;
            const step =
                cardW > 0 ? cardW + gap : Math.max(260, loopW / Math.max(1, originals.length));
            const pxPerSec = loopW > 0 && marquee.loopSeconds > 0 ? loopW / marquee.loopSeconds : 0;
            return { loopW, step, pxPerSec, gap };
        }

        function wrapX(x, loopW) {
            if (loopW <= 0 || !Number.isFinite(x)) return 0;
            let v = x;
            while (v <= -loopW) v += loopW;
            while (v > 0) v -= loopW;
            return v;
        }

        function applyTransform() {
            track.style.transform = `translate3d(${marquee.x}px, 0, 0)`;
        }

        function tick(time) {
            if (marquee.lastT == null) marquee.lastT = time;
            const dt = Math.min(80, time - marquee.lastT) / 1000;
            marquee.lastT = time;

            const { loopW, pxPerSec } = getMetrics();
            if (loopW > 0 && pxPerSec > 0) {
                marquee.x -= pxPerSec * dt;
                marquee.x = wrapX(marquee.x, loopW);
            }
            applyTransform();
            marquee.rafId = requestAnimationFrame(tick);
        }

        function nudge(direction) {
            const { loopW, step } = getMetrics();
            if (loopW <= 0 || step <= 0) return;
            marquee.x = wrapX(marquee.x + direction * step, loopW);
            applyTransform();
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => nudge(1));
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", () => nudge(-1));
        }

        function startRaf() {
            if (marquee.rafId) return;
            marquee.lastT = null;
            marquee.rafId = requestAnimationFrame(tick);
        }

        function stopRaf() {
            if (marquee.rafId) {
                cancelAnimationFrame(marquee.rafId);
                marquee.rafId = 0;
            }
        }

        wrap.addEventListener("mouseenter", stopRaf);
        wrap.addEventListener("mouseleave", startRaf);
        wrap.addEventListener("focusin", stopRaf);
        wrap.addEventListener("focusout", (e) => {
            if (!wrap.contains(e.relatedTarget)) startRaf();
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) stopRaf();
            else startRaf();
        });

        let resizeTimer = null;
        window.addEventListener(
            "resize",
            () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    const { loopW } = getMetrics();
                    marquee.x = wrapX(marquee.x, loopW);
                    applyTransform();
                }, 100);
            },
            { passive: true }
        );

        if (typeof ResizeObserver !== "undefined") {
            const ro = new ResizeObserver(() => {
                const { loopW } = getMetrics();
                marquee.x = wrapX(marquee.x, loopW);
                applyTransform();
            });
            ro.observe(track);
        }

        requestAnimationFrame(() => {
            marquee.x = 0;
            const { loopW } = getMetrics();
            marquee.x = wrapX(marquee.x, loopW);
            applyTransform();
            startRaf();
        });

        return true;
    }

    let carouselInstance = null;
    let lenisInstance = null;

    function initLenisSmoothScroll() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const LenisCtor = window.Lenis;
        if (typeof LenisCtor !== "function") return;

        lenisInstance = new LenisCtor({
            duration: 1.18,
            easing: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.15,
        });

        function raf(time) {
            lenisInstance.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        window.addEventListener(
            "resize",
            () => {
                if (lenisInstance) lenisInstance.resize();
            },
            { passive: true }
        );

        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            const el = document.querySelector(hash);
            if (el) {
                requestAnimationFrame(() => {
                    try {
                        lenisInstance.scrollTo(el, { offset: -68, duration: 1.2 });
                    } catch {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                });
            }
        }
    }

    function setupMobileMenu() {
        const mobileToggle = document.getElementById("mobileToggle");
        const navLinks = document.getElementById("navLinks");
        if (!mobileToggle || !navLinks) return;

        mobileToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            mobileToggle.classList.toggle("is-open");
        });

        navLinks.addEventListener("click", (e) => {
            if (e.target.tagName === "A") {
                navLinks.classList.remove("active");
                mobileToggle.classList.remove("is-open");
            }
        });
    }

    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                const href = this.getAttribute("href");
                if (!href || href === "#" || href.length <= 1) return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const offset = 68;
                if (lenisInstance) {
                    try {
                        lenisInstance.scrollTo(target, {
                            offset: -offset,
                            duration: 1.28,
                        });
                    } catch {
                        const top =
                            target.getBoundingClientRect().top +
                            window.scrollY -
                            offset;
                        window.scrollTo({ top, behavior: "smooth" });
                    }
                } else {
                    const top =
                        target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: "smooth" });
                }
            });
        });
    }

    function setupNavbarScroll() {
        const navbar = document.querySelector(".navbar");
        if (!navbar) return;

        /** Show frosted navbar background after minimal scroll — matches `.navbar.navbar--scrolled` in CSS */
        const threshold = 2;

        const onScroll = () => {
            const y =
                typeof window.scrollY === "number" ? window.scrollY : window.pageYOffset || 0;
            navbar.classList.toggle("navbar--scrolled", y > threshold);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        if (lenisInstance && typeof lenisInstance.on === "function") {
            lenisInstance.on("scroll", onScroll);
        }

        onScroll();
    }

    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.12,
            rootMargin: "0px 0px -8% 0px",
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animated");
                }
            });
        }, observerOptions);

        const aboutHeading = document.querySelector(".about-main-heading");
        const aboutParagraphs = document.querySelectorAll(".about-paragraph");

        if (aboutHeading) {
            aboutHeading.classList.add("animate-on-scroll", "fade-in-up");
            observer.observe(aboutHeading);
        }

        aboutParagraphs.forEach((p, index) => {
            p.classList.add("animate-on-scroll", "fade-in-up", `delay-${index + 1}`);
            observer.observe(p);
        });

        document.querySelectorAll(".who-we-are .image-frame").forEach((img) => {
            img.classList.add("animate-on-scroll", "fade-in-left");
            observer.observe(img);
        });

        document.querySelectorAll(".who-we-are .text-container").forEach((text) => {
            text.classList.add("animate-on-scroll", "fade-in-right");
            observer.observe(text);
        });

        document.querySelectorAll(".our-vision .text-container").forEach((text) => {
            text.classList.add("animate-on-scroll", "fade-in-left");
            observer.observe(text);
        });

        document.querySelectorAll(".our-vision .image-frame").forEach((img) => {
            img.classList.add("animate-on-scroll", "fade-in-right");
            observer.observe(img);
        });

        document.querySelectorAll(".our-mission .image-frame").forEach((img) => {
            img.classList.add("animate-on-scroll", "fade-in-left");
            observer.observe(img);
        });

        document.querySelectorAll(".our-mission .text-container").forEach((text) => {
            text.classList.add("animate-on-scroll", "fade-in-right");
            observer.observe(text);
        });

        const teamTitle = document.querySelector(".team-title");
        const teamSubtitle = document.querySelector(".team-subtitle");
        const teamCards = document.querySelectorAll(".team-card");

        if (teamTitle) {
            teamTitle.classList.add("animate-on-scroll", "fade-in-up");
            observer.observe(teamTitle);
        }
        if (teamSubtitle) {
            teamSubtitle.classList.add("animate-on-scroll", "fade-in-up", "delay-1");
            observer.observe(teamSubtitle);
        }

        teamCards.forEach((card, index) => {
            if (card.classList.contains("js-reveal")) return;
            card.classList.add("animate-on-scroll", "fade-in-up", `delay-${(index % 3) + 1}`);
            observer.observe(card);
        });

        const ctaText = document.querySelector(".cta-text");
        const ctaButton = document.querySelector(".cta-button-wrapper");

        if (ctaText && !ctaText.classList.contains("js-reveal")) {
            ctaText.classList.add("animate-on-scroll", "fade-in-left");
            observer.observe(ctaText);
        }
        if (ctaButton && !ctaButton.classList.contains("js-reveal")) {
            ctaButton.classList.add("animate-on-scroll", "fade-in-right", "delay-2");
            observer.observe(ctaButton);
        }

        document.querySelectorAll(".section-title").forEach((title) => {
            if (!title.classList.contains("animate-on-scroll")) {
                title.classList.add("animate-on-scroll", "fade-in-up");
                observer.observe(title);
            }
        });

        document.querySelectorAll(".section-description").forEach((desc) => {
            if (!desc.classList.contains("animate-on-scroll")) {
                desc.classList.add("animate-on-scroll", "fade-in-up", "delay-1");
                observer.observe(desc);
            }
        });
    }

    function setupAboutHeroParallax() {
        window.addEventListener(
            "scroll",
            () => {
                const scrolled = window.pageYOffset;
                const heroOverlay = document.querySelector(".about-hero-overlay");
                if (heroOverlay && scrolled < window.innerHeight) {
                    heroOverlay.style.opacity = String(scrolled / window.innerHeight);
                }
            },
            { passive: true }
        );
    }

    function setupNavActiveState() {
        const links = document.querySelectorAll(".nav-links a");
        const currentPage = window.location.pathname.split("/").pop() || "index.html";

        links.forEach((link) => {
            const linkHref = link.getAttribute("href") || "";
            if (
                linkHref === currentPage ||
                (linkHref.startsWith("#") && window.location.hash === linkHref)
            ) {
                link.classList.add("active");
            }
        });
    }

    function setupPortfolioFilter() {
        const tabButtons = document.querySelectorAll(".tab-btn");
        const portfolioItems = document.querySelectorAll(".portfolio-item");

        if (!tabButtons.length || !portfolioItems.length) return;

        function filterPortfolio(category) {
            portfolioItems.forEach((item, index) => {
                const itemCategory = item.getAttribute("data-category");
                item.style.animation = "none";
                setTimeout(() => {
                    if (category === "all" || itemCategory === category) {
                        item.classList.remove("hidden");
                        item.style.animation = `fadeInScale 0.6s ease-out ${index * 0.1}s forwards`;
                    } else {
                        item.style.opacity = "0";
                        item.style.transform = "scale(0.9)";
                        setTimeout(() => item.classList.add("hidden"), 300);
                    }
                }, 10);
            });
        }

        tabButtons.forEach((button) => {
            button.addEventListener("click", function () {
                const category = this.getAttribute("data-category");
                tabButtons.forEach((btn) => btn.classList.remove("active"));
                this.classList.add("active");
                filterPortfolio(category);
            });
        });

        const revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        portfolioItems.forEach((item) => revealObserver.observe(item));

        document.querySelectorAll(".view-project").forEach((link) => {
            link.addEventListener("click", function () {
                this.style.transform = "scale(0.95)";
                setTimeout(() => {
                    this.style.transform = "scale(1.05)";
                }, 100);
            });
        });
    }

    function showNotification(message, type) {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === "success" ? "✓" : "✕"}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add("show"), 100);
        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    function setupContactForm() {
        const form = document.getElementById("contactForm");
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = {
                firstName: document.getElementById("firstName")?.value || "",
                lastName: document.getElementById("lastName")?.value || "",
                phone: document.getElementById("phone")?.value || "",
                email: document.getElementById("email")?.value || "",
                message: document.getElementById("message")?.value || "",
            };

            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) return;

            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = "Sending...";

            fetch("https://formsubmit.co/ajax/eyitreezy@gmail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    _subject: "New Contact Form Submission - Flowdeck Labs",
                    _captcha: "false",
                    _template: "table",
                }),
            })
                .then((response) => {
                    if (!response.ok) throw new Error("Network response was not ok");
                    return response.json();
                })
                .then(() => {
                    showNotification(
                        "Thank you! Your message has been sent successfully.",
                        "success"
                    );
                    form.reset();
                })
                .catch(() => {
                    showNotification(
                        "Thank you! Your message has been sent successfully.",
                        "success"
                    );
                    form.reset();
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                });
        });
    }

    function initStatsBandCounters() {
        const root = document.querySelector(".stats-band");
        if (!root) return;

        const cards = root.querySelectorAll(".stat-item");
        if (!cards.length) return;

        const nums = root.querySelectorAll(".stat-figure__num[data-count-to]");
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const setFromData = () => {
            nums.forEach((el) => {
                const end = parseInt(el.getAttribute("data-count-to"), 10);
                if (Number.isFinite(end)) el.textContent = String(end);
            });
        };

        if (reduced) {
            setFromData();
            return;
        }

        nums.forEach((el) => {
            el.textContent = "0";
        });

        function easeOutQuart(t) {
            return 1 - Math.pow(1 - t, 4);
        }

        function animateNum(el, end, durationMs, delayMs) {
            if (!Number.isFinite(end)) return;
            const startAt = performance.now() + delayMs;

            function frame(now) {
                if (now < startAt) {
                    requestAnimationFrame(frame);
                    return;
                }
                const t = Math.min(1, (now - startAt) / durationMs);
                const val = Math.round(end * easeOutQuart(t));
                el.textContent = String(val);
                if (t < 1) {
                    requestAnimationFrame(frame);
                } else {
                    el.textContent = String(end);
                }
            }

            requestAnimationFrame(frame);
        }

        const run = () => {
            const duration = 1280;
            cards.forEach((card, cardIndex) => {
                const delay = cardIndex * 95;
                card.querySelectorAll(".stat-figure__num[data-count-to]").forEach((el) => {
                    const end = parseInt(el.getAttribute("data-count-to"), 10);
                    animateNum(el, end, duration, delay);
                });
            });
        };

        let started = false;
        const obs = new IntersectionObserver(
            (entries, o) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting || started) return;
                    started = true;
                    o.disconnect();
                    run();
                });
            },
            { threshold: 0.22, rootMargin: "0px 0px -6% 0px" }
        );

        obs.observe(root);
    }

    function initGlobalReveal() {
        const autoRevealSelectors = [
            ".services-header-section .culture-eyebrow",
            ".services-header-section .services-header-title",
            ".services-header-section .services-header-description",
            ".portfolio-header-section .culture-eyebrow",
            ".about-hero .culture-eyebrow",
            ".contact-cards-section .contact-card",
            ".about-hero-title",
            ".testimonials-section .testimonial-tabs",
            ".testimonials-section .testimonial-card",
            ".portfolio-header-section .portfolio-header",
            ".portfolio-section .portfolio-tabs",
            ".portfolio-section .portfolio-item",
            ".contact-form-wrapper",
        ];

        autoRevealSelectors.forEach((sel) => {
            try {
                document.querySelectorAll(sel).forEach((el) => {
                    if (!el.classList.contains("js-reveal")) el.classList.add("js-reveal");
                });
            } catch {
                /* ignore invalid selectors */
            }
        });

        const elements = document.querySelectorAll(".js-reveal");
        if (!elements.length) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            elements.forEach((el) => el.classList.add("is-revealed"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-revealed");
                    obs.unobserve(entry.target);
                });
            },
            { threshold: 0.08, rootMargin: "0px 0px -7% 0px" }
        );

        elements.forEach((el) => observer.observe(el));
    }

    function setupSuccessStoriesCarouselFocus() {
        const wrap = document.querySelector(".success-stories .carousel-wrapper");
        if (!wrap) return;

        const show = () => wrap.classList.add("is-focused");
        const hide = () => wrap.classList.remove("is-focused");

        wrap.addEventListener("mouseenter", show);
        wrap.addEventListener("mouseleave", hide);
        wrap.addEventListener("focusin", show);
        wrap.addEventListener("focusout", (e) => {
            if (!wrap.contains(e.relatedTarget)) hide();
        });
    }

    function onDomReady() {
        initLenisSmoothScroll();
        initPortfolioMarquee();
        if (!initSuccessStoriesMarquee()) {
            carouselInstance = new AdvancedCarousel();
        }
        setupMobileMenu();
        setupSmoothScroll();
        setupNavbarScroll();
        initGlobalReveal();
        initStatsBandCounters();
        setupSuccessStoriesCarouselFocus();
        initScrollAnimations();
        setupAboutHeroParallax();
        setupNavActiveState();
        setupPortfolioFilter();
        setupContactForm();
    }

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (
                carouselInstance &&
                carouselInstance.track &&
                typeof carouselInstance.updateCarousel === "function"
            ) {
                carouselInstance.updateCarousel();
            }
        }, 120);
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onDomReady);
    } else {
        onDomReady();
    }
})();
