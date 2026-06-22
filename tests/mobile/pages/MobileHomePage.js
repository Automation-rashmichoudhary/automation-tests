'use strict';

import BasePage from './BasePage';

/**
 * MobileHomePage
 * Mirrors HomePage.js but uses Appium-friendly selectors.
 *
 * Selector priority order used throughout:
 *   1. accessibility id  (~)          — most stable, set by devs intentionally
 *   2. id                             — stable if the app sets resource-ids
 *   3. xpath                          — last resort, fragile but universal
 *
 * Note: cheapflights.com.au is a mobile WEB app (not a native app),
 * so selectors are still CSS/XPath but driven through Appium's browser context.
 */
class MobileHomePage extends BasePage {

    // ─── Selectors ─────────────────────────────────────────────────────────────

    get logo() {
        return $('~cheapflights-logo') ||
               $('[data-testid*="logo"]') ||
               $('//android.webkit.WebView//img[contains(@alt,"Cheapflights")]');
    }

    get loginButton() {
        return $('~Log in') ||
               $('[data-testid*="login"]') ||
               $('//android.webkit.WebView//*[contains(@text,"Log in")]');
    }

    get originInput() {
        return $('~origin-input') ||
               $('[data-testid="origin-input"]') ||
               $('//android.webkit.WebView//input[contains(@placeholder,"From")]');
    }

    get destinationInput() {
        return $('~destination-input') ||
               $('[data-testid="destination-input"]') ||
               $('//android.webkit.WebView//input[contains(@placeholder,"To")]');
    }

    get departureDateInput() {
        return $('~depart-input') ||
               $('[data-testid="depart-input"]') ||
               $('//android.webkit.WebView//input[contains(@placeholder,"Depart")]');
    }

    get searchButton() {
        return $('~search-button') ||
               $('[data-testid*="search-btn"]') ||
               $('//android.webkit.WebView//button[@type="submit"]');
    }

    get tripTypeOneWay() {
        return $('~trip-type-one-way') ||
               $('[data-testid="trip-type-one-way"]') ||
               $('//android.webkit.WebView//*[contains(@text,"One way")]');
    }

    // ─── Actions ────────────────────────────────────────────────────────────────

    /** Navigate to the mobile home page */
    async open() {
        await super.open('/');
        await this.waitForTitle('Cheapflights');
    }

    /** @returns {boolean} whether the logo is visible */
    async isLogoVisible() {
        try {
            const el = await this.logo;
            return await el.isDisplayed();
        } catch (_) {
            return false;
        }
    }

    /** @returns {boolean} whether the login button is visible */
    async isLoginButtonVisible() {
        try {
            const el = await this.loginButton;
            return await el.isDisplayed();
        } catch (_) {
            return false;
        }
    }

    /**
     * Fill and submit the flight search form on mobile.
     * Uses tap() instead of click()
     * **
     * Fill and submit the flight search form on mobile.
     * Uses tap() instead of click() and handles the soft keyboard.
     *
     * @param {object} opts
     * @param {string} opts.origin
     * @param {string} opts.destination
     * @param {string} opts.date         ISO string "YYYY-MM-DD"
     * @param {boolean} [opts.oneWay]
     */
    async searchFlights({ origin, destination, date, oneWay = true }) {
        if (oneWay) {
            try {
                const tripBtn = await this.tripTypeOneWay;
                if (await tripBtn.isDisplayed()) await tripBtn.click();
            } catch (_) { /* already one-way or not present */ }
        }

        // Origin
        const originEl = await this.waitForVisible(
            '[data-testid="origin-input"], input[placeholder*="From"]'
        );
        await originEl.clearValue();
        await originEl.setValue(origin);
        await browser.pause(800);
        await this._selectFirstAutocomplete();

        // Destination
        const destEl = await this.waitForVisible(
            '[data-testid="destination-input"], input[placeholder*="To"]'
        );
        await destEl.clearValue();
        await destEl.setValue(destination);
        await browser.pause(800);
        await this._selectFirstAutocomplete();

        // Dismiss soft keyboard before interacting with date
        await this._hideKeyboard();

        // Date
        try {
            const dateEl = await this.departureDateInput;
            if (await dateEl.isDisplayed()) {
                await dateEl.click();
                await dateEl.setValue(date);
                await this._hideKeyboard();
            }
        } catch (_) { /* date field optional in some flows */ }

        // Submit
        const searchBtn = await this.waitForVisible(
            '[data-testid*="search-btn"], button[type="submit"]'
        );
        await searchBtn.click();
    }

    // ─── Mobile-specific helpers ─────────────────────────────────────────────────

    /**
     * Dismiss the soft keyboard if it is currently shown.
     * Safe to call even when the keyboard is not visible.
     */
    async _hideKeyboard() {
        try {
            await driver.hideKeyboard();
        } catch (_) {
            // Keyboard not present or driver doesn't support it — carry on
        }
    }

    /**
     * Tap the first autocomplete suggestion.
     * Falls back to hiding the keyboard and pressing Tab if no dropdown appears.
     */
    async _selectFirstAutocomplete() {
        try {
            const suggestion = await $(
                '[data-testid*="suggestion"]:first-child, ' +
                '[role="option"]:first-child, ' +
                '[class*="autocomplete"] li:first-child'
            );
            await suggestion.waitForDisplayed({ timeout: 3000 });
            await suggestion.click();
        } catch (_) {
            await this._hideKeyboard();
            await browser.keys('Tab');
        }
    }

    /**
     * Scroll down by a fixed pixel amount.
     * Useful when result cards are below the fold on a small viewport.
     * @param {number} pixels
     */
    async scrollDown(pixels = 300) {
        await browser.execute(`window.scrollBy(0, ${pixels})`);
    }
}

module.exports = new MobileHomePage();