document.addEventListener('DOMContentLoaded', () => {
    // Function to load content into the main section
    function loadContent(url) {
        fetch(url)
            .then((response) => response.text())
            .then((content) => {
                document.getElementById('content').innerHTML = content;
            })
            .catch((error) => console.error('Error loading content:', error));
    }

    // Determine the current page based on the URL
    const page = window.location.pathname.split('/').pop();
    // Load the content, defaulting to home.html if no page is specified
    console.log(page);
    loadContent(page === '' ? 'home.html' : page);
});
