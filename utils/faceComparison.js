const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function detectFace(imageBuffer) {
  try {
    const img = await canvas.loadImage(imageBuffer);
    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections;
  } catch (error) {
    console.error('Error detecting face:', error);
    throw new Error('Failed to detect face in image');
  }
}

function compareFaces(descriptor1, descriptor2) {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  const threshold = 0.6;
  const similarity = Math.max(0, (1 - distance) * 100);

  return {
    distance,
    similarity: parseFloat(similarity.toFixed(2)),
    isMatch: distance < threshold,
    threshold
  };
}

async function compareTwoFaces(image1Buffer, image2Buffer) {
  const detections1 = await detectFace(image1Buffer);
  const detections2 = await detectFace(image2Buffer);

  if (!detections1 || detections1.length === 0) {
    throw new Error('No face detected in the first image');
  }

  if (!detections2 || detections2.length === 0) {
    throw new Error('No face detected in the second image');
  }

  if (detections1.length > 1) {
    console.warn(`Multiple faces detected in first image (${detections1.length}). Using the first face.`);
  }

  if (detections2.length > 1) {
    console.warn(`Multiple faces detected in second image (${detections2.length}). Using the first face.`);
  }

  const descriptor1 = detections1[0].descriptor;
  const descriptor2 = detections2[0].descriptor;

  return compareFaces(descriptor1, descriptor2);
}

module.exports = {
  detectFace,
  compareFaces,
  compareTwoFaces
};
