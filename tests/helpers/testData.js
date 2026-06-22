'use strict';

/**
 * Central test-data store.
 * Change search params here and every spec picks it up automatically.
 */
const testData = {
    search: {
        // One-way domestic flight — short route gives fast, predictable results
        origin:      'PERTH',
        originCode:  'PER',
        destination: 'Melbourne',
        destCode:    'MEL',

        // Always use a date well in advance so results are available
        departureDaysFromNow: 30,

        // Used for negative / boundary tests
        invalidOrigin: '!!!invalid!!!',
    },

    ui: {
        pageTitle:    'Cheapflights',
        loginLinkText: /log\s*in/i,
    },
};

/**
 * Returns an ISO date string N days from today.
 * @param {number} days
 * @returns {string} e.g. "2025-09-15"
 */
testData.getFutureDate = function (days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

module.exports = testData;