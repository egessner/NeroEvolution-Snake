/* eslint linebreak-style: ['error', 'windows'] */
// GLOBALS
const canvas = document.getElementById('mainCanvas');
const button = document.getElementById('restartButton');
const context = canvas.getContext('2d');

let n;
let snakeArr;
let gen;
let parents = [];
const mutationRate = .1;

/**
 * @description init everythingt and begin each snake instance
 */
function main() {
  // const numSnakeGames = document.getElementById('n');
  n = 64;
  gen = 1;

  context.setTransform(1, 0, 0, 1, 0, 0); // reset
  context.clearRect(0, 0, canvas.width, canvas.height);

  // document.addEventListener('keypress', onKeyPress);
  button.addEventListener('click', main);

  if (snakeArr) {
    snakeArr.forEach((row) => row.forEach((snake) => snake.killGame()));
  }

  createSnakeArray();
  snakeArr.forEach((row) => row.forEach((snake) => snake.run()));

  // spin until all Snake objects are done
  // https://stackoverflow.com/questions/13304471/javascript-get-code-to-run-every-minute
  const timerID = setInterval(function() {
    let numGO = 0;
    for (let y = 0; y < snakeArr.length; y++) {
      for (let x = 0; x < snakeArr[0].length; x++) {
        numGO+= snakeArr[y][x].gameOver;
      }
    }
    if (n == numGO) {
      fitness();
      // killPreviousGen();
      createSnakeArray();
      nextGeneration();
      console.log(parents);
      parents.forEach((snake) => snake.dispose()); // get rid of the winners
      // clearInterval(timerID);
    }
  }, 5 * 1000); // 60 * 1000 milsec every minute
}

/**
 * @description Since our canvas is a square, we should be able to just take
 * the root of the # games we want to play, round up and that will work i think
 * @param {boolean} newGeneration
 */
function createSnakeArray(newGeneration) {
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
        if (newGeneration) {
          snakeArr[y][x] = new Snake(scale, xPad, yPad, parentPicker());
          snakeArr[y][x].mutate(mutationRate);
        } else {
          snakeArr[y][x] = new Snake(scale, xPad, yPad);
        }
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
// function onKeyPress(keypress) { // todo we wont need this no more
//   let newDirection;
//   switch (keypress.code) {
//     case 'KeyW':
//       newDirection = 1;
//       break;
//     case 'KeyD':
//       newDirection = 2;
//       break;
//     case 'KeyS':
//       newDirection = 3;
//       break;
//     case 'KeyA':
//       newDirection = 4;
//       break;
//   }
//   if (newDirection) {
//     snakeArr.forEach((row) => row.forEach((snake) => snake.turn(newDirection)));
//   }
// }

/**
 * @description create the next generation of Snakes given the best parents
 * of the previous generation
 */
function nextGeneration() {
  // clear game
  context.setTransform(1, 0, 0, 1, 0, 0); // reset
  context.clearRect(0, 0, canvas.width, canvas.height);
  console.log('Generation: ' + gen);
  gen++;

  snakeArr.forEach((row) => row.forEach((snake) => snake.run()));
}

/**
 * @description determine the best snakes of the current generation
 * a better system might be 1 point for apples, .5 point for moving toward
 * apple, factor in length of surviving
 */
function fitness() {
  // score obviously, maybe time played to help the first couple of generations
  // create list of snakes, sort em based on score, take the top 5
  const numWinners = 5;
  parents = snakeArr.flat().sort((a, b) => a.score < b.score ?
  1: a.score > b.score ? -1 : 0); // todo potential memory leak
  // i think flat creates a new array so we'll need to make a killPreviousGen

  // dispose of the old brains
  parents.forEach((snake, idx) => {
    if (idx > numWinners-1) { // keep the first 5, kill the rest
      snake.dispose();
    }
  });
  parents.splice(numWinners); // cull the herd
}

/**
 * @description dispose of the brains of the previous gen
 */
function killPreviousGen() {
  snakeArr.forEach((snake) => snake.dispose());
}

/**
 * @description helper function to pick a parent from the parent array
 * @return {Snake} snake
 */
function parentPicker() {
  const oneIndex = Math.floor(Math.random() * parents.length);
  return parents[oneIndex].brain;
}

main();

/**
 * need to add:
 * + fitness
 * + nextGeneration spawner
 * + something to check if all the games are over
 * ? and a bunch of random junk
 */