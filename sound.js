// 사운드 매니저
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        
        // Web Audio API 컨텍스트 생성
        this.audioContext = null;
        this.initAudioContext();
        
        // 사운드 생성
        this.createSounds();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    }
    
    // 사운드 생성 (프로그래밍 방식)
    createSounds() {
        if (!this.enabled || !this.audioContext) return;
        
        // 점프 사운드
        this.sounds.jump = this.createJumpSound();
        
        // 점수 사운드
        this.sounds.score = this.createScoreSound();
        
        // 게임 오버 사운드
        this.sounds.gameOver = this.createGameOverSound();
        
        // 시작 사운드
        this.sounds.start = this.createStartSound();
    }
    
    // 점프 사운드 생성 (높은 톤의 짧은 소리)
    createJumpSound() {
        return {
            frequency: 400,
            duration: 0.1,
            type: 'sine',
            volume: 0.3
        };
    }
    
    // 점수 사운드 생성 (상승하는 톤)
    createScoreSound() {
        return {
            frequency: [523, 659, 784], // C5, E5, G5
            duration: 0.3,
            type: 'sine',
            volume: 0.4
        };
    }
    
    // 게임 오버 사운드 생성 (하강하는 톤)
    createGameOverSound() {
        return {
            frequency: [330, 277, 220], // E4, C#4, A3
            duration: 0.8,
            type: 'sawtooth',
            volume: 0.5
        };
    }
    
    // 시작 사운드 생성 (상승하는 아르페지오)
    createStartSound() {
        return {
            frequency: [262, 330, 392, 523], // C4, E4, G4, C5
            duration: 0.6,
            type: 'sine',
            volume: 0.4
        };
    }
    
    // 사운드 재생
    playSound(soundName) {
        if (!this.enabled || !this.audioContext || !this.sounds[soundName]) {
            return;
        }
        
        // 오디오 컨텍스트가 정지된 경우 재개
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const sound = this.sounds[soundName];
        
        if (Array.isArray(sound.frequency)) {
            // 여러 주파수가 있는 경우 (멜로디)
            this.playMelody(sound);
        } else {
            // 단일 주파수
            this.playTone(sound);
        }
    }
    
    // 단일 톤 재생
    playTone(sound) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
        
        // 볼륨 설정 (페이드 아웃 효과)
        const startVolume = sound.volume * this.volume;
        gainNode.gain.setValueAtTime(startVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }
    
    // 멜로디 재생
    playMelody(sound) {
        const noteLength = sound.duration / sound.frequency.length;
        
        sound.frequency.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = sound.type;
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                const startVolume = sound.volume * this.volume;
                gainNode.gain.setValueAtTime(startVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + noteLength);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + noteLength);
            }, index * noteLength * 1000);
        });
    }
    
    // 사운드 활성화/비활성화
    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    // 볼륨 설정
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    // 사운드 상태 반환
    isEnabled() {
        return this.enabled;
    }
}

// 전역 사운드 매니저 인스턴스
let soundManager = null;

// 사운드 매니저 초기화
function initSoundManager() {
    if (!soundManager) {
        soundManager = new SoundManager();
    }
    return soundManager;
}

// 사운드 재생 헬퍼 함수들
function playJumpSound() {
    if (soundManager) soundManager.playSound('jump');
}

function playScoreSound() {
    if (soundManager) soundManager.playSound('score');
}

function playGameOverSound() {
    if (soundManager) soundManager.playSound('gameOver');
}

function playStartSound() {
    if (soundManager) soundManager.playSound('start');
}

