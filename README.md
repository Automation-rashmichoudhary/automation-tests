# Automation Tests

A comprehensive automation testing suite for web, mobile, and API testing using WebdriverIO and Mocha frameworks.

## Overview

This project provides end-to-end test automation for flight booking and travel-related applications. It includes:

- **Web Testing**: Automated tests for web applications (flight search, booking flows)
- **Mobile Testing**: Automated tests for mobile applications using Appium
- **API Testing**: RESTful API testing for booking management operations

## Project Structure

```
automation-tests/
├── tests/
│   ├── api/                    # API automation tests
│   │   ├── helpers/            # API helper functions
│   │   │   ├── authHelper.js
│   │   │   └── bookingHelper.js
│   │   └── specs/              # API test specifications
│   │       ├── createBooking.spec.js
│   │       ├── deleteBooking.spec.js
│   │       ├── getBooking.spec.js
│   │       └── updateBooking.spec.js
│   ├── web/                    # Web application tests
│   │   ├── pages/              # Page Object Models
│   │   │   ├── BasePage.js
│   │   │   ├── HomePage.js
│   │   │   └── SearchResultsPage.js
│   │   └── specs/              # Web test specifications
│   │       ├── flightSearch.spec.js
│   │       └── homePage.spec.js
│   ├── mobile/                 # Mobile application tests
│   │   ├── pages/              # Mobile Page Objects
│   │   │   └── MobileHomePage.js
│   │   └── specs/              # Mobile test specifications
│   │       ├── flightSearch.spec.js
│   │       └── homePage.spec.js
│   ├── config/                 # Test configurations
│   │   ├── wdio.base.conf.js
│   │   ├── wdio.web.conf.js
│   │   └── wdio.mobile.conf.js
│   └── helpers/                # Shared utility functions
│       ├── envConfig.js        # Environment configuration
│       └── testData.js         # Test data utilities
└── package.json
```

## Prerequisites

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **Java**: Required for Appium mobile testing
- **Appium**: For mobile test execution
- **Chrome/ChromeDriver**: For web testing

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd automation-tests
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory for environment-specific configurations:
```
BASE_URL=https://www.cheapflights.com.au
API_URL=https://restful-booker.herokuapp.com
BOOKER_USERNAME=admin
BOOKER_PASSWORD=password123
```

## Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Web Tests
```bash
npm run test:web
```

### Run Mobile Tests
```bash
npm run test:mobile
```

### Run API Tests
```bash
npm run test:api
```

## Test Details

### API Tests
API tests cover CRUD operations for the Restful Booker API:
- **Create Booking**: POST request to create a new booking
- **Get Booking**: Retrieve booking details by ID
- **Update Booking**: Modify existing booking information
- **Delete Booking**: Remove bookings from the system

**Features:**
- Automatic date generation for test data
- Authentication helper for API requests
- Chai assertions for response validation
- 10-second timeout for API operations

### Web Tests
Web application tests for flight booking features:
- **Home Page Tests**: Navigation and UI element verification
- **Flight Search Tests**: Search functionality validation

**Features:**
- Page Object Model (POM) architecture
- WebdriverIO with Mocha framework
- Separate configuration for web applications
- Chrome driver integration

### Mobile Tests
Mobile application tests using Appium:
- **Home Page Tests**: Mobile UI navigation
- **Flight Search Tests**: Mobile search functionality

**Features:**
- Appium service integration
- Mobile-specific configurations
- Touch and gesture support

## Configuration Files

### wdio.base.conf.js
Base configuration shared across all test types:
- Framework: Mocha
- Timeout: 30 seconds
- Reporter: Spec reporter
- Global Chai expect

### wdio.web.conf.js
Web-specific test configuration:
- Browser capabilities
- Chromedriver settings
- Web-specific timeout and reporter settings

### wdio.mobile.conf.js
Mobile-specific test configuration:
- Appium service configuration
- Mobile device capabilities
- Mobile-specific timeouts

## Environment Configuration

The `envConfig.js` file manages all environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | https://www.cheapflights.com.au | Web/Mobile application URL |
| `API_URL` | https://restful-booker.herokuapp.com | API endpoint |
| `BOOKER_USERNAME` | admin | API authentication username |
| `BOOKER_PASSWORD` | password123 | API authentication password |

Override these values in your `.env` file or system environment variables.

## Page Object Models

### BasePage.js
Base class containing common page actions and utilities:
- Navigation methods
- Element interaction helpers
- Wait conditions

### HomePage.js
Home page object for web tests:
- Page element selectors
- Home page-specific actions

### SearchResultsPage.js
Search results page object:
- Results validation methods
- Filter and sort actions

### MobileHomePage.js
Mobile home page object:
- Mobile-specific selectors
- Touch-based interactions

## Helpers

### authHelper.js
Authentication utilities for API testing:
- Token generation
- Authorization header setup

### bookingHelper.js
Booking-related API operations:
- Create booking requests
- Retrieve booking information
- Update booking details
- Delete bookings

### testData.js
Test data utilities:
- Date generation functions
- Test data builders
- Constants

### envConfig.js
Environment configuration management:
- Loads environment variables
- Provides configuration to all tests

## Dependencies

- **@wdio/cli**: WebdriverIO command-line interface
- **@wdio/mocha-framework**: Mocha framework adapter for WebdriverIO
- **@wdio/local-runner**: Local test runner
- **@wdio/spec-reporter**: Test result reporter
- **@wdio/appium-service**: Appium service for mobile testing
- **appium**: Mobile testing automation framework
- **chai**: BDD/TDD assertion library
- **chromedriver**: Chrome browser driver
- **dotenv**: Environment variable loader
- **node-fetch**: HTTP client for API requests

## Best Practices

1. **Page Object Model**: Always use page objects for UI elements
2. **Test Data**: Use test data helpers for generating realistic data
3. **Environment Variables**: Store sensitive data in `.env` files
4. **Explicit Waits**: Use WebdriverIO's waitUntil for element visibility
5. **Error Handling**: Implement proper error handling in helper functions
6. **Test Isolation**: Each test should be independent
7. **Meaningful Assertions**: Use clear assertion messages for failures

## Troubleshooting

### Chrome Driver Issues
```bash
npm install chromedriver
```

### Appium Connection Errors
Ensure Appium server is running:
```bash
appium
```

### API Timeout Errors
Increase timeout in test configuration or check API server availability.

### Environment Variable Issues
Verify `.env` file exists and contains required variables.

## Contributing

1. Follow the existing code structure
2. Use Page Object Models for UI tests
3. Add meaningful test descriptions
4. Update this README for new test types or configurations
5. Ensure all tests pass before submitting changes

## License

ISC

## Support

For issues or questions, please refer to the test logs and WebdriverIO documentation at [webdriver.io](https://webdriver.io/)
