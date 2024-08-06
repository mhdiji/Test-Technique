// Fetching the elements
const drawingZone = document.getElementById('drawingZone')!;
const repaintButton = document.getElementById('repaintButton')!;

// Define the basic elements
let originX = 0;
let originY = 0;
let drawingPermission = false;
let currentRectangle: HTMLDivElement | null = null;
let rectanglesDrawn: HTMLElement[] = [];
let rotatingRectangles: Set<HTMLElement> = new Set();
let pendingDeletion: HTMLElement[] = [];

// Random function for coloring rectangles
function getColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Start drawing and adding the element to the DOM
drawingZone.addEventListener('mousedown', (e: MouseEvent) => {
  originX = e.clientX;
  originY = e.clientY;
  drawingPermission = true;

  currentRectangle = document.createElement('div');
  currentRectangle.style.position = 'absolute';
  currentRectangle.style.left = originX + 'px';
  currentRectangle.style.top = originY + 'px';
  currentRectangle.style.backgroundColor = getColor();
  currentRectangle.classList.add('rectangle');
  drawingZone.appendChild(currentRectangle);
});

// Adjusting the rectangle display to the mouse movement 
drawingZone.addEventListener('mousemove', (e: MouseEvent) => {
  if (!drawingPermission || !currentRectangle) return;

  const currentX = e.clientX;
  const currentY = e.clientY;
  const width = Math.abs(currentX - originX);
  const height = Math.abs(currentY - originY);

  currentRectangle.style.left = Math.min(originX, currentX) + 'px';
  currentRectangle.style.top = Math.min(originY, currentY) + 'px';
  currentRectangle.style.width = width + 'px';
  currentRectangle.style.height = height + 'px';
});

// End of rectangle drawing + Adding the double click listener for the rotation
drawingZone.addEventListener('mouseup', () => {
  if (!drawingPermission || !currentRectangle) return;
  drawingPermission = false;
  rectanglesDrawn.push(currentRectangle);

  currentRectangle.style.transformOrigin = 'center';

  currentRectangle.addEventListener('dblclick', (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement;

    if (!rotatingRectangles.has(target)) {
      rotatingRectangles.add(target);
      target.style.transition = 'transform 3s';
      target.style.transform = 'rotate(360deg)';

      setTimeout(() => {
        rotatingRectangles.delete(target);
        pendingDeletion.push(target);
        if (rotatingRectangles.size === 0) {
          deletePendingRectangles();
        }
      }, 3000);
    }
  });

  currentRectangle = null;
});

// Function to delete all pending rectangles which have finished rotating
function deletePendingRectangles() {
  pendingDeletion.forEach(rect => {
    rect.remove();
    // Make sure to also remove from rectanglesDrawn
    rectanglesDrawn = rectanglesDrawn.filter(r => r !== rect);
  });
  pendingDeletion = [];
}

// Repaint the two rectangles with the least surface difference
repaintButton.addEventListener('click', () => {

  // Filter out rectangles that have invalid dimensions
  rectanglesDrawn = rectanglesDrawn.filter(rect => rect.clientWidth > 0 && rect.clientHeight > 0);


  if (rectanglesDrawn.length < 2) return;

  let minDifference = Infinity;
  let rectPair: [HTMLElement, HTMLElement] | null = null;

  for (let i = 0; i < rectanglesDrawn.length; i++) {
    for (let j = i + 1; j < rectanglesDrawn.length; j++) {
      const rect1 = rectanglesDrawn[i];
      const rect2 = rectanglesDrawn[j];
      const area1 = rect1.clientWidth * rect1.clientHeight;
      const area2 = rect2.clientWidth * rect2.clientHeight;
      
      // Check if areas are valid
      if (area1 <= 0 || area2 <= 0) continue;

      const difference = Math.abs(area1 - area2);

      if (difference < minDifference) {
        minDifference = difference;
        rectPair = [rect1, rect2];
      }
    }
  }

  if (rectPair) {
    const newColor = getColor();
    rectPair[0].style.backgroundColor = newColor;
    rectPair[1].style.backgroundColor = newColor;
  }
});
