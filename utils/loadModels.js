const faceapi = require('face-api.js');
const path = require('path');

require('@tensorflow/tfjs');
console.log('Using @tensorflow/tfjs backend');

const MODEL_URL = path.join(__dirname, '../models');

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) {
    return;
  }

  try {
    console.log('Loading face recognition models...');

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);

    modelsLoaded = true;
    console.log('Face recognition models loaded successfully');
  } catch (error) {
    console.error('Error loading models:', error);
    throw new Error('Failed to load face recognition models');
  }
}

module.exports = { loadModels };
