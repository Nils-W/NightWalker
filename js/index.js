function load(event) {
    // Prevent the default link behavior so the page doesn't change immediately.
    event.preventDefault();

    // Get the destination URL from the link that was clicked.
    const destination = event.currentTarget.href;

    // Find the overlay element in the DOM.
    const overlay = document.getElementById('page-transition-overlay');

    // Add the 'fade-in' class to the overlay to trigger the CSS transition.
    overlay.classList.add('fade-in');

    // Player Loading shit here:






    

    // Wait for the animation to finish (500ms), then navigate to the new page.
    setTimeout(() => {
        window.location.href = destination;
    }, 500); // This duration should match the transition-duration in your CSS.
}