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

goog.module('myphysicslab.sims.roller.test.RollerTest');

const CirclePath = goog.require('myphysicslab.sims.roller.CirclePath');
const GenericEvent = goog.require('myphysicslab.lab.util.GenericEvent');
const ModifiedEuler = goog.require('myphysicslab.lab.model.ModifiedEuler');
const NumericalPath = goog.require('myphysicslab.lab.model.NumericalPath');
const ParameterBoolean = goog.require('myphysicslab.lab.util.ParameterBoolean');
const ParameterNumber = goog.require('myphysicslab.lab.util.ParameterNumber');
const ParameterString = goog.require('myphysicslab.lab.util.ParameterString');
const PathPoint = goog.require('myphysicslab.lab.model.PathPoint');
const RollerSingleSim = goog.require('myphysicslab.sims.roller.RollerSingleSim');
const SimObject = goog.require('myphysicslab.lab.model.SimObject');
const SimpleAdvance = goog.require('myphysicslab.lab.model.SimpleAdvance');
const Spring = goog.require('myphysicslab.lab.model.Spring');
const Subject = goog.require('myphysicslab.lab.util.Subject');
const TestRig = goog.require('myphysicslab.test.TestRig');
const Util = goog.require('myphysicslab.lab.util.Util');

const assertEquals = (e, v) => TestRig.assertEquals(e, v);
const assertRoughlyEquals = (e, v, t) => TestRig.assertRoughlyEquals(e, v, t);
const assertTrue = v => TestRig.assertTrue(v);
const assertFalse = v => TestRig.assertFalse(v);
const assertThrows = f => TestRig.assertThrows(f);
const schedule = testFunc => TestRig.schedule(testFunc);
const startTest = n => TestRig.startTest(n);

class RollerTest {

static test() {
  schedule(RollerTest.testRoller1);
};

/** Test RollerSingleSim with a circular path.  Ball starts at default upper left
position.  Run simulation for short time, compare to expected results (which were
obtained by running the simulation previously).  Check that energy stays constant.
*/
static testRoller1() {
  startTest(RollerTest.groupName+'testRoller1');
  var sim = new RollerSingleSim();
  var simList = sim.getSimList();
  var solvr = new ModifiedEuler(sim);
  var simpleAdv = new SimpleAdvance(sim, solvr);
  var path = new NumericalPath(new CirclePath(3.0));
  sim.setPath(path);
  assertEquals(0, sim.getDamping());
  assertEquals(0.5, sim.getMass());
  assertEquals(9.8, sim.getGravity());
  // March 2014: increase tolerance from 1E-13 to 2E-13 because Chrome version 33
  // has less accurate trig functions.
  var tol = 2E-13;
  var va = sim.getVarsList();
  var expect = [
    [ 2.3586219743147407, 0.17325628055424852 ],
    [ 2.36512064742212, 0.3467624393969093 ],
    [ 2.3759616566049595, 0.5207674926568824 ],
    [ 2.3911605800569604, 0.6955189861256125 ],
    [ 2.410739161460887, 0.8712622181979011 ],
    [ 2.4347252438084173, 1.0482394123962095 ],
    [ 2.463152681795956, 1.2266888223100774 ],
    [ 2.4960612308904864, 1.4068437515077188 ],
    [ 2.5334964107198403, 1.588931470682751 ],
    [ 2.5755093399946953, 1.7731720140215197 ]
  ];
  // step to time zero to ensure energy is updated
  simpleAdv.advance(0);
  // step forward in time
  var timeStep = 0.025;
  var time = 0;
  for (var i=0; i<10; i++) {
    simpleAdv.advance(timeStep);
    time += timeStep;
    assertRoughlyEquals(time, sim.getTime(), tol);
    assertRoughlyEquals(time, va.getValue(2), tol);
    // check expected values
    assertRoughlyEquals(expect[i][0], va.getValue(0), tol);
    assertRoughlyEquals(expect[i][1], va.getValue(1), tol);
    // check that energy is roughly constant
    assertRoughlyEquals(25.0935, va.getValue(7), 0.001);
    //console.log(va.getTime()+' '+va.getValue(0)+' '+va.getValue(1));
  }

  sim.setPEOffset(99 - sim.getEnergyInfo().getPotential());
  var ei = sim.getEnergyInfo();
  assertEquals(99, ei.getPotential());
  assertRoughlyEquals(0.7860347478272578, ei.getTranslational(), 1e-10);
};

} // end class

/**
* @type {string}
* @const
*/
RollerTest.groupName = 'RollerTest.';

exports = RollerTest;
