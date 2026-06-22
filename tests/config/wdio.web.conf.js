const { config: base } = require('./wdio.base.conf');
const path = require('path');

exports.config = {
  ...base,
  specs: [
    path.resolve(__dirname, '../web/specs/homePage.spec.js'),
    path.resolve(__dirname, '../web/specs/flightSearch.spec.js')
  ],
  capabilities: [{ browserName: 'chrome',
    'goog:chromeOptions': { 
            args: []                
        } 
        }]
};