document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const reviewForm = document.getElementById('review-form');
    const placeId = getPlaceIdFromURL();
    const token = getCookie('token');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('http://127.0.0.1:5000/login', {  // Remplacez par l'URL réelle de votre API
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

    if (reviewForm && placeId) {
        if (!token) {
            window.location.href = 'index.html';
        }

        document.getElementById('place').value = placeId;

        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const reviewText = document.getElementById('review').value;

            const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {  // Remplacez par l'URL réelle de votre API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ review: reviewText })
            });

            if (response.ok) {
                alert('Review submitted successfully!');
                reviewForm.reset();
            } else {
                alert('Failed to submit review');
            }
        });
    }

    if (document.getElementById('places-list')) {
        checkAuthentication();

        async function fetchPlaces(token) {
            const response = await fetch('http://127.0.0.1:5000/places', {  // Remplacez par l'URL réelle de votre API
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const places = await response.json();
                displayPlaces(places);
            }
        }

        function displayPlaces(places) {
            const placesList = document.getElementById('places-list');
            placesList.innerHTML = '';

            places.forEach(place => {
                const placeCard = document.createElement('div');
                placeCard.className = 'place-card';
                placeCard.innerHTML = `
                    <ul>
                        <li>Host: ${place.host_name}</li>
                        <li>Price per night: $${place.price_per_night}</li>
                        <li>Location: ${place.city_name}, ${place.country_name}</li>
                        <li>Description: ${place.description}</li>
                    </ul>
                `;
                placesList.appendChild(placeCard);
            });
        }

        function checkAuthentication() {
            const token = getCookie('token');
            const loginLink = document.getElementById('login-link');
            if (!token) {
                loginLink.style.display = 'block';
            } else {
                loginLink.style.display = 'none';
                fetchPlaces(token);
            }
        }

        document.getElementById('country-filter').addEventListener('change', (event) => {
            const selectedCountry = event.target.value;
            const places = document.querySelectorAll('.place-card');

            places.forEach(place => {
                if (selectedCountry === '' || place.querySelector('p').innerText.includes(selectedCountry)) {
                    place.style.display = 'block';
                } else {
                    place.style.display = 'none';
                }
            });
        });
    }

    if (document.getElementById('place-details')) {
        if (!token) {
            document.getElementById('add-review').style.display = 'none';
        } else {
            fetchPlaceDetails(token, placeId);
        }
    }
    async function fetchPlaceDetails(token, placeId) {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {  // Remplacez par l'URL réelle de votre API
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        }
    }

    function displayPlaceDetails(place) {
        const placeDetails = document.getElementById('place-details');
        placeDetails.innerHTML = `
            <img src="${place.image}" alt="${place.name}" class="place-image-large">
            <h2>${place.name}</h2>
            <p>${place.location}</p>
            <p>${place.price_per_night} per night</p>
            <p>${place.description}</p>
        `;
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function getPlaceIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }
});
