'use strict';

require('dotenv').config();

module.exports = {
    // Web / Mobile
    BASE_URL: process.env.BASE_URL || 'https://www.cheapflights.com.au',

    // Restful Booker API
    API_URL:          process.env.API_URL     || 'https://restful-booker.herokuapp.com',
    BOOKER_USERNAME:  process.env.BOOKER_USERNAME || 'admin',
    BOOKER_PASSWORD:  process.env.BOOKER_PASSWORD || 'password123',
};