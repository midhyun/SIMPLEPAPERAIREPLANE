// 난이도별 게임 설정
const DifficultySettings = {
    easy: {
        gravity: 0.35,
        jumpForce: -8,
        obstacleSpeed: -2,
        obstacleGap: 180,
        spawnInterval: 180,
        name: '쉬움'
    },
    normal: {
        gravity: 0.45,
        jumpForce: -7,
        obstacleSpeed: -3,
        obstacleGap: 150,
        spawnInterval: 150,
        name: '보통'
    },
    hard: {
        gravity: 0.55,
        jumpForce: -6,
        obstacleSpeed: -4,
        obstacleGap: 120,
        spawnInterval: 120,
        name: '어려움'
    }
};

// 물리 엔진 - 중력, 충돌 감지 등
class Physics {
    // 게임 물리 상수 (기본값)
    static GRAVITY = 0.45;           // 중력 가속도
    static JUMP_FORCE = -7;        // 점프력 (음수 = 위로)
    static MAX_FALL_SPEED = 10;     // 최대 낙하 속도
    static TERMINAL_VELOCITY = 8;   // 터미널 속도
    
    // 현재 난이도 설정
    static currentDifficulty = 'easy';
    
    // 난이도 설정 적용
    static setDifficulty(difficulty) {
        if (DifficultySettings[difficulty]) {
            Physics.currentDifficulty = difficulty;
            const settings = DifficultySettings[difficulty];
            Physics.GRAVITY = settings.gravity;
            Physics.JUMP_FORCE = settings.jumpForce;
            console.log(`난이도 설정: ${settings.name}`, settings);
        }
    }
    
    // 현재 난이도 설정 반환
    static getDifficultySettings() {
        return DifficultySettings[Physics.currentDifficulty];
    }
    
    // AABB 충돌 감지
    static checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // 중력 적용
    static applyGravity(object) {
        object.velocity += Physics.GRAVITY;
        
        // 최대 낙하 속도 제한
        if (object.velocity > Physics.MAX_FALL_SPEED) {
            object.velocity = Physics.MAX_FALL_SPEED;
        }
    }
    
    // 점프 적용
    static applyJump(object) {
        object.velocity = Physics.JUMP_FORCE;
    }
    
    // 속도에 따른 회전각 계산 (종이비행기용)
    static calculateRotation(velocity) {
        // 속도에 따라 -30도 ~ +30도 회전
        const maxRotation = Math.PI / 6; // 30도
        const normalizedVelocity = Math.max(-10, Math.min(10, velocity));
        return (normalizedVelocity / 10) * maxRotation;
    }
    
    // 경계 체크 (화면 밖으로 나가는지)
    static isOutOfBounds(object, canvasWidth, canvasHeight) {
        return object.x + object.width < 0 || 
               object.x > canvasWidth || 
               object.y + object.height < 0 || 
               object.y > canvasHeight;
    }
    
    // 화면 내 위치 제한
    static clampToScreen(object, canvasWidth, canvasHeight) {
        // 위쪽 경계
        if (object.y < 0) {
            object.y = 0;
            object.velocity = 0;
        }
        
        // 아래쪽 경계
        if (object.y + object.height > canvasHeight) {
            object.y = canvasHeight - object.height;
            object.velocity = 0;
        }
        
        // 좌우 경계 (종이비행기는 제한하지 않음)
        if (object.x < 0) {
            object.x = 0;
        }
        if (object.x + object.width > canvasWidth) {
            object.x = canvasWidth - object.width;
        }
    }
}

// 유틸리티 함수들
class Utils {
    // 랜덤 범위 생성
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // 랜덤 정수 생성
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // 거리 계산
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 각도를 라디안으로 변환
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // 라디안을 각도로 변환
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
}
