"use client"
import { useEffect, useState } from 'react'
import { fetchVideos } from '../../utils/axios'
import VideoHolder from './VideoHolder'
import { ChevronLeft, ChevronRight } from 'lucide-react' 

interface Video {
  filename: string;
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

const VideoCarousel = ({num} : {num: number}) => {
    const [videos, setVideos] = useState<VideosResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const videosPerPage = 5;
    const totalVideos = videos?.videos?.length || 0;

    useEffect(() => { 
        const getVideos = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchVideos(num);
                setVideos(data);
            } catch (err) {
                console.error("Error fetching videos:", err);
                setError("Failed to load videos.");
            } finally {
                setLoading(false);
            }
        }
        getVideos()
    }, [num])

    const nextSlide = () => {
        if (videos?.videos) {
            setCurrentIndex((prevIndex) => {
                const maxIndex = videos.videos.length - videosPerPage;
                return prevIndex >= maxIndex ? maxIndex : prevIndex + 1;
            });
        }
    };
    

    const prevSlide = () => {
        if (videos?.videos) {
            setCurrentIndex((prevIndex) => 
                prevIndex <= 0 ? 0 : prevIndex - 1
            );
        }
    };

    if (loading) return <div>Loading videos...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="relative w-full">
            <div className="overflow-hidden">
                <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{
                        transform: `translateX(-${(currentIndex * 100) / (totalVideos || 1)}%)`,
                        width: `${(totalVideos || 1) * (100 / videosPerPage)}%`
                    }}
                >
                    {videos && videos.videos && videos.videos.map((video: Video, index: number) => (
                        <div 
                            key={index} 
                            className="flex-shrink-0" 
                            style={{ width: `${100 / (totalVideos || 1)}%` }}
                        >
                            <VideoHolder data={video} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation buttons */}
            {currentIndex > 0 && (
                <button 
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white 
                             hover:bg-black/75 z-10"
                >
                    <ChevronLeft size={24} />
                </button>
            )}
            {currentIndex < totalVideos - videosPerPage && (
                <button 
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white 
                             hover:bg-black/75 z-10"
                >
                    <ChevronRight size={24} />
                </button>
            )}
        </div>
    );
};

export default VideoCarousel;