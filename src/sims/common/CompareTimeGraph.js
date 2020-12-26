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

goog.module('myphysicslab.sims.common.CompareTimeGraph');

const AbstractSubject = goog.require('myphysicslab.lab.util.AbstractSubject');
const AutoScale = goog.require('myphysicslab.lab.graph.AutoScale');
const ButtonControl = goog.require('myphysicslab.lab.controls.ButtonControl');
const CheckBoxControl = goog.require('myphysicslab.lab.controls.CheckBoxControl');
const ChoiceControl = goog.require('myphysicslab.lab.controls.ChoiceControl');
const CommonControls = goog.require('myphysicslab.sims.common.CommonControls');
const DisplayAxes = goog.require('myphysicslab.lab.graph.DisplayAxes');
const DisplayGraph = goog.require('myphysicslab.lab.graph.DisplayGraph');
const DoubleRect = goog.require('myphysicslab.lab.util.DoubleRect');
const DrawingMode = goog.require('myphysicslab.lab.view.DrawingMode');
const GenericObserver = goog.require('myphysicslab.lab.util.GenericObserver');
const GraphLine = goog.require('myphysicslab.lab.graph.GraphLine');
const HorizAlign = goog.require('myphysicslab.lab.view.HorizAlign');
const LabCanvas = goog.require('myphysicslab.lab.view.LabCanvas');
const LabControl = goog.require('myphysicslab.lab.controls.LabControl');
const LabView = goog.require('myphysicslab.lab.view.LabView');
const NumericControl = goog.require('myphysicslab.lab.controls.NumericControl');
const ParameterBoolean = goog.require('myphysicslab.lab.util.ParameterBoolean');
const ParameterNumber = goog.require('myphysicslab.lab.util.ParameterNumber');
const ParameterString = goog.require('myphysicslab.lab.util.ParameterString');
const SimController = goog.require('myphysicslab.lab.app.SimController');
const SimRunner = goog.require('myphysicslab.lab.app.SimRunner');
const SimView = goog.require('myphysicslab.lab.view.SimView');
const Subject = goog.require('myphysicslab.lab.util.Subject');
const SubjectList = goog.require('myphysicslab.lab.util.SubjectList');
const Util = goog.require('myphysicslab.lab.util.Util');
const VerticalAlign = goog.require('myphysicslab.lab.view.VerticalAlign');

/** Creates a time graph showing two GraphLines corresponding to two Simulations, where
the two GraphLines are showing the same Y variable, and the X variable is time.
Because there is a single SimView and DisplayGraph, both GraphLines are plotted in the
same graph coordinates. Creates an AutoScale that ensures both GraphLines are visible.
Creates controls to modify the graph. The menu choices are only connected to the first
GraphLine. The second GraphLine should be externally synchronized to show the same
variables as the first GraphLine.

* @implements {SubjectList}
*/
class CompareTimeGraph extends AbstractSubject {
/**
* @param {!GraphLine} line1 the first VarsList to collect data from
* @param {!GraphLine} line2 the second VarsList to collect data from
* @param {!LabCanvas} graphCanvas the LabCanvas where the graph should appear
* @param {!Element} div_controls the HTML div where controls should be added
* @param {!Element} div_graph the HTML div where the graphCanvas is located
* @param {!SimRunner} simRun the SimRunner controlling the overall app
*/
constructor(line1, line2, graphCanvas, div_controls, div_graph, simRun) {
  super('TIME_GRAPH_LAYOUT');

  /** @type {!GraphLine} */
  this.line1 = line1;
  /** @type {!GraphLine} */
  this.line2 = line2;
  /** @type {!LabCanvas} */
  this.canvas = graphCanvas;
  simRun.addCanvas(graphCanvas);

  /** @type {!SimView} */
  this.view = new SimView('TIME_GRAPH_SIM_VIEW', new DoubleRect(0, 0, 1, 1));
  this.view.setHorizAlign(HorizAlign.FULL);
  this.view.setVerticalAlign(VerticalAlign.FULL);
  this.view.addMemo(line1);
  this.view.addMemo(line2);
  graphCanvas.addView(this.view);

  /** @type {!DisplayAxes} */
  this.axes = CommonControls.makeAxes(this.view);
  new GenericObserver(line1, evt => {
    if (evt.nameEquals(GraphLine.en.X_VARIABLE)) {
      this.axes.setHorizName(this.line1.getXVarName());
    }
    if (evt.nameEquals(GraphLine.en.Y_VARIABLE)) {
      this.axes.setVerticalName(this.line1.getYVarName());
    }
  }, 'update axes names');

  /** @type {!AutoScale} */
  this.autoScale = new AutoScale('TIME_GRAPH_AUTO_SCALE', line1, this.view);
  this.autoScale.addGraphLine(line2);
  this.autoScale.extraMargin = 0.05;

  /** @type {!DisplayGraph} */
  this.displayGraph = new DisplayGraph(line1);
  this.displayGraph.addGraphLine(line2);
  this.displayGraph.setScreenRect(this.view.getScreenRect());
  // Don't use off-screen buffer with time variable because the auto-scale causes
  // graph to redraw every frame.
  this.displayGraph.setUseBuffer(false);
  this.view.getDisplayList().prepend(this.displayGraph);
  // inform displayGraph when the screen rect changes.
  new GenericObserver(this.view, evt => {
      if (evt.nameEquals(LabView.SCREEN_RECT_CHANGED)) {
        this.displayGraph.setScreenRect(this.view.getScreenRect());
      }
    }, 'resize DisplayGraph');

  var timeIdx = line1.getVarsList().timeIndex();
  line1.setXVariable(timeIdx);
  var timeIdx2 = line2.getVarsList().timeIndex();
  line2.setXVariable(timeIdx2);

  /** @type {!Array<!LabControl>} */
  this.controls_ = [];
  /** @type {!Element} */
  this.div_controls = div_controls;

  this.addControl(CommonControls.makePlaybackControls(simRun));

  /** @type {!ParameterNumber} */
  var pn = this.line1.getParameterNumber(GraphLine.en.Y_VARIABLE);
  this.addControl(new ChoiceControl(pn, 'Y:'));
  pn = this.autoScale.getParameterNumber(AutoScale.en.TIME_WINDOW)
  this.addControl(new NumericControl(pn));

  var bc = new ButtonControl(GraphLine.i18n.CLEAR_GRAPH,
      () => {
        line1.reset();
        line2.reset();
        this.autoScale.reset();
      });
  this.addControl(bc);

  /** @type {!ParameterString} */
  var ps = line1.getParameterString(GraphLine.en.DRAWING_MODE);
  this.addControl(new ChoiceControl(ps));

  // use same drawing mode on line2
  new GenericObserver(line1, evt => line2.setDrawingMode(line1.getDrawingMode()), 'match drawing mode on GraphLine');

  /** SimController which pans the graph with no modifier keys pressed.
  * @type {!SimController}
  */
  this.graphCtrl = new SimController(graphCanvas, /*eventHandler=*/null,
      /*panModifier=*/{alt:false, control:false, meta:false, shift:false});

  // Turn off scale-together so that zoom controls only work on vertical axis.
  // Use TIME_WINDOW control for changing horizontal axis, separately.
  this.view.setScaleTogether(false);
  var panzoom = CommonControls.makePanZoomControls(this.view, /*overlay=*/true,
      /*resetFunc=*/ () => this.autoScale.setActive(true) );
  div_graph.appendChild(panzoom);
  /** @type {!ParameterBoolean} */
  var pb = CommonControls.makeShowPanZoomParam(panzoom, this);
  this.addControl(new CheckBoxControl(pb));
};

/** @override */
toString() {
  return Util.ADVANCED ? '' : this.toStringShort().slice(0, -1)
      +', canvas: '+this.canvas.toStringShort()
      +', view: '+this.view.toStringShort()
      +', line1: '+this.line1.toStringShort()
      +', line2: '+this.line2.toStringShort()
      +', axes: '+this.axes.toStringShort()
      +', autoScale: '+this.autoScale.toStringShort()
      +', displayGraph: '+this.displayGraph.toStringShort()
      +', graphCtrl: '+this.graphCtrl.toStringShort()
      + super.toString();
};

/** @override */
getClassName() {
  return 'CompareTimeGraph';
};

/** @override */
getSubjects() {
  return [ this, this.line1, this.line2, this.view, this.autoScale ];
};

/** Add the control to the set of simulation controls.
* @param {!LabControl} control
* @return {!LabControl} the control that was passed in
*/
addControl(control) {
  var element = control.getElement();
  element.style.display = 'block';
  this.div_controls.appendChild(element);
  this.controls_.push(control);
  return control;
};

} // end class

exports = CompareTimeGraph;
