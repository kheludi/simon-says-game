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