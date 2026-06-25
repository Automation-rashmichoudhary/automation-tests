import envConfig from '../helpers/envConfig.js';
import { expect } from 'chai';

export const config = {
  baseUrl: envConfig.BASE_URL,
  framework: 'mocha',
  mochaOpts: { timeout: 30000 },
  reporters: ['spec'],
  before: () => { global.expect = expect; }
};