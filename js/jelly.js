(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Jelly = factory();
    }
}(this, function () {

    // Utils

    // From: anime.js
    var is = {
        arr: function(a) { return Array.isArray(a) },
        str: function(a) { return typeof a === 'string' },
        fnc: function(a) { return typeof a === 'function' }
    };

    function extendSingle(target, source) {
        for (var key in source)
            target[key] = is.arr(source[key]) ? source[key].slice(0) : source[key];
        return target;
    }

    function extend(target, source) {
        if (!target) target = {};
        for (var i = 1; i < arguments.length; i++)
            extendSingle(target, arguments[i]);
        return target;
    }

    // From: http://github.com/greggman/twgl.js
    function resizeCanvasToDisplaySize(canvas) {
        var width = canvas.clientWidth | 0;
        var height = canvas.clientHeight | 0;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    }

    function createCountDown(callback) {
        return {
            count: 0,
            async: false,
            add: function () {
                this.count++;
                this.async = true;
            },
            check: function () {
                if (--this.count == 0) callback();
            },
            checkNoAsync: function () {
                if (!this.async) callback();
            }
        };
    }

    // Promises
    function deferred() {
        return new function () {
            this.resolve = null;
            this.reject = null;

            this.promise = new Promise(function (resolve, reject) {
                this.resolve = resolve;
                this.reject = reject;
            }.bind(this));
        };
    }


    // Jelly

    function Jelly(canvas, options) {
        this.canvas = is.str(canvas) ? document.querySelector(canvas) : canvas;
        this.ctx = this.canvas.getContext('2d');
        this.o = [];
        this.init(is.arr(options) ? options : [options]);
    }

    Jelly.prototype = {
        defaults: {
            pathsContainer: document,
            color: '#666',
            imageCentroid: true,
            debug: false,
            pointsNumber: 10,
            mouseIncidence: 40,
            maxIncidence: 40,
            maxDistance: 70,
            intensity: 0.95,
            fastness: 1 / 40,
            ent: 0.25,
            x: 0,
            y: 0
        },

        init: function (options) {
            resizeCanvasToDisplaySize(this.canvas);
            this.width = this.canvas.width;
            this.height = this.canvas.height;

            this.d = deferred();
            this.promise = this.d.promise;

            this.initEvents();
            this.initOptions(options);
        },

        initEvents: function () {
            var that = this;

            this.canvas.onmousemove = function (e) {
                e.preventDefault();
                var pos = that.canvas.getBoundingClientRect();
                var x = e.clientX - pos.left;
                var y = e.clientY - pos.top;
                var dx = x - that.mouseX;
                var dy = y - that.mouseY;
                var dist = Math.sqrt(dx * dx * 3 + dy * dy * 3);
                if (dist < 2) dist = 0;
                if (dist > 100) dist = 100;
                var scaleX = pos.width / that.canvas.offsetWidth;
                var scaleY = pos.height / that.canvas.offsetHeight;
                that.mouseX = x * (1 / scaleX);
                that.mouseY = y * (1 / scaleY);
                that.speed = dist ? dist / 10 : 0;
            };

            this.canvas.onmouseout = function (e) {
                e.preventDefault();
                that.mouseX = undefined;
                that.mouseY = undefined;
                that.speed = undefined;
            };
        },

        initOptions: function (options) {
            var that = this;
            var svgCountDown = createCountDown(this.initJelly.bind(this));
            
            function calcPoints(o, i) {
                extend(o, {
                    pointsData: that.getPointsData(o),
                    centroid: is.str(o.centroid) ? document.querySelector(o.centroid) : o.centroid
                });
                that.o[i] = extend(o, {centroidPoint: that.getCentroid(o.pointsData)});
                if (o.hidden) that.animate({animate: false, i: i}, true);
            }

            function saveOptions(o, i) {
                if (o.svg) {
                    svgCountDown.add();
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', o.svg);
                    xhr.overrideMimeType('image/svg+xml');
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            var cachedDocument = document.implementation.createHTMLDocument('');
                            cachedDocument.body.innerHTML = xhr.status === 200 ? xhr.responseText : '';
                            o.pathsContainer = cachedDocument;
                            calcPoints(o, i);
                            svgCountDown.check();
                        }
                    };
                    xhr.send();
                } else {
                    calcPoints(o, i);
                }
            }
            
            for (var i = 0; i < options.length; i++) {
                saveOptions(extend({}, this.defaults, options[i]), i);
            }

            svgCountDown.checkNoAsync();
        },

        initJelly: function () {
            var that = this;
            var imageCountDown = createCountDown(function () {
                that.d.resolve();
                that.renderJelly();
            });

            function waitImage(o) {
                imageCountDown.add();
                var img = new Image();
                img.onload = function () {
                    o.image = img;
                    imageCountDown.check();
                };
                img.src = o.image;
            }

            for (var i = 0; i < this.o.length; i++) {
                if (this.o[i].image) waitImage(this.o[i]);
            }

            imageCountDown.checkNoAsync();
        },

        shake: function (options) {
            var that = this;
            this.promise.then(function () {
                var o = extend({i: 0, x: 0, y: 0}, options);
                var pointsData = that.o[o.i].pointsData;
                var p;
                for (var i = 0; i < pointsData.length; i++) {
                    p = pointsData[i];
                    for (var j = 0; j < p.length; j+=2) {
                        that.animateShake(p[j], o);
                    }
                }
            });
        },

        animateShake: function (p, o) {
            p.x += o.x;
            p.y += o.y;
        },

        morph: function (options) {
            var that = this;
            this.promise.then(function () {
                var o = extend({i: 0, maxDelay: 0, animate: true}, options);
                var pointsData = that.o[o.i].pointsData;
                var pointsDataMorph = that.getPointsData(extend(that.o[o.i], o));
                var p, pMorph;
                for (var i = 0; i < pointsData.length; i++) {
                    p = pointsData[i];
                    pMorph = pointsDataMorph[i];
                    for (var j = 0; j < p.length; j++) {
                        that.animateMorph(p[j], pMorph[j], o);
                    }
                }
            });
        },

        animateMorph: function (p, pMorph, o) {
            if (o.animate) {
                setTimeout(function () {
                    p.ox = pMorph.ox;
                    p.oy = pMorph.oy;
                }, Math.floor((Math.random() * o.maxDelay)));
            } else {
                p.ox = p.x = pMorph.ox;
                p.oy = p.y = pMorph.oy;
            }
        },

        hide: function (options) {
            var that = this;
            this.promise.then(function () {
                that.animate(options, true);
            });
        },

        show: function (options) {
            var that = this;
            this.promise.then(function () {
                that.animate(options, false);
            });
        },

        animate: function (options, hide) {
            var o = extend({i: 0, maxDelay: 0, animate: true}, options);
            if (hide) extend(o, this.o[o.i].centroidPoint);
            var pointsData = this.o[o.i].pointsData;
            var p;
            for (var i = 0; i < pointsData.length; i++) {
                p = pointsData[i];
                for (var j = 0; j < p.length; j++) {
                    hide ? this.animateHide(p[j], o) : this.animateShow(p[j], o);
                }
            }
        },

        animateHide: function (point, o) {
            point.oldX = point.ox;
            point.oldY = point.oy;
            if (o.animate) {
                setTimeout(function () {
                    point.oldX = point.ox;
                    point.oldY = point.oy;
                    point.ox = o.x;
                    point.oy = o.y;
                }, Math.floor((Math.random() * o.maxDelay)));
            } else {
                point.ox = point.x = o.x;
                point.oy = point.y = o.y;
            }
        },

        animateShow: function (point, o) {
            setTimeout(function () {
                point.ox = point.oldX !== undefined ? point.oldX : point.ox;
                point.oy = point.oldY !== undefined ? point.oldY : point.oy;
            }, Math.floor((Math.random() * o.maxDelay)));

            if (o.animate) {
                setTimeout(function () {
                    point.ox = point.oldX !== undefined ? point.oldX : point.ox;
                    point.oy = point.oldY !== undefined ? point.oldY : point.oy;
                }, Math.floor((Math.random() * o.maxDelay)));
            } else {
                point.ox = point.x = point.oldX !== undefined ? point.oldX : point.ox;
                point.oy = point.y = point.oldY !== undefined ? point.oldY : point.oy;
            }
        },

        getPointsData: function (o) {
            var paths = is.str(o.paths) ? o.pathsContainer.querySelectorAll(o.paths) : o.paths;
            var pointsData = [];
            for (var i = 0; i < paths.length; i++) {
                pointsData.push(this.getPathPoints(paths[i], o));
            }
            return pointsData;
        },

        getPathPoints: function (path, o) {
            var pathLength = path.getTotalLength();
            var pointsNumber = o.pointsNumber;
            var margin = pathLength / pointsNumber;
            var currentPosition = 0;

            var pt = {xs: 0, ys: 0};
            var p = [], point;

            while (pointsNumber--) {
                point = path.getPointAtLength(currentPosition);
                pt.x = point.x + o.x;
                pt.y = point.y + o.y;
                p.push(extend({ox: pt.x, oy: pt.y}, pt));
                currentPosition += margin;
            }

            return p;
        },

        calcLoop: function (p, o) {
            var xd, yd, d, n;
            var len = p.length;

            for (n = 0; n < len; n++) {
                p[n].xs *= o.intensity;
                p[n].ys *= o.intensity;

                if (p[n].xs > 11 || p[n].xs < -11) {
                    p[n].xs = 11 * (p[n].xs < 0 ? -1 : 1);
                }

                p[n].xs -= (p[n].x - p[n].ox) * o.fastness;
                p[n].ys -= (p[n].y - p[n].oy) * o.fastness;

                p[n].x += p[n].xs;
                p[n].y += p[n].ys;

                var diffX = p[n].x - this.mouseX;
                var diffY = p[n].y - this.mouseY;
                var dist = Math.sqrt(diffX * diffX + diffY * diffY);
                var incidence = Math.min(o.mouseIncidence * this.speed, o.maxIncidence);
                if (dist < incidence) {
                    p[n].xs = diffX * incidence/100;
                    p[n].ys = diffY * incidence/100;
                }
            }

            var n2 = len - 1;

            for (n = 0; n < len; n++) {
                xd = p[n2].x - p[n].x;
                yd = p[n2].y - p[n].y;
                d = Math.sqrt(xd * xd + yd * yd);
                if (d > o.maxDistance) {
                    p[n].xs += o.ent * xd / d;
                    p[n].ys += o.ent * yd / d;
                    p[n2].xs -= o.ent * xd / d;
                    p[n2].ys -= o.ent * yd / d;
                }
                n2 = n;
            }
        },

        renderJelly: function () {
            this.ctx.clearRect(0, 0, this.width, this.height);
            var o, p, left, top, width, height, i, j;
            for (i = 0; i < this.o.length; i++) {
                o = this.o[i];
                for (j = 0; j < o.pointsData.length; j++) {
                    p = o.pointsData[j];
                    this.calcLoop(p, o);
                }
                o.centroidPoint = this.getCentroid(o.pointsData);
                if (o.centroid) {
                    o.centroid.style.transform = 'translate(' + o.centroidPoint.x + 'px, ' + o.centroidPoint.y + 'px)';
                }
                for (j = 0; j < o.pointsData.length; j++) {
                    this.ctx.save();
                    p = o.pointsData[j];
                    this.drawPath(p, o);
                    o.hover = this.ctx.isPointInPath(this.mouseX, this.mouseY);
                    this.ctx.clip();
                    if (o.image) {
                        width = o.image.width;
                        height = o.image.height;
                        left = o.imageCentroid ? o.centroidPoint.x - width / 2 : 0;
                        top = o.imageCentroid ? o.centroidPoint.y - height / 2 : 0;
                        this.ctx.drawImage(o.image, left, top, width, height);
                    } else {
                        this.ctx.fillStyle = o.color;
                        this.ctx.fill();
                    }
                    this.ctx.restore();
                    if (o.debug) this.drawPoints(p, o);
                }
            }
            window.requestAnimationFrame(this.renderJelly.bind(this));
        },

        drawPath: function (p) {
            this.ctx.beginPath();
            this.ctx.moveTo(p[0].x, p[0].y);
            var i, p0, p1, len = p.length;
            for (i = 0; i <= len; i++) {
                p0 = p[i >= len ? i - len : i];
                p1 = p[i + 1 >= len ? i + 1 - len : i + 1];
                this.ctx.quadraticCurveTo(p0.x, p0.y, (p0.x + p1.x) * 0.5, (p0.y + p1.y) * 0.5);
            }
            this.ctx.closePath();
        },

        drawPoints: function (p, o) {
            for (var i = 0; i < p.length; i++) {
                this.drawPoint(p[i]);
            }
            this.drawPoint(o.centroidPoint);
        },

        drawPoint: function (point) {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
            this.ctx.closePath();
            this.ctx.fillStyle = 'red';
            this.ctx.fill();
        },

        getCentroid: function (pointsData) {
            var len = 0, sumX = 0, sumY = 0, i, j, p;
            for (i = 0; i < pointsData.length; i++) {
                p = pointsData[i];
                len += p.length;
                for (j = 0; j < p.length; j++) {
                    sumX += p[j].x;
                    sumY += p[j].y;
                }
            }
            return {x: sumX / len, y: sumY / len};
        },

        getHoverIndex: function () {
            for (var i = 0; i < this.o.length; i++) {
                if (this.o[i] && this.o[i].hover) return i;
            }
            return -1;
        }
    };

    return Jelly;

}));
