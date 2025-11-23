const WIDTH = 1200;
const HEIGHT = 600;

const GRAVITY = 0.6;
const MOVE_SPEED = 3.5;
const JUMP_FORCE = -11;

let bgm;
let jumpSound;

// ===== 新增：倒计时 & 两关剩余时间 =====
let timer = 120;            // 当前关卡倒计时（秒）
let level1Remaining = 0;    // 过完 Level 1 时剩余时间
let level2Remaining = 0;    // 过完 Level 2 时剩余时间

let currentLevel = 1;
let gameState = "start";   // start / play / gameover / win
let players = [];
let platforms = [];
let slopes = [];
let hazards = [];
let gems = [];
let doors = [];
let fireParticles = [];
let waterParticles = [];
let blowLines = [];
let seesaw;

// 全局变量
let movingPlatform;
let buttons = [];
let stairs = [];
let road = [];
let blowers = [];  // Level 2 风扇平台

// ====== 剧情文本 ======
let startStoryLines = [
  "Long ago, the Fire King and the Water Spirit guarded an ancient ruin.",
  "One night, the temple collapsed and the magic gems fell deep underground.",
  "To escape the ruin, they must collect gems and work together to reach the doors."
];

let winStoryLines = [
  "With every platform crossed and every trap avoided,",
  "the Fire King and Water Spirit finally escaped the ruins.",
  "Their journey ends here, but their legend has just begun."
];

let startStoryTimer = 0;
let winStoryTimer = 0;

/* =========================================================
                    PRELOAD（声音）
========================================================= */
function preload() {
  bgm = loadSound("music1.mp3");
  jumpSound = loadSound("jump.mp3");
}

/* =========================================================
                        SETUP
========================================================= */
function setup() {
  createCanvas(WIDTH, HEIGHT);

  userStartAudio();
  bgm.setVolume(0.5);

  gameState = "start";
  startStoryTimer = 0;
}

/* =========================================================
                    切换关卡（通用）
========================================================= */
function loadLevel(n) {
  currentLevel = n;

  if (n === 1) {
    initLevel();   // Level 1
  } else if (n === 2) {
    loadLevel2();  // Level 2
  }

  gameState = "play";
  timer = 120; // ⭐ 每次开始关卡重设 120 秒
}

/* =========================================================
                        LEVEL 1
========================================================= */
function initLevel() {
  players = [
    createPlayer("red", "#ff4b4b",
      { left: LEFT_ARROW, right: RIGHT_ARROW, jump: UP_ARROW },
      40, HEIGHT - 150),
    createPlayer("blue", "#4fa9ff",
      { left: 65, right: 68, jump: 87 },
      100, HEIGHT - 150)
  ];

  platforms = [
    { x: 0, y: HEIGHT - 80, w: WIDTH, h: 80 },

    // 最底部平台
    { x: 310, y: HEIGHT - 150, w: 45, h: 20 }, 
    { x: 430, y: HEIGHT - 150, w: 30, h: 20 },
    { x: 540, y: HEIGHT - 150, w: 55, h: 20 },
    { x: 650, y: HEIGHT - 150, w: 35, h: 20 },
    { x: 760, y: HEIGHT - 150, w: 45, h: 20 },
    { x: 870, y: HEIGHT - 150, w: 55, h: 20 },
    { x: 980, y: HEIGHT - 150, w: 30, h: 20 },
    { x: 1060, y: HEIGHT - 150, w: 35, h: 20 },
    { x: 1150, y: HEIGHT - 150, w: 50, h: 20 },

    // 第二层
    { x: 950, y: HEIGHT - 240, w: 160, h: 20 },
    { x: 640, y: HEIGHT - 320, w: 200, h: 20 },
    { x: 330, y: HEIGHT - 280, w: 160, h: 20 },
    { x: 180, y: HEIGHT - 320, w: 100, h: 20 },

    // 第三层
    { x: 80, y: HEIGHT - 370, w: 20, h: 70 },
    { x: 130, y: HEIGHT - 420, w: 250, h: 20 },
    { x: 750, y: HEIGHT - 440, w: 50, h: 20 },
    { x: 850, y: HEIGHT - 440, w: 50, h: 20 },
    { x: 950, y: HEIGHT - 440, w: 50, h: 20 },
    { x: 1070, y: HEIGHT - 465, w: 130, h: 20 }
  ];

  slopes = [
    { x1: 840, y1: HEIGHT - 320, x2: 950, y2: HEIGHT - 240, thickness: 20 },
    { x1: 490, y1: HEIGHT - 280, x2: 640, y2: HEIGHT - 320, thickness: 20 },
    { x1: 280, y1: HEIGHT - 320, x2: 330, y2: HEIGHT - 280, thickness: 20 },
    { x1: 80,  y1: HEIGHT - 200, x2: 180, y2: HEIGHT - 320, thickness: 20 },
    { x1: 80,  y1: HEIGHT - 370, x2: 130, y2: HEIGHT - 420, thickness: 20 }
  ];

  buttons = [
    { x: 400, y: HEIGHT - 290, w: 30, h: 10, pressed: false },
    { x: 200, y: HEIGHT - 430, w: 30, h: 10, pressed: false }
  ];

  movingPlatform = {
    x: 0,
    y: HEIGHT - 200,
    w: 80,
    h: 20,
    baseY: HEIGHT - 200,
    targetY: HEIGHT - 200,
    speed: 2
  };

  hazards = [
    { x: 250, y: HEIGHT - 95, w: WIDTH, h: 30, color: "green" } // 绿水两人都死
  ];

  seesaw = {
    cx: 600,
    baseY: HEIGHT - 470,
    half: 100,
    thickness: 12,
    offset: 0,
    targetOffset: 0
  };

  doors = [
    { x: WIDTH - 110, y: HEIGHT - 520, w: 40, h: 55, color: "red" },
    { x: WIDTH - 60,  y: HEIGHT - 520, w: 40, h: 55, color: "blue" }
  ];

  gems = [
    gem(500, HEIGHT - 200, "red"),
    gem(400, HEIGHT - 200, "blue"),
    gem(850, HEIGHT - 200, "red"),
    gem(650, HEIGHT - 200, "blue"),
    gem(700, HEIGHT - 210, "red"),
    gem(150, HEIGHT - 320, "blue"),
    gem(350, HEIGHT - 330, "red"),
    gem(580, HEIGHT - 350, "blue"),
    gem(760, HEIGHT - 350, "red"),
    gem(120, HEIGHT - 370, "blue"),
    gem(260, HEIGHT - 400, "red"),
    gem(500, HEIGHT - 380, "blue")
  ];

  // Level1 不用
  road = [];
  blowers = [];
}

/* =========================================================
                        LEVEL 2
========================================================= */
function loadLevel2() {
  currentLevel = 2;
  timer = 120;
  gameState = "play";

  players = [
    createPlayer("red", "#ff4b4b",
      { left: LEFT_ARROW, right: RIGHT_ARROW, jump: UP_ARROW },
      300, HEIGHT - 100),
    createPlayer("blue", "#4fa9ff",
      { left: 65, right: 68, jump: 87 },
      900, HEIGHT - 100)
  ];

  platforms = [
    { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40 },
    { x: 500, y: HEIGHT - 150, w: 100, h:110},

    { x: 0, y: HEIGHT - 200, w: 400, h: 20},
    { x: 700, y: HEIGHT - 200, w: 500, h: 20},
    { x: 0, y: HEIGHT - 250, w: 100, h: 50},
    { x: 1100, y: HEIGHT - 250, w: 100, h: 50},

    { x: 170, y: HEIGHT - 300, w: 850, h: 20},

    { x: 0, y: HEIGHT - 360, w: 100, h: 20},
    { x: 1100, y: HEIGHT - 360, w: 100, h: 20},

    { x: 350, y: HEIGHT - 550, w: 20, h: 250},
    { x: 850, y: HEIGHT - 550, w: 20, h: 250},

    { x: 700, y: HEIGHT - 550, w: 400, h: 20},
    { x: 100, y: HEIGHT - 550, w: 400, h: 20},

    { x: 580, y: HEIGHT - 500, w: 40, h: 20}
  ];

  road = [
    { x1: 500, y1: 600, x2: 500, y2: 450, x3: 350, y3: 600 },
    { x1: 750, y1: 600, x2: 600, y2: 450, x3: 600, y3: 600 }
  ];

  slopes = [
    // 底部倒 V
    { x1: 350, y1: 600, x2: 500, y2: 450, thickness: 20 },
    { x1: 600, y1: 450, x2: 750, y2: 600, thickness: 20 },

    // 上面小倒 V
    { x1: 500, y1: 200, x2: 580, y2: 100, thickness: 20 },
    { x1: 620, y1: 100, x2: 700, y2: 200, thickness: 20 }
  ];

  blowers = [
    { x: 0,    y: HEIGHT - 360, w: 100, h: 20, dir: 1 },   // 向右吹
    { x: 1100, y: HEIGHT - 360, w: 100, h: 20, dir: -1 }   // 向左吹
  ];

  hazards = [
    { x: 140, y: HEIGHT - 60, w: 200, h: 20, color: "red" },
    { x: 800, y: HEIGHT - 60, w: 200, h: 20, color: "blue" },
    { x: 800, y: HEIGHT - 220, w: 200, h: 20, color: "red" },
    { x: 140, y: HEIGHT - 220, w: 200, h: 20, color: "blue" },
    { x: 380, y: HEIGHT - 320, w: 80, h: 20, color: "red" },
    { x: 760, y: HEIGHT - 320, w: 80, h: 20, color: "blue" }
  ];

  doors = [
    { x: 400, y: HEIGHT - 355, w: 40, h: 55, color: "red" },
    { x: 780, y: HEIGHT - 355, w: 40, h: 55, color: "blue" }
  ];

  gems = [
    gem(700, HEIGHT - 455, "red"),
    gem(500, HEIGHT - 455, "blue"),

    gem(200, HEIGHT - 380, "blue"),
    gem(980, HEIGHT - 380, "red"),

    gem(220, HEIGHT - 120, "red"),
    gem(950, HEIGHT - 120, "blue")
  ];

  // 关掉 Level1 的 seesaw / button / yellow platform
  seesaw = {
    cx: 0,
    baseY: 0,
    half: 0,
    thickness: 0,
    offset: 0,
    targetOffset: 0
  };

  buttons = [];
  movingPlatform = { x: 0, y: -9999, w: 0, h: 0, baseY: 0, targetY: 0, speed: 0 };
}

/* =========================================================
                粒子效果（火 & 水 & 风线）
========================================================= */
function spawnFire(p) {
  if (p.name !== "red") return;
  if (p.onGround) return;

  fireParticles.push({
    x: p.x + p.w / 2 + random(-6, 6),
    y: p.y + p.h,
    vx: random(-0.5, 0.5),
    vy: random(-1, -2),
    a: 255
  });
}

function spawnWater(p) {
  if (p.name !== "blue") return;
  if (p.onGround) return;

  waterParticles.push({
    x: p.x + p.w / 2 + random(-4, 4),
    y: p.y + p.h,
    vx: random(-0.3, 0.3),
    vy: random(-0.5, -1.2),
    a: 255
  });
}

function updateFireParticles() {
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    let f = fireParticles[i];
    f.x += f.vx;
    f.y += f.vy;
    f.a -= 4;

    fill(255, 120, 0, f.a);
    noStroke();
    ellipse(f.x, f.y, 10);

    if (f.a <= 0) fireParticles.splice(i, 1);
  }
}

function updateWaterParticles() {
  for (let i = waterParticles.length - 1; i >= 0; i--) {
    let w = waterParticles[i];
    w.x += w.vx;
    w.y += w.vy;
    w.a -= 3;

    fill(120, 180, 255, w.a);
    noStroke();
    ellipse(w.x, w.y, 8);

    if (w.a <= 0) waterParticles.splice(i, 1);
  }
}

// 旧版独立的风线更新函数（现在主要逻辑在 drawBlowers 里）
function updateBlowLines() {
  for (let i = blowLines.length - 1; i >= 0; i--) {
    let b = blowLines[i];
    b.y -= 2;
    b.a -= 4;

    stroke(255, 255, 200, b.a);
    line(b.x, b.y, b.x, b.y - 12);

    if (b.a <= 0) blowLines.splice(i, 1);
  }
}

/* =========================================================
                        通用对象
========================================================= */
function createPlayer(name, color, controls, x, y) {
  return {
    name,
    color,
    controls,
    x, y,
    w: 32, h: 44,
    vx: 0, vy: 0,
    onGround: false,
    gems: 0
  };
}

function gem(x, y, color) {
  return { x, y, r: 12, color, collected: false };
}

/* =========================================================
                        主循环
========================================================= */
function draw() {
  background(40, 32, 20);

  if (gameState === "start") {
    drawStart();
    return;
  }
  if (gameState === "gameover") {
    drawGameOver();
    return;
  }
  if (gameState === "win") {
    drawWin();
    return;
  }

  // 只剩下 play 状态：倒计时
  timer -= deltaTime / 1000;
  if (timer <= 0) {
    timer = 0;
    gameState = "gameover";  // 时间用完才 Game Over
    return;
  }

  drawBackground();
  updateSeesaw();
  handleInput();
  updatePlayers();

  updateButtons();
  updateMovingPlatform();

  collectGems();
  checkDoors();
  drawWorld();
  drawUI();
}

/* =========================================================
                      画面 / UI / Storyline
========================================================= */
function drawStart() {
  // 渐变背景
  textFont("VT323");
  noStroke();
  for (let y = 0; y < HEIGHT; y++) {
    let t = y / HEIGHT;
    let c = lerpColor(color(10, 8, 20), color(80, 50, 25), t);
    stroke(c);
    line(0, y, WIDTH, y);
  }

  // 更新剧情计时
  startStoryTimer += deltaTime;

  // 标题（发光）
  textAlign(CENTER, CENTER);
  textSize(52);
  let title = "ADVENTURE KING";

  fill(0, 0, 0, 120);
  text(title, WIDTH / 2 + 4, HEIGHT / 2 - 152);
  fill(255, 220, 150);
  text(title, WIDTH / 2, HEIGHT / 2 - 160);

  // 副标题
  textSize(30);
  fill(240, 220, 200);
  text("A Two-Player Puzzle Adventure", WIDTH / 2, HEIGHT / 2 - 120);

  // 剧情文字（逐行淡入）
  let baseY = HEIGHT / 2 - 40;
  textSize(24);
  for (let i = 0; i < startStoryLines.length; i++) {
    let appearTime = 800 * i;          // 每行延迟 0.8 秒
    let fadeTime = appearTime + 600;   // 0.6 秒淡入
    let a = 0;
    if (startStoryTimer > appearTime) {
      a = map(startStoryTimer, appearTime, fadeTime, 0, 255, true);
    }
    fill(255, 230, 210, a);
    text(startStoryLines[i], WIDTH / 2, baseY + i * 24);
  }

  // 操作提示
  let blink = map(sin(millis() / 500), -1, 1, 80, 255);
  textSize(18);
  fill(255, 255, 255, blink);
  text("Red: Arrow keys   Blue: WASD", WIDTH / 2, HEIGHT / 2 + 70);
  text("Press ENTER to start Level 1", WIDTH / 2, HEIGHT / 2 + 95);

  // 底部小字
  textSize(15);
  fill(220, 200, 180, 180);
  text("Tip: Cooperation is the key to escape the ruins.", WIDTH / 2, HEIGHT - 30);

  // 按 ENTER 开始 & 播放 BGM
  if (keyIsDown(ENTER)) {
    if (!bgm.isPlaying()) bgm.loop();
    startStoryTimer = 0;    // 重置，以防重进 start
    // 同时重置时间记录
    timer = 120;
    level1Remaining = 0;
    level2Remaining = 0;
    loadLevel(1);
  }
}

function drawGameOver() {
  background(20, 0, 0);
  fill(150, 0, 0);
  rect(0, HEIGHT / 2 - 80, WIDTH, 160);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("GAME OVER", WIDTH / 2, HEIGHT / 2 - 10);
  textSize(24);
  text("You ran out of time in the ruins.", WIDTH / 2, HEIGHT / 2 + 20);
  text("Press R to restart from Level 1", WIDTH / 2, HEIGHT / 2 + 50);
}

function drawWin() {
  // 胜利渐变背景
  textFont("VT323");

  for (let y = 0; y < HEIGHT; y++) {
    let t = y / HEIGHT;
    let c = lerpColor(color(10, 40, 20), color(120, 180, 120), t);
    stroke(c);
    line(0, y, WIDTH, y);
  }

  winStoryTimer += deltaTime;

  textAlign(CENTER, CENTER);

  // 主标题
  textSize(40);
  fill(0, 0, 0, 120);
  text("YOU WIN!", WIDTH / 2 + 3, HEIGHT / 2 - 103);
  fill(255, 255, 255);
  text("YOU WIN!", WIDTH / 2, HEIGHT / 2 - 110);

  // ★ 显示两关总剩余时间
  let totalRemaining = level1Remaining + level2Remaining;
  textSize(18);
  fill(240, 255, 240);
  text("Time Left (Level 1 + 2): " + totalRemaining.toFixed(2) + "s",
       WIDTH / 2, HEIGHT / 2 - 70);

  // 胜利剧情文字
  let baseY = HEIGHT / 2 - 20;
  textSize(24);
  for (let i = 0; i < winStoryLines.length; i++) {
    let appearTime = 700 * i;
    let fadeTime = appearTime + 600;
    let a = 0;
    if (winStoryTimer > appearTime) {
      a = map(winStoryTimer, appearTime, fadeTime, 0, 255, true);
    }
    fill(255, 250, 240, a);
    text(winStoryLines[i], WIDTH / 2, baseY + i * 22);
  }

  // 提示
  let blink = map(sin(millis() / 600), -1, 1, 80, 255);
  textSize(14);
  fill(255, 255, 255, blink);
  text("Press R to play again", WIDTH / 2, HEIGHT - 40);
}

function drawBackground() {
  noStroke();
  fill(30, 26, 18);
  for (let x = 0; x < WIDTH; x += 48) {
    for (let y = 0; y < HEIGHT; y += 32) {
      rect(x, y, 46, 30);
    }
  }
}

/* =========================================================
                    输入 & 物理
========================================================= */
function handleInput() {
  for (let p of players) {
    p.vx = 0;

    if (keyIsDown(p.controls.left))  p.vx -= MOVE_SPEED;
    if (keyIsDown(p.controls.right)) p.vx += MOVE_SPEED;

    if (p.onGround && keyIsDown(p.controls.jump)) {
      p.vy = JUMP_FORCE;
      p.onGround = false;

      if (jumpSound) jumpSound.play();
    }
  }
}

function updatePlayers() {
  for (let p of players) {
    p.vy += GRAVITY;

    // Level2 才有吹风（不过 blowers 在 Level1 为空，也不会影响）
    applyBlowers(p);

    p.x += p.vx;
    resolveCollisions(p, true);

    p.y += p.vy;
    resolveCollisions(p, false);

    updateSlopeCollision(p);
    spawnFire(p);
    spawnWater(p);

    // 掉到底部死亡 → 重开当前关（直接 Retry，不走 Game Over 逻辑）
    if (p.y > HEIGHT) {
      loadLevel(currentLevel);
      return;
    }
  }
}

/* =========================================================
                  平台 + hazard 碰撞
========================================================= */
function resolveCollisions(p, horizontal) {
  const staticPlatforms = [...platforms, movingPlatform, ...seesawRects()];

  for (let plat of staticPlatforms) {
    if (!plat || !collide(p, plat)) continue;

    if (horizontal) {
      if (p.vx > 0) p.x = plat.x - p.w;
      else if (p.vx < 0) p.x = plat.x + plat.w;
    } else {
      if (p.vy > 0) {
        p.y = plat.y - p.h;
        p.vy = 0;
        p.onGround = true;
      } else if (p.vy < 0) {
        p.y = plat.y + plat.h;
        p.vy = 0;
      }
    }
  }

  // 水池 / 绿水死亡
  for (let h of hazards) {
    if (!collide(p, h)) continue;

    if (h.color === "green") {
      loadLevel(currentLevel);
      return;
    }
    // 红池杀 blue，蓝池杀 red
    if (h.color !== p.name) {
      loadLevel(currentLevel);
      return;
    }
  }
}

/* =========================================================
                        斜坡
========================================================= */
function updateSlopeCollision(p) {
  for (let s of slopes) {
    if (p.x + p.w < s.x1 || p.x > s.x2) continue;

    let t = (p.x + p.w / 2 - s.x1) / (s.x2 - s.x1);
    t = constrain(t, 0, 1);

    let slopeY = lerp(s.y1, s.y2, t);

    if (p.vy >= 0 && p.y + p.h >= slopeY && p.y + p.h <= slopeY + s.thickness) {
      p.y = slopeY - p.h;
      p.vy = 0;
      p.onGround = true;
      return;
    }

    if (p.vy < 0 && p.y <= slopeY + s.thickness && p.y >= slopeY - 10) {
      p.y = slopeY + s.thickness;
      p.vy = 0;
      return;
    }
  }
}

/* =========================================================
                seesaw & button & platform
========================================================= */
function seesawRects() {
  if (!seesaw || seesaw.half === 0) return [];
  return [seesawLeft(), seesawRight()];
}

function seesawLeft() {
  return {
    x: seesaw.cx - seesaw.half,
    y: seesaw.baseY - seesaw.offset,
    w: seesaw.half,
    h: seesaw.thickness
  };
}

function seesawRight() {
  return {
    x: seesaw.cx,
    y: seesaw.baseY + seesaw.offset,
    w: seesaw.half,
    h: seesaw.thickness
  };
}

function updateSeesaw() {
  if (!seesaw || seesaw.half === 0) return;

  const left = seesawLeft();
  const right = seesawRight();

  const leftOn = players.some(p => collide(p, left));
  const rightOn = players.some(p => collide(p, right));

  if (leftOn && !rightOn)      seesaw.targetOffset = 28;
  else if (rightOn && !leftOn) seesaw.targetOffset = -28;
  else                         seesaw.targetOffset = 0;

  seesaw.offset = lerp(seesaw.offset, seesaw.targetOffset, 0.07);
}

function updateButtons() {
  for (let b of buttons) {
    b.pressed = false;

    for (let p of players) {
      const px = p.x + p.w / 2;
      const py = p.y + p.h;

      if (
        px >= b.x &&
        px <= b.x + b.w &&
        py >= b.y &&
        py <= b.y + b.h + 10
      ) {
        b.pressed = true;
      }
    }
  }
}

function updateMovingPlatform() {
  if (!movingPlatform || movingPlatform.h === 0) return;

  movingPlatform.lastY = movingPlatform.y;

  let active = buttons.some(b => b.pressed);
  movingPlatform.targetY =
    active ? movingPlatform.baseY - 120 : movingPlatform.baseY;

  if (movingPlatform.y > movingPlatform.targetY)
    movingPlatform.y -= movingPlatform.speed;
  else if (movingPlatform.y < movingPlatform.targetY)
    movingPlatform.y += movingPlatform.speed;
}

/* =========================================================
                    吹风平台（风扇）
========================================================= */
function applyBlowers(p) {
  if (!blowers) return;

  for (let b of blowers) {
    const feetX = p.x + p.w / 2;
    const feetY = p.y + p.h;

    if (
      feetX >= b.x &&
      feetX <= b.x + b.w &&
      feetY >= b.y - 5 &&
      feetY <= b.y + 15
    ) {
      p.vy = -15;
      p.vx += b.dir * 2.0;
      p.onGround = false;

      // 生成风线
      blowLines.push({
        x: b.x + random(0, b.w),
        y: b.y,
        a: 255,
        dir: b.dir
      });
    }
  }
}

/* =========================================================
                      绘制世界
========================================================= */
function drawWorld() {
  drawSlope();
  drawButtons();
  drawMovingPlatform();
  drawPlatforms();
  drawSeesaw();
  drawBlowers();
  drawRoad();
  drawGems();
  drawDoors();
  updateFireParticles();
  updateWaterParticles();
  drawPlayers();
  drawHazards();
}

function drawSlope() {
  fill(110, 90, 60);
  for (let s of slopes) {
    triangle(s.x1, s.y1, s.x2, s.y2, s.x2, s.y2 + s.thickness);
    triangle(s.x1, s.y1 + s.thickness, s.x1, s.y1, s.x2, s.y2 + s.thickness);
  }
}

function drawButtons() {
  for (let b of buttons) {
    fill(b.pressed ? "orange" : "yellow");
    rect(b.x, b.y, b.w, b.h);
  }
}

function drawMovingPlatform() {
  if (!movingPlatform || movingPlatform.h === 0) return;
  fill("yellow");
  rect(movingPlatform.x, movingPlatform.y, movingPlatform.w, movingPlatform.h);
}

function drawPlatforms() {
  fill("#6f5c3a");
  for (let p of platforms) rect(p.x, p.y, p.w, p.h);
}

function drawRoad() {
  fill("#6f5c3a");
  for (let d of road) {
    triangle(d.x1, d.y1, d.x2, d.y2, d.x3, d.y3);
  }
}

function drawBlowers() {
  fill("#ffeb3b");
  noStroke();

  for (let b of blowers) {
    // 风扇本体
    rect(b.x, b.y, b.w, b.h);

    // 每 4 帧生成一条风线（弹簧感动画）
    if (frameCount % 4 === 0) {
      blowLines.push({
        x: b.x + random(0, b.w),
        y: b.y,
        a: 255,
        dir: b.dir
      });
    }
  }

  // 画风线动画
  for (let i = blowLines.length - 1; i >= 0; i--) {
    let bl = blowLines[i];
    bl.y -= 2;
    bl.a -= 4;

    stroke(255, 255, 200, bl.a);
    line(bl.x, bl.y, bl.x, bl.y - 12);

    if (bl.a <= 0) blowLines.splice(i, 1);
  }
}

function drawHazards() {
  for (let h of hazards) {
    if (h.color === "green") fill("#3ddc84");
    else if (h.color === "red") fill("#ff4444");
    else fill("#4fa9ff");
    rect(h.x, h.y, h.w, h.h);
  }
}

function drawSeesaw() {
  fill("#7c6847");
  for (let s of seesawRects()) rect(s.x, s.y, s.w, s.h);
}

function drawDoors() {
  for (let d of doors) {
    fill("#c3a569");
    rect(d.x, d.y, d.w, d.h);
    fill(d.color === "red" ? "#ff4444" : "#4fa9ff");
    rect(d.x + 6, d.y + 6, d.w - 12, d.h - 12);
  }
}

function drawGems() {
  for (let g of gems) {
    if (g.collected) continue;
    push();
    translate(g.x, g.y);
    fill(g.color === "red" ? "#ff4444" : "#4fa9ff");
    beginShape();
    vertex(0, -g.r);
    vertex(g.r, 0);
    vertex(0, g.r);
    vertex(-g.r, 0);
    endShape(CLOSE);
    pop();
  }
}

function drawPlayers() {
  for (let p of players) {
    fill(p.color);
    rect(p.x, p.y, p.w, p.h);
  }
}

/* =========================================================
                 钻石 / 门 / UI / 键盘
========================================================= */
function collectGems() {
  for (let p of players) {
    for (let g of gems) {
      if (g.collected || g.color !== p.name) continue;
      if (dist(p.x, p.y, g.x, g.y) < 30) {
        g.collected = true;
        p.gems++;
      }
    }
  }
}

function checkDoors() {
  let allIn = true;
  for (let p of players) {
    let door = doors.find(d => d.color === p.name);
    if (!collide(p, door)) allIn = false;
  }

  if (!allIn) return;

  if (currentLevel === 1) {
    // 记录 Level 1 剩余时间
    level1Remaining = timer;
    loadLevel(2);   // 进门 → 去第二关（timer 在 loadLevel2 里重置为 120）
  } else {
    // 记录 Level 2 剩余时间
    level2Remaining = timer;
    winStoryTimer = 0;
    gameState = "win"; // 第二关过了就胜利
  }
}

function drawUI() {
  textFont("VT323");

  fill(0, 120);
  rect(0, 0, WIDTH, 40);

  fill("#ff7b7b");
  textAlign(LEFT, CENTER);
  text(`Red gems: ${players[0].gems}`, 20, 15);

  fill("#7bc5ff");
  text(`Blue gems: ${players[1].gems}`, 20, 30);

  fill(255);
  textAlign(RIGHT, CENTER);
  text(`Time: ${timer.toFixed(2)}s`, WIDTH - 20, 20);
}

function keyPressed() {
  if (key === "r" || key === "R") {
    // 重置计时器
    timer = 120;

    if (gameState === "start") {
      // start 画面按 R 就当没事
      return;
    } else if (gameState === "win" || gameState === "gameover") {
      // 从头玩：重置两关记录 & 从 Level 1 开始
      level1Remaining = 0;
      level2Remaining = 0;
      loadLevel(1);
    } else {
      // play 状态：重开当前关
      loadLevel(currentLevel);
    }
  }
}

// AABB 碰撞
function collide(a, b) {
  if (!a || !b) return false;
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
