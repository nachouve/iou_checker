class IoUVisualizer {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasRect = this.canvas.getBoundingClientRect();
        
        // Box states
        this.boxes = {
            box1: { x: 50, y: 50, width: 150, height: 100, color: 'rgba(79, 172, 254, 0.7)', strokeColor: '#4facfe' },
            box2: { x: 200, y: 150, width: 180, height: 120, color: 'rgba(250, 112, 154, 0.7)', strokeColor: '#fa709a' }
        };
        
        // Interaction state
        this.activeBox = 'box1';
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;
        this.handleSize = 8;
        
        // Initialize
        this.init();
        this.setupEventListeners();
        this.updateDisplay();
        this.draw();
    }
    
    init() {
        // Update canvas rect on resize
        window.addEventListener('resize', () => {
            this.canvasRect = this.canvas.getBoundingClientRect();
        });
    }
    
    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Toggle buttons
        document.getElementById('toggleBox1').addEventListener('click', () => this.setActiveBox('box1'));
        document.getElementById('toggleBox2').addEventListener('click', () => this.setActiveBox('box2'));
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        
        // Input field listeners
        this.setupInputListeners();
        
        // Threshold slider
        const thresholdSlider = document.getElementById('iouThreshold');
        thresholdSlider.addEventListener('input', (e) => {
            document.getElementById('thresholdValue').textContent = parseFloat(e.target.value).toFixed(2);
            this.updateThresholdIndicator();
        });
        
        // Tooltip
        this.canvas.addEventListener('mousemove', (e) => this.showTooltip(e));
        this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
    }
    
    setupInputListeners() {
        const inputs = ['x', 'y', 'w', 'h'];
        const units = ['percent', 'pixels'];
        const boxes = ['box1', 'box2'];
        
        boxes.forEach(boxName => {
            inputs.forEach(coord => {
                units.forEach(unit => {
                    const element = document.getElementById(`${boxName}-${coord}-${unit}`);
                    if (element) {
                        element.addEventListener('input', (e) => {
                            this.updateBoxFromInput(boxName, coord, unit, parseFloat(e.target.value) || 0);
                        });
                    }
                });
            });
        });
    }
    
    getMousePos(e) {
        return {
            x: e.clientX - this.canvasRect.left,
            y: e.clientY - this.canvasRect.top
        };
    }
    
    handleMouseDown(e) {
        const mousePos = this.getMousePos(e);
        const box = this.boxes[this.activeBox];
        
        // Check for resize handles
        const handle = this.getResizeHandle(mousePos, box);
        if (handle) {
            this.isResizing = true;
            this.resizeHandle = handle;
            return;
        }
        
        // Check if clicking inside the active box
        if (this.isPointInBox(mousePos, box)) {
            this.isDragging = true;
            this.dragOffset = {
                x: mousePos.x - box.x,
                y: mousePos.y - box.y
            };
        }
    }
    
    handleMouseMove(e) {
        const mousePos = this.getMousePos(e);
        const box = this.boxes[this.activeBox];
        
        if (this.isDragging) {
            box.x = Math.max(0, Math.min(this.canvas.width - box.width, mousePos.x - this.dragOffset.x));
            box.y = Math.max(0, Math.min(this.canvas.height - box.height, mousePos.y - this.dragOffset.y));
            this.updateDisplay();
            this.draw();
        } else if (this.isResizing) {
            this.handleResize(mousePos, box);
            this.updateDisplay();
            this.draw();
        } else {
            // Update cursor based on hover state
            this.updateCursor(mousePos, box);
        }
    }
    
    handleMouseUp(e) {
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.canvas.style.cursor = 'crosshair';
    }
    
    getResizeHandle(mousePos, box) {
        const handles = [
            { name: 'nw', x: box.x, y: box.y },
            { name: 'ne', x: box.x + box.width, y: box.y },
            { name: 'sw', x: box.x, y: box.y + box.height },
            { name: 'se', x: box.x + box.width, y: box.y + box.height }
        ];
        
        for (let handle of handles) {
            if (Math.abs(mousePos.x - handle.x) <= this.handleSize &&
                Math.abs(mousePos.y - handle.y) <= this.handleSize) {
                return handle.name;
            }
        }
        return null;
    }
    
    handleResize(mousePos, box) {
        const minSize = 10;
        
        switch (this.resizeHandle) {
            case 'nw':
                const newWidth = box.width + (box.x - mousePos.x);
                const newHeight = box.height + (box.y - mousePos.y);
                if (newWidth >= minSize && mousePos.x >= 0) {
                    box.width = newWidth;
                    box.x = mousePos.x;
                }
                if (newHeight >= minSize && mousePos.y >= 0) {
                    box.height = newHeight;
                    box.y = mousePos.y;
                }
                break;
            case 'ne':
                if (mousePos.x - box.x >= minSize && mousePos.x <= this.canvas.width) {
                    box.width = mousePos.x - box.x;
                }
                const newH1 = box.height + (box.y - mousePos.y);
                if (newH1 >= minSize && mousePos.y >= 0) {
                    box.height = newH1;
                    box.y = mousePos.y;
                }
                break;
            case 'sw':
                const newW2 = box.width + (box.x - mousePos.x);
                if (newW2 >= minSize && mousePos.x >= 0) {
                    box.width = newW2;
                    box.x = mousePos.x;
                }
                if (mousePos.y - box.y >= minSize && mousePos.y <= this.canvas.height) {
                    box.height = mousePos.y - box.y;
                }
                break;
            case 'se':
                if (mousePos.x - box.x >= minSize && mousePos.x <= this.canvas.width) {
                    box.width = mousePos.x - box.x;
                }
                if (mousePos.y - box.y >= minSize && mousePos.y <= this.canvas.height) {
                    box.height = mousePos.y - box.y;
                }
                break;
        }
    }
    
    isPointInBox(point, box) {
        return point.x >= box.x && point.x <= box.x + box.width &&
               point.y >= box.y && point.y <= box.y + box.height;
    }
    
    updateCursor(mousePos, box) {
        const handle = this.getResizeHandle(mousePos, box);
        if (handle) {
            const cursors = {
                'nw': 'nw-resize',
                'ne': 'ne-resize',
                'sw': 'sw-resize',
                'se': 'se-resize'
            };
            this.canvas.style.cursor = cursors[handle];
        } else if (this.isPointInBox(mousePos, box)) {
            this.canvas.style.cursor = 'move';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }
    
    setActiveBox(boxName) {
        this.activeBox = boxName;
        
        // Update button states
        document.getElementById('toggleBox1').classList.toggle('active', boxName === 'box1');
        document.getElementById('toggleBox2').classList.toggle('active', boxName === 'box2');
        
        this.draw();
    }
    
    reset() {
        this.boxes.box1 = { x: 50, y: 50, width: 150, height: 100, color: 'rgba(79, 172, 254, 0.7)', strokeColor: '#4facfe' };
        this.boxes.box2 = { x: 200, y: 150, width: 180, height: 120, color: 'rgba(250, 112, 154, 0.7)', strokeColor: '#fa709a' };
        this.updateDisplay();
        this.draw();
    }
    
    updateBoxFromInput(boxName, coord, unit, value) {
        const box = this.boxes[boxName];
        
        if (unit === 'percent') {
            if (coord === 'x') box.x = (value / 100) * this.canvas.width;
            else if (coord === 'y') box.y = (value / 100) * this.canvas.height;
            else if (coord === 'w') box.width = (value / 100) * this.canvas.width;
            else if (coord === 'h') box.height = (value / 100) * this.canvas.height;
        } else {
            if (coord === 'x') box.x = value;
            else if (coord === 'y') box.y = value;
            else if (coord === 'w') box.width = value;
            else if (coord === 'h') box.height = value;
        }
        
        // Ensure box stays within canvas bounds
        box.x = Math.max(0, Math.min(this.canvas.width - box.width, box.x));
        box.y = Math.max(0, Math.min(this.canvas.height - box.height, box.y));
        box.width = Math.max(1, Math.min(this.canvas.width - box.x, box.width));
        box.height = Math.max(1, Math.min(this.canvas.height - box.y, box.height));
        
        this.updateDisplay();
        this.draw();
    }
    
    updateDisplay() {
        // Update input fields for both boxes
        Object.keys(this.boxes).forEach(boxName => {
            const box = this.boxes[boxName];
            
            // Percentage values
            document.getElementById(`${boxName}-x-percent`).value = ((box.x / this.canvas.width) * 100).toFixed(1);
            document.getElementById(`${boxName}-y-percent`).value = ((box.y / this.canvas.height) * 100).toFixed(1);
            document.getElementById(`${boxName}-w-percent`).value = ((box.width / this.canvas.width) * 100).toFixed(1);
            document.getElementById(`${boxName}-h-percent`).value = ((box.height / this.canvas.height) * 100).toFixed(1);
            
            // Pixel values
            document.getElementById(`${boxName}-x-pixels`).value = Math.round(box.x);
            document.getElementById(`${boxName}-y-pixels`).value = Math.round(box.y);
            document.getElementById(`${boxName}-w-pixels`).value = Math.round(box.width);
            document.getElementById(`${boxName}-h-pixels`).value = Math.round(box.height);
        });
        
        // Calculate and update metrics
        this.updateCalculations();
    }
    
    updateCalculations() {
        const box1 = this.boxes.box1;
        const box2 = this.boxes.box2;
        
        // Calculate areas
        const area1 = box1.width * box1.height;
        const area2 = box2.width * box2.height;
        
        // Calculate intersection
        const x1 = Math.max(box1.x, box2.x);
        const y1 = Math.max(box1.y, box2.y);
        const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
        const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
        
        const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
        const unionArea = area1 + area2 - intersectionArea;
        const iou = unionArea > 0 ? intersectionArea / unionArea : 0;
        
        // Update display
        document.getElementById('area1').textContent = Math.round(area1);
        document.getElementById('area2').textContent = Math.round(area2);
        document.getElementById('intersection').textContent = Math.round(intersectionArea);
        document.getElementById('union').textContent = Math.round(unionArea);
        document.getElementById('iou').textContent = iou.toFixed(3);
        
        this.updateThresholdIndicator();
    }
    
    updateThresholdIndicator() {
        const iou = parseFloat(document.getElementById('iou').textContent);
        const threshold = parseFloat(document.getElementById('iouThreshold').value);
        const indicator = document.getElementById('thresholdIndicator');
        const status = document.getElementById('thresholdStatus');
        
        if (iou >= threshold) {
            indicator.className = 'threshold-indicator above';
            status.textContent = 'Above Threshold ✓';
        } else {
            indicator.className = 'threshold-indicator below';
            status.textContent = 'Below Threshold ✗';
        }
    }
    
    showTooltip(e) {
        const mousePos = this.getMousePos(e);
        const tooltip = document.getElementById('tooltip');
        
        let tooltipText = '';
        
        // Check which box the mouse is over
        if (this.isPointInBox(mousePos, this.boxes.box1)) {
            tooltipText = `Box 1: ${Math.round(this.boxes.box1.width)}×${Math.round(this.boxes.box1.height)} at (${Math.round(this.boxes.box1.x)}, ${Math.round(this.boxes.box1.y)})`;
        } else if (this.isPointInBox(mousePos, this.boxes.box2)) {
            tooltipText = `Box 2: ${Math.round(this.boxes.box2.width)}×${Math.round(this.boxes.box2.height)} at (${Math.round(this.boxes.box2.x)}, ${Math.round(this.boxes.box2.y)})`;
        } else {
            // Check if over intersection area
            const box1 = this.boxes.box1;
            const box2 = this.boxes.box2;
            const x1 = Math.max(box1.x, box2.x);
            const y1 = Math.max(box1.y, box2.y);
            const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
            const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
            
            if (mousePos.x >= x1 && mousePos.x <= x2 && mousePos.y >= y1 && mousePos.y <= y2 && x2 > x1 && y2 > y1) {
                const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
                tooltipText = `Intersection Area: ${Math.round(intersectionArea)} px²`;
            }
        }
        
        if (tooltipText) {
            tooltip.textContent = tooltipText;
            tooltip.style.left = (e.clientX + 10) + 'px';
            tooltip.style.top = (e.clientY - 30) + 'px';
            tooltip.classList.add('show');
        } else {
            tooltip.classList.remove('show');
        }
    }
    
    hideTooltip() {
        document.getElementById('tooltip').classList.remove('show');
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw intersection first (so it appears behind boxes)
        this.drawIntersection();
        
        // Draw boxes
        this.drawBox(this.boxes.box1, this.activeBox === 'box1');
        this.drawBox(this.boxes.box2, this.activeBox === 'box2');
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);
        
        const gridSize = 50;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawIntersection() {
        const box1 = this.boxes.box1;
        const box2 = this.boxes.box2;
        
        const x1 = Math.max(box1.x, box2.x);
        const y1 = Math.max(box1.y, box2.y);
        const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
        const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
        
        if (x2 > x1 && y2 > y1) {
            this.ctx.fillStyle = 'rgba(255, 193, 7, 0.6)';
            this.ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
            
            this.ctx.strokeStyle = '#ffc107';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        }
    }
    
    drawBox(box, isActive) {
        // Fill
        this.ctx.fillStyle = box.color;
        this.ctx.fillRect(box.x, box.y, box.width, box.height);
        
        // Stroke
        this.ctx.strokeStyle = box.strokeColor;
        this.ctx.lineWidth = isActive ? 3 : 2;
        this.ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        // Draw resize handles for active box
        if (isActive) {
            this.drawResizeHandles(box);
        }
    }
    
    drawResizeHandles(box) {
        const handles = [
            { x: box.x, y: box.y },
            { x: box.x + box.width, y: box.y },
            { x: box.x, y: box.y + box.height },
            { x: box.x + box.width, y: box.y + box.height }
        ];
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = box.strokeColor;
        this.ctx.lineWidth = 2;
        
        handles.forEach(handle => {
            this.ctx.fillRect(handle.x - this.handleSize/2, handle.y - this.handleSize/2, this.handleSize, this.handleSize);
            this.ctx.strokeRect(handle.x - this.handleSize/2, handle.y - this.handleSize/2, this.handleSize, this.handleSize);
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.iouVisualizer = new IoUVisualizer();
});