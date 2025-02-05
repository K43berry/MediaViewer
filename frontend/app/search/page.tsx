"use client";
import { useState, useEffect } from 'react';
import { fetchVideos } from '../../utils/axios';
import VideoHolder from '../components/VideoHolder';

interface Video {
    filename: string;
    description: string;
    videoTitle: string;
    thumbnailFilename: string;
    uploadDate: string;
    contentType: string;
  }
  
  interface VideosResponse {
    page: number;
    pageSize: number;
    totalVideos: number;
    videos: Video[];
  }

export default function Search() {

    const [videos, setVideos] = useState<VideosResponse | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    const pageSize = 999;

    useEffect(() => { 
        const getVideos = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchVideos(1, searchTerm, pageSize);
                setVideos(data);
            } catch (err) {
                setError("No videos found.");
                setVideos(null)
            } finally {
                setLoading(false);
            }
        }
        getVideos()
    }, [searchTerm])

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    }

    return (

        <div className="min-h-screen p-6">

            <div className=" flex gap-10 max-w-7xl mx-auto">

                <div className="flex-col mb-6 py-5">
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="grid grid-cols-3 gap-6 grid-flow-row">
                    {videos && videos.videos && videos.videos.map((video, index) => (
                        <VideoHolder key={`${video.filename}-${index}`} data={video} />
                    ))}
                </div>

                {loading && (
                    <div className="text-center py-4">
                        Loading...
                    </div>
                )}
                {error && (
                    <div className="text-center py-4 text-red-500">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}


