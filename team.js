const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

canvas.width = 50 * 30;
canvas.height = window.innerHeight - 65;

class Boundary {
  static width = 30;
  static height = 30;
  constructor({ position, color = "blue" }) {
    this.position = position;
    this.width = 30;
    this.height = 30;
    this.color = color;
  }
  draw() {
    context.fillStyle = this.color;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Pacman {
  static speed = 3;
  constructor({ position, velocity, color = "yellow" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 10;
    this.radians = 0.75;
    this.openRate = 0.12;
    this.rotation = 0;
    this.speed = 3;
    this.color = color;
    this.prisoned = false;
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
    context.fillStyle = this.color;
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
    this.radians = this.prisoned ? 0 : this.radians + this.openRate;
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

let number_of_ghosts = 5;
const pellets = [];
const boundaries = [];
const powerUps = [];
const ghosts = [];

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

const player1 = new Pacman({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: {
    x: Pacman.speed,
    y: 0,
  },
});

const player2 = new Pacman({
  position: {
    x: Boundary.width * 48 + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: {
    x: -Pacman.speed,
    y: 0,
  },
  color: "purple",
});

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  s: false,
  a: false,
  d: false,
};

let player1lastKey = "";
let score = 0;

let player2lastKey = "";
let player2score = 0;


const map = [
  ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
  ['-','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.',' ','-'],
  ['-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','.','-','.','-','.','-','-','.','-','.','-'],
  ['-','.','-',' ',' ',' ','-','.','-',' ',' ','-','-','.','-',' ',' ',' ','-','.','-',' ',' ','-','-','.','-',' ',' ',' ','-','.','-','-','-','-','-','.','-','.','.','.','-','.','-','-','.','-','.','-'],
  ['-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-',' ',' ',' ','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','.','-','.','-'],
  ['-','.','-','.','.','.','-','.','-',' ',' ',' ','-','.','-','.','.','.','-','.','-','.','.','.','-','.','-',' ',' ',' ','-','.','-','-','-','-','-','.','-','.','.','.','-','.','.','.','.','-','.','-'],
  ['-','.','-','.','-','.','-','.','-','-','-','-','-','.','-','.','-','.','-','.','-','.','-','.','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','.','-','.','-','.','-','-','.','-','.','-'],
  ['-','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','-'],
  ['-','.','-','.','-','-','-','.','-','-','.','-','.','-','.','-','.','-','.','-','-','.','-','.','-','.','-','.','-','.','-','.','-','-','.','-','.','-','.','-','-','.','-','-','-','-','-','-','.','-'],
  ['-','.','-','.','.','.','.','.','-','.','.','-','.','.','.','.','.','-','.','.','.','.','.','.','-','.','-','.','-','.','.','.','.','.','.','-','.','.','.','.','.','.','-',' ',' ',' ',' ','-','.','-'],
  ['-','.','-','-','-','-','-','.','-','.','-','.','.','-','.','-','.','.','.','-','-','.','-','.','-','.','.','.','-','.','-','.','-','-','.','-','.','-','-','-','-','p','-',' ',' ',' ',' ','-','p','-'],
  ['-','.','.','.','.','.','-','.','-','.','-','.','-','-','.','-','.','-','.','-','-','.','-','.','-','-','-','-','-','.','-','.','-','-','.','-','.','.','.','.','-','.','-',' ',' ',' ',' ','-','.','-'],
  ['-','.','-','.','-','.','-','.','.','.','.','.','.','-','.','-','.','.','.','-','-','.','-','.','.','.','.','.','.','.','-','.','-','-','.','-','.','-','-','.','-','.','-','-','-','-','-','-','.','-'],
  ['-','.','-','.','-','.','.','.','-','-','-','-','.','-','.','-','-','-','.','-','-','.','-','.','-','-','-','-','-','.','-','.','-','-','.','.','.','.','.','.','-','.','.','.','.','.','.','.','.','-'],
  ['-','.','.','.','.','.','-','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','-','.','-','-','.','-','.','-','.','-','-','.','-','.','-'],
  ['-','.','-','-','.','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','.','-','.','-','-','.','.','.','-','.','.','-','.','-','.','-'],
  ['-','.','-','-','.','.','.','.','-',' ',' ',' ','-','.','-',' ','-',' ','-','.','-',' ','-',' ','-','.','-',' ','-',' ','-','.','-','.','.','-','.','.','-','.','-','-','-','-','.','.','.','-','.','-'],
  ['-','.','-','-','-','-','-','.','-',' ',' ',' ','-','.','-',' ','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','.','-','-','-','.','-','.','-','.','.','.','-','-','.','-','.','-'],
  ['-','.','-','-','-','-','-','.','-',' ',' ',' ','-','.','-',' ',' ',' ','-','.','-','-','-','-','-','.','-','-','-','-','-','.','.','.','.','-','.','.','-','.','-','.','-','.','.','.','.','.','.','-'],
  ['-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','-','-','-','.','-','-','.','-','.','-','-','.','-','.','-','-','-','-','.','-','.','-'],
  ['-','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','-'],
  ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],


]

const reds = [[2,12],[3,12],[2,24],[3,24],[5,32],[5,33],[5,34],[5,35],
              [3,33],[3,34],[3,35],[3,36],[15,3],[18,4],[18,5],[19,4],[19,5],[17,2],[18,2],[19,2],[18,8],[19,8],[19,9],[19,10],[19,11],
              [18,18],[16,20],[16,24],[18,21],[18,22],[18,23],[19,21],[19,22],[19,23],[16,26],[16,30],[18,27],[18,28],[18,29],[19,27],[19,28],[19,29]]

const blacks = [[8,42],[8,43],[8,44],[8,45],[8,46],[8,47],
              [9,42],[9,47],
              [10,42],[10,47],
              [11,42],[11,47],
              [12,42],[12,43],[12,44],[12,45],[12,46],[12,47],]

function check(i, j, colors){
  for (let x = 0; x < colors.length; x++ ){
      if (i == colors[x][0] && j == colors[x][1])
          return true
  }
  return false
}


map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(
          new Boundary({color: check(i, j, reds) ? "black" : check(i, j, blacks) ? "red" : "blue",
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            color: check(i, j, reds) ? "black" : check(i, j, blacks) ? "red" : "blue",
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
      case 'p':
        powerUps.push(
          new PowerUp({
            position: {
              x: Boundary.width * j + Boundary.width / 2,
              y: Boundary.height * i + Boundary.height / 2,
            },
          })
        );
      break
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

  controls();

  for (let i = ghosts.length - 1; i >= 0; i--) {
    const ghost = ghosts[i];
    if (
      Math.hypot(
        ghost.position.x - player1.position.x,
        ghost.position.y - player1.position.y
      ) <
      player1.radius + ghost.radius
    ) {
      if (ghost.chaser == false) {
        ghost.position = {
          x: Boundary.width * 41 + Boundary.width / 2,
          y: Boundary.height * 7 + Boundary.height / 2,
        };
        ghost.chaser = true;
        number_of_ghosts -= 1;
        // ghosts.splice(i, 1)
        score += 100;
        scoreEl.innerText = score;
      } else {
        player1.position = {
          x: Boundary.width * 43 + Boundary.width / 2,
          y: Boundary.height * 9 + Boundary.height / 2,
        };
        console.log("P1 prisoned");
        player1.prisoned = true;
        player1.velocity = {
          x: 0,
          y: 0,
        };
      }
    } else if (
      Math.hypot(
        ghost.position.x - player2.position.x,
        ghost.position.y - player2.position.y
      ) <
      player2.radius + ghost.radius
    ) {
      if (ghost.chaser == false) {
        ghost.position = {
          x: Boundary.width * 41 + Boundary.width / 2,
          y: Boundary.height * 7 + Boundary.height / 2,
        };
        ghost.chaser = true;
        number_of_ghosts -= 1;
        // ghosts.splice(i, 1)
        score += 100;
        scoreEl.innerText = score;
      } else {
        player2.position = {
          x: Boundary.width * 44 + Boundary.width / 2,
          y: Boundary.height * 9 + Boundary.height / 2,
        };
        console.log("P2 prisoned");
        player2.prisoned = true;
        player2.velocity = {
          x: 0,
          y: 0,
        };
      }
    }
  }

  if (pellets.length === 1) {
    alert("Game Over. All Pellets are Eaten!");
    cancelAnimationFrame(animationId);
    window.location.href = "./index.html";
  }

  if (player1.prisoned && player2.prisoned) {
    alert("Game Over. All Players are Prisoned!");
    cancelAnimationFrame(animationId);
    window.location.href = "./index.html";
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    powerUp.draw();

    if(Math.hypot(
        powerUp.position.x - player1.position.x,
        powerUp.position.y - player1.position.y) < player1.radius + powerUp.radius && player2.prisoned){
        powerUps.splice(i, 1)
        
          player2.prisoned = false;
          player2.position = {
            x: Boundary.width * 48 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2,
          };
    }

    if(Math.hypot(
        powerUp.position.x - player2.position.x,
        powerUp.position.y - player2.position.y) < player2.radius + powerUp.radius && player1.prisoned){
        powerUps.splice(i, 1)
        
          player1.prisoned = false;
          player1.position = {
            x: Boundary.width + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2,
          };
    }
  }

  for (let i = pellets.length - 1; i > 0; i--) {
    const pellet = pellets[i];
    pellet.draw();

    if (
      Math.hypot(
        pellet.position.x - player1.position.x,
        pellet.position.y - player1.position.y
      ) <
        player1.radius + pellet.radius &&
      number_of_ghosts <= 0
    ) {
      pellets.splice(i, 1);
      score += 10;
      scoreEl.innerText = score;
    }

    if (
      Math.hypot(
        pellet.position.x - player2.position.x,
        pellet.position.y - player2.position.y
      ) <
        player2.radius + pellet.radius &&
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
        circle: player1,
        rectangle: boundary,
      })
    ) {
      player1.velocity.y = 0;
      player1.velocity.x = 0;
    }
    if (
      collide({
        circle: player2,
        rectangle: boundary,
      })
    ) {
      player2.velocity.y = 0;
      player2.velocity.x = 0;
    }
  });
  player1.update();
  player2.update();

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

  if (player1.velocity.x > 0) {
    player1.rotation = 0;
  } else if (player1.velocity.x < 0) {
    player1.rotation = Math.PI;
  } else if (player1.velocity.y > 0) {
    player1.rotation = Math.PI / 2;
  } else if (player1.velocity.y < 0) {
    player1.rotation = (Math.PI * 3) / 2;
  }

  if (player2.velocity.x > 0) {
    player2.rotation = 0;
  } else if (player2.velocity.x < 0) {
    player2.rotation = Math.PI;
  } else if (player2.velocity.y > 0) {
    player2.rotation = Math.PI / 2;
  } else if (player2.velocity.y < 0) {
    player2.rotation = (Math.PI * 3) / 2;
  }
}
animate();

function controls() {
  if (keys.ArrowUp && player1lastKey === "ArrowUp") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player1,
            velocity: {
              x: 0,
              y: -Pacman.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        player1.velocity.y = 0;
        break;
      } else {
        player1.velocity.y = -Pacman.speed;
      }
    }
  } else if (keys.ArrowDown && player1lastKey === "ArrowDown") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player1,
            velocity: {
              x: 0,
              y: Pacman.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        player1.velocity.y = 0;
        break;
      } else {
        player1.velocity.y = Pacman.speed;
      }
    }
  } else if (keys.ArrowLeft && player1lastKey === "ArrowLeft") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player1,
            velocity: {
              x: -Pacman.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player1.velocity.x = 0;
        break;
      } else {
        player1.velocity.x = -Pacman.speed;
      }
    }
  } else if (keys.ArrowRight && player1lastKey === "ArrowRight") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player1,
            velocity: {
              x: Pacman.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player1.velocity.x = 0;
        break;
      } else {
        player1.velocity.x = Pacman.speed;
      }
    }
  } else if (keys.w && player2lastKey === "w") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player2,
            velocity: {
              x: 0,
              y: -Pacman.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        player2.velocity.y = 0;
        break;
      } else {
        player2.velocity.y = -Pacman.speed;
      }
    }
  } else if (keys.s && player2lastKey === "s") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player2,
            velocity: {
              x: 0,
              y: Pacman.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        player2.velocity.y = 0;
        break;
      } else {
        player2.velocity.y = Pacman.speed;
      }
    }
  } else if (keys.a && player2lastKey === "a") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player2,
            velocity: {
              x: -Pacman.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player2.velocity.x = 0;
        break;
      } else {
        player2.velocity.x = -Pacman.speed;
      }
    }
  } else if (keys.d && player2lastKey === "d") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        collide({
          circle: {
            ...player2,
            velocity: {
              x: Pacman.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player2.velocity.x = 0;
        break;
      } else {
        player2.velocity.x = Pacman.speed;
      }
    }
  }
}

addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      keys.ArrowUp = true;
      player1lastKey = "ArrowUp";
      break;
    case "ArrowDown":
      keys.ArrowDown = true;
      player1lastKey = "ArrowDown";
      break;
    case "ArrowLeft":
      keys.ArrowLeft = true;
      player1lastKey = "ArrowLeft";
      break;
    case "ArrowRight":
      keys.ArrowRight = true;
      player1lastKey = "ArrowRight";
      break;
    case "w":
      keys.w = true;
      player2lastKey = "w";
      console.log(player2lastKey);
      break;
    case "s":
      keys.s = true;
      player2lastKey = "s";
      break;
    case "a":
      keys.a = true;
      player2lastKey = "a";
      break;
    case "d":
      keys.d = true;
      player2lastKey = "d";
      break;
  }
  if (player1.prisoned) {
    player1.velocity = {
      x: 0,
      y: 0,
    };
    keys.ArrowDown = false;
    keys.ArrowUp = false;
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
  }

  if (player2.prisoned) {
    player2.velocity = {
      x: 0,
      y: 0,
    };
    keys.w = false;
    keys.s = false;
    keys.a = false;
    keys.d = false;
  }
});

addEventListener("keyup", (event) => {
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
    case "w":
      keys.w = false;
      break;
    case "s":
      keys.s = false;
      break;
    case "a":
      keys.a = false;
      break;
    case "d":
      keys.d = false;
      break;
  }
});
