'use strict';

import BasePage from './BasePage.js';

/**
 * HomePage
 * Encapsulates every selector and action for https://www.cheapflights.com.au/
 *
 * Rule: specs call METHODS, never raw selectors.
 * If Cheapflights redesigns their DOM, fix it here — not in every spec.
 */
class HomePage extends BasePage {
    // ─── Selectors ─────────────────────────────────────────────────────────────

    get logo() {
        // The site logo is typically an <a> wrapping an <img> or an SVG in the header
        return $('header [class*="logo"], header [aria-label*="Cheapflights"], ' +
                  'a[href="/"] img, [data-testid*="logo"]');
    }

    get loginButton() {
        // Look for login link - try multiple selector strategies
        return $(
            'a[href*="login"], a[href*="signin"], a[href*="account"], ' +
            'button[class*="login"], button[class*="signin"], ' +
            '[data-testid*="login"], [data-testid*="account"], ' +
            '[aria-label*="log in"], [aria-label*="account"], ' +
            'span[class*="login"], div[class*="login"] a'
        );
    }

    get originInput() {
        // Match various possible selectors for the "from" airport input
        return $(
            'input[placeholder*="From"], input[placeholder*="from"], ' +
            'input[placeholder*="Depart"], input[placeholder*="depart"], ' +
            '[data-testid*="origin"], [aria-label*="origin"], ' +
            '[aria-label*="from"], input[name*="origin"], ' +
            'input[id*="origin"], input[class*="origin"]'
        );
    }

    get destinationInput() {
        // Match various possible selectors for the "to" airport input
        return $(
            'input[placeholder*="To"], input[placeholder*="to"], ' +
            'input[placeholder*="Arrive"], input[placeholder*="arrive"], ' +
            '[data-testid*="destination"], [aria-label*="destination"], ' +
            '[aria-label*="to"], input[name*="destination"], ' +
            'input[id*="destination"], input[class*="destination"]'
        );
    }

    get departureDateInput() {
        return $('[data-testid="depart-input"], input[placeholder*="Depart"], ' +
                 '[aria-label*="Departure date"]');
    }

    get searchButton() {
        return $(
            'button[type="submit"], [data-testid*="search-btn"], [data-testid*="search"], ' +
            'button[class*="search"], [aria-label*="search"]'
        );
    }

    get tripTypeOneWay() {
        return $(
            '[data-testid="trip-type-one-way"], [data-testid="one-way"], ' +
            'label[class*="one-way"], button[class*="one-way"], ' +
            '[aria-label*="one way"]'
        );
    }

    // ─── Actions ────────────────────────────────────────────────────────────────

    /** Navigate to the home page */
    async open() {
        await super.open('/');
        await this.waitForTitle(/cheap\s*flights/i);
    }

    /** @returns {boolean} whether the site logo is rendered */
    async isLogoVisible() {
        try {
            const el = await this.logo;
            return await el.isDisplayed();
        } catch (_) {
            return false;
        }
    }

    /** @returns {boolean} whether the login / sign-in link is visible */
    async isLoginButtonVisible() {
        try {
            const el = await this.loginButton;
            return await el.isDisplayed();
        } catch (_) {
            return false;
        }
    }

    /**
     * Fill the flight search form and submit.
     *
     * @param {object} opts
     * @param {string} opts.origin       Origin city / airport name
     * @param {string} opts.destination  Destination city / airport name
     * @param {string} opts.date         ISO date string "YYYY-MM-DD"
     * @param {boolean} [opts.oneWay]    Select one-way trip type (default true)
     */
    async searchFlights({ origin, destination, date, oneWay = true }) {
        if (oneWay) {
            try {
                const tripBtn = await this.tripTypeOneWay;
                if (await tripBtn.isDisplayed()) await tripBtn.click();
            } catch (_) { /* already one-way or not available */ }
        }

        // Origin — increased timeout for form to load on live site
        const originEl = await this.waitForVisible(
            '[data-testid="origin-input"], input[placeholder*="From"], ' +
            '[aria-label*="Origin"], [name="origin"]',
            20000
        );
        await originEl.clearValue();
        await originEl.setValue(origin);
        await browser.pause(800); // wait for autocomplete
        // Select first autocomplete suggestion
        await this._selectFirstAutocomplete();

        // Destination — increased timeout for form to load
        const destEl = await this.waitForVisible(
            '[data-testid="destination-input"], input[placeholder*="To"], ' +
            '[aria-label*="Destination"], [name="destination"]',
            20000
        );
        await destEl.clearValue();
        await destEl.setValue(destination);
        await browser.pause(800);
        await this._selectFirstAutocomplete();

        // Date — attempt to type into the date field; fall back if it's a datepicker
        try {
            const dateEl = await this.departureDateInput;
            if (await dateEl.isDisplayed()) {
                await dateEl.click();
                await dateEl.setValue(date);
                // Close any open date picker by pressing Escape
                await browser.keys('Escape');
            }
        } catch (_) { /* date field may not be mandatory in some flows */ }

        // Submit — increased timeout for search button to appear
        const searchBtn = await this.waitForVisible(
            'button[type="submit"], [data-testid*="search-btn"], [data-testid*="search"], ' +
            'button[class*="search"], [aria-label*="search"]',
            20000
        );
        await searchBtn.click();
    }

    // ─── Private helpers ────────────────────────────────────────────────────────

    /** Click the first item in an autocomplete dropdown, if one appears. */
    async _selectFirstAutocomplete() {
        try {
            const suggestion = await $(
                '[data-testid*="suggestion"]:first-child, ' +
                '[class*="autocomplete"] li:first-child, ' +
                '[role="option"]:first-child, ' +
                '[class*="dropdown"] li:first-child'
            );
            await suggestion.waitForDisplayed({ timeout: 3000 });
            await suggestion.click();
        } catch (_) {
            // No dropdown appeared — typed value accepted as-is
            await browser.keys('Tab');
        }
    }
}

export default new HomePage();