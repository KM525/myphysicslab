// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.module('myphysicslab.lab.util.test.ParameterStringTest');

const ParameterString = goog.require('myphysicslab.lab.util.ParameterString');
const AbstractSubject = goog.require('myphysicslab.lab.util.AbstractSubject');
const Util = goog.require('myphysicslab.lab.util.Util');
const TestRig = goog.require('myphysicslab.test.TestRig');

const assertEquals = (e, v) => TestRig.assertEquals(e, v);
const assertRoughlyEquals = (e, v, t) => TestRig.assertRoughlyEquals(e, v, t);
const assertTrue = v => TestRig.assertTrue(v);
const assertFalse = v => TestRig.assertFalse(v);
const assertThrows = f => TestRig.assertThrows(f);
const schedule = testFunc => TestRig.schedule(testFunc);
const startTest = n => TestRig.startTest(n);

class MockSubject2 extends AbstractSubject {
  constructor() {
    super('MOCK');
    /**
    * @type {string}
    * @private
    */
    this.fooness_ = 'foo';
    /**
    * @type {string}
    * @private
    */
    this.fooBarness_ = 'none';
  };

  /** @override */
  getClassName() {
    return 'MockSubject2';
  };
  /**
  @return {string}
  */
  getFooness() {
    return this.fooness_;
  };
  /**
  @param {string} value
  */
  setFooness(value) {
    this.fooness_ = value;
  };
  /**
  @return {string}
  */
  getFooBarness() {
    return this.fooBarness_;
  };
  /**
  @param {string} value
  */
  setFooBarness(value) {
    this.fooBarness_ = value;
  };
} // end class
MockSubject2.FOONESS = 'fooness';
MockSubject2.FOOBARNESS = 'foo-barness';

class ParameterStringTest {

static test() {
  schedule(ParameterStringTest.testParameterString1);
};

static testParameterString1() {
  startTest(ParameterStringTest.groupName+'testParameterString1');
  /** @type {!MockSubject2} */
  var mockSubj2 = new MockSubject2();
  assertEquals('foo', mockSubj2.getFooness());
  assertEquals('none', mockSubj2.getFooBarness());
  // make parameters
  var paramFoo = new ParameterString(mockSubj2, MockSubject2.FOONESS,
      MockSubject2.FOONESS,
      () => mockSubj2.getFooness(),
      a => mockSubj2.setFooness(a));
  mockSubj2.addParameter(paramFoo);
  assertEquals(Util.toName(MockSubject2.FOONESS), paramFoo.getName());
  assertTrue(paramFoo.nameEquals(MockSubject2.FOONESS));
  assertEquals(mockSubj2, paramFoo.getSubject());
  assertTrue(paramFoo instanceof ParameterString);
  assertEquals(paramFoo, mockSubj2.getParameterString(MockSubject2.FOONESS));
  assertThrows(function() { mockSubj2.getParameterNumber(MockSubject2.FOONESS) });
  assertThrows(function() { mockSubj2.getParameterBoolean(MockSubject2.FOONESS) });
  assertEquals('foo', paramFoo.getValue());
  assertEquals(undefined, paramFoo.setValue('baz'));
  assertEquals('baz', paramFoo.getValue());
  paramFoo.setValue('qux');
  assertEquals('qux', paramFoo.getValue());
  assertEquals(20, paramFoo.getSuggestedLength());
  assertEquals(paramFoo, paramFoo.setSuggestedLength(10));
  assertEquals(10, paramFoo.getSuggestedLength());
  assertEquals(Util.POSITIVE_INFINITY, paramFoo.getMaxLength());
  // can't set max length to less than length of current string value
  assertThrows(function() { paramFoo.setMaxLength(2); });
  assertEquals(paramFoo, paramFoo.setMaxLength(10));
  assertEquals(10, paramFoo.getMaxLength());
  assertThrows(function() { paramFoo.setValue('very long string'); });
  assertEquals(undefined, paramFoo.setValue('grault'));
  assertEquals('grault', paramFoo.getValue());
  paramFoo.setFromString('blarg');
  assertEquals('blarg', paramFoo.getValue());

  // make a parameter with choices
  var paramFooBar = new ParameterString(mockSubj2, MockSubject2.FOOBARNESS,
      MockSubject2.FOOBARNESS,
      () => mockSubj2.getFooBarness(),
      a => mockSubj2.setFooBarness(a),
    ['keine', 'manche', 'viele'], ['none', 'some', 'many']);
  mockSubj2.addParameter(paramFooBar);
  assertEquals(Util.toName(MockSubject2.FOOBARNESS), paramFooBar.getName());
  assertTrue(paramFooBar.nameEquals(MockSubject2.FOOBARNESS));
  assertEquals(mockSubj2, paramFooBar.getSubject());
  assertTrue(paramFooBar instanceof ParameterString);
  assertEquals('none', paramFooBar.getValue());
  // set to a non-allowed value
  assertThrows(function() { paramFooBar.setValue('any'); });
  assertEquals('none', paramFooBar.getValue());
  // find param by its name
  assertEquals(paramFooBar, mockSubj2.getParameterString(MockSubject2.FOOBARNESS));
  assertThrows(function() { mockSubj2.getParameterNumber(MockSubject2.FOOBARNESS) });
  assertThrows(function() { mockSubj2.getParameterBoolean(MockSubject2.FOOBARNESS) });
  paramFooBar.setValue('some');
  assertEquals('some', paramFooBar.getValue());

  // check the list of choices/values
  assertEquals(3, paramFooBar.getChoices().length);
  assertEquals(3, paramFooBar.getValues().length);

  assertEquals('keine', paramFooBar.getChoices()[0]);
  assertEquals('none', paramFooBar.getValues()[0]);
  paramFooBar.setValue(paramFooBar.getValues()[0]);
  assertEquals('none', paramFooBar.getValue());

  assertEquals('manche', paramFooBar.getChoices()[1]);
  assertEquals('some', paramFooBar.getValues()[1]);
  paramFooBar.setValue(paramFooBar.getValues()[1]);
  assertEquals('some', paramFooBar.getValue());

  assertEquals('viele', paramFooBar.getChoices()[2]);
  assertEquals('many', paramFooBar.getValues()[2]);
  paramFooBar.setValue(paramFooBar.getValues()[2]);
  assertEquals('many', paramFooBar.getValue());
};


} // end class

/**
* @type {string}
* @const
*/
ParameterStringTest.groupName = 'ParameterStringTest.';

exports = ParameterStringTest;
