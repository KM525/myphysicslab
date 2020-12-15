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

goog.module('myphysicslab.sims.springs.test.SingleSpringTest');

goog.require('goog.array');
const GenericEvent = goog.require('myphysicslab.lab.util.GenericEvent');
const ModifiedEuler = goog.require('myphysicslab.lab.model.ModifiedEuler');
const Observer = goog.require('myphysicslab.lab.util.Observer');
const ParameterBoolean = goog.require('myphysicslab.lab.util.ParameterBoolean');
const ParameterNumber = goog.require('myphysicslab.lab.util.ParameterNumber');
const ParameterString = goog.require('myphysicslab.lab.util.ParameterString');
const PointMass = goog.require('myphysicslab.lab.model.PointMass');
const SimObject = goog.require('myphysicslab.lab.model.SimObject');
const SimpleAdvance = goog.require('myphysicslab.lab.model.SimpleAdvance');
const SingleSpringSim = goog.require('myphysicslab.sims.springs.SingleSpringSim');
const Spring = goog.require('myphysicslab.lab.model.Spring');
const Subject = goog.require('myphysicslab.lab.util.Subject');
const TestRig = goog.require('myphysicslab.test.TestRig');
const Util = goog.require('myphysicslab.lab.util.Util');

const assertEquals = TestRig.assertEquals;
const assertRoughlyEquals = TestRig.assertRoughlyEquals;
const assertTrue = TestRig.assertTrue;
const assertFalse = TestRig.assertFalse;
const assertThrows = TestRig.assertThrows;
const schedule = TestRig.schedule;
const startTest = TestRig.startTest;

/**  Observer that counts number of times that parameters are changed or events fire.
@implements {Observer}
*/
class MockObserver1 {
  /**
  * @param {!Subject} sim
  */
  constructor(sim) {
    /**
    * @type {!Subject}
    */
    this.sim = sim;
    /**
    * @type {number}
    */
    this.numEvents = 0;
    /**
    * @type {number}
    */
    this.numBooleans = 0;
    /**
    * @type {number}
    */
    this.numDoubles = 0;
    /**
    * @type {number}
    */
    this.numStrings = 0;
  };
  /** @override */
  observe(event) {
    if (event instanceof GenericEvent) {
      this.numEvents++;
      assertEquals(this.sim, event.getSubject());
    } else if (event instanceof ParameterBoolean) {
      this.numBooleans++;
      assertEquals(this.sim, event.getSubject());
      var val = event.getValue();
      assertTrue(goog.isBoolean(val));
    } else if (event instanceof ParameterNumber) {
      this.numDoubles++;
      assertEquals(this.sim, event.getSubject());
      var val = event.getValue();
      assertTrue(goog.isNumber(val));
    } else if (event instanceof ParameterString) {
      this.numStrings++;
      assertEquals(this.sim, event.getSubject());
      assertTrue(goog.isString(event.getValue()));
    }
  };
  /** @override */
  toStringShort() {
    return 'MockObserver1';
  };
} // end class

class SingleSpringTest {

static test() {
  schedule(SingleSpringTest.testSingleSpring);
};

static testSingleSpring() {
  startTest(SingleSpringTest.groupName+'testSingleSpring');
  var i;
  var tol = 1E-15;
  var sim = new SingleSpringSim();
  var simList = sim.getSimList();
  var solvr = new ModifiedEuler(sim);
  var simpleAdv = new SimpleAdvance(sim, solvr);

  // confirm block and spring exist
  var block = simList.getPointMass('block');
  assertTrue(block instanceof PointMass);
  var spring = simList.getSpring('spring');
  assertTrue(spring instanceof Spring);

  // confirm parameters exist
  var dampingParam = sim.getParameterNumber(SingleSpringSim.en.DAMPING);
  assertTrue(dampingParam.nameEquals(SingleSpringSim.en.DAMPING));
  assertEquals(Util.toName(SingleSpringSim.en.DAMPING), dampingParam.getName());
  assertEquals(0.1, dampingParam.getValue());
  var lengthParam = sim.getParameterNumber(SingleSpringSim.en.SPRING_LENGTH);
  assertEquals(Util.toName(SingleSpringSim.en.SPRING_LENGTH),
     lengthParam.getName());
  assertTrue(lengthParam.nameEquals(SingleSpringSim.en.SPRING_LENGTH));
  assertEquals(2.5, lengthParam.getValue());
  var massParam = sim.getParameterNumber(SingleSpringSim.en.MASS);
  assertTrue(massParam.nameEquals(SingleSpringSim.en.MASS));
  assertEquals(Util.toName(SingleSpringSim.en.MASS), massParam.getName());
  assertEquals(0.5, massParam.getValue());
  var stiffnessParam = sim.getParameterNumber(SingleSpringSim.en.SPRING_STIFFNESS);
  assertTrue(stiffnessParam.nameEquals(SingleSpringSim.en.SPRING_STIFFNESS));
  assertEquals(Util.toName(SingleSpringSim.en.SPRING_STIFFNESS),
      stiffnessParam.getName());
  assertEquals(3.0, stiffnessParam.getValue());

  var mockObsvr1 = new MockObserver1(sim);
  assertEquals(0, mockObsvr1.numEvents);
  assertEquals(0, mockObsvr1.numBooleans);
  assertEquals(0, mockObsvr1.numDoubles);
  assertEquals(0, mockObsvr1.numStrings);
  // add the observer to the subject
  sim.addObserver(mockObsvr1);
  // there should be only this one observer
  var obsvrs = sim.getObservers();
  assertEquals(1, obsvrs.length);
  assertTrue(goog.array.contains(obsvrs, mockObsvr1));

  sim.setFixedPoint(0);
  assertEquals(0, sim.getFixedPoint());
  assertEquals(0.1, sim.getDamping());
  sim.setDamping(0.15);
  assertEquals(0.15, sim.getDamping());
  assertEquals(2, mockObsvr1.numDoubles);
  assertEquals(2.5, sim.getSpringRestLength());
  sim.setSpringRestLength(2.0);
  assertEquals(2.0, sim.getSpringRestLength());
  assertEquals(3, mockObsvr1.numDoubles);
  assertEquals(3.0, sim.getSpringStiffness());
  sim.setSpringStiffness(6.0);
  assertEquals(6.0, sim.getSpringStiffness());
  assertEquals(4, mockObsvr1.numDoubles);
  assertEquals(0.5, sim.getMass());
  sim.setMass(0.7);
  assertEquals(0.7, sim.getMass());
  assertEquals(5, mockObsvr1.numDoubles);
  var va = sim.getVarsList();
  va.setValue(0, 0.5);
  sim.initWork();
  sim.saveInitialState();
  assertEquals(Util.toName(SingleSpringSim.en.POSITION),
      va.getVariable(0).getName());
  assertEquals(SingleSpringSim.i18n.POSITION,
      va.getVariable(0).getName(/*localized=*/true));
  assertEquals(0.5, va.getValue(0));
  assertEquals(Util.toName(SingleSpringSim.en.VELOCITY),
      va.getVariable(1).getName());
  assertEquals(SingleSpringSim.i18n.VELOCITY,
      va.getVariable(1).getName(/*localized=*/true));
  assertEquals(0, va.getValue(1));
  var timeIdx = va.timeIndex();
  va.setValue(timeIdx, 100);
  sim.saveInitialState();
  va.setValue(timeIdx, 0);

  var expect = [
    [ 0.5040178571428572, 0.32056760204081636 ],
    [ 0.516017675638894, 0.6377051511841583 ],
    [ 0.5358925536030913, 0.9497343223285384 ],
    [ 0.5634940297550691, 1.2550130990176436 ],
    [ 0.5986331000236428, 1.551944363925923 ],
    [ 0.6410814456152146, 1.8389842031764325 ],
    [ 0.6905728648445506, 2.114649881594092 ],
    [ 0.7468048999775697, 2.377527447987486 ],
    [ 0.8094406493392821, 2.6262789317505306 ],
    [ 0.8781107540009925, 2.8596490944688435 ]
    ];

  // step to time zero to ensure energy is updated
  simpleAdv.advance(0);
  // step forward in time
  var timeStep = 0.025;
  var time = 0;
  for (i=0; i<10; i++) {
    simpleAdv.advance(timeStep);
    time += timeStep;
    assertEquals(va.getValue(0), block.getPosition().getX());
    assertEquals(va.getValue(1), block.getVelocity().getX());
    assertRoughlyEquals(time, sim.getTime(), tol);
    // check expected values
    assertRoughlyEquals(expect[i][0], va.getValue(0), 1E-14);
    assertRoughlyEquals(expect[i][1], va.getValue(1), 1E-14);
    // check that energy is roughly constant
    assertRoughlyEquals(6.7, va.getValue(7), 0.1);
    //console.log(va.getTime()+' '+va.getValue(0)+' '+va.getValue(1));
  }

  // reset to initial conditions, with time starting at 100
  sim.reset();
  assertEquals(0.5, va.getValue(0));
  assertEquals(0, va.getValue(1));
  assertEquals(100, sim.getTime());

  // advance again after reset, with time starting at 100
  time = 100;
  for (i=0; i<10; i++) {
    simpleAdv.advance(timeStep);
    time += timeStep;
    assertRoughlyEquals(time, sim.getTime(), tol);
    // check expected values
    assertRoughlyEquals(expect[i][0], va.getValue(0), 1E-14);
    assertRoughlyEquals(expect[i][1], va.getValue(1), 1E-14);
    // check that energy is roughly constant
    assertRoughlyEquals(6.7, va.getValue(7), 0.1);
  }

  sim.setPEOffset(99 - sim.getEnergyInfo().getPotential());
  var ei = sim.getEnergyInfo();
  assertEquals(99, ei.getPotential());
  assertRoughlyEquals(2.8621575302237665, ei.getTranslational(), 1e-10);
};

} // end class

/**
* @type {string}
* @const
*/
SingleSpringTest.groupName = 'SingleSpringTest.';

exports = SingleSpringTest;
