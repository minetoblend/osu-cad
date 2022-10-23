"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IVec2 = exports.Vec2 = exports.TimingInformation = exports.TimingPoint = exports.SliderControlPoint = exports.Slider = exports.Difficulty = exports.Beatmap = exports.Spinner = exports.HitCircle = exports.HitObject = exports.SliderControlPoints = exports.HitObjectOverrides = exports.HitObjectOverrideCommand = exports.DeleteTimingPoint = exports.UpdateTimingPoint = exports.CreateTimingPoint = exports.EditorState = exports.SelectHitObject = exports.HitObjectSelected = exports.DeleteHitObject = exports.UpdateHitObject = exports.CreateHitObject = exports.UserList = exports.UserInfo = exports.UserTick = exports.ServerTick = exports.ClientToServerMessage = exports.MultiServerToClientMessage = exports.ServerToClientMessage = exports.controlPointKindToJSON = exports.controlPointKindFromJSON = exports.ControlPointKind = exports.protobufPackage = void 0;
/* eslint-disable */
var long_1 = __importDefault(require("long"));
var minimal_1 = __importDefault(require("protobufjs/minimal"));
exports.protobufPackage = "proto.commands";
var ControlPointKind;
(function (ControlPointKind) {
    ControlPointKind[ControlPointKind["None"] = 0] = "None";
    ControlPointKind[ControlPointKind["Bezier"] = 1] = "Bezier";
    ControlPointKind[ControlPointKind["Circle"] = 2] = "Circle";
    ControlPointKind[ControlPointKind["Linear"] = 3] = "Linear";
    ControlPointKind[ControlPointKind["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ControlPointKind = exports.ControlPointKind || (exports.ControlPointKind = {}));
function controlPointKindFromJSON(object) {
    switch (object) {
        case 0:
        case "None":
            return ControlPointKind.None;
        case 1:
        case "Bezier":
            return ControlPointKind.Bezier;
        case 2:
        case "Circle":
            return ControlPointKind.Circle;
        case 3:
        case "Linear":
            return ControlPointKind.Linear;
        case -1:
        case "UNRECOGNIZED":
        default:
            return ControlPointKind.UNRECOGNIZED;
    }
}
exports.controlPointKindFromJSON = controlPointKindFromJSON;
function controlPointKindToJSON(object) {
    switch (object) {
        case ControlPointKind.None:
            return "None";
        case ControlPointKind.Bezier:
            return "Bezier";
        case ControlPointKind.Circle:
            return "Circle";
        case ControlPointKind.Linear:
            return "Linear";
        case ControlPointKind.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
exports.controlPointKindToJSON = controlPointKindToJSON;
function createBaseServerToClientMessage() {
    return { responseId: undefined, serverCommand: undefined };
}
exports.ServerToClientMessage = {
    encode: function (message, writer) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.responseId !== undefined) {
            writer.uint32(10).string(message.responseId);
        }
        if (((_a = message.serverCommand) === null || _a === void 0 ? void 0 : _a.$case) === "multiple") {
            exports.MultiServerToClientMessage.encode(message.serverCommand.multiple, writer.uint32(18).fork()).ldelim();
        }
        if (((_b = message.serverCommand) === null || _b === void 0 ? void 0 : _b.$case) === "heartbeat") {
            writer.uint32(24).uint32(message.serverCommand.heartbeat);
        }
        if (((_c = message.serverCommand) === null || _c === void 0 ? void 0 : _c.$case) === "userJoined") {
            exports.UserInfo.encode(message.serverCommand.userJoined, writer.uint32(34).fork()).ldelim();
        }
        if (((_d = message.serverCommand) === null || _d === void 0 ? void 0 : _d.$case) === "userLeft") {
            exports.UserInfo.encode(message.serverCommand.userLeft, writer.uint32(42).fork()).ldelim();
        }
        if (((_e = message.serverCommand) === null || _e === void 0 ? void 0 : _e.$case) === "tick") {
            exports.ServerTick.encode(message.serverCommand.tick, writer.uint32(50).fork()).ldelim();
        }
        if (((_f = message.serverCommand) === null || _f === void 0 ? void 0 : _f.$case) === "userList") {
            exports.UserList.encode(message.serverCommand.userList, writer.uint32(58).fork()).ldelim();
        }
        if (((_g = message.serverCommand) === null || _g === void 0 ? void 0 : _g.$case) === "ownId") {
            writer.uint32(64).uint64(message.serverCommand.ownId);
        }
        if (((_h = message.serverCommand) === null || _h === void 0 ? void 0 : _h.$case) === "hitObjectCreated") {
            exports.HitObject.encode(message.serverCommand.hitObjectCreated, writer.uint32(74).fork()).ldelim();
        }
        if (((_j = message.serverCommand) === null || _j === void 0 ? void 0 : _j.$case) === "hitObjectUpdated") {
            exports.HitObject.encode(message.serverCommand.hitObjectUpdated, writer.uint32(82).fork()).ldelim();
        }
        if (((_k = message.serverCommand) === null || _k === void 0 ? void 0 : _k.$case) === "hitObjectDeleted") {
            writer.uint32(88).uint32(message.serverCommand.hitObjectDeleted);
        }
        if (((_l = message.serverCommand) === null || _l === void 0 ? void 0 : _l.$case) === "hitObjectSelected") {
            exports.HitObjectSelected.encode(message.serverCommand.hitObjectSelected, writer.uint32(98).fork()).ldelim();
        }
        if (((_m = message.serverCommand) === null || _m === void 0 ? void 0 : _m.$case) === "state") {
            exports.EditorState.encode(message.serverCommand.state, writer.uint32(106).fork()).ldelim();
        }
        if (((_o = message.serverCommand) === null || _o === void 0 ? void 0 : _o.$case) === "timingPointCreated") {
            exports.TimingPoint.encode(message.serverCommand.timingPointCreated, writer.uint32(114).fork()).ldelim();
        }
        if (((_p = message.serverCommand) === null || _p === void 0 ? void 0 : _p.$case) === "timingPointUpdated") {
            exports.TimingPoint.encode(message.serverCommand.timingPointUpdated, writer.uint32(122).fork()).ldelim();
        }
        if (((_q = message.serverCommand) === null || _q === void 0 ? void 0 : _q.$case) === "timingPointDeleted") {
            writer.uint32(128).uint32(message.serverCommand.timingPointDeleted);
        }
        if (((_r = message.serverCommand) === null || _r === void 0 ? void 0 : _r.$case) === "hitObjectOverridden") {
            exports.HitObjectOverrideCommand.encode(message.serverCommand.hitObjectOverridden, writer.uint32(138).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseServerToClientMessage();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.responseId = reader.string();
                    break;
                case 2:
                    message.serverCommand = {
                        $case: "multiple",
                        multiple: exports.MultiServerToClientMessage.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.serverCommand = { $case: "heartbeat", heartbeat: reader.uint32() };
                    break;
                case 4:
                    message.serverCommand = { $case: "userJoined", userJoined: exports.UserInfo.decode(reader, reader.uint32()) };
                    break;
                case 5:
                    message.serverCommand = { $case: "userLeft", userLeft: exports.UserInfo.decode(reader, reader.uint32()) };
                    break;
                case 6:
                    message.serverCommand = { $case: "tick", tick: exports.ServerTick.decode(reader, reader.uint32()) };
                    break;
                case 7:
                    message.serverCommand = { $case: "userList", userList: exports.UserList.decode(reader, reader.uint32()) };
                    break;
                case 8:
                    message.serverCommand = { $case: "ownId", ownId: longToNumber(reader.uint64()) };
                    break;
                case 9:
                    message.serverCommand = {
                        $case: "hitObjectCreated",
                        hitObjectCreated: exports.HitObject.decode(reader, reader.uint32()),
                    };
                    break;
                case 10:
                    message.serverCommand = {
                        $case: "hitObjectUpdated",
                        hitObjectUpdated: exports.HitObject.decode(reader, reader.uint32()),
                    };
                    break;
                case 11:
                    message.serverCommand = { $case: "hitObjectDeleted", hitObjectDeleted: reader.uint32() };
                    break;
                case 12:
                    message.serverCommand = {
                        $case: "hitObjectSelected",
                        hitObjectSelected: exports.HitObjectSelected.decode(reader, reader.uint32()),
                    };
                    break;
                case 13:
                    message.serverCommand = { $case: "state", state: exports.EditorState.decode(reader, reader.uint32()) };
                    break;
                case 14:
                    message.serverCommand = {
                        $case: "timingPointCreated",
                        timingPointCreated: exports.TimingPoint.decode(reader, reader.uint32()),
                    };
                    break;
                case 15:
                    message.serverCommand = {
                        $case: "timingPointUpdated",
                        timingPointUpdated: exports.TimingPoint.decode(reader, reader.uint32()),
                    };
                    break;
                case 16:
                    message.serverCommand = { $case: "timingPointDeleted", timingPointDeleted: reader.uint32() };
                    break;
                case 17:
                    message.serverCommand = {
                        $case: "hitObjectOverridden",
                        hitObjectOverridden: exports.HitObjectOverrideCommand.decode(reader, reader.uint32()),
                    };
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            responseId: isSet(object.responseId) ? String(object.responseId) : undefined,
            serverCommand: isSet(object.multiple)
                ? { $case: "multiple", multiple: exports.MultiServerToClientMessage.fromJSON(object.multiple) }
                : isSet(object.heartbeat)
                    ? { $case: "heartbeat", heartbeat: Number(object.heartbeat) }
                    : isSet(object.userJoined)
                        ? { $case: "userJoined", userJoined: exports.UserInfo.fromJSON(object.userJoined) }
                        : isSet(object.userLeft)
                            ? { $case: "userLeft", userLeft: exports.UserInfo.fromJSON(object.userLeft) }
                            : isSet(object.tick)
                                ? { $case: "tick", tick: exports.ServerTick.fromJSON(object.tick) }
                                : isSet(object.userList)
                                    ? { $case: "userList", userList: exports.UserList.fromJSON(object.userList) }
                                    : isSet(object.ownId)
                                        ? { $case: "ownId", ownId: Number(object.ownId) }
                                        : isSet(object.hitObjectCreated)
                                            ? { $case: "hitObjectCreated", hitObjectCreated: exports.HitObject.fromJSON(object.hitObjectCreated) }
                                            : isSet(object.hitObjectUpdated)
                                                ? { $case: "hitObjectUpdated", hitObjectUpdated: exports.HitObject.fromJSON(object.hitObjectUpdated) }
                                                : isSet(object.hitObjectDeleted)
                                                    ? { $case: "hitObjectDeleted", hitObjectDeleted: Number(object.hitObjectDeleted) }
                                                    : isSet(object.hitObjectSelected)
                                                        ? { $case: "hitObjectSelected", hitObjectSelected: exports.HitObjectSelected.fromJSON(object.hitObjectSelected) }
                                                        : isSet(object.state)
                                                            ? { $case: "state", state: exports.EditorState.fromJSON(object.state) }
                                                            : isSet(object.timingPointCreated)
                                                                ? { $case: "timingPointCreated", timingPointCreated: exports.TimingPoint.fromJSON(object.timingPointCreated) }
                                                                : isSet(object.timingPointUpdated)
                                                                    ? { $case: "timingPointUpdated", timingPointUpdated: exports.TimingPoint.fromJSON(object.timingPointUpdated) }
                                                                    : isSet(object.timingPointDeleted)
                                                                        ? { $case: "timingPointDeleted", timingPointDeleted: Number(object.timingPointDeleted) }
                                                                        : isSet(object.hitObjectOverridden)
                                                                            ? {
                                                                                $case: "hitObjectOverridden",
                                                                                hitObjectOverridden: exports.HitObjectOverrideCommand.fromJSON(object.hitObjectOverridden),
                                                                            }
                                                                            : undefined,
        };
    },
    toJSON: function (message) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19;
        var obj = {};
        message.responseId !== undefined && (obj.responseId = message.responseId);
        ((_a = message.serverCommand) === null || _a === void 0 ? void 0 : _a.$case) === "multiple" && (obj.multiple = ((_b = message.serverCommand) === null || _b === void 0 ? void 0 : _b.multiple)
            ? exports.MultiServerToClientMessage.toJSON((_c = message.serverCommand) === null || _c === void 0 ? void 0 : _c.multiple)
            : undefined);
        ((_d = message.serverCommand) === null || _d === void 0 ? void 0 : _d.$case) === "heartbeat" && (obj.heartbeat = Math.round((_e = message.serverCommand) === null || _e === void 0 ? void 0 : _e.heartbeat));
        ((_f = message.serverCommand) === null || _f === void 0 ? void 0 : _f.$case) === "userJoined" && (obj.userJoined = ((_g = message.serverCommand) === null || _g === void 0 ? void 0 : _g.userJoined)
            ? exports.UserInfo.toJSON((_h = message.serverCommand) === null || _h === void 0 ? void 0 : _h.userJoined)
            : undefined);
        ((_j = message.serverCommand) === null || _j === void 0 ? void 0 : _j.$case) === "userLeft" &&
            (obj.userLeft = ((_k = message.serverCommand) === null || _k === void 0 ? void 0 : _k.userLeft) ? exports.UserInfo.toJSON((_l = message.serverCommand) === null || _l === void 0 ? void 0 : _l.userLeft) : undefined);
        ((_m = message.serverCommand) === null || _m === void 0 ? void 0 : _m.$case) === "tick" &&
            (obj.tick = ((_o = message.serverCommand) === null || _o === void 0 ? void 0 : _o.tick) ? exports.ServerTick.toJSON((_p = message.serverCommand) === null || _p === void 0 ? void 0 : _p.tick) : undefined);
        ((_q = message.serverCommand) === null || _q === void 0 ? void 0 : _q.$case) === "userList" &&
            (obj.userList = ((_r = message.serverCommand) === null || _r === void 0 ? void 0 : _r.userList) ? exports.UserList.toJSON((_s = message.serverCommand) === null || _s === void 0 ? void 0 : _s.userList) : undefined);
        ((_t = message.serverCommand) === null || _t === void 0 ? void 0 : _t.$case) === "ownId" && (obj.ownId = Math.round((_u = message.serverCommand) === null || _u === void 0 ? void 0 : _u.ownId));
        ((_v = message.serverCommand) === null || _v === void 0 ? void 0 : _v.$case) === "hitObjectCreated" &&
            (obj.hitObjectCreated = ((_w = message.serverCommand) === null || _w === void 0 ? void 0 : _w.hitObjectCreated)
                ? exports.HitObject.toJSON((_x = message.serverCommand) === null || _x === void 0 ? void 0 : _x.hitObjectCreated)
                : undefined);
        ((_y = message.serverCommand) === null || _y === void 0 ? void 0 : _y.$case) === "hitObjectUpdated" &&
            (obj.hitObjectUpdated = ((_z = message.serverCommand) === null || _z === void 0 ? void 0 : _z.hitObjectUpdated)
                ? exports.HitObject.toJSON((_0 = message.serverCommand) === null || _0 === void 0 ? void 0 : _0.hitObjectUpdated)
                : undefined);
        ((_1 = message.serverCommand) === null || _1 === void 0 ? void 0 : _1.$case) === "hitObjectDeleted" &&
            (obj.hitObjectDeleted = Math.round((_2 = message.serverCommand) === null || _2 === void 0 ? void 0 : _2.hitObjectDeleted));
        ((_3 = message.serverCommand) === null || _3 === void 0 ? void 0 : _3.$case) === "hitObjectSelected" &&
            (obj.hitObjectSelected = ((_4 = message.serverCommand) === null || _4 === void 0 ? void 0 : _4.hitObjectSelected)
                ? exports.HitObjectSelected.toJSON((_5 = message.serverCommand) === null || _5 === void 0 ? void 0 : _5.hitObjectSelected)
                : undefined);
        ((_6 = message.serverCommand) === null || _6 === void 0 ? void 0 : _6.$case) === "state" &&
            (obj.state = ((_7 = message.serverCommand) === null || _7 === void 0 ? void 0 : _7.state) ? exports.EditorState.toJSON((_8 = message.serverCommand) === null || _8 === void 0 ? void 0 : _8.state) : undefined);
        ((_9 = message.serverCommand) === null || _9 === void 0 ? void 0 : _9.$case) === "timingPointCreated" &&
            (obj.timingPointCreated = ((_10 = message.serverCommand) === null || _10 === void 0 ? void 0 : _10.timingPointCreated)
                ? exports.TimingPoint.toJSON((_11 = message.serverCommand) === null || _11 === void 0 ? void 0 : _11.timingPointCreated)
                : undefined);
        ((_12 = message.serverCommand) === null || _12 === void 0 ? void 0 : _12.$case) === "timingPointUpdated" &&
            (obj.timingPointUpdated = ((_13 = message.serverCommand) === null || _13 === void 0 ? void 0 : _13.timingPointUpdated)
                ? exports.TimingPoint.toJSON((_14 = message.serverCommand) === null || _14 === void 0 ? void 0 : _14.timingPointUpdated)
                : undefined);
        ((_15 = message.serverCommand) === null || _15 === void 0 ? void 0 : _15.$case) === "timingPointDeleted" &&
            (obj.timingPointDeleted = Math.round((_16 = message.serverCommand) === null || _16 === void 0 ? void 0 : _16.timingPointDeleted));
        ((_17 = message.serverCommand) === null || _17 === void 0 ? void 0 : _17.$case) === "hitObjectOverridden" &&
            (obj.hitObjectOverridden = ((_18 = message.serverCommand) === null || _18 === void 0 ? void 0 : _18.hitObjectOverridden)
                ? exports.HitObjectOverrideCommand.toJSON((_19 = message.serverCommand) === null || _19 === void 0 ? void 0 : _19.hitObjectOverridden)
                : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24;
        var message = createBaseServerToClientMessage();
        message.responseId = (_a = object.responseId) !== null && _a !== void 0 ? _a : undefined;
        if (((_b = object.serverCommand) === null || _b === void 0 ? void 0 : _b.$case) === "multiple" &&
            ((_c = object.serverCommand) === null || _c === void 0 ? void 0 : _c.multiple) !== undefined &&
            ((_d = object.serverCommand) === null || _d === void 0 ? void 0 : _d.multiple) !== null) {
            message.serverCommand = {
                $case: "multiple",
                multiple: exports.MultiServerToClientMessage.fromPartial(object.serverCommand.multiple),
            };
        }
        if (((_e = object.serverCommand) === null || _e === void 0 ? void 0 : _e.$case) === "heartbeat" &&
            ((_f = object.serverCommand) === null || _f === void 0 ? void 0 : _f.heartbeat) !== undefined &&
            ((_g = object.serverCommand) === null || _g === void 0 ? void 0 : _g.heartbeat) !== null) {
            message.serverCommand = { $case: "heartbeat", heartbeat: object.serverCommand.heartbeat };
        }
        if (((_h = object.serverCommand) === null || _h === void 0 ? void 0 : _h.$case) === "userJoined" &&
            ((_j = object.serverCommand) === null || _j === void 0 ? void 0 : _j.userJoined) !== undefined &&
            ((_k = object.serverCommand) === null || _k === void 0 ? void 0 : _k.userJoined) !== null) {
            message.serverCommand = {
                $case: "userJoined",
                userJoined: exports.UserInfo.fromPartial(object.serverCommand.userJoined),
            };
        }
        if (((_l = object.serverCommand) === null || _l === void 0 ? void 0 : _l.$case) === "userLeft" &&
            ((_m = object.serverCommand) === null || _m === void 0 ? void 0 : _m.userLeft) !== undefined &&
            ((_o = object.serverCommand) === null || _o === void 0 ? void 0 : _o.userLeft) !== null) {
            message.serverCommand = { $case: "userLeft", userLeft: exports.UserInfo.fromPartial(object.serverCommand.userLeft) };
        }
        if (((_p = object.serverCommand) === null || _p === void 0 ? void 0 : _p.$case) === "tick" &&
            ((_q = object.serverCommand) === null || _q === void 0 ? void 0 : _q.tick) !== undefined &&
            ((_r = object.serverCommand) === null || _r === void 0 ? void 0 : _r.tick) !== null) {
            message.serverCommand = { $case: "tick", tick: exports.ServerTick.fromPartial(object.serverCommand.tick) };
        }
        if (((_s = object.serverCommand) === null || _s === void 0 ? void 0 : _s.$case) === "userList" &&
            ((_t = object.serverCommand) === null || _t === void 0 ? void 0 : _t.userList) !== undefined &&
            ((_u = object.serverCommand) === null || _u === void 0 ? void 0 : _u.userList) !== null) {
            message.serverCommand = { $case: "userList", userList: exports.UserList.fromPartial(object.serverCommand.userList) };
        }
        if (((_v = object.serverCommand) === null || _v === void 0 ? void 0 : _v.$case) === "ownId" &&
            ((_w = object.serverCommand) === null || _w === void 0 ? void 0 : _w.ownId) !== undefined &&
            ((_x = object.serverCommand) === null || _x === void 0 ? void 0 : _x.ownId) !== null) {
            message.serverCommand = { $case: "ownId", ownId: object.serverCommand.ownId };
        }
        if (((_y = object.serverCommand) === null || _y === void 0 ? void 0 : _y.$case) === "hitObjectCreated" &&
            ((_z = object.serverCommand) === null || _z === void 0 ? void 0 : _z.hitObjectCreated) !== undefined &&
            ((_0 = object.serverCommand) === null || _0 === void 0 ? void 0 : _0.hitObjectCreated) !== null) {
            message.serverCommand = {
                $case: "hitObjectCreated",
                hitObjectCreated: exports.HitObject.fromPartial(object.serverCommand.hitObjectCreated),
            };
        }
        if (((_1 = object.serverCommand) === null || _1 === void 0 ? void 0 : _1.$case) === "hitObjectUpdated" &&
            ((_2 = object.serverCommand) === null || _2 === void 0 ? void 0 : _2.hitObjectUpdated) !== undefined &&
            ((_3 = object.serverCommand) === null || _3 === void 0 ? void 0 : _3.hitObjectUpdated) !== null) {
            message.serverCommand = {
                $case: "hitObjectUpdated",
                hitObjectUpdated: exports.HitObject.fromPartial(object.serverCommand.hitObjectUpdated),
            };
        }
        if (((_4 = object.serverCommand) === null || _4 === void 0 ? void 0 : _4.$case) === "hitObjectDeleted" &&
            ((_5 = object.serverCommand) === null || _5 === void 0 ? void 0 : _5.hitObjectDeleted) !== undefined &&
            ((_6 = object.serverCommand) === null || _6 === void 0 ? void 0 : _6.hitObjectDeleted) !== null) {
            message.serverCommand = { $case: "hitObjectDeleted", hitObjectDeleted: object.serverCommand.hitObjectDeleted };
        }
        if (((_7 = object.serverCommand) === null || _7 === void 0 ? void 0 : _7.$case) === "hitObjectSelected" &&
            ((_8 = object.serverCommand) === null || _8 === void 0 ? void 0 : _8.hitObjectSelected) !== undefined &&
            ((_9 = object.serverCommand) === null || _9 === void 0 ? void 0 : _9.hitObjectSelected) !== null) {
            message.serverCommand = {
                $case: "hitObjectSelected",
                hitObjectSelected: exports.HitObjectSelected.fromPartial(object.serverCommand.hitObjectSelected),
            };
        }
        if (((_10 = object.serverCommand) === null || _10 === void 0 ? void 0 : _10.$case) === "state" &&
            ((_11 = object.serverCommand) === null || _11 === void 0 ? void 0 : _11.state) !== undefined &&
            ((_12 = object.serverCommand) === null || _12 === void 0 ? void 0 : _12.state) !== null) {
            message.serverCommand = { $case: "state", state: exports.EditorState.fromPartial(object.serverCommand.state) };
        }
        if (((_13 = object.serverCommand) === null || _13 === void 0 ? void 0 : _13.$case) === "timingPointCreated" &&
            ((_14 = object.serverCommand) === null || _14 === void 0 ? void 0 : _14.timingPointCreated) !== undefined &&
            ((_15 = object.serverCommand) === null || _15 === void 0 ? void 0 : _15.timingPointCreated) !== null) {
            message.serverCommand = {
                $case: "timingPointCreated",
                timingPointCreated: exports.TimingPoint.fromPartial(object.serverCommand.timingPointCreated),
            };
        }
        if (((_16 = object.serverCommand) === null || _16 === void 0 ? void 0 : _16.$case) === "timingPointUpdated" &&
            ((_17 = object.serverCommand) === null || _17 === void 0 ? void 0 : _17.timingPointUpdated) !== undefined &&
            ((_18 = object.serverCommand) === null || _18 === void 0 ? void 0 : _18.timingPointUpdated) !== null) {
            message.serverCommand = {
                $case: "timingPointUpdated",
                timingPointUpdated: exports.TimingPoint.fromPartial(object.serverCommand.timingPointUpdated),
            };
        }
        if (((_19 = object.serverCommand) === null || _19 === void 0 ? void 0 : _19.$case) === "timingPointDeleted" &&
            ((_20 = object.serverCommand) === null || _20 === void 0 ? void 0 : _20.timingPointDeleted) !== undefined &&
            ((_21 = object.serverCommand) === null || _21 === void 0 ? void 0 : _21.timingPointDeleted) !== null) {
            message.serverCommand = {
                $case: "timingPointDeleted",
                timingPointDeleted: object.serverCommand.timingPointDeleted,
            };
        }
        if (((_22 = object.serverCommand) === null || _22 === void 0 ? void 0 : _22.$case) === "hitObjectOverridden" &&
            ((_23 = object.serverCommand) === null || _23 === void 0 ? void 0 : _23.hitObjectOverridden) !== undefined &&
            ((_24 = object.serverCommand) === null || _24 === void 0 ? void 0 : _24.hitObjectOverridden) !== null) {
            message.serverCommand = {
                $case: "hitObjectOverridden",
                hitObjectOverridden: exports.HitObjectOverrideCommand.fromPartial(object.serverCommand.hitObjectOverridden),
            };
        }
        return message;
    },
};
function createBaseMultiServerToClientMessage() {
    return { messages: [] };
}
exports.MultiServerToClientMessage = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        for (var _i = 0, _a = message.messages; _i < _a.length; _i++) {
            var v = _a[_i];
            exports.ServerToClientMessage.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseMultiServerToClientMessage();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.messages.push(exports.ServerToClientMessage.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            messages: Array.isArray(object === null || object === void 0 ? void 0 : object.messages)
                ? object.messages.map(function (e) { return exports.ServerToClientMessage.fromJSON(e); })
                : [],
        };
    },
    toJSON: function (message) {
        var obj = {};
        if (message.messages) {
            obj.messages = message.messages.map(function (e) { return e ? exports.ServerToClientMessage.toJSON(e) : undefined; });
        }
        else {
            obj.messages = [];
        }
        return obj;
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseMultiServerToClientMessage();
        message.messages = ((_a = object.messages) === null || _a === void 0 ? void 0 : _a.map(function (e) { return exports.ServerToClientMessage.fromPartial(e); })) || [];
        return message;
    },
};
function createBaseClientToServerMessage() {
    return { responseId: undefined, clientCommand: undefined };
}
exports.ClientToServerMessage = {
    encode: function (message, writer) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.responseId !== undefined) {
            writer.uint32(10).string(message.responseId);
        }
        if (((_a = message.clientCommand) === null || _a === void 0 ? void 0 : _a.$case) === "cursorPos") {
            exports.Vec2.encode(message.clientCommand.cursorPos, writer.uint32(26).fork()).ldelim();
        }
        if (((_b = message.clientCommand) === null || _b === void 0 ? void 0 : _b.$case) === "currentTime") {
            writer.uint32(32).int32(message.clientCommand.currentTime);
        }
        if (((_c = message.clientCommand) === null || _c === void 0 ? void 0 : _c.$case) === "selectHitObject") {
            exports.SelectHitObject.encode(message.clientCommand.selectHitObject, writer.uint32(42).fork()).ldelim();
        }
        if (((_d = message.clientCommand) === null || _d === void 0 ? void 0 : _d.$case) === "createHitObject") {
            exports.CreateHitObject.encode(message.clientCommand.createHitObject, writer.uint32(50).fork()).ldelim();
        }
        if (((_e = message.clientCommand) === null || _e === void 0 ? void 0 : _e.$case) === "updateHitObject") {
            exports.UpdateHitObject.encode(message.clientCommand.updateHitObject, writer.uint32(58).fork()).ldelim();
        }
        if (((_f = message.clientCommand) === null || _f === void 0 ? void 0 : _f.$case) === "deleteHitObject") {
            exports.DeleteHitObject.encode(message.clientCommand.deleteHitObject, writer.uint32(66).fork()).ldelim();
        }
        if (((_g = message.clientCommand) === null || _g === void 0 ? void 0 : _g.$case) === "createTimingPoint") {
            exports.CreateTimingPoint.encode(message.clientCommand.createTimingPoint, writer.uint32(74).fork()).ldelim();
        }
        if (((_h = message.clientCommand) === null || _h === void 0 ? void 0 : _h.$case) === "updateTimingPoint") {
            exports.UpdateTimingPoint.encode(message.clientCommand.updateTimingPoint, writer.uint32(82).fork()).ldelim();
        }
        if (((_j = message.clientCommand) === null || _j === void 0 ? void 0 : _j.$case) === "deleteTimingPoint") {
            exports.DeleteTimingPoint.encode(message.clientCommand.deleteTimingPoint, writer.uint32(90).fork()).ldelim();
        }
        if (((_k = message.clientCommand) === null || _k === void 0 ? void 0 : _k.$case) === "setHitObjectOverrides") {
            exports.HitObjectOverrideCommand.encode(message.clientCommand.setHitObjectOverrides, writer.uint32(138).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseClientToServerMessage();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.responseId = reader.string();
                    break;
                case 3:
                    message.clientCommand = { $case: "cursorPos", cursorPos: exports.Vec2.decode(reader, reader.uint32()) };
                    break;
                case 4:
                    message.clientCommand = { $case: "currentTime", currentTime: reader.int32() };
                    break;
                case 5:
                    message.clientCommand = {
                        $case: "selectHitObject",
                        selectHitObject: exports.SelectHitObject.decode(reader, reader.uint32()),
                    };
                    break;
                case 6:
                    message.clientCommand = {
                        $case: "createHitObject",
                        createHitObject: exports.CreateHitObject.decode(reader, reader.uint32()),
                    };
                    break;
                case 7:
                    message.clientCommand = {
                        $case: "updateHitObject",
                        updateHitObject: exports.UpdateHitObject.decode(reader, reader.uint32()),
                    };
                    break;
                case 8:
                    message.clientCommand = {
                        $case: "deleteHitObject",
                        deleteHitObject: exports.DeleteHitObject.decode(reader, reader.uint32()),
                    };
                    break;
                case 9:
                    message.clientCommand = {
                        $case: "createTimingPoint",
                        createTimingPoint: exports.CreateTimingPoint.decode(reader, reader.uint32()),
                    };
                    break;
                case 10:
                    message.clientCommand = {
                        $case: "updateTimingPoint",
                        updateTimingPoint: exports.UpdateTimingPoint.decode(reader, reader.uint32()),
                    };
                    break;
                case 11:
                    message.clientCommand = {
                        $case: "deleteTimingPoint",
                        deleteTimingPoint: exports.DeleteTimingPoint.decode(reader, reader.uint32()),
                    };
                    break;
                case 17:
                    message.clientCommand = {
                        $case: "setHitObjectOverrides",
                        setHitObjectOverrides: exports.HitObjectOverrideCommand.decode(reader, reader.uint32()),
                    };
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            responseId: isSet(object.responseId) ? String(object.responseId) : undefined,
            clientCommand: isSet(object.cursorPos)
                ? { $case: "cursorPos", cursorPos: exports.Vec2.fromJSON(object.cursorPos) }
                : isSet(object.currentTime)
                    ? { $case: "currentTime", currentTime: Number(object.currentTime) }
                    : isSet(object.selectHitObject)
                        ? { $case: "selectHitObject", selectHitObject: exports.SelectHitObject.fromJSON(object.selectHitObject) }
                        : isSet(object.createHitObject)
                            ? { $case: "createHitObject", createHitObject: exports.CreateHitObject.fromJSON(object.createHitObject) }
                            : isSet(object.updateHitObject)
                                ? { $case: "updateHitObject", updateHitObject: exports.UpdateHitObject.fromJSON(object.updateHitObject) }
                                : isSet(object.deleteHitObject)
                                    ? { $case: "deleteHitObject", deleteHitObject: exports.DeleteHitObject.fromJSON(object.deleteHitObject) }
                                    : isSet(object.createTimingPoint)
                                        ? { $case: "createTimingPoint", createTimingPoint: exports.CreateTimingPoint.fromJSON(object.createTimingPoint) }
                                        : isSet(object.updateTimingPoint)
                                            ? { $case: "updateTimingPoint", updateTimingPoint: exports.UpdateTimingPoint.fromJSON(object.updateTimingPoint) }
                                            : isSet(object.deleteTimingPoint)
                                                ? { $case: "deleteTimingPoint", deleteTimingPoint: exports.DeleteTimingPoint.fromJSON(object.deleteTimingPoint) }
                                                : isSet(object.setHitObjectOverrides)
                                                    ? {
                                                        $case: "setHitObjectOverrides",
                                                        setHitObjectOverrides: exports.HitObjectOverrideCommand.fromJSON(object.setHitObjectOverrides),
                                                    }
                                                    : undefined,
        };
    },
    toJSON: function (message) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
        var obj = {};
        message.responseId !== undefined && (obj.responseId = message.responseId);
        ((_a = message.clientCommand) === null || _a === void 0 ? void 0 : _a.$case) === "cursorPos" &&
            (obj.cursorPos = ((_b = message.clientCommand) === null || _b === void 0 ? void 0 : _b.cursorPos) ? exports.Vec2.toJSON((_c = message.clientCommand) === null || _c === void 0 ? void 0 : _c.cursorPos) : undefined);
        ((_d = message.clientCommand) === null || _d === void 0 ? void 0 : _d.$case) === "currentTime" &&
            (obj.currentTime = Math.round((_e = message.clientCommand) === null || _e === void 0 ? void 0 : _e.currentTime));
        ((_f = message.clientCommand) === null || _f === void 0 ? void 0 : _f.$case) === "selectHitObject" && (obj.selectHitObject = ((_g = message.clientCommand) === null || _g === void 0 ? void 0 : _g.selectHitObject)
            ? exports.SelectHitObject.toJSON((_h = message.clientCommand) === null || _h === void 0 ? void 0 : _h.selectHitObject)
            : undefined);
        ((_j = message.clientCommand) === null || _j === void 0 ? void 0 : _j.$case) === "createHitObject" && (obj.createHitObject = ((_k = message.clientCommand) === null || _k === void 0 ? void 0 : _k.createHitObject)
            ? exports.CreateHitObject.toJSON((_l = message.clientCommand) === null || _l === void 0 ? void 0 : _l.createHitObject)
            : undefined);
        ((_m = message.clientCommand) === null || _m === void 0 ? void 0 : _m.$case) === "updateHitObject" && (obj.updateHitObject = ((_o = message.clientCommand) === null || _o === void 0 ? void 0 : _o.updateHitObject)
            ? exports.UpdateHitObject.toJSON((_p = message.clientCommand) === null || _p === void 0 ? void 0 : _p.updateHitObject)
            : undefined);
        ((_q = message.clientCommand) === null || _q === void 0 ? void 0 : _q.$case) === "deleteHitObject" && (obj.deleteHitObject = ((_r = message.clientCommand) === null || _r === void 0 ? void 0 : _r.deleteHitObject)
            ? exports.DeleteHitObject.toJSON((_s = message.clientCommand) === null || _s === void 0 ? void 0 : _s.deleteHitObject)
            : undefined);
        ((_t = message.clientCommand) === null || _t === void 0 ? void 0 : _t.$case) === "createTimingPoint" &&
            (obj.createTimingPoint = ((_u = message.clientCommand) === null || _u === void 0 ? void 0 : _u.createTimingPoint)
                ? exports.CreateTimingPoint.toJSON((_v = message.clientCommand) === null || _v === void 0 ? void 0 : _v.createTimingPoint)
                : undefined);
        ((_w = message.clientCommand) === null || _w === void 0 ? void 0 : _w.$case) === "updateTimingPoint" &&
            (obj.updateTimingPoint = ((_x = message.clientCommand) === null || _x === void 0 ? void 0 : _x.updateTimingPoint)
                ? exports.UpdateTimingPoint.toJSON((_y = message.clientCommand) === null || _y === void 0 ? void 0 : _y.updateTimingPoint)
                : undefined);
        ((_z = message.clientCommand) === null || _z === void 0 ? void 0 : _z.$case) === "deleteTimingPoint" &&
            (obj.deleteTimingPoint = ((_0 = message.clientCommand) === null || _0 === void 0 ? void 0 : _0.deleteTimingPoint)
                ? exports.DeleteTimingPoint.toJSON((_1 = message.clientCommand) === null || _1 === void 0 ? void 0 : _1.deleteTimingPoint)
                : undefined);
        ((_2 = message.clientCommand) === null || _2 === void 0 ? void 0 : _2.$case) === "setHitObjectOverrides" &&
            (obj.setHitObjectOverrides = ((_3 = message.clientCommand) === null || _3 === void 0 ? void 0 : _3.setHitObjectOverrides)
                ? exports.HitObjectOverrideCommand.toJSON((_4 = message.clientCommand) === null || _4 === void 0 ? void 0 : _4.setHitObjectOverrides)
                : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
        var message = createBaseClientToServerMessage();
        message.responseId = (_a = object.responseId) !== null && _a !== void 0 ? _a : undefined;
        if (((_b = object.clientCommand) === null || _b === void 0 ? void 0 : _b.$case) === "cursorPos" &&
            ((_c = object.clientCommand) === null || _c === void 0 ? void 0 : _c.cursorPos) !== undefined &&
            ((_d = object.clientCommand) === null || _d === void 0 ? void 0 : _d.cursorPos) !== null) {
            message.clientCommand = { $case: "cursorPos", cursorPos: exports.Vec2.fromPartial(object.clientCommand.cursorPos) };
        }
        if (((_e = object.clientCommand) === null || _e === void 0 ? void 0 : _e.$case) === "currentTime" &&
            ((_f = object.clientCommand) === null || _f === void 0 ? void 0 : _f.currentTime) !== undefined &&
            ((_g = object.clientCommand) === null || _g === void 0 ? void 0 : _g.currentTime) !== null) {
            message.clientCommand = { $case: "currentTime", currentTime: object.clientCommand.currentTime };
        }
        if (((_h = object.clientCommand) === null || _h === void 0 ? void 0 : _h.$case) === "selectHitObject" &&
            ((_j = object.clientCommand) === null || _j === void 0 ? void 0 : _j.selectHitObject) !== undefined &&
            ((_k = object.clientCommand) === null || _k === void 0 ? void 0 : _k.selectHitObject) !== null) {
            message.clientCommand = {
                $case: "selectHitObject",
                selectHitObject: exports.SelectHitObject.fromPartial(object.clientCommand.selectHitObject),
            };
        }
        if (((_l = object.clientCommand) === null || _l === void 0 ? void 0 : _l.$case) === "createHitObject" &&
            ((_m = object.clientCommand) === null || _m === void 0 ? void 0 : _m.createHitObject) !== undefined &&
            ((_o = object.clientCommand) === null || _o === void 0 ? void 0 : _o.createHitObject) !== null) {
            message.clientCommand = {
                $case: "createHitObject",
                createHitObject: exports.CreateHitObject.fromPartial(object.clientCommand.createHitObject),
            };
        }
        if (((_p = object.clientCommand) === null || _p === void 0 ? void 0 : _p.$case) === "updateHitObject" &&
            ((_q = object.clientCommand) === null || _q === void 0 ? void 0 : _q.updateHitObject) !== undefined &&
            ((_r = object.clientCommand) === null || _r === void 0 ? void 0 : _r.updateHitObject) !== null) {
            message.clientCommand = {
                $case: "updateHitObject",
                updateHitObject: exports.UpdateHitObject.fromPartial(object.clientCommand.updateHitObject),
            };
        }
        if (((_s = object.clientCommand) === null || _s === void 0 ? void 0 : _s.$case) === "deleteHitObject" &&
            ((_t = object.clientCommand) === null || _t === void 0 ? void 0 : _t.deleteHitObject) !== undefined &&
            ((_u = object.clientCommand) === null || _u === void 0 ? void 0 : _u.deleteHitObject) !== null) {
            message.clientCommand = {
                $case: "deleteHitObject",
                deleteHitObject: exports.DeleteHitObject.fromPartial(object.clientCommand.deleteHitObject),
            };
        }
        if (((_v = object.clientCommand) === null || _v === void 0 ? void 0 : _v.$case) === "createTimingPoint" &&
            ((_w = object.clientCommand) === null || _w === void 0 ? void 0 : _w.createTimingPoint) !== undefined &&
            ((_x = object.clientCommand) === null || _x === void 0 ? void 0 : _x.createTimingPoint) !== null) {
            message.clientCommand = {
                $case: "createTimingPoint",
                createTimingPoint: exports.CreateTimingPoint.fromPartial(object.clientCommand.createTimingPoint),
            };
        }
        if (((_y = object.clientCommand) === null || _y === void 0 ? void 0 : _y.$case) === "updateTimingPoint" &&
            ((_z = object.clientCommand) === null || _z === void 0 ? void 0 : _z.updateTimingPoint) !== undefined &&
            ((_0 = object.clientCommand) === null || _0 === void 0 ? void 0 : _0.updateTimingPoint) !== null) {
            message.clientCommand = {
                $case: "updateTimingPoint",
                updateTimingPoint: exports.UpdateTimingPoint.fromPartial(object.clientCommand.updateTimingPoint),
            };
        }
        if (((_1 = object.clientCommand) === null || _1 === void 0 ? void 0 : _1.$case) === "deleteTimingPoint" &&
            ((_2 = object.clientCommand) === null || _2 === void 0 ? void 0 : _2.deleteTimingPoint) !== undefined &&
            ((_3 = object.clientCommand) === null || _3 === void 0 ? void 0 : _3.deleteTimingPoint) !== null) {
            message.clientCommand = {
                $case: "deleteTimingPoint",
                deleteTimingPoint: exports.DeleteTimingPoint.fromPartial(object.clientCommand.deleteTimingPoint),
            };
        }
        if (((_4 = object.clientCommand) === null || _4 === void 0 ? void 0 : _4.$case) === "setHitObjectOverrides" &&
            ((_5 = object.clientCommand) === null || _5 === void 0 ? void 0 : _5.setHitObjectOverrides) !== undefined &&
            ((_6 = object.clientCommand) === null || _6 === void 0 ? void 0 : _6.setHitObjectOverrides) !== null) {
            message.clientCommand = {
                $case: "setHitObjectOverrides",
                setHitObjectOverrides: exports.HitObjectOverrideCommand.fromPartial(object.clientCommand.setHitObjectOverrides),
            };
        }
        return message;
    },
};
function createBaseServerTick() {
    return { userTicks: [] };
}
exports.ServerTick = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        for (var _i = 0, _a = message.userTicks; _i < _a.length; _i++) {
            var v = _a[_i];
            exports.UserTick.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseServerTick();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.userTicks.push(exports.UserTick.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            userTicks: Array.isArray(object === null || object === void 0 ? void 0 : object.userTicks) ? object.userTicks.map(function (e) { return exports.UserTick.fromJSON(e); }) : [],
        };
    },
    toJSON: function (message) {
        var obj = {};
        if (message.userTicks) {
            obj.userTicks = message.userTicks.map(function (e) { return e ? exports.UserTick.toJSON(e) : undefined; });
        }
        else {
            obj.userTicks = [];
        }
        return obj;
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseServerTick();
        message.userTicks = ((_a = object.userTicks) === null || _a === void 0 ? void 0 : _a.map(function (e) { return exports.UserTick.fromPartial(e); })) || [];
        return message;
    },
};
function createBaseUserTick() {
    return { id: 0, cursorPos: undefined, currentTime: 0 };
}
exports.UserTick = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.id !== 0) {
            writer.uint32(8).uint64(message.id);
        }
        if (message.cursorPos !== undefined) {
            exports.Vec2.encode(message.cursorPos, writer.uint32(18).fork()).ldelim();
        }
        if (message.currentTime !== 0) {
            writer.uint32(24).int32(message.currentTime);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseUserTick();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = longToNumber(reader.uint64());
                    break;
                case 2:
                    message.cursorPos = exports.Vec2.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.currentTime = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            id: isSet(object.id) ? Number(object.id) : 0,
            cursorPos: isSet(object.cursorPos) ? exports.Vec2.fromJSON(object.cursorPos) : undefined,
            currentTime: isSet(object.currentTime) ? Number(object.currentTime) : 0,
        };
    },
    toJSON: function (message) {
        var obj = {};
        message.id !== undefined && (obj.id = Math.round(message.id));
        message.cursorPos !== undefined && (obj.cursorPos = message.cursorPos ? exports.Vec2.toJSON(message.cursorPos) : undefined);
        message.currentTime !== undefined && (obj.currentTime = Math.round(message.currentTime));
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b;
        var message = createBaseUserTick();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : 0;
        message.cursorPos = (object.cursorPos !== undefined && object.cursorPos !== null)
            ? exports.Vec2.fromPartial(object.cursorPos)
            : undefined;
        message.currentTime = (_b = object.currentTime) !== null && _b !== void 0 ? _b : 0;
        return message;
    },
};
function createBaseUserInfo() {
    return { id: 0, displayName: "" };
}
exports.UserInfo = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.id !== 0) {
            writer.uint32(8).uint64(message.id);
        }
        if (message.displayName !== "") {
            writer.uint32(18).string(message.displayName);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseUserInfo();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = longToNumber(reader.uint64());
                    break;
                case 2:
                    message.displayName = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            id: isSet(object.id) ? Number(object.id) : 0,
            displayName: isSet(object.displayName) ? String(object.displayName) : "",
        };
    },
    toJSON: function (message) {
        var obj = {};
        message.id !== undefined && (obj.id = Math.round(message.id));
        message.displayName !== undefined && (obj.displayName = message.displayName);
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b;
        var message = createBaseUserInfo();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : 0;
        message.displayName = (_b = object.displayName) !== null && _b !== void 0 ? _b : "";
        return message;
    },
};
function createBaseUserList() {
    return { users: [] };
}
exports.UserList = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        for (var _i = 0, _a = message.users; _i < _a.length; _i++) {
            var v = _a[_i];
            exports.UserInfo.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseUserList();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.users.push(exports.UserInfo.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return { users: Array.isArray(object === null || object === void 0 ? void 0 : object.users) ? object.users.map(function (e) { return exports.UserInfo.fromJSON(e); }) : [] };
    },
    toJSON: function (message) {
        var obj = {};
        if (message.users) {
            obj.users = message.users.map(function (e) { return e ? exports.UserInfo.toJSON(e) : undefined; });
        }
        else {
            obj.users = [];
        }
        return obj;
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseUserList();
        message.users = ((_a = object.users) === null || _a === void 0 ? void 0 : _a.map(function (e) { return exports.UserInfo.fromPartial(e); })) || [];
        return message;
    },
};
function createBaseCreateHitObject() {
    return { hitObject: undefined };
}
exports.CreateHitObject = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.hitObject !== undefined) {
            exports.HitObject.encode(message.hitObject, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseCreateHitObject();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hitObject = exports.HitObject.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return { hitObject: isSet(object.hitObject) ? exports.HitObject.fromJSON(object.hitObject) : undefined };
    },
    toJSON: function (message) {
        var obj = {};
        message.hitObject !== undefined &&
            (obj.hitObject = message.hitObject ? exports.HitObject.toJSON(message.hitObject) : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var message = createBaseCreateHitObject();
        message.hitObject = (object.hitObject !== undefined && object.hitObject !== null)
            ? exports.HitObject.fromPartial(object.hitObject)
            : undefined;
        return message;
    },
};
function createBaseUpdateHitObject() {
    return { hitObject: undefined };
}
exports.UpdateHitObject = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.hitObject !== undefined) {
            exports.HitObject.encode(message.hitObject, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseUpdateHitObject();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hitObject = exports.HitObject.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return { hitObject: isSet(object.hitObject) ? exports.HitObject.fromJSON(object.hitObject) : undefined };
    },
    toJSON: function (message) {
        var obj = {};
        message.hitObject !== undefined &&
            (obj.hitObject = message.hitObject ? exports.HitObject.toJSON(message.hitObject) : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var message = createBaseUpdateHitObject();
        message.hitObject = (object.hitObject !== undefined && object.hitObject !== null)
            ? exports.HitObject.fromPartial(object.hitObject)
            : undefined;
        return message;
    },
};
function createBaseDeleteHitObject() {
    return { ids: [] };
}
exports.DeleteHitObject = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        writer.uint32(10).fork();
        for (var _i = 0, _a = message.ids; _i < _a.length; _i++) {
            var v = _a[_i];
            writer.uint32(v);
        }
        writer.ldelim();
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseDeleteHitObject();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.ids.push(reader.uint32());
                        }
                    }
                    else {
                        message.ids.push(reader.uint32());
                    }
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return { ids: Array.isArray(object === null || object === void 0 ? void 0 : object.ids) ? object.ids.map(function (e) { return Number(e); }) : [] };
    },
    toJSON: function (message) {
        var obj = {};
        if (message.ids) {
            obj.ids = message.ids.map(function (e) { return Math.round(e); });
        }
        else {
            obj.ids = [];
        }
        return obj;
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseDeleteHitObject();
        message.ids = ((_a = object.ids) === null || _a === void 0 ? void 0 : _a.map(function (e) { return e; })) || [];
        return message;
    },
};
function createBaseHitObjectSelected() {
    return { ids: [], selectedBy: undefined };
}
exports.HitObjectSelected = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        writer.uint32(10).fork();
        for (var _i = 0, _a = message.ids; _i < _a.length; _i++) {
            var v = _a[_i];
            writer.uint32(v);
        }
        writer.ldelim();
        if (message.selectedBy !== undefined) {
            writer.uint32(16).uint64(message.selectedBy);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseHitObjectSelected();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.ids.push(reader.uint32());
                        }
                    }
                    else {
                        message.ids.push(reader.uint32());
                    }
                    break;
                case 2:
                    message.selectedBy = longToNumber(reader.uint64());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            ids: Array.isArray(object === null || object === void 0 ? void 0 : object.ids) ? object.ids.map(function (e) { return Number(e); }) : [],
            selectedBy: isSet(object.selectedBy) ? Number(object.selectedBy) : undefined,
        };
    },
    toJSON: function (message) {
        var obj = {};
        if (message.ids) {
            obj.ids = message.ids.map(function (e) { return Math.round(e); });
        }
        else {
            obj.ids = [];
        }
        message.selectedBy !== undefined && (obj.selectedBy = Math.round(message.selectedBy));
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b;
        var message = createBaseHitObjectSelected();
        message.ids = ((_a = object.ids) === null || _a === void 0 ? void 0 : _a.map(function (e) { return e; })) || [];
        message.selectedBy = (_b = object.selectedBy) !== null && _b !== void 0 ? _b : undefined;
        return message;
    },
};
function createBaseSelectHitObject() {
    return { ids: [], selected: false, unique: false };
}
exports.SelectHitObject = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        writer.uint32(10).fork();
        for (var _i = 0, _a = message.ids; _i < _a.length; _i++) {
            var v = _a[_i];
            writer.uint32(v);
        }
        writer.ldelim();
        if (message.selected === true) {
            writer.uint32(16).bool(message.selected);
        }
        if (message.unique === true) {
            writer.uint32(24).bool(message.unique);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseSelectHitObject();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.ids.push(reader.uint32());
                        }
                    }
                    else {
                        message.ids.push(reader.uint32());
                    }
                    break;
                case 2:
                    message.selected = reader.bool();
                    break;
                case 3:
                    message.unique = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            ids: Array.isArray(object === null || object === void 0 ? void 0 : object.ids) ? object.ids.map(function (e) { return Number(e); }) : [],
            selected: isSet(object.selected) ? Boolean(object.selected) : false,
            unique: isSet(object.unique) ? Boolean(object.unique) : false,
        };
    },
    toJSON: function (message) {
        var obj = {};
        if (message.ids) {
            obj.ids = message.ids.map(function (e) { return Math.round(e); });
        }
        else {
            obj.ids = [];
        }
        message.selected !== undefined && (obj.selected = message.selected);
        message.unique !== undefined && (obj.unique = message.unique);
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b, _c;
        var message = createBaseSelectHitObject();
        message.ids = ((_a = object.ids) === null || _a === void 0 ? void 0 : _a.map(function (e) { return e; })) || [];
        message.selected = (_b = object.selected) !== null && _b !== void 0 ? _b : false;
        message.unique = (_c = object.unique) !== null && _c !== void 0 ? _c : false;
        return message;
    },
};
function createBaseEditorState() {
    return { beatmap: undefined };
}
exports.EditorState = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.beatmap !== undefined) {
            exports.Beatmap.encode(message.beatmap, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseEditorState();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.beatmap = exports.Beatmap.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return { beatmap: isSet(object.beatmap) ? exports.Beatmap.fromJSON(object.beatmap) : undefined };
    },
    toJSON: function (message) {
        var obj = {};
        message.beatmap !== undefined && (obj.beatmap = message.beatmap ? exports.Beatmap.toJSON(message.beatmap) : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var message = createBaseEditorState();
        message.beatmap = (object.beatmap !== undefined && object.beatmap !== null)
            ? exports.Beatmap.fromPartial(object.beatmap)
            : undefined;
        return message;
    },
};
function createBaseCreateTimingPoint() {
    return { timingPoint: undefined };
}
exports.CreateTimingPoint = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.timingPoint !== undefined) {
            exports.TimingPoint.encode(message.timingPoint, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseCreateTimingPoint();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.timingPoint = exports.TimingPoint.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return { timingPoint: isSet(object.timingPoint) ? exports.TimingPoint.fromJSON(object.timingPoint) : undefined };
    },
    toJSON: function (message) {
        var obj = {};
        message.timingPoint !== undefined &&
            (obj.timingPoint = message.timingPoint ? exports.TimingPoint.toJSON(message.timingPoint) : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var message = createBaseCreateTimingPoint();
        message.timingPoint = (object.timingPoint !== undefined && object.timingPoint !== null)
            ? exports.TimingPoint.fromPartial(object.timingPoint)
            : undefined;
        return message;
    },
};
function createBaseUpdateTimingPoint() {
    return { timingPoint: undefined };
}
exports.UpdateTimingPoint = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.timingPoint !== undefined) {
            exports.TimingPoint.encode(message.timingPoint, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseUpdateTimingPoint();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.timingPoint = exports.TimingPoint.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return { timingPoint: isSet(object.timingPoint) ? exports.TimingPoint.fromJSON(object.timingPoint) : undefined };
    },
    toJSON: function (message) {
        var obj = {};
        message.timingPoint !== undefined &&
            (obj.timingPoint = message.timingPoint ? exports.TimingPoint.toJSON(message.timingPoint) : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var message = createBaseUpdateTimingPoint();
        message.timingPoint = (object.timingPoint !== undefined && object.timingPoint !== null)
            ? exports.TimingPoint.fromPartial(object.timingPoint)
            : undefined;
        return message;
    },
};
function createBaseDeleteTimingPoint() {
    return { ids: [] };
}
exports.DeleteTimingPoint = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        writer.uint32(10).fork();
        for (var _i = 0, _a = message.ids; _i < _a.length; _i++) {
            var v = _a[_i];
            writer.uint32(v);
        }
        writer.ldelim();
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseDeleteTimingPoint();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.ids.push(reader.uint32());
                        }
                    }
                    else {
                        message.ids.push(reader.uint32());
                    }
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return { ids: Array.isArray(object === null || object === void 0 ? void 0 : object.ids) ? object.ids.map(function (e) { return Number(e); }) : [] };
    },
    toJSON: function (message) {
        var obj = {};
        if (message.ids) {
            obj.ids = message.ids.map(function (e) { return Math.round(e); });
        }
        else {
            obj.ids = [];
        }
        return obj;
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseDeleteTimingPoint();
        message.ids = ((_a = object.ids) === null || _a === void 0 ? void 0 : _a.map(function (e) { return e; })) || [];
        return message;
    },
};
function createBaseHitObjectOverrideCommand() {
    return { id: 0, overrides: undefined };
}
exports.HitObjectOverrideCommand = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.id !== 0) {
            writer.uint32(8).uint32(message.id);
        }
        if (message.overrides !== undefined) {
            exports.HitObjectOverrides.encode(message.overrides, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseHitObjectOverrideCommand();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint32();
                    break;
                case 2:
                    message.overrides = exports.HitObjectOverrides.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            id: isSet(object.id) ? Number(object.id) : 0,
            overrides: isSet(object.overrides) ? exports.HitObjectOverrides.fromJSON(object.overrides) : undefined,
        };
    },
    toJSON: function (message) {
        var obj = {};
        message.id !== undefined && (obj.id = Math.round(message.id));
        message.overrides !== undefined &&
            (obj.overrides = message.overrides ? exports.HitObjectOverrides.toJSON(message.overrides) : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseHitObjectOverrideCommand();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : 0;
        message.overrides = (object.overrides !== undefined && object.overrides !== null)
            ? exports.HitObjectOverrides.fromPartial(object.overrides)
            : undefined;
        return message;
    },
};
function createBaseHitObjectOverrides() {
    return {
        position: undefined,
        time: undefined,
        selectedBy: undefined,
        newCombo: undefined,
        controlPoints: undefined,
        expectedDistance: undefined,
        repeatCount: undefined,
    };
}
exports.HitObjectOverrides = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.position !== undefined) {
            exports.IVec2.encode(message.position, writer.uint32(10).fork()).ldelim();
        }
        if (message.time !== undefined) {
            writer.uint32(16).int32(message.time);
        }
        if (message.selectedBy !== undefined) {
            writer.uint32(24).uint64(message.selectedBy);
        }
        if (message.newCombo !== undefined) {
            writer.uint32(32).bool(message.newCombo);
        }
        if (message.controlPoints !== undefined) {
            exports.SliderControlPoints.encode(message.controlPoints, writer.uint32(42).fork()).ldelim();
        }
        if (message.expectedDistance !== undefined) {
            writer.uint32(53).float(message.expectedDistance);
        }
        if (message.repeatCount !== undefined) {
            writer.uint32(56).uint32(message.repeatCount);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseHitObjectOverrides();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.position = exports.IVec2.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.time = reader.int32();
                    break;
                case 3:
                    message.selectedBy = longToNumber(reader.uint64());
                    break;
                case 4:
                    message.newCombo = reader.bool();
                    break;
                case 5:
                    message.controlPoints = exports.SliderControlPoints.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.expectedDistance = reader.float();
                    break;
                case 7:
                    message.repeatCount = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            position: isSet(object.position) ? exports.IVec2.fromJSON(object.position) : undefined,
            time: isSet(object.time) ? Number(object.time) : undefined,
            selectedBy: isSet(object.selectedBy) ? Number(object.selectedBy) : undefined,
            newCombo: isSet(object.newCombo) ? Boolean(object.newCombo) : undefined,
            controlPoints: isSet(object.controlPoints) ? exports.SliderControlPoints.fromJSON(object.controlPoints) : undefined,
            expectedDistance: isSet(object.expectedDistance) ? Number(object.expectedDistance) : undefined,
            repeatCount: isSet(object.repeatCount) ? Number(object.repeatCount) : undefined,
        };
    },
    toJSON: function (message) {
        var obj = {};
        message.position !== undefined && (obj.position = message.position ? exports.IVec2.toJSON(message.position) : undefined);
        message.time !== undefined && (obj.time = Math.round(message.time));
        message.selectedBy !== undefined && (obj.selectedBy = Math.round(message.selectedBy));
        message.newCombo !== undefined && (obj.newCombo = message.newCombo);
        message.controlPoints !== undefined &&
            (obj.controlPoints = message.controlPoints ? exports.SliderControlPoints.toJSON(message.controlPoints) : undefined);
        message.expectedDistance !== undefined && (obj.expectedDistance = message.expectedDistance);
        message.repeatCount !== undefined && (obj.repeatCount = Math.round(message.repeatCount));
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b, _c, _d, _e;
        var message = createBaseHitObjectOverrides();
        message.position = (object.position !== undefined && object.position !== null)
            ? exports.IVec2.fromPartial(object.position)
            : undefined;
        message.time = (_a = object.time) !== null && _a !== void 0 ? _a : undefined;
        message.selectedBy = (_b = object.selectedBy) !== null && _b !== void 0 ? _b : undefined;
        message.newCombo = (_c = object.newCombo) !== null && _c !== void 0 ? _c : undefined;
        message.controlPoints = (object.controlPoints !== undefined && object.controlPoints !== null)
            ? exports.SliderControlPoints.fromPartial(object.controlPoints)
            : undefined;
        message.expectedDistance = (_d = object.expectedDistance) !== null && _d !== void 0 ? _d : undefined;
        message.repeatCount = (_e = object.repeatCount) !== null && _e !== void 0 ? _e : undefined;
        return message;
    },
};
function createBaseSliderControlPoints() {
    return { controlPoints: [] };
}
exports.SliderControlPoints = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        for (var _i = 0, _a = message.controlPoints; _i < _a.length; _i++) {
            var v = _a[_i];
            exports.SliderControlPoint.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseSliderControlPoints();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.controlPoints.push(exports.SliderControlPoint.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            controlPoints: Array.isArray(object === null || object === void 0 ? void 0 : object.controlPoints)
                ? object.controlPoints.map(function (e) { return exports.SliderControlPoint.fromJSON(e); })
                : [],
        };
    },
    toJSON: function (message) {
        var obj = {};
        if (message.controlPoints) {
            obj.controlPoints = message.controlPoints.map(function (e) { return e ? exports.SliderControlPoint.toJSON(e) : undefined; });
        }
        else {
            obj.controlPoints = [];
        }
        return obj;
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseSliderControlPoints();
        message.controlPoints = ((_a = object.controlPoints) === null || _a === void 0 ? void 0 : _a.map(function (e) { return exports.SliderControlPoint.fromPartial(e); })) || [];
        return message;
    },
};
function createBaseHitObject() {
    return { id: 0, selectedBy: undefined, startTime: 0, position: undefined, newCombo: false, kind: undefined };
}
exports.HitObject = {
    encode: function (message, writer) {
        var _a, _b, _c;
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.id !== 0) {
            writer.uint32(8).uint32(message.id);
        }
        if (message.selectedBy !== undefined) {
            writer.uint32(16).uint32(message.selectedBy);
        }
        if (message.startTime !== 0) {
            writer.uint32(24).int32(message.startTime);
        }
        if (message.position !== undefined) {
            exports.IVec2.encode(message.position, writer.uint32(34).fork()).ldelim();
        }
        if (message.newCombo === true) {
            writer.uint32(40).bool(message.newCombo);
        }
        if (((_a = message.kind) === null || _a === void 0 ? void 0 : _a.$case) === "circle") {
            exports.HitCircle.encode(message.kind.circle, writer.uint32(50).fork()).ldelim();
        }
        if (((_b = message.kind) === null || _b === void 0 ? void 0 : _b.$case) === "slider") {
            exports.Slider.encode(message.kind.slider, writer.uint32(58).fork()).ldelim();
        }
        if (((_c = message.kind) === null || _c === void 0 ? void 0 : _c.$case) === "spinner") {
            exports.Spinner.encode(message.kind.spinner, writer.uint32(66).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseHitObject();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint32();
                    break;
                case 2:
                    message.selectedBy = reader.uint32();
                    break;
                case 3:
                    message.startTime = reader.int32();
                    break;
                case 4:
                    message.position = exports.IVec2.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.newCombo = reader.bool();
                    break;
                case 6:
                    message.kind = { $case: "circle", circle: exports.HitCircle.decode(reader, reader.uint32()) };
                    break;
                case 7:
                    message.kind = { $case: "slider", slider: exports.Slider.decode(reader, reader.uint32()) };
                    break;
                case 8:
                    message.kind = { $case: "spinner", spinner: exports.Spinner.decode(reader, reader.uint32()) };
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            id: isSet(object.id) ? Number(object.id) : 0,
            selectedBy: isSet(object.selectedBy) ? Number(object.selectedBy) : undefined,
            startTime: isSet(object.startTime) ? Number(object.startTime) : 0,
            position: isSet(object.position) ? exports.IVec2.fromJSON(object.position) : undefined,
            newCombo: isSet(object.newCombo) ? Boolean(object.newCombo) : false,
            kind: isSet(object.circle)
                ? { $case: "circle", circle: exports.HitCircle.fromJSON(object.circle) }
                : isSet(object.slider)
                    ? { $case: "slider", slider: exports.Slider.fromJSON(object.slider) }
                    : isSet(object.spinner)
                        ? { $case: "spinner", spinner: exports.Spinner.fromJSON(object.spinner) }
                        : undefined,
        };
    },
    toJSON: function (message) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var obj = {};
        message.id !== undefined && (obj.id = Math.round(message.id));
        message.selectedBy !== undefined && (obj.selectedBy = Math.round(message.selectedBy));
        message.startTime !== undefined && (obj.startTime = Math.round(message.startTime));
        message.position !== undefined && (obj.position = message.position ? exports.IVec2.toJSON(message.position) : undefined);
        message.newCombo !== undefined && (obj.newCombo = message.newCombo);
        ((_a = message.kind) === null || _a === void 0 ? void 0 : _a.$case) === "circle" &&
            (obj.circle = ((_b = message.kind) === null || _b === void 0 ? void 0 : _b.circle) ? exports.HitCircle.toJSON((_c = message.kind) === null || _c === void 0 ? void 0 : _c.circle) : undefined);
        ((_d = message.kind) === null || _d === void 0 ? void 0 : _d.$case) === "slider" &&
            (obj.slider = ((_e = message.kind) === null || _e === void 0 ? void 0 : _e.slider) ? exports.Slider.toJSON((_f = message.kind) === null || _f === void 0 ? void 0 : _f.slider) : undefined);
        ((_g = message.kind) === null || _g === void 0 ? void 0 : _g.$case) === "spinner" &&
            (obj.spinner = ((_h = message.kind) === null || _h === void 0 ? void 0 : _h.spinner) ? exports.Spinner.toJSON((_j = message.kind) === null || _j === void 0 ? void 0 : _j.spinner) : undefined);
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var message = createBaseHitObject();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : 0;
        message.selectedBy = (_b = object.selectedBy) !== null && _b !== void 0 ? _b : undefined;
        message.startTime = (_c = object.startTime) !== null && _c !== void 0 ? _c : 0;
        message.position = (object.position !== undefined && object.position !== null)
            ? exports.IVec2.fromPartial(object.position)
            : undefined;
        message.newCombo = (_d = object.newCombo) !== null && _d !== void 0 ? _d : false;
        if (((_e = object.kind) === null || _e === void 0 ? void 0 : _e.$case) === "circle" && ((_f = object.kind) === null || _f === void 0 ? void 0 : _f.circle) !== undefined && ((_g = object.kind) === null || _g === void 0 ? void 0 : _g.circle) !== null) {
            message.kind = { $case: "circle", circle: exports.HitCircle.fromPartial(object.kind.circle) };
        }
        if (((_h = object.kind) === null || _h === void 0 ? void 0 : _h.$case) === "slider" && ((_j = object.kind) === null || _j === void 0 ? void 0 : _j.slider) !== undefined && ((_k = object.kind) === null || _k === void 0 ? void 0 : _k.slider) !== null) {
            message.kind = { $case: "slider", slider: exports.Slider.fromPartial(object.kind.slider) };
        }
        if (((_l = object.kind) === null || _l === void 0 ? void 0 : _l.$case) === "spinner" && ((_m = object.kind) === null || _m === void 0 ? void 0 : _m.spinner) !== undefined && ((_o = object.kind) === null || _o === void 0 ? void 0 : _o.spinner) !== null) {
            message.kind = { $case: "spinner", spinner: exports.Spinner.fromPartial(object.kind.spinner) };
        }
        return message;
    },
};
function createBaseHitCircle() {
    return {};
}
exports.HitCircle = {
    encode: function (_, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseHitCircle();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (_) {
        return {};
    },
    toJSON: function (_) {
        var obj = {};
        return obj;
    },
    fromPartial: function (_) {
        var message = createBaseHitCircle();
        return message;
    },
};
function createBaseSpinner() {
    return {};
}
exports.Spinner = {
    encode: function (_, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseSpinner();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (_) {
        return {};
    },
    toJSON: function (_) {
        var obj = {};
        return obj;
    },
    fromPartial: function (_) {
        var message = createBaseSpinner();
        return message;
    },
};
function createBaseBeatmap() {
    return { difficulty: undefined, hitObjects: [], timingPoints: [] };
}
exports.Beatmap = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.difficulty !== undefined) {
            exports.Difficulty.encode(message.difficulty, writer.uint32(26).fork()).ldelim();
        }
        for (var _i = 0, _a = message.hitObjects; _i < _a.length; _i++) {
            var v = _a[_i];
            exports.HitObject.encode(v, writer.uint32(34).fork()).ldelim();
        }
        for (var _b = 0, _c = message.timingPoints; _b < _c.length; _b++) {
            var v = _c[_b];
            exports.TimingPoint.encode(v, writer.uint32(42).fork()).ldelim();
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseBeatmap();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 3:
                    message.difficulty = exports.Difficulty.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.hitObjects.push(exports.HitObject.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.timingPoints.push(exports.TimingPoint.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            difficulty: isSet(object.difficulty) ? exports.Difficulty.fromJSON(object.difficulty) : undefined,
            hitObjects: Array.isArray(object === null || object === void 0 ? void 0 : object.hitObjects) ? object.hitObjects.map(function (e) { return exports.HitObject.fromJSON(e); }) : [],
            timingPoints: Array.isArray(object === null || object === void 0 ? void 0 : object.timingPoints)
                ? object.timingPoints.map(function (e) { return exports.TimingPoint.fromJSON(e); })
                : [],
        };
    },
    toJSON: function (message) {
        var obj = {};
        message.difficulty !== undefined &&
            (obj.difficulty = message.difficulty ? exports.Difficulty.toJSON(message.difficulty) : undefined);
        if (message.hitObjects) {
            obj.hitObjects = message.hitObjects.map(function (e) { return e ? exports.HitObject.toJSON(e) : undefined; });
        }
        else {
            obj.hitObjects = [];
        }
        if (message.timingPoints) {
            obj.timingPoints = message.timingPoints.map(function (e) { return e ? exports.TimingPoint.toJSON(e) : undefined; });
        }
        else {
            obj.timingPoints = [];
        }
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b;
        var message = createBaseBeatmap();
        message.difficulty = (object.difficulty !== undefined && object.difficulty !== null)
            ? exports.Difficulty.fromPartial(object.difficulty)
            : undefined;
        message.hitObjects = ((_a = object.hitObjects) === null || _a === void 0 ? void 0 : _a.map(function (e) { return exports.HitObject.fromPartial(e); })) || [];
        message.timingPoints = ((_b = object.timingPoints) === null || _b === void 0 ? void 0 : _b.map(function (e) { return exports.TimingPoint.fromPartial(e); })) || [];
        return message;
    },
};
function createBaseDifficulty() {
    return {
        hpDrainRate: 0,
        circleSize: 0,
        overallDifficulty: 0,
        approachRate: 0,
        sliderMultiplier: 0,
        sliderTickRate: 0,
    };
}
exports.Difficulty = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.hpDrainRate !== 0) {
            writer.uint32(13).float(message.hpDrainRate);
        }
        if (message.circleSize !== 0) {
            writer.uint32(21).float(message.circleSize);
        }
        if (message.overallDifficulty !== 0) {
            writer.uint32(29).float(message.overallDifficulty);
        }
        if (message.approachRate !== 0) {
            writer.uint32(37).float(message.approachRate);
        }
        if (message.sliderMultiplier !== 0) {
            writer.uint32(45).float(message.sliderMultiplier);
        }
        if (message.sliderTickRate !== 0) {
            writer.uint32(53).float(message.sliderTickRate);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseDifficulty();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hpDrainRate = reader.float();
                    break;
                case 2:
                    message.circleSize = reader.float();
                    break;
                case 3:
                    message.overallDifficulty = reader.float();
                    break;
                case 4:
                    message.approachRate = reader.float();
                    break;
                case 5:
                    message.sliderMultiplier = reader.float();
                    break;
                case 6:
                    message.sliderTickRate = reader.float();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            hpDrainRate: isSet(object.hpDrainRate) ? Number(object.hpDrainRate) : 0,
            circleSize: isSet(object.circleSize) ? Number(object.circleSize) : 0,
            overallDifficulty: isSet(object.overallDifficulty) ? Number(object.overallDifficulty) : 0,
            approachRate: isSet(object.approachRate) ? Number(object.approachRate) : 0,
            sliderMultiplier: isSet(object.sliderMultiplier) ? Number(object.sliderMultiplier) : 0,
            sliderTickRate: isSet(object.sliderTickRate) ? Number(object.sliderTickRate) : 0,
        };
    },
    toJSON: function (message) {
        var obj = {};
        message.hpDrainRate !== undefined && (obj.hpDrainRate = message.hpDrainRate);
        message.circleSize !== undefined && (obj.circleSize = message.circleSize);
        message.overallDifficulty !== undefined && (obj.overallDifficulty = message.overallDifficulty);
        message.approachRate !== undefined && (obj.approachRate = message.approachRate);
        message.sliderMultiplier !== undefined && (obj.sliderMultiplier = message.sliderMultiplier);
        message.sliderTickRate !== undefined && (obj.sliderTickRate = message.sliderTickRate);
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b, _c, _d, _e, _f;
        var message = createBaseDifficulty();
        message.hpDrainRate = (_a = object.hpDrainRate) !== null && _a !== void 0 ? _a : 0;
        message.circleSize = (_b = object.circleSize) !== null && _b !== void 0 ? _b : 0;
        message.overallDifficulty = (_c = object.overallDifficulty) !== null && _c !== void 0 ? _c : 0;
        message.approachRate = (_d = object.approachRate) !== null && _d !== void 0 ? _d : 0;
        message.sliderMultiplier = (_e = object.sliderMultiplier) !== null && _e !== void 0 ? _e : 0;
        message.sliderTickRate = (_f = object.sliderTickRate) !== null && _f !== void 0 ? _f : 0;
        return message;
    },
};
function createBaseSlider() {
    return { expectedDistance: 0, controlPoints: [], repeats: 0 };
}
exports.Slider = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.expectedDistance !== 0) {
            writer.uint32(13).float(message.expectedDistance);
        }
        for (var _i = 0, _a = message.controlPoints; _i < _a.length; _i++) {
            var v = _a[_i];
            exports.SliderControlPoint.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.repeats !== 0) {
            writer.uint32(24).uint32(message.repeats);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseSlider();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.expectedDistance = reader.float();
                    break;
                case 2:
                    message.controlPoints.push(exports.SliderControlPoint.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.repeats = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            expectedDistance: isSet(object.expectedDistance) ? Number(object.expectedDistance) : 0,
            controlPoints: Array.isArray(object === null || object === void 0 ? void 0 : object.controlPoints)
                ? object.controlPoints.map(function (e) { return exports.SliderControlPoint.fromJSON(e); })
                : [],
            repeats: isSet(object.repeats) ? Number(object.repeats) : 0,
        };
    },
    toJSON: function (message) {
        var obj = {};
        message.expectedDistance !== undefined && (obj.expectedDistance = message.expectedDistance);
        if (message.controlPoints) {
            obj.controlPoints = message.controlPoints.map(function (e) { return e ? exports.SliderControlPoint.toJSON(e) : undefined; });
        }
        else {
            obj.controlPoints = [];
        }
        message.repeats !== undefined && (obj.repeats = Math.round(message.repeats));
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b, _c;
        var message = createBaseSlider();
        message.expectedDistance = (_a = object.expectedDistance) !== null && _a !== void 0 ? _a : 0;
        message.controlPoints = ((_b = object.controlPoints) === null || _b === void 0 ? void 0 : _b.map(function (e) { return exports.SliderControlPoint.fromPartial(e); })) || [];
        message.repeats = (_c = object.repeats) !== null && _c !== void 0 ? _c : 0;
        return message;
    },
};
function createBaseSliderControlPoint() {
    return { position: undefined, kind: 0 };
}
exports.SliderControlPoint = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.position !== undefined) {
            exports.IVec2.encode(message.position, writer.uint32(10).fork()).ldelim();
        }
        if (message.kind !== 0) {
            writer.uint32(16).int32(message.kind);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseSliderControlPoint();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.position = exports.IVec2.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.kind = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            position: isSet(object.position) ? exports.IVec2.fromJSON(object.position) : undefined,
            kind: isSet(object.kind) ? controlPointKindFromJSON(object.kind) : 0,
        };
    },
    toJSON: function (message) {
        var obj = {};
        message.position !== undefined && (obj.position = message.position ? exports.IVec2.toJSON(message.position) : undefined);
        message.kind !== undefined && (obj.kind = controlPointKindToJSON(message.kind));
        return obj;
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseSliderControlPoint();
        message.position = (object.position !== undefined && object.position !== null)
            ? exports.IVec2.fromPartial(object.position)
            : undefined;
        message.kind = (_a = object.kind) !== null && _a !== void 0 ? _a : 0;
        return message;
    },
};
function createBaseTimingPoint() {
    return { id: 0, offset: 0, timing: undefined, sv: undefined, volume: undefined };
}
exports.TimingPoint = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.id !== 0) {
            writer.uint32(8).uint32(message.id);
        }
        if (message.offset !== 0) {
            writer.uint32(16).int32(message.offset);
        }
        if (message.timing !== undefined) {
            exports.TimingInformation.encode(message.timing, writer.uint32(26).fork()).ldelim();
        }
        if (message.sv !== undefined) {
            writer.uint32(37).float(message.sv);
        }
        if (message.volume !== undefined) {
            writer.uint32(45).float(message.volume);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseTimingPoint();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint32();
                    break;
                case 2:
                    message.offset = reader.int32();
                    break;
                case 3:
                    message.timing = exports.TimingInformation.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.sv = reader.float();
                    break;
                case 5:
                    message.volume = reader.float();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            id: isSet(object.id) ? Number(object.id) : 0,
            offset: isSet(object.offset) ? Number(object.offset) : 0,
            timing: isSet(object.timing) ? exports.TimingInformation.fromJSON(object.timing) : undefined,
            sv: isSet(object.sv) ? Number(object.sv) : undefined,
            volume: isSet(object.volume) ? Number(object.volume) : undefined,
        };
    },
    toJSON: function (message) {
        var obj = {};
        message.id !== undefined && (obj.id = Math.round(message.id));
        message.offset !== undefined && (obj.offset = Math.round(message.offset));
        message.timing !== undefined &&
            (obj.timing = message.timing ? exports.TimingInformation.toJSON(message.timing) : undefined);
        message.sv !== undefined && (obj.sv = message.sv);
        message.volume !== undefined && (obj.volume = message.volume);
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b, _c, _d;
        var message = createBaseTimingPoint();
        message.id = (_a = object.id) !== null && _a !== void 0 ? _a : 0;
        message.offset = (_b = object.offset) !== null && _b !== void 0 ? _b : 0;
        message.timing = (object.timing !== undefined && object.timing !== null)
            ? exports.TimingInformation.fromPartial(object.timing)
            : undefined;
        message.sv = (_c = object.sv) !== null && _c !== void 0 ? _c : undefined;
        message.volume = (_d = object.volume) !== null && _d !== void 0 ? _d : undefined;
        return message;
    },
};
function createBaseTimingInformation() {
    return { bpm: 0, signature: 0 };
}
exports.TimingInformation = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.bpm !== 0) {
            writer.uint32(13).float(message.bpm);
        }
        if (message.signature !== 0) {
            writer.uint32(16).uint32(message.signature);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseTimingInformation();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bpm = reader.float();
                    break;
                case 2:
                    message.signature = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return {
            bpm: isSet(object.bpm) ? Number(object.bpm) : 0,
            signature: isSet(object.signature) ? Number(object.signature) : 0,
        };
    },
    toJSON: function (message) {
        var obj = {};
        message.bpm !== undefined && (obj.bpm = message.bpm);
        message.signature !== undefined && (obj.signature = Math.round(message.signature));
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b;
        var message = createBaseTimingInformation();
        message.bpm = (_a = object.bpm) !== null && _a !== void 0 ? _a : 0;
        message.signature = (_b = object.signature) !== null && _b !== void 0 ? _b : 0;
        return message;
    },
};
function createBaseVec2() {
    return { x: 0, y: 0 };
}
exports.Vec2 = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.x !== 0) {
            writer.uint32(13).float(message.x);
        }
        if (message.y !== 0) {
            writer.uint32(21).float(message.y);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseVec2();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.x = reader.float();
                    break;
                case 2:
                    message.y = reader.float();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return { x: isSet(object.x) ? Number(object.x) : 0, y: isSet(object.y) ? Number(object.y) : 0 };
    },
    toJSON: function (message) {
        var obj = {};
        message.x !== undefined && (obj.x = message.x);
        message.y !== undefined && (obj.y = message.y);
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b;
        var message = createBaseVec2();
        message.x = (_a = object.x) !== null && _a !== void 0 ? _a : 0;
        message.y = (_b = object.y) !== null && _b !== void 0 ? _b : 0;
        return message;
    },
};
function createBaseIVec2() {
    return { x: 0, y: 0 };
}
exports.IVec2 = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.default.Writer.create(); }
        if (message.x !== 0) {
            writer.uint32(8).int32(message.x);
        }
        if (message.y !== 0) {
            writer.uint32(16).int32(message.y);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseIVec2();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.x = reader.int32();
                    break;
                case 2:
                    message.y = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        return { x: isSet(object.x) ? Number(object.x) : 0, y: isSet(object.y) ? Number(object.y) : 0 };
    },
    toJSON: function (message) {
        var obj = {};
        message.x !== undefined && (obj.x = Math.round(message.x));
        message.y !== undefined && (obj.y = Math.round(message.y));
        return obj;
    },
    fromPartial: function (object) {
        var _a, _b;
        var message = createBaseIVec2();
        message.x = (_a = object.x) !== null && _a !== void 0 ? _a : 0;
        message.y = (_b = object.y) !== null && _b !== void 0 ? _b : 0;
        return message;
    },
};
var globalThis = (function () {
    if (typeof globalThis !== "undefined") {
        return globalThis;
    }
    if (typeof self !== "undefined") {
        return self;
    }
    if (typeof window !== "undefined") {
        return window;
    }
    if (typeof global !== "undefined") {
        return global;
    }
    throw "Unable to locate global object";
})();
function longToNumber(long) {
    if (long.gt(Number.MAX_SAFE_INTEGER)) {
        throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
    }
    return long.toNumber();
}
if (minimal_1.default.util.Long !== long_1.default) {
    minimal_1.default.util.Long = long_1.default;
    minimal_1.default.configure();
}
function isSet(value) {
    return value !== null && value !== undefined;
}
//# sourceMappingURL=commands.js.map