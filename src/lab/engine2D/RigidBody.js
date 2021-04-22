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

goog.module('myphysicslab.lab.engine2D.RigidBody');

const LocalCoords = goog.require('myphysicslab.lab.engine2D.LocalCoords');
const MassObject = goog.require('myphysicslab.lab.model.MassObject');

/** A 2D rigid body with a specified geometry that can experience collisions and contact
forces. A RigidBody handles the geometry calculations for intersections and
collisions, as well as energy and momentum calculations.

### Non-colliding RigidBodys

There are cases where RigidBodys should not collide with each other. For example, when
there is a Joint between two RigidBodys. See {@link #addNonCollide} and
{@link #doesNotCollide}

The Polygon class has a way of specifying a subset of Edges which do not collide with
another Polygon. See {@link myphysicslab.lab.engine2D.Polygon#setNonCollideEdge}.

@todo  how is initialize() method used?  It is not private anymore!!!

@todo  getLocalCenterOfMass() should not exist; only used in DisplayShape.

@todo make sure all these methods and fields are really used and useful.

@todo testCollisionVertex and testContactVertex could perhaps be made private
methods of Polygon; do they need to be methods on RigidBody?

* @interface
*/
class RigidBody extends MassObject {

/** Adds to set of RigidBodys that do not collide with this body.
No collisions or contacts are generated between this body and the given bodies.
See {@link #doesNotCollide}.
@param {!Array<!RigidBody>} bodies array of RigidBodys that should not be collided with
*/
addNonCollide(bodies) {}

/** Returns true if this body does not collide with the given body. See
{@link #addNonCollide}.
@param {!RigidBody} body the RigidBody of interest
@return {boolean} true if this body does not collide with the given body
*/
doesNotCollide(body) {}

/** Erases any recently saved local coordinate system. See {@link #saveOldCoords},
{@link #getOldCoords}.
* @return {undefined}
*/
eraseOldCoords() {}

/** Returns the collision distance accuracy, a fraction between zero and one; when the
collision distance is within `accuracy * targetGap` of the target gap distance, then
the collision is considered close enough to handle (apply an impulse).
@return {number} the collision accuracy, a fraction between 0 (exclusive) and 1
(inclusive)
*/
getAccuracy() {}

/** Returns distance tolerance used to determine if this RigidBody is in contact with
another RigidBody.

@return {number} distance tolerance used to determine if this RigidBody is in contact
    with another RigidBody
*/
getDistanceTol() {}

/** Returns the elasticity used when calculating collisions; a value of 1.0 means
perfect elasticity where the kinetic energy after collision is the same as before
(extremely bouncy), while a value of 0 means no elasticity (no bounce). A collision
uses the lesser elasticity value of the two bodies involved.
* @return {number} elasticity used when calculating collisions, a number from 0 to 1.
*/
getElasticity() {}

/** Returns the recently saved local coordinate system. See {@link #saveOldCoords}.
* @return {?LocalCoords} the recently saved local coordinate system.
*/
getOldCoords() {}

/** Returns the index into the {@link myphysicslab.lab.model.VarsList VarsList} for
this RigidBody. The VarsList contains 6 values for each RigidBody,

1. x-position,
2. x-velocity,
3. y-position,
4. y-velocity,
5. angle,
6. angular velocity

@return {number} the index of the x-position in the VarsList for this body;
    or -1 if this body is not in the VarsList.
*/
getVarsIndex() {}

/** Returns velocity tolerance used to determine if this RigidBody is in contact with
another RigidBody.

Velocity tolerance is set on each RigidBody, but we expect it to be the same for all
RigidBodys. ImpulseSim 'owns' the velocity tolerance, it is merely passed along to
the RigidBody because it is needed during collision finding and RigidBody has no way
of finding ImpulseSim.

Note however that because Scrim is immutable, it always returns zero for velocity
tolerance. In this case, use the velocity tolerance of the other non-Scrim RigidBody
involved in the collision.

@return {number} velocity tolerance used to determine if this RigidBody is in contact
    with another RigidBody
*/
getVelocityTol() {}

/** Removes from set of RigidBodys that do not collide with this body.
@param {!Array<!RigidBody>} bodies array of RigidBodys that
    should be collided with
*/
removeNonCollide(bodies) {}

/** Makes an internal copy of the geometry of this RigidBody, which is used
for future collision checking.  This copy is a record of the last location
of this object, so that collision checking can determine how the object moved
over the last time step.  For example, a small object moving at high velocity
can pass through a narrow object in a single time step;  there is then no
interpenetration of the two objects, but if you use the previous position of
the small fast object you can see that it has passed through the narrow object.
See {@link #getOldCoords}, {@link #eraseOldCoords}.
@return {undefined}
*/
saveOldCoords() {}

/** Sets the collision distance accuracy, a fraction between zero and one; when the
collision distance is within `accuracy * targetGap` of the target gap distance, then
the collision is considered close enough to handle (apply an impulse).
* @param {number} value how close in distance to be in order to handle a collision
* @throws {!Error} if value is out of the range 0 to 1, or is exactly zero
*/
setAccuracy(value) {}

/** Sets distance tolerance to use to determine if this RigidBody is in contact with
another RigidBody.
@param {number} value distance tolerance to use to determine if this RigidBody is in
  contact with another RigidBody
*/
setDistanceTol(value) {}

/** Sets the elasticity used when calculating collisions; a value of 1.0 means perfect
elasticity where the kinetic energy after collision is the same as before (extremely
bouncy), while a value of 0 means no elasticity (no bounce). A collision uses the
lesser elasticity value of the two bodies involved.
* @param {number} value elasticity used when calculating collisions,
*    a number from 0 to 1.
*/
setElasticity(value) {}

/** Sets velocity tolerance to use to determine if this RigidBody is in contact with
another RigidBody
@param {number} value velocity tolerance to use to determine if this RigidBody is in
  contact with another RigidBody
*/
setVelocityTol(value) {}

} // end class
/** Offset in the VarsList for a RigidBody's x position
* @type {number}
* @const
*/
RigidBody.X_ = 0;
/** Offset in the VarsList for a RigidBody's x velocity
* @type {number}
* @const
*/
RigidBody.VX_ = 1;
/** Offset in the VarsList for a RigidBody's y position
* @type {number}
* @const
*/
RigidBody.Y_ = 2;
/** Offset in the VarsList for a RigidBody's y velocity
* @type {number}
* @const
*/
RigidBody.VY_ = 3;
/** Offset in the VarsList for a RigidBody's angle
* @type {number}
* @const
*/
RigidBody.W_ = 4;
/** Offset in the VarsList for a RigidBody's angular velocity
* @type {number}
* @const
*/
RigidBody.VW_ = 5;

exports = RigidBody;
