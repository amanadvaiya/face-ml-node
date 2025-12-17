const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

const models = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const MODEL_DIR = path.join(__dirname, '../models');

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(destination, () => {});
      reject(err);
    });
  });
}

async function downloadModels() {
  if (!fs.existsSync(MODEL_DIR)) {
    fs.mkdirSync(MODEL_DIR, { recursive: true });
  }

  console.log('Downloading face recognition models...');

  for (const filename of models) {
    const destination = path.join(MODEL_DIR, filename);

    if (fs.existsSync(destination)) {
      console.log(`${filename} already exists, skipping...`);
      continue;
    }

    const url = MODEL_BASE_URL + filename;
    console.log(`Downloading ${filename}...`);

    try {
      await downloadFile(url, destination);
      console.log(`Downloaded ${filename}`);
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error.message);
      throw error;
    }
  }

  console.log('Creating concatenated .bin files from shards...');

  const shardMappings = {
    'ssd_mobilenetv1_model.bin': ['ssd_mobilenetv1_model-shard1', 'ssd_mobilenetv1_model-shard2'],
    'face_landmark_68_model.bin': ['face_landmark_68_model-shard1'],
    'face_recognition_model.bin': ['face_recognition_model-shard1', 'face_recognition_model-shard2']
  };

  for (const [binFile, shards] of Object.entries(shardMappings)) {
    const binPath = path.join(MODEL_DIR, binFile);

    if (fs.existsSync(binPath)) {
      console.log(`${binFile} already exists, skipping...`);
      continue;
    }

    console.log(`Creating ${binFile} from shards...`);
    const writeStream = fs.createWriteStream(binPath);

    for (const shard of shards) {
      const shardPath = path.join(MODEL_DIR, shard);
      if (!fs.existsSync(shardPath)) {
        console.error(`Shard ${shard} not found!`);
        continue;
      }
      const shardData = fs.readFileSync(shardPath);
      writeStream.write(shardData);
    }

    writeStream.end();
    console.log(`Created ${binFile}`);
  }

  console.log('All models downloaded and processed successfully!');
}

if (require.main === module) {
  downloadModels().catch(console.error);
}

module.exports = { downloadModels };
