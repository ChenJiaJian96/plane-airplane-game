// 游戏状态对象
const gameState = {
    score: 0,
    lives: 3,
    level: 1,
    isGameOver: false,
    isPaused: false
};

// 游戏画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏对象
let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    speed: 5
};

let enemies = [];
let bullets = [];
let keys = {};
let lastShotTime = 0;
let enemySpawnTimer = 0;
let gameLoopId;

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 重新开始按钮事件
document.getElementById('restartBtn').addEventListener('click', restartGame);

// 更新UI显示
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('finalScore').textContent = gameState.score;
}

// 绘制玩家飞机
function drawPlayer() {
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    // 绘制三角形飞机
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // 添加发光效果
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
}

// 绘制敌机
function drawEnemies() {
    ctx.fillStyle = '#ff4444';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // 添加发光效果
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 8;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.shadowBlur = 0;
    });
}

// 绘制子弹
function drawBullets() {
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加发光效果
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

// 更新玩家位置
function updatePlayer() {
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }
    if (keys['ArrowUp'] || keys['KeyW']) {
        player.y = Math.max(40, player.y - player.speed);
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }
    
    // 射击
    if (keys['Space']) {
        shoot();
    }
}

// 射击功能
function shoot() {
    const currentTime = Date.now();
    if (currentTime - lastShotTime > 200) { // 射击间隔200ms
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 8
        });
        lastShotTime = currentTime;
    }
}

// 生成敌机
function spawnEnemy() {
    enemySpawnTimer++;
    if (enemySpawnTimer > 60) { // 每60帧生成一个敌机
        enemies.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 2 + Math.random() * 3
        });
        enemySpawnTimer = 0;
    }
}

// 更新敌机位置
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        
        // 移除超出屏幕的敌机
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
}

// 更新子弹位置
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        
        // 移除超出屏幕的子弹
        if (bullet.y < -bullet.height) {
            bullets.splice(index, 1);
        }
    });
}

// 碰撞检测
function checkCollisions() {
    // 检测子弹与敌机碰撞
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                // 移除子弹和敌机
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                
                // 增加分数
                gameState.score += 10;
                updateUI();
            }
        });
    });
    
    // 检测玩家与敌机碰撞
    enemies.forEach((enemy, enemyIndex) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            // 移除敌机
            enemies.splice(enemyIndex, 1);
            
            // 减少生命值
            gameState.lives--;
            updateUI();
            
            // 检查游戏是否结束
            if (gameState.lives <= 0) {
                gameOver();
            }
        }
    });
}

// 游戏结束
function gameOver() {
    gameState.isGameOver = true;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    cancelAnimationFrame(gameLoopId);
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    
    // 重置游戏对象
    player.x = canvas.width / 2 - 20;
    player.y = canvas.height - 60;
    enemies = [];
    bullets = [];
    keys = {};
    lastShotTime = 0;
    enemySpawnTimer = 0;
    
    // 隐藏游戏结束界面
    document.getElementById('gameOverScreen').classList.add('hidden');
    
    // 更新UI
    updateUI();
    
    // 重新开始游戏循环
    gameLoop();
}

// 游戏主循环
function gameLoop() {
    if (gameState.isGameOver) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 更新游戏对象
    updatePlayer();
    spawnEnemy();
    updateEnemies();
    updateBullets();
    checkCollisions();
    
    // 绘制游戏对象
    drawPlayer();
    drawEnemies();
    drawBullets();
    
    // 继续游戏循环
    gameLoopId = requestAnimationFrame(gameLoop);
}

// 初始化游戏
function init() {
    updateUI();
    gameLoop();
}

// 页面加载完成后启动游戏
window.addEventListener('load', init);