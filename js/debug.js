// Debug script to fix the zoom area positioning
document.addEventListener('DOMContentLoaded', function() {
    console.log("Direct fix script loaded");
    
    // Get elements
    const sampleImage = document.getElementById('sample-image');
    const zoomArea = document.getElementById('zoom-area');
    const pixelCanvas = document.getElementById('pixel-canvas');
    const zoomedView = document.getElementById('zoomed-view');
    
    // Variables to track the current mouse position for zooming
    let currentMouseX = 0;
    let currentMouseY = 0;
    
    // Make zoom area visible
    if (zoomArea) {
        zoomArea.style.display = 'block';
    }
    
    // Create a canvas for image processing directly in our debug script
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Initialize the canvas when the image is loaded
    if (sampleImage.complete) {
        initializeCanvas();
    } else {
        sampleImage.onload = initializeCanvas;
    }
    
    function initializeCanvas() {
        // Set canvas size to match image dimensions
        canvas.width = sampleImage.naturalWidth;
        canvas.height = sampleImage.naturalHeight;
        
        // Draw the image to the canvas for pixel manipulation
        ctx.drawImage(sampleImage, 0, 0);
        console.log("Debug canvas initialized with dimensions:", canvas.width, "x", canvas.height);
    }
    
    // Replace the mousemove handler with our own direct implementation
    if (sampleImage) {
        // Remove any existing event listeners (not possible directly, but we'll override)
        // Add our own direct mousemove handler
        sampleImage.onmousemove = function(e) {
            // Get accurate cursor position relative to the image
            const rect = sampleImage.getBoundingClientRect();
            const canvasRect = pixelCanvas.getBoundingClientRect();
            
            // Calculate the position relative to the image
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Save current mouse position
            currentMouseX = x;
            currentMouseY = y;
            
            // Get relative position to canvas container
            const relativeX = (e.clientX - canvasRect.left);
            const relativeY = (e.clientY - canvasRect.top);
            
            // Direct positioning on the canvas
            zoomArea.style.left = relativeX + 'px';
            zoomArea.style.top = relativeY + 'px';
            
            // Update the zoomed view directly using our version
            fixedUpdateZoomedView();
        };
        
        // Also override the click handler for testing
        sampleImage.onclick = function(e) {
            // Same code as mousemove for consistency
            const rect = sampleImage.getBoundingClientRect();
            const canvasRect = pixelCanvas.getBoundingClientRect();
            const relativeX = (e.clientX - canvasRect.left);
            const relativeY = (e.clientY - canvasRect.top);
            
            // Save current mouse position
            currentMouseX = e.clientX - rect.left;
            currentMouseY = e.clientY - rect.top;
            
            // Direct positioning on the canvas
            zoomArea.style.left = relativeX + 'px';
            zoomArea.style.top = relativeY + 'px';
            
            // Force update with our fixed version
            fixedUpdateZoomedView();
        };
    }
    
    // Our own fixed version of the updateZoomedView function
    function fixedUpdateZoomedView() {
        // Make sure canvas is initialized
        if (canvas.width === 0 || canvas.height === 0) {
            console.log("Canvas not ready yet");
            initializeCanvas();
            return;
        }
        
        console.log("Fixed update zoomed view at:", currentMouseX, currentMouseY);
        
        // Get the zoom level
        const zoomSlider = document.getElementById('zoom-slider');
        const currentZoomLevel = parseInt(zoomSlider.value);
        
        // Get image dimensions
        const rect = sampleImage.getBoundingClientRect();
        
        // Scale factors between the displayed image and the actual image
        const scaleX = sampleImage.naturalWidth / rect.width;
        const scaleY = sampleImage.naturalHeight / rect.height;
        
        // Calculate the corresponding position in the original image
        const imgX = Math.floor(currentMouseX * scaleX);
        const imgY = Math.floor(currentMouseY * scaleY);
        
        // Size of the area to sample from the original image
        const baseSampleSize = 40; // Base sample size at zoom level 1
        const sampleSize = baseSampleSize / Math.max(1, currentZoomLevel);
        
        // Get canvas context for the zoomed view
        const zoomCtx = zoomedView.getContext("2d");
        
        // Clear the zoomed view
        zoomCtx.clearRect(0, 0, zoomedView.width, zoomedView.height);
        
        try {
            // Just use a simple drawImage method for all zoom levels for simplicity
            // Calculate the source rectangle to sample from the original image
            const sourceX = Math.max(0, Math.min(canvas.width - sampleSize * 2, imgX - sampleSize));
            const sourceY = Math.max(0, Math.min(canvas.height - sampleSize * 2, imgY - sampleSize));
            const sourceWidth = Math.min(sampleSize * 2, canvas.width - sourceX);
            const sourceHeight = Math.min(sampleSize * 2, canvas.height - sourceY);
            
            console.log("Drawing from source:", sourceX, sourceY, sourceWidth, sourceHeight);
            
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
        } catch (e) {
            console.error("Error updating zoomed view:", e);
        }
    }
    
    // Also listen for zoom slider changes
    const zoomSlider = document.getElementById('zoom-slider');
    if (zoomSlider) {
        zoomSlider.addEventListener("input", fixedUpdateZoomedView);
    }
});
