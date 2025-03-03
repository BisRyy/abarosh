const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

canvas.width = 20 * 30;
canvas.height = 22 * 30 + 25;

const random = Math.floor(Math.random() * 6) + 1;
var audio = new Audio(
  "https://bisry.thearc.tech/abarosh/assets/audio/" + random + ".m4a"
);

class Boundary {
  static width = 30;
  static height = 30;
  constructor({ position }) {
    this.position = position;
    this.width = 30;
    this.height = 30;
  }
  draw() {
    context.fillStyle = "blue";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Player {
  static speed = 3;
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 10;
    this.radians = 0.75;
    this.openRate = 0.12;
    this.rotation = 0;
    this.speed = 3;
  }
  draw() {
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation);
    context.translate(-this.position.x, -this.position.y);
    context.beginPath();
    context.arc(
      this.position.x,
      this.position.y,
      this.radius,
      this.radians,
      Math.PI * 2 - this.radians
    );
    context.lineTo(this.position.x, this.position.y);
    context.fillStyle = "yellow";
    context.fill();
    context.closePath();
    context.restore();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.radians < 0 || this.radians > 0.75) {
      this.openRate = -this.openRate;
    }
    this.radians += this.openRate;
  }
}

class Ghost {
  static speed = 3;
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 10;
    this.color = color;
    this.prevCollisions = [];
    this.speed = 3;
    this.chaser = false;
  }
  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = this.chaser ? "red" : this.color;
    context.fill();
    context.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Pellets {
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
  }
  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "white";
    context.fill();
    context.closePath();
  }
}

class PowerUp {
  constructor({ position }) {
    this.position = position;
    this.radius = 8;
  }
  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "white";
    context.fill();
    context.closePath();
  }
}
const pellets = [];
const boundaries = [];
const powerUps = [];
const ghosts = [];

let number_of_ghosts = 5;
let over = false;
let won = false;

for (let i = 0; i < number_of_ghosts; i++) {
  ghosts.push(
    new Ghost({
      position: {
        x: Boundary.width * 6 + Boundary.width / 2,
        y: Boundary.height * 20 + Boundary.height / 2,
      },
      velocity: {
        x: Ghost.speed,
        y: 0,
      },
      color: "green",
    })
  );
}

const player = new Player({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: {
    x: Player.speed,
    y: 0,
  },
});

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

let lastKey = "";
let score = 0;

const map = [
  ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
  ['-','.','.','.','.','.','.','.','.','-','.','.','.','.','.','.','.','.','-'],
  ['-','.','-','-','.','-','-','-','.','-','.','-','-','-','.','-','-','.','-'],
  ['-','.','-','-','.','-','-','-','.','-','.','-','-','-','.','-','-','.','-'],
  ['-','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','-'],
  ['-','.','-','-','.','-','.','-','-','-','-','-','.','-','.','-','-','.','-'],
  ['-','.','.','.','.','-','.','.','.','-','.','.','.','-','.','.','.','.','-'],
  ['-','.','-','-','.','-','-','-','.','-','.','-','-','-','.','-','-','.','-'],
  ['-','.','-','-','.','-','.','.','.','.','.','.','.','-','.','-','-','.','-'],
  ['-','.','-','-','.','-','.','-','-','-','-','-','.','-','.','-','-','.','-'],
  ['-','.','.','.','.','.','.','-',' ',' ',' ','-','.','.','.','.','.','.','-'],
  ['-','.','-','-','.','-','.','-','-','-','-','-','.','-','.','-','-','.','-'],
  ['-','.','-','-','.','-','.','.','.','.','.','.','.','-','.','-','-','.','-'],
  ['-','.','-','-','.','-','.','-','-','-','-','-','.','-','.','-','-','.','-'],
  ['-','.','.','.','.','.','.','.','.','-','.','.','.','.','.','.','.','.','-'],
  ['-','.','-','-','.','-','-','-','.','-','.','-','-','-','.','-','-','.','-'],
  ['-','.','.','-','.','.','.','.','.','.','.','.','.','.','.','-','.','.','-'],
  ['-','-','.','-','.','-','.','-','-','-','-','-','.','-','.','-','.','-','-'],
  ['-','.','.','.','.','-','.','.','.','-','.','.','.','-','.','.','.','.','-'],
  ['-','.','-','-','-','-','-','-','.','-','.','-','-','-','-','-','-','.','-'],
  ['-','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','-'],
  ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
]

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
          })
        );
        break;
      case ".":
        pellets.push(
          new Pellets({
            position: {
              x: Boundary.width * j + Boundary.width / 2,
              y: Boundary.height * i + Boundary.height / 2,
            },
          })
        );
        break;
    }
  });
});

function collide({ circle, rectangle }) {
  const padding = Boundary.width / 2 - circle.radius - 1;
  return (
    circle.position.y - circle.radius + circle.velocity.y <=
      rectangle.position.y + rectangle.height + padding &&
    circle.position.x + circle.radius + circle.velocity.x >=
      rectangle.position.x - padding &&
    circle.position.y + circle.radius + circle.velocity.y >=
      rectangle.position.y - padding &&
    circle.position.x - circle.radius + circle.velocity.x <=
      rectangle.position.x + rectangle.width + padding
  );
}

let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (keys.ArrowUp && lastKey === "ArrowUp") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: -Player.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = -Player.speed;
      }
    }
  } else if (keys.ArrowDown && lastKey === "ArrowDown") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: Player.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = Player.speed;
      }
    }
  } else if (keys.ArrowLeft && lastKey === "ArrowLeft") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player,
            velocity: {
              x: -Player.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = -Player.speed;
      }
    }
  } else if (keys.ArrowRight && lastKey === "ArrowRight") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player,
            velocity: {
              x: Player.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = Player.speed;
      }
    }
  }
  for (let i = ghosts.length - 1; i >= 0; i--) {
    const ghost = ghosts[i];
    if (
      Math.hypot(
        ghost.position.x - player.position.x,
        ghost.position.y - player.position.y
      ) <
      player.radius + ghost.radius
    ) {
      if (ghost.chaser == false) {
        ghost.chaser = true;
        number_of_ghosts -= 1;
        ghost.position = {
          x: Boundary.width * 14 + Boundary.width / 2,
          y: Boundary.height * 10 + Boundary.height / 2,
        };
      } else {
        over = true;
        gameOver();
      }
    }
  }

  if (pellets.length === 1) {
    cancelAnimationFrame(animationId);
    gameWon();
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    powerUp.draw();
  }

  for (let i = pellets.length - 1; i > 0; i--) {
    const pellet = pellets[i];
    pellet.draw();

    if (
      Math.hypot(
        pellet.position.x - player.position.x,
        pellet.position.y - player.position.y
      ) <
        player.radius + pellet.radius &&
      number_of_ghosts <= 0
    ) {
      pellets.splice(i, 1);
      score += 10;
      scoreEl.innerText = score;
    }
  }

  boundaries.forEach((boundary) => {
    boundary.draw();

    if (
      collide({
        circle: player,
        rectangle: boundary,
      })
    ) {
      player.velocity.y = 0;
      player.velocity.x = 0;
    }
  });
  player.update();

  ghosts.forEach((ghost) => {
    ghost.update();

    const collisions = [];
    boundaries.forEach((boundary) => {
      if (
        !collisions.includes("right") &&
        collide({
          circle: { ...ghost, velocity: { x: ghost.speed, y: 0 } },
          rectangle: boundary,
        })
      ) {
        collisions.push("right");
      }
      if (
        !collisions.includes("left") &&
        collide({
          circle: { ...ghost, velocity: { x: -ghost.speed, y: 0 } },
          rectangle: boundary,
        })
      ) {
        collisions.push("left");
      }
      if (
        !collisions.includes("down") &&
        collide({
          circle: { ...ghost, velocity: { x: 0, y: ghost.speed } },
          rectangle: boundary,
        })
      ) {
        collisions.push("down");
      }
      if (
        !collisions.includes("up") &&
        collide({
          circle: { ...ghost, velocity: { x: 0, y: -ghost.speed } },
          rectangle: boundary,
        })
      ) {
        collisions.push("up");
      }
    });

    if (collisions.length > ghost.prevCollisions.length)
      ghost.prevCollisions = collisions;

    if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
      if (ghost.velocity.x > 0) {
        ghost.prevCollisions.push("right");
      } else if (ghost.velocity.x < 0) {
        ghost.prevCollisions.push("left");
      } else if (ghost.velocity.y > 0) {
        ghost.prevCollisions.push("down");
      } else if (ghost.velocity.y < 0) {
        ghost.prevCollisions.push("up");
      }

      const pathways = ghost.prevCollisions.filter((collision) => {
        return !collisions.includes(collision);
      });

      const direction = pathways[Math.floor(Math.random() * pathways.length)];

      switch (direction) {
        case "right":
          ghost.velocity.x = ghost.speed;
          ghost.velocity.y = 0;
          break;
        case "left":
          ghost.velocity.x = -ghost.speed;
          ghost.velocity.y = 0;
          break;
        case "down":
          ghost.velocity.x = 0;
          ghost.velocity.y = ghost.speed;
          break;
        case "up":
          ghost.velocity.x = 0;
          ghost.velocity.y = -ghost.speed;
          break;
      }
      ghost.prevCollisions = [];
    }
  });

  if (player.velocity.x > 0) {
    player.rotation = 0;
  } else if (player.velocity.x < 0) {
    player.rotation = Math.PI;
  } else if (player.velocity.y > 0) {
    player.rotation = Math.PI / 2;
  } else if (player.velocity.y < 0) {
    player.rotation = (Math.PI * 3) / 2;
  }
}
animate();

function handleGameKeyUp(event) {
  switch (event.key) {
    case "ArrowUp":
      keys.ArrowUp = false;
      break;
    case "ArrowDown":
      keys.ArrowDown = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft = false;
      break;
    case "ArrowRight":
      keys.ArrowRight = false;

      break;
  }
}

function handleGameKeyDown(event) {
  switch (event.key) {
    case "ArrowUp":
      keys.ArrowUp = true;
      lastKey = "ArrowUp";
      break;
    case "ArrowDown":
      keys.ArrowDown = true;
      lastKey = "ArrowDown";
      break;
    case "ArrowLeft":
      keys.ArrowLeft = true;
      lastKey = "ArrowLeft";
      break;
    case "ArrowRight":
      keys.ArrowRight = true;
      lastKey = "ArrowRight";
      break;
    case "p":
    case "P":
      cancelAnimationFrame(animationId);
      break;
    case "m":
    case "M":
    case "Escape":
      drawMainMenu();
      break;
    case "Enter":
    case "c":
    case "C":
      if (won) {
        won = false;
        cancelAnimationFrame(animationId);
        initialize();
        animate();
      } else if (!over) {
        cancelAnimationFrame(animationId);
        animate();
      } else {
        window.location.reload();
      }
      break;
    case "r":
    case "R":
      if (over) {
        window.location.reload();
      } else if (confirm("Are you sure you want to restart?")) {
        window.location.reload();
      }
      break;
    case "N":
    case "n":
      if (!over) {
        if (confirm("Are you sure you want to restart?"))
          window.location.reload();
      }
      break;
    case "Backspace":
      drawMainMenu();
      break;
    case "q":
    case "Q":
      quitGame();
      break;
  }
  audio.play();
}
addEventListener("keydown", handleGameKeyDown);

addEventListener("keyup", handleGameKeyUp);

let selectedOption = 0;

function drawMainMenu() {
  cancelAnimationFrame(animationId);
  context.clearRect(canvas.width / 2 - 120, canvas.height / 2 - 80, 200, 200);
  context.fillStyle = "#fff";
  context.font = "30px Arial";
  const menuOptions = ["C - Continue", "R - Restart", "Q - Quit"];

  menuOptions.forEach((option, index) => {
    if (index === selectedOption) {
      context.fillStyle = "#ff0";
    } else {
      context.fillStyle = "#fff";
    }
    context.fillText(
      option,
      canvas.width / 2 - 100,
      canvas.height / 2 + index * 50 - 40
    );
  });
}

function quitGame() {
  if (!over) {
    if (confirm("Are you sure you want to quit?")) {
      window.location.href = "./index.html";
    }
  } else {
    window.location.href = "./index.html";
  }
}

function gameOver() {
  cancelAnimationFrame(animationId);
  requestAnimationFrame(gameOver);

  context.clearRect(canvas.width / 2 - 120, canvas.height / 2 - 80, 200, 200);
  context.fillStyle = "#fff";
  context.font = "30px Arial";

  const menuOptions = ["Game Over", "R - Restart", "Q - Quit"];

  menuOptions.forEach((option, index) => {
    if (index === selectedOption) {
      context.fillStyle = "#ff0";
    } else {
      context.fillStyle = "#fff";
    }
    context.fillText(
      option,
      canvas.width / 2 - 100,
      canvas.height / 2 + index * 50 - 40
    );
  });
}

function gameWon() {
  cancelAnimationFrame(animationId);
  requestAnimationFrame(gameWon);

  context.clearRect(canvas.width / 2 - 120, canvas.height / 2 - 80, 200, 200);
  context.fillStyle = "#fff";
  context.font = "30px Arial";

  const menuOptions = ["You Win", "R - Restart", "Q - Quit"];

  menuOptions.forEach((option, index) => {
    if (index === selectedOption) {
      context.fillStyle = "#ff0";
    } else {
      context.fillStyle = "#fff";
    }
    context.fillText(
      option,
      canvas.width / 2 - 100,
      canvas.height / 2 + index * 50 - 40
    );
  });
}
