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

goog.module('myphysicslab.lab.view.test.DisplayShapeTest');

const AffineTransform = goog.require('myphysicslab.lab.util.AffineTransform');
const CoordMap = goog.require('myphysicslab.lab.view.CoordMap');
const DisplayShape = goog.require('myphysicslab.lab.view.DisplayShape');
const DoubleRect = goog.require('myphysicslab.lab.util.DoubleRect');
const HorizAlign = goog.require('myphysicslab.lab.view.HorizAlign');
const PointMass = goog.require('myphysicslab.lab.model.PointMass');
const ScreenRect = goog.require('myphysicslab.lab.view.ScreenRect');
const SimObject = goog.require('myphysicslab.lab.model.SimObject');
const TestRig = goog.require('myphysicslab.test.TestRig');
const Vector = goog.require('myphysicslab.lab.util.Vector');
const VerticalAlign = goog.require('myphysicslab.lab.view.VerticalAlign');

const assertEquals = (e, v) => TestRig.assertEquals(e, v);
const assertRoughlyEquals = (e, v, t) => TestRig.assertRoughlyEquals(e, v, t);
const assertTrue = v => TestRig.assertTrue(v);
const assertFalse = v => TestRig.assertFalse(v);
const assertThrows = f => TestRig.assertThrows(f);
const schedule = testFunc => TestRig.schedule(testFunc);
const startTest = n => TestRig.startTest(n);

/**  mock CanvasRenderingContext2D
*/
class MockContext {
  /**
  * @param {number} tol
  */
  constructor(tol) {
    /**
    * @type {number}
    */
    this.tol = tol;
    /**  expected rectangle point 1
    * @type {?Vector}
    */
    this.expectRect1 = null;
    /**  expected rectangle point 2
    * @type {?Vector}
    */
    this.expectRect2 = null;
    /**  expected screen coords point
    * @type {?Vector}
    */
    this.startPoint = null;
    /**  last point drawn to
    * @type {?Vector}
    */
    this.lastPoint = null;
    /**
    * @type {!AffineTransform}
    */
    this.at = AffineTransform.IDENTITY;
    /**
    * @type {string}
    */
    this.fillStyle = '';
    /**
    * @type {string}
    */
    this.strokeStyle = '';
    /**
    * @type {number}
    */
    this.lineWidth = 0;
  };
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @return {undefined}
   */
  rect(x, y, w, h) {
    // check that the rectangle being drawn matches expected rectangle
    var pt1 = this.at.transform(x, y);
    var pt2 = this.at.transform(x+w, y+h);
    if (this.expectRect1 != null) {
      assertRoughlyEquals(this.expectRect1.getX(), pt1.getX(), this.tol);
      assertRoughlyEquals(this.expectRect1.getY(), pt1.getY(), this.tol);
    }
    if (this.expectRect2 != null) {
      assertRoughlyEquals(this.expectRect2.getX(), pt2.getX(), this.tol);
      assertRoughlyEquals(this.expectRect2.getY(), pt2.getY(), this.tol);
    }
  };
  /**
   * @param {number} x
   * @param {number} y
   * @return {undefined}
   */
  moveTo(x, y) {
    var pt1 = this.at.transform(x, y);
    if (this.startPoint != null) {
      // check that the rectangle being drawn matches expected rectangle
      assertRoughlyEquals(this.startPoint.getX(), pt1.getX(), this.tol);
      assertRoughlyEquals(this.startPoint.getY(), pt1.getY(), this.tol);
    }
  };
  /**
   * @param {number} x
   * @param {number} y
   * @return {undefined}
   */
  lineTo(x, y) {
    this.lastPoint = this.at.transform(x, y);
  };
  save() {};
  restore() {
    this.at = AffineTransform.IDENTITY;
  };
  stroke() {};
  beginPath() {};
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @return {undefined}
   */
  clearRect(x, y, w, h) {};
  /**
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {number} d
   * @param {number} e
   * @param {number} f
   * @return {undefined}
   */
  setTransform(a, b, c, d, e, f) {
    this.at = new AffineTransform(a, b, c, d, e, f);
  };
  fill() {};
} // end class

class DisplayShapeTest {

static test() {
  schedule(DisplayShapeTest.testDisplayShape);
};

/** @suppress {invalidCasts} */
static testDisplayShape() {
  startTest(DisplayShapeTest.groupName+'testDisplayShape');
  var tol = 1E-14;
  var mockContext = new MockContext(tol);
  // WIDE screen rect
  var screenRect = new ScreenRect(/*top=*/0, /*left=*/0, /*width=*/500,
      /*height=*/300);
  var simRect = new DoubleRect(/*left=*/-10, /*bottom=*/-10, /*right=*/10, /*top=*/10);

  // WIDE =========  HorizAlign.LEFT, VerticalAlign.FULL ============
  var map = CoordMap.make(screenRect, simRect, HorizAlign.LEFT,
      VerticalAlign.FULL);
  var point1 = PointMass.makeRectangle(2, 1.6);
  point1.setPosition(new Vector(2, -2));
  var shape1 = new DisplayShape(point1);
  shape1.setFillStyle('orange');
  // check starting conditions
  assertEquals(point1, shape1.getSimObjects()[0]);
  assertTrue(shape1.contains(new Vector(2, -2)));
  assertFalse(shape1.contains(Vector.ORIGIN));
  assertTrue(shape1.getPosition().nearEqual(new Vector(2, -2), tol));
  assertEquals('orange', shape1.getFillStyle());
  assertTrue(shape1.isDragable());

  // set expected rectangle to be drawn
  mockContext.expectRect1 = map.simToScreen(new Vector(1, -2.8));
  mockContext.expectRect2 = map.simToScreen(new Vector(3, -1.2));
  shape1.draw(/** @type {!CanvasRenderingContext2D} */(mockContext), map);
  assertEquals('orange', mockContext.fillStyle);

  // change some things, move to different position and color
  shape1.setDragable(false);
  assertFalse(shape1.isDragable());
  shape1.setFillStyle('blue');
  assertEquals('blue', shape1.getFillStyle());
  point1.setPosition(new Vector(1, 1));
  assertTrue(shape1.getPosition().nearEqual(new Vector(1, 1), tol));

  // set new expected rectangle to be drawn
  mockContext.expectRect1 = map.simToScreen(new Vector(0, 0.2));
  mockContext.expectRect2 = map.simToScreen(new Vector(2, 1.8));
  shape1.draw(/** @type {!CanvasRenderingContext2D} */(mockContext), map);
  assertEquals('blue', mockContext.fillStyle);
};

} // end class

/**
* @type {string}
* @const
*/
DisplayShapeTest.groupName = 'DisplayShapeTest.';

exports = DisplayShapeTest;
