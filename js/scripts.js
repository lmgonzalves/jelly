(function () {

    /* Setup options */

    var options = {
        paths: '#pentagon-path',     // Shape we want to draw
        pointsNumber: 10,            // Number of points
        maxDistance: 70,             // Max distance among points
        color: '#5C1523',
        centroid: '.centroid-text'   // Element to move accordingly with the centroid of the shape
        // debug: true               // Uncomment this to see the points
    };

    /* Initializing jelly */

    var jelly = new Jelly('.jelly-canvas', options);


    /* Check hover item (shape) and update cursor */

    var container = document.querySelector('.jelly-container');
    var hoverIndex = -1;

    function checkHover() {
        // The `getHoverIndex` function will return the index of the shape being hovered, or -1
        hoverIndex = jelly.getHoverIndex();
        container.style.cursor = hoverIndex === -1 ? 'default' : 'pointer';
        window.requestAnimationFrame(checkHover);
    }
    window.requestAnimationFrame(checkHover);


    /* Drag and drop */

    var startX, startY, dx, dy, endX = 0, endY = 0, x = 0, y = 0, lastX = 0, lastY = 0;
    var down = false;
    // This will be the max distance for shaking
    var shakeLimit = 5;

    container.addEventListener('mousedown', function (e) {
        if (hoverIndex >= 0) {
            startX = e.clientX;
            startY = e.clientY;
            down = true;
        }
    });

    document.addEventListener('mousemove', function (e) {
        if (down) {
            x = e.clientX - startX;
            y = e.clientY - startY;
            container.style.transform = 'translate(' + (endX + x) + 'px, ' + (endY + y) + 'px)';

            dx = x - lastX;
            dy = y - lastY;
            if (dx > shakeLimit || dx < - shakeLimit) dx = dx < 0 ? - shakeLimit : shakeLimit;
            if (dy > shakeLimit || dy < - shakeLimit) dy = dy < 0 ? - shakeLimit : shakeLimit;

            // The `shake` function will "move" the half of the points (alternately) the distance defined
            jelly.shake({x: - dx, y: - dy});

            lastX = x;
            lastY = y;
        }
    });

    function mouseUp() {
        if (down) {
            down = false;
            endX += x;
            endY += y;
        }
    }

    document.addEventListener('mouseup', mouseUp);

    document.addEventListener('mouseout', function (e) {
        if (e.target.nodeName == 'HTML') {
            mouseUp();
        }
    });

})();
