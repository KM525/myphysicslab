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

goog.module('myphysicslab.lab.engine2D.ConcreteVertex');

const Edge = goog.require('myphysicslab.lab.engine2D.Edge');
const UtilEngine = goog.require('myphysicslab.lab.engine2D.UtilEngine');
const Util = goog.require('myphysicslab.lab.util.Util');
const Vector = goog.require('myphysicslab.lab.util.Vector');
const Vertex = goog.require('myphysicslab.lab.engine2D.Vertex');

/** Concrete implementation of Vertex interface.
*
* @implements {Vertex}
*/
class ConcreteVertex {
/**
* @param {!Vector} v_body location of this Vertex in body coords
*    of the Polygon it belongs to
* @param {boolean=} opt_endPoint whether this is the endpoint of an edge, default is
*    `true`
* @param {?Edge=} opt_edge previous edge (optional)
*/
constructor(v_body, opt_endPoint, opt_edge) {
  /** location in body coordinates of the RigidBody that this Vertex belongs to
  * @type {!Vector}
  * @private
  */
  this.loc_body_ = v_body;
  /** true if its the endpoint of an edge
  * @type {boolean}
  * @private
  */
  this.endPoint_ = goog.isDef(opt_endPoint) ? opt_endPoint : true;
  /** the previous edge in list of edges
  * @type {?Edge}
  * @private
  */
  this.edge_ = goog.isDef(opt_edge) ? opt_edge : null;
  /** the next edge in list of edges -- null for mid-point Vertexes
  * @type {?Edge}
  * @private
  */
  this.edge2_ = null;
  /** for debugging:  give each Vertex a unique id number
  * @type {number}
  * @const
  * @private
  */
  this.id_ = ConcreteVertex.next_vertex_id++;
};

toString() {
  return Util.ADVANCED ? '' : this.toStringShort().slice(0, -1)
      +', id_: '+this.id_
      +', endPoint_: '+this.endPoint_
      +', body.name: '+ (this.edge_ == null ? 'null' :
          '"' + this.edge_.getBody().getName() + '"')
      +', edge_.index: '+(this.edge_ == null ? '-1' : this.edge_.getIndex())
      +', edge2_.index: '+(this.edge2_ == null ? '-1' : this.edge2_.getIndex())
      +'}';
};

toStringShort() {
  return Util.ADVANCED ? '' : 'ConcreteVertex{loc_body_: '+this.loc_body_+'}';
};

/** @override */
getID() {
  return this.id_;
};

/** @override */
isEndPoint() {
  return this.endPoint_;
};

/** @override */
locBody() {
  return this.loc_body_;
};

/** @override */
locBodyX() {
  return this.loc_body_.getX();
};

/** @override */
locBodyY() {
  return this.loc_body_.getY();
};

/** @override */
highlight() {
  if (this.edge_ != null && UtilEngine.debugEngine2D != null) {
    var w1 = this.edge_.getBody().bodyToWorld(this.loc_body_);
    UtilEngine.debugEngine2D.debugCircle('dot', w1, 0.06);
  }
};

/** @override */
getCurvature() {
  var r = Util.POSITIVE_INFINITY;
  if (this.edge_ != null) {
    r = this.edge_.getCurvature(this.loc_body_);
    if (this.edge2_ != null) {
      var r2 = this.edge2_.getCurvature(this.loc_body_);
      if (Math.abs(r2) < Math.abs(r)) {
        r = r2;
      }
    }
  }
  return r;
};

/** @override */
getEdge1() {
  if (this.edge_ != null) {
    return this.edge_;
  } else {
    throw '';
  }
};

/** @override */
getEdge2() {
  if (this.edge2_ != null) {
    return this.edge2_;
  } else if (this.edge_ != null) {
    return this.edge_;
  } else {
    throw '';
  }
};

/** @override */
safeGetEdge2() {
  return this.edge2_;
};

/** @override */
setEdge1(edge) {
  if (this.edge_ == null) {
    this.edge_ = edge;
  } else {
    throw '';
  }
};

/** @override */
setEdge2(edge) {
  if (this.edge2_ == null) {
    this.edge2_ = edge;
  } else {
    throw '';
  }
};

} // end class

/** for debugging:  next vertex id number
* @type {number}
* @private
*/
ConcreteVertex.next_vertex_id = 1;

exports = ConcreteVertex;
