"use client"
import { useState } from "react";
import { uploadVideo } from "../utils/axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>(""); // Changed from videoTitle to title
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Add file type validation
      const file = files[0];
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid video file (mp4, mov, avi, or mkv)');
        return;
      }
      setFile(file);
      setError(null);
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    setError(null);
  };

  const handleUpload = async (e: React.FormEvent) => {

    e.preventDefault(); // Prevent form default submission

    if (!file || !title.trim()) {
      setError("Please provide both a file and a title.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await uploadVideo(file, title);
      setSuccessMessage("Video uploaded successfully!");
      // Reset form
      setFile(null);
      setTitle("");
      if (document.querySelector('input[type="file"]')) {
        (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error uploading video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Upload Video</h1>

      {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">{error}</div>}
      {successMessage && <div className="text-green-500 mb-4 p-2 bg-green-50 rounded">{successMessage}</div>}

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Video Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter video title"
            value={title}
            onChange={handleTitleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="video" className="block text-sm font-medium text-gray-700">
            Video File
          </label>
          <input
            id="video"
            type="file"
            onChange={handleFileChange}
            accept="video/mp4,video/mov,video/avi,video/mkv"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 text-white rounded transition ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            'Upload Video'
          )}
        </button>
      </form>
    </div>
  );
}