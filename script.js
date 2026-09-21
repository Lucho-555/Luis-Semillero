const canvas = document.getElementbyId ('gameCanvas')
const ctx = canvas.getContext ('2d')
const scoreSpan = document.getElementbyId('scoreDisplay')

const CW = 400, CH = 500; 
canvas.width = CW
canvas.height = CH

//ESTADO DEL JUEGO//
let player = {x: 180, y: 450, w: 30, h: 18}
let enemies = []
let bullets = []
let score = 0
let gameOver = false
let winFlag = false

let leftpressed = false
let rightpressed = false
let moveX = 0 

const ENEMY_ROWS = 4;
const ENEMY_COLS = 6
const ENEMY_SPACING = 12
const ENEMY_W = 26
const ENEMY_H = 20
let enemyDirection = 1
let enemySpeed = 0.8
let enemyMoveCounter = 0
const ENEMY_MOVE_FRAMES = 12
let shootCooldown = 0
const SHOOT_DELAY =14

// inicialización de enemigos 
function initEnemies() {
    enemies = []
const startX = 30
const startY =   40
for (let row = 0; row < ENEMY_ROWS; row++) {
    for (let col = 0; col < ENEMY_COLS; col++) {
       enemies. push({
        x: startX + col * (ENEMY_W + ENEMY_SPACING),
        y:startY + row * (ENEMY_W + ENEMY_SPACING),
        w: ENEMY_W,
        h:ENEMY_H,
        alive: true, 
        color : row === 0 ? '#473737' : (row === 1? ' #2B44BA' : '#425E66')
       })
        
    }
} 
enemyDirection= 1
enemySpeed=0.8
enemyMoveCounter=0
}

//reiniciar
function resetGame() {
    player.x =180
    bullets =[]
    score =0
    gameOver = false
    winFlag = false
    leftpressed = false
    rightpressed =false
    moveX = 0
    shootCooldown = 0
    initEnemies ()
    updateScore()
}

// actualizar puntos 
function updateScore() {
    scoreSpan.textContent = score
}

//disparar
function shootBullet() {
    if (gameOver || winFlag) return 
    bullets.push({
        x:player.x + player.w/2-3, 
        y:player.y-8, 
        w:6, 
        h:14,
        speed:5
    })
        
    }

    //colisiones
    function rectCollide(r1, r2) {
       return! (r2.x> r1.x+r1.w || r2.x + r2.w < r1.x ||
        r2.y > r1.y + r1h || r2.y +r2-h < r1.y);
    }
//funciones del teclado
function handleKeyDown(e) {}

function handleKeyUp(e) {}

//funciones para el tactil
function handleTouchStart() {
    
}

    // EVENTOS 
    window.addEventListener('keydown', handleKeyDown)
    Window.addEventListener('keyup', hamdleKeyUp)
    canvas.addEventListener('touchstart', handleTouchStart, {passive:false})
    canvas.addEventListener('touchmove', handleTouchMove, {passive:false})
    canvas.addEventListener('touchend', handleTouchEnd, {passive:false})
    canvas.addEventListener('contextmenu', (e) =>e.preventDefault() )
document.getElementById('resetBtn').addEventListener('clic', resetGame)


    //inicio del juego alli llmamos las funciones que necesitamos 
    initEnemies()
    updateScore()