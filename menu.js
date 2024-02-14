const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 20 * 30;
canvas.height = 22 * 30 + 25;

const menuOptions = [
  "Survival",
  "Marathon",
  "Multiplayer",
  "Team",
  "Help",
  "Quit",
];
let selectedOption = 0;
let side = 0;

var logo = new Image();
var kuncho = new Image();
var police = new Image();

logo.src = "./assets/title_image/Abarosh.png";
kuncho.src =
  `./assets/sprites/kuncho_sprite/kuncho-` +
  (selectedOption + 3).toString() +
  `.png.png`;
police.src =
  `./assets/sprites/Police_sprite/Police-` +
  (selectedOption + 3).toString() +
  `.png.png`;

police.onload = function () {
  ctx.drawImage(
    police,
    canvas.width / 2 - 150,
    canvas.height / 2 + 200,
    130,
    130
  );
};

logo.onload = function () {
  ctx.drawImage(
    logo,
    canvas.width / 2 - 150,
    canvas.height / 2 - 200,
    200,
    200
  );
};

kuncho.onload = function () {
  ctx.drawImage(
    kuncho,
    canvas.width / 2 - 100,
    canvas.height / 2 + 200,
    130,
    130
  );
};

const random = Math.floor(Math.random() * 6) + 1;

var audio = new Audio(
  "https://bisry.thearc.tech/abarosh/assets/audio/" + random + ".m4a"
);

const customFont = new FontFace(
  "CustomFont",
  "url(assets/fonts/Pixeltype.ttf)"
);

customFont
  .load()
  .then(function (loadedFont) {
    document.fonts.add(loadedFont);
  })
  .catch(function (error) {
    console.log("Font loading failed: " + error);
  });

function drawMainMenu() {
  window.addEventListener("keydown", handleMainMenuKeyDown);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";

  menuOptions.forEach((option, index) => {
    if (index === selectedOption) {
      ctx.fillStyle = "#ff0";
    } else {
      ctx.fillStyle = "#fff";
    }

    if (index === 0) {
      ctx.font = "60px CustomFont";
      let title = "Abarosh";
      ctx.fillText(title, canvas.width / 2 + 40, canvas.height / 2 - 100);
      ctx.font = "40px CustomFont";
      title = "አባሮሽ";
      ctx.fillText(title, canvas.width / 2 - 200, canvas.height / 2 - 100);
    }
    ctx.fillText(
      option,
      canvas.width / 2 - 100,
      canvas.height / 2 + index * 40 - 20
    );
  });
}

function handleMainMenuKeyDown(event) {
  switch (event.key) {
    case "ArrowUp":
      selectedOption =
        (selectedOption - 1 + menuOptions.length) % menuOptions.length;
      break;
    case "ArrowDown":
      selectedOption = (selectedOption + 1) % menuOptions.length;
      break;
    case "Enter":
      selectMenuOption(selectedOption);
      break;
  }
  audio.play();
  side += 1;
  side %= 8;
  kuncho.src =
    `./assets/sprites/kuncho_sprite/kuncho-` +
    (side + 2).toString() +
    `.png.png`;
  police.src =
    `./assets/sprites/Police_sprite/Police-` +
    (side + 2).toString() +
    `.png.png`;
  logo.src = "./assets/title_image/Abarosh.png";

  police.onload = function () {
    ctx.drawImage(
      police,
      canvas.width / 2 - 150,
      canvas.height / 2 + 200,
      130,
      130
    );
  };

  logo.onload = function () {
    ctx.drawImage(
      logo,
      canvas.width / 2 - 150,
      canvas.height / 2 - 200,
      200,
      200
    );
  };

  kuncho.onload = function () {
    ctx.drawImage(
      kuncho,
      canvas.width / 2 - 100,
      canvas.height / 2 + 150,
      130,
      130
    );
  };
  drawMainMenu();
}

function selectMenuOption(optionIndex) {
  switch (optionIndex) {
    case 0:
      window.location.href = "./single.html";
      break;
    case 1:
      window.location.href = "./marathon.html";
      break;
    case 2:
      window.location.href = "./multi.html";
      break;
    case 3:
      window.location.href = "./team.html";
      break;
    case 4:
      window.open("https://github.com/bisryy/abarosh?tab=readme-ov-file#game-modes", "_blank");
      break;
    case 5:
      quitGame();
      break;
  }
}

function startGame() {
  window.location.href = "./index.html";
}

function quitGame() {
  window.location.replace("http://www.youtube.com/watch?v=dQw4w9WgXcQ");
}

drawMainMenu();
