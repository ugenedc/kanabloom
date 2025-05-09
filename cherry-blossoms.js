class CherryBlossom {
    constructor(image) {
        this.x = Math.random() * window.innerWidth;
        this.y = -20;
        this.rotation = Math.random() * 360;
        this.speed = 0.3 + Math.random() * 0.4;
        this.size = 20 + Math.random() * 25;
        this.oscillationSpeed = 0.008 + Math.random() * 0.012;
        this.oscillationDistance = 8 + Math.random() * 12;
        this.swingFactor = Math.random() * Math.PI * 2;
        this.opacity = 0.4 + Math.random() * 0.3;
        this.image = image;
        this.scale = 0.7 + Math.random() * 0.3;
        this.rotationSpeed = (0.2 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1);
    }

    update() {
        this.y += this.speed;
        this.swingFactor += this.oscillationSpeed;
        this.x += Math.sin(this.swingFactor) * (this.oscillationDistance / 60);
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        
        const scaledSize = this.size * this.scale;
        ctx.drawImage(this.image, -scaledSize/2, -scaledSize/2, scaledSize, scaledSize);
        
        ctx.restore();
    }
}

class CherryBlossomAnimation {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('cherryBlossoms');
        
        if (!this.container) {
            console.warn('Cherry blossoms container not found');
            return;
        }
        
        this.container.appendChild(this.canvas);
        this.blossoms = [];
        this.maxBlossoms = 30;
        this.images = [];
        this.animationFrame = null;
        this.isVisible = true;
        this.loadedImages = 0;
        this.requiredImages = 15; // Minimum number of images needed to start
        
        this.loadImages();
        this.resize();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            this.checkVisibility();
            
            scrollTimeout = setTimeout(() => {
                this.checkVisibility();
            }, 150);
        });
    }
    
    checkVisibility() {
        if (!this.container) return;
        
        const rect = this.container.getBoundingClientRect();
        const isVisible = (
            rect.top < window.innerHeight &&
            rect.bottom > 0
        );
        
        if (isVisible !== this.isVisible) {
            this.isVisible = isVisible;
            if (isVisible) {
                this.resume();
            } else {
                this.pause();
            }
        }
    }
    
    loadImages() {
        const totalPetals = 30;
        
        for (let i = 1; i <= totalPetals; i++) {
            const img = new Image();
            img.onload = () => {
                this.loadedImages++;
                if (this.loadedImages >= this.requiredImages) {
                    this.start();
                }
            };
            img.onerror = (err) => {
                console.warn(`Failed to load petal${i}.svg:`, err);
            };
            img.src = `images/petals/petal${i}.svg`;
            this.images.push(img);
        }
    }
    
    start() {
        if (this.animationFrame) return;
        this.checkVisibility();
        if (this.isVisible) {
            this.animate();
        }
    }
    
    pause() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    resume() {
        if (!this.animationFrame && this.isVisible) {
            this.animate();
        }
    }
    
    resize() {
        if (!this.container) return;
        
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    }
    
    addNewBlossoms() {
        if (this.blossoms.length < this.maxBlossoms && Math.random() > 0.95) {
            const randomImage = this.images[Math.floor(Math.random() * this.images.length)];
            if (randomImage.complete) {
                this.blossoms.push(new CherryBlossom(randomImage));
            }
        }
    }
    
    animate() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.addNewBlossoms();
        
        this.blossoms = this.blossoms.filter(blossom => blossom.y < this.canvas.height + 50);
        
        this.blossoms.forEach(blossom => {
            blossom.update();
            blossom.draw(this.ctx);
        });
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
}

// Start the animation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CherryBlossomAnimation();
}); 