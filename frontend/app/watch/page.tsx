"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchVideo, fetchVideos } from '../../utils/axios';

export default function WatchPage() {
  const searchParams = useSearchParams();
  const filename = searchParams.get('filename') || undefined;
  const title = searchParams.get('title') || undefined;
  const desc = searchParams.get('desc') || undefined;

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

  console.log(title, desc)

  return (
    <div>
      <div className="my-10 flex justify-center">
        <div className="w-full max-w-5xl p-4 bg-neutral-700 ">
          <video 
            controls 
            autoPlay
            className="w-full rounded-lg shadow-lg mb-6"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <h1 className="text-white text-3xl">
            {title}
          </h1>
          <h2 className="text-gray-400">
            {desc}
          </h2>
        </div>
      </div>
    </div>
  );
}