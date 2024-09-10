document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('content');

    // Load content based on the initial URL
    const path = window.location.pathname.substring(1); // Remove leading '/'
    loadContent(path);

    // Handle navigation clicks
    document.querySelectorAll('nav a').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const content = event.target.dataset.content;
            history.pushState(null, '', `/${content}`);
            loadContent(content);
        });
    });

    // Function to load content via fetch
    function loadContent(page) {
        fetch(`/pages/${page}.html`)
            .then((response) => response.text())
            .then((html) => {
                mainContent.innerHTML = html;
            })
            .catch(() => {
                mainContent.innerHTML = '<p>Content not found.</p>';
            });
    }
});
