/* eslint linebreak-style: ['error', 'windows'] */
/* GLOBALS */
/**
 * @description
 */
class Snake {
  /**
   * @description
   * @param {int} scale
   * @param {int} xPad
   * @param {int} yPad
   */
  constructor(scale, xPad, yPad) {
    this.SQUARESIZE = 20;
    this.FPS = 10; // 10 should be fine to scale up with
    this.INTERVAL = 1000 / this.FPS;

    this.mainCanvas = document.getElementById('mainCanvas');
    this.context = this.mainCanvas.getContext('2d');

    this.scale = scale;
    this.xPad = xPad;
    this.yPad = yPad;

    this.now = Date.now();
    this.then = Date.now();
    this.delta;
    this.framecount = 0;
    this.requestID;

    this.grid;
    this.score = 0;
    this.apple;
    this.gameOver = false;
    this.SnakeBody = new SnakeBody(20, 20, 10);

    this.createGrid(40, 40);
    this.spawnApple();
    this.updateGrid();
    this.setupDraw();
  }

  /**
   * @description creates a height * width 2d array main grid and 4*4 sidegrid,
   * @param {int} width
   * @param {int} height
  */
  createGrid(width, height) {
    this.grid = [];
    for (let h = 0; h < height; h++) {
      this.grid.push(new Array(width).fill(3));
    }
    this.clearGrid();
  }

  /**
   * @description clear the grid, not the most elegant way of updating locations
   */
  clearGrid() {
    for (let i = 1; i < this.grid.length-1; i++) {
      for (let k = 1; k < this.grid[i].length-1; k++) {
        this.grid[i][k] = 0;
      }
    }
  }

  /**
   * @description print out the grid to the console for testing
   */
  printGrid() {
    for (let y = 0; y < this.grid.length; y++) {
      console.log(y + '\t' + this.grid[y].toString() + '\n');
    }
  }

  /**
   * @description spawns an apple on the game
   */
  spawnApple() {
    let y = Math.ceil(Math.random() * this.grid.length-1);
    let x = Math.ceil(Math.random() * this.grid[0].length-1);
    while (this.grid[y][x] == 1 || this.grid[y][x] == 3) {
      y = Math.ceil(Math.random() * this.grid.length-1);
      x = Math.ceil(Math.random() * this.grid[0].length-1);
    }
    this.apple = [x, y];
    this.score++;
    // this.updateScore(); // bad practice
  }

  /**
   * @description update grid with snake location and apple
   */
  updateGrid() {
    this.clearGrid(); // start with a blank slate
    // first the snake
    const snakePos = this.SnakeBody.getPosition();
    for (let i = 0; i < snakePos.length; i++) { // iterate the SnakeBody pos
      if (!snakePos[i]) {
        break;
      }
      const snakeX = snakePos[i][0];
      const snakeY = snakePos[i][1];
      this.grid[snakeY][snakeX] = 1;
    }
    // next the apple
    this.grid[this.apple[1]][this.apple[0]] = 2; // ugly!
  }

  /**
   * @description detect collision or apple consumption
   * we track the snake in two places, snake class and grid
   * so before we update the grid we can use the snake class to see if
   * it will hit anything
   */
  detectEvent() {
    // all we need to look at is the head, 3 cases
    // tail, border, apple
    const headPos = this.SnakeBody.getHeadPosition();
    switch (this.grid[headPos[1]][headPos[0]]) {
      case 1: // tail
        this.killGame();
        break;
      case 2: // apple
        this.SnakeBody.grow();
        this.spawnApple();
        break;
      case 3: // border
        this.killGame();
        break;
    }

    // snake at max size
    // 1479 should be every square thats not a border,
    // leaving room for apple to spawn
    if (this.SnakeBody.getLength() >= 1479) {
      this.SnakeBody.resetSnakeSize();
      // little ineffiecent cause we call this twice but its a rare case so f it
      this.updateGrid();
      this.setupDraw();
    }
  }

  /**
   * @description draw the game boi
   */
  run() {
    this.now = Date.now();
    this.delta = this.now - this.then;
    if (this.delta > this.INTERVAL) {
      this.framecount++;
      this.then = this.now - (this.delta % this.INTERVAL);

      if (!this.gameOver) {
        this.SnakeBody.moveForward();
        this.detectEvent();
        this.framecount = 0;
        this.updateGrid();
        this.draw();
      }
    }
    if (!this.gameOver) {
      this.requestID = requestAnimationFrame(() => this.run());
    }
  }

  /**
   * @description First time draw the game, after this we will only redraw
   * the area around the snake to improve performance
   */
  setupDraw() {
    // set the scale and transform
    this.context.setTransform(1, 0, 0, 1, 0, 0); // reset
    this.context.translate(this.xPad, this.yPad);
    this.context.scale(this.scale, this.scale);
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x] == 3) { // border
          this.context.fillStyle = '#666565';
          this.context.fillRect(x * this.SQUARESIZE, y * this.SQUARESIZE,
              this.SQUARESIZE, this.SQUARESIZE);
        } else if (this.grid[y][x] == 1) { // snake
          this.context.fillStyle = '#37942b';
          this.context.fillRect(x * this.SQUARESIZE, y * this.SQUARESIZE,
              this.SQUARESIZE, this.SQUARESIZE);
        } else if (this.grid[y][x] == 2) { // apple
          this.context.fillStyle = '#e84d2a';
          this.context.fillRect(x * this.SQUARESIZE, y * this.SQUARESIZE,
              this.SQUARESIZE, this.SQUARESIZE);
        } else { // empty square
          this.context.fillStyle = '#ffffff';
          this.context.fillRect(x * this.SQUARESIZE, y * this.SQUARESIZE,
              this.SQUARESIZE, this.SQUARESIZE);
        }
        this.context.strokeStyle = '#b1b3b1';
        this.context.strokeRect(x * this.SQUARESIZE, y * this.SQUARESIZE,
            this.SQUARESIZE, this.SQUARESIZE);
      }
    }
  }

  /**
   * @description Update the area around the snake and the apple
   */
  draw() {
    // set the scale and transform
    this.context.setTransform(1, 0, 0, 1, 0, 0); // reset
    this.context.translate(this.xPad, this.yPad);
    this.context.scale(this.scale, this.scale);

    // let's just worry about the area around the snake for now.
    // iterate the snakes position
    // i know this could be improved but if it fits it ships at a low flat rate
    // worry less about making everything pretty, instead code dude
    const snakePos = this.SnakeBody.getPosition();
    for (let i = 0; i < snakePos.length; i++) {
      if (!snakePos[i]) {
        return;
      }
      for (let j = 0; j < 4; j++) {
        let x;
        let y;
        switch (j) {
          case 0:
            x = snakePos[i][0];
            y = snakePos[i][1]-1;
            break;
          case 1:
            x = snakePos[i][0]+1;
            y = snakePos[i][1];
            break;
          case 2:
            x = snakePos[i][0];
            y = snakePos[i][1]+1;
            break;
          case 3:
            x = snakePos[i][0]-1;
            y = snakePos[i][1];
            break;
        }
        if (this.grid[y] && this.grid[y][x] != null) {
          if (this.grid[y][x] === 1) { // snake
            this.context.fillStyle = '#37942b';
            this.context.fillRect(x * this.SQUARESIZE, y * this.SQUARESIZE,
                this.SQUARESIZE, this.SQUARESIZE);
          } else if (this.grid[y][x] == 0) { // empty square
            this.context.fillStyle = '#ffffff';
            this.context.fillRect(x * this.SQUARESIZE, y * this.SQUARESIZE,
                this.SQUARESIZE, this.SQUARESIZE);
          }
          this.context.strokeStyle = '#b1b3b1';
          this.context.strokeRect(x * this.SQUARESIZE, y * this.SQUARESIZE,
              this.SQUARESIZE, this.SQUARESIZE);
        }
      }
    }
    // now the apple, we dont need to track its old location cause
    // thats the snakes head
    this.context.fillStyle = '#e84d2a';
    this.context.fillRect(this.apple[0] * this.SQUARESIZE,
        this.apple[1] * this.SQUARESIZE,
        this.SQUARESIZE, this.SQUARESIZE);
  }

  /**
   * @description wrapper for snakeBody turn class
   * @param {int} newDirection
   */
  turn(newDirection) {
    this.SnakeBody.turn(newDirection);
  }

  /**
   * @description update the score
   */
  updateScore() {
    this.scoreLabel.innerHTML = 'Score ' + this.score;
  }

  /**
   * @description end this instance of tetris
   */
  killGame() {
    this.gameOver = true;
    // printGrid();
    cancelAnimationFrame(this.requestID);
  }
}
