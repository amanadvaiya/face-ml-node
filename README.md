# Face Comparison API

A Node.js REST API for face detection and comparison using Machine Learning, deployed on Azure Web App (Windows).

## Features

- **Face Comparison**: Compare two faces and get similarity score
- **Face Detection**: Detect all faces in an image with bounding boxes
- **ML-Powered**: Uses face-api.js with TensorFlow.js
- **Azure Ready**: Configured for Azure Web App Windows deployment
- **Image Support**: Accepts JPEG and PNG images up to 10MB

## Quick Start

### Installation

```bash
npm install
```

This will automatically download the required face recognition models.

### Running Locally

```bash
npm start
```

The server will start on `http://localhost:3000`

### Testing

```bash
node test-api.js
```

Or check the health endpoint:
```bash
curl http://localhost:3000/api/health
```

## API Endpoints

### 1. Health Check
```
GET /api/health
```

### 2. Compare Faces
```
POST /api/compare-faces
Content-Type: multipart/form-data

Fields:
- image1: First image file
- image2: Second image file
```

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/compare-faces \
  -F "image1=@image1.jpg" \
  -F "image2=@image2.jpg"
```

**Response:**
```json
{
  "success": true,
  "result": {
    "distance": 0.45,
    "similarity": 55.0,
    "isMatch": true,
    "threshold": 0.6,
    "message": "Faces match!"
  }
}
```

### 3. Detect Faces
```
POST /api/detect-faces
Content-Type: multipart/form-data

Field:
- image: Image file
```

**Response:**
```json
{
  "success": true,
  "facesDetected": 2,
  "faces": [
    {
      "id": 1,
      "confidence": 0.9876,
      "box": {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 250
      }
    }
  ]
}
```

## Azure Deployment

This application is configured for Azure Web App (Windows) deployment:

1. **Automatic Setup**: The `postinstall` script downloads models automatically
2. **IIS Configuration**: `web.config` is included for Windows/IIS
3. **Port Handling**: Uses `process.env.PORT` for Azure

### Deploy to Azure

1. Push your code to a Git repository
2. Connect Azure Deployment Center to your repository
3. Azure will automatically:
   - Install dependencies
   - Download face recognition models
   - Start the application

## Technical Details

### Face Recognition Models

- **SSD MobileNet v1**: Fast face detection
- **68-point Facial Landmarks**: Face alignment
- **FaceNet**: 128-dimensional face descriptors

### Matching Algorithm

- Uses Euclidean distance between face descriptors
- Threshold: 0.6 (distance < 0.6 = match)
- Returns similarity percentage (0-100)

### Performance

- First request: ~5-10 seconds (model loading)
- Subsequent requests: <1 second
- Models loaded in memory after first use

## Project Structure

```
face-ml-node/
├── index.js              # Main server file
├── utils/
│   ├── loadModels.js     # Model loading logic
│   ├── faceComparison.js # Face detection & comparison
│   └── downloadModels.js # Auto-download models
├── models/               # Face recognition models (auto-downloaded)
├── web.config           # Azure/IIS configuration
├── test-api.js          # API test script
├── package.json
├── README.md
└── API_DOCUMENTATION.md  # Detailed API docs
```

## Dependencies

- **express**: Web server framework
- **face-api.js**: Face recognition library
- **@tensorflow/tfjs**: Machine learning backend
- **canvas**: Image processing
- **multer**: File upload handling

## Environment Variables

- `PORT`: Server port (default: 3000, Azure sets this automatically)

## Troubleshooting

### Models Not Loading

Run manually:
```bash
npm run download-models
```

### Memory Issues on Azure

- Upgrade to a higher App Service tier
- Ensure at least 1GB RAM available

### Slow Performance

- First request loads models into memory
- Use health endpoint to warm up the service
- Consider implementing keep-alive in production

## Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation with examples.

## License

ISC
