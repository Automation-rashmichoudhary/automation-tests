const envConfig = require('../helpers/envConfig');

exports.config = {
  baseUrl: envConfig.BASE_URL,
  framework: 'mocha',
  mochaOpts: { timeout: 30000 },
  reporters: ['spec'],
  before: () => { global.expect = require('chai').expect; }
}