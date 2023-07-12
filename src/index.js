import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38154528-67f43a39de2efb7355f45b1d8';

// Збираємо елементи зі сторінки
const formEL = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.js-load-more');
let pageCount = 1;

const urlParams = new URLSearchParams({
  q: '',
  page: pageCount,
  per_page: 40,
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  key: API_KEY,
});

formEL.addEventListener('submit', searchImages);
loadMoreBtn.addEventListener('click', loadMore);

async function searchImages(event) {
  event.preventDefault();

  pageCount = 1;
  galleryEl.innerHTML = '';

  const searchQuery = event.target.elements.searchQuery.value;

  urlParams.set('q', searchQuery);

  const { totalHits, hits } = await fetchImages(urlParams);
  Notify.success(`Hooray! We found ${totalHits} images.`);
  let perPage = Number(urlParams.get('per_page'));
  let totalPages = Math.floor(totalHits / perPage);

  if (hits.length === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  if (totalPages <= 1) {
    renderGalleryMarkup(hits);

    Notify.info("We're sorry, but you've reached the end of search results.");
    return;
  }

  renderGalleryMarkup(hits);

  loadMoreBtn.classList.remove('is-hidden');
}
// Отримання даних з сервісу Pixabay
async function fetchImages(urlParams) {
  try {
    const response = await axios.get(`${BASE_URL}?${urlParams.toString()}`);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
}

// Ренедеринг галереї зображень
function renderGalleryMarkup(imagesData) {
  const markup = imagesData
    .map(imageData => {
      const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = imageData;
      return `
      <div class="photo-card">
          <div class="card-img-top">
              <img src="${webformatURL}"
                  alt="${tags}" loading="lazy" />
          </div>
          <div class="card-body info">
              <p class="card-text info-item">
                  <b>Likes:</b>
                  ${likes}
              </p>
              <p class="card-text info-item">
                  <b>Views:</b>
                  ${views}
              </p>
              <p class="card-text info-item">
                  <b>Comments:</b>
                  ${comments}
              </p>
              <p class="card-text info-item">
                  <b>Downloads:</b>
                  ${downloads}
              </p>
          </div>
      </div>`;
    })
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);
}

async function loadMore() {
  pageCount += 1;
  urlParams.set('page', pageCount);

  const { totalHits, hits } = await fetchImages(urlParams);
  let perPage = Number(urlParams.get('per_page'));
  let totalPages = Math.floor(totalHits / perPage);

  renderGalleryMarkup(hits);

  if (totalPages <= pageCount) {
    loadMoreBtn.classList.add('is-hidden');
    Notify.info("We're sorry, but you've reached the end of search results.");
    return;
  }
}
