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

import { DampingLaw } from '../lab/model/DampingLaw.js';
import { CollisionAdvance } from '../lab/model/CollisionAdvance.js';
import { CollisionHandling } from '../lab/engine2D/CollisionHandling.js';
import { ConstantForceLaw } from '../lab/model/ConstantForceLaw.js';
import { ContactSim } from '../lab/engine2D/ContactSim.js';
import { CoordType } from '../lab/model/CoordType.js';
import { DisplayShape } from '../lab/view/DisplayShape.js';
import { DoubleRect } from '../lab/util/DoubleRect.js';
import { ExtraAccel } from '../lab/engine2D/ExtraAccel.js';
import { Force } from '../lab/model/Force.js';
import { GravityLaw } from '../lab/model/GravityLaw.js';
import { RigidBody } from '../lab/engine2D/RigidBody.js';
import { RigidBodyCollision } from '../lab/engine2D/RigidBody.js';
import { Rope } from '../lab/engine2D/Rope.js';
import { RungeKutta } from '../lab/model/RungeKutta.js';
import { Scrim } from '../lab/engine2D/Scrim.js';
import { Shapes } from '../lab/engine2D/Shapes.js';
import { Util } from '../lab/util/Util.js';
import { Vector } from '../lab/util/Vector.js';
import { Walls } from '../lab/engine2D/Walls.js';

import { schedule, setTestName } from './TestRig.js';
import { makeVars, setBodyVars, runTest }
    from './Engine2DTestRig.js';

const groupName = 'RopeTest.';

/** Tests various configurations of Ropes.
*/
export class RopeTest {

constructor() { throw ''; };

static test() {
  schedule(RopeTest.pendulum_rope_test);
  schedule(RopeTest.pendulum_rope_test_2);
  schedule(RopeTest.pendulum_rod_test);
  schedule(RopeTest.pendulum_rope_bounce_test);
  schedule(RopeTest.double_rope_spin_test);
  schedule(RopeTest.double_rod_spin_test);
  schedule(RopeTest.double_rope_thrust_test);
  schedule(RopeTest.double_rod_thrust_test);
};

/**
@param sim
@param advance
*/
private static commonSetup1(sim: ContactSim, advance: CollisionAdvance<RigidBodyCollision>) {
  sim.addForceLaw(new DampingLaw(0, 0.15, sim.getSimList()));
  sim.setDistanceTol(0.01);
  sim.setVelocityTol(0.5);
  sim.setCollisionAccuracy(0.6);
  sim.setCollisionHandling(CollisionHandling.SERIAL_GROUPED_LASTPASS);
  sim.setExtraAccel(ExtraAccel.VELOCITY);
  advance.setDiffEqSolver(new RungeKutta(sim));
  advance.setJointSmallImpacts(false);
  advance.setTimeStep(0.01);
};

/**
@param sim
@param advance
@param ropeType
*/
private static pendulum_rope_init(sim: ContactSim, advance: CollisionAdvance<RigidBodyCollision>, ropeType: number) {
  RopeTest.commonSetup1(sim, advance);
  var b1 = Shapes.makeBlock(1, 3, 'block');
  // let the rope align the body
  sim.addBody(b1);
  var rope = new Rope(
      /*body1=*/Scrim.getScrim(), /*attach1_body=*/new Vector(0, 2),
      /*body2=*/b1, /*attach2_body=*/Vector.NORTH,
      /*restLength=*/4.0,
      /*ropeType=*/ropeType);
  sim.addConnector(rope);
  {
    // move to zero energy position, to record zero energy level
    b1.setPosition(new Vector(0,  -6),  0);
    sim.alignConnectors();
    b1.setZeroEnergyLevel();
    // move to starting position (only the angle matters)
    b1.setPosition(new Vector(6,  -3),  -Math.PI/4);
  }
  sim.alignConnectors();
  var g = new GravityLaw(10.0, sim.getSimList());
  sim.addForceLaw(g);
  sim.setElasticity(0.8);
};

/** Block hangs on a flexible rope which is attached to a fixed point.
@param sim
@param advance
*/
static pendulum_rope_setup(sim: ContactSim, advance: CollisionAdvance<RigidBodyCollision>) {
  RopeTest.pendulum_rope_init(sim, advance, Rope.ROPE);
};

/**
*/
static pendulum_rope_test(): void {
  setTestName(groupName+'pendulum_rope_test');
  var sim = new ContactSim();
  var advance = new CollisionAdvance(sim);
  RopeTest.pendulum_rope_setup(sim, advance);
  var vars = makeVars(1*6);
  setBodyVars(sim, vars, 0, -0.464624, 2.5075476, -1.6254294, -1.9480108, -1.9189756, 2.5008213);
  runTest(sim, advance, /*runUntil=*/3.0,
      /*expectedVars=*/vars, /*tolerance=*/0.0005,
      /*expectedEnergyDiff=*/0.0, /*energyTol=*/0.0005,
      /*expectedCollisions=*/-1);
};

/** Shows that energy is very stable to 7 decimals when using a small time step of
0.0025.
*/
static pendulum_rope_test_2(): void {
  setTestName(groupName+'pendulum_rope_test_2');
  var sim = new ContactSim();
  var advance = new CollisionAdvance(sim);
  RopeTest.pendulum_rope_setup(sim, advance);
  advance.setTimeStep(0.0025);
  var vars = makeVars(1*6);
  setBodyVars(sim, vars, 0, -0.4646816, 2.5074788, -1.6254848, -1.9481484, -1.9189219, 2.5008787);
  runTest(sim, advance, /*runUntil=*/3.0,
      /*expectedVars=*/vars, /*tolerance=*/0.000007,
      /*expectedEnergyDiff=*/0.0, /*energyTol=*/0.000007,
      /*expectedCollisions=*/-1);
};

/** Block hangs on a stiff rod which is attached to a fixed point.
@param sim
@param advance
*/
static pendulum_rod_setup(sim: ContactSim, advance: CollisionAdvance<RigidBodyCollision>) {
  RopeTest.pendulum_rope_init(sim, advance, Rope.ROD);
};

/**
*/
static pendulum_rod_test(): void {
  setTestName(groupName+'pendulum_rod_test');
  var sim = new ContactSim();
  var advance = new CollisionAdvance(sim);
  RopeTest.pendulum_rod_setup(sim, advance);
  var vars = makeVars(1*6);
  setBodyVars(sim, vars, 0, -0.4724374, 2.508797, -1.6265058, -1.9447708, -1.9244047, 2.4944412);
  runTest(sim, advance, /*runUntil=*/3.0,
      /*expectedVars=*/vars, /*tolerance=*/0.0001,
      /*expectedEnergyDiff=*/0.0, /*energyTol=*/0.0001,
      /*expectedCollisions=*/-1);
};

/** Block bounces onto flexible rope which is attached to a fixed point.
@param sim
@param advance
*/
static pendulum_rope_bounce_setup(sim: ContactSim, advance: CollisionAdvance<RigidBodyCollision>) {
  RopeTest.commonSetup1(sim, advance);
  var b1 = Shapes.makeBlock(1, 3, 'block');
  sim.addBody(b1);
  var rope = new Rope(
      /*body1=*/Scrim.getScrim(), /*attach1_body=*/new Vector(0, 2),
      /*body2=*/b1, /*attach2_body=*/Vector.NORTH,
      /*restLength=*/4.0, Rope.ROPE);
  sim.addConnector(rope);
  {
    // move to zero energy position, to record zero energy level
    b1.setPosition(new Vector(0,  -6),  0);
    sim.alignConnectors();
    b1.setZeroEnergyLevel();
    // move to starting position (only the angle matters)
    b1.setPosition(new Vector(-2,  0),  Math.PI/4);
  }
  var g = new GravityLaw(10.0, sim.getSimList());
  sim.addForceLaw(g);
  sim.setElasticity(0.8);
};

/**
*/
static pendulum_rope_bounce_test(): void {
  setTestName(groupName+'pendulum_rope_bounce_test');
  var sim = new ContactSim();
  var advance = new CollisionAdvance(sim);
  RopeTest.pendulum_rope_bounce_setup(sim, advance);
  var vars = makeVars(1*6);
  setBodyVars(sim, vars, 0, -1.2820741, 0.3190586, -1.4043371, 2.2570863, -2.1692939, -2.5745948);
  runTest(sim, advance, /*runUntil=*/4.0,
              /*expectedVars=*/vars, /*tolerance=*/0.0001);
  // run for a few more seconds: there should be no more collision searches,
  // and energy should be constant
  runTest(sim, advance, /*runUntil=*/8.0,
      /*expectedVars=*/null, /*tolerance=*/NaN,
      /*expectedEnergyDiff=*/0.0, /*energyTol=*/0.002,
      /*expectedCollisions=*/0);
};

/**
@param sim
@param advance
@param ropeType
@param thrust
*/
static double_rope_init(sim: ContactSim, advance: CollisionAdvance<RigidBodyCollision>, ropeType: number, thrust: boolean) {
  RopeTest.commonSetup1(sim, advance);
  var b1 = Shapes.makeBlock(1, 3, 'block');
  b1.setPosition(new Vector(-1.5,  0),  Math.PI/4);
  b1.setVelocity(new Vector(0,  -4),  0);
  var b2 = Shapes.makeBall(1.0, 'ball');
  b2.setPosition(new Vector(1.5,  0),  3*Math.PI/4);
  b2.setVelocity(new Vector(0,  4),  0);
  var rope = new Rope(
      /*body1=*/b1, /*attach1_body=*/Vector.NORTH,
      /*body2=*/b2, /*attach2_body=*/new Vector(0.2, 0.3),
      /*restLength=*/4.0,
      /*ropeType=*/ropeType);
  if (thrust) {
    // constant force moving the block leftwards
    var f = new Force('constant', b1,
        /*location=*/new Vector(0, 0), CoordType.BODY,
        /*direction=*/new Vector(-2.0, 0), CoordType.WORLD);
    sim.addForceLaw(new ConstantForceLaw(f));
    // start at rest
    b1.setVelocity(new Vector(0,  0),  0);
    b2.setVelocity(new Vector(0,  0),  0);
  }
  sim.addBody(b1);
  sim.addBody(b2);
  sim.addConnector(rope);
  if (ropeType == Rope.ROD) {
    sim.alignConnectors();
  }
  sim.setElasticity(0.8);
};

/**
@param sim
@param advance
*/
static double_rope_spin_setup(sim: ContactSim, advance: CollisionAdvance<RigidBodyCollision>) {
  RopeTest.double_rope_init(sim, advance, Rope.ROPE, false);
};

/**
*/
static double_rope_spin_test(): void {
  setTestName(groupName+'double_rope_spin_test');
  var sim = new ContactSim();
  var advance = new CollisionAdvance(sim);
  RopeTest.double_rope_spin_setup(sim, advance);
  var vars = makeVars(2*6);
  setBodyVars(sim, vars, 0, -2.0202249, 1.1878731, -0.0549298, -2.8669664, -3.2775885, -1.0964268);
  setBodyVars(sim, vars, 1, 2.0202249, -1.1878731, 0.0549298, 2.8669664, 8.2637575, 2.398712);
  runTest(sim, advance, /*runUntil=*/4.0,
      /*expectedVars=*/vars, /*tolerance=*/0.0001);
  // run for a few more seconds: there should be no more collision searches,
  // and energy should be constant
  runTest(sim, advance, /*runUntil=*/8.0,
      /*expectedVars=*/null, /*tolerance=*/NaN,
      /*expectedEnergyDiff=*/0.0, /*energyTol=*/0.0001,
      /*expectedCollisions=*/0);
};

/**
@param sim
@param advance
*/
static double_rod_spin_setup(sim: ContactSim, advance: CollisionAdvance<RigidBodyCollision>) {
  RopeTest.double_rope_init(sim, advance, Rope.ROD, false);
  var collisions: RigidBodyCollision[] = [];
  sim.findCollisions(collisions, sim.getVarsList().getValues(), 0);
  sim.handleCollisions(collisions);
};

/**
*/
static double_rod_spin_test(): void {
  setTestName(groupName+'double_rod_spin_test');
  var sim = new ContactSim();
  var advance = new CollisionAdvance(sim);
  RopeTest.double_rod_spin_setup(sim, advance);
  var vars = makeVars(2*6);
  setBodyVars(sim, vars, 0, -1.3440816, 2.7586505, -1.1513866, -2.2201892, -2.9211644, -0.7262073);
  setBodyVars(sim, vars, 1, 1.8870925, -2.7586505, 1.0254415, 2.2201892, 9.245482, 3.1965811);
  runTest(sim, advance, /*runUntil=*/4.0,
      /*expectedVars=*/vars, /*tolerance=*/0.0001);
  // run for a few more seconds: there should be no more collision searches,
  // and energy should be constant
  runTest(sim, advance, /*runUntil=*/8.0,
      /*expectedVars=*/null, /*tolerance=*/NaN,
      /*expectedEnergyDiff=*/0.0, /*energyTol=*/0.0001,
      /*expectedCollisions=*/0);
};

/**
@param sim
@param advance
*/
static double_rope_thrust_setup(sim: ContactSim, advance: CollisionAdvance<RigidBodyCollision>) {
  RopeTest.double_rope_init(sim, advance, Rope.ROPE, true);
};

/**
*/
static double_rope_thrust_test(): void {
  setTestName(groupName+'double_rope_thrust_test');
  var sim = new ContactSim();
  var advance = new CollisionAdvance(sim);
  RopeTest.double_rope_thrust_setup(sim, advance);
  var vars = makeVars(2*6);
  setBodyVars(sim, vars, 0, -20.0813603, -6.2898682, 0.7630124, 0.4718985, -3.0405913, 0.8092874);
  setBodyVars(sim, vars, 1, -15.9186397, -5.7101318, -0.7630124, -0.4718985, 3.267749, 0.002753);
  runTest(sim, advance, /*runUntil=*/6.0,
      /*expectedVars=*/vars, /*tolerance=*/0.0001);
  // run for a few more seconds: there should be no more collision searches,
  runTest(sim, advance, /*runUntil=*/10.0,
      /*expectedVars=*/null, /*tolerance=*/NaN,
      /*expectedEnergyDiff=*/NaN, /*energyTol=*/NaN,
      /*expectedCollisions=*/0);
};

/**
@param sim
@param advance
*/
static double_rod_thrust_setup(sim: ContactSim, advance: CollisionAdvance<RigidBodyCollision>) {
  RopeTest.double_rope_init(sim, advance, Rope.ROD, true);
};

/**
*/
static double_rod_thrust_test(): void {
  setTestName(groupName+'double_rod_thrust_test');
  var sim = new ContactSim();
  var advance = new CollisionAdvance(sim);
  RopeTest.double_rod_thrust_setup(sim, advance);
  var vars = makeVars(2*6);
  setBodyVars(sim, vars, 0, -9.7557763, -3.7491489, -0.2804153, 0.3478909, -3.2053655, -0.7700812);
  setBodyVars(sim, vars, 1, -5.7012128, -4.2508511, 0.1544703, -0.3478909, 2.4690449, 0.5674662);
  runTest(sim, advance, /*runUntil=*/4.0,
      /*expectedVars=*/vars, /*tolerance=*/0.0001);
  // run for a few more seconds: there should be no more collision searches,
  runTest(sim, advance, /*runUntil=*/8.0,
      /*expectedVars=*/null, /*tolerance=*/NaN,
      /*expectedEnergyDiff=*/NaN, /*energyTol=*/NaN,
      /*expectedCollisions=*/0);
};

} // end class
