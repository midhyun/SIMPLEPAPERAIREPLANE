// 게임 상태 관리
const GameState = {
    READY: 'ready',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// 메인 게임 클래스
class Game {
    constructor() {
        // 캔버스 설정
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // 화면 크기에 따른 물리 설정 초기화
        this.updatePhysicsForScreenSize();
        
        // 게임 상태
        this.state = GameState.READY;
        this.score = 0;
        this.stars = 0; // 별 점수
        this.bestScore = localStorage.getItem('paperPlane_bestScore') || 0;
        this.selectedDifficulty = 'normal';  // 기본 난이도
        
        // 게임 객체들
        this.plane = new Plane(150, this.canvas.height / 2);
        this.collectibleManager = new CollectibleManager();
        this.obstacleManager = new ObstacleManager(this.canvas.width, this.canvas.height, this.collectibleManager);
        this.particleManager = new ParticleManager();
        this.powerUpManager = new PowerUpManager(this.canvas.width, this.canvas.height);
        this.backgroundManager = new BackgroundManager(this.canvas.width, this.canvas.height);
        
        // 사운드 매니저 초기화
        this.soundManager = initSoundManager();
        
        // UI 요소들
        this.scoreElement = document.getElementById('score');
        this.starScoreElement = document.getElementById('starScore');
        this.finalScoreElement = document.getElementById('finalScore');
        this.playedDifficultyElement = document.getElementById('playedDifficulty');
        this.bestScoreDisplay = document.getElementById('bestScoreDisplay');
        this.currentBestScoreElement = document.getElementById('currentBestScore');
        this.soundToggleBtn = document.getElementById('soundToggle');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.gameOverlay = document.getElementById('gameOverlay');
        
        // 버튼 이벤트
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
        
        // 난이도 선택 이벤트
        this.setupDifficultySelector();
        
        // 최고 점수 초기화
        this.updateBestScoreDisplay();
        
        // 게임 조작 이벤트
        this.setupControls();
        
        // 창 크기 변경 이벤트
        this.setupResizeHandler();
        
        // 게임 루프 시작
        this.gameLoop();
    
    }
    
    // 난이도 선택 설정
    setupDifficultySelector() {
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        
        difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 모든 버튼에서 active 클래스 제거
                difficultyButtons.forEach(btn => btn.classList.remove('active'));
                
                // 클릭한 버튼에 active 클래스 추가
                button.classList.add('active');
                
                // 선택된 난이도 저장
                this.selectedDifficulty = button.dataset.difficulty;
                this.onDifficultyChanged();
            });
        });
    }
    
    // 조작 설정 (마우스/터치)
    setupControls() {
        // 마우스 이벤트
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        // 터치 이벤트 (모바일)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        // 키보드 이벤트 (스페이스바)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInput();
            }
        });
    }
    
    // 입력 처리
    handleInput() {
        if (this.state === GameState.PLAYING) {
            this.plane.jump();
            // 점프 파티클과 사운드 효과
            this.particleManager.createJumpParticles(
                this.plane.x + this.plane.width / 2,
                this.plane.y + this.plane.height
            );
            playJumpSound();
        } else if (this.state === GameState.READY) {
            this.startGame();
        } else if (this.state === GameState.GAME_OVER) {
            this.restartGame();
        }
    }
    
    // 게임 시작
    startGame() {
        // 화면 크기에 따른 물리 설정 업데이트
        this.updatePhysicsForScreenSize();
        
        // 선택된 난이도 적용
        Physics.setDifficulty(this.selectedDifficulty);
        
        this.state = GameState.PLAYING;
        this.score = 0;
        this.stars = 0;
        this.updateScore();
        this.updateStarScore();
        
        // UI 숨기기
        this.gameOverlay.style.display = 'none';
        document.body.classList.add('playing');
        
        // 게임 객체 리셋 (난이도 적용 후)
        this.plane.reset(150, this.canvas.height / 2);
        this.obstacleManager.reset();
        this.collectibleManager.reset();
        this.particleManager.clear();
        this.powerUpManager.reset();
        
        // 게임 시작 사운드
        playStartSound();
        
        // 최고 점수 표시 최신화
        this.updateBestScoreDisplay();
        
        const difficultyName = Physics.getDifficultySettings().name;
    }
    
    // 게임 재시작
    restartGame() {
        this.gameOverScreen.style.display = 'none';
        this.startScreen.style.display = 'block';
        this.state = GameState.READY;
        
        // 최고 점수 표시 업데이트
        this.updateBestScoreDisplay();
        
    }
    
    // 게임 오버
    gameOver() {
        this.state = GameState.GAME_OVER;
        
        // 난이도별 최고 점수 키 생성
        const bestScoreKey = `paperPlane_bestScore_${this.selectedDifficulty}`;
        const currentBest = parseInt(localStorage.getItem(bestScoreKey) || 0);
        
        // 최고 점수 업데이트 (최종 확인)
        let isNewBest = false;
        if (this.score > currentBest) {
            localStorage.setItem(bestScoreKey, this.score);
            isNewBest = true;
        }
        
        // 최고 점수 UI 최종 업데이트 (실시간 업데이트가 되지 않았을 경우를 대비)
        this.updateBestScoreDisplay();
        
        // UI 표시
        this.finalScoreElement.textContent = this.score;
        this.playedDifficultyElement.textContent = Physics.getDifficultySettings().name;
        this.bestScoreDisplay.style.display = isNewBest ? 'block' : 'none';
        
        this.startScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'block';
        this.gameOverlay.style.display = 'flex';
        document.body.classList.remove('playing');
        
    }
    
    // 게임 업데이트
    update() {
        this.backgroundManager.update(); // 배경은 항상 움직임

        if (this.state !== GameState.PLAYING) return;
        
        // 종이비행기 업데이트
        this.plane.update();

        // 파워업 업데이트 및 수집
        this.powerUpManager.update();
        const collectedPowerUp = this.powerUpManager.checkCollision(this.plane);
        if (collectedPowerUp) {
            if (collectedPowerUp instanceof ShieldPowerUp) {
                this.plane.activateShield();
                playPowerUpSound();
            }
        }
        
        // 경계 체크 (위아래)
        if (this.plane.checkBounds(this.canvas.width, this.canvas.height)) {
            this.gameOver();
            return;
        }
        
        // 장애물 업데이트
        this.obstacleManager.update();

        // 별 업데이트 및 수집
        this.collectibleManager.update();
        const collectedStars = this.collectibleManager.checkCollisions(this.plane);
        if (collectedStars > 0) {
            this.stars += collectedStars;
            this.updateStarScore();
            playScoreSound(); // 별 수집 시 점수 사운드 재사용
        }
        
        // 충돌 체크
        const collidedObstacle = this.obstacleManager.checkCollisions(this.plane);
        if (collidedObstacle) {
            if (this.plane.hasShield) {
                this.plane.deactivateShield();
                this.obstacleManager.destroyObstacle(collidedObstacle);
                playShieldBreakSound();
                // 보호막 파괴 파티클 효과
                this.particleManager.createCollisionParticles(
                    this.plane.x + this.plane.width / 2,
                    this.plane.y + this.plane.height / 2
                );
            } else {
                // 충돌 파티클 효과
                this.particleManager.createCollisionParticles(
                    this.plane.x + this.plane.width / 2,
                    this.plane.y + this.plane.height / 2
                );
                playGameOverSound();
                this.gameOver();
                return;
            }
        }
        
        // 점수 체크
        const scoreIncrease = this.obstacleManager.checkScore(this.plane);
        if (scoreIncrease > 0) {
            this.score += scoreIncrease;
            this.updateScore();
            
            // 점수 파티클과 사운드 효과
            this.particleManager.createScoreParticles(
                this.plane.x + this.plane.width / 2,
                this.plane.y + this.plane.height / 2
            );
            playScoreSound();
            
        }
        
        // 트레일 파티클 (종이비행기 뒤에)
        if (Math.random() < 0.3) { // 30% 확률로 트레일 생성
            this.particleManager.createTrailParticle(
                this.plane.x,
                this.plane.y + this.plane.height / 2
            );
        }
        
        // 파티클 시스템 업데이트
        this.particleManager.update();
    }
    
    // 렌더링
    render() {
        // 화면 클리어
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 새로운 배경 렌더링
        this.backgroundManager.render(this.ctx);
        
        // 게임 객체들 렌더링
        if (this.state === GameState.PLAYING || this.state === GameState.GAME_OVER) {
            this.obstacleManager.render(this.ctx);
            this.powerUpManager.render(this.ctx);
            this.collectibleManager.render(this.ctx);
        }
        
        this.plane.render(this.ctx);
        
        // 파티클 렌더링
        this.particleManager.render(this.ctx);
        
        // 디버그 정보 (개발 중에만)
        if (this.state === GameState.PLAYING) {
            this.drawDebugInfo();
        }
    }
    
    
    
    // 디버그 정보 표시
    drawDebugInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 220, 140);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        
        const planeInfo = this.plane.getDebugInfo();
        const settings = Physics.getDifficultySettings();
        
        this.ctx.fillText(`Difficulty: ${settings.name}`, 15, 25);
        this.ctx.fillText(`Plane: (${planeInfo.x}, ${planeInfo.y})`, 15, 40);
        this.ctx.fillText(`Velocity: ${planeInfo.velocity}`, 15, 55);
        this.ctx.fillText(`Rotation: ${planeInfo.rotation}`, 15, 70);
        this.ctx.fillText(`Shielded: ${planeInfo.shielded}`, 15, 85);
        this.ctx.fillText(`Obstacles: ${this.obstacleManager.getObstacleCount()}`, 15, 100);
        this.ctx.fillText(`Particles: ${this.particleManager.getParticleCount()}`, 15, 115);
        this.ctx.fillText(`Score: ${this.score}`, 15, 130);
        this.ctx.fillText(`Stars: ${this.stars}`, 15, 145);
        this.ctx.fillText(`Sound: ${this.soundManager?.isEnabled() ? 'ON' : 'OFF'}`, 15, 160);
    }
    
    // 점수 업데이트
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        // 실시간 최고 점수 체크 및 업데이트
        this.checkAndUpdateBestScore();
    }

    // 별 점수 업데이트
    updateStarScore() {
        this.starScoreElement.textContent = this.stars;
    }
    
    // 실시간 최고 점수 체크 및 업데이트
    checkAndUpdateBestScore() {
        const bestScoreKey = `paperPlane_bestScore_${this.selectedDifficulty}`;
        const currentBest = parseInt(localStorage.getItem(bestScoreKey) || 0);
        
        // 현재 점수가 최고 점수를 넘었으면 즉시 업데이트
        if (this.score > currentBest) {
            localStorage.setItem(bestScoreKey, this.score);
            this.updateBestScoreDisplay();
        }
    }
    
    // 사운드 토글
    toggleSound() {
        if (this.soundManager) {
            const isEnabled = this.soundManager.toggleSound();
            this.soundToggleBtn.textContent = isEnabled ? '🔊 사운드' : '🔇 사운드';
            this.soundToggleBtn.classList.toggle('disabled', !isEnabled);
        }
    }
    
    // 최고 점수 표시 업데이트
    updateBestScoreDisplay() {
        const bestScoreKey = `paperPlane_bestScore_${this.selectedDifficulty}`;
        const currentBest = parseInt(localStorage.getItem(bestScoreKey) || 0);
        this.currentBestScoreElement.textContent = currentBest;
    }
    
    // 난이도 변경시 최고 점수 업데이트
    onDifficultyChanged() {
        this.updateBestScoreDisplay();
    }
    
    // 화면 크기에 따른 물리 설정 업데이트
    updatePhysicsForScreenSize() {
        // 현재 캔버스의 실제 표시 크기 확인
        const rect = this.canvas.getBoundingClientRect();
        const displayWidth = rect.width;
        const displayHeight = rect.height;
        
        // 물리 엔진에 화면 크기 정보 전달
        Physics.setScreenType(displayWidth, displayHeight);
        
    }
    
    // 창 크기 변경 이벤트 설정
    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            // 연속적인 리사이즈 이벤트 방지
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updatePhysicsForScreenSize();
                // 게임이 진행 중이 아닐 때만 난이도 재적용
                if (this.state !== GameState.PLAYING) {
                    Physics.setDifficulty(this.selectedDifficulty);
                }
            }, 100);
        });
        
        // 화면 방향 변경 감지 (모바일)
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updatePhysicsForScreenSize();
                if (this.state !== GameState.PLAYING) {
                    Physics.setDifficulty(this.selectedDifficulty);
                }
            }, 300);
        });
    }
    
    // 게임 루프
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 게임 시작
window.addEventListener('load', () => {
    new Game();
});
