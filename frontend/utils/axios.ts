import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});


export const fetchVideo = async (filename: string) => {
  try {
    const response = await api.get(`/video?filename=${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error; 
  }
};


export const fetchVideos = async (page: number = 1, search: string = '', pageSize: number = 10) => {
  try {
    const response = await api.get('/getVideos', {
      params: { page, search, pageSize },
    });
    return response.data; 
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error; 
  }
};


export const uploadVideo = async (formData: FormData) => {
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

export const deleteVideo = async (filename: string) => {
  try {
    const response = await api.delete(`/video?filename=${filename}`)
    return response.data;
  } catch (error) {
    console.error('Error deleting video', error);
    throw error;
  }
}

export default api;