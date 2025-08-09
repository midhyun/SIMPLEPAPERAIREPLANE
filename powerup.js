
// Base class for power-ups
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // Move at the same speed as obstacles
        this.speed = Physics.getDifficultySettings().obstacleSpeed; 
    }

    update() {
        this.x += this.speed;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    getBoundingBox() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Shield Item
class ShieldPowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.width = 30;
        this.height = 30;
        this.color = 'rgba(52, 152, 219, 0.8)';
        this.borderColor = '#FFFFFF';
    }

    render(ctx) {
        ctx.save();
        // Draw shield icon (a circle with an 'S')
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = this.borderColor;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', this.x + this.width / 2, this.y + this.height / 2 + 1);
        ctx.restore();
    }
}

// Power-up Manager
class PowerUpManager {
    constructor(canvasWidth, canvasHeight) {
        this.powerUps = [];
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        // Spawn roughly every 8-12 seconds
        this.spawnInterval = Utils.randomInt(480, 720); 
        this.spawnTimer = 0;
    }

    update() {
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnPowerUp();
            this.spawnTimer = 0;
            // Reset interval for variety
            this.spawnInterval = Utils.randomInt(480, 720);
        }

        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update();
            if (this.powerUps[i].isOffScreen()) {
                this.powerUps.splice(i, 1);
            }
        }
    }

    spawnPowerUp() {
        // Spawn a shield power-up at a random height, avoiding top/bottom edges
        const y = Utils.randomInt(this.canvasHeight * 0.2, this.canvasHeight * 0.8);
        const x = this.canvasWidth;
        this.powerUps.push(new ShieldPowerUp(x, y));
    }

    render(ctx) {
        this.powerUps.forEach(p => p.render(ctx));
    }

    checkCollision(plane) {
        const planeBox = plane.getBoundingBox();
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            const powerUpBox = powerUp.getBoundingBox();
            if (Physics.checkCollision(planeBox, powerUpBox)) {
                // Remove collected power-up
                this.powerUps.splice(i, 1); 
                // Return the type of power-up collected
                return powerUp;
            }
        }
        return null;
    }

    reset() {
        this.powerUps = [];
        this.spawnTimer = 0;
    }
}
