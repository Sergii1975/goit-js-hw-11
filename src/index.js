import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

axios.defaults.baseURL = "https://pixabay.com/api/";
const API = "36982513-bf126f349b94d33a115a611fc";

const gallery = document.querySelector(".gallery");
const searchForm = document.querySelector(".search-form");
const loading = document.querySelector("button.load-more")

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);
loading.classList.add('unvisible')
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
    return Promise.reject(error);
  },
);

async function fetchImages(query, page, perPage) {
  const response = await axios.get(
    `?key=${API}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
  );
  return response.data;
}

function renderGallery(images) {
  if (!gallery) {
    return;
  } 
    const markup =  images
    .map(image => {
      const {
        tags,
        webformatURL,
        largeImageURL,
        likes,
        views,
        comments,
        downloads,
      } = image;
      return `
          <a class="gallery__link" href="${largeImageURL}"> 
      <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>: ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>: ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>: ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>: ${downloads}
    </p>
  </div>
</div>
      `;
    })
      .join('');
    gallery.insertAdjacentHTML('beforeend', markup);
  
  const { height: imageHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: imageHeight * 2,
    behavior: 'smooth',
  });
}

function onSearchForm(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();
  gallery.innerHTML = '';
loading.classList.remove('unvisible')
  if (query === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.',
    );
    loading.classList.add('unvisible')
    return;
  }

  fetchImages(query, page, perPage)
    .then(data => {
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
        );
      } else {
        renderGallery(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
}
loading.addEventListener('click', () => {
  fetchImages(query, page, perPage)
    .then((data) => {
      renderGallery(data.hits);
      page += 1;
simpleLightBox = new SimpleLightbox('.gallery a').refresh();
      if (page > 1) {
        loading.classList.remove('unvisible');
      }
    })
    .catch((error) => console.log(error));
});


