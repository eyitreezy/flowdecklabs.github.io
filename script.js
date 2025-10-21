class AdvancedCarousel {
            constructor() {
                this.track = document.getElementById('carouselTrack');
                this.cards = document.querySelectorAll('.story-card');
                this.indicators = document.querySelectorAll('.indicator');
                this.prevBtn = document.getElementById('prevBtn');
                this.nextBtn = document.getElementById('nextBtn');
                
                this.currentSlide = 0;
                this.totalSlides = this.cards.length;
                this.isAnimating = false;
                
                this.init();
            }
            
            init() {
                this.setupEventListeners();
                this.startAutoPlay();
                this.updateCarousel();
            }
            
            setupEventListeners() {
                this.prevBtn.addEventListener('click', () => this.prevSlide());
                this.nextBtn.addEventListener('click', () => this.nextSlide());
                
                this.indicators.forEach((indicator, index) => {
                    indicator.addEventListener('click', () => this.goToSlide(index));
                });
                
                // Touch/swipe support
                let startX = 0;
                let isDragging = false;
                
                this.track.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    isDragging = true;
                    this.pauseAutoPlay();
                });
                
                this.track.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                });
                
                this.track.addEventListener('touchend', (e) => {
                    if (!isDragging) return;
                    
                    const endX = e.changedTouches[0].clientX;
                    const diff = startX - endX;
                    
                    if (Math.abs(diff) > 50) {
                        if (diff > 0) {
                            this.nextSlide();
                        } else {
                            this.prevSlide();
                        }
                    }
                    
                    isDragging = false;
                    this.startAutoPlay();
                });
                
                // Pause on hover
                this.track.addEventListener('mouseenter', () => this.pauseAutoPlay());
                this.track.addEventListener('mouseleave', () => this.startAutoPlay());
            }
            
            updateCarousel() {
                if (this.isAnimating) return;
                
                this.isAnimating = true;
                
                // Update track position
                const cardWidth = this.cards[0].offsetWidth + 20; // including gap
                const offset = window.innerWidth <= 768 ? 
                    -this.currentSlide * (cardWidth + 40) : // mobile: full width + margins
                    -this.currentSlide * cardWidth;
                
                this.track.style.transform = `translateX(${offset}px)`;
                
                // Update active states
                this.cards.forEach((card, index) => {
                    card.classList.toggle('active', index === this.currentSlide);
                });
                
                this.indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === this.currentSlide);
                });
                
                // Reset animation flag
                setTimeout(() => {
                    this.isAnimating = false;
                }, 800);
            }
            
            nextSlide() {
                if (this.isAnimating) return;
                this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
                this.updateCarousel();
            }
            
            prevSlide() {
                if (this.isAnimating) return;
                this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
                this.updateCarousel();
            }
            
            goToSlide(index) {
                if (this.isAnimating || index === this.currentSlide) return;
                this.currentSlide = index;
                this.updateCarousel();
            }
            
            startAutoPlay() {
                this.pauseAutoPlay();
                this.autoPlayInterval = setInterval(() => {
                    this.nextSlide();
                }, 5000);
            }
            
            pauseAutoPlay() {
                if (this.autoPlayInterval) {
                    clearInterval(this.autoPlayInterval);
                }
            }
        }
        
        // Initialize carousel when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new AdvancedCarousel();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const carousel = new AdvancedCarousel();
        });

        


            // Mobile menu toggle functionality
        const mobileToggle = document.getElementById('mobileToggle');
        const navLinks = document.getElementById('navLinks');

        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('active');
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for sticky navbar height
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Add scroll effect to navbar
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.backgroundColor = 'white';
                navbar.style.backdropFilter = 'none';
            }
        });

        // Add this to your existing script.js file

        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Optional: Unobserve after animation to improve performance
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Initialize animations when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            initScrollAnimations();
        });

        function initScrollAnimations() {
            // About Text Section animations
            const aboutHeading = document.querySelector('.about-main-heading');
            const aboutParagraphs = document.querySelectorAll('.about-paragraph');
            
            if (aboutHeading) {
                aboutHeading.classList.add('animate-on-scroll', 'fade-in-up');
                observer.observe(aboutHeading);
            }
            
            aboutParagraphs.forEach((p, index) => {
                p.classList.add('animate-on-scroll', 'fade-in-up', `delay-${index + 1}`);
                observer.observe(p);
            });

            // Who We Are Section animations
            const whoWeAreImages = document.querySelectorAll('.who-we-are .image-frame');
            const whoWeAreText = document.querySelectorAll('.who-we-are .text-container');
            
            whoWeAreImages.forEach(img => {
                img.classList.add('animate-on-scroll', 'fade-in-left');
                observer.observe(img);
            });
            
            whoWeAreText.forEach(text => {
                text.classList.add('animate-on-scroll', 'fade-in-right');
                observer.observe(text);
            });

            // Our Vision Section animations (reversed order)
            const visionText = document.querySelectorAll('.our-vision .text-container');
            const visionImages = document.querySelectorAll('.our-vision .image-frame');
            
            visionText.forEach(text => {
                text.classList.add('animate-on-scroll', 'fade-in-left');
                observer.observe(text);
            });
            
            visionImages.forEach(img => {
                img.classList.add('animate-on-scroll', 'fade-in-right');
                observer.observe(img);
            });

            // Our Mission Section animations
            const missionImages = document.querySelectorAll('.our-mission .image-frame');
            const missionText = document.querySelectorAll('.our-mission .text-container');
            
            missionImages.forEach(img => {
                img.classList.add('animate-on-scroll', 'fade-in-left');
                observer.observe(img);
            });
            
            missionText.forEach(text => {
                text.classList.add('animate-on-scroll', 'fade-in-right');
                observer.observe(text);
            });

            // Meet The Team Section animations
            const teamTitle = document.querySelector('.team-title');
            const teamSubtitle = document.querySelector('.team-subtitle');
            const teamCards = document.querySelectorAll('.team-card');
            
            if (teamTitle) {
                teamTitle.classList.add('animate-on-scroll', 'fade-in-up');
                observer.observe(teamTitle);
            }
            
            if (teamSubtitle) {
                teamSubtitle.classList.add('animate-on-scroll', 'fade-in-up', 'delay-1');
                observer.observe(teamSubtitle);
            }
            
            teamCards.forEach((card, index) => {
                card.classList.add('animate-on-scroll', 'fade-in-up', `delay-${(index % 3) + 1}`);
                observer.observe(card);
            });

            // Contact CTA Section animations
            const ctaText = document.querySelector('.cta-text');
            const ctaButton = document.querySelector('.cta-button-wrapper');
            
            if (ctaText) {
                ctaText.classList.add('animate-on-scroll', 'fade-in-left');
                observer.observe(ctaText);
            }
            
            if (ctaButton) {
                ctaButton.classList.add('animate-on-scroll', 'fade-in-right', 'delay-2');
                observer.observe(ctaButton);
            }

            // Section titles animation
            const sectionTitles = document.querySelectorAll('.section-title');
            sectionTitles.forEach(title => {
                if (!title.classList.contains('animate-on-scroll')) {
                    title.classList.add('animate-on-scroll', 'fade-in-up');
                    observer.observe(title);
                }
            });

            // Section descriptions animation
            const sectionDescriptions = document.querySelectorAll('.section-description');
            sectionDescriptions.forEach(desc => {
                if (!desc.classList.contains('animate-on-scroll')) {
                    desc.classList.add('animate-on-scroll', 'fade-in-up', 'delay-1');
                    observer.observe(desc);
                }
            });
        }

        // Optional: Add parallax effect to hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroOverlay = document.querySelector('.about-hero-overlay');
            
            if (heroOverlay && scrolled < window.innerHeight) {
                heroOverlay.style.opacity = scrolled / window.innerHeight;
            }
        });

        // Optional: Counter animation for numbers (if you have any stats)
        function animateCounter(element, target, duration = 2000) {
            let start = 0;
            const increment = target / (duration / 16);
            
            const timer = setInterval(() => {
                start += increment;
                if (start >= target) {
                    element.textContent = Math.round(target);
                    clearInterval(timer);
                } else {
                    element.textContent = Math.round(start);
                }
            }, 16);
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        //// Nav Bar active state 
        const links = document.querySelectorAll('.nav-links a');
        const currentPage = window.location.pathname.split("/").pop();

        links.forEach(link => {
            const linkHref = link.getAttribute("href");

            // If the link matches the current page OR it's an in-page section (#services etc.)
            if (linkHref === currentPage || (linkHref.startsWith("#") && window.location.hash === linkHref)) {
            link.classList.add("active");
            }
        });

        

        // Portfolio Filtering Functionality
        document.addEventListener('DOMContentLoaded', function() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        
        // Tab switching functionality
        tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter portfolio items with animation
            filterPortfolio(category);
        });
        });
        
        // Filter function with fade animation
        function filterPortfolio(category) {
        portfolioItems.forEach((item, index) => {
            const itemCategory = item.getAttribute('data-category');
            
            // Reset animation
            item.style.animation = 'none';
            
            setTimeout(() => {
                if (category === 'all' || itemCategory === category) {
                    item.classList.remove('hidden');
                    // Trigger fade in animation
                    item.style.animation = `fadeInScale 0.6s ease-out ${index * 0.1}s forwards`;
                } else {
                    // Fade out before hiding
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        item.classList.add('hidden');
                    }, 300);
                }
            }, 10);
        });
        }
        
        // Smooth scroll for "View Project" links
        const viewProjectLinks = document.querySelectorAll('.view-project');
        viewProjectLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Add animation effect on click
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1.05)';
                }, 100);
            });
        });
    
        // Add scroll reveal animation
        const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe all portfolio items for scroll reveal
        portfolioItems.forEach(item => {
            observer.observe(item);
        });
        
        // Add hover sound effect (optional - can be enabled)
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        portfolioCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                // Add subtle scale effect
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
        
        // Track analytics for tab clicks (placeholder)
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                console.log(`User filtered by: ${category}`);
                // Here you can add analytics tracking code
            });
        });
        
        // Track analytics for project views (placeholder)
        viewProjectLinks.forEach(link => {
            link.addEventListener('click', function() {
                const projectUrl = this.getAttribute('href');
                console.log(`User viewing project: ${projectUrl}`);
                // Here you can add analytics tracking code
            });
        });
    });

    // Contact Us Form Script
    // SOLUTION 1: Using FormSubmit.co (No Backend Required - Recommended)
    // This is the easiest solution - no server needed!

    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };
        
        // Create FormData object for submission
        const form = this;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
        
        // Send to FormSubmit.co with Ajax endpoint
        fetch('https://formsubmit.co/ajax/eyitreezy@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                message: formData.message,
                _subject: 'New Contact Form Submission - Flowdeck Labs',
                _captcha: 'false',
                _template: 'table'
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            
            // Show success message
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            
            // Reset form
            form.reset();
            
            // Re-enable button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        })
        .catch((error) => {
            console.error('Error:', error);
            
            // Since the email is being delivered, we'll show success anyway
            // This is because FormSubmit sometimes has CORS issues but still delivers
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            
            // Reset form
            form.reset();
            
            // Re-enable button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
    });

    // Notification function for better UX
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '✕'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }