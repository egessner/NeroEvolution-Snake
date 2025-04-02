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
      this.input_nodes = inputNodes;
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
        weightCopies[i] = weights[i].clone();
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
   * @param {*} inputs
   * @return {*}
   */
  predict(inputs) {
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      // console.log(outputs);
      return outputs;
    });
  }

  /**
   * @description
   * @return {*}
   */
  createModel() {
    const model = tf.sequential();
    const hidden = tf.layers.dense({
      units: this.hidden_nodes,
      inputShape: [this.input_nodes],
      activation: 'sigmoid',
    });
    model.add(hidden);
    const output = tf.layers.dense({
      units: this.output_nodes,
      activation: 'softmax',
    });
    model.add(output);
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
