"use client"
import { useState } from 'react';
import { fetchVideo } from '../../utils/axios';

const VideoPlayer = () => {
  const [filename, setFilename] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchVideo = async () => {
    if (!filename.trim()) {
      setError('Please enter a filename');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const videoBlob = await fetchVideo(filename);
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
    } catch (err) {
      setError('Error loading video. Please check the filename and try again.');
      setVideoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup URL when component unmounts or URL changes
  const cleanupUrl = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Enter video filename"
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleFetchVideo}
            disabled={loading}
            className={`px-4 py-2 text-white rounded transition ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Loading...' : 'Play Video'}
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-red-500 text-sm">{error}</div>
        )}
      </div>

      {videoUrl && (
        <div className="aspect-video bg-black rounded overflow-hidden">
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            onError={() => {
              setError('Error playing video');
              cleanupUrl();
              setVideoUrl(null);
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;