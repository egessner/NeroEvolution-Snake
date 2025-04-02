/* eslint linebreak-style: ['error', 'windows'] */
/**
 * @classdesc Snake
 */
class SnakeBody {
  /**
   * @description todo
   * @param {int} initX
   * @param {int} initY
   * @param {int} initSize
   */
  constructor(initX, initY, initSize) {
    /* 1=N, 2=E, 3=S, 4=W */
    this.headDirection = Math.ceil(Math.random() * 4);
    this.length = initSize;
    this.startingLength = initSize;
    // array w/ size of this.length, head is at 0
    this.position = new Array(this.length);
    this.position[0] = [initX, initY]; // fence post
    for (let i = 1; i < initSize; i++) { // set starting positions
      switch (this.headDirection) {
        case 1: // north
          this.position[i] = [initX, initY+i];
          break;
        case 2: // east
          this.position[i] = [initX-i, initY];
          break;
        case 3: // south
          this.position[i] = [initX, initY-i];
          break;
        case 4: // west
          this.position[i] = [initX+i, initY];
          break;
      }
    }
  }

  /**
   * @description takes the array and moves each square forward one based on
   * the current head direction. Not the snakes job to detect a border,
   * that will be the game runner, not sure about tail detection yet
   */
  moveForward() {
    const temp = this.position.slice(0, -1);

    const curX = this.position[0][0];
    const curY = this.position[0][1];
    switch (this.headDirection) {
      case 1: // north
        this.position[0] = [curX, curY-1];
        break;
      case 2: // east
        this.position[0] = [curX+1, curY];
        break;
      case 3: // south
        this.position[0] = [curX, curY+1];
        break;
      case 4: // west
        this.position[0] = [curX-1, curY];
        break;
    }
    // not the sexiest solution
    this.position.splice(1, this.position.length, ...temp);
  }

  /**
   * @description turn the snake, ie update the headDirection
   * @param {int} direction
   */
  turn(direction) {
    if (this.headDirection % 2 != direction % 2) {
      this.headDirection = direction;
    }
  }

  /**
   * @description grow the snake array by one, the new square will have a null
   * value until the snake moves forward one.
   */
  grow() {
    this.position.push(null);
    this.length++;
  }

  /**
   * @description returns snakes current position
   * @return {Array} this.position
   */
  getPosition() {
    return this.position;
  }

  /**
   * @description retrun the heads position
   * @return {Array} heads x,y position
   */
  getHeadPosition() {
    return this.position[0];
  }

  /**
   * @description return the length
   * @return {int} length
   */
  getLength() {
    return this.length;
  }

  /**
   * @description reset snake to starting size
   */
  resetSnakeSize() {
    this.position = this.position.slice(0, this.startingLength);
    this.length = this.startingLength;
  }
}
