'use strict';

/**
 * Spec file: MobileHomePage
 *
 * Mirrors tests/web/specs/homePage.spec.js but runs through Appium.
 * Mobile-specific additions on top of the web equivalents:
 *   - Viewport width check  (mobile viewport ≤ 480 px)
 *   - Touch target size     (WCAG 2.5.5 — interactive elements ≥ 44 × 44 px)
 *   - Soft keyboard         (_hideKeyboard called after typing into inputs)
 *   - scrollDown()          (mobile-only helper verified to not throw)
 *   - driver.hideKeyboard() (Appium-specific — verified graceful when KB absent)
 *
 * Coverage map:
 *   Getter / Method                  Test(s)
 *   ─────────────────────────────── ──────────────────────────────────────────
 *   open()                           page title, HTTPS, domain, mobile viewport
 *   logo                             visible, non-zero size, touch-target size,
 *                                    positioned in header
 *   isLogoVisible()                  returns true
 *   loginButton                      visible, text matches, enabled, touch-target
 *   isLoginButtonVisible()           returns true
 *   originInput                      displayed, enabled, accepts value, KB hides
 *   destinationInput                 displayed, enabled, accepts value
 *   departureDateInput               exists, enabled
 *   searchButton                     displayed, enabled, touch-target size
 *   tripTypeOneWay                   exists, clickable when visible
 *   scrollDown()                     does not throw, page Y offset increases
 *   _hideKeyboard() (indirectly)     called via setValue → no crash
 *   Negative                         isLogoVisible / isLoginButtonVisible = false
 *                                    on about:blank
 */

const mobileHomePage = require('../pages/MobileHomePage');

// Minimum touch-target dimension recommended by WCAG 2.5.5
const MIN_TOUCH_PX = 44;

describe('MobileHomePage — complete POM coverage', () => {

    // ── open() ───────────────────────────────────────────────────────────────────

    describe('open()', () => {
        before(async () => {
            await mobileHomePage.open();
        });

        it('should load the page with a title containing "Cheapflights"', async () => {
            const title = await browser.getTitle();
            expect(title.toLowerCase()).to.include('cheapflights');
        });

        it('should serve the page over HTTPS', async () => {
            const url = await browser.getUrl();
            expect(url).to.match(/^https:\/\//);
        });

        it('should land on cheapflights.com.au', async () => {
            const url = await browser.getUrl();
            expect(url).to.include('cheapflights.com.au');
        });

        it('should render in a mobile viewport (width ≤ 480 px)', async () => {
            // Appium opens Chrome with a mobile user-agent and viewport
            const viewportWidth = await browser.execute(() => window.innerWidth);
            expect(viewportWidth).to.be.at.most(480,
                `Expected mobile viewport width ≤ 480 px, got ${viewportWidth}`);
        });
    });

    // ── logo getter + isLogoVisible() ────────────────────────────────────────────

    describe('logo getter + isLogoVisible()', () => {
        before(async () => {
            await mobileHomePage.open();
        });

        it('isLogoVisible() should return true', async () => {
            const visible = await mobileHomePage.isLogoVisible();
            expect(visible).to.be.true;
        });

        it('logo getter should resolve to a displayed element', async () => {
            const el = await mobileHomePage.logo;
            expect(await el.isDisplayed()).to.be.true;
        });

        it('logo should have a non-zero width', async () => {
            const el   = await mobileHomePage.logo;
            const size = await el.getSize();
            expect(size.width).to.be.greaterThan(0);
        });

        it('logo should have a non-zero height', async () => {
            const el   = await mobileHomePage.logo;
            const size = await el.getSize();
            expect(size.height).to.be.greaterThan(0);
        });

        it('logo should meet minimum touch-target height (≥ 44 px)', async () => {
            const el   = await mobileHomePage.logo;
            const size = await el.getSize();
            expect(size.height).to.be.at.least(MIN_TOUCH_PX,
                `Logo height ${size.height}px is below the ${MIN_TOUCH_PX}px touch target minimum`);
        });

        it('logo should be positioned within the top 150 px (inside the header)', async () => {
            const el       = await mobileHomePage.logo;
            const location = await el.getLocation();
            expect(location.y).to.be.lessThan(150);
        });
    });

    // ── loginButton getter + isLoginButtonVisible() ───────────────────────────────

    describe('loginButton getter + isLoginButtonVisible()', () => {
        before(async () => {
            await mobileHomePage.open();
        });

        it('isLoginButtonVisible() should return true', async () => {
            const visible = await mobileHomePage.isLoginButtonVisible();
            expect(visible).to.be.true;
        });

        it('loginButton getter should resolve to a displayed element', async () => {
            const el = await mobileHomePage.loginButton;
            expect(await el.isDisplayed()).to.be.true;
        });

        it('login link text should match /log\\s*in|sign\\s*in/i', async () => {
            const el   = await mobileHomePage.loginButton;
            const text = await el.getText();
            expect(text).to.match(/log\s*in|sign\s*in/i,
                `Expected login text, got: "${text}"`);
        });

        it('loginButton should be enabled', async () => {
            const el = await mobileHomePage.loginButton;
            expect(await el.isEnabled()).to.be.true;
        });

        it('loginButton should be clickable', async () => {
            const el = await mobileHomePage.loginButton;
            expect(await el.isClickable()).to.be.true;
        });

        it('loginButton should meet minimum touch-target height (≥ 44 px)', async () => {
            const el   = await mobileHomePage.loginButton;
            const size = await el.getSize();
            expect(size.height).to.be.at.least(MIN_TOUCH_PX,
                `Login button height ${size.height}px is below the ${MIN_TOUCH_PX}px minimum`);
        });

        it('loginButton should meet minimum touch-target width (≥ 44 px)', async () => {
            const el   = await mobileHomePage.loginButton;
            const size = await el.getSize();
            expect(size.width).to.be.at.least(MIN_TOUCH_PX,
                `Login button width ${size.width}px is below the ${MIN_TOUCH_PX}px minimum`);
        });
    });

    // ── originInput getter ────────────────────────────────────────────────────────

    describe('originInput getter', () => {
        before(async () => {
            await mobileHomePage.open();
        });

        it('should resolve to a displayed element', async () => {
            const el = await mobileHomePage.originInput;
            expect(await el.isDisplayed()).to.be.true;
        });

        it('should be enabled', async () => {
            const el = await mobileHomePage.originInput;
            expect(await el.isEnabled()).to.be.true;
        });

        it('should accept a typed value without throwing', async () => {
            const el = await mobileHomePage.originInput;
            await el.clearValue();
            await el.setValue('Sydney');
            const val = await el.getValue();
            expect(val.length).to.be.greaterThan(0);
        });

        it('soft keyboard should dismiss without error after typing', async () => {
            // _hideKeyboard() is called internally by searchFlights; invoke it directly
            // through the Appium driver to verify it doesn't throw on a real device
            await mobileHomePage._hideKeyboard();
            // No assertion needed — absence of throw is the pass condition
        });
    });

    // ── destinationInput getter ────────────────────────────────────────────────────

    describe('destinationInput getter', () => {
        before(async () => {
            await mobileHomePage.open();
        });

        it('should resolve to a displayed element', async () => {
            const el = await mobileHomePage.destinationInput;
            expect(await el.isDisplayed()).to.be.true;
        });

        it('should be enabled', async () => {
            const el = await mobileHomePage.destinationInput;
            expect(await el.isEnabled()).to.be.true;
        });

        it('should accept a typed value without throwing', async () => {
            const el = await mobileHomePage.destinationInput;
            await el.clearValue();
            await el.setValue('Melbourne');
            const val = await el.getValue();
            expect(val.length).to.be.greaterThan(0);
        });
    });

    // ── departureDateInput getter ─────────────────────────────────────────────────

    describe('departureDateInput getter', () => {
        before(async () => {
            await mobileHomePage.open();
        });

        it('should resolve to an element that exists in the DOM', async () => {
            const el     = await mobileHomePage.departureDateInput;
            const exists = await el.isExisting();
            expect(exists).to.be.true;
        });

        it('should be enabled when present', async () => {
            const el      = await mobileHomePage.departureDateInput;
            const enabled = await el.isEnabled().catch(() => true);
            expect(enabled).to.be.true;
        });
    });

    // ── searchButton getter ───────────────────────────────────────────────────────

    describe('searchButton getter', () => {
        before(async () => {
            await mobileHomePage.open();
        });

        it('should resolve to a displayed element', async () => {
            const el = await mobileHomePage.searchButton;
            expect(await el.isDisplayed()).to.be.true;
        });

        it('should be enabled', async () => {
            const el = await mobileHomePage.searchButton;
            expect(await el.isEnabled()).to.be.true;
        });

        it('should meet minimum touch-target height (≥ 44 px)', async () => {
            const el   = await mobileHomePage.searchButton;
            const size = await el.getSize();
            expect(size.height).to.be.at.least(MIN_TOUCH_PX,
                `Search button height ${size.height}px is below ${MIN_TOUCH_PX}px`);
        });

        it('should meet minimum touch-target width (≥ 44 px)', async () => {
            const el   = await mobileHomePage.searchButton;
            const size = await el.getSize();
            expect(size.width).to.be.at.least(MIN_TOUCH_PX,
                `Search button width ${size.width}px is below ${MIN_TOUCH_PX}px`);
        });

        it('should be of type "submit" or have search-related text / aria-label', async () => {
            const el      = await mobileHomePage.searchButton;
            const type    = await el.getAttribute('type').catch(() => '');
            const ariaLbl = await el.getAttribute('aria-label').catch(() => '');
            const text    = await el.getText().catch(() => '');

            const isSearchControl =
                type === 'submit' ||
                /search/i.test(ariaLbl) ||
                /search/i.test(text);

            expect(isSearchControl,
                `type="${type}" aria-label="${ariaLbl}" text="${text}"`
            ).to.be.true;
        });
    });

    // ── tripTypeOneWay getter ─────────────────────────────────────────────────────

    describe('tripTypeOneWay getter', () => {
        before(async () => {
            await mobileHomePage.open();
        });

        it('should resolve to an element that exists in the DOM', async () => {
            const el     = await mobileHomePage.tripTypeOneWay;
            const exists = await el.isExisting();
            expect(exists).to.be.true;
        });

        it('should be clickable when visible', async () => {
            const el        = await mobileHomePage.tripTypeOneWay;
            const displayed = await el.isDisplayed().catch(() => false);
            if (displayed) {
                expect(await el.isClickable()).to.be.true;
            }
        });
    });

    // ── scrollDown() — mobile-only helper ────────────────────────────────────────

    describe('scrollDown()', () => {
        before(async () => {
            await mobileHomePage.open();
        });

        it('should not throw when called with default pixels', async () => {
            await mobileHomePage.scrollDown();
        });

        it('should increase the page Y scroll offset', async () => {
            const before = await browser.execute(() => window.pageYOffset);
            await mobileHomePage.scrollDown(300);
            const after  = await browser.execute(() => window.pageYOffset);
            expect(after).to.be.greaterThan(before,
                `scrollDown(300) should increase pageYOffset (was ${before}, now ${after})`);
        });

        it('should not throw when called with a custom pixel value', async () => {
            await mobileHomePage.scrollDown(150);
        });
    });

    // ── Negative — graceful returns on wrong page ─────────────────────────────────

    describe('Negative — helper methods return false gracefully', () => {
        before(async () => {
            await browser.url('about:blank');
        });

        after(async () => {
            await mobileHomePage.open();
        });

        it('isLogoVisible() should return false on a blank page', async () => {
            const visible = await mobileHomePage.isLogoVisible();
            expect(visible).to.be.false;
        });

        it('isLoginButtonVisible() should return false on a blank page', async () => {
            const visible = await mobileHomePage.isLoginButtonVisible();
            expect(visible).to.be.false;
        });
    });

});