const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * POST /api/upload
 * Accepts multipart form-data with image file or base64 encoded image
 * Returns { image_url, path } with the saved image path
 */
router.post('/', (req, res) => {
    try {
        // Handle base64 encoded image in JSON body
        if (req.body.image) {
            const base64String = req.body.image;
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
            const filePath = path.join(uploadsDir, fileName);

            // Remove data:image/jpeg;base64, prefix if present
            const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
            
            // Write file
            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

            const imageUrl = `/uploads/${fileName}`;
            const fullUrl = `http://localhost:5000${imageUrl}`;
            console.log(`✅ Image uploaded: ${fileName}`);
            return res.json({ image_url: fullUrl, path: fullUrl });
        }

        // Handle multipart form-data (if using multer in future)
        // For now, this will require multer to be implemented
        return res.status(400).json({ error: 'No image provided' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
