import axios from 'axios';

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: 'http://localhost:8080', // Base URL for your backend API
  // Remove the default Content-Type header - it will be set automatically for FormData
});

// Helper function to fetch video data
export const fetchVideo = async (filename: string) => {
  try {
    const response = await api.get(`/video?filename=${filename}`, {
      responseType: 'blob', // Ensure we get the video as a blob
    });
    return response.data; // Return the video blob
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error; // Throw the original error for better error handling
  }
};

// Helper function to fetch videos list with pagination
export const fetchVideos = async (page: number = 1) => {
  try {
    const response = await api.get('/getVideos', {
      params: { page },
    });
    return response.data; // Return the list of videos with pagination
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error; // Throw the original error for better error handling
  }
};

// Helper function for uploading video
export const uploadVideo = async (file: File, title: string) => {
  const formData = new FormData();
  
  // Get the file extension from the original file
  const fileExtension = file.name.split('.').pop();
  
  // Create the new filename with the title and original extension
  const newFileName = `${title}.${fileExtension}`;
  
  // Create a new File object with the new filename
  const renamedFile = new File([file], newFileName, { type: file.type });
  
  formData.append('file', renamedFile);
  formData.append('title', title); // Add title separately for metadata
  
  try {
    const response = await api.post('/upload', formData);
    return response.data;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

export const fetchThumbnail = async (filename: string) => {
  try {
    const response = await api.get(`/thumbnail?filename=${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

export default api;