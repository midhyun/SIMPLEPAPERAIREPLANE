
// 개별 구름을 정의하는 클래스
class Cloud {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.randomize(); // 구름의 속성(크기, 위치, 속도)을 랜덤으로 설정
        this.x = Math.random() * canvasWidth; // 시작 위치도 랜덤으로
    }

    // 구름의 속성을 랜덤으로 설정하여 재사용 가능하게 함
    randomize() {
        this.y = Math.random() * this.canvasHeight * 0.8; // 너무 낮게 깔리지 않도록
        this.size = Math.random() * 50 + 20; // 20에서 70 사이의 크기
        this.speed = Math.random() * 0.5 + 0.1; // 0.1에서 0.6 사이의 속도
        this.alpha = Math.random() * 0.5 + 0.3; // 0.3에서 0.8 사이의 투명도

        // 구름을 구성하는 작은 원들의 집합 (푹신한 모양을 위해)
        this.components = [];
        const numCircles = 5 + Math.floor(this.size / 10);
        for (let i = 0; i < numCircles; i++) {
            this.components.push({
                xOffset: (Math.random() - 0.5) * this.size * 1.2,
                yOffset: (Math.random() - 0.5) * this.size * 0.5,
                radius: Math.random() * (this.size / 3) + (this.size / 4)
            });
        }
    }

    update() {
        this.x -= this.speed;
        // 화면 왼쪽 밖으로 나가면
        if (this.x + this.size < 0) {
            this.x = this.canvasWidth + this.size; // 오른쪽 끝에서 다시 나타남
            this.randomize(); // 속성을 다시 랜덤화하여 다른 구름처럼 보이게 함
        }
    }

    render(ctx) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;

        // 여러 개의 원을 겹쳐 그려 푹신한 구름 모양을 만듦
        this.components.forEach(comp => {
            ctx.beginPath();
            ctx.arc(this.x + comp.xOffset, this.y + comp.yOffset, comp.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

// 배경 전체(구름들)를 관리하는 클래스
class BackgroundManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.clouds = [];
        this.numClouds = 10; // 배경에 표시될 구름의 수

        this.init();
    }

    init() {
        for (let i = 0; i < this.numClouds; i++) {
            this.clouds.push(new Cloud(this.canvasWidth, this.canvasHeight));
        }
        // 속도가 느린 구름이 뒤에 그려지도록 정렬 (입체감)
        this.clouds.sort((a, b) => a.speed - b.speed);
    }

    update() {
        this.clouds.forEach(cloud => cloud.update());
    }

    render(ctx) {
        this.clouds.forEach(cloud => cloud.render(ctx));
    }
}
