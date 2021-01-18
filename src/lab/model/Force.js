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

goog.module('myphysicslab.lab.model.Force');

const AbstractSimObject = goog.require('myphysicslab.lab.model.AbstractSimObject');
const CoordType = goog.require('myphysicslab.lab.model.CoordType');
const Line = goog.require('myphysicslab.lab.model.Line');
const DoubleRect = goog.require('myphysicslab.lab.util.DoubleRect');
const MassObject = goog.require('myphysicslab.lab.model.MassObject');
const Vector = goog.require('myphysicslab.lab.util.Vector');
const Util = goog.require('myphysicslab.lab.util.Util');

/** A Force acts on a given {@link MassObject} at a defined location and with a defined
direction and magnitude.

The method {@link #getStartPoint} gives the location in world coordinates where the
Force is applied. The method {@link #getVector} gives the direction and magnitude of
the Force in world coordinates.

The location and direction can be passed to the constructor either in fixed world
coordinates, or in relative body coordinates. When given in body coordinates, the
location and/or direction are calculated relative to the body's current position. See
{@link CoordType}.

In {@link myphysicslab.lab.engine2D.RigidBodySim} the torque affects the angular
acceleration like this:

    angular_acceleration += torque / RigidBody.momentAboutCM()

@todo move contactDistance and distanceTol to a sub-class called ContactForce?

* @implements {Line}
*/
class Force extends AbstractSimObject {
/**
@param {string} name  string indicating the type of force, e.g. 'gravity'
@param {!MassObject} body the MassObject that the Force is
    applied to
@param {!Vector} location the location on the body where the force
    is applied, in either body or world coordinates
@param {!CoordType} locationCoordType whether the location is in
    body or world coords, from {@link CoordType}.
@param {!Vector} direction a Vector giving the direction and
    magnitude of the Force, in either body or world coordinates
@param {!CoordType} directionCoordType whether the direction is
    in body or world coords, from {@link CoordType}.
@param {number=} opt_torque torque to change angular acceleration of body
*/
constructor(name, body, location, locationCoordType, direction, directionCoordType, opt_torque) {
  super(name);
  /** which body the force is applied to
  * @type {!MassObject}
  * @private
  */
  this.body_ = body;
  /**  where the force is applied, in body or world coords
  * @type {!Vector}
  * @private
  */
  this.location_ = location;
  /** direction & magnitude of force, in body or world coords
  * @type {!Vector}
  * @private
  */
  this.direction_ = direction;
  /** whether location is in body or world coords
  * @type {!CoordType}
  * @private
  */
  this.locationCoordType_ = locationCoordType;
  /** whether direction is in body or world coords
  * @type {!CoordType}
  * @private
  */
  this.directionCoordType_ = directionCoordType;
  /** gap between objects for contact force (optional info)
  * @type {number}
  */
  this.contactDistance = 0;
  /** distance tolerance for contact force (optional info)
  * @type {number}
  */
  this.contactTolerance = 0;
  /** torque to change angular acceleration of body
  * @type {number}
  * @private
  */
  this.torque_ = opt_torque===undefined ? 0 : opt_torque;
};

/** @override */
toString() {
  return Util.ADVANCED ? '' : super.toString().slice(0, -1)
      +', body: "'+this.body_.getName()+'"'
      +', location: '+this.location_
      +', direction: '+this.direction_
      +', locationCoordType: '+this.locationCoordType_
      +', directionCoordType: '+this.directionCoordType_
      +', torque: '+Util.NF5E(this.torque_)
      +'}';
};

/** @override */
getClassName() {
  return 'Force';
};

/** The body to which this Force is applied.
* @return {!MassObject} The MassObject to which this
    force is applied
*/
getBody() {
  return this.body_;
};

/** @override */
getBoundsWorld() {
  return DoubleRect.make(this.getStartPoint(), this.getEndPoint());
};

/** @override */
getEndPoint() {
  return this.getStartPoint().add(this.getVector());
};

/** @override */
getStartPoint() {
  return this.locationCoordType_==CoordType.BODY ?
          this.body_.bodyToWorld(this.location_) : this.location_;
};

/** Returns the torque which affects the angular acceleration.
@return {number} the torque which affects the angular acceleration.
*/
getTorque() {
  return this.torque_;
};

/** @override */
getVector() {
  return this.directionCoordType_==CoordType.BODY ?
          this.body_.rotateBodyToWorld(this.direction_) : this.direction_;
};

/** @override */
similar(obj, opt_tolerance) {
  if (!(obj instanceof Force)) {
    return false;
  }
  // require same name: fixes thrust force not appearing when gravity is at same place
  if (obj.getName() != this.getName()) {
    return false;
  }
  const f = /** @type {!Force} */(obj);
  if (!this.getStartPoint().nearEqual(f.getStartPoint(), opt_tolerance)) {
    return false;
  }
  return this.getVector().nearEqual(f.getVector(), opt_tolerance);
};

} // end class
exports = Force;
