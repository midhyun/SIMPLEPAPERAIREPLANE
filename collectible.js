// 별(수집품) 클래스
class Star {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.size = 12; // 별의 크기
        this.color = '#FFD700'; // 금색
        this.strokeColor = '#FFA500'; // 주황색 테두리
        
        // 간단한 상하 움직임(bobbing) 효과용
        this.angle = Math.random() * Math.PI * 2;
        this.bobbingSpeed = 0.05;
        this.bobbingAmount = 3;
    }
    
    update() {
        this.x += this.speed;
        
        // 상하 움직임 업데이트
        this.angle += this.bobbingSpeed;
        this.yOffset = Math.sin(this.angle) * this.bobbingAmount;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.yOffset);
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = 2;
        
        // 별 모양 그리기
        ctx.beginPath();
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size * 0.5;
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 충돌 감지용 경계 상자
    getBoundingBox() {
        return {
            x: this.x - this.size,
            y: this.y - this.size,
            width: this.size * 2,
            height: this.size * 2
        };
    }
    
    // 화면 밖으로 나갔는지 체크
    isOffScreen() {
        return this.x + this.size < 0;
    }
}

// 수집품 관리자 클래스
class CollectibleManager {
    constructor() {
        this.collectibles = [];
    }
    
    spawnStar(x, y, speed) {
        const star = new Star(x, y, speed);
        this.collectibles.push(star);
    }
    
    update() {
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            collectible.update();
            
            if (collectible.isOffScreen()) {
                this.collectibles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        this.collectibles.forEach(collectible => {
            collectible.render(ctx);
        });
    }
    
    checkCollisions(plane) {
        let collectedCount = 0;
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            if (Physics.checkCollision(plane.getBoundingBox(), collectible.getBoundingBox())) {
                this.collectibles.splice(i, 1);
                collectedCount++;
            }
        }
        return collectedCount;
    }
    
    reset() {
        this.collectibles = [];
    }
}