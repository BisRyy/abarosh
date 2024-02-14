const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 20 * 30;
canvas.height = window.innerHeight - 65;

const menuOptions = ["Survival", "Marathon", "Multiplayer", "Team", "Quit"];
let selectedOption = 0;
let side = 0;

var logo = new Image();
var kuncho = new Image();
var police = new Image();

// Set the source of the image
logo.src = "./assets/title_image/Abarosh.png";
kuncho.src =
  `./assets/sprites/kuncho_sprite/kuncho-` +
  (selectedOption + 3).toString() +
  `.png.png`;
police.src =
  `./assets/sprites/Police_sprite/Police-` +
  (selectedOption + 3).toString() +
  `.png.png`;

// When the image has loaded, draw it onto the canvas
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
// random number 1 - 6
const random = Math.floor(Math.random() * 6) + 1;
// add background music {random}.mp3
var audio = new Audio("/assets/audio/" + random + ".m4a");

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
  ctx.font = "40px CustomFont";

  menuOptions.forEach((option, index) => {
    if (index === selectedOption) {
      ctx.fillStyle = "#ff0";
    } else {
      ctx.fillStyle = "#fff";
    }
    ctx.fillText(
      option,
      canvas.width / 2 - 100,
      canvas.height / 2 + index * 40
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

  // When the image has loaded, draw it onto the canvas
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
