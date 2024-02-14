const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const player1scoreEl = document.getElementById("player1");
const player2scoreEl = document.getElementById("player2");

canvas.width = 20 * 30;
canvas.height = window.innerHeight - 65;

// random number 1 - 6
const random = Math.floor(Math.random() * 6) + 1;
// add background music {random}.mp3
var audio = new Audio("/assets/audio/" + random + ".m4a");


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
const ghosts = [
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: "green",
  }),
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height * 6 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: "green",
  }),
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height * 8 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: "green",
  }),
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
  }),
];

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
    x: Boundary.width * 17 + Boundary.width / 2,
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
let player1score = 0;

let player2lastKey = "";
let player2score = 0;

let number_of_ghosts = 0;
over = false;
won = false;
winner = -1;

const map = [
  ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-",],
  ["-",".",".",".",".",".",".",".",".","-",".",".",".",".",".",".",".",".","-",],
  ["-",".","-","-",".","-","-","-",".","-",".","-","-","-",".","-","-",".","-",],
  ["-",".","-","-",".","-","-","-",".","-",".","-","-","-",".","-","-",".","-",],
  ["-",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","-",],
  ["-",".","-","-",".","-",".","-","-","-","-","-",".","-",".","-","-",".","-",],
  ["-",".",".",".",".","-",".",".",".","-",".",".",".","-",".",".",".",".","-",],
  ["-",".","-","-",".","-","-","-",".","-",".","-","-","-",".","-","-",".","-",],
  ["-",".","-","-",".","-",".",".",".",".",".",".",".","-",".","-","-",".","-",],
  ["-",".","-","-",".","-",".","-","-","-","-","-",".","-",".","-","-",".","-",],
  ["-",".",".",".",".",".",".","-"," "," "," ","-",".",".",".",".",".",".","-",],
  ["-",".","-","-",".","-",".","-","-","-","-","-",".","-",".","-","-",".","-",],
  ["-",".","-","-",".","-",".",".",".",".",".",".",".","-",".","-","-",".","-",],
  ["-",".","-","-",".","-",".","-","-","-","-","-",".","-",".","-","-",".","-",],
  ["-",".",".",".",".",".",".",".",".","-",".",".",".",".",".",".",".",".","-",],
  ["-",".","-","-",".","-","-","-",".","-",".","-","-","-",".","-","-",".","-",],
  ["-",".",".","-",".",".",".",".",".",".",".",".",".",".",".","-",".",".","-",],
  ["-","-",".","-",".","-",".","-","-","-","-","-",".","-",".","-",".","-","-",],
  ["-",".",".",".",".","-",".",".",".","-",".",".",".","-",".",".",".",".","-",],
  ["-",".","-","-","-","-","-","-",".","-",".","-","-","-","-","-","-",".","-",],
  ["-",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","-",],
  ["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-",],
];
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
      // case 'p':
      // powerUps.push(
      //     new PowerUp({
      //         position:{
      //             x: Boundary.width * j + Boundary.width / 2,
      //             y: Boundary.height * i + Boundary.height / 2
      //         }
      //     })
      // )
      // break
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
        ghost.chaser = true;
        number_of_ghosts += 1;
        ghost.position = {
          x: Boundary.width * 4 + Boundary.width / 2,
          y: Boundary.height * 10 + Boundary.height / 2,
        };
        // ghosts.splice(i, 1)
        player1score += 100;
        player1scoreEl.innerText = player1score;
      } else {
        cancelAnimationFrame(animationId);
        over = true;
        winner = 0;
        gameOver();
      }
    } else if (
      Math.hypot(
        ghost.position.x - player2.position.x,
        ghost.position.y - player2.position.y
      ) <
      player2.radius + ghost.radius
    ) {
      if (ghost.chaser == false) {
        ghost.chaser = true;
        number_of_ghosts += 1;
        ghost.position = {
          x: Boundary.width * 14 + Boundary.width / 2,
          y: Boundary.height * 10 + Boundary.height / 2,
        };
        // ghosts.splice(i, 1)
        player2score += 100;
        player2scoreEl.innerText = player2score;
      } else {
        cancelAnimationFrame(animationId);
        over = true;
        winner = 1;
        gameOver();
      }
    }
  }

  if (pellets.length === 1) {
    const winner = player1score > player2score ? "Player 1" : "Player 2";
    gameWon(`${winner} Wins!`);
    won = true;
    cancelAnimationFrame(animationId);
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    powerUp.draw();

    // if(Math.hypot(
    //     powerUp.position.x - player1.position.x,
    //     powerUp.position.y - player1.position.y) < player1.radius + powerUp.radius){
    //     powerUps.splice(i, 1)
    //     score += 50
    //     scoreEl.innerText = score

    //     ghosts.forEach((ghost) => {
    //         ghost.scared = true

    //         setTimeout(() => {
    //             ghost.scared = false
    //         }, 5000)
    //     })
    // }
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
      number_of_ghosts == 4
    ) {
      pellets.splice(i, 1);
      player1score += 10;
      player1scoreEl.innerText = player1score;
    } else if (
      Math.hypot(
        pellet.position.x - player2.position.x,
        pellet.position.y - player2.position.y
      ) <
        player2.radius + pellet.radius &&
      number_of_ghosts == 4
    ) {
      pellets.splice(i, 1);
      player2score += 10;
      player2scoreEl.innerText = player2score;
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
  audio.play();
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
      // alert("Back to main menu")
      break;
    case "q":
    case "Q":
      quitGame();
      break;
  }
});

const menuOptions = ["C - Continue", "R - Restart", "Q - Quit"];
let selectedOption = 0;

function drawMainMenu() {
  cancelAnimationFrame(animationId);
  context.clearRect(canvas.width / 2 - 120, canvas.height / 2 - 80, 200, 200);
  context.fillStyle = "#fff";
  context.font = "30px Arial";

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
  animationId = requestAnimationFrame(gameOver);

  context.clearRect(canvas.width / 2 - 120, canvas.height / 2 - 90, 200, 200);
  context.fillStyle = "#fff";
  context.font = "30px Arial";

  const menuOptions = ["Game Over.", "", "R - Restart", "Q - Quit"];
  menuOptions[1] = winner == 1 ? "Yellow Wins!" : "Purple Wins!";
  menuOptions.forEach((option, index) => {
    if (index === selectedOption) {
      context.fillStyle = "red";
    } else if (index == 1) {
      context.fillStyle = winner == 1 ? "yellow" : "purple";
    } else {
      context.fillStyle = "#fff";
    }
    context.fillText(
      option,
      canvas.width / 2 - 100,
      canvas.height / 2 + index * 50 - 50
    );
  });
}

function gameWon(winner) {
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameWon);

  context.clearRect(canvas.width / 2 - 120, canvas.height / 2 - 80, 200, 200);
  context.fillStyle = "#fff";
  context.font = "30px Arial";

  const menuOptions = [winner, "R - Restart", "Q - Quit"];

  menuOptions.forEach((option, index) => {
    if (index === selectedOption) {
      context.fillStyle = "green";
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
