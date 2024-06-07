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

    // Fetch existing pixels
    fetch('/get_pixels/')
        .then(response => response.json())
        .then(data => {
            data.forEach(pixel => {
                const pixelDiv = document.querySelector(`[data-x='${pixel.x}'][data-y='${pixel.y}']`);
                if (pixelDiv) {
                    pixelDiv.style.backgroundColor = pixel.color;
                }
            });
        });

    // Create grid
    for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 50; x++) {
            const pixelDiv = document.createElement('div');
            pixelDiv.className = 'pixel';
            pixelDiv.dataset.x = x;
            pixelDiv.dataset.y = y;
            grid.appendChild(pixelDiv);
        }
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
