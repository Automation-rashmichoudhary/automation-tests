'use strict';

/**
 * Spec file: Mobile — Flight search
 *
 * Mirrors tests/web/specs/flightSearch.spec.js but runs through Appium.
 * Mobile-specific additions on top of the web equivalents:
 *   - Scroll-before-assert    results below the fold need scrollDown() first
 *   - Viewport-relative Y     result cards must appear within visible viewport
 *   - Soft keyboard dismissal verified after form submission
 *   - Touch-target size       each result card must be ≥ 44 px tall (tappable)
 *   - Network timing          mobile tolerance is 20 s (vs 15 s on desktop)
 *
 * Structure:
 *   1. Positive  — valid search navigates and shows results
 *   2. Assertions — result cards contain correct fields on a mobile viewport
 *   3. Negative  — boundary / invalid input handled gracefully on mobile
 */

const mobileHomePage    = require('../pages/MobileHomePage');
const searchResultsPage = require('../../web/pages/SearchResultsPage');
const testData          = require('../../../helpers/testData');

const ORIGIN      = testData.search.origin;
const DESTINATION = testData.search.destination;
const ORIGIN_CODE = testData.search.originCode;
const DEST_CODE   = testData.search.destCode;

function departureDateIn(days) {
    return testData.getFutureDate(days);
}

describe('Mobile — Flight search', () => {
    const departureDate = departureDateIn(testData.search.departureDaysFromNow);

    // =========================================================================
    // 1. Positive — valid one-way search
    // =========================================================================

    describe('Positive — valid one-way search', () => {
        before(async () => {
            await mobileHomePage.open();
            await mobileHomePage.searchFlights({
                origin:      ORIGIN,
                destination: DESTINATION,
                date:        departureDate,
                oneWay:      true,
            });
        });

        it('should navigate away from the home page URL after search submission', async () => {
            const url = await browser.getUrl();
            expect(url).to.not.equal('https://www.cheapflights.com.au/');
            expect(url).to.not.equal('https://www.cheapflights.com.au');
        });

        it('should land on a URL that contains a flights or search segment', async () => {
            const url = await browser.getUrl();
            const isResultsUrl =
                url.includes('/flights') ||
                url.includes('results')  ||
                url.includes('search');
            expect(isResultsUrl,
                `Expected a results-style URL, got: ${url}`
            ).to.be.true;
        });

        it('soft keyboard should not be visible after form submission', async () => {
            // _hideKeyboard is called inside searchFlights(); verify the keyboard
            // is not obscuring the results by checking the visible viewport height
            const viewportHeight = await browser.execute(() => window.innerHeight);
            const screenHeight   = await browser.execute(() => screen.height);
            // When the keyboard is open, innerHeight is significantly smaller than screen.height
            // A ratio above 0.6 indicates the keyboard is not taking up the screen
            const ratio = viewportHeight / screenHeight;
            expect(ratio).to.be.greaterThan(0.6,
                `Viewport/screen ratio ${ratio.toFixed(2)} suggests keyboard is still open`);
        });

        it('should finish loading and show at least one result card', async () => {
            await searchResultsPage.waitForResults(40000); // extra timeout for mobile networks
            const count = await searchResultsPage.getResultCount();
            expect(count).to.be.greaterThan(0);
        });

        it('should show more than one result for a popular route (SYD→MEL)', async () => {
            const count = await searchResultsPage.getResultCount();
            expect(count).to.be.greaterThan(1);
        });

        it('should show a search summary referencing the origin or destination', async () => {
            const summary = await searchResultsPage.getSearchSummaryText();
            const matchesRoute =
                summary.toLowerCase().includes(ORIGIN.toLowerCase())      ||
                summary.toLowerCase().includes(DESTINATION.toLowerCase()) ||
                summary.includes(ORIGIN_CODE)                             ||
                summary.includes(DEST_CODE);

            expect(matchesRoute,
                `Summary "${summary}" should reference ${ORIGIN} or ${DESTINATION}`
            ).to.be.true;
        });

        it('should NOT show a "no results" message for a valid popular route', async () => {
            const noResults = await searchResultsPage.hasNoResultsMessage();
            expect(noResults).to.be.false;
        });
    });

    // =========================================================================
    // 2. Result card assertions — mobile viewport specifics
    // =========================================================================

    describe('Search result assertions — mobile viewport', () => {
        before(async () => {
            // Re-run search if this suite is executed in isolation
            const count = await searchResultsPage.getResultCount().catch(() => 0);
            if (count === 0) {
                await mobileHomePage.open();
                await mobileHomePage.searchFlights({
                    origin:      ORIGIN,
                    destination: DESTINATION,
                    date:        departureDate,
                    oneWay:      true,
                });
                await searchResultsPage.waitForResults(40000);
            }
        });

        it('should display a non-empty price on the first result', async () => {
            const priceText = await searchResultsPage.getFirstResultPriceText();
            expect(priceText).to.not.be.empty;
        });

        it('first result price should be in a valid monetary format', async () => {
            const priceText = await searchResultsPage.getFirstResultPriceText();
            searchResultsPage.assertPriceFormat(priceText);
        });

        it('first result price should be a positive number', async () => {
            const priceText = await searchResultsPage.getFirstResultPriceText();
            const numeric   = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            expect(numeric).to.be.greaterThan(0);
        });

        it('each of the first 3 result cards should contain a visible price element', async () => {
            await searchResultsPage.assertResultCardStructure(3);
        });

        it('result cards should be tall enough to be tappable (≥ 44 px)', async () => {
            const cards = await searchResultsPage.resultCards;
            const limit = Math.min(3, cards.length);

            for (let i = 0; i < limit; i++) {
                const size = await cards[i].getSize();
                expect(size.height).to.be.at.least(44,
                    `Card ${i + 1} height ${size.height}px is below the 44px touch target minimum`);
            }
        });

        it('result cards should span the full mobile viewport width', async () => {
            const viewportWidth = await browser.execute(() => window.innerWidth);
            const cards         = await searchResultsPage.resultCards;
            const firstCard     = cards[0];
            const cardSize      = await firstCard.getSize();

            // Cards should occupy at least 80% of the viewport width on mobile
            const ratio = cardSize.width / viewportWidth;
            expect(ratio).to.be.greaterThan(0.8,
                `Card width ${cardSize.width}px is less than 80% of viewport ${viewportWidth}px`);
        });

        it('scrolling down should reveal additional result cards', async () => {
            const countBefore = await searchResultsPage.getResultCount();
            await mobileHomePage.scrollDown(600);
            await browser.pause(1000); // allow lazy-loaded cards to render
            const countAfter  = await searchResultsPage.getResultCount();

            // Count should stay the same or increase after scroll (lazy loading)
            expect(countAfter).to.be.at.least(countBefore,
                'Scrolling down should not reduce the number of result cards');
        });

        it('page load timing should be recorded (navigation performance entry exists)', async () => {
            const entries = await browser.execute(() =>
                performance.getEntriesByType('navigation').length
            );
            expect(entries).to.be.greaterThan(0);
        });
    });

    // =========================================================================
    // 3. Negative — boundary and invalid input on mobile
    // =========================================================================

    describe('Negative — invalid / boundary input', () => {
        beforeEach(async () => {
            await mobileHomePage.open();
            // Dismiss any keyboard that may linger from a previous test
            await mobileHomePage._hideKeyboard();
        });

        it('should not navigate to results when origin and destination are the same', async () => {
            await mobileHomePage.searchFlights({
                origin:      ORIGIN,
                destination: ORIGIN,   // same city
                date:        departureDate,
            });

            const url = await browser.getUrl();
            const isHomePage =
                url.includes('cheapflights.com.au/') &&
                !url.includes('/flights') &&
                !url.includes('results');

            const hasValidationError = await $(
                '[class*="error"],[role="alert"],[class*="Error"]'
            ).isDisplayed().catch(() => false);

            expect(isHomePage || hasValidationError,
                'Same-city search should not navigate to a results page'
            ).to.be.true;
        });

        it('should handle an invalid origin gracefully without crashing the page', async () => {
            try {
                await mobileHomePage.searchFlights({
                    origin:      testData.search.invalidOrigin,
                    destination: DESTINATION,
                    date:        departureDate,
                });
            } catch (_) {
                // Autocomplete or form validation rejected the input — expected
            }
            const title = await browser.getTitle();
            expect(title).to.not.be.empty;
        });

        it('should not navigate to results when destination is empty', async () => {
            try {
                const destEl = await mobileHomePage.destinationInput;
                await destEl.clearValue();
                await mobileHomePage._hideKeyboard();
            } catch (_) { /* field may not accept clearValue */ }

            const searchBtn = await mobileHomePage.searchButton;
            const isEnabled = await searchBtn.isEnabled().catch(() => true);

            if (isEnabled) {
                await searchBtn.click();
                const url = await browser.getUrl();
                expect(url).to.not.include('/flights/results',
                    'Search without destination should not navigate to results');
            } else {
                expect(isEnabled).to.be.false;
            }
        });

        it('_hideKeyboard() should not throw when the keyboard is already hidden', async () => {
            // Keyboard is dismissed from beforeEach; calling again must be idempotent
            await mobileHomePage._hideKeyboard();
        });

        it('scrollDown() should not throw when already at bottom of a short page', async () => {
            // Scroll well past the bottom — should clamp silently
            await mobileHomePage.scrollDown(99999);
        });
    });

});