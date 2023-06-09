
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

import { fetchImages } from './get-read';

const gallery = document.querySelector(".gallery");
const searchForm = document.querySelector(".search-form");
const loading = document.querySelector("button.load-more")

let query = '';
let page = 1;
let simpleLightBox;
const per_page = 40;

searchForm.addEventListener('submit', onSearchForm);
loading.classList.add('unvisible');

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
  fetchImages(query, page, per_page)
    .then(data => {
      page += 1;
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
  simpleLightBox.destroy();
  fetchImages(query, page, per_page)
    .then((data) => {
      renderGallery(data.hits);
      page += 1;
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();
      const totalPages = Math.ceil(data.totalHits / per_page);
      if (page > totalPages) {
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results.",
        );
      loading.classList.add('unvisible')
      }
    })
    .catch((error) => console.log(error));
});

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
  
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  
  window.scrollBy({
    top: cardHeight / 4,
    behavior: 'smooth',
  });
}
