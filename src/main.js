// Create a class for the element
class MandelbrotWidget extends HTMLElement {
  static observedAttributes = [];

  constructor() {
    super();

    // Create a shadow root
    const shadow = this.attachShadow({ mode: "open" });
    const mandelbrotHTML = `
            <div class="canvas-container">
                <canvas id="mandelbrot-canvas"></canvas>
                <div class="canvas-controls">
                    <span class="plus" title="Zoom in">+</span>
                    <span class="center" title="Center">&#9678;</span>
                    <span class="minus" title="Zoom out">&minus;</span>
                    <span class="larr" title="Move left">&larr;</span>
                    <span class="uarr" title="Move up">&uarr;</span>
                    <span class="darr" title="Move down">&darr;</span>
                    <span class="rarr" title="Move right">&rarr;</span>
                    <span class="download" title="Download image">&#10515;</span>
                    <span class="fullscreen" title="Fullscreen">&#9974;</span>
                </div>
                <div class="contextmenu">
                    <button>Switch z</button>
                </div>
            </div>`;
    const template = document.createElement("template");
    template.innerHTML = mandelbrotHTML;
    shadow.appendChild(template.content.cloneNode(true));

    // Create some CSS to apply to the shadow dom
    const style = document.createElement("style");
    console.log(style.isConnected);
    style.textContent = `
      .canvas-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      ${
        this.getAttribute("width")
          ? `max-width: ${this.getAttribute("width")}px`
          : ""
      };
      min-width: 250px;
      margin: 0 auto;
      width: 100%;
      border-radius: 1em;
      aspect-ratio: 3/2;
      }

      .canvas-container:fullscreen {
      background-color: hsl(0, 0%, 15%) !important;
      }

      .canvas-container:fullscreen canvas {
      width: calc((3 / 2) * 100vh);
      }

      canvas {
      width: 100%;
      background-color: rgba(0, 0, 0, 0.05);
      }

      canvas.panning {
      cursor: all-scroll;
      }

      .canvas-container .contextmenu {
      position: absolute;
      visibility: hidden;
      overflow-wrap: break-word;
      max-width: 150px;
      }

      .canvas-container .contextmenu.show {
      visibility: visible;
      }

      .contextmenu button {
      all: unset;
      background: rgba(155, 155, 155, 0.5);
      font-size: 0.85rem;
      color: white;
      padding: 0.5em 1em;
      border-radius: 0.5em;
      cursor: pointer;
      }

      .contextmenu button:hover {
      background: rgba(155, 155, 155, 0.8) !important;
      }

      .canvas-controls {
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.5rem;
      position: absolute;
      padding-block: 4px;
      padding-inline: 8px;
      font-size: 150%;
      bottom: 0;
      right: 0;
      border-radius: 6px;
      }
      .canvas-controls * {
      cursor: pointer;
      }

      .canvas-controls *:hover {
      color: rgba(255, 255, 255, 0.8);
      }

      .canvas-controls:hover {
      background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1));
      }`;

    // Attach the created elements to the shadow dom
    shadow.appendChild(style);
  }

  connectedCallback() {
    const shadow = this.shadowRoot;

    {
      /* Global variables */
      let REAL_RANGE = [-2, 1];
      let IMAG_RANGE = [1, -1];
      let TASKS = [];
      const zoomBackImages = [];
      const zoomImagesUrls = [];
      const ZOOM_FACTOR = 0.8;
      let mandel = true;
      let juliaPoint = { re: 0, im: 0 };
      let random = this.getAttribute("random") === "true";
      let isDown = false;
      let startX, startY;

      /* Workers */
      let workerCount = navigator.hardwareConcurrency;
      let workers = new Array(workerCount);
      for (let i = 0; i < workerCount; ++i) {
        var blobURL = URL.createObjectURL(
          new Blob(
            [
              "(",
              function () {

                // Global vars for worker state management
                let WIDTH,
                  HEIGHT,
                  REAL_RANGE,
                  IMAG_RANGE,
                  REAL_RANGE_LEN,
                  IMAG_RANGE_LEN,
                  MAX_ITERATION_COUNT;

                /* Message eventlistener */
                self.addEventListener("message", function (messageEvent) {
                  // Setup
                  const {
                    w,
                    h,
                    realSet,
                    imagSet,
                    isSettingUp,
                    mandel,
                    point,
                    iterationCount,
                  } = messageEvent.data;
                  MAX_ITERATION_COUNT = iterationCount;
                  REAL_RANGE = [realSet[0], realSet[1]];
                  IMAG_RANGE = [imagSet[0], imagSet[1]];
                  REAL_RANGE_LEN = REAL_RANGE[1] - REAL_RANGE[0];
                  IMAG_RANGE_LEN = IMAG_RANGE[1] - IMAG_RANGE[0];
                  WIDTH = w;
                  HEIGHT = h;
                  // Here we calculate the mandelbrot
                  if (!isSettingUp) {
                    // Get the column
                    const { col } = messageEvent.data;
                    // Here we store the calculated sets
                    const theSets = [];
                    // Loop over the rows and calculate the mandelbrot
                    for (let row = 0; row < HEIGHT; row++) {
                      theSets[row] = mandel
                        ? mandelbrot(complexNumber(col, row))
                        : julia(complexNumber(col, row), point);
                    }
                    // Report back the calculated result
                    console.log("Worker " + self.name + "calculated " + col);
                    self.postMessage({ name: self.name, col, theSets });
                  }
                });

                /**
                 * Generate a complex number from the canvas coordinates
                 * @param {number} x
                 * @param {number} y
                 * @returns Mathjs Complex number
                 */
                function complexNumber(x, y) {
                  x = REAL_RANGE[0] + (x / WIDTH) * REAL_RANGE_LEN;
                  y = IMAG_RANGE[0] + (y / HEIGHT) * IMAG_RANGE_LEN;
                  return { re: x, im: y };
                }

                /**
                 * Check if the mandelbrot function diverges
                 * @param {Object} c - Complex number
                 */
                function mandelbrot(c) {
                  // Define complex number z
                  let z = { re: 0, im: 0 };
                  let zSquared,
                    d,
                    n = 0;

                  // Loop
                  do {
                    // z^2
                    zSquared = {
                      re: Math.pow(z.re, 2) - Math.pow(z.im, 2),
                      im: 2 * z.re * z.im,
                    };
                    // z = z^2 + c
                    z = {
                      re: zSquared.re + c.re,
                      im: zSquared.im + c.im,
                    };
                    // Cabs of z
                    d = Math.sqrt(Math.pow(z.re, 2) + Math.pow(z.im, 2));
                    n += 1;
                  } while (d <= 2 && n < MAX_ITERATION_COUNT);

                  return { iterations: n, in: d <= 2 };
                }

                function julia(z, c) {
                  // Define complex number c
                  let zSquared,
                    d,
                    n = 0;

                  // Loop
                  do {
                    // z^2
                    zSquared = {
                      re: Math.pow(z.re, 2) - Math.pow(z.im, 2),
                      im: 2 * z.re * z.im,
                    };
                    // z = z^2 + c
                    z = {
                      re: zSquared.re + c.re,
                      im: zSquared.im + c.im,
                    };
                    // Cabs of z
                    d = Math.sqrt(Math.pow(z.re, 2) + Math.pow(z.im, 2));
                    n += 1;
                  } while (d <= 2 && n < MAX_ITERATION_COUNT);

                  return { iterations: n, in: d <= 2 };
                }

              }.toString(),

              ")()",
            ],
            { type: "application/javascript" }
          )
        );

        workers[i] = new Worker(blobURL, { name: i });
      }

      /* Generate a random color array */
      let colors = colorPalette();

      /* Setup the canvas for plotting */
      const canvas = shadow.querySelector("#mandelbrot-canvas");
      let ctx = canvas.getContext("2d");
      ctx.canvas.width = canvas.offsetWidth / 1;
      ctx.canvas.height = ctx.canvas.width * (2 / 3);
      resizeableCanvas(ctx, startWorking, workers);

      /* Image */
      ctx.createImageData(1, ctx.canvas.height);

      /* Start everything */
      init(workers);

      /* DRAWING */
      /*##################################################*/

      /**
       * Draw the mandelbrot to the canvas
       * @param {any} resp
       */
      function draw(resp) {
        // Get the response
        const { name, col, theSets } = resp;

        // Image for the canvas
        const image = ctx.createImageData(1, ctx.canvas.height);

        // Keeping the worker busy whilke we have tasks
        if (TASKS.length > 0) {
          workers[name].postMessage({
            w: ctx.canvas.width,
            h: ctx.canvas.height,
            realSet: REAL_RANGE,
            imagSet: IMAG_RANGE,
            isSettingUp: false, // now we work
            mandel: mandel,
            point: juliaPoint,
            iterationCount:
              Number(shadow.host.getAttribute("iterations")) || 100,
            col: random
              ? TASKS.splice(Math.floor(Math.random() * TASKS.length), 1)[0]
              : TASKS.shift(),
          });
        } else {
          // Nothing to do here
        }

        /* Loop over the canvas and set the colors */
        for (let i = 0; i < ctx.canvas.height * 4; i++) {
          const mb = theSets[Math.floor(i / 4)];
          // Iterate through every pixel
          if (i % 4 == 0) {
            // Modify pixel data
            image.data[i + 0] =
              colors[mb.in ? 0 : mb.iterations % colors.length][0]; // R value
            image.data[i + 1] =
              colors[mb.in ? 0 : mb.iterations % colors.length][1]; // G value
            image.data[i + 2] =
              colors[mb.in ? 0 : mb.iterations % colors.length][2]; // B value
            image.data[i + 3] = 255; // A value
          }
        }
        ctx.putImageData(image, col, 0);
      }

      /*##################################################*/

      /* SWITCH BETWEEN MANDEL AND JULIA */
      /*##################################################*/

      const switchSetBtn = shadow.querySelector(".contextmenu button");
      switchSetBtn.addEventListener("click", (e) => {
        mandel = !mandel;
        e.target.closest(".contextmenu").classList.remove("show");
        // Redraw the canvas
        startWorking(workers);
      });

      canvas.oncontextmenu = function (e) {
        // We do not want the default behaviour here
        e.preventDefault();
        e.stopPropagation();

        if (
          !shadow.host.getAttribute("julia") ||
          shadow.host.getAttribute("julia") === "false"
        )
          return;

        // Set the start coords
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        juliaPoint.re = getRelativePoint(x, ctx.canvas.width, REAL_RANGE);
        juliaPoint.im = getRelativePoint(y, ctx.canvas.height, IMAG_RANGE);

        switchSetBtn.innerHTML = `Switch to ${
          mandel ? "Julia" : "Mandelbrot"
        } set ${
          mandel
            ? `at point z = ${getRelativePoint(
                x,
                ctx.canvas.width,
                REAL_RANGE
              ).toFixed(1)} ${
                getRelativePoint(y, ctx.canvas.height, IMAG_RANGE) < 0
                  ? getRelativePoint(y, ctx.canvas.height, IMAG_RANGE).toFixed(
                      1
                    )
                  : "+ " +
                    getRelativePoint(y, ctx.canvas.height, IMAG_RANGE).toFixed(
                      1
                    )
              }&nbsp;i`
            : ""
        }`;

        MathJax.typeset();

        console.log(e);

        console.log(e);
        const menu = shadow.querySelector(".contextmenu");
        menu.classList.add("show");
        menu.style.left = `${
          rect.right < e.clientX + menu.offsetWidth
            ? x - 15 - menu.offsetWidth
            : x + 15
        }px`;
        menu.style.top = `${
          rect.top + rect.height < e.clientY + menu.offsetHeight
            ? y - 15 - menu.offsetHeight
            : y + 15
        }px`;
      };

      /*##################################################*/

      /* WORKERS */
      /*##################################################*/

      /**
       * Setup everything
       */
      function init(workers) {
        /* Worker */
        workers[0].postMessage({
          w: ctx.canvas.width,
          h: ctx.canvas.height,
          realSet: REAL_RANGE,
          imagSet: IMAG_RANGE,
          isSettingUp: true,
          mandel: mandel,
          point: juliaPoint,
          iterationCount: Number(shadow.host.getAttribute("iterations")) || 100,
        });

        workers.forEach((worker) => {
          // Invoke draw function on worker message event
          worker.addEventListener("message", function (messageEvent) {
            draw(messageEvent.data);
          });
        });
        startWorking(workers);
      }

      /**
       * Start working
       */
      function startWorking(workers) {
        // Go over the columns and add tasks for the workers to calculate
        for (let col = 0; col < ctx.canvas.width; col++) TASKS[col] = col;
        workers.forEach((worker, index) => {
          // Start with the first task
          worker.postMessage({
            w: ctx.canvas.width,
            h: ctx.canvas.height,
            realSet: REAL_RANGE,
            imagSet: IMAG_RANGE,
            isSettingUp: false,
            mandel: mandel,
            point: juliaPoint,
            iterationCount:
              Number(shadow.host.getAttribute("iterations")) || 100,
            col: random
              ? TASKS.splice(Math.floor(Math.random() * TASKS.length), 1)[0]
              : TASKS.shift(),
          });
        });
      }

      /*##################################################*/

      /* PANNING */
      /*##################################################*/

      /* Start panning */
      ctx.canvas.addEventListener("mousedown", (e) => {
        shadow.querySelector(".contextmenu").classList.remove("show");
        // We do not want the standard behaviour here
        e.preventDefault();
        e.stopPropagation();
        // Set the start coords
        startX = e.screenX - ctx.canvas.offsetLeft;
        startY = e.screenY - ctx.canvas.offsetTop;
        // Mouse is down and canvas is now in panning mode
        isDown = true;
        if (e.ctrlKey) canvas.classList.add("panning");
      });

      /* Stop panning */
      ctx.canvas.addEventListener("mouseup", (e) => {
        // We do not want the standard behaviour here
        e.preventDefault();
        e.stopPropagation();
        // Mouse is up and canvas is not in panning mode
        isDown = false;
        canvas.classList.remove("panning");
      });

      /* Stop panning also when mouse out */
      ctx.canvas.addEventListener("mouseout", (e) => {
        // We do not want the standard behaviour here
        e.preventDefault();
        e.stopPropagation();
        // Mouse is out and canvas is not in panning mode
        isDown = false;
        canvas.classList.remove("panning");
      });

      /* Pan the mandelbrot */
      ctx.canvas.addEventListener("mousemove", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Guard
        if (!isDown || !e.ctrlKey) return;

        // Calculate the coords on the canvas and the deltas
        const distXLeft = e.screenX - ctx.canvas.offsetLeft;
        const distYTop = e.screenY - ctx.canvas.offsetTop;
        let dx = distXLeft - startX;
        let dy = distYTop - startY;

        // Change the global position vars
        startX = distXLeft;
        startY = distYTop;

        // Save canvas as image and put it on
        const dataUrl = ctx.canvas.toDataURL("image/png");
        var img = new Image();
        img.addEventListener("load", function () {
          ctx.drawImage(img, dx, dy);
        });
        img.src = dataUrl;

        // Get relative point coord bounds
        const boundsReal = [
          getRelativePoint(-dx, ctx.canvas.width, REAL_RANGE),
          getRelativePoint(ctx.canvas.width - dx, ctx.canvas.width, REAL_RANGE),
        ];

        const boundsImag = [
          getRelativePoint(-dy, ctx.canvas.height, IMAG_RANGE),
          getRelativePoint(
            ctx.canvas.height - dy,
            ctx.canvas.height,
            IMAG_RANGE
          ),
        ];

        // New range after panning
        REAL_RANGE = boundsReal;
        IMAG_RANGE = boundsImag;

        // Lets work
        startWorking(workers);
      });

      /*##################################################*/

      /* ZOOMING */
      /*##################################################*/

      /* Zoom in on canvas */
      canvas.addEventListener("wheel", (e) => {
        shadow.querySelector(".contextmenu").classList.remove("show");

        // We do not want the standard behaviour here
        e.preventDefault();
        e.stopPropagation();

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Zoom
        const zoom = e.wheelDelta > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

        // Mouse coordinate distances
        const distXLeft = x * zoom;
        const distXRight = (ctx.canvas.width - x) * zoom;
        const distYTop = y * zoom;
        const distYBot = (ctx.canvas.height - y) * zoom;

        // Get relative point coord bounds
        const boundsReal = [
          getRelativePoint(x - distXLeft, ctx.canvas.width, REAL_RANGE),
          getRelativePoint(x + distXRight, ctx.canvas.width, REAL_RANGE),
        ];

        const boundsImag = [
          getRelativePoint(y - distYTop, ctx.canvas.height, IMAG_RANGE),
          getRelativePoint(y + distYBot, ctx.canvas.height, IMAG_RANGE),
        ];

        // Mouse coords plus minus zoom width on canvas
        REAL_RANGE = boundsReal;

        // Click coords plus minus zoom height on canvas
        IMAG_RANGE = boundsImag;

        // Zoom in
        if (e.wheelDelta > 0) {
          zoomBackImages.push(
            ctx.getImageData(0, 0, canvas.width, canvas.height)
          );

          // Save canvas as image and put it on
          const dataUrl = ctx.canvas.toDataURL("image/png");
          var img = new Image();
          img.addEventListener("load", function () {
            // Draw image with some magic fomula to zoom and
            // also be placed so that it makes sense with the zooming point position
            ctx.drawImage(
              img,
              ((((distXLeft * 2) / ctx.canvas.width) * (1 / zoom)) / 2) *
                (ctx.canvas.width * (1 / zoom) - ctx.canvas.width) *
                -1,
              ((((distYTop * 2) / ctx.canvas.height) * (1 / zoom)) / 2) *
                (ctx.canvas.height * (1 / zoom) - ctx.canvas.height) *
                -1,
              ctx.canvas.width / zoom,
              ctx.canvas.height / zoom
            );
            zoomImagesUrls.push(ctx.canvas.toDataURL("image/png"));
          });
          img.src = dataUrl;
          // Zoom out
        } else {
          // Noting to do here so far; this could be tricky
        }
        startWorking(workers);
      });

      /*##################################################*/

      /* CONTROLS */
      /*##################################################*/

      shadow
        .querySelector(".canvas-controls")
        .addEventListener("click", (e) => {
          const rangeLenReal = Math.abs(REAL_RANGE[1] - REAL_RANGE[0]);
          const rangeLenImag = Math.abs(IMAG_RANGE[1] - IMAG_RANGE[0]);
          switch (e.target.className) {
            case "plus":
              zoomin: {
                // Zoom
                const zoom = ZOOM_FACTOR;

                // Get relative point coord bounds
                const boundsReal = [
                  getRelativePoint(
                    ctx.canvas.width / 2 - (canvas.width * zoom) / 2,
                    ctx.canvas.width,
                    REAL_RANGE
                  ),
                  getRelativePoint(
                    ctx.canvas.width / 2 + (canvas.width * zoom) / 2,
                    ctx.canvas.width,
                    REAL_RANGE
                  ),
                ];
                const boundsImag = [
                  getRelativePoint(
                    canvas.height / 2 - (canvas.height * zoom) / 2,
                    ctx.canvas.height,
                    IMAG_RANGE
                  ),
                  getRelativePoint(
                    canvas.height / 2 + (canvas.height * zoom) / 2,
                    ctx.canvas.height,
                    IMAG_RANGE
                  ),
                ];

                REAL_RANGE = boundsReal;
                IMAG_RANGE = boundsImag;

                zoomBackImages.push(
                  ctx.getImageData(0, 0, canvas.width, canvas.height)
                );

                // Save canvas as image and put it on
                const dataUrl = ctx.canvas.toDataURL("image/png");
                var img = new Image();
                img.addEventListener("load", function () {
                  // Draw image with some magic fomula to zoom and
                  // also be placed so that it makes sense with the zooming point position
                  ctx.drawImage(
                    img,
                    -(ctx.canvas.width / zoom - ctx.canvas.width) / 2,
                    -(ctx.canvas.height / zoom - ctx.canvas.height) / 2,
                    ctx.canvas.width / zoom,
                    ctx.canvas.height / zoom
                  );
                  zoomImagesUrls.push(ctx.canvas.toDataURL("image/png"));
                });
                img.src = dataUrl;
              }

              break;
            case "center":
              REAL_RANGE = [-2, 1];
              IMAG_RANGE = [1, -1];

              break;
            case "minus":
              zoomout: {
                // Zoom
                const zoom = 1 / ZOOM_FACTOR;

                // Get relative point coord bounds
                const boundsReal = [
                  getRelativePoint(
                    ctx.canvas.width / 2 - (canvas.width * zoom) / 2,
                    ctx.canvas.width,
                    REAL_RANGE
                  ),
                  getRelativePoint(
                    ctx.canvas.width / 2 + (canvas.width * zoom) / 2,
                    ctx.canvas.width,
                    REAL_RANGE
                  ),
                ];
                const boundsImag = [
                  getRelativePoint(
                    canvas.height / 2 - (canvas.height * zoom) / 2,
                    ctx.canvas.height,
                    IMAG_RANGE
                  ),
                  getRelativePoint(
                    canvas.height / 2 + (canvas.height * zoom) / 2,
                    ctx.canvas.height,
                    IMAG_RANGE
                  ),
                ];

                REAL_RANGE = boundsReal;
                IMAG_RANGE = boundsImag;
              }

              break;
            case "larr":
              REAL_RANGE[0] -= 0.05 * rangeLenReal;
              REAL_RANGE[1] -= 0.05 * rangeLenReal;
              break;
            case "uarr":
              IMAG_RANGE[0] += 0.05 * rangeLenImag;
              IMAG_RANGE[1] += 0.05 * rangeLenImag;
              break;
            case "darr":
              IMAG_RANGE[0] -= 0.05 * rangeLenImag;
              IMAG_RANGE[1] -= 0.05 * rangeLenImag;
              break;
            case "rarr":
              REAL_RANGE[0] += 0.05 * rangeLenReal;
              REAL_RANGE[1] += 0.05 * rangeLenReal;
              break;
            case "download":
              let link = document.createElement("a");
              link.download = mandel ? "mandelbrot.png" : "julia.png";
              link.href = ctx.canvas.toDataURL();
              link.click();
              break;
            case "fullscreen":
              toggleFullScreen(e.target.closest(".canvas-container"));
              return;
            default:
              return;
          }
          startWorking(workers);
        });

      /*##################################################*/

      /* RESIZING */
      /*##################################################*/

      /**
       * Setup resize observer to detect resizing
       * @param {Object} ctx
       * @param {Function} drawFunc
       * @param {Object} worker
       */
      function resizeableCanvas(ctx, drawFunc, workers) {
        // We start with no tasks again
        TASKS = [];
        // The observer
        const observer = new ResizeObserver(
          // Throttle the observer
          throttle((entries) => {
            entries.forEach((entry) => {
              // Save canvas as image and put it on
              const dataUrl = ctx.canvas.toDataURL("image/png");
              var img = new Image();
              img.addEventListener("load", function () {
                ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
              });
              img.src = dataUrl;

              // New width and height
              ctx.canvas.width = entry.target.offsetWidth / 1;
              ctx.canvas.height = ctx.canvas.width * (2 / 3);

              // Start working again
              drawFunc(workers);
            });
          }, 250)
        );

        // Start observing
        observer.observe(ctx.canvas);

        /**
         * Throttle Wrapper for a function
         * @param {*} cb
         * @param {*} delay
         * @returns
         */
        function throttle(cb, delay) {
          let shouldWait = false;

          return (...args) => {
            if (shouldWait) return;

            cb(...args);
            shouldWait = true;
            setTimeout(() => {
              shouldWait = false;
            }, delay);
          };
        }
      }

      /*##################################################*/

      /* HELPERS */
      /*##################################################*/

      /**
       * Get the relative point coordinates on the canvas
       * @param {number} pixel
       * @param {number} length
       * @param {Array} range
       * @returns Point coordinate
       */
      function getRelativePoint(pixel, length, range) {
        return range[0] + (pixel / length) * (range[1] - range[0]);
      }

      /**
       * Toggle fullscreen display
       * @param {*} element Element to display in fullscreen mode
       */
      function toggleFullScreen(element) {
        if (!shadow.fullscreenElement) {
          element.requestFullscreen();
        } else if (shadow.fullscreenElement) {
          document.exitFullscreen();
        }
      }

      /**
       * Generate a random color array
       * @returns Color array
       */
      function colorPalette() {
        let palette, rgb1, rgb2, rgb3;
        const paletteAttr = shadow.host.getAttribute("palette");
        switch (paletteAttr) {
          case "grayscale":
            rgb1 = [211, 211, 211]; //lightgray
            rgb2 = [(rgb1[0] * 2) / 3, (rgb1[1] * 2) / 3, (rgb1[2] * 2) / 3];
            rgb3 = [rgb1[0] / 3, rgb1[1] / 3, rgb1[2] / 3];
            break;
          case "colorful":
            rgb1 = [165, 42, 42]; //brown
            rgb2 = [70, 130, 180]; //steelblue
            rgb3 = [152, 251, 152]; //palegreen
            break;
          case "blue":
            rgb1 = [30, 144, 255]; // dodgerblue
            rgb2 = [(rgb1[0] * 2) / 3, (rgb1[1] * 2) / 3, (rgb1[2] * 2) / 3];
            rgb3 = [rgb1[0] / 3, rgb1[1] / 3, rgb1[2] / 3];
            break;
          default:
            // Colorful default
            rgb1 = [165, 42, 42]; //brown
            rgb2 = [70, 130, 180]; //steelblue
            rgb3 = [152, 251, 152]; //palegreen
        }

        palette = [
          { r: rgb1[0], g: rgb1[1], b: rgb1[2] },
          { r: rgb2[0], g: rgb2[1], b: rgb2[2] },
          { r: rgb3[0], g: rgb3[1], b: rgb3[2] },
        ];

        /** Interpolate the colors */
        function interpolation(iteration) {
          let color1 = palette[Math.floor(iteration)];
          let color2 = palette[Math.floor(iteration) + 1];
          return linear_interpolate(color1, color2, iteration % 1);
        }

        /** Linear color interpolation */
        function linear_interpolate(color1, color2, ratio) {
          let r = Math.floor((color2.r - color1.r) * ratio + color1.r);
          let g = Math.floor((color2.g - color1.g) * ratio + color1.g);
          let b = Math.floor((color2.b - color1.b) * ratio + color1.b);
          return [r, g, b];
        }

        return new Array(16)
          .fill(0)
          .map((_, i) =>
            i === 0 ? [0, 0, 0] : interpolation((i / 16) * (palette.length - 1))
          );
      }

      /*##################################################*/
    }
  }

  disconnectedCallback() {
    // Maybe remove eventlisteners
  }

  adoptedCallback() {
    // Noting to do here
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Noting to do here
  }
}

customElements.define("mandelbrot-widget", MandelbrotWidget);
