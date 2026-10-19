// ---- CONFIGURACIÓN RETRO ----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('scoreDisplay');

const CW = 400, CH = 500;
canvas.width = CW; canvas.height = CH;
// ---- FONDOS DE LOS NIVELES ----
const fondos = [];

for (let i = 1; i <= 5; i++) {
    const imagen = new Image();
    imagen.src = `images/nivel${i}.jpg`;
    fondos.push(imagen)
}
fondos[0].onload = () => console.log("¡Fondo 1 cargado!");
fondos[0].onerror = () => console.error("No se pudo cargar images/nivel1.jpg");


// ---- ESTADO DEL JUEGO ----
let player = { x: 180, y: 450, w: 30, h: 16 };
let enemies = [];
let bullets = [];
let enemyBullets = [];
let enemyShootCounter = 0;
const ENEMY_SHOOT_DELAY = 65;
let score = 0;
let gameOver = false;
let winFlag = false;
let level = 1;
let levelUpFrames = 0;

// ---- JEFE DEL NIVEL 5 ----
let boss = null;
let bossBullets = [];
let bossDefeated = false;
let bossShootCounter = 0;
const BOSS_SHOOT_DELAY = 45;

let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;
let moveX = 0;
const MAX_LEVEL = 5;
const ENEMY_ROWS = 4;
const ENEMY_COLS = 6;
const ENEMY_W = 26;
const ENEMY_H = 20;
const ENEMY_SPACING = 12;
let enemyDirection = 1;
let enemySpeed = 0.8;
let enemyMoveCounter = 0;
const ENEMY_MOVE_FRAMES = 3;

let shootCooldown = 0;
const SHOOT_DELAY = 14;

// ---- INICIALIZAR ENEMIGOS ----
function initEnemies() {
    enemies = [];
    const startX = 30;
    const startY = 40;
    const filasActuales = ENEMY_ROWS + Math.floor((level - 1) / 2);
for (let row = 0; row < filasActuales; row++) {
    for (let col = 0; col < ENEMY_COLS; col++) {
            enemies.push({
                x: startX + col * (ENEMY_W + ENEMY_SPACING),
                y: startY + row * (ENEMY_H + ENEMY_SPACING),
                w: ENEMY_W,
                h: ENEMY_H,
                alive: true,
                color: row === 0 ? '#f2b84b' : (row === 1 ? '#d96c4a' : '#6bb0d9')
            });
        }
    }
    enemyDirection = 1;
    enemySpeed = Math.min(3+ (level - 1) * 0.90, 5);
    enemyMoveCounter = 0;
}

// ---- REINICIAR ----
function resetGame() {
    player.x = 180;
    player.y = 450;

    bullets = [];
    enemyBullets = [];
    enemyShootCounter = 0;

    boss = null;
    bossBullets = [];
    bossDefeated = false;
    bossShootCounter = 0;
    score = 0;
     level = 1;
    levelUpFrames = 0;
    gameOver = false;
    winFlag = false;
    leftPressed = false;
    rightPressed = false;
    moveX = 0;
    shootCooldown = 0;
    initEnemies();
    updateScore();
    upPressed = false;
downPressed = false;
}

// ---- DISPARAR ----
function shootBullet() {
    if (gameOver || winFlag) return;

    bullets.push({
        x: player.x + player.w / 2 - 3,
        y: player.y - 8,
        w: 6,
        h: 14,
        speed: 5
    });
}

// ---- ACTUALIZAR PUNTUACIÓN ----
function updateScore() {
    scoreSpan.textContent = score;
}


// ---- COLISIONES ----
function rectCollide(r1, r2) {
    return !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x ||
        r2.y > r1.y + r1.h || r2.y + r2.h < r1.y);
}

// ---- LÓGICA DEL JUEGO ----
function update() {
    if (gameOver || winFlag) return;
    if (levelUpFrames > 0) {
    levelUpFrames--;
}


    // Movimiento del jugador
    const SPEED = 5;

if (moveX !== 0) {
    player.x += moveX * SPEED;
}

if (upPressed) {
    player.y -= SPEED;
}

if (downPressed) {
    player.y += SPEED;
}

// Límites del escenario
if (player.x < 0) player.x = 0;
if (player.x + player.w > CW) player.x = CW - player.w;
if (player.y < 0) player.y = 0;
if (player.y + player.h > CH) player.y = CH - player.h;

    // Disparo automático
    shootCooldown--;
    if (shootCooldown <= 0) {
        shootBullet();
        shootCooldown = SHOOT_DELAY;
    }

    // Mover balas
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y -= b.speed;
        if (b.y + b.h < 0) {
            bullets.splice(i, 1);
        }
    }

     // ---- COMPROBAR ENEMIGOS RESTANTES ----
    let anyAlive = enemies.some(e => e.alive);

    // Pasar al siguiente nivel
    if (!anyAlive && level < MAX_LEVEL) {
        bullets = [];
        enemyBullets = [];

        level++;
        levelUpFrames = 90;

        initEnemies();
        return;
    }

    // Crear al jefe al terminar los enemigos normales del nivel 5
    if (
        !anyAlive &&
        level === MAX_LEVEL &&
        boss === null &&
        !bossDefeated
    ) {
        bullets = [];
        enemyBullets = [];
        bossBullets = [];

        boss = {
            x: 130,
            y: 50,
            w: 120,
            h: 55,
            health: 100,
            maxHealth: 100,
            vx: 2.4,
            vy: 1.5
        };

        bossShootCounter = 0;
        levelUpFrames = 0;
        return;
    }

// ---- DISPAROS DE ENEMIGOS NORMALES ----
enemyShootCounter++;

if (enemyShootCounter >= ENEMY_SHOOT_DELAY) {
    enemyShootCounter = 0;

    const vivos = enemies.filter(e => e.alive);

    if (vivos.length > 0) {
        const atacante = vivos[
            Math.floor(Math.random() * vivos.length)
        ];

        enemyBullets.push({
            x: atacante.x + atacante.w / 2 - 3,
            y: atacante.y + atacante.h,
            w: 6,
            h: 12,
            speed: 3.5
        });
    }
}

// ---- LÓGICA DEL JEFE FINAL ----
if (boss !== null) {
    // Movimiento horizontal
    boss.x += boss.vx;

    if (boss.x <= 0 || boss.x + boss.w >= CW) {
        boss.vx *= -1;
        boss.x = Math.max(0, Math.min(CW - boss.w, boss.x));
    }

    // Movimiento vertical
    boss.y += boss.vy;

    if (boss.y <= 20 || boss.y + boss.h >= 210) {
        boss.vy *= -1;
        boss.y = Math.max(20, Math.min(210 - boss.h, boss.y));
    }

    // Disparar hacia la nave
    bossShootCounter++;

    if (bossShootCounter >= BOSS_SHOOT_DELAY) {
        bossShootCounter = 0;

        const dx = player.x + player.w / 2 - (boss.x + boss.w / 2);
        const dy = player.y - (boss.y + boss.h);
        const distancia = Math.hypot(dx, dy) || 1;

        bossBullets.push({
            x: boss.x + boss.w / 2 - 4,
            y: boss.y + boss.h,
            w: 8,
            h: 12,
            vx: (dx / distancia) * 3,
            vy: (dy / distancia) * 3,
            speed: 3
        });
    }

    // Mover proyectiles del jefe
    for (let i = bossBullets.length - 1; i >= 0; i--) {
        const b = bossBullets[i];

        b.x += b.vx;
        b.y += b.vy;

        if (b.x < -20 || b.x > CW + 20 || b.y < -20 || b.y > CH + 20) {
            bossBullets.splice(i, 1);
            continue;
        }

        if (rectCollide(b, player)) {
            gameOver = true;
            return;
        }
    }

    // Los disparos del jugador dañan al jefe
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (rectCollide(bullets[i], boss)) {
            bullets.splice(i, 1);
            boss.health -= 10;

            if (boss.health <= 0) {
                boss.health = 0;
                boss = null;
                bossBullets = [];
                bossDefeated = true;
                winFlag = true;
                return;
            }
        }
    }
}
    
    // Mover y comprobar los proyectiles enemigos
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];

        b.y += b.speed;

        if (b.y > CH) {
            enemyBullets.splice(i, 1);
            continue;
        }

        if (rectCollide(b, player)) {
            gameOver = true;
            return;
        }
    }

    // Movimiento de enemigos
    enemyMoveCounter++;
    if (enemyMoveCounter >= ENEMY_MOVE_FRAMES) {
        enemyMoveCounter = 0;
        let minX = 999, maxX = -999;
        for (const e of enemies) {
            if (!e.alive) continue;
            if (e.x < minX) minX = e.x;
            if (e.x + e.w > maxX) maxX = e.x + e.w;
        }
        if (maxX > CW - 10) {
            enemyDirection = -1;
            for (const e of enemies) {
                if (e.alive) e.y += 6;
            }
        } else if (minX < 10) {
            enemyDirection = 1;
            for (const e of enemies) {
                if (e.alive) e.y += 6;
            }
        }
        for (const e of enemies) {
            if (e.alive) e.x += enemyDirection * enemySpeed;
        }
    }

    // Colisiones balas vs enemigos
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        let bulletUsed = false;
        for (const e of enemies) {
            if (!e.alive) continue;
            if (rectCollide(b, e)) {
                e.alive = false;
                bulletUsed = true;
                score += 10;
                updateScore();
                break;
            }
        }
        if (bulletUsed) {
            bullets.splice(i, 1);
        }
    }

    // Colisiones enemigos vs jugador
    for (const e of enemies) {
        if (!e.alive) continue;
        if (rectCollide(player, e)) {
            gameOver = true;
            return;
        }
        if (e.y + e.h > player.y + 10) {
            gameOver = true;
            return;
        }
    }
}

// ---- DIBUJAR ----
function drawBackground() {
    // Elegir el fondo según el nivel
    let topColor;
    let bottomColor;

    if (level === 1) {
        topColor = "#071a35";
        bottomColor = "#123d68";
    } else if (level === 2) {
        topColor = "#160b35";
        bottomColor = "#542878";
    } else if (level === 3) {
        topColor = "#020817";
        bottomColor = "#173b55";
    } else if (level === 4) {
        topColor = "#250909";
        bottomColor = "#76251e";
    } else {
        topColor = "#08030e";
        bottomColor = "#4b071c";
    }

    // Degradado del fondo
    const gradient = ctx.createLinearGradient(
        0, 0, 0, canvas.height
    );

    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Estrellas: posiciones estables para que no parpadeen
    for (let i = 0; i < 65; i++) {
        const x = (i * 73 + 19) % canvas.width;
        const y = (i * 137 + 31) % canvas.height;
        const size = i % 7 === 0 ? 2 : 1;

        ctx.fillStyle = i % 4 === 0
            ? "#9edcff"
            : "#ffffff";

        ctx.fillRect(x, y, size, size);
    }
// Cometas decorativos estáticos
    const comets = [
        { x: 70, y: 100, length: 24 },
        { x: 285, y: 180, length: 32 },
        { x: 150, y: 350, length: 20 }
    ];

    for (const comet of comets) {
        ctx.strokeStyle = "rgba(180, 225, 255, 0.65)";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(
            comet.x - comet.length,
            comet.y + comet.length * 0.6
        );
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.lineWidth = 1;

    // Planeta decorativo en el nivel 3
    if (level === 3) {
        const planet = ctx.createRadialGradient(
            canvas.width * 0.75,
            canvas.height * 0.30,
            4,
            canvas.width * 0.75,
            canvas.height * 0.30,
            48
        );

        planet.addColorStop(0, "#83e4ed");
        planet.addColorStop(0.7, "#287da5");
        planet.addColorStop(1, "#10284e");

        ctx.fillStyle = planet;
        ctx.beginPath();
        ctx.arc(
            canvas.width * 0.75,
            canvas.height * 0.30,
            48,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // Efectos especiales de los niveles 4 y 5
    if (level >= 4) {
        const glow = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height * 0.35,
            5,
            canvas.width / 2,
            canvas.height * 0.35,
            canvas.width * 0.7
        );

        if (level === 4) {
            // Nivel 4: espacio caliente y peligroso
            glow.addColorStop(0, "rgba(255, 100, 25, 0.30)");
            glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
            // Nivel 5: energía del jefe final
            glow.addColorStop(0, "rgba(255, 0, 65, 0.42)");
            glow.addColorStop(0.45, "rgba(130, 0, 60, 0.18)");
            glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        }

        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
//----Dibujar----
function draw() {
    ctx.clearRect(0, 0, CW, CH);

    // Dibujar el fondo generado con JavaScript
    drawBackground();

     // Jugador: nave espacial
    ctx.save();

    const cx = player.x + player.w / 2;

    // Cuerpo de la nave
    ctx.shadowColor = '#55cfff';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#8ecbff';

    ctx.beginPath();
    ctx.moveTo(cx, player.y - 5);
    ctx.lineTo(player.x + player.w, player.y + player.h - 4);
    ctx.lineTo(cx + 5, player.y + player.h - 8);
    ctx.lineTo(cx, player.y + player.h);
    ctx.lineTo(cx - 5, player.y + player.h - 8);
    ctx.lineTo(player.x, player.y + player.h - 4);
    ctx.closePath();
    ctx.fill();

    // Cabina
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#e8fbff';
    ctx.beginPath();
    ctx.ellipse(
        cx,
        player.y + player.h * 0.42,
        Math.max(3, player.w * 0.16),
        Math.max(5, player.h * 0.23),
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Motores
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#53aaff';
    ctx.fillRect(cx - 7, player.y + player.h - 2, 4, 7);
    ctx.fillRect(cx + 3, player.y + player.h - 2, 4, 7);

    // Llamas
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#fff1a6';
    ctx.fillRect(cx - 6, player.y + player.h + 3, 2, 4);
    ctx.fillRect(cx + 4, player.y + player.h + 3, 2, 4);

    ctx.restore();

    // Balas del jugador
    ctx.fillStyle = '#f2ff80';
    ctx.shadowColor = '#f0ff60';
    ctx.shadowBlur = 16;

    for (const b of bullets) {
        ctx.fillRect(b.x, b.y, b.w, b.h);
    }

    ctx.shadowBlur = 0;

    // ---- PROYECTILES ENEMIGOS ----
    ctx.save();
    ctx.fillStyle = '#ff4545';
    ctx.shadowColor = '#ff2020';
    ctx.shadowBlur = 10;

    for (const b of enemyBullets) {
        ctx.fillRect(b.x, b.y, b.w, b.h);
    }

    ctx.restore();

    // Enemigos
    for (const e of enemies) {
        if (!e.alive) continue;
        ctx.fillStyle = e.color;
        ctx.shadowColor = '#b0d0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(e.x, e.y, e.w, e.h, 6);
        ctx.fill();
        ctx.fillStyle = '#fcf9ea';
        ctx.shadowBlur = 4;
        ctx.fillRect(e.x + 4, e.y + 3, 6, 6);
        ctx.fillRect(e.x + e.w - 10, e.y + 3, 6, 6);
        ctx.fillStyle = '#121212';
        ctx.fillRect(e.x + 6, e.y + 5, 3, 3);
        ctx.fillRect(e.x + e.w - 8, e.y + 5, 3, 3);
    }

    ctx.shadowBlur = 0;

// ---- DIBUJAR JEFE FINAL ----
if (boss !== null) {
    ctx.save();

    // Cuerpo del jefe
    ctx.fillStyle = '#a80035';
    ctx.shadowColor = '#ff174f';
    ctx.shadowBlur = 22;
    ctx.fillRect(boss.x, boss.y, boss.w, boss.h);

    // Núcleo de energía
    ctx.fillStyle = '#ff315f';
    ctx.fillRect(
        boss.x + boss.w * 0.35,
        boss.y + 10,
        boss.w * 0.30,
        boss.h - 20
    );

    ctx.shadowBlur = 0;

    // Nombre
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('JEFE FINAL', CW / 2, boss.y - 10);

    // Fondo de la barra de vida
    const barX = 40;
    const barY = 25;
    const barW = 320;
    const barH = 12;

    ctx.fillStyle = '#3b1020';
    ctx.fillRect(barX, barY, barW, barH);

    // Vida restante
    ctx.fillStyle = boss.health <= 30 ? '#ff3333' : '#48ff83';
    ctx.fillRect(
        barX,
        barY,
        barW * (boss.health / boss.maxHealth),
        barH
    );

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Proyectiles del jefe
    ctx.fillStyle = '#ff3b75';
    ctx.shadowColor = '#ff174f';
    ctx.shadowBlur = 12;

    for (const b of bossBullets) {
        ctx.fillRect(b.x, b.y, b.w, b.h);
    }

    ctx.restore();
}

// Nivel actual
ctx.save();
ctx.font = 'bold 16px "Courier New", monospace';
ctx.textAlign = 'left';
ctx.textBaseline = 'top';
ctx.fillStyle = '#f5e56b';
ctx.fillText('NIVEL: ' + level, 12, 12);
ctx.restore();

// Aviso de cambio de nivel
if (levelUpFrames > 0) {
    ctx.save();
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f5e56b';
    ctx.fillText('¡NIVEL ' + level + '!', CW / 2, CH / 2 - 20);
    ctx.restore();
}

    // Mensajes
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (gameOver) {
        ctx.fillStyle = '#ffb0a0';
        ctx.shadowColor = '#ff4f4f';
        ctx.shadowBlur = 24;
        ctx.fillText('💀 GAME OVER', CW/2, CH/2 - 20);
        ctx.shadowBlur = 0;
    } else if (winFlag) {
        ctx.fillStyle = '#f5e56b';
        ctx.shadowColor = '#ffd966';
        ctx.shadowBlur = 30;
        ctx.fillText('✨ ¡VICTORIA! ✨', CW/2, CH/2 - 20);
        ctx.shadowBlur = 0;
    }

    ctx.font = '12px monospace';
    ctx.fillStyle = '#617e9e';
    ctx.fillText('←  →', CW-60, CH-16);
}

// Helper para rectángulos redondeados
CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (r > w/2) r = w/2;
    if (r > h/2) r = h/2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
};

// ---- LOOP PRINCIPAL ----
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ---- CONTROLES TECLADO ----
function handleKeyDown(e) {
    const key = e.key;
    if (key === 'ArrowLeft' || key === 'Left') {
        leftPressed = true;
        moveX = -1;
        e.preventDefault();
    } else if (key === 'ArrowRight' || key === 'Right') {
        rightPressed = true;
        moveX = 1;
        e.preventDefault();
    }
    if (key === 'ArrowUp' || key.toLowerCase() === 'w') {
    upPressed = true;
    e.preventDefault();
}

if (key === 'ArrowDown' || key.toLowerCase() === 's') {
    downPressed = true;
    e.preventDefault();
}
}

function handleKeyUp(e) {
    const key = e.key;
    if (key === 'ArrowLeft' || key === 'Left') {
        leftPressed = false;
        if (rightPressed) moveX = 1;
        else moveX = 0;
        e.preventDefault();
    } else if (key === 'ArrowRight' || key === 'Right') {
        rightPressed = false;
        if (leftPressed) moveX = -1;
        else moveX = 0;
        e.preventDefault();
    }
    if (key === 'ArrowUp' || key.toLowerCase() === 'w') {
    upPressed = false;
    e.preventDefault();
}

if (key === 'ArrowDown' || key.toLowerCase() === 's') {
    downPressed = false;
    e.preventDefault();
}
}

// ---- CONTROLES MÓVIL ----
function handleTouchStart(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const canvasX = (touch.clientX - rect.left) * (CW / rect.width);
    if (canvasX < player.x + player.w/2) {
        moveX = -1;
        leftPressed = true;
        rightPressed = false;
    } else {
        moveX = 1;
        rightPressed = true;
        leftPressed = false;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const canvasX = (touch.clientX - rect.left) * (CW / rect.width);
    if (canvasX < player.x + player.w/2) {
        moveX = -1;
        leftPressed = true;
        rightPressed = false;
    } else {
        moveX = 1;
        rightPressed = true;
        leftPressed = false;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    moveX = 0;
    leftPressed = false;
    rightPressed = false;
}

// ---- EVENTOS ----
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
document.getElementById('resetBtn').addEventListener('click', resetGame);

// ---- INICIO ----
initEnemies();
updateScore();
gameLoop();
