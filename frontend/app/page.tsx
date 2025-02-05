import VideoCarousel from "./components/VideoCarousel";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-8 mb-4">
      <h1 className="text-3xl font-bold">Starwars Videos</h1>
      <VideoCarousel num={1} search={"Starwars"}/>
      <h1 className="text-3xl font-bold">Breaking bad videos</h1>
      <VideoCarousel num={1} search={"bad"}/>
      <h1 className="text-3xl font-bold">Numbers are cool</h1>
      <VideoCarousel num={1} search={"num"}/>
    </main>
  );
}