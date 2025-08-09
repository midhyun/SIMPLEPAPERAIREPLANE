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
        
        // 게임 상태
        this.state = GameState.READY;
        this.score = 0;
        this.bestScore = localStorage.getItem('paperPlane_bestScore') || 0;
        this.selectedDifficulty = 'normal';  // 기본 난이도
        
        // 게임 객체들
        this.plane = new Plane(150, this.canvas.height / 2);
        this.obstacleManager = new ObstacleManager(this.canvas.width, this.canvas.height);
        
        // UI 요소들
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('finalScore');
        this.playedDifficultyElement = document.getElementById('playedDifficulty');
        this.bestScoreDisplay = document.getElementById('bestScoreDisplay');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.gameOverlay = document.getElementById('gameOverlay');
        
        // 버튼 이벤트
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        // 난이도 선택 이벤트
        this.setupDifficultySelector();
        
        // 게임 조작 이벤트
        this.setupControls();
        
        // 게임 루프 시작
        this.gameLoop();
        
        console.log('게임 초기화 완료!');
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
                console.log('난이도 선택:', this.selectedDifficulty);
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
        } else if (this.state === GameState.READY) {
            this.startGame();
        } else if (this.state === GameState.GAME_OVER) {
            this.restartGame();
        }
    }
    
    // 게임 시작
    startGame() {
        // 선택된 난이도 적용
        Physics.setDifficulty(this.selectedDifficulty);
        
        this.state = GameState.PLAYING;
        this.score = 0;
        this.updateScore();
        
        // UI 숨기기
        this.gameOverlay.style.display = 'none';
        document.body.classList.add('playing');
        
        // 게임 객체 리셋 (난이도 적용 후)
        this.plane.reset(150, this.canvas.height / 2);
        this.obstacleManager.reset();
        
        const difficultyName = Physics.getDifficultySettings().name;
        console.log(`게임 시작! 난이도: ${difficultyName}`);
    }
    
    // 게임 재시작
    restartGame() {
        this.gameOverScreen.style.display = 'none';
        this.startScreen.style.display = 'block';
        this.state = GameState.READY;
        
        console.log('게임 준비 상태로 전환');
    }
    
    // 게임 오버
    gameOver() {
        this.state = GameState.GAME_OVER;
        
        // 난이도별 최고 점수 키 생성
        const bestScoreKey = `paperPlane_bestScore_${this.selectedDifficulty}`;
        const currentBest = localStorage.getItem(bestScoreKey) || 0;
        
        // 최고 점수 업데이트
        let isNewBest = false;
        if (this.score > currentBest) {
            localStorage.setItem(bestScoreKey, this.score);
            isNewBest = true;
            console.log(`새로운 최고 점수! (${Physics.getDifficultySettings().name})`, this.score);
        }
        
        // UI 표시
        this.finalScoreElement.textContent = this.score;
        this.playedDifficultyElement.textContent = Physics.getDifficultySettings().name;
        this.bestScoreDisplay.style.display = isNewBest ? 'block' : 'none';
        
        this.startScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'block';
        this.gameOverlay.style.display = 'flex';
        document.body.classList.remove('playing');
        
        console.log(`게임 오버! 점수: ${this.score} (난이도: ${Physics.getDifficultySettings().name})`);
    }
    
    // 게임 업데이트
    update() {
        if (this.state !== GameState.PLAYING) return;
        
        // 종이비행기 업데이트
        this.plane.update();
        
        // 경계 체크 (위아래)
        if (this.plane.checkBounds(this.canvas.width, this.canvas.height)) {
            this.gameOver();
            return;
        }
        
        // 장애물 업데이트
        this.obstacleManager.update();
        
        // 충돌 체크
        if (this.obstacleManager.checkCollisions(this.plane)) {
            this.gameOver();
            return;
        }
        
        // 점수 체크
        const scoreIncrease = this.obstacleManager.checkScore(this.plane);
        if (scoreIncrease > 0) {
            this.score += scoreIncrease;
            this.updateScore();
            console.log('점수 획득!', this.score);
        }
    }
    
    // 렌더링
    render() {
        // 화면 클리어
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 간단한 배경 (구름)
        this.drawBackground();
        
        // 게임 객체들 렌더링
        if (this.state === GameState.PLAYING || this.state === GameState.GAME_OVER) {
            this.obstacleManager.render(this.ctx);
        }
        
        this.plane.render(this.ctx);
        
        // 디버그 정보 (개발 중에만)
        if (this.state === GameState.PLAYING) {
            this.drawDebugInfo();
        }
    }
    
    // 배경 그리기
    drawBackground() {
        // 간단한 구름들
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // 구름 1
        this.drawCloud(100, 80, 60);
        this.drawCloud(300, 120, 40);
        this.drawCloud(600, 100, 50);
        
        // 구름 2 (아래쪽)
        this.drawCloud(200, 400, 45);
        this.drawCloud(500, 450, 55);
        this.drawCloud(700, 420, 35);
    }
    
    // 구름 그리기
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // 디버그 정보 표시
    drawDebugInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 220, 120);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        
        const planeInfo = this.plane.getDebugInfo();
        const settings = Physics.getDifficultySettings();
        
        this.ctx.fillText(`Difficulty: ${settings.name}`, 15, 25);
        this.ctx.fillText(`Plane: (${planeInfo.x}, ${planeInfo.y})`, 15, 40);
        this.ctx.fillText(`Velocity: ${planeInfo.velocity}`, 15, 55);
        this.ctx.fillText(`Rotation: ${planeInfo.rotation}`, 15, 70);
        this.ctx.fillText(`Obstacles: ${this.obstacleManager.getObstacleCount()}`, 15, 85);
        this.ctx.fillText(`Score: ${this.score}`, 15, 100);
    }
    
    // 점수 업데이트
    updateScore() {
        this.scoreElement.textContent = this.score;
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
    console.log('페이지 로드 완료, 게임 초기화 중...');
    new Game();
});
