// Global vars for worker state management
let WIDTH, HEIGHT, REAL_RANGE, IMAG_RANGE, REAL_RANGE_LEN, IMAG_RANGE_LEN, MAX_ITERATION_COUNT;

/* Message eventlistener */
self.addEventListener("message", function (messageEvent) {
  // Setup
  const { w, h, realSet, imagSet, isSettingUp, mandel, point, iterationCount } = messageEvent.data;
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
