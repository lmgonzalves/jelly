# Jelly.js

A library to draw and animate "jelly" shapes in a `canvas` element. It's inspired in [this pen](http://codepen.io/thomcc/pen/gzbjF) by Thom Chiovoloni, inspired as well in the game [The Floor is Jelly](http://thefloorisjelly.com/).

[**DEMO 1 - Simple example**](https://lmgonzalves.github.io/jelly/)

[**DEMO 2 - Jelly slider**](https://lmgonzalves.github.io/jelly/jellyfish.html)

[**TUTORIAL 1 - Simple example**](https://scotch.io/tutorials/drawing-and-animating-jelly-shapes-with-canvas)

**TUTORIAL 2 - Jelly slider** (coming soon)

## Install

You can install it using `npm` or just downloading it manually.

### NPM

```
npm install jelly.js
```

## Basic usage

### 1. Include `jelly.js` or `jelly.min.js` somewhere in HTML.

```html
<script src="js/jelly.js"></script>
```

### 2. Add the SVG `path`s you'd like to draw, and a `canvas` to draw them.

```html
<!-- Circle path -->
<svg class="jelly-circle-svg" width="1000" height="600" style="display: none">
    <path d="m500 250c27.614 0 50 22.386 50 50s-22.386 50-50 50-50-22.386-50-50 22.386-50 50-50z"/>
    <!-- You can have multiple paths -->
</svg>

<!-- Canvas to draw the shape -->
<!-- Note that the `svg` and `canvas` elements have the same dimensions -->
<canvas class="jelly-circle-canvas" width="1000" height="600"></canvas>
```

### 3. Initialize it in JavaScript.

```js
// The `Jelly` constructor receive a `canvas` element (or `string` selector) and an array of objects as `options` (see details below).
// You need to pass as many options as shapes you want to draw in the `canvas`
// This time we are providing an array with a single element, as we want to draw a single shape
var myJellyCircle = new Jelly('.jelly-circle-canvas', [{paths: '.jelly-circle-svg path'}]);
```

## Options

Here is the complete list of options you can provide to customize the jelly shapes as needed:

| Name                    | Type                    | Default                                                              | Description |
|-------------------------|-------------------------|----------------------------------------------------------------------|-------------|
|`paths`                  | Element or String       | `undefined`                                                          | Path elements (or selector) to draw the shapes. This options is required. |
|`svg`                    | String                  | `undefined`                                                          | URL to an `.svg` file containing the paths. You can also insert the SVG code directly in the HTML. |
|`pointsNumber`           | Integer                 | `10`                                                                 | Number of points to use to draw the shapes. |
|`maxDistance`            | Float                   | `70`                                                                 | Max distance (in pixels) among points to start pulling. |
|`mouseIncidence`         | Float                   | `40`                                                                 | Incidence of the mouse. More incidence means more reaction, and it increases proportionately to mouse speed. |
|`mouseIncidence`         | Float                   | `40`                                                                 | Max incidence of the mouse. No matter the speed, incidence will never be greater than this value. |
|`color`                  | String                  | `'#666'`                                                             | Solid color to fill the shape. |
|`image`                  | String                  | `undefined`                                                          | Image URL to fill the shape. |
|`imageCentroid`          | Boolean                 | `true`                                                               | If `true`, the image will be moved accordingly to the centroid point. |
|`centroid`               | Element or String       | `undefined`                                                          | Element (or selector) to move accordingly to the centroid point. |
|`debug`                  | Boolean                 | `false`                                                              | Set it `true` to see the points. |
|`intensity`              | Float                   | `0.95`                                                               | Jelly effect intensity. Should be a value `< 1`. |
|`fastness`               | Float                   | `1 / 40`                                                             | Jelly effect fastness. Should be a value near zero. |

## Available functions to animate the jelly shapes

| Name                    | Default options                                        | Description |
|-------------------------|--------------------------------------------------------|-------------|
|`hide`                   | `{i: 0, maxDelay: 0, animate: true}`                   | Hide the shape selected by the index (`i`). If `animate` is `true`, all the points of the shape will be animated, with a *random* delay `<= maxDelay`. |
|`show`                   | `{i: 0, maxDelay: 0, animate: true}`                   | Show the shape selected by the index (`i`). If `animate` is `true`, all the points of the shape will be animated, with a *random* delay `<= maxDelay`. To show a shape, it should have been hidden previously. |
|`morph`                  | `{i: 0, maxDelay: 0, animate: true}`                   | Morph the shape selected by the index (`i`) to another shape. You need to pass a new `paths` option (at least) with the same `pointsNumber`. If `animate` is `true`, all the points of the shape will be animated, with a *random* delay `<= maxDelay`.  |
|`shake`                  | `{i: 0, x: 0, y: 0}`                                   | Shake the shape selected by the index (`i`), moving the points (alternately) the distance defined by `x` and `y`.
