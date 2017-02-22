(function () {

    /* Utils */

    function extendSingle(target, source) {
        for (var key in source)
            target[key] = Array.isArray(source[key]) ? source[key].slice(0) : source[key];
        return target;
    }

    function extend(target, source) {
        if (!target) target = {};
        for (var i = 1; i < arguments.length; i++)
            extendSingle(target, arguments[i]);
        return target;
    }


    /* Setup options */

    // Base options for every shape
    var baseOptions = {
        svg: 'jelly.svg',
        pointsNumber: 16
    };

    // Options for each circle
    var optionsCircle = extend({}, baseOptions, {
        paths: '#jelly-circle',
        maxDistance: 40,
        mouseIncidence: 25,
        maxIncidence: 25
    });

    // Options for each image (big shapes)
    var optionsImage = extend({}, baseOptions, {
        paths: '#jelly-image',
        maxDistance: 150,
        mouseIncidence: 50,
        maxIncidence: 50
    });

    // Options for each text
    var optionsText = extend({}, baseOptions, {
        color: 'rgba(0, 0, 0, 0.6)',
        maxDistance: 15,
        mouseIncidence: 20,
        maxIncidence: 20
    });

    // Options for each arrow
    var optionsArrow = extend({}, baseOptions, {
        color: 'rgba(255, 255, 255, 0.5)',
        pointsNumber: 30,
        maxDistance: 40,
        mouseIncidence: 20,
        maxIncidence: 20
    });


    /* Initializing jelly items */

    var items = 5;      // Number of items in the slider
    var current = 2;    // Index of current item
    var busy = false;   // To check if there is an animation in progress
    var options = [];   // Array to populate the options

    // Positions for each circle, obtained with the help of the vector editor
    var circlePositions = [
        {x: -530, y: 5},
        {x: -330, y: -205},
        {x: 0, y: -285},
        {x: 330, y: -205},
        {x: 530, y: 5}
    ];

    // Function to build the options for an specific item
    function buildOptions(i) {
        var index = (i + 1);
        var isCurrent = i === current;

        // Options for each text, arrow and image, using the base options and the index
        var text = extend({}, optionsText, {paths: '#jelly-text-' + index + ' path'});
        var arrow = extend({}, optionsArrow, {paths: '#jelly-arrow-' + index});
        var image = extend({}, isCurrent ? optionsImage : optionsCircle, {image: 'img/image-' + index + '.jpg'});

        // If not the current item, set circle in the position defined, hide text, and hide arrow
        if (!isCurrent) {
            extend(image, circlePositions[i]);
            extend(text, {hidden: true});
            extend(arrow, {hidden: true});
        }

        // Push all of these to the options array
        options.push(text);
        options.push(arrow);
        options.push(image);
    }

    // Build the options for each item
    for (var i = 0; i < items; i++) {
        buildOptions(i);
    }

    var canvas = document.querySelector('.jelly-canvas');
    var jelly = new Jelly(canvas, options);


    /* Check hover item (shape) and update cursor */

    var hoverItem = -1;

    function checkHover() {
        var hoverIndex = jelly.getHoverIndex();
        hoverItem = (hoverIndex - 2) / 3;
        if (hoverIndex !== -1 && (hoverIndex - 2) % 3 === 0 && hoverItem !== current) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'default';
            hoverItem = -1;
        }
        window.requestAnimationFrame(checkHover);
    }
    window.requestAnimationFrame(checkHover);


    /* Listen click events and perform animations accordingly */

    canvas.addEventListener('click', function () {
        // Checking if an item is hovered and it is not busy
        if (hoverItem >= 0 && !busy) {
            busy = true;

            // Hide current text and arrow, and morph the big shape to a circle with the right position
            if (current !== undefined) {
                jelly.hide({i: current * 3, maxDelay: 400});
                jelly.hide({i: current * 3 + 1, maxDelay: 400});
                jelly.morph(extend({i: current * 3 + 2}, optionsCircle, circlePositions[current]));
            }

            // For the clicked item, show the hovered text and arrow, and morph the circle into the big shape
            jelly.show({i: hoverItem * 3, maxDelay: 400});
            jelly.show({i: hoverItem * 3 + 1, maxDelay: 400});
            jelly.morph(extend({i: hoverItem * 3 + 2}, optionsImage, {x: 0, y: 0}));

            // Update current item and release busy after some time to prevent malfunction
            current = hoverItem;
            setTimeout(function () { busy = false; }, 500);
        }
    });


    /* Scale the container accordingly to windows/device size, making it responsive */

    var jellyContainer = document.querySelector('.jelly-container');

    function resize() {
        var scale = Math.min(
            1,
            window.innerWidth / jellyContainer.clientWidth,
            window.innerHeight / jellyContainer.clientHeight
        );
        jellyContainer.style.transform = 'scale(' + scale + ')';
    }

    window.addEventListener('resize', resize);

    resize();

})();
