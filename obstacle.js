// 장애물 클래스
class Obstacle {
    constructor(x, canvasHeight) {
        this.x = x;
        this.width = 60;
        this.passed = false;    // 점수 계산용
        
        // 난이도별 설정 적용
        const settings = Physics.getDifficultySettings();
        this.speed = settings.obstacleSpeed;        // 좌측으로 이동 속도
        this.gap = settings.obstacleGap;            // 위아래 파이프 사이 간격
        this.minHeight = 50;    // 최소 파이프 높이
        this.maxHeight = canvasHeight - this.gap - this.minHeight;
        
        // 랜덤 높이 계산
        this.topHeight = Utils.randomInt(this.minHeight, this.maxHeight);
        this.bottomY = this.topHeight + this.gap;
        this.bottomHeight = canvasHeight - this.bottomY;
        
        // 색상 설정
        this.color = '#228B22';
        this.strokeColor = '#1F5F1F';
        this.strokeWidth = 3;
    }
    
    // 업데이트 (이동)
    update() {
        this.x += this.speed;
    }
    
    // 렌더링
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        
        // 위쪽 파이프 그리기
        this.drawPipe(ctx, this.x, 0, this.width, this.topHeight, true);
        
        // 아래쪽 파이프 그리기
        this.drawPipe(ctx, this.x, this.bottomY, this.width, this.bottomHeight, false);
    }
    
    // 파이프 그리기 (장식 포함)
    drawPipe(ctx, x, y, width, height, isTop) {
        // 메인 파이프
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        
        // 파이프 끝부분 (더 두꺼운 부분)
        const capHeight = 25;
        const capWidth = width + 10;
        const capX = x - 5;
        
        if (isTop) {
            // 위쪽 파이프 캡 (아래쪽에)
            const capY = y + height - capHeight;
            ctx.fillRect(capX, capY, capWidth, capHeight);
            ctx.strokeRect(capX, capY, capWidth, capHeight);
        } else {
            // 아래쪽 파이프 캡 (위쪽에)
            ctx.fillRect(capX, y, capWidth, capHeight);
            ctx.strokeRect(capX, y, capWidth, capHeight);
        }
        
        // 파이프 질감 (세로 줄무늬)
        ctx.strokeStyle = '#1A4D1A';
        ctx.lineWidth = 1;
        for (let i = x + 10; i < x + width - 10; i += 15) {
            ctx.beginPath();
            ctx.moveTo(i, y);
            ctx.lineTo(i, y + height);
            ctx.stroke();
        }
        
        // 원래 색상 복원
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
    }
    
    // 충돌 감지
    checkCollision(plane) {
        const planeBox = plane.getBoundingBox();
        
        // 위쪽 파이프와 충돌 체크
        const topPipe = {
            x: this.x,
            y: 0,
            width: this.width,
            height: this.topHeight
        };
        
        // 아래쪽 파이프와 충돌 체크
        const bottomPipe = {
            x: this.x,
            y: this.bottomY,
            width: this.width,
            height: this.bottomHeight
        };
        
        return Physics.checkCollision(planeBox, topPipe) || 
               Physics.checkCollision(planeBox, bottomPipe);
    }
    
    // 점수 체크 (비행기가 장애물을 통과했는지)
    checkScore(plane) {
        if (!this.passed && plane.x > this.x + this.width) {
            this.passed = true;
            return true;
        }
        return false;
    }
    
    // 화면 밖으로 나갔는지 체크
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    // 디버그 정보
    getDebugInfo() {
        return {
            x: Math.round(this.x),
            topHeight: this.topHeight,
            bottomY: this.bottomY,
            gap: this.gap,
            passed: this.passed
        };
    }
}

// 장애물 관리자 클래스
class ObstacleManager {
    constructor(canvasWidth, canvasHeight) {
        this.obstacles = [];
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.spawnTimer = 0;
        this.updateSpawnInterval();    // 난이도별 생성 간격 설정
    }
    
    // 난이도별 생성 간격 업데이트
    updateSpawnInterval() {
        const settings = Physics.getDifficultySettings();
        this.spawnInterval = settings.spawnInterval;
    }
    
    // 업데이트
    update() {
        // 장애물 생성 타이머
        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTimer = 0;
        }
        
        // 기존 장애물들 업데이트
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].update();
            
            // 화면 밖으로 나간 장애물 제거
            if (this.obstacles[i].isOffScreen()) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    // 새 장애물 생성
    spawnObstacle() {
        const obstacle = new Obstacle(this.canvasWidth, this.canvasHeight);
        this.obstacles.push(obstacle);
    }
    
    // 모든 장애물 렌더링
    render(ctx) {
        this.obstacles.forEach(obstacle => {
            obstacle.render(ctx);
        });
    }
    
    // 충돌 체크
    checkCollisions(plane) {
        return this.obstacles.some(obstacle => obstacle.checkCollision(plane));
    }
    
    // 점수 체크
    checkScore(plane) {
        let scoreIncrease = 0;
        this.obstacles.forEach(obstacle => {
            if (obstacle.checkScore(plane)) {
                scoreIncrease++;
            }
        });
        return scoreIncrease;
    }
    
    // 리셋 (게임 재시작시)
    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.updateSpawnInterval();    // 난이도 변경시 간격 업데이트
    }
    
    // 장애물 개수 반환
    getObstacleCount() {
        return this.obstacles.length;
    }
}
