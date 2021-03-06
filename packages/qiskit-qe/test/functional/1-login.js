/*
  Copyright IBM Corp. 2017. All Rights Reserved.

  This code may only be used under the Apache 2.0 license found at
  http://www.apache.org/licenses/LICENSE-2.0.txt.

  Authors:
  - Jesús Pérez <jesusper@us.ibm.com>
*/

'use strict';

const assert = require('assert');
const utilsTest = require('../../../../utils-test');

const Qe = require('../..');
const expErrRegex = require('../errorRe');


const qe = new Qe();
global.qiskitTest = {
  // To reuse in the rest of test files of this folder and avoid multiple re-login.
  qe,
  // To detect if we want to run integration tests without exposing sensitive data.
  integration: false,
};


describe('qe:login', () => {
  it('should fail if "token" parameter no present', async () =>
    // TODO: Emit proper error.
    utilsTest.throwsAsync(() => qe.login(), expErrRegex.formatStr));

  it('should fail if bad format in the "token" parameter', async () =>
    utilsTest.throwsAsync(() => qe.login(1), expErrRegex.formatStr));

  // TODO: Mocha automagically added stuff to this.* not supported with arrow functions.
  // https://github.com/mochajs/mocha/issues/1856
  // it('should return the user info with a valid login', async () => {
  it('should return the user info with a valid login', async function t() {
    if (!process.env.QE_TOKEN) {
      // Dirty trick to allow the tests which don´t need the API to run.
      qe.token = 'notvalid';
      qe.userId = 'notvalid';

      /* eslint-disable no-console */
      console.log('\n\n\n\t-------------------------------------------------------------');
      console.log('\tWARNING');
      console.log('\tQE_TOKEN env var not found, so skipping integration tests.');
      console.log('\t-------------------------------------------------------------\n\n\n');

      /* eslint-enable no-console */
      this.skip();
    }

    global.qiskitTest.integration = true;

    const res = await qe.login(process.env.QE_TOKEN);

    assert.deepEqual(Object.keys(res), ['ttl', 'created', 'userId', 'token']);
    assert.equal(typeof res.ttl, 'number');
    assert.ok(typeof res.created === 'string');
    assert.ok(typeof res.userId === 'string');
    assert.ok(typeof res.token === 'string');
  });

  it('should set the token properly', async () => {
    assert.equal(typeof qe.token, 'string');
    assert.notEqual(qe.token.length, 0);
  });
});
