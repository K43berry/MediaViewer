'use client';
import { useState } from 'react';
import { uploadVideo, fetchVideos } from '@/utils/axios';
import VideoHolder from '../components/VideoHolder';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const [videoDataFound, setVideoDataFound] = useState(false);
  const [videoData, setVideoData] = useState<Video | null>(null); // Only store one video object

  interface Video {
    filename: string;
    videoTitle: string;
    description: string;
    thumbnailFilename: string;
    uploadDate: string;
    contentType: string;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !thumbnail || !title.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', video);
      formData.append('thumbnail', thumbnail);
      formData.append('title', title);
      formData.append('description', description);

      await uploadVideo(formData);
      setTitle('');
      setDescription('');
      setVideo(null);
      setThumbnail(null);

      // Fetch the video to verify if it's uploaded correctly
      const data = await fetchVideos(1, title); // Assuming title is used to search the uploaded video
      if (data.videos.length === 0) {
        setError('Error, Video not found');
      } else {
        setVideoData(data.videos[0]); // Pass the first video object, not the whole response
        setVideoDataFound(true);
      }
    } catch (err) {
      setError('Failed to upload video. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8">
      {!videoDataFound && (
        <>
          <h1 className="text-2xl font-bold mb-6 text-white">Upload Video</h1>
          <form onSubmit={handleSubmit} className="bg-neutral-700 p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="thumbnail" className="hover:bg-slate-300 font-medium text-black bg-slate-400 p-2 rounded-lg text-center">
                  Select a Thumbnail: {thumbnail ? thumbnail.name : 'None'}
                </label>
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="w-0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description"
                  rows={4}
                  className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="video" className="hover:bg-slate-300 mb-2 font-medium text-black bg-slate-400 p-2 rounded-lg text-center">
                  Select a Video: {video ? video.name : 'None'}
                </label>
                <input
                  type="file"
                  id="video"
                  accept="video/*"
                  onChange={(e) => setVideo(e.target.files?.[0] || null)}
                  className="w-0"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 mb-4">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className={`px-6 py-2 rounded-md text-white font-medium
                ${isUploading 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        </>
      )}
      {videoDataFound && videoData && (
        <div className="mt-8 p-10">
          <h1 className="mb-10 text-white text-2xl">
            Upload Successful!
          </h1>
          <VideoHolder data={videoData} />
        </div>
      )}
    </div>
  );
}
