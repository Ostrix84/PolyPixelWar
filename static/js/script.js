document.addEventListener('DOMContentLoaded', function() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF', '#FFA500', '#800080'];
    const grid = document.getElementById('grid');
    const menu = document.getElementById('menu');
    let selectedColor = colors[0];
    let zoomLevel = 1;

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
                for (let y = 0; y < 44; y++) {
                    for (let x = 0; x < 85; x++) {
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

    // Add zoom functionality
    grid.addEventListener('wheel', function(event) {
        event.preventDefault();

        const rect = grid.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const offsetXPercent = offsetX / rect.width;
        const offsetYPercent = offsetY / rect.height;

        if (event.deltaY < 0) {
            zoomLevel = Math.min(zoomLevel + 0.1, 3);
        } else {
            zoomLevel = Math.max(zoomLevel - 0.1, 1);
        }

        updateZoom(offsetXPercent, offsetYPercent);
    });

    function updateZoom(offsetXPercent, offsetYPercent) {
        const pixelSize = 20 * zoomLevel;
        grid.style.transform = `scale(${zoomLevel})`;
        grid.style.transformOrigin = `${offsetXPercent * 100}% ${offsetYPercent * 100}%`;

    

        // Adjust scroll position to zoom in on mouse pointer
        const gridRect = grid.getBoundingClientRect();
        const newScrollLeft = grid.scrollWidth * offsetXPercent - (gridRect.width / 2);
        const newScrollTop = grid.scrollHeight * offsetYPercent - (gridRect.height / 2);
        grid.scrollLeft = newScrollLeft;
        grid.scrollTop = newScrollTop;
    }

    // Function to display the countdown timer
    function updateTimer(timeLeft) {
        const timerElement = document.getElementById('timer');
        if (timeLeft > 0) {
            timerElement.textContent = timeLeft;
        } else {
            timerElement.textContent = 'Pixel!';
        }
    }

    // Function to get the time remaining before placing another pixel
    function fetchTimeLeft() {
        fetch('/can_place_pixel/')
            .then(response => response.json())
            .then(data => {
                if (data.can_place_pixel === false) {
                    const nextAllowedPlacement = new Date(data.next_allowed_placement);
                    const currentTime = new Date();
                    const timeLeft = Math.ceil((nextAllowedPlacement - currentTime) / 1000); // Convert to seconds
                    updateTimer(timeLeft);
                } else {
                    updateTimer(0); // No time remaining, hide the timer
                }
            });
    }

    // Update the time remaining every second
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
});
