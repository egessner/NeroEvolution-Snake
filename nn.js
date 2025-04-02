/* eslint linebreak-style: ['error', 'windows'] */
// Daniel Shiffman
// Neuro-Evolution Flappy Bird with TensorFlow.js
// http://thecodingtrain.com
// https://youtu.be/cdUNkwXx-I4
/**
 * @class
 * @description high level wrapper for TensorFlow
 * @source https://www.youtube.com/watch?v=cdUNkwXx-I4&t=145s
 * Addapted to appease my linter (mostly jsDocs)
 * and a couple changes to work with Tetris
 */
class NeuralNetwork {
  /**
   * @description
   * @param {*} inputNodes
   * @param {*} hiddenNodes
   * @param {*} outputNodes
   * @param {*} model
   */
  constructor(inputNodes, hiddenNodes, outputNodes, model) {
    if (model instanceof tf.Sequential) {
      this.input_nodes = inputNodes; // these are hard coded in our createmodel
      this.hidden_nodes = hiddenNodes;
      this.output_nodes = outputNodes;
      this.model = model;
    } else {
      this.input_nodes = inputNodes;
      this.hidden_nodes = hiddenNodes;
      this.output_nodes = outputNodes;
      this.model = this.createModel();
    }
  }

  /**
   * @description
   * @return {*}
   */
  copy() {
    return tf.tidy(() => {
      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone(true);
      }
      modelCopy.setWeights(weightCopies);
      return new NeuralNetwork(
          this.input_nodes,
          this.hidden_nodes,
          this.output_nodes,
          modelCopy,
      );
    });
  }

  /**
   * @description
   * @param {*} rate
   */
  mutate(rate) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        const tensor = weights[i];
        const shape = weights[i].shape;
        const values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (Math.random() < rate) {
            const w = values[j];
            values[j] = w + this.gaussianRandom();
          }
        }
        const newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
    });
  }

  /**
   * @description
   */
  dispose() {
    this.model.dispose();
  }

  /**
   * @description
   * @param {Array} inputs
   * @return {*} action
   */
  predict(inputs) {
    return tf.tidy(() => {
      // we can not normalize in the future if we change the vlaues of our grid
      const normalizedInputs = inputs.map((row) =>
        row.map((value) => [value / 3]));
      const xs = tf.tensor4d([normalizedInputs], [1, 40, 40, 1]);
      const ys = this.model.predict(xs);
      const action = ys.argMax(1).dataSync()[0];
      return action;
    });
  }

  /**
   * @description
   * @return {*}
   */
  createModel() {
    const model = tf.sequential();
    // going to hardcode this at first
    model.add(tf.layers.conv2d({
      inputShape: [40, 40, 1], // 40x40 grid with 1 channel
      filters: 32, // Try 32, increase to 64 if needed
      kernelSize: 3, // Small 3x3 filters to capture local patterns
      strides: 1,
      activation: 'relu',
      padding: 'same', // Keeps output size the same as input
    }));
    model.add(tf.layers.conv2d({filters: 64, kernelSize: 3,
      activation: 'relu', padding: 'same'}));
    model.add(tf.layers.flatten()); 
    model.add(tf.layers.dense({units: 128, activation: 'relu'}));
    model.add(tf.layers.dense({units: 4, activation: 'softmax'}));
    return model;
  }

  /**
   * @description
   * @source https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
   * @param {int} mean
   * @param {int} stdev
   * @return {*}
   */
  gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1)
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
  }
}
