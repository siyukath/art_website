/**
 * ========================================
 * PREMIUM MICRO-INTERACTIONS MODULE
 * Artistic Portfolio Interactive Experience
 * Fixed Version
 * ========================================
 */

class MicroInteractions {
    constructor() {
        this.hasShownLoader = false;  // 防止加载屏幕重复显示
        this.init();
    }

    init() {
        this.initPaletteLoadingAnimation();
        this.initCanvasTextureOverlay();
        this.initChiaroscuroLightCursor();
        this.initUnderdrawingScrollEffect();
        this.initPageTransitionEffects();
    }

    /**
     * 1. PALETTE-INSPIRED LOADING ANIMATION
     * 古典油画调色盘加载动画 + Glassmorphism
     * FIX: 只在首次加载时显示，不会重复闪现
     */
    initPaletteLoadingAnimation() {
        // 检查是否已经显示过加载屏幕
        if (this.hasShownLoader) return;

        // 仅在首次页面加载时插入
        const createLoader = () => {
            if (this.hasShownLoader) return;
            
            const loadingHTML = `
                <div id="paletteLoading" class="palette-loading-container">
                    <div class="palette-loader">
                        <div class="paint-blob blob-1"></div>
                        <div class="paint-blob blob-2"></div>
                        <div class="paint-blob blob-3"></div>
                        <div class="paint-blob blob-4"></div>
                        <div class="palette-circle"></div>
                    </div>
                    <div class="loading-text">艺术在加载中...</div>
                </div>
            `;

            document.body.insertAdjacentHTML('afterbegin', loadingHTML);
            this.hasShownLoader = true;
        };

        // 如果页面已加载，直接显示并隐藏
        if (document.readyState === 'loading') {
            createLoader();
        } else {
            // 页面已加载，不显示加载屏幕
            this.hasShownLoader = true;
            return;
        }

        // 监听页面完全加载后移除加载屏幕
        window.addEventListener('load', () => {
            const loader = document.getElementById('paletteLoading');
            if (loader && this.hasShownLoader) {
                setTimeout(() => {
                    loader.classList.add('fade-out');
                    setTimeout(() => {
                        if (loader && loader.parentNode) {
                            loader.remove();
                        }
                    }, 800);
                }, 800);
            }
        }, { once: true });  // 只执行一次
    }

    /**
     * 2. CANVAS TEXTURE OVERLAY WITH LIGHT CURSOR
     * 模拟画布质感 + 光源光标追踪
     */
    initCanvasTextureOverlay() {
        const canvasOverlay = document.createElement('canvas');
        canvasOverlay.id = 'canvasTextureOverlay';
        canvasOverlay.width = window.innerWidth;
        canvasOverlay.height = window.innerHeight;
        Object.assign(canvasOverlay.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 9,
            opacity: 0.08,
            mixBlendMode: 'multiply'
        });
        document.body.appendChild(canvasOverlay);

        const ctx = canvasOverlay.getContext('2d');

        // 生成画布纹理 (Canvas Matrix)
        const generateCanvasTexture = () => {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, canvasOverlay.width, canvasOverlay.height);

            for (let i = 0; i < canvasOverlay.width; i += 8) {
                for (let j = 0; j < canvasOverlay.height; j += 8) {
                    ctx.strokeStyle = `rgba(100, 80, 60, ${Math.random() * 0.3})`;
                    ctx.lineWidth = Math.random() * 0.5;
                    const angle = Math.random() * Math.PI;
                    ctx.beginPath();
                    ctx.moveTo(i, j);
                    ctx.lineTo(i + Math.cos(angle) * 6, j + Math.sin(angle) * 6);
                    ctx.stroke();
                }
            }
        };

        generateCanvasTexture();

        // 响应窗口大小变化
        window.addEventListener('resize', () => {
            canvasOverlay.width = window.innerWidth;
            canvasOverlay.height = window.innerHeight;
            generateCanvasTexture();
        });
    }

    /**
     * 3. CHIAROSCURO LIGHT CURSOR
     * 光影追随鼠标 - 古典油画光影效果
     */
    initChiaroscuroLightCursor() {
        const lightCursor = document.createElement('div');
        lightCursor.id = 'chiaroscuroLight';
        Object.assign(lightCursor.style, {
            position: 'fixed',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 200, 87, 0.4), rgba(255, 150, 50, 0.1), transparent)',
            pointerEvents: 'none',
            zIndex: 8,
            filter: 'blur(60px)',
            display: 'none'
        });
        document.body.appendChild(lightCursor);

        let mouseX = 0, mouseY = 0;
        let lightX = 0, lightY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            lightCursor.style.display = 'block';

            // 平滑跟随（smoothstep效果）
            lightX += (mouseX - lightX) * 0.15;
            lightY += (mouseY - lightY) * 0.15;

            lightCursor.style.left = (lightX - 100) + 'px';
            lightCursor.style.top = (lightY - 100) + 'px';
        });

        document.addEventListener('mouseleave', () => {
            lightCursor.style.display = 'none';
        });

        // 与其他元素交互时增强光源
        document.querySelectorAll('a, button, .artwork').forEach(el => {
            el.addEventListener('mouseenter', () => {
                lightCursor.style.filter = 'blur(40px)';
                lightCursor.style.background = 'radial-gradient(circle at 30% 30%, rgba(255, 220, 100, 0.6), rgba(255, 150, 50, 0.2), transparent)';
            });
            el.addEventListener('mouseleave', () => {
                lightCursor.style.filter = 'blur(60px)';
                lightCursor.style.background = 'radial-gradient(circle at 30% 30%, rgba(255, 200, 87, 0.4), rgba(255, 150, 50, 0.1), transparent)';
            });
        });
    }

    /**
     * 4. UNDERDRAWING SCROLL EFFECT
     * "未完成"画作：从铅笔素描到油画上色的渐变
     */
    initUnderdrawingScrollEffect() {
        const artworks = document.querySelectorAll('.artwork img');

        const observerOptions = {
            threshold: 0,
            rootMargin: '50px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // 创建骨架屏层
                    if (!img.classList.contains('underdrawing-loaded')) {
                        img.classList.add('underdrawing-loading');
                        
                        // 模拟渐进式加载
                        let progress = 0;
                        const animateLoad = () => {
                            progress += Math.random() * 0.15;
                            img.style.setProperty('--load-progress', Math.min(progress, 1));
                            
                            if (progress < 1) {
                                requestAnimationFrame(animateLoad);
                            } else {
                                img.classList.remove('underdrawing-loading');
                                img.classList.add('underdrawing-loaded');
                                observer.unobserve(img);
                            }
                        };
                        animateLoad();
                    }
                }
            });
        }, observerOptions);

        artworks.forEach(img => observer.observe(img));
    }

    // Curator tour removed per request

    /**
     * PAGE TRANSITION EFFECTS
     * 页面过渡效果
     */
    initPageTransitionEffects() {
        document.querySelectorAll('.transition-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.body.classList.add('page-transitioning');
                setTimeout(() => {
                    window.location.href = link.href;
                }, 600);
            });
        });
    }

    // playPaperRustleSound removed with curator tour
}

// 初始化微交互系统
document.addEventListener('DOMContentLoaded', () => {
    new MicroInteractions();
});
