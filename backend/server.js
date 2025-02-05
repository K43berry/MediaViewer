const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');
const { GridFSBucket } = require('mongodb');
const crypto = require('crypto');
const cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// MongoDB connection URI
const mongoURI = 'mongodb://localhost:27017/';

// Connect to MongoDB
const conn = mongoose.createConnection(mongoURI);

// Initialize GridFSBucket
let bucket;
conn.once('open', () => {
    bucket = new GridFSBucket(conn.db, {
        bucketName: 'videos'
    });
});

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const allowedVideoFormats = /mp4|mov|avi|mkv/;
            
            if (!allowedVideoFormats.test(path.extname(file.originalname).toLowerCase())) {
                return reject(new Error('Only video files are allowed.'));
            }

            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    console.error('Error generating filename:', err);
                    return reject(err);
                }

                const filename = buf.toString('hex') + path.extname(file.originalname);
                const filenameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));  

                const fileInfo = {
                    filename: filename,
                    bucketName: 'videos', 
                    metadata: {
                        title: filenameWithoutExt || 'Untitled'
                    }
                };

                resolve(fileInfo); 
            });
        });
    }
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({
        message: "Upload success",
        file: req.file,
    });
});

app.get('/getVideos', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const cursor = bucket.find({ contentType: { $regex: /^video/ } })
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(pageSize);

        const videos = await cursor.toArray();

        if (!videos.length) {
            return res.status(404).json({ message: 'No videos found' });
        }

        const totalVideos = await bucket.find({ contentType: { $regex: /^video/ } }).count();

        res.json({
            page,
            pageSize,
            totalVideos,
            videos: videos.map(video => ({
                filename: video.filename,
                videoTitle: video.metadata?.title,
                uploadDate: video.uploadDate,
                contentType: video.contentType,
            }))
        });
    } catch (err) {
        console.error('Error retrieving videos:', err);
        res.status(500).json({ message: 'Error retrieving videos', error: err.message });
    }
});

app.get('/video', async (req, res) => {
    const { filename } = req.query;

    if (!filename) {
        return res.status(400).json({ message: 'Filename is required' });
    }

    try {
        const cursor = bucket.find({ filename });
        const [file] = await cursor.toArray();

        if (!file) {
            return res.status(404).json({ message: 'Video not found' });
        }

        if (!file.contentType.startsWith('video/')) {
            return res.status(400).json({ message: 'The requested file is not a video' });
        }

        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
            const chunksize = (end - start) + 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${file.length}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': file.contentType
            });

            const downloadStream = bucket.openDownloadStreamByName(filename, {
                start,
                end: end + 1
            });

            downloadStream.on('error', error => {
                console.error('Stream error:', error);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Error streaming video' });
                }
            });

            downloadStream.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': file.length,
                'Content-Type': file.contentType
            });

            const downloadStream = bucket.openDownloadStreamByName(filename);

            downloadStream.on('error', error => {
                console.error('Stream error:', error);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Error streaming video' });
                }
            });

            downloadStream.pipe(res);
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error streaming video', error: error.message });
        }
    }
});

app.get('/test', async (req, res) => {
    res.json({
        message: "hello"
    })
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});