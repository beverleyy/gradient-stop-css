# Gradient stop (CSS)
Get the exact color at a given point of a given gradient

## How to use

1. Link to `gradient_stop.js` in your HTML or use a CDN:

```html
<script src="/path/to/gradient_stop.js"></script>
```
```html
<script src="https://cdn.jsdelivr.net/gh/beverleyy/gradient-stop-css@master/js/gradient_stop.js"></script>
```

2. Add the gradient element to your HTML
3. Call `var color = randomGradient(randFloat,gradient)` in your Javascript

## Inputs and outputs

`color` returns an RGB triplet representing the color output from the function, example `255,255,255` for white

`randFloat` is a floating point number between `0` and `1`, for example `0.5`, that describes the point in the gradient that you would like to calculate the color at

`gradient` is the selector for the gradient background in question

## Example

```html
<div id="theDiv"></div>
```

```css
#theDiv {
    background:linear-gradient(1rad, #00274c, #ffcb05);
}
```

```javascript
var theLocation = 0.5;  //midpoint of gradient
var theGradient = document.getElementById("theDiv");
var theColor = randomGradient(theLocation,theGradient);
console.log(theColor); // 128,121,41
```

## Demo

[Codepen](https://codepen.io/orbitalnight/pen/YzZQMjX)