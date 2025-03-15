const apiKey = "3fd2be6f0c70a2a598f084ddfb75487c";
const searchApi = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`;
const creditsApi = `https://api.themoviedb.org/3/movie/`;
const recommendApi = `https://api.themoviedb.org/3/movie/`;
const imgPath = "https://image.tmdb.org/t/p/w500";

// Navigation history stack
let previousSearchResults = [];

document.getElementById("search-btn").addEventListener("click", function () {
    const movieTitle = document.getElementById("title").value.trim();
    if (!movieTitle) {
        document.getElementById("movies-container").innerHTML = `<p class="error-msg">Please enter a movie title.</p>`;
        return;
    }
    fetchMovies(movieTitle);
});

// Fetch movies
function fetchMovies(query) {
    fetch(searchApi + query)
        .then(response => response.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
                document.getElementById("movies-container").innerHTML = `<p class="error-msg">No movies found. Try another title.</p>`;
                return;
            }

            // Save previous search results
            previousSearchResults.push(document.getElementById("movies-container").innerHTML);

            displayMovies(data.results);
        })
        .catch(error => {
            console.error("Fetch error:", error);
            document.getElementById("movies-container").innerHTML = `<p class="error-msg">Error fetching movies.</p>`;
        });
}

// Display movies
function displayMovies(movies) {
    const moviesContainer = document.getElementById("movies-container");
    moviesContainer.innerHTML = "";

    const movieGrid = document.createElement("div");
    movieGrid.classList.add("movie-grid");

    movies.slice(0, 6).forEach(movie => {
        if (!movie.poster_path) return;

        const movieElement = document.createElement("div");
        movieElement.classList.add("movie-card");

        movieElement.innerHTML = `
            <img src="${imgPath + movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.overview || "No description available."}</p>
                <p><strong>Director:</strong> <span id="director-${movie.id}">Loading...</span></p>
                <p><strong>Music Director:</strong> <span id="music-${movie.id}">Loading...</span></p>
                <button class="rec-btn" data-id="${movie.id}">Get Similar Movies</button>
            </div>
        `;

        movieGrid.appendChild(movieElement);
        fetchMovieDetails(movie.id);
    });

    moviesContainer.appendChild(movieGrid);
    addNavigationButtons();
    addSimilarMoviesListeners();
}

// Fetch director and music director
function fetchMovieDetails(movieId) {
    fetch(`${creditsApi}${movieId}/credits?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (!data.crew) {
                throw new Error("Invalid crew data");
            }

            document.getElementById(`director-${movieId}`).textContent = 
                data.crew.find(person => person.job.toLowerCase() === "director")?.name || "Unknown";
            document.getElementById(`music-${movieId}`).textContent = 
                data.crew.find(person => person.job.toLowerCase() === "original music composer")?.name || "Unknown";
        })
        .catch(error => {
            console.error("Credits fetch error:", error);
            document.getElementById(`director-${movieId}`).textContent = "Unknown";
            document.getElementById(`music-${movieId}`).textContent = "Unknown";
        });
}

// Fetch similar movies
function fetchSimilarMovies(movieId) {
    fetch(`${recommendApi}${movieId}/similar?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
                document.getElementById("recommendation-container").innerHTML = `<p class="error-msg">No similar movies found.</p>`;
                return;
            }

            // Save current screen before switching
            previousSearchResults.push(document.getElementById("movies-container").innerHTML);

            displaySimilarMovies(data.results);
        })
        .catch(error => {
            console.error("Fetch error:", error);
            document.getElementById("recommendation-container").innerHTML = `<p class="error-msg">Error fetching recommendations.</p>`;
        });
}

// Display similar movies
function displaySimilarMovies(movies) {
    const recommendationsContainer = document.getElementById("movies-container");
    recommendationsContainer.innerHTML = "";

    const recommendGrid = document.createElement("div");
    recommendGrid.classList.add("recommend-grid");

    movies.slice(0, 4).forEach(movie => {
        if (!movie.poster_path) return;

        const recElement = document.createElement("div");
        recElement.classList.add("recommend-movie");

        recElement.innerHTML = `
            <img src="${imgPath + movie.poster_path}" alt="${movie.title}">
            <div class="rec-info">
                <h4>${movie.title}</h4>
                <p>${movie.overview || "No description available."}</p>
            </div>
        `;

        recommendGrid.appendChild(recElement);
    });

    recommendationsContainer.appendChild(recommendGrid);
    addNavigationButtons();
}

// Add navigation buttons
function addNavigationButtons() {
    const moviesContainer = document.getElementById("movies-container");

    const navButtons = document.createElement("div");
    navButtons.classList.add("nav-buttons");

    // Previous button
    if (previousSearchResults.length > 0) {
        const previousBtn = document.createElement("button");
        previousBtn.textContent = "Previous";
        previousBtn.classList.add("nav-btn");
        previousBtn.addEventListener("click", goBack);
        navButtons.appendChild(previousBtn);
    }

    // Main Menu button
    const mainMenuBtn = document.createElement("button");
    mainMenuBtn.textContent = "Main Menu";
    mainMenuBtn.classList.add("nav-btn");
    mainMenuBtn.addEventListener("click", goToMainMenu);
    navButtons.appendChild(mainMenuBtn);

    moviesContainer.appendChild(navButtons);
}

// Go back to previous results
function goBack() {
    if (previousSearchResults.length > 0) {
        document.getElementById("movies-container").innerHTML = previousSearchResults.pop();
    }
}

// Return to main menu
function goToMainMenu() {
    previousSearchResults = [];
    document.getElementById("movies-container").innerHTML = `<p class="info-msg">Welcome! Search for a movie to get started.</p>`;
}

// Add event listeners for "Get Similar Movies" buttons
function addSimilarMoviesListeners() {
    document.querySelectorAll(".rec-btn").forEach(button => {
        button.addEventListener("click", function () {
            const movieId = this.getAttribute("data-id");
            fetchSimilarMovies(movieId);
        });
    });
}
