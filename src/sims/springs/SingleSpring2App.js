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

goog.module('myphysicslab.sims.springs.SingleSpring2App');

const AbstractSubject = goog.require('myphysicslab.lab.util.AbstractSubject');
const AutoScale = goog.require('myphysicslab.lab.graph.AutoScale');
const ButtonControl = goog.require('myphysicslab.lab.controls.ButtonControl');
const CheckBoxControl = goog.require('myphysicslab.lab.controls.CheckBoxControl');
const ChoiceControl = goog.require('myphysicslab.lab.controls.ChoiceControl');
const Clock = goog.require('myphysicslab.lab.util.Clock');
const CommonControls = goog.require('myphysicslab.sims.common.CommonControls');
const DiffEqSolverSubject = goog.require('myphysicslab.lab.model.DiffEqSolverSubject');
const DisplayAxes = goog.require('myphysicslab.lab.graph.DisplayAxes');
const DisplayClock = goog.require('myphysicslab.lab.view.DisplayClock');
const DisplayList = goog.require('myphysicslab.lab.view.DisplayList');
const DisplayShape = goog.require('myphysicslab.lab.view.DisplayShape');
const DisplaySpring = goog.require('myphysicslab.lab.view.DisplaySpring');
const DoubleRect = goog.require('myphysicslab.lab.util.DoubleRect');
const DrawingMode = goog.require('myphysicslab.lab.view.DrawingMode');
const EasyScriptParser = goog.require('myphysicslab.lab.util.EasyScriptParser');
const EnergyBarGraph = goog.require('myphysicslab.lab.graph.EnergyBarGraph');
const EnergySystem = goog.require('myphysicslab.lab.model.EnergySystem');
const EventHandler = goog.require('myphysicslab.lab.app.EventHandler');
const ExpressionVariable = goog.require('myphysicslab.lab.model.ExpressionVariable');
const GenericObserver = goog.require('myphysicslab.lab.util.GenericObserver');
const LabControl = goog.require('myphysicslab.lab.controls.LabControl');
const NumericControl = goog.require('myphysicslab.lab.controls.NumericControl');
const ODEAdvance = goog.require('myphysicslab.lab.model.ODEAdvance');
const Parameter = goog.require('myphysicslab.lab.util.Parameter');
const ParameterBoolean = goog.require('myphysicslab.lab.util.ParameterBoolean');
const ParameterNumber = goog.require('myphysicslab.lab.util.ParameterNumber');
const ParameterString = goog.require('myphysicslab.lab.util.ParameterString');
const PointMass = goog.require('myphysicslab.lab.model.PointMass');
const SimController = goog.require('myphysicslab.lab.app.SimController');
const SimList = goog.require('myphysicslab.lab.model.SimList');
const SimpleAdvance = goog.require('myphysicslab.lab.model.SimpleAdvance');
const SimRunner = goog.require('myphysicslab.lab.app.SimRunner');
const SimView = goog.require('myphysicslab.lab.view.SimView');
const SingleSpringSim = goog.require('myphysicslab.sims.springs.SingleSpringSim');
const SliderControl = goog.require('myphysicslab.lab.controls.SliderControl');
const Spring = goog.require('myphysicslab.lab.model.Spring');
const StandardGraph1 = goog.require('myphysicslab.sims.common.StandardGraph1');
const Subject = goog.require('myphysicslab.lab.util.Subject');
const TabLayout = goog.require('myphysicslab.sims.common.TabLayout');
const Terminal = goog.require('myphysicslab.lab.util.Terminal');
const TimeGraph2 = goog.require('myphysicslab.sims.common.TimeGraph2');
const ToggleControl = goog.require('myphysicslab.lab.controls.ToggleControl');
const Util = goog.require('myphysicslab.lab.util.Util');
const VarsList = goog.require('myphysicslab.lab.model.VarsList');
const Vector = goog.require('myphysicslab.lab.util.Vector');

/** SingleSpring2App displays the {@link SingleSpringSim} simulation.

The difference between this and {@link myphysicslab.sims.springs.SingleSpringApp} is
that this doesn't inherit from {@link myphysicslab.sims.common.AbstractApp} because
this uses {@link TimeGraph2} instead of TimeGraph1.
*/
class SingleSpring2App extends AbstractSubject {
/**
* @param {!Object} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @param {string=} opt_name name of this as a Subject
*/
constructor(elem_ids, opt_name) {
  Util.setErrorHandler();
  super(opt_name || 'APP');

  /** @type {!DoubleRect} */
  this.simRect = new DoubleRect(-3, -2, 3, 2);
  // set canvasWidth to 800, and canvasHeight proportional as in simRect.
  const canvasWidth = 800;
  const canvasHeight =
      Math.round(canvasWidth * this.simRect.getHeight() / this.simRect.getWidth());
  /** @type {!TabLayout} */
  this.layout = new TabLayout(elem_ids, canvasWidth, canvasHeight);
  // keep reference to terminal to make for shorter 'expanded' names
  /** @type {!Terminal} */
  this.terminal = this.layout.getTerminal();
  const simCanvas = this.layout.getSimCanvas();

  /** @type {!SingleSpringSim} */
  this.sim = new SingleSpringSim();
  this.terminal.setAfterEval( () => this.sim.modifyObjects());
  // Ensure that changes to parameters or variables cause display to update
  new GenericObserver(this.sim, evt => {
    this.sim.modifyObjects();
  }, 'modifyObjects after parameter or variable change');
  /** @type {!SimList} */
  this.simList = this.sim.getSimList();
  /** @type {!VarsList} */
  this.varsList = this.sim.getVarsList();
  /** @type {!SimController} */
  this.simCtrl = new SimController(simCanvas, /*eventHandler=*/this.sim);
  /** @type {!SimpleAdvance} */
  this.advance  = new SimpleAdvance(this.sim);
  /** @type {!SimView} */
  this.simView = new SimView('SIM_VIEW', this.simRect);
  simCanvas.addView(this.simView);
  /** @type {!DisplayList} */
  this.displayList = this.simView.getDisplayList();
  /** @type {!SimView} */
  this.statusView = new SimView('STATUS_VIEW', new DoubleRect(-10, -10, 10, 10));
  simCanvas.addView(this.statusView);
  /** @type {!DisplayAxes} */
  this.axes = CommonControls.makeAxes(this.simView, /*bottomLeft=*/true);
  /** @type {!SimRunner} */
  this.simRun = new SimRunner(this.advance);
  this.simRun.addCanvas(simCanvas);
  /** @type {!Clock} */
  this.clock = this.simRun.getClock();

  /** @type {!EnergyBarGraph} */
  this.energyGraph = new EnergyBarGraph(this.sim);
  /** @type {!ParameterBoolean} */
  this.showEnergyParam = CommonControls.makeShowEnergyParam(this.energyGraph,
      this.statusView, this);

  /** @type {!DisplayClock} */
  this.displayClock = new DisplayClock( () => this.sim.getTime(),
      () => this.clock.getRealTime(), /*period=*/2, /*radius=*/2);
  this.displayClock.setPosition(new Vector(8, 4));
  /** @type {!ParameterBoolean} */
  this.showClockParam = CommonControls.makeShowClockParam(this.displayClock,
      this.statusView, this);

  const panzoom = CommonControls.makePanZoomControls(this.simView,
      /*overlay=*/true,
      /*resetFunc=*/ () => this.simView.setSimRect(this.simRect));
  this.layout.getSimDiv().appendChild(panzoom);
  this.panZoomParam = CommonControls.makeShowPanZoomParam(panzoom, this);
  this.panZoomParam.setValue(false);

  /** @type {!DiffEqSolverSubject} */
  this.diffEqSolver = new DiffEqSolverSubject(this.sim, this.sim, this.advance);

  /** @type {!StandardGraph1} */
  this.graph = new StandardGraph1(this.sim.getVarsList(), this.layout.getGraphCanvas(),
      this.layout.getGraphControls(), this.layout.getGraphDiv(), this.simRun);
  this.graph.line.setDrawingMode(DrawingMode.LINES);

  /** @type {!TimeGraph2} */
  this.timeGraph = new TimeGraph2(this.sim.getVarsList(), this.layout.getTimeGraphCanvas(),
      this.layout.getTimeGraphControls(), this.layout.getTimeGraphDiv(), this.simRun);

  /** @type {!DisplayShape} */
  this.block = new DisplayShape(this.simList.getPointMass('block'))
      .setFillStyle('blue');
  this.displayList.add(this.block);
  /** @type {!DisplaySpring} */
  this.spring = new DisplaySpring(this.simList.getSpring('spring'))
      .setWidth(0.4).setThickness(6);
  this.displayList.add(this.spring);

  // Demo of adding an ExpressionVariable.
  if (!Util.ADVANCED) {
    const va = this.sim.getVarsList();
    va.addVariable(new ExpressionVariable(va, 'sin_time', 'sin(time)',
        this.terminal, 'Math.sin(sim.getTime());'));
  }

  this.addControl(CommonControls.makePlaybackControls(this.simRun));

  let pn = this.sim.getParameterNumber(SingleSpringSim.en.MASS);
  this.addControl(new NumericControl(pn));

  pn = this.sim.getParameterNumber(SingleSpringSim.en.DAMPING);
  this.addControl(new NumericControl(pn));

  pn = this.sim.getParameterNumber(SingleSpringSim.en.SPRING_STIFFNESS);
  this.addControl(new NumericControl(pn));

  pn = this.sim.getParameterNumber(SingleSpringSim.en.SPRING_LENGTH);
  this.addControl(new NumericControl(pn));

  pn = this.sim.getParameterNumber(SingleSpringSim.en.FIXED_POINT);
  this.addControl(new NumericControl(pn));

  this.addControl(new CheckBoxControl(this.showEnergyParam));
  this.addControl(new CheckBoxControl(this.showClockParam));
  this.addControl(new CheckBoxControl(this.panZoomParam));
  pn = this.simRun.getParameterNumber(SimRunner.en.TIME_STEP);
  this.addControl(new NumericControl(pn));
  pn = this.simRun.getClock().getParameterNumber(Clock.en.TIME_RATE);
  this.addControl(new NumericControl(pn));
  const ps = this.diffEqSolver.getParameterString(DiffEqSolverSubject.en.DIFF_EQ_SOLVER);
  this.addControl(new ChoiceControl(ps));
  const bm = CommonControls.makeBackgroundMenu(this.layout.getSimCanvas());
  this.addControl(bm);

  const subjects = [
    this,
    this.sim,
    this.diffEqSolver,
    this.simRun,
    this.simRun.getClock(),
    this.simView,
    this.statusView,
    this.varsList,
    this.layout,
    this.layout.getSimCanvas(),
    this.layout.getGraphCanvas(),
    this.layout.getTimeGraphCanvas(),
    this.graph,
    this.graph.line,
    this.graph.view,
    this.graph.autoScale,
    this.timeGraph.line1,
    this.timeGraph.line2,
    this.timeGraph.view1,
    this.timeGraph.view2,
    this.timeGraph.autoScale1,
    this.timeGraph.autoScale2
  ];
  /** @type {!EasyScriptParser} */
  this.easyScript = CommonControls.makeEasyScript(subjects, [ this.varsList ],
       this.simRun, this.terminal);
  this.addControl(CommonControls.makeURLScriptButton(this.easyScript, this.simRun));
};

/** @override */
toString() {
  return Util.ADVANCED ? '' : this.toStringShort().slice(0, -1)
      +', block: '+this.block.toStringShort()
      +', spring: '+this.spring.toStringShort()
      +', sim: '+this.sim.toStringShort()
      +', simList: '+this.simList.toStringShort()
      +', simCtrl: '+this.simCtrl.toStringShort()
      +', advance: '+this.advance
      +', simRect: '+this.simRect
      +', simView: '+this.simView.toStringShort()
      +', statusView: '+this.statusView.toStringShort()
      +', axes: '+this.axes.toStringShort()
      +', simRun: '+this.simRun.toStringShort()
      +', clock: '+this.clock.toStringShort()
      +', energyGraph: '+this.energyGraph.toStringShort()
      +', displayClock: '+this.displayClock.toStringShort()
      +', easyScript: '+this.easyScript.toStringShort()
      +', graph: '+this.graph
      +', timeGraph: '+this.timeGraph
      +', layout: '+this.layout
      +', terminal: '+this.terminal
      + super.toString();
};

/** @override */
getClassName() {
  return 'SingleSpring2App';
};

/** Define short-cut name replacement rules.  For example 'sim' is replaced
* by 'app.sim' when `myName` is 'app'.
* @param {string} myName  the name of this object, valid in global Javascript context.
* @export
*/
defineNames(myName) {
  this.terminal.addWhiteList(myName);
  this.terminal.addRegex('advance|axes|clock|diffEqSolver|displayClock'
      +'|energyGraph|graph|layout|sim|simCtrl|simList|simRect|simRun|varsList'
      +'|simView|statusView|timeGraph|easyScript|terminal|displayList',
      myName+'.');
  this.terminal.addRegex('simCanvas',
      myName+'.layout.');
  this.terminal.addRegex('block|spring',
      myName+'.');
};

/** Add the control to the set of simulation controls.
* @param {!LabControl} control
* @return {!LabControl} the control that was passed in
*/
addControl(control) {
  return this.layout.addControl(control);
};

/**
* @param {string} script
* @param {boolean=} opt_output whether to print the result to the output text area and
*    add the script to session history; default is `true`
* @return {*}
* @export
*/
eval(script, opt_output) {
  try {
    return this.terminal.eval(script, opt_output);
  } catch(ex) {
    this.terminal.alertOnce(ex);
  }
};

/**
* @return {undefined}
* @export
*/
setup() {
  this.clock.resume();
  this.terminal.parseURLorRecall();
  this.sim.saveInitialState();
  this.sim.modifyObjects();
  this.simRun.memorize();
};

/** Start the application running.
* @return {undefined}
* @export
*/
start() {
  this.simRun.startFiring();
};

} // end class

/**
* @param {!Object} elem_ids
* @return {!SingleSpring2App}
*/
function makeSingleSpring2App(elem_ids) {
  return new SingleSpring2App(elem_ids);
};
goog.exportSymbol('makeSingleSpring2App', makeSingleSpring2App);

exports = SingleSpring2App;
