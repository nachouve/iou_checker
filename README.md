# Intersection over Union (IoU) Visualizer

IoU Visualizer is a simple, interactive single-page web application designed to help users understand and experiment with the Intersection over Union (IoU) metric, which is commonly used in computer vision and object detection tasks.

This application allows you to draw, drag, and resize two bounding boxes on a canvas. All calculations—including area, intersection, union, and the final IoU score—are updated in real-time, providing immediate visual and numerical feedback.

![Screenshot of the IoU Visualizer application in use.](placeholder.png)
*(Note: Replace `placeholder.png` with an actual screenshot of the app.)*

---

## Features

- **Interactive Canvas:** A 600x400 canvas where you can manipulate bounding boxes.
- **Draggable & Resizable Boxes:** Select a box and drag it around, or resize it by grabbing its edges or corners.
- **Dual Control Modes:**
    - **Mouse Interaction:** Click and drag directly on the canvas for intuitive control.
    - **Text Inputs:** Fine-tune coordinates and dimensions using text fields for both pixel values and percentages.
- **Real-Time Calculations:** Instantly see updates for:
    - Area of each box (in px² and % of canvas).
    - Intersection Area (in px² and %).
    - Union Area (in px² and %).
    - **Intersection over Union (IoU)** score.
- **Visual Feedback:**
    - The active box for editing is highlighted with a darker border and resize handles.
    - The intersection area is visualized with a distinct color.
    - The IoU score display changes color based on its value (red for low, yellow for medium, green for high) to indicate the quality of the overlap.
- **State Management:** Easily switch between editing Box 1 and Box 2 with dedicated buttons.
- **Reset Functionality:** A "Reset" button to restore the boxes to their original default positions.
- **Self-Contained & Lightweight:** Built with vanilla HTML, CSS, and JavaScript. No external libraries or frameworks are needed.

## How to Use

1.  **Setup:** No setup is required! Simply clone or download the repository and open the `index.html` file in a modern web browser (like Chrome, Firefox, or Edge).

2.  **Editing a Box:**
    - Click the **"Edit Box 1"** or **"Edit Box 2"** button to select which box you want to manipulate. The active box will be highlighted.

3.  **Canvas Interaction:**
    - **To Drag:** Click anywhere inside the body of the active box and drag it to a new position.
    - **To Resize:** Move your cursor over the edges or corners of the active box. Click and drag the handles that appear to change its dimensions.

4.  **Coordinate Inputs:**
    - You can directly enter values into the `px` (pixels) or `%` (percentage) input fields for `X`, `Y`, `W` (width), and `H` (height).
    - Changes made in the input fields are immediately reflected on the canvas, and vice versa.

## Technical Details

- **Frontend:** Vanilla HTML5, CSS3, and JavaScript (ES6+).
- **Graphics:** All rendering is done using the HTML5 Canvas API.
- **Compatibility:** Works in all modern web browsers.
- **Structure:** The entire application is contained within a single `index.html` file for simplicity and portability.
