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

goog.module('myphysicslab.sims.pendulum.RigidDoublePendulumApp');

const AbstractApp = goog.require('myphysicslab.sims.common.AbstractApp');
const CommonControls = goog.require('myphysicslab.sims.common.CommonControls');
const ConcreteLine = goog.require('myphysicslab.lab.model.ConcreteLine');
const DisplayConnector = goog.require('myphysicslab.lab.view.DisplayConnector');
const DisplayShape = goog.require('myphysicslab.lab.view.DisplayShape');
const DoubleRect = goog.require('myphysicslab.lab.util.DoubleRect');
const EnergySystem = goog.require('myphysicslab.lab.model.EnergySystem');
const GenericObserver = goog.require('myphysicslab.lab.util.GenericObserver');
const NumericControl = goog.require('myphysicslab.lab.controls.NumericControl');
const ParameterNumber = goog.require('myphysicslab.lab.util.ParameterNumber');
const PointMass = goog.require('myphysicslab.lab.model.PointMass');
const RigidDoublePendulumSim = goog.require('myphysicslab.sims.pendulum.RigidDoublePendulumSim');
const SimpleAdvance = goog.require('myphysicslab.lab.model.SimpleAdvance');
const Simulation = goog.require('myphysicslab.lab.model.Simulation');
const SliderControl = goog.require('myphysicslab.lab.controls.SliderControl');
const Util = goog.require('myphysicslab.lab.util.Util');
const Vector = goog.require('myphysicslab.lab.util.Vector');

/** Displays the {@link RigidDoublePendulumSim} simulation.
*/
class RigidDoublePendulumApp extends AbstractApp {
/**
* @param {!Object} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @param {boolean} centered determines which pendulum configuration to make: centered
*    (true) or offset (false)
*/
constructor(elem_ids, centered) {
  Util.setErrorHandler();
  /** @type {!RigidDoublePendulumSim.Parts} */
  const parts = centered ? RigidDoublePendulumSim.makeCentered(0.25 * Math.PI, 0)
        : RigidDoublePendulumSim.makeOffset(0.25 * Math.PI, 0);
  const simRect = new DoubleRect(-2, -2, 2, 2);
  const sim = new RigidDoublePendulumSim(parts);
  const advance = new SimpleAdvance(sim);
  super(elem_ids, simRect, sim, advance, /*eventHandler=*/null, /*energySystem=*/sim);

  // This Observer ensures that when initial angles are changed in sim, then clock
  // time is also reset.  This helps with feedback when dragging angle slider,
  // especially if the clock is running.
  new GenericObserver(sim, evt => {
    if (evt.nameEquals(Simulation.RESET)) {
      this.clock.setTime(sim.getTime());
    }
  }, 'sync clock time on reset');
  /** @type {!DisplayShape} */
  this.protoBob = new DisplayShape().setFillStyle('').setStrokeStyle('blue')
      .setDrawCenterOfMass(true).setThickness(3);
  /** @type {!DisplayShape} */
  this.bob0 = new DisplayShape(parts.bodies[0], this.protoBob);
  this.displayList.add(this.bob0);
  /** @type {!DisplayShape} */
  this.bob1 = new DisplayShape(parts.bodies[1], this.protoBob);
  this.displayList.add(this.bob1);
  /** @type {!DisplayConnector} */
  this.joint0 = new DisplayConnector(parts.joints[0]);
  this.displayList.add(this.joint0);
  /** @type {!DisplayConnector} */
  this.joint1 = new DisplayConnector(parts.joints[1]);
  this.displayList.add(this.joint1);

  this.addPlaybackControls();
  /** @type {!ParameterNumber} */
  let pn;
  pn = sim.getParameterNumber(RigidDoublePendulumSim.en.GRAVITY);
  this.addControl(new SliderControl(pn, 0, 20, /*multiply=*/false));

  pn = sim.getParameterNumber(RigidDoublePendulumSim.en.ANGLE_1);
  this.addControl(new SliderControl(pn, -Math.PI, Math.PI, /*multiply=*/false));

  pn = sim.getParameterNumber(RigidDoublePendulumSim.en.ANGLE_2);
  this.addControl(new SliderControl(pn, -Math.PI, Math.PI, /*multiply=*/false));

  pn = sim.getParameterNumber(EnergySystem.en.PE_OFFSET);
  this.addControl(new NumericControl(pn));

  this.addStandardControls();

  this.makeEasyScript();
  this.addURLScriptButton();
};

/** @override */
toString() {
  return Util.ADVANCED ? '' : this.toStringShort().slice(0, -1)
      +', bob0: '+this.bob0.toStringShort()
      +', bob1: '+this.bob1.toStringShort()
      +', joint0: '+this.joint0.toStringShort()
      +', joint1: '+this.joint1.toStringShort()
      + super.toString();
};

/** @override */
getClassName() {
  return 'RigidDoublePendulumApp';
};

/** @override */
defineNames(myName) {
  super.defineNames(myName);
  this.terminal.addRegex('joint0|joint1|bob1|bob0|protoBob',
      myName+'.');
};

} // end class

/**
* @param {!Object} elem_ids
* @param {boolean} centered determines which pendulum configuration to make: centered
*    (true) or offset (false)
* @return {!RigidDoublePendulumApp}
*/
function makeRigidDoublePendulumApp(elem_ids, centered) {
  return new RigidDoublePendulumApp(elem_ids, centered);
};
goog.exportSymbol('makeRigidDoublePendulumApp', makeRigidDoublePendulumApp);

exports = RigidDoublePendulumApp;
