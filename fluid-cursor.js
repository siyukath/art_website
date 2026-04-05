document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'fluidCursor';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // The hero palette colors
    const colors = [
        {r: 235, g: 100, b: 80},  // Soft Red
        {r: 140, g: 170, b: 100}, // Pale Green
        {r: 240, g: 180, b: 100}, // Warm Yellow
        {r: 200, g: 190, b: 180}  // Grey Watermark
    ];

    let nodes = [];
    let lastMouse = { x: width / 2, y: height / 2 };

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    class OrganicNode {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 10; // Slight scatter
            this.y = y + (Math.random() - 0.5) * 10;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.life = 1.0;
            this.size = Math.random() * 1.5 + 0.5;
            this.growth = Math.random() * 0.15 + 0.05; // Expands like tissue
            this.vx = (Math.random() - 0.5) * 2; // Drifts outward
            this.vy = (Math.random() - 0.5) * 2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.92; // Slows down quickly
            this.vy *= 0.92;
            this.size += this.growth; // Expands over time
            this.life -= 0.012; // Fades slowly
        }
    }

    window.addEventListener('mousemove', (e) => {
        const dist = Math.hypot(e.clientX - lastMouse.x, e.clientY - lastMouse.y);
        
        // Spawn nodes when moving
        if (dist > 3) {
            // Spawn 1-3 nodes per movement for a branching effect
            const spawnCount = Math.floor(Math.random() * 3) + 1;
            for(let i=0; i<spawnCount; i++){
                nodes.push(new OrganicNode(e.clientX, e.clientY));
            }
            lastMouse = { x: e.clientX, y: e.clientY };
        }
    });

    function animateCursor() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
            let n = nodes[i];
            n.update();

            // 1. Draw the "Tissue" (Soft, expanding faint circles)
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${n.life * 0.05})`;
            ctx.fill();

            // 2. Draw the "Twigs" (Connect nearby nodes with thin, sharp lines)
            for (let j = i + 1; j < nodes.length; j++) {
                let neighbor = nodes[j];
                let dx = n.x - neighbor.x;
                let dy = n.y - neighbor.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // If nodes are close enough, connect them
                if (distance < 40) {
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(neighbor.x, neighbor.y);
                    // Line opacity depends on both nodes' life and how close they are
                    let alpha = Math.min(n.life, neighbor.life) * (1 - distance / 40) * 0.4;
                    ctx.strokeStyle = `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Remove dead nodes
        nodes = nodes.filter(n => n.life > 0);
        requestAnimationFrame(animateCursor);
    }

    animateCursor();
});