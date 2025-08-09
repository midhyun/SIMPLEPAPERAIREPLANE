// 종이비행기 클래스
class Plane {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.velocity = 0;      // Y축 속도
        this.rotation = 0;      // 회전각
        
        // 렌더링 속성
        this.color = '#FFFFFF';
        this.strokeColor = '#2c3e50';
        this.strokeWidth = 2;
    }
    
    // 업데이트 (물리 적용)
    update() {
        // 중력 적용
        Physics.applyGravity(this);
        
        // 위치 업데이트
        this.y += this.velocity;
        
        // 속도에 따른 회전 계산
        this.rotation = Physics.calculateRotation(this.velocity);
    }
    
    // 점프 (마우스 클릭시)
    jump() {
        Physics.applyJump(this);
    }
    
    // 렌더링
    render(ctx) {
        ctx.save();
        
        // 회전 중심점으로 이동
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // 종이비행기 그리기 (삼각형 모양)
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        
        ctx.beginPath();
        // 종이비행기 모양 (삼각형 + 날개)
        ctx.moveTo(this.width / 2, 0);                    // 앞쪽 끝
        ctx.lineTo(-this.width / 2, this.height / 3);     // 위쪽 날개
        ctx.lineTo(-this.width / 4, 0);                   // 몸체 중간
        ctx.lineTo(-this.width / 2, -this.height / 3);    // 아래쪽 날개
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // 몸체 중앙선
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(-this.width / 4, 0);
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 충돌 감지용 경계 상자 반환
    getBoundingBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // 화면 경계 체크
    checkBounds(canvasWidth, canvasHeight) {
        // 위아래 경계 체크 (게임 오버 조건)
        if (this.y < 0 || this.y + this.height > canvasHeight) {
            return true; // 경계 벗어남
        }
        return false;
    }
    
    // 위치 리셋 (게임 재시작시)
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.rotation = 0;
    }
    
    // 디버그 정보 출력
    getDebugInfo() {
        return {
            x: Math.round(this.x),
            y: Math.round(this.y),
            velocity: Math.round(this.velocity * 100) / 100,
            rotation: Math.round(this.rotation * 180 / Math.PI) + '°'
        };
    }
}
