document.addEventListener("DOMContentLoaded", () => {
    
    // Initialize all modules
    initPageTransitions();
    initScrollFade();
    initInkCanvas();
    initGalleryPanZoom();
    initScrollReveal();
    initArtworkModal();
    initOrganicCursor(); // New feature added here!

   // ==========================================
    // 1. Page Transition Logic (Dissolve)
    // ==========================================
    function initPageTransitions() {
        const transitionLinks = document.querySelectorAll('.transition-link');
        transitionLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = link.href;
            });
        });
    }

    // ==========================================
    // 2. Hero Text Scroll Fade Logic
    // ==========================================
    function initScrollFade() {
        const heroContent = document.getElementById('heroContent');
        if (!heroContent) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                heroContent.classList.add('scrolled-out');
            } else {
                heroContent.classList.remove('scrolled-out');
            }
        });
    }

    // ==========================================
    // 3. Hero Canvas: Ink Particle Animation
    // ==========================================
    function initInkCanvas() {
        const canvas = document.getElementById('inkCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        const colors = [
            'rgba(235, 100, 80, 0.015)',
            'rgba(140, 170, 100, 0.015)',
            'rgba(240, 180, 100, 0.015)',
            'rgba(200, 190, 180, 0.01)'
        ];

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = (Math.random() - 0.5) * 1;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.size = Math.random() * 2 + 0.5; 
                this.life = 0;
                this.maxLife = Math.random() * 300 + 100;
                this.angle = Math.random() * Math.PI * 2;
            }
            update() {
                this.angle += (Math.random() - 0.5) * 0.1;
                this.vx += Math.cos(this.angle) * 0.05;
                this.vy += Math.sin(this.angle) * 0.05;
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.x += this.vx;
                this.y += this.vy;
                this.life++;

                if (this.x < 0 || this.x > width || this.y < 0 || this.y > height || this.life > this.maxLife) {
                    this.reset();
                }
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function setupCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            ctx.fillStyle = '#F8F7F5'; 
            ctx.fillRect(0, 0, width, height);
            particles = Array.from({ length: 400 }, () => new Particle());
        }

        function animateCanvas() {
            ctx.fillStyle = 'rgba(248, 247, 245, 0.02)';
            ctx.fillRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateCanvas);
        }

        window.addEventListener('resize', setupCanvas);
        setupCanvas();
        animateCanvas();
    }

    // ==========================================
    // 4. Spatial Gallery: Pan & Zoom Logic
    // ==========================================
    function initGalleryPanZoom() {
        const world = document.getElementById('world');
        const gallerySection = document.querySelector('.spatial-gallery-section');
        if (!world || !gallerySection) return;

        let currentX = 0, currentY = 0, targetX = 0, targetY = 0;
        let currentScale = 1, targetScale = 1;
        let isDragging = false;
        let startX, startY;
        
        gallerySection.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - targetX;
            startY = e.clientY - targetY;
            // Removed mouseDownPos from global scope, handled locally in Modal logic
        });

        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            targetX = e.clientX - startX;
            targetY = e.clientY - startY;
        });

        gallerySection.addEventListener('wheel', (e) => {
            e.preventDefault();
            targetScale -= e.deltaY * 0.001;
            targetScale = Math.max(0.3, Math.min(targetScale, 3)); 
        }, { passive: false });

        function render() {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;
            currentScale += (targetScale - currentScale) * 0.1;
            world.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
            requestAnimationFrame(render);
        }
        render();
    }

    // ==========================================
    // 5. Scroll Reveal Animation
    // ==========================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal-text, .reveal-divider');
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    obs.unobserve(entry.target); 
                }
            });
        }, { root: null, threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
        
        revealElements.forEach(el => observer.observe(el));
    }

    // ==========================================
    // 6. Artwork Modal & Carousel (Smooth Dissolve)
    // ==========================================
    function initArtworkModal() {
        const artworks = document.querySelectorAll('.artwork, .artwork-trigger');
        const modal = document.getElementById('artworkModal');
        if (!modal || artworks.length === 0) return;

        const closeBtn = document.getElementById('closeModalBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const modalRight = document.querySelector('.modal-right');

        const elements = {
            img: document.getElementById('modalImg'),
            title: document.getElementById('modalTitle'),
            medium: document.getElementById('modalMedium'),
            size: document.getElementById('modalSize'),
            year: document.getElementById('modalYear')
        };

        let currentIndex = 0;
        let mouseDownPos = {x: 0, y: 0};

        document.addEventListener('mousedown', (e) => {
            mouseDownPos = { x: e.clientX, y: e.clientY };
        });

        function updateModal(index) {
            const item = artworks[index];
            const imgEl = item.querySelector('img');

            elements.img.src = imgEl ? imgEl.src : '';
            elements.title.textContent = item.getAttribute('data-title') || 'Untitled';
            elements.medium.textContent = item.getAttribute('data-medium') || 'Unknown Medium';
            elements.size.textContent = item.getAttribute('data-size') || 'Dimensions variable';
            elements.year.textContent = item.getAttribute('data-year') || '2024';
        }

        artworks.forEach((item, index) => {
            item.addEventListener('mouseup', (e) => {
                const dx = Math.abs(e.clientX - mouseDownPos.x);
                const dy = Math.abs(e.clientY - mouseDownPos.y);

                if (dx < 5 && dy < 5) {
                    currentIndex = index;
                    updateModal(currentIndex);
                    modal.classList.add('active');
                }
            });
        });

        function closeModal() { modal.classList.remove('active'); }
        function showNext() { currentIndex = (currentIndex + 1) % artworks.length; updateModal(currentIndex); }
        function showPrev() { currentIndex = (currentIndex - 1 + artworks.length) % artworks.length; updateModal(currentIndex); }

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (nextBtn) nextBtn.addEventListener('click', showNext);
        if (prevBtn) prevBtn.addEventListener('click', showPrev);

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return;
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'Escape') closeModal();
        });
    }
    
    // ==========================================
    // 7. Organic Water Wave Cursor Logic (Directional)
    // ==========================================
    function initOrganicCursor() {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple-cursor');
        ripple.innerHTML = '<span></span><span></span><span></span><span></span>';
        document.body.appendChild(ripple);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        
        // New rotation variables
        let currentAngle = 0;
        let targetAngle = 0;

        document.addEventListener('mousemove', (e) => {
            // Calculate movement direction (delta X and Y)
            const dx = e.clientX - mouseX;
            const dy = e.clientY - mouseY;
            
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Only update target angle if moving fast enough to have a clear direction
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
            }
        });

        function animateCursor() {
            // Smoothly follow the mouse position
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            // Smoothly rotate to face the target angle (finding the shortest rotation path)
            let angleDiff = targetAngle - currentAngle;
            // Normalize angle to always be between -180 and 180 degrees
            angleDiff = ((angleDiff + 180) % 360 + 360) % 360 - 180;
            currentAngle += angleDiff * 0.15; // 0.15 controls how snappy the rotation is
            
            // Apply coordinates AND the dynamic rotation to the cursor
            ripple.style.left = cursorX + 'px';
            ripple.style.top = cursorY + 'px';
            ripple.style.transform = `translate(-50%, -50%) rotate(${currentAngle}deg)`;
            
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Target all clickable elements for hover effects
        const interactables = document.querySelectorAll('a, .artwork, .artwork-trigger, button');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => ripple.classList.add('active'));
            el.addEventListener('mouseleave', () => ripple.classList.remove('active'));
        });
    }
});