"use client";
import { fetchThumbnail } from '../../utils/axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface VideoData {
  filename: string;
  videoTitle: string;
  thumbnailFilename: string;
}

const VideoHolder = ({ data }: { data: VideoData }) => {
  const router = useRouter();
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  //console.log(JSON.stringify(data, null, 2))

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      setError(null);
      try {
        const blob = await fetchThumbnail(data.thumbnailFilename);
        const objectUrl = URL.createObjectURL(blob);
        setThumbnail(objectUrl);
      } catch (err) {
        console.error("Error fetching thumbnail:", err);
        setError("Failed to load thumbnail.");
      } finally {
        setLoading(false);
      }
    };
    getData();

    return () => {
      if (thumbnail) {
        URL.revokeObjectURL(thumbnail);
      }
    };
  }, []);

  const handleClick = () => {
    router.push(`/watch?filename=${data.filename}`);
  };

  if (loading) return <div>Loading thumbnail...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div 
      className="relative group cursor-pointer transform transition-transform duration-200 hover:scale-95"
      onClick={handleClick}
    > 

      {thumbnail && (
        <>
          <img
            src={thumbnail}
            alt={data.videoTitle || "Video Thumbnail"}
            className="w-full object-cover rounded-lg" 
            style={{
              aspectRatio: "16/9",
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-200 rounded-lg flex items-end">
            <div className="text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <h3 className="text-lg font-semibold">{data.videoTitle || "Untitled Video"}</h3>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoHolder;
