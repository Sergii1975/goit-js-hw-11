import axios from 'axios';
import { API } from './api-key.js';

axios.defaults.baseURL = "https://pixabay.com/api/";

axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
    return Promise.reject(error);
  },
);

async function fetchImages(query, page, per_page) {
  try {
    const response = await axios.get(
      `?key=${API}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${per_page}`,
    );
    return response.data;
  }
  catch (error) {
      console.log(error);
  }
}

export { fetchImages };