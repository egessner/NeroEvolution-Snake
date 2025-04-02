/* eslint linebreak-style: ['error', 'windows'] */
// GLOBALS
const canvas = document.getElementById('mainCanvas');
const button = document.getElementById('restartButton');

let n;
let snakeArr;

/**
 * @description init everythingt and begin each snake instance
 */
function main() {
  const numSnakeGames = document.getElementById('n');
  n = numSnakeGames.value;

  const context = canvas.getContext('2d');
  context.setTransform(1, 0, 0, 1, 0, 0); // reset
  context.clearRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keypress', onKeyPress);
  button.addEventListener('click', main);

  if (snakeArr) {
    snakeArr.forEach((row) => row.forEach((snake) => snake.killGame()));
  }

  createSnakeArray();
  snakeArr.forEach((row) => row.forEach((snake) => snake.run()));
}

/**
 * @description Since our canvas is a square, we should be able to just take
 * the root of the # games we want to play, round up and that will work i think
 */
function createSnakeArray() {
  const sqr = Math.ceil(Math.sqrt(n));
  const scale = sqr / Math.pow(sqr, 2);

  // create the array
  snakeArr = [];
  for (let i = 0; i < sqr; i++) {
    snakeArr[i] = new Array(sqr).fill(null);
  }
  // fill the array
  for (let y = 0; y < snakeArr.length; y++) {
    const yPad = (canvas.height / sqr) * y;
    for (let x = 0; x < snakeArr[y].length; x++) {
      const xPad = (canvas.width / sqr) * x;
      // only fill the array with n games of snake
      if ((y * sqr) + x <= n - 1) {
        snakeArr[y][x] = new Snake(scale, xPad, yPad);
      }
    }
  }
  // remove null values
  snakeArr = snakeArr.map((row) => row.filter((snake) => snake != null));
}

/**
 * @description On key press wrapper
 * @param {*} keypress
 */
function onKeyPress(keypress) {
  let newDirection;
  switch (keypress.code) {
    case 'KeyW':
      newDirection = 1;
      break;
    case 'KeyD':
      newDirection = 2;
      break;
    case 'KeyS':
      newDirection = 3;
      break;
    case 'KeyA':
      newDirection = 4;
      break;
  }
  if (newDirection) {
    snakeArr.forEach((row) => row.forEach((snake) => snake.turn(newDirection)));
  }
}
main();
