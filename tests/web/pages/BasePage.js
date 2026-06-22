'use strict';

/**
 * BasePage
 * Provides common helpers (open, waitForVisible, etc.) that every
 * Page Object inherits.  Concrete pages never call $() directly in specs.
 */
class BasePage {
    /**
     * Navigate to a path relative to the configured baseUrl.
     * @param {string} path  e.g. '/' or '/flights'
     */
    async open(path = '/') {
        await browser.url(path);
        // Dismiss cookie/consent banners that might block interactions
        await this._dismissConsentBanner();
    }

    /**
     * Best-effort consent banner dismissal.
     * Cheapflights uses a GDPR-style overlay; clicking "Accept" (or equivalent)
     * unblocks the page without failing the test if the banner isn't present.
     */
    async _dismissConsentBanner() {
        try {
            const acceptBtn = await $('[id*="didomi"] button[aria-label*="Agree"],' +
                                      '[class*="CookieConsent"] button,' +
                                      'button[aria-label*="Accept"],' +
                                      '#onetrust-accept-btn-handler');
            if (await acceptBtn.isDisplayed()) {
                await acceptBtn.click();
                await browser.pause(500);
            }
        } catch (_) {
            // Banner not present — carry on
        }
    }

    /**
     * Wait for an element to exist and be visible, then return it.
     * @param {string} selector  CSS or WDIO selector
     * @param {number} timeout   ms (default 10 s)
     */
    async waitForVisible(selector, timeout = 10000) {
        const el = await $(selector);
        await el.waitForDisplayed({ timeout });
        return el;
    }

    /**
     * Wait for the page's <title> to contain a string.
     * @param {string|RegExp} matcher
     */
    async waitForTitle(matcher) {
        await browser.waitUntil(
            async () => {
                const title = await browser.getTitle();
                return typeof matcher === 'string'
                    ? title.toLowerCase().includes(matcher.toLowerCase())
                    : matcher.test(title);
            },
            { timeout: 15000, timeoutMsg: `Page title did not match ${matcher}` }
        );
    }
}

export default BasePage;