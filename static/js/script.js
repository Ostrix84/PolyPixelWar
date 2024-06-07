// static/js/script.js

document.addEventListener('DOMContentLoaded', function() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF', '#FFA500', '#800080'];
    const grid = document.getElementById('grid');
    const menu = document.getElementById('menu');
    let selectedColor = colors[0];

    // Create color options in menu
    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color-option';
        colorDiv.style.backgroundColor = color;
        colorDiv.addEventListener('click', function() {
            selectedColor = color;
            document.querySelectorAll('.color-option').forEach(option => option.classList.remove('selected'));
            colorDiv.classList.add('selected');
        });
        menu.appendChild(colorDiv);
    });

    // Mark the first color as selected
    menu.firstChild.classList.add('selected');

    // Fetch existing pixels and render
    fetchAndRenderPixels();

    // Refresh pixels every 5 seconds
    setInterval(fetchAndRenderPixels, 5000);

    function fetchAndRenderPixels() {
        fetch('/get_pixels/')
            .then(response => response.json())
            .then(data => {
                // Clear existing pixels
                grid.innerHTML = '';

                // Render empty grid
                for (let y = 0; y < 40; y++) {
                    for (let x = 0; x < 90; x++) {
                        const pixelDiv = document.createElement('div');
                        pixelDiv.className = 'pixel';
                        pixelDiv.dataset.x = x;
                        pixelDiv.dataset.y = y;
                        grid.appendChild(pixelDiv);
                    }
                }

                // Render colored pixels
                data.forEach(pixel => {
                    const pixelDiv = document.querySelector(`[data-x='${pixel.x}'][data-y='${pixel.y}']`);
                    if (pixelDiv) {
                        pixelDiv.style.backgroundColor = pixel.color;
                    }
                });
            });
    }

    // Add click event to pixels
    grid.addEventListener('click', function(event) {
        if (event.target.className === 'pixel') {
            const x = event.target.dataset.x;
            const y = event.target.dataset.y;

            fetch('/place_pixel/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({x: x, y: y, color: selectedColor})
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    event.target.style.backgroundColor = selectedColor;
                } else {
                    alert(data.error);
                }
            });
        }
    });
});



// Fonction pour afficher le timer de décompte
function updateTimer(timeLeft) {
    const timerElement = document.getElementById('timer');
    if (timeLeft > 0) {
        timerElement.textContent = timeLeft;
    } else {
        timerElement.textContent = 'Pixel !'; // Cache le timer quand le temps est écoulé
    }
}

// Fonction pour obtenir le temps restant avant de pouvoir placer un autre pixel
function fetchTimeLeft() {
    fetch('/can_place_pixel/')
        .then(response => response.json())
        .then(data => {
            if (data.can_place_pixel === false) {
                const nextAllowedPlacement = new Date(data.next_allowed_placement);
                const currentTime = new Date();
                const timeLeft = Math.ceil((nextAllowedPlacement - currentTime) / 1000); // Convertit en secondes
                updateTimer(timeLeft);
            } else {
                updateTimer(0); // Aucun temps restant, masque le timer
            }
        });
}

// Actualiser le temps restant toutes les secondes
setInterval(fetchTimeLeft, 1000);


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
