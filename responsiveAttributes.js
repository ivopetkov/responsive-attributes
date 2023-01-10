/*
 * Responsive Attributes
 * http://ivopetkov.com/
 * Copyright (c) Ivo Petkov
 * Free to use under the MIT license.
 */

var responsiveAttributes = typeof responsiveAttributes !== 'undefined' ? responsiveAttributes : (function () {

    var cache = [];

    var parseAttributeValue = function (value) { // {atttibuteName1:[[expression1,value1], [expression2,value2]], atttibuteName2:[[expression3,value3]]}
        if (typeof cache[value] === 'undefined') {
            var parts = value.split(','); // multiple rules are separated by ','
            var partsCount = parts.length;
            var result = {};
            for (var i = 0; i < partsCount; i++) {
                var parts2 = parts[i].split('=>'); // on the left of '=>' is the expression to check, on the right is the attribute to set
                if (typeof parts2[0] !== 'undefined' && typeof parts2[1] !== 'undefined') {
                    var expression = parts2[0].trim();
                    if (expression.length > 0) {
                        var parts3 = parts2[1].split('=');
                        if (typeof parts3[0] !== 'undefined') {
                            var attributeName = parts3[0].trim();
                            if (attributeName.length > 0) {
                                var attributeValue = typeof parts3[1] !== 'undefined' ? parts3[1].trim() : '';
                                if (typeof result[attributeName] === 'undefined') {
                                    result[attributeName] = [];
                                }
                                result[attributeName].push([expression, attributeValue]);
                            }
                        }
                    }
                }
            }
            cache[value] = result;
        }
        return cache[value];
    };

    var checkExpression = function (element, expression, details) {
        var functions = [];
        for (var i = 0; i < 1000; i++) {
            var key = 'f' + functions.length;
            var match = expression.match(/f\((.*?)\)/);
            if (match === null) {
                break;
            }
            expression = expression.replace(match[0], key);
            functions.push([key, match[1]]);
        }
        var querySelectors = [];
        for (var i = 0; i < 1000; i++) {
            var key = 'q' + querySelectors.length;
            var match = expression.match(/q\((.*?)\)/);
            if (match === null) {
                break;
            }
            expression = expression.replace(match[0], key);
            querySelectors.push([key, match[1]]);
        }
        expression = expression
            .split('vw').join(window.innerWidth)
            .split('w').join(details.width)
            .split('vh').join(window.innerHeight)
            .split('h').join(details.height);
        for (var i = functions.length - 1; i >= 0; i--) {
            var f = functions[i];
            expression = expression.replace(f[0], f[1] + '(element,details)');
        }
        for (var i = querySelectors.length - 1; i >= 0; i--) {
            var f = querySelectors[i];
            var result = document.querySelector(f[1]) !== null;
            expression = expression.replace(f[0], result ? 'true' : 'false');
        }
        try {
            return (new Function('element', 'details', 'return ' + expression))(element, details);
        } catch (e) {
            return false;
        }
    };

    var elementAttributesObserver = null;
    var elementsWithAttachedMutationObservers = [];

    var running = false;
    var run = function () {
        if (running) {
            return;
        }
        running = true;
        var elements = document.querySelectorAll('[data-responsive-attributes]');
        var elementsCount = elements.length;
        for (var i = 0; i < elementsCount; i++) {
            var element = elements[i];
            var rectangle = element.getBoundingClientRect();
            var details = {
                'width': rectangle.width,
                'height': rectangle.height
            };
            var update = function (attributeValue) {
                var data = parseAttributeValue(attributeValue);
                for (var attributeName in data) {
                    var newValue = null;
                    var expressions = data[attributeName];
                    var expressionsCount = expressions.length;
                    for (var j = 0; j < expressionsCount; j++) {
                        if (checkExpression(element, expressions[j][0], details)) {
                            newValue = expressions[j][1];
                        }
                    }
                    if (newValue === null) {
                        element.removeAttribute(attributeName);
                    } else if (element.getAttribute(attributeName) !== newValue) {
                        element.setAttribute(attributeName, newValue);
                    }
                }
            };
            var attributeValue = element.getAttribute('data-responsive-attributes');
            if (attributeValue === '*') {
                var elementAttributes = element.attributes;
                for (var j = 0; j < elementAttributes.length; j++) {
                    var elementAttribute = elementAttributes[j];
                    if (elementAttribute.name.indexOf('data-responsive-attributes-') === 0) {
                        update(elementAttribute.value);
                    }
                }
            } else {
                update(attributeValue);
            }
            if (elementAttributesObserver !== null && elementsWithAttachedMutationObservers.indexOf(element) === -1) {
                elementsWithAttachedMutationObservers.push(element);
                elementAttributesObserver.observe(element, { attributes: true });
            }
        }
        running = false;
    };

    if (typeof MutationObserver !== 'undefined') {
        elementAttributesObserver = new MutationObserver(function (mutationList) {
            var update = false;
            for (var mutation of mutationList) {
                if (mutation.type === 'attributes') {
                    if (mutation.attributeName.indexOf('data-responsive-attributes') === 0) {
                        update = true;
                    }
                }
            }
            if (update) {
                run();
            }
        });
    }

    var attachEvents = function () {
        window.addEventListener('resize', run);
        window.addEventListener('load', run);
        window.addEventListener('orientationchange', run);
        if (typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(function () {
                run();
            });
            observer.observe(document.querySelector('body'), { childList: true, subtree: true });
        }
    };

    document.addEventListener('readystatechange', () => {
        if (document.readyState === 'interactive') {
            attachEvents();
        }
        run();
    });
    if (document.readyState === 'complete') {
        attachEvents();
    }
    run();

    return { 'run': run };

}());