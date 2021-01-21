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

goog.module('myphysicslab.sims.roller.LagrangeRollerApp');

const AbstractApp = goog.require('myphysicslab.sims.common.AbstractApp');
const CommonControls = goog.require('myphysicslab.sims.common.CommonControls');
const DisplayPath = goog.require('myphysicslab.lab.view.DisplayPath');
const DisplayShape = goog.require('myphysicslab.lab.view.DisplayShape');
const DoubleRect = goog.require('myphysicslab.lab.util.DoubleRect');
const DrawingStyle = goog.require('myphysicslab.lab.view.DrawingStyle');
const LagrangeRollerSim = goog.require('myphysicslab.sims.roller.LagrangeRollerSim');
const NumericControl = goog.require('myphysicslab.lab.controls.NumericControl');
const PointMass = goog.require('myphysicslab.lab.model.PointMass');
const SimpleAdvance = goog.require('myphysicslab.lab.model.SimpleAdvance');
const TabLayout = goog.require('myphysicslab.sims.common.TabLayout');
const Util = goog.require('myphysicslab.lab.util.Util');
const Vector = goog.require('myphysicslab.lab.util.Vector');

/** Shows the {@link LagrangeRollerSim} simulation.
*/
class LagrangeRollerApp extends AbstractApp {
/**
* @param {!TabLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
*/
constructor(elem_ids) {
  Util.setErrorHandler();
  const simRect = new DoubleRect(-6, -6, 6, 6);
  const sim = new LagrangeRollerSim();
  const advance = new SimpleAdvance(sim);
  super(elem_ids, simRect, sim, advance, /*eventHandler=*/sim,
      /*energySystem=*/sim);

  this.simRect = sim.getPath().getBoundsWorld().scale(1.2);
  this.simView.setSimRect(this.simRect);

  /** @type {!DisplayShape} */
  this.ball1 = new DisplayShape(this.simList.getPointMass('ball1'))
      .setFillStyle('blue');
  this.displayList.add(this.ball1);

  /** @type {!DisplayPath} */
  this.displayPath = new DisplayPath();
  this.displayPath.setScreenRect(this.simView.getScreenRect());
  this.displayPath.setZIndex(-1);
  this.displayList.add(this.displayPath);
  this.displayPath.addPath(sim.getPath(),
      DrawingStyle.lineStyle('gray', /*lineWidth=*/4));

  this.addPlaybackControls();

  let pn = sim.getParameterNumber(LagrangeRollerSim.en.GRAVITY);
  this.addControl(new NumericControl(pn));
  pn = sim.getParameterNumber(LagrangeRollerSim.en.MASS);
  this.addControl(new NumericControl(pn));

  this.addStandardControls();

  this.graph.line.setXVariable(0);
  this.graph.line.setYVariable(1);
  this.timeGraph.line1.setYVariable(0);
  this.timeGraph.line2.setYVariable(1);

  this.makeEasyScript();
  this.addURLScriptButton();
};

/** @override */
toString() {
  return Util.ADVANCED ? '' : this.toStringShort().slice(0, -1)
      +', ball1: '+this.ball1.toStringShort()
      +', displayPath: '+this.displayPath.toStringShort()
      + super.toString();
};

/** @override */
getClassName() {
  return 'LagrangeRollerApp';
};

/** @override */
defineNames(myName) {
  super.defineNames(myName);
  this.terminal.addRegex('ball1',
      myName+'.');
};

} // end class

/**
* @param {!TabLayout.elementIds} elem_ids
* @return {!LagrangeRollerApp}
*/
function makeLagrangeRollerApp(elem_ids) {
  return new LagrangeRollerApp(elem_ids);
};
goog.exportSymbol('makeLagrangeRollerApp', makeLagrangeRollerApp);

exports = LagrangeRollerApp;
