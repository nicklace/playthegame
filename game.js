// === Laetare Shooter Game (Mobile Optimized) ===
// Enhanced with hero selection, life system, mages, boss, and screens

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

let gameState = 'intro';
let selectedColor = 'cyan';

const HERO_COLORS = ['magenta', 'cyan', 'yellow', 'red'];
const ENEMY_COLORS = ['#4B0082', '#006400', '#FF69B4'];

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

class Hero {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 20;
    this.speed = 4;
    this.health = 5;
    this.projectiles = [];
  }
  move() {
    if (keys['ArrowUp']) this.y -= this.speed;
    if (keys['ArrowDown']) this.y += this.speed;
    if (keys['ArrowLeft']) this.x -= this.speed;
    if (keys['ArrowRight']) this.x += this.speed;
  }
  shoot() {
    this.projectiles.push(new Projectile(this.x, this.y, this.color));
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

class Projectile {
  constructor(x, y, color, size = 5) {
    this.x = x;
    this.y = y;
    this.radius = size;
    this.color = color;
    this.speed = 7;
  }
  update() {
    this.y -= this.speed;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.color = ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)];
    this.speed = randomRange(1, 2);
  }
  update() {
    this.y += this.speed;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

class MageTurret {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.fireRate = 100;
    this.timer = 0;
    this.projectiles = [];
  }
  update() {
    if (this.timer <= 0) {
      this.projectiles.push(new Projectile(this.x, this.y, this.color, 12));
      this.timer = this.fireRate;
    } else {
      this.timer--;
    }
    this.projectiles.forEach(p => p.update());
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    this.projectiles.forEach(p => p.draw());
  }
}

class Boss {
  constructor() {
    this.x = canvas.width / 2;
    this.y = 100;
    this.radius = 50;
    this.health = 50;
    this.color = '#800080';
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

let hero;
let enemies = [];
let turrets = [];
let boss;
let spawnTimer = 0;
let score = 0;

function startGame() {
  hero = new Hero(canvas.width / 2, canvas.height - 60, selectedColor);
  enemies = [];
  turrets = [new MageTurret(50, canvas.height / 2, 'cyan'), new MageTurret(canvas.width - 50, canvas.height / 2, 'magenta')];
  boss = new Boss();
  score = 0;
  gameState = 'playing';
}

function drawIntroScreen() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '24px sans-serif';
  ctx.fillText('Choisis ton héros !', 20, 40);

  HERO_COLORS.forEach((color, index) => {
    ctx.beginPath();
    ctx.arc(80 + index * 100, 100, 30, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  });
}

function drawGameOver() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '32px sans-serif';
  ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2);
  ctx.font = '20px sans-serif';
  ctx.fillText('Tap to restart', canvas.width / 2 - 60, canvas.height / 2 + 30);
}

function drawVictory() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'gold';
  ctx.font = '32px sans-serif';
  ctx.fillText('Victoire ! Le confetti d\'or est sauvé !', 50, canvas.height / 2);
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'intro') {
    drawIntroScreen();
    return requestAnimationFrame(updateGame);
  }

  if (gameState === 'gameover') {
    drawGameOver();
    return requestAnimationFrame(updateGame);
  }

  if (gameState === 'victory') {
    drawVictory();
    return requestAnimationFrame(updateGame);
  }

  hero.move();
  hero.draw();
  hero.projectiles.forEach(p => {
    p.update();
    p.draw();
  });

  turrets.forEach(t => {
    t.update();
    t.draw();
  });

  if (spawnTimer <= 0) {
    enemies.push(new Enemy(randomRange(0, canvas.width), -30));
    spawnTimer = 40;
  } else {
    spawnTimer--;
  }

  enemies.forEach((enemy, eIdx) => {
    enemy.update();
    enemy.draw();

    hero.projectiles.forEach((p, pIdx) => {
      const dx = enemy.x - p.x;
      const dy = enemy.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < enemy.radius + p.radius) {
        enemies.splice(eIdx, 1);
        hero.projectiles.splice(pIdx, 1);
        score++;
        if (score >= 20) gameState = 'victory';
      }
    });

    turrets.forEach(turret => {
      turret.projectiles.forEach((tp, tpIdx) => {
        const dx = enemy.x - tp.x;
        const dy = enemy.y - tp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < enemy.radius + tp.radius) {
          enemies.splice(eIdx, 1);
          turret.projectiles.splice(tpIdx, 1);
        }
      });
    });
  });

  boss.draw();

  ctx.fillStyle = 'white';
  ctx.fillText('Vie: ' + hero.health, 10, 20);
  ctx.fillText('Score: ' + score, 10, 40);

  requestAnimationFrame(updateGame);
}

canvas.addEventListener('click', e => {
  if (gameState === 'intro') {
    HERO_COLORS.forEach((color, index) => {
      const cx = 80 + index * 100;
      const cy = 100;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        selectedColor = color;
        startGame();
      }
    });
  } else if (gameState === 'playing') {
    hero.shoot();
  } else if (gameState === 'gameover' || gameState === 'victory') {
    gameState = 'intro';
  }
});

canvas.addEventListener('touchstart', e => {
  if (gameState === 'playing') hero.shoot();
});

updateGame();
