let isTransitioning = false;

function load(event) {
    event.preventDefault();
    
    if (isTransitioning) return;
    isTransitioning = true;
    
    const destination = event.target.closest('a').href;
    
    // Start the transition sequence
    startTransition(destination);
}

function deleteplayerdata() {
    event.preventDefault();
    
    if (isTransitioning) return;
    isTransitioning = true;
    
    const destination = event.target.closest('a').href;
    
    // Remove player data
    localStorage.removeItem("playerData");
    
    // Start the transition sequence
    startTransition(destination);
}

function startTransition(destination) {
    // Phase 1: Stagger the element animations for smooth flow
    setTimeout(() => {
        document.querySelector('h1').style.transitionDelay = '0s';
        document.querySelector('.index').classList.add('move-up');
    }, 50);
    
    setTimeout(() => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach((button, index) => {
            button.style.transitionDelay = `${index * 0.1}s`;
        });
    }, 100);
    
    setTimeout(() => {
        document.querySelector('p').style.transitionDelay = '0.2s';
    }, 150);
    
    // Phase 2: Start background and overlay transition
    setTimeout(() => {
        document.body.classList.add('move-up');
        document.querySelector('#page-transition-overlay').classList.add('fade-in');
    }, 200);
    
    // Phase 3: Enhanced overlay effect
    setTimeout(() => {
        const overlay = document.querySelector('#page-transition-overlay');
        overlay.style.background = 'linear-gradient(45deg, #000000, #1a1a1a, #000000)';
        overlay.style.animation = 'pulse 0.3s ease-in-out';
    }, 800);
    
    // Phase 4: Navigate to new page
    setTimeout(() => {
        window.location.href = destination;
    }, 1200);
}

// Add CSS for the pulse animation dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    .smooth-transition {
        will-change: transform, opacity;
    }
`;
document.head.appendChild(style);

// Add performance optimization
document.addEventListener('DOMContentLoaded', () => {
    // Preload elements for better performance
    const elements = document.querySelectorAll('h1, button, p, #page-transition-overlay');
    elements.forEach(el => {
        el.classList.add('smooth-transition');
    });
});