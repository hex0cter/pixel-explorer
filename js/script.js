document.addEventListener('DOMContentLoaded', function() {
    // Start button functionality
    const startButton = document.getElementById('start-button');
    const introSection = document.getElementById('introduction');
    const gameContainer = document.getElementById('game-container');

    // Skip the welcome screen and show game container directly
    introSection.classList.add('hidden');
    gameContainer.classList.remove('hidden');

    // Keep the click handler for the start button in case it's needed
    startButton.addEventListener('click', function() {
        introSection.classList.add('hidden');
        gameContainer.classList.remove('hidden');
    });

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const gameAreas = document.querySelectorAll('.game-area');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            gameAreas.forEach(area => area.classList.remove('active'));

            // Add active class to current tab and corresponding content
            const tabId = this.getAttribute('data-tab');
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // ----- Pixel Zoom Feature -----
    initPixelZoom();

    // ----- Color Mixer Feature -----
    initColorMixer();

    // ----- Resolution Explorer Feature -----
    initResolutionExplorer();
});

// ----- Pixel Zoom Implementation -----
function initPixelZoom() {
    console.log("Initializing Pixel Zoom");
    const sampleImage = document.getElementById('sample-image');
    const zoomArea = document.getElementById('zoom-area');
    const zoomedView = document.getElementById('zoomed-view');
    const zoomSlider = document.getElementById('zoom-slider');
    
    console.log("Sample Image:", sampleImage);
    console.log("Zoom Area:", zoomArea);
    console.log("Zoomed View:", zoomedView);
    console.log("Zoom Slider:", zoomSlider);
    
    // Create a canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let imgLoaded = false;
    
    // Initialize default zoom level
    let currentZoomLevel = parseInt(zoomSlider.value);
    console.log("Initial zoom level:", currentZoomLevel);
    
    // Load the sample image
    console.log("Setting up image load handler");
    sampleImage.onload = function() {
        console.log("Image loaded:", sampleImage.src);
        console.log("Natural size:", sampleImage.naturalWidth, "x", sampleImage.naturalHeight);
        
        // Set canvas size to match image dimensions
        canvas.width = sampleImage.naturalWidth;
        canvas.height = sampleImage.naturalHeight;
        
        // Draw the image to the canvas for pixel manipulation
        ctx.drawImage(sampleImage, 0, 0);
        
        imgLoaded = true;
        
        // Initialize zoom area position
        const rect = sampleImage.getBoundingClientRect();
        updateZoomArea(rect.width / 2, rect.height / 2);
        
        // Force initial zoomed view
        updateZoomedView();
    };
    
    // If the image source is missing, create a default image
    if (!sampleImage.src || sampleImage.src.endsWith('sample-image.jpg')) {
        console.log("Creating default image");
        createDefaultImage();
    } else {
        console.log("Using existing image:", sampleImage.src);
        // Add error handler in case the image fails to load
        sampleImage.onerror = function() {
            console.log("Error loading image, creating default");
            createDefaultImage();
        };
    }
    
    // Force generate default image regardless to ensure it works
    setTimeout(function() {
        if (!imgLoaded) {
            console.log("Image didn't load in time, creating default");
            createDefaultImage();
        }
    }, 1000); // Wait 1 second, then check if image loaded
    
    // Handle mouse movement over the sample image
    sampleImage.addEventListener('mousemove', function(e) {
        if (!imgLoaded) {
            console.log("Image not loaded yet, skipping mousemove");
            return;
        }
        
        const rect = sampleImage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        updateZoomArea(x, y);
    });
    
    // Handle zoom slider change
    zoomSlider.addEventListener('input', function() {
        currentZoomLevel = parseInt(zoomSlider.value);
        console.log("Zoom level changed to:", currentZoomLevel);
        
        updateZoomedView();
    });
    
    function updateZoomArea(x, y) {
        // Get base image dimensions
        const rect = sampleImage.getBoundingClientRect();
        
        // Size and position of the red highlight box
        const zoomAreaSize = 50;
        zoomArea.style.left = Math.max(0, Math.min(rect.width - zoomAreaSize, x - zoomAreaSize / 2)) + 'px';
        zoomArea.style.top = Math.max(0, Math.min(rect.height - zoomAreaSize, y - zoomAreaSize / 2)) + 'px';
        zoomArea.style.width = zoomAreaSize + 'px';
        zoomArea.style.height = zoomAreaSize + 'px';
        
        // Update zoomed view based on current position
        updateZoomedView();
    }
    
    function updateZoomedView() {
        if (!imgLoaded) {
            console.log("Cannot update zoomed view - image not loaded");
            return;
        }
        
        console.log("Updating zoomed view");
        
        // Get the position of the zoom area relative to the original image
        const rect = sampleImage.getBoundingClientRect();
        const zoomRect = zoomArea.getBoundingClientRect();
        
        // Calculate the center of the zoom area
        const centerX = (zoomRect.left + zoomRect.width / 2) - rect.left;
        const centerY = (zoomRect.top + zoomRect.height / 2) - rect.top;
        
        console.log("Zoom center (relative to image):", centerX, centerY);
        
        // Scale factors between the displayed image and the actual image
        const scaleX = sampleImage.naturalWidth / rect.width;
        const scaleY = sampleImage.naturalHeight / rect.height;
        
        // Calculate the corresponding position in the original image
        const imgX = Math.floor(centerX * scaleX);
        const imgY = Math.floor(centerY * scaleY);
        
        console.log("Image coordinates:", imgX, imgY);
        
        // Size of the area to sample from the original image
        // As zoom level increases, we sample a smaller area
        const sampleSize = Math.max(2, Math.min(40, sampleImage.naturalWidth / currentZoomLevel / 2));
        
        console.log("Sample size:", sampleSize, "pixels at zoom level", currentZoomLevel);
        
        // Get canvas context for the zoomed view
        const zoomCtx = zoomedView.getContext('2d');
        
        // Clear the zoomed view
        zoomCtx.clearRect(0, 0, zoomedView.width, zoomedView.height);
        
        try {
            // For higher zoom levels, render individual pixels
            if (currentZoomLevel > 10) {
                console.log("Using pixel-by-pixel rendering for high zoom");
                
                // Size of each pixel in the zoomed view
                const pixelSize = zoomedView.width / (sampleSize * 2);
                
                // Draw each pixel from the sample area
                for (let y = 0; y < sampleSize * 2; y++) {
                    for (let x = 0; x < sampleSize * 2; x++) {
                        // Source coordinates in the original image
                        const sourceX = Math.max(0, Math.min(canvas.width - 1, imgX - sampleSize + x));
                        const sourceY = Math.max(0, Math.min(canvas.height - 1, imgY - sampleSize + y));
                        
                        try {
                            // Get the color of this pixel
                            const pixelData = ctx.getImageData(sourceX, sourceY, 1, 1).data;
                            
                            // Set the fill style to this pixel's color
                            zoomCtx.fillStyle = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
                            
                            // Draw a rectangle representing this pixel
                            zoomCtx.fillRect(
                                Math.floor(x * pixelSize),
                                Math.floor(y * pixelSize),
                                Math.ceil(pixelSize),
                                Math.ceil(pixelSize)
                            );
                            
                            // Draw grid lines for very high zoom
                            if (currentZoomLevel > 20) {
                                zoomCtx.strokeStyle = '#888';
                                zoomCtx.lineWidth = 0.5;
                                zoomCtx.strokeRect(
                                    Math.floor(x * pixelSize),
                                    Math.floor(y * pixelSize),
                                    Math.ceil(pixelSize),
                                    Math.ceil(pixelSize)
                                );
                            }
                        } catch (e) {
                            console.error("Error getting pixel data:", e);
                        }
                    }
                }
            } else {
                // For lower zoom levels, use drawImage for better performance
                console.log("Using drawImage for low zoom");
                
                // Calculate the source rectangle to sample from the original image
                const sourceX = Math.max(0, Math.min(canvas.width - sampleSize * 2, imgX - sampleSize));
                const sourceY = Math.max(0, Math.min(canvas.height - sampleSize * 2, imgY - sampleSize));
                const sourceWidth = Math.min(sampleSize * 2, canvas.width - sourceX);
                const sourceHeight = Math.min(sampleSize * 2, canvas.height - sourceY);
                
                console.log("Source rectangle:", sourceX, sourceY, sourceWidth, sourceHeight);
                
                // Draw the sampled portion to the zoomed view
                zoomCtx.drawImage(
                    canvas,
                    sourceX, sourceY, sourceWidth, sourceHeight,
                    0, 0, zoomedView.width, zoomedView.height
                );
            }
        } catch (e) {
            console.error("Error updating zoomed view:", e);
        }
    }

    // Create a default colorful image if we don't have a sample
    function createDefaultImage() {
        const width = 300;
        const height = 200;
        canvas.width = width;
        canvas.height = height;

        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#FF5F6D");
        gradient.addColorStop(1, "#FFC371");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add shapes
        ctx.fillStyle = "rgba(66, 133, 244, 0.8)";
        ctx.beginPath();
        ctx.arc(width/4, height/2, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(219, 68, 55, 0.8)";
        ctx.beginPath();
        ctx.arc(width * 3/4, height/2, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(15, 157, 88, 0.8)";
        ctx.beginPath();
        ctx.arc(width/2, height/2, 50, 0, Math.PI * 2);
        ctx.fill();

        // Draw some text for testing the pixel zoom
        ctx.font = "bold 24px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Pixel Zoom Demo", width/2, height - 30);

        // Convert the canvas to a data URL and set it as the source of the image
        sampleImage.src = canvas.toDataURL();
        console.log("Default image created");
    }
}

// ----- Color Mixer Implementation -----
function initColorMixer() {
    const redSlider = document.getElementById('red-slider');
    const greenSlider = document.getElementById('green-slider');
    const blueSlider = document.getElementById('blue-slider');
    
    const redValue = document.getElementById('red-value');
    const greenValue = document.getElementById('green-value');
    const blueValue = document.getElementById('blue-value');
    
    const colorDisplay = document.getElementById('color-display');
    const pixelGridContainer = document.getElementById('pixel-grid-container');
    
    // Create pixel grid
    createPixelGrid();
    
    // Update color on slider change
    [redSlider, greenSlider, blueSlider].forEach(slider => {
        slider.addEventListener('input', updateColor);
    });
    
    // Initial color update
    updateColor();
    
    // Create a 10x10 grid of "pixels"
    function createPixelGrid() {
        pixelGridContainer.innerHTML = '';
        for (let i = 0; i < 100; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            pixelGridContainer.appendChild(pixel);
        }
    }
    
    // Update the color display based on RGB values
    function updateColor() {
        const red = redSlider.value;
        const green = greenSlider.value;
        const blue = blueSlider.value;
        
        // Update the value displays
        redValue.textContent = red;
        greenValue.textContent = green;
        blueValue.textContent = blue;
        
        // Create color string
        const colorStr = `rgb(${red}, ${green}, ${blue})`;
        
        // Update the color display
        colorDisplay.style.backgroundColor = colorStr;
        
        // Update the pixel grid to show RGB components
        updatePixelGrid(parseInt(red), parseInt(green), parseInt(blue));
    }
    
    // Show RGB subpixels in the pixel grid
    function updatePixelGrid(r, g, b) {
        const pixels = pixelGridContainer.querySelectorAll('.pixel');
        
        pixels.forEach((pixel, index) => {
            // Create a pattern with R, G, B subpixels
            if (index % 3 === 0) {
                // Red subpixel
                pixel.style.backgroundColor = `rgb(${r}, 0, 0)`;
            } else if (index % 3 === 1) {
                // Green subpixel
                pixel.style.backgroundColor = `rgb(0, ${g}, 0)`;
            } else {
                // Blue subpixel
                pixel.style.backgroundColor = `rgb(0, 0, ${b})`;
            }
            
            // Brighten the colors slightly to make them more visible
            pixel.style.opacity = '0.9';
        });
    }
}

// ----- Resolution Explorer Implementation -----
function initResolutionExplorer() {
    const resolutionSelector = document.getElementById('resolution-selector');
    const resolutionDisplay = document.getElementById('resolution-display');
    
    // Create canvas for drawing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Original image for resolution manipulation
    const originalImage = new Image();
    originalImage.onload = function() {
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);
        updateResolution();
    };
    
    // Set default image or use a placeholder
    originalImage.src = 'img/sample-image.jpg';
    originalImage.onerror = function() {
        createPlaceholderImage();
    };
    
    // Handle resolution selector change
    resolutionSelector.addEventListener('change', updateResolution);
    
    // Update the displayed image based on selected resolution
    function updateResolution() {
        const resolution = resolutionSelector.value;
        
        // Define scaling factors for different resolutions
        const scalingFactors = {
            'high': 1.0,     // Original resolution (100%)
            'medium': 0.5,   // Medium resolution (50%)
            'low': 0.25,     // Low resolution (25%)
            'very-low': 0.1  // Very low resolution (10%)
        };
        
        // Get scaling factor based on selected resolution
        const scaleFactor = scalingFactors[resolution];
        
        // Create a temp canvas for down-sampling and up-sampling
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Down-sample the original image
        const downWidth = Math.max(4, Math.floor(canvas.width * scaleFactor));
        const downHeight = Math.max(4, Math.floor(canvas.height * scaleFactor));
        
        tempCanvas.width = downWidth;
        tempCanvas.height = downHeight;
        
        // Draw the original image at reduced resolution
        tempCtx.drawImage(originalImage, 0, 0, downWidth, downHeight);
        
        // Now up-sample back to original size to show pixelation
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        // Use nearest-neighbor sampling for a pixelated look
        tempCtx.imageSmoothingEnabled = false;
        
        // Draw the down-sampled image back at the original size
        tempCtx.drawImage(
            tempCanvas, 
            0, 0, downWidth, downHeight, 
            0, 0, canvas.width, canvas.height
        );
        
        // Set the image as background of the display area
        resolutionDisplay.style.backgroundImage = `url(${tempCanvas.toDataURL()})`;
    }
    
    // Create a placeholder image for demonstration
    function createPlaceholderImage() {
        canvas.width = 800;
        canvas.height = 600;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#3498db");
        gradient.addColorStop(1, "#2ecc71");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some shapes for visual interest
        ctx.fillStyle = "#e74c3c";
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, 100, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#f39c12";
        ctx.fillRect(canvas.width/4, canvas.height/4, 150, 150);
        
        ctx.fillStyle = "#9b59b6";
        ctx.beginPath();
        ctx.moveTo(canvas.width*3/4, canvas.height/4);
        ctx.lineTo(canvas.width*3/4 + 150, canvas.height/4);
        ctx.lineTo(canvas.width*3/4 + 75, canvas.height/4 + 150);
        ctx.closePath();
        ctx.fill();
        
        // Draw some text
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Resolution Demo", canvas.width/2, 100);
        
        // Set as original image for processing
        originalImage.src = canvas.toDataURL();
    }
}
