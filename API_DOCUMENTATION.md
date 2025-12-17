# Face Comparison API Documentation

A Node.js REST API for face detection and comparison using machine learning.

## Features

- Face comparison between two images
- Face detection in images
- Support for JPEG and PNG image formats
- Deployed on Azure Web App (Windows)

## Endpoints

### 1. Health Check

**GET** `/api/health`

Check if the API is running and models are loaded.

**Response:**
```json
{
  "status": "ok",
  "modelsReady": true,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Compare Faces

**POST** `/api/compare-faces`

Compare two faces from uploaded images.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Fields:
  - `image1`: First image file (JPEG or PNG, max 10MB)
  - `image2`: Second image file (JPEG or PNG, max 10MB)

**Success Response (200):**
```json
{
  "success": true,
  "result": {
    "distance": 0.45,
    "similarity": 55.0,
    "isMatch": true,
    "threshold": 0.6,
    "message": "Faces match!"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Result Fields:**
- `distance`: Euclidean distance between face descriptors (lower = more similar)
- `similarity`: Similarity percentage (0-100)
- `isMatch`: Whether faces match (distance < 0.6)
- `threshold`: The threshold used for matching (0.6)

**Error Responses:**

**400 - Missing Images:**
```json
{
  "error": "Missing images",
  "message": "Please provide both image1 and image2 files"
}
```

**400 - No Face Detected:**
```json
{
  "error": "Face detection failed",
  "message": "No face detected in the first image"
}
```

**400 - Invalid File Type:**
```json
{
  "error": "Invalid file type",
  "message": "Invalid file type. Only JPEG and PNG are allowed."
}
```

**400 - File Too Large:**
```json
{
  "error": "File too large",
  "message": "Image size must be less than 10MB"
}
```

**503 - Models Not Ready:**
```json
{
  "error": "Service temporarily unavailable",
  "message": "Face recognition models are still loading. Please try again in a moment."
}
```

### 3. Detect Faces

**POST** `/api/detect-faces`

Detect all faces in an uploaded image.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field:
  - `image`: Image file (JPEG or PNG, max 10MB)

**Success Response (200):**
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
    },
    {
      "id": 2,
      "confidence": 0.9654,
      "box": {
        "x": 400,
        "y": 180,
        "width": 180,
        "height": 220
      }
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**No Faces Found (200):**
```json
{
  "success": true,
  "facesDetected": 0,
  "faces": [],
  "message": "No faces detected in the image"
}
```

## Usage Examples

### Using cURL

**Compare Faces:**
```bash
curl -X POST http://localhost:3000/api/compare-faces \
  -F "image1=@/path/to/image1.jpg" \
  -F "image2=@/path/to/image2.jpg"
```

**Detect Faces:**
```bash
curl -X POST http://localhost:3000/api/detect-faces \
  -F "image=@/path/to/image.jpg"
```

### Using JavaScript (fetch)

**Compare Faces:**
```javascript
const formData = new FormData();
formData.append('image1', file1);
formData.append('image2', file2);

const response = await fetch('http://localhost:3000/api/compare-faces', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

**Detect Faces:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('http://localhost:3000/api/detect-faces', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

### Using Postman

1. Select `POST` method
2. Enter URL: `http://localhost:3000/api/compare-faces`
3. Go to "Body" tab
4. Select "form-data"
5. Add keys:
   - `image1` (type: File) - select first image
   - `image2` (type: File) - select second image
6. Click "Send"

## Deployment on Azure

This application is configured for Azure Web App (Windows) deployment:

1. The `web.config` file is included for IIS configuration
2. Models are automatically downloaded on first run
3. The app uses `process.env.PORT` to get the port from Azure

## Technical Details

### Face Matching Algorithm

The API uses:
- **SSD MobileNet v1** for face detection
- **68-point facial landmarks** for face alignment
- **FaceNet** for generating 128-dimensional face descriptors
- **Euclidean distance** for comparing face descriptors

### Matching Threshold

- Distance < 0.6: Faces match
- Distance >= 0.6: Faces don't match

The threshold of 0.6 provides a good balance between accuracy and false positives.

### Performance Notes

- First request may be slower as models load into memory
- Subsequent requests are much faster
- Multiple faces in an image: The first detected face is used
- Image preprocessing is handled automatically

## Troubleshooting

**Models not loading:**
- Run `node utils/downloadModels.js` manually
- Check internet connection
- Verify the `models` directory exists

**Memory issues on Azure:**
- Ensure your App Service plan has sufficient memory
- Consider upgrading to a higher tier if needed

**Slow performance:**
- First request loads models into memory
- Use the `/api/health` endpoint to warm up the service
- Consider implementing model preloading in production

## Support

For issues or questions, please check the application logs in Azure Portal.
