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

goog.module('myphysicslab.sims.common.VerticalLayout');

goog.require('goog.events');

const LabCanvas = goog.require('myphysicslab.lab.view.LabCanvas');
const LabControl = goog.require('myphysicslab.lab.controls.LabControl');
const Terminal = goog.require('myphysicslab.lab.util.Terminal');
const Util = goog.require('myphysicslab.lab.util.Util');

/** VerticalLayout creates a SimView and a command line Terminal a command line Terminal
for interactive scripting; also an area to show a graph, and an area to put controls.
Defines regular expressions for easy Terminal scripting of these objects using short
names such as terminal, simCanvas, graphCanvas.

Defines functions showGraph, showControls, showTerminal, which are used for the
checkboxes with those names; these functions appear in Terminal when they are executed.
These functions can also be called from the Terminal, and therefore saved in Terminal
command storage, preserving what the state of what is visible.

VerticalLayout constructor takes an argument that specifies the names of the HTML
elements to look for in the HTML document; these elements are where the user
interface of the simulation is created. This allows for having two separate
simulations running concurrently on a single page.

When using advanced-optimizations compile mode the Terminal will not work, because
all method and class names are minified, and unused code is eliminated -- so even if
you could get at a minified class, much of it would not be there to use.

Oct 2014: increased size of simCanvas and graphCanvas so that they look better when
stretched to large sizes on large screens.
*/
class VerticalLayout {
/**
* @param {!VerticalLayout.elementIds} elem_ids specifies the names of the HTML
*    elements to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
*/
constructor(elem_ids) {
  Util.setImagesDir(elem_ids['images_dir']);
  /** whether to put dashed borders around elements
  * @type {boolean}
  * @const
  */
  this.debug_layout = false;
  /** @type {!Array<!LabControl>} */
  this.controls_ = [];
  var term_output = /**@type {?HTMLInputElement}*/
      (VerticalLayout.maybeElementById(elem_ids, 'term_output'));
  var term_input = /**@type {?HTMLInputElement}*/
      (VerticalLayout.maybeElementById(elem_ids, 'term_input'));
  /** @type {!Terminal} */
  this.terminal = new Terminal(term_input, term_output);
  Terminal.stdRegex(this.terminal);

  /** @type {!Element} */
  this.div_sim = VerticalLayout.getElementById(elem_ids, 'sim_applet');
  // to allow absolute positioning of icon controls over the canvas:
  this.div_sim.style.position = 'relative';
  var canvas = /** @type {!HTMLCanvasElement} */(document.createElement('canvas'));
  /* tabIndex = 0 makes the canvas selectable via tab key or mouse, so it can
  * get text events. A value of 0 indicates that the element should be placed in the
  * default navigation order. This allows elements that are not natively focusable
  * (such as <div>, <span>, and ) to receive keyboard focus.
  */
  canvas.tabIndex = 0;
  canvas.width = 800;
  canvas.height = 480;
  /** @type {!LabCanvas} */
  this.simCanvas = new LabCanvas(canvas, 'simCanvas');
  this.div_sim.appendChild(this.simCanvas.getCanvas());

  /* GraphCanvas */
  /** @type {!Element} */
  this.div_graph = VerticalLayout.getElementById(elem_ids, 'div_graph');
  var canvas2 = /** @type {!HTMLCanvasElement} */(document.createElement('canvas'));
  canvas2.style.float = 'left';
  canvas2.style.margin = '0px 15px 15px 0px';
  /** @type {!LabCanvas} */
  this.graphCanvas = new LabCanvas(canvas2, 'graphCanvas');
  this.graphCanvas.setSize(480, 480);
  // graphCanvas is initially hidden
  this.div_graph.style.display = 'none';
  if (this.debug_layout) {
    this.div_graph.style.border = 'dashed 1px blue';
  }
  /* <div> for graph controls */
  /** @type {!Element} */
  this.graph_controls = /**@type {!Element}*/
      (VerticalLayout.getElementById(elem_ids, 'graph_controls'));
  this.div_graph.insertBefore(this.graphCanvas.getCanvas(), this.graph_controls);

  /* 'show graph' checkbox. */
  var show_graph_cb = /**@type {!HTMLInputElement}*/
      (VerticalLayout.getElementById(elem_ids, 'show_graph'));
  /** @type {function(boolean)} */
  this.showGraph = visible => {
    this.div_graph.style.display = visible ? 'block' : 'none';
    show_graph_cb.checked = visible;
  };
  goog.events.listen(show_graph_cb, goog.events.EventType.CLICK,
      e => this.showGraph(show_graph_cb.checked) );

  /* <form> for sim controls */
  /** @type {!Element} */
  this.sim_controls = /** @type {!Element} */
      (VerticalLayout.getElementById(elem_ids, 'sim_controls'));
  if (this.debug_layout) {
    this.sim_controls.style.border = 'dashed 1px red';
  }

  /* 'show controls' checkbox. */
  var show_controls_cb = /**@type {!HTMLInputElement}*/
      (VerticalLayout.getElementById(elem_ids, 'show_controls'));
  this.sim_controls.style.display = 'none';
  /** @type {function(boolean)} */
  this.showControls = /** @type {function(boolean)}*/(visible => {
    this.sim_controls.style.display = visible ? 'block' : 'none';
    show_controls_cb.checked = visible;
  });
  goog.events.listen(show_controls_cb, goog.events.EventType.CLICK,
      e => this.showControls(show_controls_cb.checked) );

  /* <form> element for Terminal */
  var form_term = /**@type {!HTMLFormElement}*/
      (VerticalLayout.getElementById(elem_ids, 'form_terminal'));
  form_term.style.display = 'none';
  if (this.debug_layout) {
    form_term.style.border = 'dashed 1px green';
  }
  var label_term = /**@type {!HTMLInputElement}*/
      (VerticalLayout.getElementById(elem_ids, 'label_terminal'));
  /** @type {function(boolean)} */
  this.showTerminal;
  if (Util.ADVANCED) {
    // Under advanced-optimized compile mode, Terminal cannot be used.
    // Therefore, hide the terminal checkbox.
    label_term.style.display = 'none';
  } else {
    /* 'show terminal' checkbox. */
    var show_term_cb = /**@type {!HTMLInputElement}*/
        (VerticalLayout.getElementById(elem_ids, 'show_terminal'));
    this.showTerminal = /** @type {function(boolean)}*/(visible => {
      form_term.style.display = visible ? 'block' : 'none';
      show_term_cb.checked = visible;
      if (visible && term_input && !this.terminal.recalling) {
        // move the focus to Terminal, for ease of typing
        term_input.focus();
      }
    });
    goog.events.listen(show_term_cb, goog.events.EventType.CLICK,
      e => this.showTerminal(show_term_cb.checked) );
  }

  var show_hide_form = /**@type {!HTMLFormElement}*/
      (VerticalLayout.getElementById(elem_ids, 'show_hide_form'));
  if (this.debug_layout) {
    show_hide_form.style.border = 'dashed 1px green';
  }

};

/** @override */
toString() {
  return Util.ADVANCED ? '' : 'VerticalLayout{'
    +'simCanvas: '+this.simCanvas.toStringShort()
    +', graphCanvas: '+this.graphCanvas.toStringShort()
    +', terminal: '+this.terminal
    +', controls: '+this.controls_.length
    +'}';
};

/** Finds the specified element in the HTML Document; throws an error if element
* is not found.
* @param {!VerticalLayout.elementIds} elem_ids  set of elementId names to examine
* @param {string} elementId specifies which element to get from elem_ids
* @return {!Element} the element from the current HTML Document
* @throws {!Error} if element is not found
*/
static getElementById(elem_ids, elementId) {
  // note:  Google Closure Compiler will rename properties in advanced mode.
  // Therefore, we need to get the property with a string which is not renamed.
  // It is the difference between elem_ids.sim_applet vs. elem_ids['sim_applet'].
  var e_id = elem_ids[elementId];
  if (typeof e_id !== 'string') {
    throw 'unknown elementId: '+elementId;
  }
  var e = document.getElementById(e_id);
  if (!goog.isObject(e)) {
    throw 'not found: element with id='+e_id;
  }
  return e;
};

/** Finds the specified element in the HTML Document; returns null if element
* is not found.
* @param {!VerticalLayout.elementIds} elem_ids  set of elementId names to examine
* @param {string} elementId specifies which element to get from elem_ids
* @return {?HTMLElement} the element from the current HTML Document, or null if not found
*/
static maybeElementById(elem_ids, elementId) {
  // note:  Google Closure Compiler will rename properties in advanced mode.
  // Therefore, we need to get the property with a string which is not renamed.
  // It is the difference between elem_ids.sim_applet vs. elem_ids['sim_applet'].
  var e_id = elem_ids[elementId];
  if (typeof e_id !== 'string') {
    throw 'unknown elementId: '+elementId;
  }
  return /** @type {?HTMLElement} */(document.getElementById(e_id));
};

/** Add the control to the set of simulation controls.
* @param {!LabControl} control
* @return {!LabControl} the control that was passed in
*/
addControl(control) {
  var element = control.getElement();
  element.style.display = 'inline-block';
  this.sim_controls.appendChild(element);
  this.controls_.push(control);
  return control;
};

} // end class

/**  Names of HTML div, form, and input element's to search for by using
* {document.getElementById()}.
* @typedef {{
*  term_output: string,
*  term_input: string,
*  sim_applet: string,
*  div_graph: string,
*  graph_controls: string,
*  show_graph: string,
*  sim_controls: string,
*  show_controls: string,
*  form_terminal: string,
*  label_terminal: string,
*  show_terminal: string,
*  show_hide_form: string,
*  images_dir: string
* }}
*/
VerticalLayout.elementIds;

exports = VerticalLayout;
