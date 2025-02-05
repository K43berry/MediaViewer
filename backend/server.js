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

const mongoURI = 'mongodb://localhost:27017/';

const conn = mongoose.createConnection(mongoURI);

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
            const allowedImageFormats = /jpg|jpeg|png|gif/;

            const isVideo = allowedVideoFormats.test(path.extname(file.originalname).toLowerCase());
            const isImage = allowedImageFormats.test(path.extname(file.originalname).toLowerCase());

            if (!isVideo && !isImage) {
                return reject(new Error('Only video and image files are allowed.'));
            }

            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    console.error('Error generating filename:', err);
                    return reject(err);
                }

                const filename = buf.toString('hex') + path.extname(file.originalname);

                const fileInfo = {
                    filename: filename,
                    bucketName: 'videos',
                    metadata: {
                        isThumbnail: isImage 
                    }
                };

                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

app.post('/upload', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    if (!req.files['file'] || !req.files['thumbnail']) {
        return res.status(400).json({ message: "Both video and thumbnail files are required" });
    }

    const videoFile = req.files['file'][0];
    const thumbnailFile = req.files['thumbnail'][0];


    try {
        const videoFileId = videoFile.id; 

      
        await conn.db.collection('videos.files').updateOne(
            { _id: videoFileId },
            {
                $set: {
                    'metadata.title': req.body.title,  
                    'metadata.description': req.body.description,
                    'metadata.thumbnail': thumbnailFile  
                }
            }
        );
        

        res.status(200).json({
            message: "Upload success",
            title: req.body.title,
            video: videoFile,
            thumbnail: thumbnailFile
        });
    } catch (err) {
        console.error("Error updating video metadata:", err);
        res.status(500).json({ message: "Error updating metadata", error: err.message });
    }
});


app.get('/getVideos', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;

        const searchTerm = req.query.search || '';
        const titleFilter = searchTerm ? { 'metadata.title': { $regex: searchTerm, $options: 'i' } } : {};

        const cursor = bucket.find({ contentType: { $regex: /^video/ }, ...titleFilter })
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(pageSize);

        const videos = await cursor.toArray();

        if (!videos.length) {
            return res.status(404).json({ message: 'No videos found' });
        }

        const totalVideos = await conn.db.collection('videos.files').countDocuments({
            contentType: { $regex: /^video/ },
            ...titleFilter
        });

        const videoData = await Promise.all(videos.map(async (video) => {
            const thumbnailFilename = video.metadata?.thumbnail.filename;

            return {
                filename: video.filename,
                videoTitle: video.metadata?.title,
                description: video.metadata?.description,
                thumbnailFilename,
                uploadDate: video.uploadDate,
                contentType: video.contentType,
            };
        }));

        res.json({
            page,
            pageSize,
            totalVideos,
            videos: videoData
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

app.get('/thumbnail', async (req, res) => {
    const { filename } = req.query;

    try {
        const cursor = bucket.find({ filename });
        const [file] = await cursor.toArray();

        if (!file) {
            return res.status(404).json({ message: 'Thumbnail not found' });
        }

        if (!file.contentType.startsWith('image/')) {
            return res.status(400).json({ message: 'The requested file is not an image' });
        }

        res.setHeader('Content-Type', file.contentType);
        const downloadStream = bucket.openDownloadStreamByName(filename);

        downloadStream.on('error', (error) => {
            console.error('Error streaming thumbnail:', error);
            res.status(500).json({ message: 'Error streaming thumbnail', error: error.message });
        });

        downloadStream.pipe(res);
    } catch (error) {
        console.error('Error retrieving thumbnail:', error);
        res.status(500).json({ message: 'Error retrieving thumbnail', error: error.message });
    }
});

app.delete('/video', async (req, res) => {
    try {
        const filename = req.query.filename;

        if (!filename) {
            return res.status(400).json({ message: 'Filename is required' });
        }

        const video = await bucket.find({ filename }).toArray();

        if (video.length === 0) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const videoFile = video[0];

        await conn.db.collection('videos.chunks').deleteMany({ files_id: videoFile._id });

        await conn.db.collection('videos.files').deleteOne({ _id: videoFile._id });

        if (videoFile.metadata?.thumbnail) {
            await conn.db.collection('videos.files').deleteOne({ filename: videoFile.metadata.thumbnail.filename });
        }

        res.status(200).json({ message: 'Video and associated chunks deleted successfully' });
    } catch (err) {
        console.error('Error deleting video:', err);
        res.status(500).json({ message: 'Error deleting video', error: err.message });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});