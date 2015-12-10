import $ from 'jquery';
import _ from 'lodash';
import collapsibleFactory from '../common/collapsible';
import collapsibleGroupFactory from '../common/collapsible-group';
import mediaQueryListFactory from '../common/media-query-list';
import { CartPreviewEvents } from './cart-preview';

const PLUGIN_KEY = 'mobilemenu';

function optionsFromData($element) {
   const mobileMenuId = $element.data(PLUGIN_KEY);

   return {
       menuSelector: mobileMenuId && `#${mobileMenuId}`,
   };
}

/*
 * Manage the behaviour of a mobile menu
 * @param {jQuery} $trigger
 * @param {Object} [options]
 * @param {Object} [options.bodySelector]
 * @param {Object} [options.headerSelector]
 * @param {Object} [options.menuSelector]
 * @param {Object} [options.scrollViewSelector]
 */
export class MobileMenu {
    constructor($trigger, {
        bodySelector = 'body',
        headerSelector = '.header',
        menuSelector = '#menu',
        scrollViewSelector = '.navPages',
    } = {}) {
        this.$body = $(bodySelector);
        this.$menu = $(menuSelector);
        this.$header = $(headerSelector);
        this.$scrollView = $(scrollViewSelector, this.$menu);
        this.$trigger = $trigger;
        this.mediumMediaQueryList = mediaQueryListFactory('medium');

        // Init collapsible
        this.collapsibles = collapsibleFactory('[data-collapsible]', { $context: this.$menu });
        this.collapsibleGroups = collapsibleGroupFactory(menuSelector);

        // Auto-bind
        this.onTriggerClick = this.onTriggerClick.bind(this);
        this.onMenuClick = this.onMenuClick.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.onCartPreviewOpen = this.onCartPreviewOpen.bind(this);
        this.onMediumMediaQueryMatch = this.onMediumMediaQueryMatch.bind(this);

        // Listen
        this.bindEvents();
    }

    get isOpen() {
        return this.$menu.hasClass('is-open');
    }

    bindEvents() {
        this.$trigger.on('click', this.onTriggerClick);
        this.$menu.on('click', this.onMenuClick);
        this.$header.on(CartPreviewEvents.open, this.onCartPreviewOpen);

        $(document).on('click', this.onDocumentClick);

        if (this.mediumMediaQueryList && this.mediumMediaQueryList.addListener) {
            this.mediumMediaQueryList.addListener(this.onMediumMediaQueryMatch);
        }
    }

    unbindEvents() {
        this.$trigger.off('click', this.onTriggerClick);
        this.$menu.off('click', this.onMenuClick);
        this.$header.off(CartPreviewEvents.open, this.onCartPreviewOpen);

        $(document).off('click', this.onDocumentClick);

        if (this.mediumMediaQueryList && this.mediumMediaQueryList.addListener) {
            this.mediumMediaQueryList.removeListener(this.onMediumMediaQueryMatch);
        }
    }

    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.$body.addClass('has-activeNavPages');

        this.$trigger
            .addClass('is-open')
            .attr('aria-expanded', true);

        this.$menu
            .addClass('is-open')
            .attr('aria-hidden', false);

        this.$header.addClass('is-open');
        this.$scrollView.scrollTop(0);
    }

    hide() {
        this.$body.removeClass('has-activeNavPages');

        this.$trigger
            .removeClass('is-open')
            .attr('aria-expanded', false);

        this.$menu
            .removeClass('is-open')
            .attr('aria-hidden', true);

        this.$header.removeClass('is-open');
    }

    // Private
    onTriggerClick(event) {
        event.preventDefault();

        this.toggle();
    }

    onMenuClick(event) {
        event.stopPropagation();
    }

    onDocumentClick() {
        this.collapsibleGroups.forEach(group => group.close());
    }

    onCartPreviewOpen() {
        if (this.isOpen) {
            this.hide();
        }
    }

    onMediumMediaQueryMatch(media) {
        if (!media.matches) {
            return;
        }

        this.hide();
    }
}

/*
 * Create a new MobileMenu instance
 * @param {string} [selector]
 * @param {Object} [options]
 * @param {Object} [options.bodySelector]
 * @param {Object} [options.headerSelector]
 * @param {Object} [options.menuSelector]
 * @param {Object} [options.scrollViewSelector]
 * @return {MobileMenu}
 */
export default function mobileMenuFactory(selector = `[data-${PLUGIN_KEY}]`, overrideOptions = {}) {
    const $trigger = $(selector).eq(0);
    const instanceKey = `${PLUGIN_KEY}-instance`;
    const cachedMobileMenu = $trigger.data(instanceKey);

    if (cachedMobileMenu instanceof MobileMenu) {
        return cachedMobileMenu;
    }

    const options = _.extend(optionsFromData($trigger), overrideOptions);
    const mobileMenu = new MobileMenu($trigger, options);

    $trigger.data(instanceKey, mobileMenu);

    return mobileMenu;
}
