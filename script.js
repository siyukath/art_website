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
    // 4. Spatial Gallery: Horizontal 3D Scroll
    // ==========================================
    function initGalleryPanZoom() {
        const world = document.getElementById('world');
        const viewport = document.querySelector('.viewport');
        const gallerySection = document.querySelector('.spatial-gallery-section');
        const artworks = document.querySelectorAll('.artwork');
        
        if (!world || !viewport || !gallerySection || artworks.length === 0) return;

        let scrollPosition = 0;
        let targetScrollPosition = 0;
        let isDragging = false;
        let dragStartX = 0;
        let dragStartScroll = 0;
        let autoScrollDirection = 1;
        const autoScrollSpeed = 0.5;
        const artworkWidth = 35; // vw
        const artworkMargin = 4; // vw
        const totalItemWidth = artworkWidth + artworkMargin * 2;
        let maxScroll = Math.max(0, (artworks.length - 1) * totalItemWidth * (window.innerWidth / 100));

        // Drag to scroll horizontally
        gallerySection.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragStartX = e.clientX;
            dragStartScroll = targetScrollPosition;
        });

        window.addEventListener('mouseup', () => isDragging = false);
        
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dragDistance = e.clientX - dragStartX;
            targetScrollPosition = dragStartScroll - dragDistance * 1.2;
            targetScrollPosition = Math.max(0, Math.min(targetScrollPosition, maxScroll));
        });

        // Mouse wheel to scroll horizontally
        gallerySection.addEventListener('wheel', (e) => {
            e.preventDefault();
            targetScrollPosition += e.deltaY * 0.5;
            targetScrollPosition = Math.max(0, Math.min(targetScrollPosition, maxScroll));
        }, { passive: false });

        // Apply 3D transforms based on scroll position
        function updateArtworkTransforms() {
            const centerPosition = viewport.offsetWidth / 2;
            
            artworks.forEach((artwork, index) => {
                const artworkElement = artwork.querySelector('img');
                if (!artworkElement) return;

                // Calculate position relative to scroll
                const artworkCenterX = (index * totalItemWidth * (window.innerWidth / 100)) 
                                     - scrollPosition 
                                     + (totalItemWidth * (window.innerWidth / 100)) / 2;
                const distanceFromCenter = artworkCenterX - centerPosition;
                
                // Normalize distance (-1 to 1)
                const normalizedDistance = Math.max(-1, Math.min(1, distanceFromCenter / (centerPosition * 0.8)));
                
                // Calculate perspective tilt (Y rotation based on horizontal distance)
                const rotationY = normalizedDistance * 25; // max 25 degrees tilt
                
                // Calculate scale and opacity (closer to center = larger and more opaque)
                const scale = 1 - Math.abs(normalizedDistance) * 0.15;
                const opacity = 1 - Math.abs(normalizedDistance) * 0.2;
                
                // Calculate depth (Z position for perspective)
                const depth = -Math.abs(normalizedDistance) * 200;
                
                // Apply 3D transforms
                artwork.style.transform = `
                    rotateY(${rotationY}deg) 
                    scale(${scale}) 
                    translateZ(${depth}px)
                `;
                artwork.style.opacity = Math.max(0.6, opacity);
            });
        }

        // Smooth animation loop
        function render() {
            if (!isDragging) {
                targetScrollPosition += autoScrollSpeed * autoScrollDirection;
                if (targetScrollPosition >= maxScroll) {
                    targetScrollPosition = maxScroll;
                    autoScrollDirection = -1;
                } else if (targetScrollPosition <= 0) {
                    targetScrollPosition = 0;
                    autoScrollDirection = 1;
                }
            }

            scrollPosition += (targetScrollPosition - scrollPosition) * 0.1;
            world.style.transform = `translateX(-${scrollPosition}px)`;
            updateArtworkTransforms();
            requestAnimationFrame(render);
        }
        
        render();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            maxScroll = Math.max(0, (artworks.length - 1) * totalItemWidth * (window.innerWidth / 100));
            targetScrollPosition = Math.max(0, Math.min(targetScrollPosition, maxScroll));
            scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
        });
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
            if (!item) return;
            
            const imgEl = item.querySelector('img');
            elements.img.src = imgEl?.src || '';
            elements.title.textContent = item.dataset.title || item.getAttribute('data-title') || 'Untitled';
            elements.medium.textContent = item.dataset.medium || item.getAttribute('data-medium') || 'Unknown Medium';
            elements.size.textContent = item.dataset.size || item.getAttribute('data-size') || 'Dimensions variable';
            elements.year.textContent = item.dataset.year || item.getAttribute('data-year') || '2024';
        }

        function handleArtworkClick(index) {
            currentIndex = index;
            updateModal(currentIndex);
            modal.classList.add('active');
        }

        artworks.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                handleArtworkClick(index);
            });

            const img = item.querySelector('img');
            if (img) {
                img.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleArtworkClick(index);
                });
            }
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