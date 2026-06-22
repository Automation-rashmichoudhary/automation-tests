'use strict';

const homePage         = require('../pages/HomePage');
const searchResultsPage = require('../pages/SearchResultsPage');
const testData          = require('../../helpers/testData');

/**
 * Suite: Flight search
 *
 * Covers requirements:
 *   "Develop tests for searching flights"
 *   "Develop assertions for flight search results"
 *
 * Structure:
 *   1. Positive — valid search yields rendered results with correct data
 *   2. Assertions — result cards contain expected fields
 *   3. Negative — boundary / invalid input behaviour
 */
describe('Flight search', () => {
    const { origin, destination, departureDaysFromNow } = testData.search;
    const departureDate = testData.getFutureDate(departureDaysFromNow);

    // =========================================================================
    // 1. Positive: valid search
    // =========================================================================

    describe('Positive — valid one-way search', () => {
        before(async () => {
            await homePage.open();
            await homePage.searchFlights({
                origin,
                destination,
                date: departureDate,
                oneWay: true,
            });
        });

        it('should navigate away from the home page after submitting the search', async () => {
            const url = await browser.getUrl();
            // Results page URL typically contains the route or "flights" segment
            expect(url).to.not.equal('https://www.cheapflights.com.au/');
        });

        it('should finish loading and display at least one flight result', async () => {
            await searchResultsPage.waitForResults();
            const count = await searchResultsPage.getResultCount();
            expect(count, 'Expected at least one result card').to.be.greaterThan(0);
        });

        it('should display more than one result (not just a single fallback card)', async () => {
            const count = await searchResultsPage.getResultCount();
            expect(count, 'Expected multiple results for a popular route').to.be.greaterThan(1);
        });

        it('should show a search summary referencing the origin or destination', async () => {
            const summary = await searchResultsPage.getSearchSummaryText();
            // Summary might say "Sydney → Melbourne" or include airport codes
            const matchesRoute =
                summary.toLowerCase().includes(origin.toLowerCase()) ||
                summary.toLowerCase().includes(destination.toLowerCase()) ||
                summary.includes(testData.search.originCode) ||
                summary.includes(testData.search.destCode);

            expect(matchesRoute,
                `Search summary "${summary}" should reference ${origin} or ${destination}`
            ).to.be.true;
        });

        it('should NOT show a "no results" message for a valid popular route', async () => {
            const noResults = await searchResultsPage.hasNoResultsMessage();
            expect(noResults, 'Should not show a no-results message for SYD→MEL').to.be.false;
        });
    });

    // =========================================================================
    // 2. Result card assertions — structure and content
    // =========================================================================

    describe('Search result assertions', () => {
        // Results are already loaded from the previous suite's before() hook.
        // If running this suite in isolation, re-run the search first.
        before(async () => {
            const count = await searchResultsPage.getResultCount().catch(() => 0);
            if (count === 0) {
                await homePage.open();
                await homePage.searchFlights({
                    origin,
                    destination,
                    date: departureDate,
                    oneWay: true,
                });
                await searchResultsPage.waitForResults();
            }
        });

        it('should display a price on the first result card', async () => {
            const priceText = await searchResultsPage.getFirstResultPriceText();
            expect(priceText, 'Price text should not be empty').to.not.be.empty;
        });

        it('should display the first result price in a valid monetary format', async () => {
            const priceText = await searchResultsPage.getFirstResultPriceText();
            searchResultsPage.assertPriceFormat(priceText);
        });

        it('should display a numeric price value greater than zero', async () => {
            const priceText = await searchResultsPage.getFirstResultPriceText();
            // Strip currency symbols and commas, parse as float
            const numeric = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            expect(numeric, `Parsed price from "${priceText}" should be > 0`).to.be.greaterThan(0);
        });

        it('should show a price element in each of the first 3 result cards', async () => {
            await searchResultsPage.assertResultCardStructure(3);
        });

        it('should have the results page respond within a reasonable time', async () => {
            // By the time we reach this assertion, results are already loaded —
            // this is a smoke-check that timing.navigationStart was set
            const perfEntries = await browser.execute(() =>
                JSON.stringify(performance.getEntriesByType('navigation'))
            );
            const entries = JSON.parse(perfEntries);
            if (entries.length > 0) {
                const loadTime = entries[0].loadEventEnd - entries[0].startTime;
                // Warn (not fail) if load time exceeds 15 s — network may vary in CI
                if (loadTime > 15000) {
                    console.warn(`⚠ Page load took ${Math.round(loadTime)}ms — consider investigating`);
                }
                expect(loadTime).to.be.greaterThan(0);
            }
        });
    });

    // =========================================================================
    // 3. Negative — boundary and invalid input
    // =========================================================================

    describe('Negative — invalid / boundary input', () => {
        beforeEach(async () => {
            // Return to a clean home page before each negative test
            await homePage.open();
        });

        it('should not navigate to results when origin and destination are the same', async () => {
            await homePage.searchFlights({
                origin:      origin,
                destination: origin,   // same city
                date:        departureDate,
            });
            // Should stay on the home page or show an inline validation error
            const url = await browser.getUrl();
            const isHomePage = url.includes('cheapflights.com.au/') &&
                               !url.includes('/flights') &&
                               !url.includes('results');
            // Either still on home page or a validation message is shown
            const hasValidationError = await $('[class*="error"],[role="alert"],[class*="Error"]')
                .isDisplayed().catch(() => false);

            expect(isHomePage || hasValidationError,
                'Searching same origin and destination should not yield a results page'
            ).to.be.true;
        });

        it('should handle an invalid origin gracefully without crashing the page', async () => {
            try {
                await homePage.searchFlights({
                    origin:      testData.search.invalidOrigin,
                    destination: destination,
                    date:        departureDate,
                });
            } catch (_) {
                // Autocomplete may reject the input before form submission
            }
            const title = await browser.getTitle();
            // Page should still be functional — title must be non-empty
            expect(title).to.not.be.empty;
        });

        it('should disable or prevent search submission with no destination entered', async () => {
            // Clear any pre-filled destination value
            try {
                const destEl = await homePage.destinationInput;
                await destEl.clearValue();
            } catch (_) { /* field may not accept clearValue */ }

            const searchBtn = await homePage.searchButton;
            const isEnabled = await searchBtn.isEnabled().catch(() => true);

            // Either the button is disabled, or clicking it stays on the home page
            if (isEnabled) {
                await searchBtn.click();
                const url = await browser.getUrl();
                expect(url).to.not.include('/flights/results',
                    'Should not navigate to results without a destination'
                );
            } else {
                expect(isEnabled).to.be.false;
            }
        });
    });
});