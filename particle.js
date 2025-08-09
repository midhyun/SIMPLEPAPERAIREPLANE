// 파티클 시스템
class Particle {
    constructor(x, y, type = 'default') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1.0;
        this.maxLife = 1.0;
        
        // 파티클 타입별 설정
        this.setupParticleType(type);
        
        // 물리 속성
        this.vx = Utils.randomRange(-2, 2);
        this.vy = Utils.randomRange(-3, -1);
        this.gravity = 0.1;
        this.friction = 0.98;
        
        // 렌더링 속성
        this.size = Utils.randomRange(2, 6);
        this.rotation = 0;
        this.rotationSpeed = Utils.randomRange(-0.2, 0.2);
    }
    
    setupParticleType(type) {
        switch(type) {
            case 'jump':
                this.color = '#87CEEB';
                this.maxLife = 0.8;
                this.life = this.maxLife;
                break;
            case 'score':
                this.color = '#FFD700';
                this.maxLife = 1.2;
                this.life = this.maxLife;
                this.size = Utils.randomRange(3, 8);
                break;
            case 'collision':
                this.color = '#FF6B6B';
                this.maxLife = 1.0;
                this.life = this.maxLife;
                this.vx = Utils.randomRange(-4, 4);
                this.vy = Utils.randomRange(-5, -2);
                break;
            case 'trail':
                this.color = '#FFFFFF';
                this.maxLife = 0.3;
                this.life = this.maxLife;
                this.size = Utils.randomRange(1, 3);
                this.gravity = 0;
                break;
            default:
                this.color = '#FFFFFF';
                this.maxLife = 1.0;
                this.life = this.maxLife;
        }
    }
    
    update() {
        // 물리 업데이트
        this.vx *= this.friction;
        this.vy += this.gravity;
        
        this.x += this.vx;
        this.y += this.vy;
        
        // 회전 업데이트
        this.rotation += this.rotationSpeed;
        
        // 생명력 감소
        this.life -= 1 / 60; // 60fps 기준
        
        return this.life > 0;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 파티클 타입별 렌더링
        switch(this.type) {
            case 'jump':
                this.renderCircle(ctx);
                break;
            case 'score':
                this.renderStar(ctx);
                break;
            case 'collision':
                this.renderExplosion(ctx);
                break;
            case 'trail':
                this.renderCircle(ctx);
                break;
            default:
                this.renderCircle(ctx);
        }
        
        ctx.restore();
    }
    
    renderCircle(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderStar(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size * 0.5;
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
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
    }
    
    renderExplosion(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 2;
        
        // 폭발 모양 (불규칙한 원)
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (i * Math.PI * 2) / points;
            const radius = this.size * Utils.randomRange(0.7, 1.3);
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
    }
}

// 파티클 매니저
class ParticleManager {
    constructor() {
        this.particles = [];
    }
    
    // 파티클 생성
    createParticles(x, y, count, type = 'default') {
        for (let i = 0; i < count; i++) {
            const particle = new Particle(
                x + Utils.randomRange(-10, 10),
                y + Utils.randomRange(-10, 10),
                type
            );
            this.particles.push(particle);
        }
    }
    
    // 점프 파티클
    createJumpParticles(x, y) {
        this.createParticles(x, y, 5, 'jump');
    }
    
    // 점수 파티클
    createScoreParticles(x, y) {
        this.createParticles(x, y, 8, 'score');
    }
    
    // 충돌 파티클
    createCollisionParticles(x, y) {
        this.createParticles(x, y, 15, 'collision');
    }
    
    // 트레일 파티클
    createTrailParticle(x, y) {
        this.createParticles(x, y, 1, 'trail');
    }
    
    // 업데이트
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (!particle.update()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // 렌더링
    render(ctx) {
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }
    
    // 파티클 개수 반환
    getParticleCount() {
        return this.particles.length;
    }
    
    // 모든 파티클 제거
    clear() {
        this.particles = [];
    }
}

