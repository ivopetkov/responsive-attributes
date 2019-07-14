/*
 * Responsive Attributes
 * http://ivopetkov.com/
 * Copyright (c) Ivo Petkov
 * Free to use under the MIT license.
 */

responsiveAttributes = (function () {

    var cache = [];

    var parseAttributeValue = function (value) {
        if (typeof cache[value] === 'undefined') {
            var parts = value.split(',');
            var partsCount = parts.length;
            var result = [];
            for (var i = 0; i < partsCount; i++) {
                var parts2 = parts[i].split('=>');
                if (typeof parts2[0] !== 'undefined' && typeof parts2[1] !== 'undefined') {
                    var expression = parts2[0].trim();
                    if (expression.length > 0) {
                        var parts3 = parts2[1].split('=');
                        if (typeof parts3[0] !== 'undefined' && typeof parts3[1] !== 'undefined') {
                            var attributeName = parts3[0].trim();
                            if (attributeName.length > 0) {
                                var attributeValue = parts3[1].trim();
                                if (attributeValue.length > 0) {
                                    if (typeof result[attributeName] === 'undefined') {
                                        result[attributeName] = [];
                                    }
                                    result[attributeName].push([expression, attributeValue]);
                                }
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
        for (var i = 0; i < 100; i++) {
            var key = 'f' + functions.length;
            var match = expression.match(/f\((.*?)\)/);
            if (match === null) {
                break;
            }
            expression = expression.replace(match[0], key);
            functions.push([key, match[1]]);
        }
        expression = expression
            .split('w').join(details.width)
            .split('h').join(details.height);
        for (var i = functions.length - 1; i >= 0; i--) {
            var f = functions[i];
            expression = expression.replace(f[0], f[1] + '(element,details)');
        }
        return (new Function('element', 'details', 'return ' + expression))(element, details);
    };

    var run = function () {
        var elements = document.querySelectorAll('[data-responsive-attributes]');
        var elementsCount = elements.length;
        for (var i = 0; i < elementsCount; i++) {
            var element = elements[i];
            var rectangle = element.getBoundingClientRect();
            var details = {
                'width': rectangle.width,
                'height': rectangle.height
            };
            var data = parseAttributeValue(element.getAttribute('data-responsive-attributes'));
            for (var attributeName in data) {
                var attributeValue = element.getAttribute(attributeName);
                if (attributeValue === null) {
                    attributeValue = '';
                }
                var attributeValueParts = attributeValue.length > 0 ? attributeValue.split(' ') : [];
                var values = data[attributeName];
                var valuesCount = values.length;
                for (var k = 0; k < valuesCount; k++) {
                    var value = values[k][1];
                    var add = checkExpression(element, values[k][0], details);
                    var found = false;
                    var attributeValuePartsCount = attributeValueParts.length;
                    for (var m = 0; m < attributeValuePartsCount; m++) {
                        if (attributeValueParts[m] === value) {
                            if (add) {
                                found = true;
                            } else {
                                attributeValueParts.splice(m, 1);
                            }
                            break;
                        }
                    }
                    if (add && !found) {
                        attributeValueParts.push(value);
                    }
                }

                element.setAttribute(attributeName, attributeValueParts.join(' '));
            }
        }
    };

    var attachEvents = function () {
        window.addEventListener('resize', run);
        window.addEventListener('load', run);
        if (typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(function () {
                run();
            });
            observer.observe(document.querySelector('body'), { childList: true, subtree: true });
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachEvents);
    } else {
        attachEvents();
    }

    return { 'run': run };

}());