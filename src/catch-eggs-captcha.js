class CatchEggsCaptcha {
    constructor(options = {}) {
        // Define all possible colors
        this.possibleColors = [
            '#FF5733', // Orange
            '#33FF57', // Green
            '#3357FF', // Blue
            '#F3FF33', // Yellow
            '#FF33F3', // Pink
            '#33FFF3', // Cyan
            '#F333FF', // Purple
            '#FF3333'  // Red
        ];

        this.options = {
            canvasId: options.canvasId || 'catch-eggs-canvas',
            targetColor: options.targetColor || this.getRandomColor(),
            requiredCatches: options.requiredCatches || 2,
            duration: options.duration || 30000,
            width: options.width || 400,
            height: options.height || 600,
            chickenSpeed: options.chickenSpeed || 1,
            eggSpeed: options.eggSpeed || 0.7,
            noiseLevel: options.noiseLevel || 0.15,
            targetEggChance: options.targetEggChance || 0.4,
            colorVariation: options.colorVariation || 0.2,
            patternNoise: options.patternNoise || 0.1,
            maxEggs: options.maxEggs || 15,        // Maximum number of eggs on screen
            spawnRate: options.spawnRate || 0.05,  // Egg spawn probability per frame
            minEggs: options.minEggs || 5          // Minimum number of eggs to maintain
        };

        this.canvas = null;
        this.ctx = null;
        this.chicken = {
            x: 0,
            y: 50,
            width: 80,  // Increased width
            height: 60, // Increased height
            direction: 1
        };
        this.eggs = [];
        this.score = 0;
        this.isRunning = false;
        this.startTime = null;
        this.callback = null;
        this.animationFrame = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 60; // Target 60 FPS
        this.isMouseDown = false;
        this.isProcessingCollision = false;
    }

    getRandomColor() {
        return this.possibleColors[Math.floor(Math.random() * this.possibleColors.length)];
    }

    init() {
        this.canvas = document.getElementById(this.options.canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id ${this.options.canvasId} not found`);
        }

        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.ctx = this.canvas.getContext('2d');

        // Generate colors with the current target color
        this.noiseColors = this.generateNoiseColors();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    generateNoiseColors() {
        const otherColors = this.possibleColors.filter(color => color !== this.options.targetColor);
        const selectedColors = [];
        while (selectedColors.length < 3 && otherColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherColors.length);
            selectedColors.push(otherColors.splice(randomIndex, 1)[0]);
        }

        const colors = [this.options.targetColor, ...selectedColors];

        return colors.map(color => {
            const rgb = this.hexToRgb(color);
            
            // Generate base noise
            const baseNoise = {
                r: rgb.r + (Math.random() * 40 - 20),
                g: rgb.g + (Math.random() * 40 - 20),
                b: rgb.b + (Math.random() * 40 - 20)
            };

            // Add pattern noise
            const patternNoise = {
                r: Math.sin(Date.now() * 0.001) * 15,
                g: Math.cos(Date.now() * 0.001) * 15,
                b: Math.sin(Date.now() * 0.002) * 15
            };

            // Add color variation
            const variation = {
                r: Math.random() * this.options.colorVariation * 255,
                g: Math.random() * this.options.colorVariation * 255,
                b: Math.random() * this.options.colorVariation * 255
            };

            // Combine all noise layers
            const finalColor = {
                r: Math.max(0, Math.min(255, baseNoise.r + patternNoise.r + variation.r)),
                g: Math.max(0, Math.min(255, baseNoise.g + patternNoise.g + variation.g)),
                b: Math.max(0, Math.min(255, baseNoise.b + patternNoise.b + variation.b))
            };

            return {
                original: color,
                noisy: `rgb(${Math.round(finalColor.r)}, ${Math.round(finalColor.g)}, ${Math.round(finalColor.b)})`,
                baseNoise,
                patternNoise,
                variation
            };
        });
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    setupEventListeners() {
        // Mouse position tracking
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        // Mouse down/up tracking
        this.canvas.addEventListener('mousedown', () => {
            if (this.isRunning && !this.isProcessingCollision) {
                this.isMouseDown = true;
                this.checkCollisions();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    checkCollisions() {
        if (!this.isRunning || this.isProcessingCollision) return;

        this.isProcessingCollision = true;
        const catchRadius = 15;
        let collisionOccurred = false;

        try {
            this.eggs = this.eggs.filter(egg => {
                if (collisionOccurred) return true;

                const dx = this.mouseX - egg.x;
                const dy = this.mouseY - egg.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < catchRadius) {
                    collisionOccurred = true;
                    if (egg.originalColor === this.options.targetColor) {
                        this.score++;
                        if (this.score >= this.options.requiredCatches) {
                            setTimeout(() => this.stop(true), 0);
                        }
                    } else {
                        setTimeout(() => this.stop(false), 0);
                    }
                    return false;
                }
                return true;
            });
        } finally {
            this.isProcessingCollision = false;
        }
    }

    start(callback) {
        if (this.isRunning) return;
        
        // Set a new random target color for each game
        this.options.targetColor = this.getRandomColor();
        // Regenerate colors with the new target color
        this.noiseColors = this.generateNoiseColors();
        
        this.callback = callback;
        this.isRunning = true;
        this.score = 0;
        this.startTime = Date.now();
        this.eggs = [];
        this.lastFrameTime = performance.now();
        this.isMouseDown = false;
        this.isProcessingCollision = false;
        
        this.animate(this.lastFrameTime);
    }

    stop(success) {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.isMouseDown = false;
        this.isProcessingCollision = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        if (this.callback) {
            this.callback(success);
        }
    }

    animate(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time
        const deltaTime = currentTime - this.lastFrameTime;
        
        // Skip frame if not enough time has passed
        if (deltaTime < this.frameInterval) {
            this.animationFrame = requestAnimationFrame((time) => this.animate(time));
            return;
        }

        this.lastFrameTime = currentTime;

        try {
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Update chicken position
            this.chicken.x += this.options.chickenSpeed * this.chicken.direction;
            if (this.chicken.x <= 0 || this.chicken.x >= this.canvas.width - this.chicken.width) {
                this.chicken.direction *= -1;
            }

            // Draw chicken
            this.drawChicken();

            // Update and draw eggs
            this.updateEggs();
            this.drawEggs();

            // Check time limit
            if (Date.now() - this.startTime > this.options.duration) {
                this.stop(false);
                return;
            }

            this.animationFrame = requestAnimationFrame((time) => this.animate(time));
        } catch (error) {
            console.error('Animation error:', error);
            this.stop(false);
        }
    }

    drawChicken() {
        const { x, y, width, height } = this.chicken;
        
        // Save context state
        this.ctx.save();
        
        // Draw chicken body
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + width/2,
            y + height/2,
            width/2,
            height/2,
            0, 0, Math.PI * 2
        );
        this.ctx.fill();

        // Draw chicken head
        this.ctx.fillStyle = '#A0522D';
        this.ctx.beginPath();
        this.ctx.arc(
            x + width * 0.8,
            y + height * 0.3,
            height * 0.25,
            0, Math.PI * 2
        );
        this.ctx.fill();

        // Draw beak
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.95, y + height * 0.3);
        this.ctx.lineTo(x + width * 1.1, y + height * 0.3);
        this.ctx.lineTo(x + width * 0.95, y + height * 0.4);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw eye
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(
            x + width * 0.85,
            y + height * 0.25,
            height * 0.05,
            0, Math.PI * 2
        );
        this.ctx.fill();

        // Draw wing
        this.ctx.fillStyle = '#A0522D';
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + width * 0.4,
            y + height * 0.5,
            width * 0.3,
            height * 0.2,
            Math.PI / 4,
            0, Math.PI * 2
        );
        this.ctx.fill();

        // Draw feet
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.3, y + height);
        this.ctx.lineTo(x + width * 0.3, y + height * 1.2);
        this.ctx.moveTo(x + width * 0.7, y + height);
        this.ctx.lineTo(x + width * 0.7, y + height * 1.2);
        this.ctx.stroke();

        // Restore context state
        this.ctx.restore();
    }

    updateEggs() {
        // Calculate spawn probability based on current egg count
        const currentEggCount = this.eggs.length;
        let spawnProbability = this.options.spawnRate;

        // Adjust spawn rate based on current egg count
        if (currentEggCount < this.options.minEggs) {
            // Increase spawn rate if we're below minimum
            spawnProbability *= 2;
        } else if (currentEggCount >= this.options.maxEggs) {
            // Don't spawn if we're at maximum
            spawnProbability = 0;
        } else {
            // Gradually decrease spawn rate as we approach maximum
            const ratio = currentEggCount / this.options.maxEggs;
            spawnProbability *= (1 - ratio);
        }

        // Add new eggs with adjusted frequency
        if (Math.random() < spawnProbability) {
            const isTargetEgg = Math.random() < this.options.targetEggChance;
            
            let colorIndex;
            if (isTargetEgg) {
                colorIndex = this.noiseColors.findIndex(color => 
                    color.original === this.options.targetColor
                );
            } else {
                const nonTargetColors = this.noiseColors.filter(color => 
                    color.original !== this.options.targetColor
                );
                colorIndex = Math.floor(Math.random() * nonTargetColors.length);
            }

            // Ensure we have at least one target egg if none exist
            if (this.eggs.length > 0 && !this.eggs.some(egg => egg.originalColor === this.options.targetColor)) {
                colorIndex = this.noiseColors.findIndex(color => 
                    color.original === this.options.targetColor
                );
            }

            // Update noise for the selected color
            const selectedColor = this.noiseColors[colorIndex];
            const rgb = this.hexToRgb(selectedColor.original);
            
            // Generate new noise values
            const baseNoise = {
                r: rgb.r + (Math.random() * 40 - 20),
                g: rgb.g + (Math.random() * 40 - 20),
                b: rgb.b + (Math.random() * 40 - 20)
            };

            const patternNoise = {
                r: Math.sin(Date.now() * 0.001) * 15,
                g: Math.cos(Date.now() * 0.001) * 15,
                b: Math.sin(Date.now() * 0.002) * 15
            };

            const variation = {
                r: Math.random() * this.options.colorVariation * 255,
                g: Math.random() * this.options.colorVariation * 255,
                b: Math.random() * this.options.colorVariation * 255
            };

            const finalColor = {
                r: Math.max(0, Math.min(255, baseNoise.r + patternNoise.r + variation.r)),
                g: Math.max(0, Math.min(255, baseNoise.g + patternNoise.g + variation.g)),
                b: Math.max(0, Math.min(255, baseNoise.b + patternNoise.b + variation.b))
            };

            this.eggs.push({
                x: this.chicken.x + this.chicken.width/2,
                y: this.chicken.y + this.chicken.height,
                color: `rgb(${Math.round(finalColor.r)}, ${Math.round(finalColor.g)}, ${Math.round(finalColor.b)})`,
                originalColor: selectedColor.original,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: this.options.eggSpeed,
                noise: {
                    base: baseNoise,
                    pattern: patternNoise,
                    variation: variation
                }
            });
        }

        // Update egg positions with smoother motion
        this.eggs.forEach(egg => {
            egg.x += egg.speedX;
            egg.y += egg.speedY;
            
            // Add gentler random motion
            egg.speedX += (Math.random() - 0.5) * this.options.noiseLevel * 0.5;
            
            // Limit maximum horizontal speed
            egg.speedX = Math.max(Math.min(egg.speedX, 2), -2);

            // Update pattern noise for existing eggs
            const rgb = this.hexToRgb(egg.originalColor);
            const patternNoise = {
                r: Math.sin(Date.now() * 0.001 + egg.x) * 15,
                g: Math.cos(Date.now() * 0.001 + egg.y) * 15,
                b: Math.sin(Date.now() * 0.002 + egg.x + egg.y) * 15
            };

            const finalColor = {
                r: Math.max(0, Math.min(255, rgb.r + egg.noise.base.r + patternNoise.r + egg.noise.variation.r)),
                g: Math.max(0, Math.min(255, rgb.g + egg.noise.base.g + patternNoise.g + egg.noise.variation.g)),
                b: Math.max(0, Math.min(255, rgb.b + egg.noise.base.b + patternNoise.b + egg.noise.variation.b))
            };

            egg.color = `rgb(${Math.round(finalColor.r)}, ${Math.round(finalColor.g)}, ${Math.round(finalColor.b)})`;
        });

        // Remove eggs that are out of bounds
        this.eggs = this.eggs.filter(egg => 
            egg.y < this.canvas.height && 
            egg.x > 0 && 
            egg.x < this.canvas.width
        );

        // Ensure we don't exceed maximum eggs
        if (this.eggs.length > this.options.maxEggs) {
            this.eggs = this.eggs.slice(-this.options.maxEggs);
        }
    }

    drawEggs() {
        this.eggs.forEach(egg => {
            this.ctx.fillStyle = egg.color;
            this.ctx.beginPath();
            this.ctx.ellipse(
                egg.x,
                egg.y,
                10,
                15,
                0, 0, Math.PI * 2
            );
            this.ctx.fill();
        });
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CatchEggsCaptcha;
} else {
    window.CatchEggsCaptcha = CatchEggsCaptcha;
} 