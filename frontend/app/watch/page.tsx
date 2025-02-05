// app/watch/page.tsx
import VideoPlayer from '../components/VideoPlayer';

export default function WatchPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Watch Video</h1>
      <VideoPlayer />
    </div>
  );
}