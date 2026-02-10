const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const foodImage = new Image();
foodImage.src = "olut.png";

// Vesipullo
const waterImage = new Image();
waterImage.src = "vesi.png";

const gridSize = 20;
let snake = [{ x: 200, y: 200 }];
let direction = { x: gridSize, y: 0 };
let score = 0;
let controlsInverted = false;
let food = randomFood();
let waters = [];
const maxWaterBottles = 5;
let waveEffect = false;
let waveTime = 0;
let gameOverMessage = ""; 
let gamePaused = false;  

// Mato nopeus
let gameInterval = null;
let gameSpeed = 150; // ms
const minSpeed = 50;
const maxSpeed = 300;

// Vesipullojen ilmestymisaika
const waterSpawnInterval = 5000;
let lastWaterSpawn = 0;

// Käynnistä peli vasta kun kuvat on ladattu
let assetsLoaded = 0;
foodImage.onload = assetLoaded;
waterImage.onload = assetLoaded;

function assetLoaded() {
  assetsLoaded++;
  if (assetsLoaded === 2) {
    waters.push(randomFood());
    lastWaterSpawn = Date.now();
    startGameLoop();
  }
}

function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
  if (!gamePaused) update();
  draw();
}

function update() {
  const now = Date.now();

  // Lisää vesipulloja ajan myötä
  if (waters.length < maxWaterBottles && now - lastWaterSpawn > waterSpawnInterval) {
    waters.push(randomFood());
    lastWaterSpawn = now;
  }

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // Itsensä syöminen
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame("älä ny itteäs syä :D");
      return;
    }
  }

  // Seinäosuma
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    endGame("Ei siel oo mitää :D");
    return;
  }

  snake.unshift(head);

  // Syö ruokaa
  if (head.x === food.x && head.y === food.y) {
    score += 10;

    if (score % 25 === 0) {
      waveEffect = true;
      waveTime = 0;
    }

    if (score % 50 === 0) {
      controlsInverted = !controlsInverted;
    }

    // Mato nopeutuu tai hidastuu satunnaisesti oluen jälkeen
    gameSpeed -= 15;
    if (gameSpeed < 50) gameSpeed = 50; // miniminopeus
    startGameLoop();

    food = randomFood();
  } else {
    snake.pop();
  }

  // Vesipullojen törmäys
  for (let i = 0; i < waters.length; i++) {
    if (head.x === waters[i].x && head.y === waters[i].y) {
      score -= 20;
      if (score < 0) score = 0;
      waters[i] = randomFood();
    }
  }

  // Voitto
  if (score >= 200) {
    endGame("jee :D");
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mato
  ctx.fillStyle = "lime";
  snake.forEach(part => {
    ctx.fillRect(part.x, part.y, gridSize, gridSize);
  });

  // Olut
  let size = gridSize;
  if (waveEffect) {
    waveTime += 0.2;
    size = gridSize + Math.sin(waveTime) * 4;
    if (waveTime > Math.PI * 4) {
      waveEffect = false;
      size = gridSize;
    }
  }
  ctx.drawImage(
    foodImage,
    food.x + (gridSize - size) / 2,
    food.y + (gridSize - size) / 2,
    size,
    size
  );

  // Vesipullot
  waters.forEach(w => {
    ctx.drawImage(waterImage, w.x, w.y, 40, 40);
  });

  // Pisteet yläreunassa keskellä
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Pisteet: " + score, canvas.width / 2, 10);

  // Ohjaus sekasin
  if (controlsInverted) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Yritä ohjata ny si :D", canvas.width / 2, 30);
  }

  // Pelin lopputeksti keskellä
  if (gameOverMessage) {
    ctx.fillStyle = "yellow";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(gameOverMessage, canvas.width / 2, canvas.height / 2);
  }
}

function endGame(message) {
  gameOverMessage = message;
  gamePaused = true;

  setTimeout(() => {
    resetGame();
    gameOverMessage = "";
    gamePaused = false;
  }, 2000);
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
    y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
  };
}

function resetGame() {
  snake = [{ x: 200, y: 200 }];
  direction = { x: gridSize, y: 0 };
  food = randomFood();
  waters = [];
  waters.push(randomFood());
  score = 0;
  controlsInverted = false;
  gameSpeed = 150;
  startGameLoop();
}

document.addEventListener("keydown", e => {
  let up = "ArrowUp";
  let down = "ArrowDown";
  let left = "ArrowLeft";
  let right = "ArrowRight";

  if (controlsInverted) {
    [up, down] = [down, up];
    [left, right] = [right, left];
  }

  if (e.key === up && direction.y === 0)
    direction = { x: 0, y: -gridSize };

  if (e.key === down && direction.y === 0)
    direction = { x: 0, y: gridSize };

  if (e.key === left && direction.x === 0)
    direction = { x: -gridSize, y: 0 };

  if (e.key === right && direction.x === 0)
    direction = { x: gridSize, y: 0 };
});

// Virtuaalinapit
document.getElementById("up").addEventListener("touchstart", () => moveSnake("ArrowUp"));
document.getElementById("down").addEventListener("touchstart", () => moveSnake("ArrowDown"));
document.getElementById("left").addEventListener("touchstart", () => moveSnake("ArrowLeft"));
document.getElementById("right").addEventListener("touchstart", () => moveSnake("ArrowRight"));

// Samat napit myös click-tapahtumalle, jos selainta käytetään
document.getElementById("up").addEventListener("click", () => moveSnake("ArrowUp"));
document.getElementById("down").addEventListener("click", () => moveSnake("ArrowDown"));
document.getElementById("left").addEventListener("click", () => moveSnake("ArrowLeft"));
document.getElementById("right").addEventListener("click", () => moveSnake("ArrowRight"));