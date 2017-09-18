/*
  Copyright IBM Corp. 2017. All Rights Reserved.

  This code may only be used under the Apache 2.0 license found at
  http://www.apache.org/licenses/LICENSE-2.0.txt.

  Authors:
  - Jesús Pérez <jesusper@us.ibm.com>
*/

'use strict';

// const checkToken = require('./lib/checkToken');
const version = require('./package').version;
const utils = require('./lib/utils');
const request = require('./lib/request');


const dbg = utils.dbg(__filename);
const defaults = {
  // TODO: Change to procution when ready.
  // uri = 'https://quantumexperience.ng.bluemix.net/api';
  uri: 'http://localhost:6007/api/v0',
};
const msgLoginBefore = 'Please login before'


function checkUri(uri) {
  if (!uri || !utils.validator.isURL(uri)) {
    throw new Error('URI format expected');
  }
}


function checkString(str) {
  if (!str || typeof str !== 'string') {
    throw new Error('String format expected');
  }
}


class Qe {
  constructor(opts = {}) {
    dbg('Starting', opts);

    this.version = version;

    if (opts.uri) {
      dbg('Setting the passed URI');
      checkUri(opts.uri);
      this.uri = opts.uri;
    } else {
      this.uri = defaults.uri;
    }

    // Filled when a login is correctly made. ("login" method)
    // but it can be passed/set.
    if (opts.token) {
      dbg('Setting the passed token');
      checkString(opts.token);
      this.token = opts.token;
    }
  }


  async login(tokenPersonal) {
    dbg('Getting a long term token');
    checkString(tokenPersonal);

    const res = await request(`${this.uri}/users/loginWithToken`, {
      body: { apiToken: tokenPersonal },
    });

    this.token = res.id;
    this.userId = res.userId;

    // Massaging the response.
    res.token = res.id;
    delete res.id;

    return res;
  }


  async credits() {
    dbg('Getting user credits info');

    if (!this.token || !this.userId) { throw new Error(msgLoginBefore); }

    const res = await request(`${this.uri}/users/${this.userId}`, { token: this.token });

    const creditInfo = res.credit;

    if (creditInfo) {
      delete res.credit.promotionalCodesUsed;
      delete res.credit.lastRefill;
    }

    return creditInfo;
  }


  async lastCodes() {
    dbg('Getting last user codes');

    if (!this.token || !this.userId) { throw new Error(msgLoginBefore); }

    return await request(`${this.uri}/users/${this.userId}/codes/lastest`, { token: this.token });    
  }


  async backends(onlySims = false) {
    dbg('Getting the available backends', { onlySims });

    if (!this.token) { throw new Error(msgLoginBefore); }

    let res = await request(`${this.uri}/Backends`, { token: this.token });

    // TODO: Add a test for this when we have spies for develop environemnt.
    // At the integration environment all the returned ones are 'on'.
    res = utils.filter(res, el => el.status === 'on');

    if (onlySims) {
      dbg('Returning only the simulators');      

      return utils.filter(res, el => el.status === 'on' && el.simulator === true);      
    } else {
      return res;
    }
  }
}


module.exports = Qe;
