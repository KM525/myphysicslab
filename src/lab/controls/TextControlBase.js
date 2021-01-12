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

goog.module('myphysicslab.lab.controls.TextControlBase');

const dom = goog.require('goog.dom');
const Event = goog.require('goog.events.Event');
const events = goog.require('goog.events');
const EventType = goog.require('goog.events.EventType');
const Key = goog.require('goog.events.Key');

const LabControl = goog.require('myphysicslab.lab.controls.LabControl');
const Observer = goog.require('myphysicslab.lab.util.Observer');
const Util = goog.require('myphysicslab.lab.util.Util');

/** A user interface control for displaying and editing the text value of an object.
Synchronizes with the target object's string value by executing specified `getter` and
`setter` functions. Creates (or uses an existing) text input element to display and
edit the text.

Because this is an {@link Observer}, you can connect it to a Subject; when the Subject
broadcasts events, this will update the value it displays.

* @implements {LabControl}
* @implements {Observer}
*/
class TextControlBase {
/**
* @param {string} label the text shown in a label next to the text input area
* @param {function():string} getter function that returns the target value
* @param {function(string)} setter function to change the target value
* @param {!HTMLInputElement=} textField  the text field to use; if not provided, then
*     a text input field is created.
*/
constructor(label, getter, setter, textField) {
  /** the name shown in a label next to the textField
  * @type {string}
  * @private
  */
  this.label_ = label;
  /** function that returns the current target value
  * @type {function():string}
  * @private
  */
  this.getter_ = getter;
  /** function to change the target value
  * @type {function(string)}
  * @private
  */
  this.setter_ = setter;
  /** The value of the target as last seen by this control;
  * @type {string}
  * @private
  */
  this.value_ = getter();
  if (typeof this.value_ !== 'string') {
    throw 'not a string '+this.value_;
  }
  /** The number of columns (characters) shown in the text field.
  * @type {number}
  * @private
  */
  this.columns_ = 40;
  /** @type {HTMLLabelElement} */
  var labelElement = null;
  if (goog.isObject(textField)) {
    // see if the parent is a label
    var parent = dom.getParentElement(textField);
    if (parent != null && parent.tagName == 'LABEL') {
      labelElement = /** @type {!HTMLLabelElement} */(parent);
    }
  } else {
    // create input text field and label
    textField = /** @type {!HTMLInputElement} */(document.createElement('input'));
    textField.type = 'text';
    textField.size = this.columns_;
    labelElement = /** @type {!HTMLLabelElement} */(document.createElement('LABEL'));
    labelElement.appendChild(document.createTextNode(this.label_));
    labelElement.appendChild(textField);
  }
  /** the text field showing the double value
  * @type {!HTMLInputElement}
  * @private
  */
  this.textField_ = textField;
  /**
  * @type {!Element}
  * @private
  */
  this.topElement_ = labelElement !== null ? labelElement : this.textField_;
  /** The last value that the text field was set to, used to detect when user has
  intentionally changed the value.
  * @type {string}
  * @private
  */
  this.lastValue_ = '';
  this.textField_.textAlign = 'left';
  /**  key used for removing the listener
  * @type {Key}
  * @private
  */
  this.changeKey_ = events.listen(this.textField_, EventType.CHANGE,
      /*callback=*/this.validate, /*capture=*/true, this);
  /**  key used for removing the listener
  * @type {Key}
  * @private
  */
  this.focusKey_ = events.listen(this.textField_, EventType.FOCUS,
      /*callback=*/this.gainFocus, /*capture=*/false, this);
  /**  key used for removing the listener
  * @type {Key}
  * @private
  */
  this.clickKey_ = events.listen(this.textField_, EventType.CLICK,
      /*callback=*/this.doClick, /*capture=*/false, this);
  /**  True when first click in field after gaining focus.
  * @type {boolean}
  * @private
  */
  this.firstClick_ = false;
  this.formatTextField();
};

/** @override */
toString() {
  return Util.ADVANCED ? '' : this.toStringShort().slice(0, -1)
      +', columns_: '+this.columns_
      +'}';
};

/** @override */
toStringShort() {
  return Util.ADVANCED ? '' : this.getClassName() + '{label_: "'+this.label_+'"}';
};

/** @override */
disconnect() {
  events.unlistenByKey(this.changeKey_);
  events.unlistenByKey(this.clickKey_);
  events.unlistenByKey(this.focusKey_);
};

/**
* @param {!Event} event the event that caused this callback to fire
* @private
*/
doClick(event) {
  if (this.firstClick_) {
    // first click after gaining focus should select entire field
    this.textField_.select();
    this.firstClick_ = false;
  }
};

/**  Sets the text field to match this.value_.
* @return {undefined}
* @private
*/
formatTextField() {
  this.lastValue_ = this.value_;
  this.textField_.value = this.value_;
  this.textField_.size =this.columns_;
};

/**
* @param {!Event} event the event that caused this callback to fire
* @private
*/
gainFocus(event) {
  this.firstClick_ = true;
};

/** Returns name of class of this object.
* @return {string} name of class of this object.
*/
getClassName() {
  return 'TextControlBase';
};

/** Returns width of the text input field (number of characters).
@return {number} the width of the text input field.
*/
getColumns() {
  return this.columns_;
};

/** @override */
getElement() {
  return this.topElement_;
};

/** @override */
getParameter() {
  return null;
};

/** Returns the value of this control (which should match the target value if
{@link #observe} is being called).
@return {string} the value of this control
*/
getValue() {
  return this.value_;
};

/** @override */
observe(event) {
  // Ensures that the value displayed by the control matches the target value.
  this.setValue(this.getter_());
};

/** Sets the width of the text input field (number of characters).
@param {number} value the width of the text input field
@return {!TextControlBase} this object for chaining setters
*/
setColumns(value) {
  if (this.columns_ != value) {
    this.columns_ = value;
    this.formatTextField();
  }
  return this;
};

/** @override */
setEnabled(enabled) {
  this.textField_.disabled = !enabled;
};

/** Changes the value shown by this control, and sets the target to this value.
@throws {!Error} if value is not a string
@param {string} value  the new value
*/
setValue(value) {
  if (value != this.value_) {
    if (Util.DEBUG && 0 == 1) {
      console.log('TextControlBase.setValue value='+value+' vs '+this.value_);
    }
    try {
      if (typeof value !== 'string') {
        throw 'not a string '+value;
      }
      // set this.value_ first to prevent the observe() coming here twice
      this.value_ = value;
      // parameter_.setValue() broadcasts which causes observe() to be called here
      this.setter_(value);
    } catch(ex) {
      alert(ex);
      this.value_ = this.getter_();
    }
    this.formatTextField();
  }
};

/** Checks that an entered number is a valid number, updates the target value
* if valid; if an exception occurs then shows an alert and restores the old value.
* @param {!Event} event the event that caused this callback to fire
* @private
*/
validate(event) {
  // trim whitespace from start and end of string
  var nowValue = this.textField_.value.replace(/^\s*|\s*$/g, '');
  // Compare the current and previous text value of the field.
  // Note that the double value may be different from the text value because
  // of rounding.
  if (nowValue != this.lastValue_) {
    var value = nowValue;
    if (typeof value !== 'string') {
      alert('not a string: '+nowValue);
      this.formatTextField();
    } else {
      this.setValue(value);
    }
  }
};

} // end class
exports = TextControlBase;
