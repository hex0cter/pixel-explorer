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
    const imageUpload = document.getElementById('image-upload');
    const pixelCanvas = document.getElementById('pixel-canvas');
    
    console.log("Sample Image:", sampleImage);
    console.log("Zoom Area:", zoomArea);
    console.log("Zoomed View:", zoomedView);
    console.log("Zoom Slider:", zoomSlider);
    
    // Create a canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let imgLoaded = false;
    
    // Track dragging state
    let isDragging = false;
    
    // Initialize default zoom level
    let currentZoomLevel = parseInt(zoomSlider.value);
    console.log("Initial zoom level:", currentZoomLevel);
    
    // Add event handler for image upload
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file && file.type.match('image.*')) {
            console.log("User uploaded an image:", file.name);
            
            // Create a FileReader to read the image
            const reader = new FileReader();
            
            reader.onload = function(readerEvent) {
                // When the file is loaded, set it as the image source
                sampleImage.src = readerEvent.target.result;
                
                // Reset zoom position and level when a new image is loaded
                currentZoomLevel = parseInt(zoomSlider.value);
                zoomSlider.value = currentZoomLevel;
                
                // Reset the image loaded flag - the onload handler will set it back
                imgLoaded = false;
            };
            
            // Read the file as a data URL
            reader.readAsDataURL(file);
            
            // Show a confirmation message
            alert('Image uploaded successfully! Try zooming in to see the pixels.');
        } else {
            alert('Please select a valid image file.');
        }
    });
    
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
    
    // Prevent the sample image from being dragged by default
    sampleImage.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });
    
    // Replace continuous mousemove tracking with a drag-based system
    
    // Mouse down - start dragging
    zoomArea.addEventListener("mousedown", function(e) {
        e.preventDefault(); // Prevent text selection during drag
        isDragging = true;
        // Change cursor to indicate dragging
        zoomArea.style.cursor = "grabbing";
        // Stop the event from propagating to the image underneath
        e.stopPropagation();
    });
    
    // Add a mousedown event on the image to place the zoom area initially
    sampleImage.addEventListener("mousedown", function(e) {
        e.preventDefault(); // Prevent image dragging
        
        if (!imgLoaded) return;
        
        // Only allow placing the zoom area this way if not already dragging
        if (!isDragging) {
            const rect = sampleImage.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            updateZoomArea(x, y);
            
            // Start dragging immediately
            isDragging = true;
            zoomArea.style.cursor = "grabbing";
        }
    });
    
    // Mouse move - update position if dragging
    document.addEventListener("mousemove", function(e) {
        if (!imgLoaded || !isDragging) return;
        
        // Get the current pointer position relative to the image
        const rect = sampleImage.getBoundingClientRect();
        const canvasRect = pixelCanvas.getBoundingClientRect();
        
        // Check if cursor is within the image boundaries
        if (
            e.clientX >= rect.left && 
            e.clientX <= rect.right && 
            e.clientY >= rect.top && 
            e.clientY <= rect.bottom
        ) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            updateZoomArea(x, y);
        }
    });
    
    // Mouse up - stop dragging
    document.addEventListener("mouseup", function() {
        if (isDragging) {
            isDragging = false;
            zoomArea.style.cursor = "grab";
        }
    });
    
    // Add grab cursor initially
    zoomArea.style.cursor = "grab";

    // Handle zoom slider change
    zoomSlider.addEventListener("input", function () {
      currentZoomLevel = parseInt(zoomSlider.value);
      console.log("Zoom level changed to:", currentZoomLevel);

      // Update zoomed view with new zoom level
      updateZoomedView();
    });

    function updateZoomArea(x, y) {
      // Size of the red highlight box
      const zoomAreaSize = 50;

      // Position the zoom area exactly centered on the cursor position
      // Important: we position absolutely relative to the canvas-container
      const canvasContainer = document.getElementById("pixel-canvas");
      const canvasRect = canvasContainer.getBoundingClientRect();
      const imageRect = sampleImage.getBoundingClientRect();

      // Calculate the position relative to the canvas container
      // This ensures proper positioning regardless of any margins or padding
      const relativeX = x + (imageRect.left - canvasRect.left);
      const relativeY = y + (imageRect.top - canvasRect.top);

      // Set the position, ensuring the box stays within the image boundaries
      zoomArea.style.left = relativeX - zoomAreaSize / 2 + "px";
      zoomArea.style.top = relativeY - zoomAreaSize / 2 + "px";
      zoomArea.style.width = zoomAreaSize + "px";
      zoomArea.style.height = zoomAreaSize + "px";

      // Update the zoomed view
      updateZoomedView();
    }

    function updateZoomedView() {
      if (!imgLoaded) {
        console.log("Cannot update zoomed view - image not loaded");
        return;
      }

      console.log("Updating zoomed view with zoom level:", currentZoomLevel);

      // Get the position of the zoom area relative to the original image
      const rect = sampleImage.getBoundingClientRect();
      const zoomRect = zoomArea.getBoundingClientRect();

      // Calculate the center of the zoom area
      const centerX = zoomRect.left + zoomRect.width / 2 - rect.left;
      const centerY = zoomRect.top + zoomRect.height / 2 - rect.top;

      // Scale factors between the displayed image and the actual image
      const scaleX = sampleImage.naturalWidth / rect.width;
      const scaleY = sampleImage.naturalHeight / rect.height;

      // Calculate the corresponding position in the original image
      const imgX = Math.floor(centerX * scaleX);
      const imgY = Math.floor(centerY * scaleY);

      // Size of the area to sample from the original image
      // As zoom level increases, we sample a smaller area (more zoomed in)
      const baseSampleSize = 40; // Base sample size at zoom level 1
      const sampleSize = baseSampleSize / Math.max(1, currentZoomLevel);

      console.log(
        "Sample size:",
        sampleSize,
        "pixels at zoom level",
        currentZoomLevel
      );

      // Get canvas context for the zoomed view
      const zoomCtx = zoomedView.getContext("2d");

      // Clear the zoomed view
      zoomCtx.clearRect(0, 0, zoomedView.width, zoomedView.height);

      try {
        const maxZoomLevel = 40; // Maximum zoom level from the slider

        // For highest zoom level, render RGB subpixels
        if (currentZoomLevel === maxZoomLevel) {
          console.log("Using RGB subpixel rendering for maximum zoom");

          // Size of each pixel in the zoomed view
          const pixelSize = zoomedView.width / (sampleSize * 2);
          const subpixelWidth = pixelSize / 3; // Each subpixel is 1/3 the width of the full pixel

          // Draw each pixel from the sample area
          for (let y = 0; y < sampleSize * 2; y++) {
            for (let x = 0; x < sampleSize * 2; x++) {
              // Source coordinates in the original image
              const sourceX = Math.max(
                0,
                Math.min(canvas.width - 1, imgX - sampleSize + x)
              );
              const sourceY = Math.max(
                0,
                Math.min(canvas.height - 1, imgY - sampleSize + y)
              );

              try {
                // Get the color of this pixel
                const pixelData = ctx.getImageData(sourceX, sourceY, 1, 1).data;
                const red = pixelData[0];
                const green = pixelData[1];
                const blue = pixelData[2];

                // Calculate the position for this pixel
                const pixelX = Math.floor(x * pixelSize);
                const pixelY = Math.floor(y * pixelSize);

                // Draw three rectangles to represent RGB subpixels
                // Red subpixel (leftmost)
                zoomCtx.fillStyle = `rgb(${red}, 0, 0)`;
                zoomCtx.fillRect(pixelX, pixelY, subpixelWidth, pixelSize);

                // Green subpixel (middle)
                zoomCtx.fillStyle = `rgb(0, ${green}, 0)`;
                zoomCtx.fillRect(
                  pixelX + subpixelWidth,
                  pixelY,
                  subpixelWidth,
                  pixelSize
                );

                // Blue subpixel (rightmost)
                zoomCtx.fillStyle = `rgb(0, 0, ${blue})`;
                zoomCtx.fillRect(
                  pixelX + subpixelWidth * 2,
                  pixelY,
                  subpixelWidth,
                  pixelSize
                );

                // Draw grid lines for clarity
                zoomCtx.strokeStyle = "#888";
                zoomCtx.lineWidth = 0.5;
                zoomCtx.strokeRect(pixelX, pixelY, pixelSize, pixelSize);

                // Draw separators between subpixels
                zoomCtx.beginPath();
                zoomCtx.moveTo(pixelX + subpixelWidth, pixelY);
                zoomCtx.lineTo(pixelX + subpixelWidth, pixelY + pixelSize);
                zoomCtx.stroke();

                zoomCtx.beginPath();
                zoomCtx.moveTo(pixelX + subpixelWidth * 2, pixelY);
                zoomCtx.lineTo(pixelX + subpixelWidth * 2, pixelY + pixelSize);
                zoomCtx.stroke();
              } catch (e) {
                console.error("Error getting pixel data:", e);
              }
            }
          }
        }
        // For high zoom levels (but not maximum), show pixels as unified squares
        else if (currentZoomLevel > 10) {
          console.log("Using unified pixel rendering for high zoom");

          // Size of each pixel in the zoomed view
          const pixelSize = zoomedView.width / (sampleSize * 2);

          // Draw each pixel from the sample area
          for (let y = 0; y < sampleSize * 2; y++) {
            for (let x = 0; x < sampleSize * 2; x++) {
              // Source coordinates in the original image
              const sourceX = Math.max(
                0,
                Math.min(canvas.width - 1, imgX - sampleSize + x)
              );
              const sourceY = Math.max(
                0,
                Math.min(canvas.height - 1, imgY - sampleSize + y)
              );

              try {
                // Get the color of this pixel
                const pixelData = ctx.getImageData(sourceX, sourceY, 1, 1).data;
                const red = pixelData[0];
                const green = pixelData[1];
                const blue = pixelData[2];

                // Calculate the position for this pixel
                const pixelX = Math.floor(x * pixelSize);
                const pixelY = Math.floor(y * pixelSize);

                // Draw a single square with the combined RGB color
                zoomCtx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
                zoomCtx.fillRect(pixelX, pixelY, pixelSize, pixelSize);

                // Draw grid lines for very high zoom
                if (currentZoomLevel > 20) {
                  // Draw outline around the pixel
                  zoomCtx.strokeStyle = "#888";
                  zoomCtx.lineWidth = 0.5;
                  zoomCtx.strokeRect(pixelX, pixelY, pixelSize, pixelSize);
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
          const sourceX = Math.max(
            0,
            Math.min(canvas.width - sampleSize * 2, imgX - sampleSize)
          );
          const sourceY = Math.max(
            0,
            Math.min(canvas.height - sampleSize * 2, imgY - sampleSize)
          );
          const sourceWidth = Math.min(sampleSize * 2, canvas.width - sourceX);
          const sourceHeight = Math.min(
            sampleSize * 2,
            canvas.height - sourceY
          );

          console.log(
            "Source rectangle:",
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight
          );

          // Draw the sampled portion to the zoomed view
          zoomCtx.drawImage(
            canvas,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            zoomedView.width,
            zoomedView.height
          );

          // Add a crosshair to show the center point
          const centerX = zoomedView.width / 2;
          const centerY = zoomedView.height / 2;

          zoomCtx.strokeStyle = "rgba(255, 0, 0, 0.7)";
          zoomCtx.lineWidth = 1;

          // Draw crosshair
          zoomCtx.beginPath();
          zoomCtx.moveTo(centerX - 10, centerY);
          zoomCtx.lineTo(centerX + 10, centerY);
          zoomCtx.moveTo(centerX, centerY - 10);
          zoomCtx.lineTo(centerX, centerY + 10);
          zoomCtx.stroke();
        }
      } catch (e) {
        console.error("Error updating zoomed view:", e);
      }
    }

    // Create a default image to match sample-image.jpg if we don't have a sample
    function createDefaultImage() {
      // Match the dimensions of the actual sample-image.jpg (608x406)
      const width = 608;
      const height = 406;
      canvas.width = width;
      canvas.height = height;

      // Create a light blue sky gradient background
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      skyGradient.addColorStop(0, "#87CEEB"); // Light sky blue
      skyGradient.addColorStop(1, "#E0F7FA"); // Very light blue
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height * 0.6);

      // Create a green ground
      const groundGradient = ctx.createLinearGradient(
        0,
        height * 0.6,
        0,
        height
      );
      groundGradient.addColorStop(0, "#7CFC00"); // Bright green
      groundGradient.addColorStop(1, "#228B22"); // Forest green
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, height * 0.6, width, height * 0.4);

      // Add a sun
      ctx.fillStyle = "#FFD700"; // Gold
      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.2, 50, 0, Math.PI * 2);
      ctx.fill();

      // Draw sun rays
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const x1 = width * 0.8 + Math.cos(angle) * 60;
        const y1 = height * 0.2 + Math.sin(angle) * 60;
        const x2 = width * 0.8 + Math.cos(angle) * 80;
        const y2 = height * 0.2 + Math.sin(angle) * 80;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw a simple house
      // House body
      ctx.fillStyle = "#8B4513"; // SaddleBrown
      ctx.fillRect(width * 0.1, height * 0.4, width * 0.2, height * 0.3);

      // House roof
      ctx.fillStyle = "#A52A2A"; // Brown
      ctx.beginPath();
      ctx.moveTo(width * 0.05, height * 0.4);
      ctx.lineTo(width * 0.2, height * 0.25);
      ctx.lineTo(width * 0.35, height * 0.4);
      ctx.closePath();
      ctx.fill();

      // House door
      ctx.fillStyle = "#4B0082"; // Indigo
      ctx.fillRect(width * 0.17, height * 0.55, width * 0.06, height * 0.15);

      // House window
      ctx.fillStyle = "#87CEFA"; // Light sky blue
      ctx.fillRect(width * 0.13, height * 0.45, width * 0.05, height * 0.05);
      ctx.fillRect(width * 0.22, height * 0.45, width * 0.05, height * 0.05);

      // Draw a tree
      // Tree trunk
      ctx.fillStyle = "#8B4513"; // SaddleBrown
      ctx.fillRect(width * 0.7, height * 0.45, width * 0.05, height * 0.25);

      // Tree leaves
      ctx.fillStyle = "#006400"; // Dark green
      ctx.beginPath();
      ctx.arc(width * 0.725, height * 0.4, 40, 0, Math.PI * 2);
      ctx.fill();

      // Add some clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

      // Cloud 1
      drawCloud(ctx, width * 0.2, height * 0.15, 30);

      // Cloud 2
      drawCloud(ctx, width * 0.5, height * 0.1, 25);

      // Add title text
      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#2c3e50";
      ctx.textAlign = "center";
      ctx.fillText("How Screens Work", width / 2, height - 30);

      // Draw a pixelated grid overlay in one small corner to demonstrate pixels
      const gridSize = 10;
      const gridArea = 80;
      const gridX = width - gridArea - 20;
      const gridY = height - gridArea - 20;

      for (let x = 0; x < gridArea; x += gridSize) {
        for (let y = 0; y < gridArea; y += gridSize) {
          // Sample a color from the background
          const pixelData = ctx.getImageData(gridX + x, gridY + y, 1, 1).data;
          // Make the colors more vibrant for visibility
          const red = Math.min(pixelData[0] * 1.2, 255);
          const green = Math.min(pixelData[1] * 1.2, 255);
          const blue = Math.min(pixelData[2] * 1.2, 255);

          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fillRect(gridX + x, gridY + y, gridSize, gridSize);

          // Add grid lines
          ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
          ctx.strokeRect(gridX + x, gridY + y, gridSize, gridSize);
        }
      }

      // Draw a border around the pixelated area
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000";
      ctx.strokeRect(gridX, gridY, gridArea, gridArea);

      // Add a small label for the pixelated area
      ctx.font = "12px Arial";
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.fillText("Pixels", gridX + gridArea / 2, gridY - 5);

      // Convert the canvas to a data URL and set it as the source of the image
      sampleImage.src = canvas.toDataURL();
      console.log("Default image created with dimensions:", width, "x", height);

      // Helper function to draw a cloud
      function drawCloud(ctx, x, y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
        ctx.arc(x - size * 0.5, y + size * 0.4, size * 0.7, 0, Math.PI * 2);
        ctx.arc(x + size, y + size * 0.4, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
}

// ----- Color Mixer Implementation -----
function initColorMixer() {
  const redSlider = document.getElementById("red-slider");
  const greenSlider = document.getElementById("green-slider");
  const blueSlider = document.getElementById("blue-slider");

  const redValue = document.getElementById("red-value");
  const greenValue = document.getElementById("green-value");
  const blueValue = document.getElementById("blue-value");

  const colorDisplay = document.getElementById("color-display");
  const pixelGridContainer = document.getElementById("pixel-grid-container");

  // Create pixel grid
  createPixelGrid();

  // Update color on slider change
  [redSlider, greenSlider, blueSlider].forEach((slider) => {
    slider.addEventListener("input", updateColor);
  });

  // Initial color update
  updateColor();

  // Create a grid of pixels with RGB subpixels
  function createPixelGrid() {
    pixelGridContainer.innerHTML = "";

    // Create a perfect 8x8 grid of "pixels" (64 total)
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const pixelContainer = document.createElement("div");
        pixelContainer.classList.add("pixel-container");

        // Create the three RGB subpixels for each pixel
        const redSubpixel = document.createElement("div");
        redSubpixel.classList.add("subpixel", "red-subpixel");

        const greenSubpixel = document.createElement("div");
        greenSubpixel.classList.add("subpixel", "green-subpixel");

        const blueSubpixel = document.createElement("div");
        blueSubpixel.classList.add("subpixel", "blue-subpixel");

        // Add subpixels to the pixel container
        pixelContainer.appendChild(redSubpixel);
        pixelContainer.appendChild(greenSubpixel);
        pixelContainer.appendChild(blueSubpixel);

        // Add the pixel to the grid
        pixelGridContainer.appendChild(pixelContainer);
      }
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

    // Create color string for the main color display
    const colorStr = `rgb(${red}, ${green}, ${blue})`;

    // Update the color display
    colorDisplay.style.backgroundColor = colorStr;

    // Update the pixel grid to show RGB components
    updatePixelGrid(parseInt(red), parseInt(green), parseInt(blue));
  }

  // Show RGB subpixels in the pixel grid
  function updatePixelGrid(r, g, b) {
    // Select all subpixels
    const redSubpixels = pixelGridContainer.querySelectorAll(".red-subpixel");
    const greenSubpixels =
      pixelGridContainer.querySelectorAll(".green-subpixel");
    const blueSubpixels = pixelGridContainer.querySelectorAll(".blue-subpixel");

    // Update each subpixel with its corresponding color intensity
    redSubpixels.forEach((subpixel) => {
      subpixel.style.backgroundColor = `rgb(${r}, 0, 0)`;
      // Adjust brightness for better visibility
      subpixel.style.opacity = r > 50 ? "1.0" : "0.9";
    });

    greenSubpixels.forEach((subpixel) => {
      subpixel.style.backgroundColor = `rgb(0, ${g}, 0)`;
      subpixel.style.opacity = g > 50 ? "1.0" : "0.9";
    });

    blueSubpixels.forEach((subpixel) => {
      subpixel.style.backgroundColor = `rgb(0, 0, ${b})`;
      subpixel.style.opacity = b > 50 ? "1.0" : "0.9";
    });
  }
}

// ----- Resolution Explorer Implementation -----
function initResolutionExplorer() {
  const resolutionSelector = document.getElementById("resolution-selector");
  const resolutionDisplay = document.getElementById("resolution-display");

  // Use an actual image element instead of background-image
  const displayImage = document.createElement("img");
  displayImage.style.maxWidth = "100%";
  displayImage.style.maxHeight = "300px";
  displayImage.style.display = "block";
  displayImage.style.margin = "0 auto";

  // Add the image to the display container
  resolutionDisplay.appendChild(displayImage);

  // Set default image path
  const imagePath = "img/sample-image.jpg";

  // Original image for resolution manipulation
  const originalImage = new Image();
  originalImage.crossOrigin = "Anonymous"; // To prevent CORS issues with canvas

  originalImage.onload = function () {
    console.log("Resolution Explorer: Original image loaded successfully!");
    console.log(
      "Image dimensions:",
      originalImage.width,
      "x",
      originalImage.height
    );
    updateResolution();
  };

  originalImage.onerror = function () {
    console.error("Error loading sample image, creating placeholder");
    createPlaceholderImage();
  };

  // Start loading the image
  originalImage.src = imagePath;

  // Handle resolution selector change
  resolutionSelector.addEventListener("change", updateResolution);

  // Update the displayed image based on selected resolution
  function updateResolution() {
    const resolution = resolutionSelector.value;
    console.log("Changing resolution to:", resolution);

    // Define scaling factors for different resolutions
    const scalingFactors = {
      high: 1.0, // Original resolution (100%)
      medium: 0.5, // Medium resolution (50%)
      low: 0.25, // Low resolution (25%)
      "very-low": 0.1, // Very low resolution (10%)
    };

    // Get scaling factor based on selected resolution
    const scaleFactor = scalingFactors[resolution];

    // Create canvas for manipulation
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Downscale
    const downWidth = Math.max(
      4,
      Math.floor(originalImage.width * scaleFactor)
    );
    const downHeight = Math.max(
      4,
      Math.floor(originalImage.height * scaleFactor)
    );

    console.log("Downsampling to:", downWidth, "x", downHeight);

    // First draw at a small size (downsampling)
    canvas.width = downWidth;
    canvas.height = downHeight;
    ctx.drawImage(originalImage, 0, 0, downWidth, downHeight);

    // Then change canvas size to original and draw without smoothing (upsampling)
    const tempData = ctx.getImageData(0, 0, downWidth, downHeight);
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.imageSmoothingEnabled = false; // Ensures pixelated look

    // Put back the small version
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = downWidth;
    tempCanvas.height = downHeight;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.putImageData(tempData, 0, 0);

    // Draw it scaled up
    ctx.drawImage(
      tempCanvas,
      0,
      0,
      downWidth,
      downHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Update the display image
    try {
      const imageUrl = canvas.toDataURL();
      console.log("Generated image URL for resolution:", resolution);
      displayImage.src = imageUrl;
      console.log("Image source set with new resolution");
    } catch (e) {
      console.error("Error creating image URL:", e);
    }
  }

  // Create a placeholder image if the sample image fails to load
  function createPlaceholderImage() {
    console.log("Creating placeholder image for Resolution Explorer");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 600;

    // Create gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#3498db");
    gradient.addColorStop(1, "#2ecc71");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add shapes
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f39c12";
    ctx.fillRect(canvas.width / 4, canvas.height / 4, 150, 150);

    ctx.fillStyle = "#9b59b6";
    ctx.beginPath();
    ctx.moveTo((canvas.width * 3) / 4, canvas.height / 4);
    ctx.lineTo((canvas.width * 3) / 4 + 150, canvas.height / 4);
    ctx.lineTo((canvas.width * 3) / 4 + 75, canvas.height / 4 + 150);
    ctx.closePath();
    ctx.fill();

    // Draw text
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Resolution Demo", canvas.width / 2, 100);

    // Assign the generated image to our original image
    originalImage.src = canvas.toDataURL();
    console.log("Placeholder image created successfully");
  }
}
