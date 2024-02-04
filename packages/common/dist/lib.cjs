'use strict';

var variant = require('variant');
var uuid = require('uuid');
var osuClasses = require('osu-classes');
var core = require('@vueuse/core');
var msgpack = require('@ygoe/msgpack');
var vue = require('vue');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var uuid__namespace = /*#__PURE__*/_interopNamespaceDefault(uuid);
var msgpack__namespace = /*#__PURE__*/_interopNamespaceDefault(msgpack);

class Vec2 {
  constructor(x = 0, y = x) {
    this.x = x;
    this.y = y;
  }
  static from(other) {
    return new Vec2(other.x, other.y);
  }
  static equals(a, b) {
    return a.x === b.x && a.y === b.y;
  }
  static distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }
  static distanceSquared(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }
  static closerThan(a, b, distance) {
    return Vec2.distanceSquared(a, b) < distance * distance;
  }
  static closerThanSquared(a, b, distanceSquared) {
    return Vec2.distanceSquared(a, b) < distanceSquared;
  }
  static add(a, b) {
    return new Vec2(a.x + b.x, a.y + b.y);
  }
  static sub(a, b) {
    return new Vec2(a.x - b.x, a.y - b.y);
  }
  static mul(a, b) {
    return new Vec2(a.x * b.x, a.y * b.y);
  }
  static scale(a, s) {
    return new Vec2(a.x * s, a.y * s);
  }
  static zero() {
    return new Vec2();
  }
  static normalize(a) {
    const length = Math.sqrt(a.x * a.x + a.y * a.y);
    return new Vec2(a.x / length, a.y / length);
  }
  static lengthSquared(a) {
    return a.x * a.x + a.y * a.y;
  }
  static min(a, b) {
    return new Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
  }
  static max(a, b) {
    return new Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
  }
  static lerp(a, b, w) {
    return new Vec2(
      a.x + (b.x - a.x) * w,
      a.y + (b.y - a.y) * w
    );
  }
  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }
  equals(other) {
    return Vec2.equals(this, other);
  }
  distanceTo(other) {
    return Vec2.distance(this, other);
  }
  static rotate(a, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(
      a.x * cos - a.y * sin,
      a.x * sin + a.y * cos
    );
  }
  add(other) {
    return Vec2.add(this, other);
  }
  sub(other) {
    return Vec2.sub(this, other);
  }
  mul(other) {
    return Vec2.mul(this, other);
  }
  scale(s) {
    return Vec2.scale(this, s);
  }
  normalize() {
    return Vec2.normalize(this);
  }
  min(other) {
    return Vec2.min(this, other);
  }
  max(other) {
    return Vec2.max(this, other);
  }
  lerp(other, w) {
    return Vec2.lerp(this, other, w);
  }
  rotate(angle) {
    return Vec2.rotate(this, angle);
  }
}

class Rect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  get position() {
    return new Vec2(this.x, this.y);
  }
  set position(value) {
    this.x = value.x;
    this.y = value.y;
  }
  get size() {
    return new Vec2(this.width, this.height);
  }
  set size(value) {
    this.width = value.x;
    this.height = value.y;
  }
  splitLeft(width) {
    const rect = new Rect(this.x, this.y, width, this.height);
    this.x += width;
    this.width -= width;
    return rect;
  }
  splitRight(width) {
    const rect = new Rect(this.x + this.width, this.y, width, this.height);
    this.width -= width;
    return rect;
  }
  splitTop(height) {
    const rect = new Rect(this.x, this.y, this.width, height);
    this.y += height;
    this.height -= height;
    return rect;
  }
  splitBottom(height) {
    this.height -= height;
    return new Rect(this.x, this.y + this.height, this.width, height);
  }
  withPosition(position) {
    return new Rect(position.x, position.y, this.width, this.height);
  }
  withSize(size) {
    return new Rect(this.x, this.y, size.x, size.y);
  }
  addPoint(point) {
    const x = Math.min(this.x, point.x);
    const y = Math.min(this.y, point.y);
    const right = Math.max(this.x + this.width, point.x);
    const bottom = Math.max(this.y + this.height, point.y);
    this.x = x;
    this.y = y;
    this.width = right - x;
    this.height = bottom - y;
  }
  translate({ x, y }) {
    this.x += x;
    this.y += y;
  }
  static containingPoints(points) {
    if (points.length === 0)
      return void 0;
    const rect = new Rect(points[0].x, points[0].y, 0, 0);
    for (const point of points) {
      rect.addPoint(point);
    }
    return rect;
  }
  get center() {
    return new Vec2(this.x + this.width / 2, this.y + this.height / 2);
  }
  get right() {
    return this.x + this.width;
  }
  get bottom() {
    return this.y + this.height;
  }
  get left() {
    return this.x;
  }
  get top() {
    return this.y;
  }
}

var PathType = /* @__PURE__ */ ((PathType2) => {
  PathType2[PathType2["Linear"] = 0] = "Linear";
  PathType2[PathType2["PerfectCurve"] = 1] = "PerfectCurve";
  PathType2[PathType2["Catmull"] = 2] = "Catmull";
  PathType2[PathType2["Bezier"] = 3] = "Bezier";
  return PathType2;
})(PathType || {});

var RightClickBehavior = /* @__PURE__ */ ((RightClickBehavior2) => {
  RightClickBehavior2["ContextMenu"] = "contextMenu";
  RightClickBehavior2["Delete"] = "delete";
  return RightClickBehavior2;
})(RightClickBehavior || {});
var RendererSelection = /* @__PURE__ */ ((RendererSelection2) => {
  RendererSelection2["Auto"] = "auto";
  RendererSelection2["WebGPU"] = "webgpu";
  RendererSelection2["WebGL"] = "webgl";
  return RendererSelection2;
})(RendererSelection || {});

const ServerMessage = variant.variantModule({
  roomState: variant.fields(),
  userJoined: variant.fields(),
  userLeft: variant.fields(),
  kicked: variant.fields(),
  chatMessage: variant.fields(),
  userActivity: variant.fields(),
  userRoleChanged: variant.fields()
});

const ClientMessage = variant.variantModule({
  kickUser: variant.fields(),
  sendChatMessage: variant.fields(),
  leave: variant.fields(),
  setPresence: variant.fields(),
  setRole: variant.fields(),
  commands: variant.payload(),
  roll: variant.fields()
});

class CommandContext {
  constructor(beatmap, local, own, version) {
    this.beatmap = beatmap;
    this.local = local;
    this.own = own;
    this.version = version;
  }
  get hitObjects() {
    return this.beatmap.hitObjects;
  }
}

var __defProp$4 = Object.defineProperty;
var __getOwnPropSymbols$4 = Object.getOwnPropertySymbols;
var __hasOwnProp$4 = Object.prototype.hasOwnProperty;
var __propIsEnum$4 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$4 = (obj, key2, value) => key2 in obj ? __defProp$4(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __spreadValues$4 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$4.call(b, prop))
      __defNormalProp$4(a, prop, b[prop]);
  if (__getOwnPropSymbols$4)
    for (var prop of __getOwnPropSymbols$4(b)) {
      if (__propIsEnum$4.call(b, prop))
        __defNormalProp$4(a, prop, b[prop]);
    }
  return a;
};
const key = "_pendingInfo";
const UpdateHitObjectHandler = {
  apply(command, context) {
    const hitObject = context.hitObjects.getById(command.hitObject);
    if (!hitObject)
      return;
    if (context.local) {
      for (const key2 in command.update) {
        setPendingInfo(hitObject, key2, context.version);
      }
      hitObject.patch(command.update);
    } else if (context.own) {
      const pending = getPendingInfo(hitObject);
      for (const key2 in command.update) {
        if (pending[key2] === context.version) {
          delete pending[key2];
        }
      }
    } else {
      const pending = getPendingInfo(hitObject);
      const update = {};
      for (const key2 in command.update) {
        if (pending[key2] === void 0) {
          update[key2] = command.update[key2];
        }
      }
      hitObject.patch(update);
    }
  },
  createUndo(command, context) {
    const hitObject = context.hitObjects.getById(command.hitObject);
    if (!hitObject)
      return;
    let update = {};
    const serialized = hitObject.serialize();
    for (const key2 in command.update) {
      update[key2] = serialized[key2];
    }
    return {
      type: "updateHitObject",
      hitObject: command.hitObject,
      update
    };
  },
  merge(a, b, context) {
    if (a.hitObject === b.hitObject) {
      return {
        type: "updateHitObject",
        hitObject: a.hitObject,
        update: __spreadValues$4(__spreadValues$4({}, a.update), b.update)
      };
    }
  }
};
function getPendingInfo(hitObject) {
  if (!hitObject[key]) {
    hitObject[key] = {};
  }
  return hitObject[key];
}
function setPendingInfo(hitObject, key2, version) {
  getPendingInfo(hitObject)[key2] = version;
}

class Action {
  constructor() {
    this._listeners = [];
  }
  addListener(listener) {
    this._listeners.push(listener);
  }
  removeListener(listener) {
    const index = this._listeners.indexOf(listener);
    if (index >= 0) {
      this._listeners.splice(index, 1);
    }
  }
  emit(...args) {
    for (const listener of this._listeners) {
      listener(...args);
    }
  }
  removeListeners() {
    this._listeners = [];
  }
}

var SampleSet = /* @__PURE__ */ ((SampleSet2) => {
  SampleSet2[SampleSet2["Auto"] = 0] = "Auto";
  SampleSet2[SampleSet2["Normal"] = 1] = "Normal";
  SampleSet2[SampleSet2["Soft"] = 2] = "Soft";
  SampleSet2[SampleSet2["Drum"] = 3] = "Drum";
  return SampleSet2;
})(SampleSet || {});
var SampleType = /* @__PURE__ */ ((SampleType2) => {
  SampleType2[SampleType2["Normal"] = 0] = "Normal";
  SampleType2[SampleType2["Whistle"] = 1] = "Whistle";
  SampleType2[SampleType2["Finish"] = 2] = "Finish";
  SampleType2[SampleType2["Clap"] = 3] = "Clap";
  return SampleType2;
})(SampleType || {});
var Additions = /* @__PURE__ */ ((Additions2) => {
  Additions2[Additions2["None"] = 0] = "None";
  Additions2[Additions2["Whistle"] = 1] = "Whistle";
  Additions2[Additions2["Finish"] = 2] = "Finish";
  Additions2[Additions2["Clap"] = 4] = "Clap";
  return Additions2;
})(Additions || {});
function defaultHitSound() {
  return {
    sampleSet: 0 /* Auto */,
    additionSet: 0 /* Auto */,
    additions: 0 /* None */,
    index: 0
  };
}
function getSamples(hitSound, time) {
  const samples = [
    {
      time,
      type: 0 /* Normal */,
      sampleSet: hitSound.sampleSet,
      index: hitSound.index,
      volume: 1
    }
  ];
  let additionSet = hitSound.additionSet;
  if (additionSet === 0 /* Auto */)
    additionSet = hitSound.sampleSet;
  if (hitSound.additions & 1 /* Whistle */) {
    samples.push({
      time,
      type: 1 /* Whistle */,
      sampleSet: additionSet,
      index: hitSound.index,
      volume: 1
    });
  }
  if (hitSound.additions & 2 /* Finish */) {
    samples.push({
      time,
      type: 2 /* Finish */,
      sampleSet: additionSet,
      index: hitSound.index,
      volume: 1
    });
  }
  if (hitSound.additions & 4 /* Clap */) {
    samples.push({
      time,
      type: 3 /* Clap */,
      sampleSet: additionSet,
      index: hitSound.index,
      volume: 1
    });
  }
  return samples;
}

function binarySearch(needle, haystack, compareBy) {
  let low = 0;
  let high = haystack.length - 1;
  while (low <= high) {
    const mid = low + high >>> 1;
    const midValue = compareBy(haystack[mid]);
    if (midValue < needle) {
      low = mid + 1;
    } else if (midValue > needle) {
      high = mid - 1;
    } else {
      return { index: mid, found: true };
    }
  }
  return { index: low, found: false };
}

function encodeUuid(uuidString) {
  const parsedUuid = uuid__namespace.parse(uuidString);
  return Array.from(
    new Int32Array(parsedUuid.buffer, 0, parsedUuid.byteLength / Int32Array.BYTES_PER_ELEMENT)
  );
}
function decodeUuid(values) {
  const uuidBuffer = new ArrayBuffer(16);
  const uuidBytes = new Uint8Array(uuidBuffer);
  uuidBytes.set(values);
  return uuid__namespace.stringify(uuidBytes);
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function randomString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  return result;
}

var __defProp$3 = Object.defineProperty;
var __getOwnPropSymbols$3 = Object.getOwnPropertySymbols;
var __hasOwnProp$3 = Object.prototype.hasOwnProperty;
var __propIsEnum$3 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$3 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$3.call(b, prop))
      __defNormalProp$3(a, prop, b[prop]);
  if (__getOwnPropSymbols$3)
    for (var prop of __getOwnPropSymbols$3(b)) {
      if (__propIsEnum$3.call(b, prop))
        __defNormalProp$3(a, prop, b[prop]);
    }
  return a;
};
function hitObjectId() {
  return randomString(8);
}
class HitObject {
  constructor(options) {
    this.id = hitObjectId();
    this.comboOffset = 0;
    this._position = new Vec2(0, 0);
    this._hitSound = defaultHitSound();
    this._startTime = 0;
    this.comboIndex = 0;
    this.indexInCombo = 0;
    this.scale = 1;
    this.timePreempt = 0;
    this.timeFadeIn = 0;
    this._stackHeight = 0;
    this._isNewCombo = false;
    this.onUpdate = new Action();
    this.depthInfo = {
      position: new Vec2(),
      scale: 1
    };
    this._isSelected = false;
    var _a;
    if (options) {
      if (options.id)
        this.id = options.id;
      this.startTime = options.startTime;
      this.position = new Vec2(options.position.x, options.position.y);
      this.attribution = options.attribution;
      this.isNewCombo = options.newCombo;
      this.comboOffset = (_a = options.comboOffset) != null ? _a : 0;
      if (options.hitSound)
        this._hitSound = __spreadValues$3({}, options.hitSound);
    }
  }
  get position() {
    return this._position;
  }
  get hitSound() {
    return this._hitSound;
  }
  set hitSound(value) {
    this._hitSound = value;
    this._hitSamples = void 0;
    this.onUpdate.emit("hitSounds");
  }
  set position(value) {
    if (Vec2.equals(value, this._position))
      return;
    this._position = value;
    this._stackedPosition = void 0;
    this.onUpdate.emit("position");
  }
  get startTime() {
    return this._startTime;
  }
  set startTime(value) {
    if (value === this._startTime)
      return;
    this._startTime = value;
    this.onUpdate.emit("startTime");
  }
  get endTime() {
    return this.startTime + this.duration;
  }
  get endPosition() {
    return this.position;
  }
  get stackHeight() {
    return this._stackHeight;
  }
  set stackHeight(value) {
    if (value === this._stackHeight)
      return;
    this._stackHeight = value;
    this._stackedPosition = void 0;
  }
  applyDefaults(difficulty, controlPoints) {
    this.scale = (1 - 0.7 * (difficulty.circleSize - 5) / 5) / 2;
    this.timePreempt = difficultyRange(
      difficulty.approachRate,
      1800,
      1200,
      450
    );
    this.timeFadeIn = 400 * Math.min(1, this.timePreempt, 400);
  }
  get isNewCombo() {
    return this._isNewCombo;
  }
  set isNewCombo(value) {
    this._isNewCombo = value;
    this.onUpdate.emit("newCombo");
  }
  get stackedPosition() {
    this._stackedPosition = Vec2.sub(this.position, new Vec2(this.stackHeight * 3, this.stackHeight * 3));
    return this._stackedPosition;
  }
  patch(update) {
    if (update.newCombo !== void 0)
      this.isNewCombo = update.newCombo;
    if (update.position !== void 0)
      this.position = new Vec2(update.position.x, update.position.y);
    if (update.startTime !== void 0)
      this.startTime = update.startTime;
    if (update.hitSound !== void 0)
      this.hitSound = update.hitSound;
  }
  get radius() {
    return 59 * this.scale;
  }
  get isSelected() {
    return this._isSelected;
  }
  set isSelected(value) {
    this._isSelected = value;
    this.onUpdate.emit("selected");
  }
  get hitSamples() {
    if (this._hitSamples === void 0)
      this._hitSamples = this.calculateHitSamples();
    return this._hitSamples;
  }
  _updateHitSounds() {
  }
}
function difficultyRange(diff, min, mid, max) {
  if (diff > 5) {
    return mid + (max - mid) * (diff - 5) / 5;
  }
  if (diff < 5) {
    return mid - (mid - min) * (5 - diff) / 5;
  }
  return mid;
}
var HitObjectType = /* @__PURE__ */ ((HitObjectType2) => {
  HitObjectType2[HitObjectType2["Circle"] = 1] = "Circle";
  HitObjectType2[HitObjectType2["Slider"] = 2] = "Slider";
  HitObjectType2[HitObjectType2["Spinner"] = 3] = "Spinner";
  return HitObjectType2;
})(HitObjectType || {});

var __defProp$2 = Object.defineProperty;
var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$2 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$2.call(b, prop))
      __defNormalProp$2(a, prop, b[prop]);
  if (__getOwnPropSymbols$2)
    for (var prop of __getOwnPropSymbols$2(b)) {
      if (__propIsEnum$2.call(b, prop))
        __defNormalProp$2(a, prop, b[prop]);
    }
  return a;
};
class HitCircle extends HitObject {
  constructor(options) {
    super(options);
    this.type = HitObjectType.Circle;
  }
  get duration() {
    return 0;
  }
  serialize() {
    return {
      id: this.id,
      type: "circle",
      position: this.position,
      newCombo: this.isNewCombo,
      startTime: this.startTime,
      comboOffset: this.comboOffset,
      attribution: this.attribution,
      hitSound: __spreadValues$2({}, this._hitSound)
    };
  }
  contains(point) {
    return Vec2.closerThan(this.stackedPosition, point, this.radius);
  }
  calculateHitSamples() {
    return getSamples(this.hitSound, this.startTime);
  }
}

class SliderPath {
  constructor(path = [], expectedDistance = 0) {
    this._expectedDistance = 0;
    this._version = 0;
    this.controlPoints = path;
    this._expectedDistance = expectedDistance;
  }
  get expectedDistance() {
    return this._expectedDistance;
  }
  set expectedDistance(value) {
    if (value === this._expectedDistance)
      return;
    this._expectedDistance = value;
    this._calculatedRange = void 0;
    this._endPosition = void 0;
    this._version++;
  }
  get endPosition() {
    if (this._endPosition === void 0)
      this._endPosition = this.getPositionAtDistance(this.expectedDistance);
    return this._endPosition;
  }
  invalidate() {
    this._calculatedPath = void 0;
    this._calculatedRange = void 0;
    this._endPosition = void 0;
    this._version++;
  }
  get calculatedPath() {
    if (this._calculatedPath === void 0) {
      const [path, cumulativeDistance] = this._calculatePath();
      this._calculatedPath = path;
      this._cumulativeDistance = cumulativeDistance;
    }
    return this._calculatedPath;
  }
  get calculatedRange() {
    if (this._calculatedRange === void 0)
      this._calculatedRange = this.getRange(0, this.expectedDistance);
    return this._calculatedRange;
  }
  get cumulativeDistance() {
    if (this._cumulativeDistance === void 0) {
      const [path, cumulativeDistance] = this._calculatePath();
      this._calculatedPath = path;
      this._cumulativeDistance = cumulativeDistance;
    }
    return this._cumulativeDistance;
  }
  get totalLength() {
    var _a;
    return (_a = this.cumulativeDistance[this.cumulativeDistance.length - 1]) != null ? _a : 0;
  }
  get version() {
    return this._version;
  }
  _calculatePath() {
    var _a;
    if (this.controlPoints.length === 0)
      return [[], []];
    const points = [
      new Vec2(this.controlPoints[0].x, this.controlPoints[0].y)
    ];
    const cumulativeDistance = [0];
    let segmentStart = 0;
    for (let i = 1; i < this.controlPoints.length; i++) {
      if (this.controlPoints[i].type !== null || i === this.controlPoints.length - 1) {
        const segment = this.calculateSegment(
          (_a = this.controlPoints[segmentStart].type) != null ? _a : PathType.Bezier,
          segmentStart,
          i
        );
        for (const point of segment) {
          const last = points[points.length - 1];
          if (Vec2.equals(last, point))
            continue;
          points.push(new Vec2(point.x, point.y));
          cumulativeDistance.push(
            cumulativeDistance[cumulativeDistance.length - 1] + Vec2.distance(last, point)
          );
        }
        segmentStart = i;
      }
    }
    return [points, cumulativeDistance];
  }
  calculateSegment(type, start, end) {
    const points = this.controlPoints.slice(start, end + 1).map((p) => new osuClasses.Vector2(p.x, p.y));
    switch (type) {
      case PathType.Linear:
        return osuClasses.PathApproximator.approximateLinear(points);
      case PathType.PerfectCurve:
        if (points.length === 3)
          return osuClasses.PathApproximator.approximateCircularArc(points);
      case PathType.Bezier:
        return osuClasses.PathApproximator.approximateBezier(points);
      case PathType.Catmull:
        return osuClasses.PathApproximator.approximateCatmull(points);
    }
  }
  getRange(start, end) {
    let d0 = start;
    let d1 = end;
    let i = 0;
    const calculatedPath = this.calculatedPath;
    const cumulativeDistance = this._cumulativeDistance;
    for (; i < calculatedPath.length && cumulativeDistance[i] < d0; ++i) {
    }
    const path = [];
    path.push(this.interpolateVertices(i, d0));
    for (; i < calculatedPath.length && cumulativeDistance[i] <= d1; ++i) {
      const p2 = calculatedPath[i];
      if (!Vec2.equals(path[path.length - 1], p2))
        path.push(p2);
    }
    const p = this.interpolateVertices(i, d1);
    if (!Vec2.equals(path[path.length - 1], p))
      path.push(p);
    return path;
  }
  interpolateVertices(i, d) {
    if (this.calculatedPath.length === 0)
      return Vec2.zero();
    if (i <= 0)
      return this.calculatedPath[0];
    if (i >= this.calculatedPath.length)
      return this.calculatedPath[this.calculatedPath.length - 1];
    let p0 = this.calculatedPath[i - 1];
    let p1 = this.calculatedPath[i];
    let d0 = this._cumulativeDistance[i - 1];
    let d1 = this._cumulativeDistance[i];
    if (Math.abs(d0 - d1) < 1e-3)
      return p0;
    const w = (d - d0) / (d1 - d0);
    return Vec2.lerp(p0, p1, w);
  }
  getPositionAtDistance(d) {
    if (this.calculatedPath.length <= 1)
      return new Vec2();
    let i = 0;
    const calculatedPath = this.calculatedPath;
    const cumulativeDistance = this._cumulativeDistance;
    while (i < cumulativeDistance.length - 1) {
      if (cumulativeDistance[i + 1] > d)
        break;
      i++;
    }
    const start = calculatedPath[i];
    const end = calculatedPath[i + 1];
    const distance = cumulativeDistance[i + 1] - cumulativeDistance[i];
    let t = (d - cumulativeDistance[i]) / distance;
    t = core.clamp(t, 0, 1);
    if (!end)
      return start;
    return new Vec2(
      start.x + (end.x - start.x) * t,
      start.y + (end.y - start.y) * t
    );
  }
}

var __defProp$1 = Object.defineProperty;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
class Slider extends HitObject {
  constructor(options) {
    super(options);
    this.type = HitObjectType.Slider;
    this._repeats = 0;
    this._hitSounds = [];
    this._velocityOverride = null;
    this.path = new SliderPath();
    this._baseVelocity = 1;
    this.inheritedVelocity = 1;
    if (options) {
      this.repeats = options.repeats;
      this.velocityOverride = options.velocity;
      this.path = new SliderPath(options.path, options.expectedDistance);
      if (options.hitSounds)
        this.hitSounds = options.hitSounds;
      this._updateHitSounds();
    }
  }
  get expectedDistance() {
    return this.path.expectedDistance;
  }
  set expectedDistance(value) {
    this.path.expectedDistance = value;
  }
  get repeats() {
    return this._repeats;
  }
  set repeats(value) {
    if (value === this._repeats)
      return;
    this._repeats = value;
    this.onUpdate.emit("repeats");
    this._updateHitSounds();
  }
  get hitSounds() {
    return this._hitSounds;
  }
  set hitSounds(value) {
    this._hitSounds = value;
    this._hitSamples = void 0;
    this.onUpdate.emit("hitSounds");
  }
  get velocityOverride() {
    return this._velocityOverride;
  }
  set velocityOverride(value) {
    if (value === this._velocityOverride)
      return;
    this._velocityOverride = value != null ? value : null;
    this.onUpdate.emit("velocity");
  }
  get baseVelocity() {
    return this._baseVelocity;
  }
  get velocity() {
    var _a;
    return ((_a = this.velocityOverride) != null ? _a : this.inheritedVelocity) * this._baseVelocity;
  }
  get spanDuration() {
    return this.expectedDistance / this.velocity;
  }
  get duration() {
    return this.spanDuration * this.spans;
  }
  get spans() {
    return this.repeats + 1;
  }
  set spans(value) {
    this.repeats = value - 1;
  }
  applyDefaults(difficulty, controlPoints) {
    super.applyDefaults(difficulty, controlPoints);
    const timingPoint = controlPoints.timingPointAt(this.startTime);
    const baseScoringDistance = 100 * difficulty.sliderMultiplier;
    this._baseVelocity = baseScoringDistance / timingPoint.beatLength;
    this.inheritedVelocity = controlPoints.getVelocityAt(this.startTime);
  }
  serialize() {
    return {
      id: this.id,
      type: "slider",
      path: this.path.controlPoints,
      position: this.position,
      newCombo: this.isNewCombo,
      startTime: this.startTime,
      attribution: this.attribution,
      repeats: this.repeats,
      expectedDistance: this.expectedDistance,
      comboOffset: this.comboOffset,
      velocity: this.velocityOverride,
      hitSound: __spreadValues$1({}, this.hitSound),
      hitSounds: this.hitSounds.map((s) => __spreadValues$1({}, s))
    };
  }
  get endPosition() {
    if (this.repeats % 2 == 0)
      return Vec2.add(this.position, this.path.endPosition);
    return this.position;
  }
  positionAt(time) {
    if (time < this.startTime)
      return Vec2.zero();
    if (time > this.endTime)
      return this.repeats % 2 == 0 ? this.path.endPosition : Vec2.zero();
    const spanDuration = this.spanDuration;
    const spanIndex = Math.floor((time - this.startTime) / spanDuration);
    const spanStartTime = this.startTime + spanIndex * spanDuration;
    let spanProgress = (time - spanStartTime) / spanDuration;
    if (spanIndex % 2 === 1)
      spanProgress = 1 - spanProgress;
    return this.path.getPositionAtDistance(spanProgress * this.expectedDistance);
  }
  angleAt(time) {
    if (time <= this.startTime + 1) {
      return this.angleAt(this.startTime + 1);
    }
    const pos1 = this.positionAt(time - 1);
    const pos2 = this.positionAt(time);
    return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
  }
  get startAngle() {
    const p1 = this.path.controlPoints[0];
    const p2 = this.path.getPositionAtDistance(1);
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }
  get endAngle() {
    const p1 = this.path.getPositionAtDistance(this.expectedDistance - 1);
    const p2 = this.path.endPosition;
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }
  contains(point) {
    const radiusSquared = this.radius * this.radius;
    if (Vec2.closerThanSquared(this.stackedPosition, point, radiusSquared))
      return true;
    if (Vec2.closerThanSquared(Vec2.add(this.stackedPosition, this.path.endPosition), point, radiusSquared))
      return true;
    point = Vec2.sub(point, this.stackedPosition);
    const path = this.path.calculatedRange;
    let distance = 0;
    const step = 10;
    let i = 1;
    while (distance < this.path.expectedDistance) {
      distance += step;
      while (i < path.length - 1 && this.path.cumulativeDistance[i] < distance)
        i++;
      let p1 = path[i - 1];
      let p2 = path[i];
      let d1 = this.path.cumulativeDistance[i - 1];
      let d2 = this.path.cumulativeDistance[i];
      let t = (distance - d1) / (d2 - d1);
      let x = p1.x + (p2.x - p1.x) * t;
      let y = p1.y + (p2.y - p1.y) * t;
      if (Vec2.closerThanSquared(new Vec2(x, y), point, radiusSquared))
        return true;
    }
    return false;
  }
  patch(update) {
    super.patch(update);
    if (update.path !== void 0) {
      this.path.controlPoints = update.path;
      this.path.invalidate();
      this.onUpdate.emit("position");
    }
    if (update.expectedDistance !== void 0) {
      this.path.expectedDistance = update.expectedDistance;
      this.path.invalidate();
      this.onUpdate.emit("position");
    }
    if (update.repeats !== void 0) {
      this.repeats = update.repeats;
    }
    if (update.velocity !== void 0) {
      this.velocityOverride = update.velocity;
    }
    if (update.hitSounds !== void 0) {
      this.hitSounds = update.hitSounds;
    }
  }
  calculateHitSamples() {
    return [
      //...getSamples(this.hitSound, this.startTime),
      ...this.hitSounds.flatMap((hitSound, i) => {
        return getSamples(hitSound, this.startTime + i * this.spanDuration);
      })
    ];
  }
  _updateHitSounds() {
    var _a, _b;
    if (this._hitSounds.length === this.spans + 1)
      return;
    if (this._hitSounds.length > this.spans + 1) {
      const last = (_a = this._hitSounds[this._hitSounds.length - 1]) != null ? _a : defaultHitSound();
      this._hitSounds.length = this.spans + 1;
      this._hitSounds[this._hitSounds.length - 1] = last;
      this.onUpdate.emit("hitSounds");
    } else {
      const last = (_b = this._hitSounds[this._hitSounds.length - 1]) != null ? _b : defaultHitSound();
      while (this._hitSounds.length < this.spans + 1) {
        this._hitSounds.push(last);
      }
      this.onUpdate.emit("hitSounds");
    }
  }
}

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
const spinnerPosition = new Vec2(256, 192);
class Spinner extends HitObject {
  constructor(options) {
    super(options);
    this.type = HitObjectType.Spinner;
    this._duration = 0;
    if (options) {
      this.duration = options.duration;
    }
  }
  get duration() {
    return this._duration;
  }
  set duration(value) {
    if (value === this._duration)
      return;
    this._duration = value;
    this.onUpdate.emit("duration");
  }
  serialize() {
    return {
      id: this.id,
      type: "spinner",
      position: this.position,
      newCombo: this.isNewCombo,
      attribution: this.attribution,
      startTime: this.startTime,
      duration: this.duration,
      comboOffset: this.comboOffset,
      hitSound: __spreadValues({}, this._hitSound)
    };
  }
  contains(point) {
    return Vec2.closerThan(point, spinnerPosition, 128);
  }
  get position() {
    return spinnerPosition;
  }
  set position(value) {
  }
  get isNewCombo() {
    return true;
  }
  set isNewCombo(value) {
  }
  patch(update) {
    super.patch(update);
    if (update.duration !== void 0)
      this.duration = update.duration;
  }
  calculateHitSamples() {
    return [];
  }
}

function deserializeHitObject(plain) {
  switch (plain.type) {
    case "circle":
      return new HitCircle(plain);
    case "slider":
      return new Slider(plain);
    case "spinner":
      return new Spinner(plain);
  }
}

const CreateHitObjectHandler = {
  apply(command, context) {
    if (context.local || !context.local && !context.own) {
      context.hitObjects.add(deserializeHitObject(command.hitObject));
    }
  },
  createUndo(command, context) {
    if (command.hitObject.id)
      return EditorCommand.deleteHitObject({
        id: command.hitObject.id
      });
  }
};
const DeleteHitObjectHandler = {
  apply(command, context) {
    if (context.local || !context.local && !context.own) {
      const hitObject = context.hitObjects.getById(command.id);
      if (hitObject) {
        context.hitObjects.remove(hitObject);
      }
    }
  },
  createUndo(command, context) {
    const hitObject = context.hitObjects.getById(command.id);
    if (hitObject) {
      return EditorCommand.createHitObject({
        hitObject: hitObject.serialize()
      });
    }
  }
};

class EditorBookmark {
  constructor(options) {
    this.time = options.time;
    this.name = options.name;
  }
  serialize() {
    return {
      time: this.time,
      name: this.name
    };
  }
}

class CreateBookmarkHandler {
  apply(command, context) {
    console.log("createBookmark", command, context.beatmap.bookmarks);
    if (context.beatmap.bookmarks.some((it) => it.time === command.time)) {
      return;
    }
    context.beatmap.bookmarks.push(new EditorBookmark({
      time: command.time,
      name: command.name
    }));
    context.beatmap.bookmarks.sort((a, b) => a.time - b.time);
    context.beatmap.onBookmarksChanged.emit();
  }
  createUndo(command) {
    return EditorCommand.removeBookmark({
      time: command.time
    });
  }
}
class RemoveBookmarkHandler {
  apply(command, context) {
    const index = context.beatmap.bookmarks.findIndex((it) => it.time === command.time);
    if (index === -1) {
      return;
    }
    context.beatmap.bookmarks.splice(index, 1);
    context.beatmap.onBookmarksChanged.emit();
  }
  createUndo(command, context) {
    const bookmark = context.beatmap.bookmarks.find((it) => it.time === command.time);
    if (!bookmark) {
      return;
    }
    return EditorCommand.createBookmark({
      time: bookmark.time,
      name: bookmark.name
    });
  }
}

function encodeCommands(commands) {
  return msgpack__namespace.encode(commands);
}
function decodeCommands(data) {
  const commands = msgpack__namespace.decode(data);
  return commands;
}

const EditorCommand = variant.variantModule({
  updateHitObject: variant.fields(),
  createHitObject: variant.fields(),
  deleteHitObject: variant.fields(),
  createBookmark: variant.fields(),
  removeBookmark: variant.fields()
});
const commandHandlers = {
  updateHitObject: UpdateHitObjectHandler,
  createHitObject: CreateHitObjectHandler,
  deleteHitObject: DeleteHitObjectHandler,
  createBookmark: new CreateBookmarkHandler(),
  removeBookmark: new RemoveBookmarkHandler()
};
function getCommandHandler(command) {
  return variant.lookup(command, commandHandlers);
}
function updateHitObject(hitObject, update) {
  return EditorCommand.updateHitObject({
    hitObject: hitObject.id,
    update
  });
}

const UserActivity = variant.variantModule({
  idle: variant.fields(),
  composeScreen: variant.fields()
});

class ControlPointManager {
  constructor(options) {
    this.velocities = options.velocity;
    this.timing = options.timing;
  }
  serialize() {
    return {
      timing: this.timing,
      velocity: this.velocities
    };
  }
  timingPointAt(time) {
    if (this.timing.length === 0) {
      return {
        time: 0,
        beatLength: 6e4 / 120
      };
    }
    let { index, found } = this.binarySearch(this.timing, time);
    if (!found && index > 0)
      index--;
    return this.timing[index];
  }
  getVelocityAt(time) {
    if (this.velocities.length === 0) {
      return 1;
    }
    let { index, found } = this.binarySearch(this.velocities, time);
    if (!found && index > 0)
      index--;
    if (index === 0 && this.velocities[index].time > time)
      return 1;
    return this.velocities[index].velocity;
  }
  getTicks(startTime, endTime, divisor = 4) {
    var _a, _b;
    if (this.timing.length == 0)
      return [];
    let { index, found } = this.binarySearch(this.timing, startTime);
    if (!found && index > 0)
      index--;
    const ticks = [];
    let timingPoint = this.timing[index];
    let offset = 0;
    if (timingPoint.time > startTime) {
      offset = -Math.ceil(
        (timingPoint.time - startTime) / timingPoint.beatLength * divisor
      ) * timingPoint.beatLength / divisor;
    }
    while (timingPoint) {
      const tickEndTime = Math.min(
        (_b = (_a = this.timing[index + 1]) == null ? void 0 : _a.time) != null ? _b : endTime,
        endTime
      );
      const numTicks = Math.ceil((tickEndTime - timingPoint.time - offset) / timingPoint.beatLength * divisor);
      ticks.push(
        ...Array.from({ length: numTicks }, (_, i) => {
          const time = offset + i * timingPoint.beatLength / divisor;
          let type = 1 /* Full */;
          let subticks = Math.round(time / timingPoint.beatLength * 48);
          subticks = mod(mod(subticks, 48) + 48, 48);
          if (subticks % 48 === 0) {
            type = 1 /* Full */;
          } else if (subticks % 24 === 0) {
            type = 2 /* Half */;
          } else if (subticks % 16 === 0) {
            type = 3 /* Third */;
          } else if (subticks % 12 === 0) {
            type = 4 /* Quarter */;
          } else if (subticks % 8 === 0) {
            type = 6 /* Sixth */;
          } else if (subticks % 6 === 0) {
            type = 8 /* Eighth */;
          } else if (subticks % 4 === 0) {
            type = 12 /* Twelfth */;
          } else if (subticks % 3 === 0) {
            type = 16 /* Sixteenth */;
          }
          return {
            time: timingPoint.time + time,
            type
          };
        })
      );
      timingPoint = this.timing[++index];
      offset = 0;
    }
    return ticks;
  }
  binarySearch(array, time) {
    let left = 0;
    let right = array.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (array[mid].time === time) {
        return { index: mid, found: true };
      } else if (array[mid].time < time) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return { index: left, found: false };
  }
  snap(time, divisor, type = "round") {
    const timingPoint = this.timingPointAt(time);
    const offset = time - timingPoint.time;
    const beatLength = timingPoint.beatLength / divisor;
    let beat;
    switch (type) {
      case "round":
        beat = Math.round(offset / beatLength);
        break;
      case "floor":
        beat = Math.floor(offset / beatLength);
        break;
      case "ceil":
        beat = Math.ceil(offset / beatLength);
        break;
    }
    return timingPoint.time + beat * beatLength;
  }
}
function mod(a, n) {
  return (a % n + n) % n;
}
var TickType = /* @__PURE__ */ ((TickType2) => {
  TickType2[TickType2["Full"] = 1] = "Full";
  TickType2[TickType2["Half"] = 2] = "Half";
  TickType2[TickType2["Third"] = 3] = "Third";
  TickType2[TickType2["Quarter"] = 4] = "Quarter";
  TickType2[TickType2["Sixth"] = 6] = "Sixth";
  TickType2[TickType2["Eighth"] = 8] = "Eighth";
  TickType2[TickType2["Twelfth"] = 12] = "Twelfth";
  TickType2[TickType2["Sixteenth"] = 16] = "Sixteenth";
  return TickType2;
})(TickType || {});

class HitObjectManager {
  constructor(hitObjects, difficulty, controlPoints, general) {
    this.difficulty = difficulty;
    this.controlPoints = controlPoints;
    this.general = general;
    this._hitObjectMap = /* @__PURE__ */ new Map();
    this._stackVersion = vue.ref(0);
    this.onRemoved = new Action();
    this.onAdded = new Action();
    this.onUpdated = new Action();
    this.hitObjects = hitObjects.map((hitObject) => deserializeHitObject(hitObject));
    this.hitObjects.forEach((hitObject) => this._onAdd(hitObject, true));
    this.calculateCombos();
    this.calculateStacking(this.hitObjects, general.stackLeniency, 3, 0, this.hitObjects.length - 1);
    vue.watch(this._stackVersion, () => {
      this.calculateStacking(this.hitObjects, general.stackLeniency, 3, 0, this.hitObjects.length - 1);
    });
  }
  _onAdd(hitObject, isInit = false) {
    this._hitObjectMap.set(hitObject.id, hitObject);
    hitObject.applyDefaults(this.difficulty, this.controlPoints);
    hitObject.onUpdate.addListener((key) => {
      this._onUpdate(hitObject, key);
    });
    if (!isInit) {
      this.sortHitObjects();
      this._calculateStackingFor(hitObject);
      this.calculateCombos();
    }
    this.onAdded.emit(hitObject);
  }
  add(hitObject) {
    this.hitObjects.push(hitObject);
    this._onAdd(hitObject);
  }
  remove(hitObject) {
    const index = this.hitObjects.indexOf(hitObject);
    if (index === -1)
      return;
    this.hitObjects.splice(index, 1);
    this._onRemove(hitObject);
  }
  _onRemove(hitObject) {
    this._hitObjectMap.delete(hitObject.id);
    hitObject.onUpdate.removeListeners();
    this.calculateCombos();
    this.onRemoved.emit(hitObject);
  }
  _onUpdate(hitObject, key) {
    switch (key) {
      case "startTime":
        this.sortHitObjects();
        this.calculateCombos();
        this._calculateStackingFor(hitObject);
        break;
      case "newCombo":
        this.calculateCombos();
        break;
      case "position":
        this._calculateStackingFor(hitObject);
    }
    this.onUpdated.emit(hitObject, key);
  }
  sortHitObjects() {
    this.hitObjects.sort((a, b) => a.startTime - b.startTime);
  }
  serialize() {
    return this.hitObjects.map((it) => it.serialize());
  }
  calculateCombos() {
    let comboIndex = 0;
    let indexInCombo = 0;
    for (const hitObject of this.hitObjects) {
      if (hitObject.isNewCombo) {
        comboIndex += 1 + hitObject.comboOffset;
        indexInCombo = 0;
      }
      hitObject.comboIndex = comboIndex;
      hitObject.indexInCombo = indexInCombo;
      indexInCombo++;
      hitObject.onUpdate.emit("combo");
    }
  }
  get first() {
    return this.hitObjects[0];
  }
  get last() {
    return this.hitObjects[this.hitObjects.length - 1];
  }
  calculateStacking(hitObjects, stackLeniency, stackDistance, startIndex = 0, endIndex = hitObjects.length - 1) {
    let extendedEndIndex = endIndex;
    const alteredObjects = /* @__PURE__ */ new Set();
    for (let i = startIndex; i <= endIndex; i++) {
      hitObjects[i].stackHeight = 0;
      hitObjects[i].stackRoot = void 0;
    }
    if (stackLeniency === 0)
      return;
    performance.mark("calculateStacking-start");
    if (endIndex < hitObjects.length - 1) {
      for (let i = endIndex; i >= startIndex; i--) {
        let stackBaseIndex = i;
        for (let n = stackBaseIndex + 1; n < hitObjects.length; n++) {
          const stackBaseObject = hitObjects[stackBaseIndex];
          const objectN = hitObjects[n];
          const endTime = stackBaseObject.endTime;
          const stackThreshold = objectN.timePreempt * stackLeniency;
          if (objectN.startTime - endTime > stackThreshold)
            break;
          if (Vec2.distance(stackBaseObject.position, objectN.position) < stackDistance || stackBaseObject instanceof Slider && Vec2.distance(stackBaseObject.endPosition, objectN.position) < stackDistance) {
            stackBaseIndex = n;
            objectN.stackHeight = 0;
            objectN.stackRoot = void 0;
            alteredObjects.add(objectN);
          }
        }
        if (stackBaseIndex > extendedEndIndex) {
          extendedEndIndex = stackBaseIndex;
          if (extendedEndIndex === hitObjects.length - 1)
            break;
        }
      }
    }
    let extendedStartIndex = startIndex;
    for (let i = extendedEndIndex; i >= extendedStartIndex; i--) {
      let n = i;
      let objectI = hitObjects[i];
      if (objectI.stackHeight !== 0 || objectI instanceof Spinner)
        continue;
      const stackThreshold = objectI.timePreempt * stackLeniency;
      if (objectI instanceof HitCircle) {
        while (--n >= 0) {
          const objectN = hitObjects[n];
          if (objectN instanceof Spinner)
            continue;
          const endTime = objectN.endTime;
          if (objectI.startTime - endTime > stackThreshold)
            break;
          if (n < extendedStartIndex && objectN.stackRoot === objectI.id) {
            extendedStartIndex = n;
            objectN.stackHeight = 0;
            objectN.stackRoot = void 0;
            alteredObjects.add(objectN);
          }
          if (objectN instanceof Slider && Vec2.distance(objectN.endPosition, objectI.position) < stackDistance) {
            const offset = objectI.stackHeight - objectN.stackHeight + 1;
            for (let j = n + 1; j <= i; j++) {
              const objectJ = hitObjects[j];
              if (Vec2.distance(objectN.endPosition, objectJ.position) < stackDistance) {
                objectJ.stackHeight -= offset;
                objectJ.stackRoot = objectN.id;
                alteredObjects.add(objectJ);
              }
            }
            break;
          }
          if (Vec2.distance(objectN.position, objectI.position) < stackDistance) {
            objectN.stackHeight = objectI.stackHeight + 1;
            objectN.stackRoot = objectI.id;
            alteredObjects.add(objectN);
            objectI = objectN;
          }
        }
      } else if (objectI instanceof Slider) {
        while (--n >= startIndex) {
          const objectN = hitObjects[n];
          if (objectI.startTime - objectN.endTime > stackThreshold)
            break;
          if (Vec2.distance(objectN.endPosition, objectI.position) < stackDistance) {
            objectN.stackHeight = objectI.stackHeight + 1;
            alteredObjects.add(objectN);
            objectI = objectN;
          }
        }
      }
    }
    for (const object of alteredObjects) {
      object.onUpdate.emit("stackHeight");
    }
    performance.mark("calculateStacking-end");
    performance.measure("calculateStacking", "calculateStacking-start", "calculateStacking-end");
  }
  _calculateStackingFor(hitObject) {
    const index = this.hitObjects.indexOf(hitObject);
    this.calculateStacking(this.hitObjects, 0.9, 3, index, index);
  }
  getById(id) {
    return this._hitObjectMap.get(id);
  }
  getAtTime(time) {
    let { found, index } = binarySearch(time, this.hitObjects, (it) => it.startTime);
    if (found)
      return this.hitObjects[index];
    if (index === 0)
      return void 0;
    const hitObject = this.hitObjects[index - 1];
    if (hitObject.endTime > time)
      return hitObject;
    return void 0;
  }
}

class HitSoundSample {
  constructor(options) {
    this.id = hitObjectId();
    this.selected = false;
    this.id = options.id;
    this.time = options.time;
  }
  serialize() {
    return {
      id: this.id,
      time: this.time
    };
  }
}

class HitSoundLayer {
  constructor(options) {
    this.id = hitObjectId();
    var _a;
    this.id = (_a = options.id) != null ? _a : hitObjectId();
    this.name = options.name;
    this.sampleSet = options.sampleSet;
    this.type = options.type;
    this.customFilename = options.customFilename;
    this.samples = options.samples.map((sample) => new HitSoundSample(sample));
    this.enabled = options.enabled;
    this.volume = options.volume;
  }
  patch(options) {
    if (options.name !== void 0)
      this.name = options.name;
    if (options.sampleSet !== void 0)
      this.sampleSet = options.sampleSet;
    if (options.type !== void 0)
      this.type = options.type;
    if (options.customFilename !== void 0)
      this.customFilename = options.customFilename;
    if (options.enabled !== void 0)
      this.enabled = options.enabled;
    if (options.volume !== void 0)
      this.volume = options.volume;
  }
  serialize() {
    return {
      id: this.id,
      name: this.name,
      sampleSet: this.sampleSet,
      type: this.type,
      customFilename: this.customFilename,
      samples: this.samples,
      enabled: this.enabled,
      volume: this.volume
    };
  }
}

class Envelope {
  constructor(options) {
    this.controlPoints = options.controlPoints.map((x) => new EnvelopeControlPoint(x));
  }
  serialize() {
    return {
      controlPoints: this.controlPoints.map((x) => x.serialize())
    };
  }
}
class EnvelopeControlPoint {
  constructor(options) {
    this.time = options.time;
    this.value = options.value;
    this.type = 0 /* Linear */;
  }
  serialize() {
    return {
      time: this.time,
      value: this.value,
      type: this.type
    };
  }
}
var AnchorType = /* @__PURE__ */ ((AnchorType2) => {
  AnchorType2[AnchorType2["Linear"] = 0] = "Linear";
  AnchorType2[AnchorType2["Constant"] = 1] = "Constant";
  return AnchorType2;
})(AnchorType || {});

class HitSoundManager {
  constructor(options) {
    this.layers = [];
    var _a;
    this.layers = ((_a = options.layers) != null ? _a : []).map((layer) => new HitSoundLayer(layer));
    if (options.volume) {
      this.volume = new Envelope(options.volume);
    } else {
      this.volume = new Envelope({ controlPoints: [] });
    }
  }
  serialize() {
    return {
      layers: this.layers.map((layer) => layer.serialize()),
      volume: this.volume.serialize()
    };
  }
}
function defaultHitSoundLayers() {
  const types = [SampleType.Normal, SampleType.Whistle, SampleType.Finish, SampleType.Clap];
  const sampleSets = [SampleSet.Normal, SampleSet.Soft, SampleSet.Drum];
  const layers = [];
  for (const sampleSet of sampleSets) {
    for (const type of types) {
      layers.push(new HitSoundLayer({
        name: null,
        sampleSet,
        type,
        customFilename: null,
        samples: [],
        volume: 1,
        enabled: true
      }));
    }
  }
  return layers;
}

class Mapset {
  constructor(options) {
    this.id = options.id;
    this.creator = options.creator;
    this.meatadata = new MapsetMetadata(options.metadata);
  }
  serialize() {
    return {
      id: this.id,
      creator: this.creator,
      metadata: this.meatadata.serialize()
    };
  }
}
class Beatmap {
  constructor(options) {
    this.colors = [];
    this.onBookmarksChanged = new Action();
    var _a, _b;
    this.id = options.id;
    this.setId = options.setId;
    this.metadata = new MapsetMetadata(options.metadata);
    this.name = options.name;
    this.general = (_a = options.general) != null ? _a : { stackLeniency: 0.7 };
    this.controlPoints = new ControlPointManager(options.controlPoints);
    this.difficulty = options.difficulty;
    this.hitObjects = new HitObjectManager(options.hitObjects, this.difficulty, this.controlPoints, this.general);
    this.bookmarks = options.bookmarks.map((bookmark) => new EditorBookmark(bookmark)).filter((it) => it.time != void 0);
    this.backgroundPath = options.backgroundPath;
    this.colors = options.colors.map((color) => parseInt(color.substr(1, 6), 16));
    this.audioFilename = options.audioFilename;
    if (this.colors.length === 0) {
      this.colors = [16711680, 65280, 255];
    }
    console.log(options.hitSounds);
    this.hitSounds = new HitSoundManager((_b = options.hitSounds) != null ? _b : { layers: defaultHitSoundLayers() });
  }
  serialize() {
    return {
      id: this.id,
      setId: this.setId,
      metadata: this.metadata.serialize(),
      name: this.name,
      controlPoints: this.controlPoints.serialize(),
      hitObjects: this.hitObjects.serialize(),
      difficulty: this.difficulty,
      bookmarks: this.bookmarks.map((bookmark) => bookmark.serialize()),
      backgroundPath: this.backgroundPath,
      colors: this.colors.map((color) => "#" + color.toString(16)),
      audioFilename: this.audioFilename,
      general: this.general,
      hitSounds: this.hitSounds.serialize()
    };
  }
}
class MapsetMetadata {
  constructor(options) {
    this.title = options.title;
    this.artist = options.artist;
    this.tags = options.tags;
  }
  serialize() {
    return {
      title: this.title,
      artist: this.artist,
      tags: this.tags
    };
  }
}

exports.Additions = Additions;
exports.AnchorType = AnchorType;
exports.Beatmap = Beatmap;
exports.ClientMessage = ClientMessage;
exports.CommandContext = CommandContext;
exports.ControlPointManager = ControlPointManager;
exports.EditorCommand = EditorCommand;
exports.Envelope = Envelope;
exports.EnvelopeControlPoint = EnvelopeControlPoint;
exports.HitCircle = HitCircle;
exports.HitObject = HitObject;
exports.HitObjectManager = HitObjectManager;
exports.HitObjectType = HitObjectType;
exports.HitSoundLayer = HitSoundLayer;
exports.HitSoundManager = HitSoundManager;
exports.HitSoundSample = HitSoundSample;
exports.Mapset = Mapset;
exports.MapsetMetadata = MapsetMetadata;
exports.PathType = PathType;
exports.Rect = Rect;
exports.RendererSelection = RendererSelection;
exports.RightClickBehavior = RightClickBehavior;
exports.SampleSet = SampleSet;
exports.SampleType = SampleType;
exports.ServerMessage = ServerMessage;
exports.Slider = Slider;
exports.SliderPath = SliderPath;
exports.Spinner = Spinner;
exports.TickType = TickType;
exports.UpdateHitObjectHandler = UpdateHitObjectHandler;
exports.UserActivity = UserActivity;
exports.Vec2 = Vec2;
exports.binarySearch = binarySearch;
exports.decodeCommands = decodeCommands;
exports.decodeUuid = decodeUuid;
exports.defaultHitSound = defaultHitSound;
exports.defaultHitSoundLayers = defaultHitSoundLayers;
exports.deserializeHitObject = deserializeHitObject;
exports.encodeCommands = encodeCommands;
exports.encodeUuid = encodeUuid;
exports.getCommandHandler = getCommandHandler;
exports.getSamples = getSamples;
exports.hitObjectId = hitObjectId;
exports.randomString = randomString;
exports.updateHitObject = updateHitObject;
//# sourceMappingURL=lib.cjs.map
