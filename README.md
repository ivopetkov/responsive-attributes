# Responsive attributes
Make element's attributes responsive.

## Usage

Include the library.
```html
<script src="responsiveAttributes.min.js"/>
```

Add the `data-responsive-attributes` attribute to the target element.
```html
<div data-responsive-attributes="..."></div>
```

**Attribute format:**

EXPRESSION=>ATTRIBUTE_NAME=ATTRIBUTE_VALUE

**Expression properties:**

w - element's width

h - element's height

vw - viewport's width

vh - viewport's height

f(FUNCTION_NAME) - function to call

q(QUERY_SELECTOR) - query selector to run

## Examples


### 1. Check element's width
If the element's width is lower than 200px set attribute `data-size=small`.
```html
<div data-responsive-attributes="w<200=>data-size=small"></div>
```

If the element's width is higher than 200px and lower than 500px set attribute `data-size=medium`.
```html
<div data-responsive-attributes="w>200&&w<=500=>data-size=medium"></div>
```

### 2. Check viewport's width
If viewport's width is lower than 200px set attribute `data-size=small`.
```html
<div data-responsive-attributes="vw<200=>data-size=small"></div>
```

If viewport's width is higher than 200px and lower than 500px set attribute `data-size=medium`.
```html
<div data-responsive-attributes="vw>200&&vw<=500=>data-size=medium"></div>
```

### 3. Run custom check
Call a JS function to check if the `data-size` attribute should be set.
```html
<script>
    function check1(element, details) {
        return details.width < 300;
    }
</script>
<div data-responsive-attributes="f(check1)=>data-size=small"></div>
```

### 4. Run a query selector
Run a query selector. If the result is not empty the `data-size` attribute will be set.
```html
<div data-responsive-attributes="q(body[data-loaded=1])=>data-size=small"></div>
```

### 5. Multiple rules
If the element's width is lower than 200px set attribute `data-width=small`. If the element's height is lower than 200px set attribute `data-height=small`.
```html
<div data-responsive-attributes="w<200=>data-width=small,h<200=>data-height=small"></div>
```