const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { loadModels } = require('./utils/loadModels');
const { compareTwoFaces } = require('./utils/faceComparison');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
    }
  }
});

let modelsReady = false;

loadModels()
  .then(() => {
    modelsReady = true;
    console.log('Face recognition models are ready');
  })
  .catch((error) => {
    console.error('Failed to load models:', error);
  });

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from the API!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    modelsReady,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/compare-faces', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!modelsReady) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Face recognition models are still loading. Please try again in a moment.'
      });
    }

    if (!req.files || !req.files.image1 || !req.files.image2) {
      return res.status(400).json({
        error: 'Missing images',
        message: 'Please provide both image1 and image2 files'
      });
    }

    const image1Buffer = req.files.image1[0].buffer;
    const image2Buffer = req.files.image2[0].buffer;

    const result = await compareTwoFaces(image1Buffer, image2Buffer);

    res.json({
      success: true,
      result: {
        distance: result.distance,
        similarity: result.similarity,
        isMatch: result.isMatch,
        threshold: result.threshold,
        message: result.isMatch
          ? 'Faces match!'
          : 'Faces do not match.'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in face comparison:', error);

    if (error.message.includes('No face detected')) {
      return res.status(400).json({
        error: 'Face detection failed',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to compare faces. Please try again.'
    });
  }
});

app.post('/api/detect-faces', upload.single('image'), async (req, res) => {
  try {
    if (!modelsReady) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Face recognition models are still loading. Please try again in a moment.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'Missing image',
        message: 'Please provide an image file'
      });
    }

    const { detectFace } = require('./utils/faceComparison');
    const detections = await detectFace(req.file.buffer);

    if (!detections || detections.length === 0) {
      return res.json({
        success: true,
        facesDetected: 0,
        faces: [],
        message: 'No faces detected in the image'
      });
    }

    const faces = detections.map((detection, index) => ({
      id: index + 1,
      confidence: detection.detection.score,
      box: {
        x: Math.round(detection.detection.box.x),
        y: Math.round(detection.detection.box.y),
        width: Math.round(detection.detection.box.width),
        height: Math.round(detection.detection.box.height)
      }
    }));

    res.json({
      success: true,
      facesDetected: detections.length,
      faces,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in face detection:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to detect faces. Please try again.'
    });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Image size must be less than 10MB'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }

  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
