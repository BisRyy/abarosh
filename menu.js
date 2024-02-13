const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 20 * 30;
canvas.height = window.innerHeight - 65;

const menuOptions = ["Survival", "Marathon", "Multiplayer", "Quit"];
let selectedOption = 0;

function drawMainMenu() {
  window.addEventListener("keydown", handleMainMenuKeyDown);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "30px Arial";

  menuOptions.forEach((option, index) => {
    if (index === selectedOption) {
      ctx.fillStyle = "#ff0";
    } else {
      ctx.fillStyle = "#fff";
    }
    ctx.fillText(
      option,
      canvas.width / 2 - 100,
      canvas.height / 2 + index * 50
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
      quitGame();
      break;
  }
}

function startGame() {
  window.location.href = "./index.html";
}

function showOptions() {
  alert("Showing options!");
  // Add your options display logic here
}

function quitGame() {
  alert("Quitting the game!");
  // Add your game quitting logic here
}

drawMainMenu();
