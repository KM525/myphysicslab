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

goog.module('myphysicslab.sims.pde.StringApp');

const AbstractSubject = goog.require('myphysicslab.lab.util.AbstractSubject');
const AffineTransform = goog.require('myphysicslab.lab.util.AffineTransform');
const CheckBoxControl = goog.require('myphysicslab.lab.controls.CheckBoxControl');
const ChoiceControl = goog.require('myphysicslab.lab.controls.ChoiceControl');
const Clock = goog.require('myphysicslab.lab.util.Clock');
const CommonControls = goog.require('myphysicslab.sims.common.CommonControls');
const DisplayAxes = goog.require('myphysicslab.lab.graph.DisplayAxes');
const DisplayClock = goog.require('myphysicslab.lab.view.DisplayClock');
const DisplayList = goog.require('myphysicslab.lab.view.DisplayList');
const DisplayPath = goog.require('myphysicslab.lab.view.DisplayPath');
const DisplayShape = goog.require('myphysicslab.lab.view.DisplayShape');
const DisplayText = goog.require('myphysicslab.lab.view.DisplayText');
const DoubleRect = goog.require('myphysicslab.lab.util.DoubleRect');
const DrawingStyle = goog.require('myphysicslab.lab.view.DrawingStyle');
const EasyScriptParser = goog.require('myphysicslab.lab.util.EasyScriptParser');
const EnergyBarGraph = goog.require('myphysicslab.lab.graph.EnergyBarGraph');
const EnergySystem = goog.require('myphysicslab.lab.model.EnergySystem');
const GenericEvent = goog.require('myphysicslab.lab.util.GenericEvent');
const GenericMemo = goog.require('myphysicslab.lab.util.GenericMemo');
const GenericObserver = goog.require('myphysicslab.lab.util.GenericObserver');
const HorizAlign = goog.require('myphysicslab.lab.view.HorizAlign');
const LabControl = goog.require('myphysicslab.lab.controls.LabControl');
const LabelControl = goog.require('myphysicslab.lab.controls.LabelControl');
const NumericControl = goog.require('myphysicslab.lab.controls.NumericControl');
const ParameterBoolean = goog.require('myphysicslab.lab.util.ParameterBoolean');
const ParameterString = goog.require('myphysicslab.lab.util.ParameterString');
const PointMass = goog.require('myphysicslab.lab.model.PointMass');
const ShapeType = goog.require('myphysicslab.lab.model.ShapeType');
const SimController = goog.require('myphysicslab.lab.app.SimController');
const SimRunner = goog.require('myphysicslab.lab.app.SimRunner');
const SimView = goog.require('myphysicslab.lab.view.SimView');
const SliderControl = goog.require('myphysicslab.lab.controls.SliderControl');
const StringAdvance = goog.require('myphysicslab.sims.pde.StringAdvance');
const StringPath = goog.require('myphysicslab.sims.pde.StringPath');
const StringShape = goog.require('myphysicslab.sims.pde.StringShape');
const StringShapes = goog.require('myphysicslab.sims.pde.StringShapes');
const StringSim = goog.require('myphysicslab.sims.pde.StringSim');
const TabLayout = goog.require('myphysicslab.sims.common.TabLayout');
const Terminal = goog.require('myphysicslab.lab.util.Terminal');
const Util = goog.require('myphysicslab.lab.util.Util');
const Vector = goog.require('myphysicslab.lab.util.Vector');
const VerticalAlign = goog.require('myphysicslab.lab.view.VerticalAlign');

// following are only required for possible use in Terminal
const VarsHistory = goog.require('myphysicslab.lab.graph.VarsHistory');
const ExpressionVariable = goog.require('myphysicslab.lab.model.ExpressionVariable');
const FunctionVariable = goog.require('myphysicslab.lab.model.FunctionVariable');
const ClockTask = goog.require('myphysicslab.lab.util.ClockTask');

/** Displays the {@link StringSim} simulation.

Creates instance objects such as the simulation and display objects;
defines regular expressions for easy Terminal scripting of these objects using short
names instead of fully qualified property names.

The constructor takes an argument that specifies the names of the HTML elementId's to
look for in the HTML document; these elements are where the user interface of the
simulation is created. This allows for having two separate simulation apps running
concurrently on a single page.

No global variables are created other than two root global variables: the
`myphysicslab` global holds all of the myPhysicsLab classes; and a global variable is
created for this application instance. This application global is created outside of
this file in the HTML where the constructor is called. The name of that global variable
holding the application is passed to defineNames() method so that short-names in scripts
can be properly expanded.

*/
class StringApp extends AbstractSubject {
/**
* @param {!TabLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
*/
constructor(elem_ids) {
  Util.setErrorHandler();
  super('APP');
  /** @type {!TabLayout} */
  this.layout = new TabLayout(elem_ids);
  // keep reference to terminal to make for shorter 'expanded' names
  /** @type {!Terminal} */
  this.terminal = this.layout.terminal;
  var sim_controls = this.layout.sim_controls;
  var simCanvas = this.layout.simCanvas;

  var length = 13.5;
  /** @type {!Array<!StringShape>} */
  this.shapes = [
      new StringShapes.FlatShape(length),
      new StringShapes.TrianglePulseShape(length),
      new StringShapes.SquarePulseShape(length),
      new StringShapes.SinePulseShape(length),
      new StringShapes.HalfSinePulseShape(length),
      new StringShapes.MultiSineShape(length)
    ];
  /** @type {!StringSim} */
  this.sim = new StringSim(this.shapes[1]);
  this.terminal.setAfterEval( () => this.sim.modifyObjects() );
  this.simList = this.sim.getSimList();
  /** @type {!SimController} */
  this.simCtrl = new SimController(simCanvas, /*eventHandler=*/this.sim);
  /** @type {!StringAdvance} */
  this.advance  = new StringAdvance(this.sim);
  /** @type {!DoubleRect} */
  this.simRect = new DoubleRect(-1, -0.25, 14, 0.25);
  /** @type {!SimView} */
  this.simView = new SimView('simView', this.simRect);
  /** @type {!DisplayList} */
  this.displayList = this.simView.getDisplayList();
  this.simView.setHorizAlign(HorizAlign.FULL);
  this.simView.setVerticalAlign(VerticalAlign.FULL);
  simCanvas.addView(this.simView);
  /** @type {!SimView} */
  this.statusView = new SimView('status', new DoubleRect(-10, -10, 10, 10));
  simCanvas.addView(this.statusView);
  /** @type {!DisplayAxes} */
  this.axes = CommonControls.makeAxes(this.simView, /*bottomLeft=*/true);
  /** @type {!SimRunner} */
  this.simRun = new SimRunner(this.advance);
  this.simRun.addCanvas(simCanvas);
  /** @type {!Clock} */
  this.clock = this.simRun.getClock();

  // Note: if you set the strokeStyle, the line is distorted because the
  // aspect ratio of the SimView is around 1:30 (width to height).
  /** @type {!PointMass} */
  this.blockMass = this.simList.getPointMass('block');
  /** @type {!DisplayShape} */
  this.block = new DisplayShape(this.blockMass).setFillStyle('rgba(0,0,255,0.2)');
  this.displayList.add(this.block);

  // Because the SimView is so distorted (aspect ratio is like 1:30), we set
  // up a DisplayText in StatusView that tracks position of the block.
  /** @type {!DisplayText} */
  this.blockText = new DisplayText('drag').setFillStyle('rgba(255,255,255,0.7)')
      .setTextAlign('center');
  this.statusView.getDisplayList().add(this.blockText);
  this.statusView.addMemo(new GenericMemo( () => {
    var map1 = this.simView.getCoordMap();
    var map2 = this.statusView.getCoordMap();
    var loc = map1.simToScreen(this.blockMass.getPosition());
    this.blockText.setPosition(map2.screenToSim(loc));
  }, 'blockText follows blockMass'));

  // Because the SimView is so distorted (aspect ratio is like 1:30), we set
  // up a PointMass and DisplayShape to follow the block. This allows us to
  // stroke the shape with a uniform size of line.
  // (This is mainly a demo and test of this capability).
  /** @type {!PointMass} */
  this.shadow = PointMass.makeSquare(1, 'shadow');
  /** @type {!DisplayShape} */
  this.showShadow = new DisplayShape(this.shadow).setFillStyle('')
      .setStrokeStyle('gray');
  this.statusView.getDisplayList().add(this.showShadow);
  this.statusView.addMemo(new GenericMemo( () => {
    var map1 = this.simView.getCoordMap();
    var map2 = this.statusView.getCoordMap();
    // set width and height of shadow to match blockMass
    var w = this.blockMass.getWidth();
    var w2 = w*map1.getScaleX()/map2.getScaleX();
    this.shadow.setWidth(w2);
    var h = this.blockMass.getHeight();
    var h2 = h*map1.getScaleY()/map2.getScaleY();
    this.shadow.setHeight(h2);
    // set position of shadow to match blockMass
    var loc = map1.simToScreen(this.blockMass.getPosition());
    this.shadow.setPosition(map2.screenToSim(loc));
  }, 'shadow outline follows blockMass'));

  // Show the stability condition as text
  /** @type {number} */
  this.stability = -1;
  /** @type {!DisplayText} */
  this.stabilityText = new DisplayText();
  this.stabilityText.setPosition(new Vector(-5, -7));
  this.statusView.getDisplayList().add(this.stabilityText);
  // Ensure that changes to parameters or variables cause display to update
  new GenericObserver(this.sim, evt => {
    this.sim.modifyObjects();
    var s = this.sim.getStability();
    if (this.stability != s) {
      this.stabilityText.setText('stability = '+Util.NF5(s));
      this.stability = s;
      this.stabilityText.setFillStyle(s < 1 ? 'rgb(160,160,160)' : 'red');
    }
  }, 'modifyObjects after parameter or variable change');
  // broadcast an event to get the stability to appear
  this.sim.broadcast(new GenericEvent(this.sim, /*name=*/'event'));

  /** @type {!StringPath} */
  this.path = new StringPath(this.sim);
  /** @type {!DisplayPath} */
  this.displayPath = new DisplayPath();
  this.displayPath.setScreenRect(this.simView.getScreenRect());
  // offscreen buffer is not useful because StringPath is always changing
  this.displayPath.setUseBuffer(false);
  this.displayPath.setZIndex(-1);
  this.displayList.add(this.displayPath);
  this.displayPath.addPath(this.path, DrawingStyle.dotStyle('red', /*dotSize=*/2));

  this.addControl(CommonControls.makePlaybackControls(this.simRun));

  // make array of shape name strings for the SHAPE parameter
  var sn = [];
  var snl = [];
  for (var i=0; i<this.shapes.length; i++) {
    sn.push(this.shapes[i].getName(/*localized=*/false));
    snl.push(this.shapes[i].getName(/*localized=*/true));
  }
  var ps = new ParameterString(this, StringSim.en.SHAPE,
      StringSim.i18n.SHAPE,
      () => this.getShape(), a => this.setShape(a), snl, sn);
  this.addParameter(ps);
  this.addControl(new ChoiceControl(ps));

  var pn = this.sim.getParameterNumber(StringSim.en.NUM_POINTS);
  this.addControl(new NumericControl(pn));
  pn = this.sim.getParameterNumber(StringSim.en.DENSITY);
  this.addControl(new SliderControl(pn, 0.2, 20.2, /*multiply=*/true));
  pn = this.sim.getParameterNumber(StringSim.en.TENSION);
  this.addControl(new SliderControl(pn, 0, 20, /*multiply=*/false));
  pn = this.sim.getParameterNumber(StringSim.en.DAMPING);
  this.addControl(new SliderControl(pn, 0, 1, /*multiply=*/false));
  pn = this.sim.getParameterNumber(StringSim.en.TIME_STEP);
  this.addControl(new NumericControl(pn).setDecimalPlaces(7));
  pn = this.clock.getParameterNumber(Clock.en.TIME_RATE);
  this.addControl(new NumericControl(pn));
  pn = this.sim.getParameterNumber(EnergySystem.en.PE_OFFSET);
  this.addControl(new NumericControl(pn));
  // show compile time so user can ensure loading latest version
  if (Util.DEBUG) {
    this.addControl(new LabelControl('compiled '+Util.COMPILE_TIME));
  }

  /** @type {!EnergyBarGraph} */
  this.energyGraph = new EnergyBarGraph(this.sim);
  /** @type {!ParameterBoolean} */
  this.showEnergyParam = CommonControls.makeShowEnergyParam(this.energyGraph,
      this.statusView, this);
  this.addControl(new CheckBoxControl(this.showEnergyParam));

  /** @type {!DisplayClock} */
  this.displayClock = new DisplayClock( () => this.sim.getTime(),
      () => this.clock.getRealTime(), /*period=*/2, /*radius=*/2);
  this.displayClock.setPosition(new Vector(8, 4));
  /** @type {!ParameterBoolean} */
  var pb = CommonControls.makeShowClockParam(this.displayClock, this.statusView, this);
  this.addControl(new CheckBoxControl(pb));

  var panzoom = CommonControls.makePanZoomControls(this.simView,
      /*overlay=*/true,
      () => this.simView.setSimRect(this.simRect) );
  this.layout.div_sim.appendChild(panzoom);
  pb = CommonControls.makeShowPanZoomParam(panzoom, this);
  pb.setValue(false);
  this.addControl(new CheckBoxControl(pb));
  var bm = CommonControls.makeBackgroundMenu(this.layout.simCanvas);
  this.addControl(bm);

  // keep the SimRunner's timeStep to be same as the Simulation's timeStep
  new GenericObserver(this.sim, evt => {
    if (evt.nameEquals(StringSim.en.TIME_STEP)) {
      this.simRun.setTimeStep(this.sim.getTimeStep());
    }
  }, 'keep SimRunner\'s timeStep same as Simulation\'s');

  var subjects = [
    this,
    this.sim,
    this.simRun,
    this.clock,
    this.simView,
    this.statusView
  ];
  subjects = subjects.concat(this.layout.getSubjects());
  /** @type {!EasyScriptParser} */
  this.easyScript = CommonControls.makeEasyScript(subjects, [], this.simRun,
      this.terminal);
  this.addControl(CommonControls.makeURLScriptButton(this.easyScript, this.simRun));
};

/** @override */
toString() {
  return Util.ADVANCED ? '' : this.toStringShort().slice(0, -1)
      +', sim: '+this.sim.toStringShort()
      +', simRun: '+this.simRun.toStringShort()
      +', simView: '+this.simView.toStringShort()
      +', statusView: '+this.statusView.toStringShort()
      +', terminal: '+this.terminal
      +', path: '+this.path
      +', displayPath: '+this.displayPath
      +', shapes: [ '+this.shapes + ']'
      + super.toString();
};

/** @override */
getClassName() {
  return 'StringApp';
};

/** Returns name of initial string shape.
* @return {string} name of initial string shape.
*/
getShape() {
  return this.sim.getShape().getName();
}

/** Sets the initial string shape.
* @param {string} value  name of initial string shape
*/
setShape(value) {
  for (var i=0; i<this.shapes.length; i++) {
    var shape = this.shapes[i];
    if (shape.getName() == value) {
      this.sim.setShape(shape);
      this.broadcastParameter(StringSim.en.SHAPE);
      return;
    }
  }
  throw 'unknown shape '+value;
}

/** Define short-cut name replacement rules.  For example 'sim' is replaced
* by 'app.sim' when `myName` is 'app'.
* @param {string} myName  the name of this object, valid in global Javascript context.
* @export
*/
defineNames(myName) {
  if (Util.ADVANCED)
    return;
  this.terminal.addWhiteList(myName);
  this.terminal.addRegex('advance|axes|block|blockMass|clock|displayClock|energyGraph'
      +'|path|displayPath|displayList'
      +'|layout|sim|simCtrl|simList|simRun|simView|statusView|terminal|easyScript',
      myName+'.');
  this.terminal.addRegex('simCanvas',
      myName+'.layout.');
};

/** Add the control to the set of simulation controls.
* @param {!LabControl} control
* @return {!LabControl} the control that was passed in
*/
addControl(control) {
  return this.layout.addControl(control);
};

/** Set up the application.
* @return {undefined}
* @export
*/
setup() {
  this.clock.resume();
  this.terminal.parseURLorRecall();
  this.sim.saveInitialState();
  this.sim.modifyObjects();
};

/** Start the application running.
* @return {undefined}
* @export
*/
start() {
  this.simRun.startFiring();
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

} // end class

/**
* @param {!TabLayout.elementIds} elem_ids
* @return {!StringApp}
*/
function makeStringApp(elem_ids) {
  return new StringApp(elem_ids);
};
goog.exportSymbol('makeStringApp', makeStringApp);

exports = StringApp;
