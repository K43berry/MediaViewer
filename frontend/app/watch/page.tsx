"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchVideo } from '../../utils/axios';

export default function WatchPage() {
  const searchParams = useSearchParams();
  const filename = searchParams.get('filename');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (!filename) {
        setError('No video filename provided');
        return;
      }

      try {
        const videoBlob = await fetchVideo(filename);
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
      } catch (err) {
        console.error('Error loading video:', err);
        setError('Failed to load video');
      }
    };

    loadVideo();

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [filename]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading video...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-black">
      <div className="w-full max-w-6xl p-4">
        <video 
          controls 
          autoPlay
          className="w-full rounded-lg shadow-lg"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}