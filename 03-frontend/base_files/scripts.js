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

    // if (reviewForm && placeId) {
    //     if (!token) {
    //         window.location.href = 'index.html';
    //     }

    //     document.getElementById('place').value = placeId;

    //     reviewForm.addEventListener('submit', async (event) => {
    //         event.preventDefault();
    //         const reviewText = document.getElementById('review').value;

    //         const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {  // Remplacez par l'URL réelle de votre API
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: JSON.stringify({ review: reviewText })
    //         });

    //         if (response.ok) {
    //             alert('Review submitted successfully!');
    //             reviewForm.reset();
    //         } else {
    //             alert('Failed to submit review');
    //         }
    //     });
    // }


    function checkAuthentication() {
        const token = getCookie('token');
        const loginLink = document.getElementById('login-link');
        if (token) {
            loginLink.style.display = 'none';
        }
    }

    checkAuthentication();


// All places part //
    if (document.getElementById('places-list')) {
        let places = []

        async function fetchPlaces(token) {
            const response = await fetch('http://127.0.0.1:5000/places', {  // Remplacez par l'URL réelle de votre API
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
                    window.location.href = `place.html#${targetId}`;
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
