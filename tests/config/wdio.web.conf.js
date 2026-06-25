import { config as base } from './wdio.base.conf.js';
import path from 'path';

export const config = {
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