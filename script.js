(function() {
    "use strict";

    // ----- DOM refs -----
    const greenBtn = document.getElementById('green');
    const redBtn = document.getElementById('red');
    const yellowBtn = document.getElementById('yellow');
    const blueBtn = document.getElementById('blue');
    const levelDisplay = document.getElementById('levelDisplay');
    const statusMsg = document.getElementById('statusMsg');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Color mapping
    const colorMap = {
        green: greenBtn,
        red: redBtn,
        yellow: yellowBtn,
        blue: blueBtn
    };
    const colorOrder = ['green', 'red', 'yellow', 'blue'];

    // ----- Sound system -----
    // Create audio context (for web audio API)
    let audioCtx = null;
    
    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    // Generate simple tones for each color
    function playSound(color, duration = 300) {
        try {
            const ctx = getAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            // Different frequencies for each color (like Simon Says original)
            const frequencies = {
                green: 523.25,   // C5
                red: 659.25,     // E5
                yellow: 783.99,  // G5
                blue: 1046.50    // C6
            };
            
            oscillator.frequency.value = frequencies[color] || 440;
            oscillator.type = 'sine';
            
            // Volume envelope (fade out for clean sound)
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration / 1000);
        } catch (error) {
            // Silently fail if audio is not supported
            console.log('Audio not supported or not initialized');
        }
    }

    // Alternative: Use oscillator with more "retro" feel
    function playRetroSound(color, duration = 200) {
        try {
            const ctx = getAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            const frequencies = {
                green: 500,
                red: 600,
                yellow: 700,
                blue: 800
            };
            
            oscillator.frequency.value = frequencies[color] || 440;
            oscillator.type = 'square'; // More retro sound
            
            gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration / 1000);
        } catch (error) {
            // Silently fail
        }
    }

    // Use this for a more modern/clean sound
    function playModernSound(color, duration = 250) {
        try {
            const ctx = getAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            // Different notes (C, E, G, C)
            const frequencies = {
                green: 523.25,   // C5
                red: 659.25,     // E5
                yellow: 783.99,  // G5
                blue: 1046.50    // C6
            };
            
            oscillator.frequency.value = frequencies[color] || 440;
            oscillator.type = 'sine';
            
            // Softer volume with fade
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration / 1000);
        } catch (error) {
            // Silently fail
        }
    }

    // I can choose the sound style I want (uncomment one):
    const playColorSound = playModernSound; // Modern/clean
    // const playColorSound = playRetroSound; // Retro/square wave
    // const playColorSound = playSound; // Simple sine

    // ----- Game state -----
    let sequence = [];
    let playerIndex = 0;
    let isPlaying = false;
    let isPlayerTurn = false;
    let gameOver = false;
    let level = 0;
    let timeoutId = null;
    let lockButtons = false;

    // ----- Helper functions -----
    function clearTimeouts() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    function fullReset() {
        clearTimeouts();
        sequence = [];
        playerIndex = 0;
        isPlaying = false;
        isPlayerTurn = false;
        gameOver = false;
        lockButtons = false;
        level = 0;
        updateLevelDisplay();
        setStatus('🔄 Reset · Press Start');
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('lit'));
        startBtn.disabled = false;
    }

    function updateLevelDisplay() {
        levelDisplay.textContent = level;
    }

    function setStatus(msg) {
        statusMsg.textContent = msg;
    }

    function lightButton(color, duration = 400) {
        return new Promise((resolve) => {
            const btn = colorMap[color];
            if (!btn) return resolve();
            
            // Play sound when lighting up
            playColorSound(color, duration);
            
            btn.classList.add('lit');
            setTimeout(() => {
                btn.classList.remove('lit');
                resolve();
            }, duration);
        });
    }

    function flashError() {
        const btns = document.querySelectorAll('.color-btn');
        btns.forEach(b => b.classList.add('lit'));
        
        // Play error sound (low buzz)
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 200;
            osc.type = 'sawtooth';
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } catch(e) {}
        
        setTimeout(() => {
            btns.forEach(b => b.classList.remove('lit'));
        }, 300);
    }

    // ----- Show sequence (computer turn) -----
    async function playSequence() {
        if (gameOver) return;
        isPlaying = true;
        isPlayerTurn = false;
        lockButtons = true;
        startBtn.disabled = true;
        setStatus(`👀 Watch sequence...`);

        for (let i = 0; i < sequence.length; i++) {
            if (gameOver) break;
            const color = sequence[i];
            await lightButton(color, 450);
            await new Promise(r => setTimeout(r, 180));
        }

        if (!gameOver) {
            isPlaying = false;
            isPlayerTurn = true;
            lockButtons = false;
            setStatus(`🎵 Your turn · Repeat`);
        }
        startBtn.disabled = true;
    }

    // ----- Add new step -----
    function addStep() {
        const randomColor = colorOrder[Math.floor(Math.random() * colorOrder.length)];
        sequence.push(randomColor);
        level = sequence.length;
        updateLevelDisplay();
        return randomColor;
    }

    // ----- Start new round -----
    function startNewRound() {
        clearTimeouts();
        if (gameOver || sequence.length === 0) {
            fullReset();
            addStep();
            level = 1;
            updateLevelDisplay();
        } else {
            addStep();
        }

        gameOver = false;
        playerIndex = 0;
        isPlayerTurn = false;
        isPlaying = false;
        lockButtons = false;
        setStatus(`👀 Watch sequence...`);
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('lit'));
        playSequence();
    }

    // ----- Handle player click -----
    function handlePlayerClick(color) {
        if (!isPlayerTurn || gameOver || lockButtons || isPlaying) return;

        // Play sound when player clicks
        playColorSound(color, 200);

        const expectedColor = sequence[playerIndex];

        if (color === expectedColor) {
            lightButton(color, 200);
            playerIndex++;

            if (playerIndex === sequence.length) {
                isPlayerTurn = false;
                setStatus(`✅ Correct! +1 level`);
                clearTimeouts();
                timeoutId = setTimeout(() => {
                    if (!gameOver) {
                        addStep();
                        playerIndex = 0;
                        setStatus(`👀 Watch next...`);
                        playSequence();
                    }
                }, 550);
            } else {
                setStatus(`✔️ ${playerIndex}/${sequence.length} · Keep going`);
            }
        } else {
            gameOver = true;
            isPlayerTurn = false;
            lockButtons = true;
            flashError();
            setStatus(`💥 Game Over · Press Start`);
            startBtn.disabled = false;
            clearTimeouts();
        }
    }

    // ----- Reset handler -----
    function handleReset() {
        clearTimeouts();
        fullReset();
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('lit'));
        startBtn.disabled = false;
        sequence = [];
        level = 0;
        updateLevelDisplay();
        setStatus('⟲ Reset · Press Start');
        gameOver = false;
        isPlayerTurn = false;
        isPlaying = false;
        lockButtons = false;
    }

    // ----- Start handler -----
    function handleStart() {
        if (gameOver || sequence.length === 0) {
            fullReset();
            addStep();
            level = 1;
            updateLevelDisplay();
            startBtn.disabled = true;
            gameOver = false;
            playerIndex = 0;
            setStatus(`👀 Watch sequence...`);
            playSequence();
        } else {
            handleReset();
            fullReset();
            addStep();
            level = 1;
            updateLevelDisplay();
            startBtn.disabled = true;
            gameOver = false;
            playerIndex = 0;
            setStatus(`👀 Watch sequence...`);
            playSequence();
        }
    }

    // ----- Event binding -----
    function init() {
        greenBtn.addEventListener('click', () => handlePlayerClick('green'));
        redBtn.addEventListener('click', () => handlePlayerClick('red'));
        yellowBtn.addEventListener('click', () => handlePlayerClick('yellow'));
        blueBtn.addEventListener('click', () => handlePlayerClick('blue'));

        startBtn.addEventListener('click', handleStart);
        resetBtn.addEventListener('click', handleReset);

        fullReset();
        setStatus('▶ Press Start');
        startBtn.disabled = false;
    }

    // Boot
    init();
})();