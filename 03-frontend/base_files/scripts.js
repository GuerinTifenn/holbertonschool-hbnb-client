document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    const token = getCookie('token');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                document.cookie = `token=${data.access_token}; path=/`;
                window.location.href = 'index.html';
            } else {
                document.getElementById('error-message').innerText = 'Login failed: An error has occured'
            }
        });
    }


    function checkAuthentication() {
        const token = getCookie('token');
        const loginLink = document.getElementById('login-link');
        if (token) {
            loginLink.style.display = 'none';
        }
    }
    checkAuthentication();

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

// All places part //
    if (document.getElementById('places-list')) {
        //checkAuthentication();
        let places = []

        async function fetchPlaces(token) {
            const response = await fetch('http://127.0.0.1:5000/places', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                places = await response.json();
                displayPlaces(places);
            }
        }

        fetchPlaces()

        function displayPlaces(places) {
            const placesList = document.getElementById('places-list');
            placesList.innerHTML = '';

            places.forEach(place => {
                const placeCard = document.createElement('div');
                placeCard.className = 'place-card';
                placeCard.innerHTML = `
                <h2>${place.description}</h2>
                <p>Price per night: $ ${place.price_per_night}</p>
                <p>Location: ${place.city_name}, ${place.country_name}</p>
                <button id="details-button" data-place-id="${place.id}">View details</button>
                `;
                placesList.appendChild(placeCard);
            });
            goToPlaceDetails()
        }

        function goToPlaceDetails () {
            const buttons = document.querySelectorAll('#details-button')
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetId = button.getAttribute('data-place-id')
                    window.location.href = `place.html?id=${targetId}`;
                })
            })
        }

        function filterPlacesByCountry(country) {
            if (country === "all") {
                displayPlaces(places);
            } else {
                const filteredPlaces = places.filter(place => place.country_name === country);
                displayPlaces(filteredPlaces);
            }
        }


        document.getElementById('country-filter').addEventListener('change', (event) => {
            filterPlacesByCountry(event.target.value);
        });
    }

    function getIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async function loadAddReview() {
        const response = await fetch('add_review.html');
                const html = await response.text();
                document.getElementById('add-review').innerHTML = html;
                const reviewForm = document.getElementById('review-form');
                console.log('reviieieie', reviewForm)
                createReview(reviewForm);
    }

    if (document.getElementById('place-details')) {
        const placeId = getIdFromUrl();
            if (placeId) {
                fetchPlaceDetails(placeId);
                loadAddReview()
            }
        if (!token) {
            document.getElementById('add-review').style.display = 'none';
        }
    }

    async function fetchPlaceDetails(placeId) {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
            displayReviews(place)
        }
    }

    function displayPlaceDetails(place) {
        const placeDetails = document.getElementById('place-details');
        placeDetails.innerHTML = `
            <h2 class="title">${place.description}</h2>
            <div class="place-detail-card">
            <ul>
            <li><strong>Host:</strong> ${place.host_name}</li>
            <li><strong>Price per night:</strong> $${place.price_per_night}</li>
            <li><strong>Location:</strong> ${place.city_name}, ${place.country_name}</li>
            <li><strong>Description:</strong> ${place.description}</li>
            <li><strong>Amenities:</strong> ${place.amenities}</li>
            </ul>
            </div>
        `;
    }

    function displayReviews(place) {
        const reviewTitle = document.getElementById('title');
        if (place.reviews.length) {
            reviewTitle.innerHTML = '<h2 class="title">Reviews</h2>'
        } else {
            reviewTitle.innerHTML = '';
        }
        const displayReviews = document.getElementById('review-card');
        displayReviews.innerHTML = '';
        let reviewsHtml = '';
        place.reviews.forEach(review => {
            reviewsHtml += `
            <div class="review-card">
                <p><strong>${review.user_name}</strong></p>
                <p>${review.comment}</p>
                <p>Rating: ${getStars(review.rating)}</p>
            </div>
            `;
        });
        displayReviews.innerHTML = reviewsHtml;
    }

    function getStars(rating) {
        const fullStar = '★'; // Unicode pour une étoile pleine
        const emptyStar = '☆'; // Unicode pour une étoile vide
        let stars = '';

        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? fullStar : emptyStar;
        }

        return stars;
    }


    function createReview (reviewForm) {
        if (reviewForm) {
            const placeId = getIdFromUrl();
            console.log(placeId)
          if (placeId) {
            console.log('if')
            reviewForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const reviewText = document.getElementById('review-text').value;
                const ratingValue = document.getElementById('review-rating').value;

                const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ review: reviewText, rating: ratingValue, place_id: placeId })
                });

                if (response.ok) {
                    alert('Review submitted successfully!');
                    reviewForm.reset();
                    fetchPlaceDetails(placeId);
                } else {
                    alert('Failed to submit review');
                }
            });
          }
        }
    }

});
