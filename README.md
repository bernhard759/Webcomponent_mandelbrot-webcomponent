## Mandelbrot Webcomponent
This is a webcomponent that displays the mandelbrot set in an interactive widget. You can customize the widget using some attributes like `width` and `palette` (colors, possible values are `grayscale`, `blue` and `colorful`). By holding the Ctrl key and scrolling with the mouse wheel, one can zoom in on the mandelbrot set. You can also switch to the julia set by right clicking on any place inside the canvas.

### Usage

```html
<script src="https://cdn.jsdelivr.net/gh/bernhard759/Webcomponent_mandelbrot-webcomponent/public/dist/mandelbrot-widget.min.js" defer></script>
...
<mandelbrot-widget width="800" palette="colorful"></mandelbrot-widget>
```
