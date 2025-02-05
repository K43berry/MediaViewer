"use client"
import { useState } from "react";
import VideoCarousel from "./components/VideoCarousel";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Featured Videos</h1>
      <VideoCarousel num={1} />
    </main>
  );
}