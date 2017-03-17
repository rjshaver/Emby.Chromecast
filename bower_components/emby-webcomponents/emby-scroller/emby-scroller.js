﻿define(['scroller', 'dom', 'layoutManager', 'inputManager', 'focusManager', 'registerElement'], function (scroller, dom, layoutManager, inputManager, focusManager) {
    'use strict';

    var ScrollerProtoType = Object.create(HTMLDivElement.prototype);

    ScrollerProtoType.createdCallback = function () {
        this.classList.add('emby-scroller');
    };

    function initCenterFocus(elem, scrollerInstance) {

        dom.addEventListener(elem, 'focus', function (e) {

            var focused = focusManager.focusableParent(e.target);

            if (focused) {
                scrollerInstance.toCenter(focused);
            }

        }, {
            capture: true,
            passive: true
        });
    }

    ScrollerProtoType.scrollToBeginning = function () {
        if (this.scroller) {
            this.scroller.slideTo(0, true);
        }
    };
    ScrollerProtoType.toStart = function (elem, immediate) {
        if (this.scroller) {
            this.scroller.toStart(elem, immediate);
        }
    };

    ScrollerProtoType.scrollToPosition = function (pos, immediate) {
        if (this.scroller) {
            this.scroller.slideTo(pos, immediate);
        }
    };

    ScrollerProtoType.getScrollPosition = function () {
        if (this.scroller) {
            return this.scroller.getScrollPosition();
        }
    };

    function onInputCommand(e) {

        var cmd = e.detail.command;

        if (cmd === 'home') {
            focusManager.focusFirst(this, '.' + this.getAttribute('data-navcommands'));
            e.preventDefault();
            e.stopPropagation();
        }
        else if (cmd === 'end') {
            focusManager.focusLast(this, '.' + this.getAttribute('data-navcommands'));
            e.preventDefault();
            e.stopPropagation();
        }
        else if (cmd === 'pageup') {
            focusManager.moveFocus(e.target, this, '.' + this.getAttribute('data-navcommands'), -12);
            e.preventDefault();
            e.stopPropagation();
        }
        else if (cmd === 'pagedown') {
            focusManager.moveFocus(e.target, this, '.' + this.getAttribute('data-navcommands'), 12);
            e.preventDefault();
            e.stopPropagation();
        }
    }

    ScrollerProtoType.attachedCallback = function () {

        if (this.getAttribute('data-navcommands')) {
            inputManager.on(this, onInputCommand);
        }

        var horizontal = this.getAttribute('data-horizontal') !== 'false';

        var slider = this.querySelector('.scrollSlider');

        if (horizontal) {
            slider.style['white-space'] = 'nowrap';
        }

        var options = {
            horizontal: horizontal,
            mouseDragging: 1,
            mouseWheel: this.getAttribute('data-mousewheel') !== 'false',
            touchDragging: 1,
            slidee: slider,
            scrollBy: 200,
            speed: horizontal ? 300 : 270,
            //immediateSpeed: pageOptions.immediateSpeed,
            elasticBounds: 1,
            dragHandle: 1,
            scrollWidth: 5000000,
            autoImmediate: true,
            skipSlideToWhenVisible: this.getAttribute('data-skipfocuswhenvisible') === 'true',
            dispatchScrollEvent: this.getAttribute('data-scrollevent') === 'true'
        };

        // If just inserted it might not have any height yet - yes this is a hack
        var self = this;
        setTimeout(function () {
            self.scroller = new scroller(self, options);
            self.scroller.init();

            var centerFocus = self.getAttribute('data-centerfocus');
            if (centerFocus && layoutManager.tv) {
                initCenterFocus(self, self.scroller);
            }
        }, 0);
    };

    ScrollerProtoType.detachedCallback = function () {

        if (this.getAttribute('data-navcommands')) {
            inputManager.off(this, onInputCommand);
        }

        var scrollerInstance = this.scroller;
        if (scrollerInstance) {
            scrollerInstance.destroy();
            this.scroller = null;
        }
    };

    document.registerElement('emby-scroller', {
        prototype: ScrollerProtoType,
        extends: 'div'
    });
});