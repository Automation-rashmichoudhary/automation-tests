'use strict';

import BasePage from './BasePage.js';

/**
 * SearchResultsPage
 * Selectors and assertions for the flight search results page.
 */
class SearchResultsPage extends BasePage {
    // ─── Selectors ─────────────────────────────────────────────────────────────

    get resultCards() {
        // Each flight result is typically a list item or article-like card
        return $$('[data-testid*="result"], [class*="Result"], ' +
                  '[class*="flight-card"], [class*="FlightCard"], ' +
                  'article[class*="result"], li[class*="result"]');
    }

    get firstResultPrice() {
        return $('[data-testid*="price"]:first-of-type, ' +
                 '[class*="Price"]:first-of-type, ' +
                 '[class*="price"]:first-of-type, ' +
                 '[aria-label*="price"]:first-of-type');
    }

    get loadingSpinner() {
        return $('[data-testid*="loading"], [class*="loading"], ' +
                 '[class*="spinner"], [aria-label*="Loading"], [role="progressbar"]');
    }

    get noResultsMessage() {
        return $('[data-testid*="no-results"], [class*="noResults"], ' +
                 '*=No results, *=no flights found');
    }

    get searchSummary() {
        // The header that echoes back the search (e.g. "Sydney → Melbourne")
        return $('[data-testid*="search-summary"], [class*="SearchHeader"], ' +
                 '[class*="route"], h1[class*="header"]');
    }

    // ─── Actions / Assertions ───────────────────────────────────────────────────

    /**
     * Wait for the results page to finish loading.
     * Waits for the spinner to disappear, then for at least one card to appear.
     */
    async waitForResults(timeout = 30000) {
        // 1. Wait for spinner to go away
        try {
            const spinner = await this.loadingSpinner;
            await spinner.waitForDisplayed({ timeout: 5000 });
            await spinner.waitForDisplayed({ timeout, reverse: true });
        } catch (_) {
            // Spinner may not exist or may have already disappeared
        }

        // 2. Wait for at least one result card to appear
        await browser.waitUntil(
            async () => {
                const cards = await this.resultCards;
                return cards.length > 0;
            },
            {
                timeout,
                interval: 1000,
                timeoutMsg: `No flight result cards appeared within ${timeout}ms`,
            }
        );
    }

    /** @returns {number} total result cards currently rendered */
    async getResultCount() {
        const cards = await this.resultCards;
        return cards.length;
    }

    /**
     * @returns {string} raw text of the first result's price element
     *                   e.g. "$149", "A$149"
     */
    async getFirstResultPriceText() {
        const el = await this.firstResultPrice;
        await el.waitForDisplayed({ timeout: 10000 });
        return el.getText();
    }

    /**
     * Assert that the price text looks like a monetary value.
     * Matches: "$149", "A$149", "AU$149", "149.00"
     * @param {string} priceText
     */
    assertPriceFormat(priceText) {
        expect(priceText).to.match(
            /[\$]?\s*[\d,]+/,
            `Price "${priceText}" does not look like a monetary value`
        );
    }

    /** @returns {boolean} whether the "no results" message is shown */
    async hasNoResultsMessage() {
        try {
            const el = await this.noResultsMessage;
            return await el.isDisplayed();
        } catch (_) {
            return false;
        }
    }

    /** @returns {string} text content of the search summary header */
    async getSearchSummaryText() {
        try {
            const el = await this.searchSummary;
            await el.waitForDisplayed({ timeout: 10000 });
            return el.getText();
        } catch (_) {
            return '';
        }
    }

    /**
     * Assert each result card has the minimum required sub-elements.
     * Checks the first N cards to keep the test fast.
     * @param {number} sampleSize
     */
    async assertResultCardStructure(sampleSize = 3) {
        const cards = await this.resultCards;
        const limit = Math.min(sampleSize, cards.length);

        for (let i = 0; i < limit; i++) {
            const card = cards[i];

            // Every result card must contain at least one price element
            const priceInCard = await card.$('[class*="price"],[class*="Price"],' +
                                              '[data-testid*="price"],[aria-label*="price"]');
            const priceVisible = await priceInCard.isDisplayed().catch(() => false);
            expect(priceVisible, `Card ${i + 1} is missing a visible price element`).to.be.true;
        }
    }
}

export default new SearchResultsPage();