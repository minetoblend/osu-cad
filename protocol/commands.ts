/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "proto.commands";

export enum ControlPointKind {
  None = 0,
  Bezier = 1,
  Circle = 2,
  Linear = 3,
  UNRECOGNIZED = -1,
}

export function controlPointKindFromJSON(object: any): ControlPointKind {
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

export function controlPointKindToJSON(object: ControlPointKind): string {
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

export interface ServerToClientMessage {
  responseId?: string | undefined;
  serverCommand?:
    | { $case: "multiple"; multiple: MultiServerToClientMessage }
    | { $case: "heartbeat"; heartbeat: number }
    | { $case: "userJoined"; userJoined: UserInfo }
    | { $case: "userLeft"; userLeft: UserInfo }
    | { $case: "tick"; tick: ServerTick }
    | { $case: "userList"; userList: UserList }
    | { $case: "ownId"; ownId: number }
    | { $case: "hitObjectCreated"; hitObjectCreated: HitObject }
    | { $case: "hitObjectUpdated"; hitObjectUpdated: HitObject }
    | { $case: "hitObjectDeleted"; hitObjectDeleted: number }
    | { $case: "hitObjectSelected"; hitObjectSelected: HitObjectSelected }
    | { $case: "state"; state: EditorState }
    | { $case: "timingPointCreated"; timingPointCreated: TimingPoint }
    | { $case: "timingPointUpdated"; timingPointUpdated: TimingPoint }
    | { $case: "timingPointDeleted"; timingPointDeleted: number }
    | { $case: "hitObjectOverridden"; hitObjectOverridden: HitObjectOverrideCommand };
}

export interface MultiServerToClientMessage {
  messages: ServerToClientMessage[];
}

export interface ClientToServerMessage {
  responseId?: string | undefined;
  clientCommand?:
    | { $case: "cursorPos"; cursorPos: Vec2 }
    | { $case: "currentTime"; currentTime: number }
    | { $case: "selectHitObject"; selectHitObject: SelectHitObject }
    | { $case: "createHitObject"; createHitObject: CreateHitObject }
    | { $case: "updateHitObject"; updateHitObject: UpdateHitObject }
    | { $case: "deleteHitObject"; deleteHitObject: DeleteHitObject }
    | { $case: "createTimingPoint"; createTimingPoint: CreateTimingPoint }
    | { $case: "updateTimingPoint"; updateTimingPoint: UpdateTimingPoint }
    | { $case: "deleteTimingPoint"; deleteTimingPoint: DeleteTimingPoint }
    | { $case: "setHitObjectOverrides"; setHitObjectOverrides: HitObjectOverrideCommand };
}

export interface ServerTick {
  userTicks: UserTick[];
}

export interface UserTick {
  id: number;
  cursorPos?: Vec2 | undefined;
  currentTime: number;
}

export interface UserInfo {
  id: number;
  displayName: string;
}

export interface UserList {
  users: UserInfo[];
}

export interface CreateHitObject {
  hitObject: HitObject | undefined;
}

export interface UpdateHitObject {
  hitObject: HitObject | undefined;
}

export interface DeleteHitObject {
  ids: number[];
}

export interface HitObjectSelected {
  ids: number[];
  selectedBy?: number | undefined;
}

export interface SelectHitObject {
  ids: number[];
  selected: boolean;
  unique: boolean;
}

export interface EditorState {
  beatmap: Beatmap | undefined;
}

export interface CreateTimingPoint {
  timingPoint: TimingPoint | undefined;
}

export interface UpdateTimingPoint {
  timingPoint: TimingPoint | undefined;
}

export interface DeleteTimingPoint {
  ids: number[];
}

export interface HitObjectOverrideCommand {
  id: number;
  overrides: HitObjectOverrides | undefined;
}

export interface HitObjectOverrides {
  position?: IVec2 | undefined;
  time?: number | undefined;
  selectedBy?: number | undefined;
  newCombo?: boolean | undefined;
  controlPoints?: SliderControlPoints | undefined;
  expectedDistance?: number | undefined;
  repeatCount?: number | undefined;
}

export interface SliderControlPoints {
  controlPoints: SliderControlPoint[];
}

export interface HitObject {
  id: number;
  selectedBy?: number | undefined;
  startTime: number;
  position: IVec2 | undefined;
  newCombo: boolean;
  kind?: { $case: "circle"; circle: HitCircle } | { $case: "slider"; slider: Slider } | {
    $case: "spinner";
    spinner: Spinner;
  };
}

export interface HitCircle {
}

export interface Spinner {
}

export interface Beatmap {
  difficulty: Difficulty | undefined;
  hitObjects: HitObject[];
  timingPoints: TimingPoint[];
}

export interface Difficulty {
  hpDrainRate: number;
  circleSize: number;
  overallDifficulty: number;
  approachRate: number;
  sliderMultiplier: number;
  sliderTickRate: number;
}

export interface Slider {
  expectedDistance: number;
  controlPoints: SliderControlPoint[];
  repeats: number;
}

export interface SliderControlPoint {
  position: IVec2 | undefined;
  kind: ControlPointKind;
}

export interface TimingPoint {
  id: number;
  offset: number;
  timing?: TimingInformation | undefined;
  sv?: number | undefined;
  volume?: number | undefined;
}

export interface TimingInformation {
  bpm: number;
  signature: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface IVec2 {
  x: number;
  y: number;
}

function createBaseServerToClientMessage(): ServerToClientMessage {
  return { responseId: undefined, serverCommand: undefined };
}

export const ServerToClientMessage = {
  encode(message: ServerToClientMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.responseId !== undefined) {
      writer.uint32(10).string(message.responseId);
    }
    if (message.serverCommand?.$case === "multiple") {
      MultiServerToClientMessage.encode(message.serverCommand.multiple, writer.uint32(18).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "heartbeat") {
      writer.uint32(24).uint32(message.serverCommand.heartbeat);
    }
    if (message.serverCommand?.$case === "userJoined") {
      UserInfo.encode(message.serverCommand.userJoined, writer.uint32(34).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "userLeft") {
      UserInfo.encode(message.serverCommand.userLeft, writer.uint32(42).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "tick") {
      ServerTick.encode(message.serverCommand.tick, writer.uint32(50).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "userList") {
      UserList.encode(message.serverCommand.userList, writer.uint32(58).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "ownId") {
      writer.uint32(64).uint64(message.serverCommand.ownId);
    }
    if (message.serverCommand?.$case === "hitObjectCreated") {
      HitObject.encode(message.serverCommand.hitObjectCreated, writer.uint32(74).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "hitObjectUpdated") {
      HitObject.encode(message.serverCommand.hitObjectUpdated, writer.uint32(82).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "hitObjectDeleted") {
      writer.uint32(88).uint32(message.serverCommand.hitObjectDeleted);
    }
    if (message.serverCommand?.$case === "hitObjectSelected") {
      HitObjectSelected.encode(message.serverCommand.hitObjectSelected, writer.uint32(98).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "state") {
      EditorState.encode(message.serverCommand.state, writer.uint32(106).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "timingPointCreated") {
      TimingPoint.encode(message.serverCommand.timingPointCreated, writer.uint32(114).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "timingPointUpdated") {
      TimingPoint.encode(message.serverCommand.timingPointUpdated, writer.uint32(122).fork()).ldelim();
    }
    if (message.serverCommand?.$case === "timingPointDeleted") {
      writer.uint32(128).uint32(message.serverCommand.timingPointDeleted);
    }
    if (message.serverCommand?.$case === "hitObjectOverridden") {
      HitObjectOverrideCommand.encode(message.serverCommand.hitObjectOverridden, writer.uint32(138).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ServerToClientMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseServerToClientMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.responseId = reader.string();
          break;
        case 2:
          message.serverCommand = {
            $case: "multiple",
            multiple: MultiServerToClientMessage.decode(reader, reader.uint32()),
          };
          break;
        case 3:
          message.serverCommand = { $case: "heartbeat", heartbeat: reader.uint32() };
          break;
        case 4:
          message.serverCommand = { $case: "userJoined", userJoined: UserInfo.decode(reader, reader.uint32()) };
          break;
        case 5:
          message.serverCommand = { $case: "userLeft", userLeft: UserInfo.decode(reader, reader.uint32()) };
          break;
        case 6:
          message.serverCommand = { $case: "tick", tick: ServerTick.decode(reader, reader.uint32()) };
          break;
        case 7:
          message.serverCommand = { $case: "userList", userList: UserList.decode(reader, reader.uint32()) };
          break;
        case 8:
          message.serverCommand = { $case: "ownId", ownId: longToNumber(reader.uint64() as Long) };
          break;
        case 9:
          message.serverCommand = {
            $case: "hitObjectCreated",
            hitObjectCreated: HitObject.decode(reader, reader.uint32()),
          };
          break;
        case 10:
          message.serverCommand = {
            $case: "hitObjectUpdated",
            hitObjectUpdated: HitObject.decode(reader, reader.uint32()),
          };
          break;
        case 11:
          message.serverCommand = { $case: "hitObjectDeleted", hitObjectDeleted: reader.uint32() };
          break;
        case 12:
          message.serverCommand = {
            $case: "hitObjectSelected",
            hitObjectSelected: HitObjectSelected.decode(reader, reader.uint32()),
          };
          break;
        case 13:
          message.serverCommand = { $case: "state", state: EditorState.decode(reader, reader.uint32()) };
          break;
        case 14:
          message.serverCommand = {
            $case: "timingPointCreated",
            timingPointCreated: TimingPoint.decode(reader, reader.uint32()),
          };
          break;
        case 15:
          message.serverCommand = {
            $case: "timingPointUpdated",
            timingPointUpdated: TimingPoint.decode(reader, reader.uint32()),
          };
          break;
        case 16:
          message.serverCommand = { $case: "timingPointDeleted", timingPointDeleted: reader.uint32() };
          break;
        case 17:
          message.serverCommand = {
            $case: "hitObjectOverridden",
            hitObjectOverridden: HitObjectOverrideCommand.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ServerToClientMessage {
    return {
      responseId: isSet(object.responseId) ? String(object.responseId) : undefined,
      serverCommand: isSet(object.multiple)
        ? { $case: "multiple", multiple: MultiServerToClientMessage.fromJSON(object.multiple) }
        : isSet(object.heartbeat)
        ? { $case: "heartbeat", heartbeat: Number(object.heartbeat) }
        : isSet(object.userJoined)
        ? { $case: "userJoined", userJoined: UserInfo.fromJSON(object.userJoined) }
        : isSet(object.userLeft)
        ? { $case: "userLeft", userLeft: UserInfo.fromJSON(object.userLeft) }
        : isSet(object.tick)
        ? { $case: "tick", tick: ServerTick.fromJSON(object.tick) }
        : isSet(object.userList)
        ? { $case: "userList", userList: UserList.fromJSON(object.userList) }
        : isSet(object.ownId)
        ? { $case: "ownId", ownId: Number(object.ownId) }
        : isSet(object.hitObjectCreated)
        ? { $case: "hitObjectCreated", hitObjectCreated: HitObject.fromJSON(object.hitObjectCreated) }
        : isSet(object.hitObjectUpdated)
        ? { $case: "hitObjectUpdated", hitObjectUpdated: HitObject.fromJSON(object.hitObjectUpdated) }
        : isSet(object.hitObjectDeleted)
        ? { $case: "hitObjectDeleted", hitObjectDeleted: Number(object.hitObjectDeleted) }
        : isSet(object.hitObjectSelected)
        ? { $case: "hitObjectSelected", hitObjectSelected: HitObjectSelected.fromJSON(object.hitObjectSelected) }
        : isSet(object.state)
        ? { $case: "state", state: EditorState.fromJSON(object.state) }
        : isSet(object.timingPointCreated)
        ? { $case: "timingPointCreated", timingPointCreated: TimingPoint.fromJSON(object.timingPointCreated) }
        : isSet(object.timingPointUpdated)
        ? { $case: "timingPointUpdated", timingPointUpdated: TimingPoint.fromJSON(object.timingPointUpdated) }
        : isSet(object.timingPointDeleted)
        ? { $case: "timingPointDeleted", timingPointDeleted: Number(object.timingPointDeleted) }
        : isSet(object.hitObjectOverridden)
        ? {
          $case: "hitObjectOverridden",
          hitObjectOverridden: HitObjectOverrideCommand.fromJSON(object.hitObjectOverridden),
        }
        : undefined,
    };
  },

  toJSON(message: ServerToClientMessage): unknown {
    const obj: any = {};
    message.responseId !== undefined && (obj.responseId = message.responseId);
    message.serverCommand?.$case === "multiple" && (obj.multiple = message.serverCommand?.multiple
      ? MultiServerToClientMessage.toJSON(message.serverCommand?.multiple)
      : undefined);
    message.serverCommand?.$case === "heartbeat" && (obj.heartbeat = Math.round(message.serverCommand?.heartbeat));
    message.serverCommand?.$case === "userJoined" && (obj.userJoined = message.serverCommand?.userJoined
      ? UserInfo.toJSON(message.serverCommand?.userJoined)
      : undefined);
    message.serverCommand?.$case === "userLeft" &&
      (obj.userLeft = message.serverCommand?.userLeft ? UserInfo.toJSON(message.serverCommand?.userLeft) : undefined);
    message.serverCommand?.$case === "tick" &&
      (obj.tick = message.serverCommand?.tick ? ServerTick.toJSON(message.serverCommand?.tick) : undefined);
    message.serverCommand?.$case === "userList" &&
      (obj.userList = message.serverCommand?.userList ? UserList.toJSON(message.serverCommand?.userList) : undefined);
    message.serverCommand?.$case === "ownId" && (obj.ownId = Math.round(message.serverCommand?.ownId));
    message.serverCommand?.$case === "hitObjectCreated" &&
      (obj.hitObjectCreated = message.serverCommand?.hitObjectCreated
        ? HitObject.toJSON(message.serverCommand?.hitObjectCreated)
        : undefined);
    message.serverCommand?.$case === "hitObjectUpdated" &&
      (obj.hitObjectUpdated = message.serverCommand?.hitObjectUpdated
        ? HitObject.toJSON(message.serverCommand?.hitObjectUpdated)
        : undefined);
    message.serverCommand?.$case === "hitObjectDeleted" &&
      (obj.hitObjectDeleted = Math.round(message.serverCommand?.hitObjectDeleted));
    message.serverCommand?.$case === "hitObjectSelected" &&
      (obj.hitObjectSelected = message.serverCommand?.hitObjectSelected
        ? HitObjectSelected.toJSON(message.serverCommand?.hitObjectSelected)
        : undefined);
    message.serverCommand?.$case === "state" &&
      (obj.state = message.serverCommand?.state ? EditorState.toJSON(message.serverCommand?.state) : undefined);
    message.serverCommand?.$case === "timingPointCreated" &&
      (obj.timingPointCreated = message.serverCommand?.timingPointCreated
        ? TimingPoint.toJSON(message.serverCommand?.timingPointCreated)
        : undefined);
    message.serverCommand?.$case === "timingPointUpdated" &&
      (obj.timingPointUpdated = message.serverCommand?.timingPointUpdated
        ? TimingPoint.toJSON(message.serverCommand?.timingPointUpdated)
        : undefined);
    message.serverCommand?.$case === "timingPointDeleted" &&
      (obj.timingPointDeleted = Math.round(message.serverCommand?.timingPointDeleted));
    message.serverCommand?.$case === "hitObjectOverridden" &&
      (obj.hitObjectOverridden = message.serverCommand?.hitObjectOverridden
        ? HitObjectOverrideCommand.toJSON(message.serverCommand?.hitObjectOverridden)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ServerToClientMessage>, I>>(object: I): ServerToClientMessage {
    const message = createBaseServerToClientMessage();
    message.responseId = object.responseId ?? undefined;
    if (
      object.serverCommand?.$case === "multiple" &&
      object.serverCommand?.multiple !== undefined &&
      object.serverCommand?.multiple !== null
    ) {
      message.serverCommand = {
        $case: "multiple",
        multiple: MultiServerToClientMessage.fromPartial(object.serverCommand.multiple),
      };
    }
    if (
      object.serverCommand?.$case === "heartbeat" &&
      object.serverCommand?.heartbeat !== undefined &&
      object.serverCommand?.heartbeat !== null
    ) {
      message.serverCommand = { $case: "heartbeat", heartbeat: object.serverCommand.heartbeat };
    }
    if (
      object.serverCommand?.$case === "userJoined" &&
      object.serverCommand?.userJoined !== undefined &&
      object.serverCommand?.userJoined !== null
    ) {
      message.serverCommand = {
        $case: "userJoined",
        userJoined: UserInfo.fromPartial(object.serverCommand.userJoined),
      };
    }
    if (
      object.serverCommand?.$case === "userLeft" &&
      object.serverCommand?.userLeft !== undefined &&
      object.serverCommand?.userLeft !== null
    ) {
      message.serverCommand = { $case: "userLeft", userLeft: UserInfo.fromPartial(object.serverCommand.userLeft) };
    }
    if (
      object.serverCommand?.$case === "tick" &&
      object.serverCommand?.tick !== undefined &&
      object.serverCommand?.tick !== null
    ) {
      message.serverCommand = { $case: "tick", tick: ServerTick.fromPartial(object.serverCommand.tick) };
    }
    if (
      object.serverCommand?.$case === "userList" &&
      object.serverCommand?.userList !== undefined &&
      object.serverCommand?.userList !== null
    ) {
      message.serverCommand = { $case: "userList", userList: UserList.fromPartial(object.serverCommand.userList) };
    }
    if (
      object.serverCommand?.$case === "ownId" &&
      object.serverCommand?.ownId !== undefined &&
      object.serverCommand?.ownId !== null
    ) {
      message.serverCommand = { $case: "ownId", ownId: object.serverCommand.ownId };
    }
    if (
      object.serverCommand?.$case === "hitObjectCreated" &&
      object.serverCommand?.hitObjectCreated !== undefined &&
      object.serverCommand?.hitObjectCreated !== null
    ) {
      message.serverCommand = {
        $case: "hitObjectCreated",
        hitObjectCreated: HitObject.fromPartial(object.serverCommand.hitObjectCreated),
      };
    }
    if (
      object.serverCommand?.$case === "hitObjectUpdated" &&
      object.serverCommand?.hitObjectUpdated !== undefined &&
      object.serverCommand?.hitObjectUpdated !== null
    ) {
      message.serverCommand = {
        $case: "hitObjectUpdated",
        hitObjectUpdated: HitObject.fromPartial(object.serverCommand.hitObjectUpdated),
      };
    }
    if (
      object.serverCommand?.$case === "hitObjectDeleted" &&
      object.serverCommand?.hitObjectDeleted !== undefined &&
      object.serverCommand?.hitObjectDeleted !== null
    ) {
      message.serverCommand = { $case: "hitObjectDeleted", hitObjectDeleted: object.serverCommand.hitObjectDeleted };
    }
    if (
      object.serverCommand?.$case === "hitObjectSelected" &&
      object.serverCommand?.hitObjectSelected !== undefined &&
      object.serverCommand?.hitObjectSelected !== null
    ) {
      message.serverCommand = {
        $case: "hitObjectSelected",
        hitObjectSelected: HitObjectSelected.fromPartial(object.serverCommand.hitObjectSelected),
      };
    }
    if (
      object.serverCommand?.$case === "state" &&
      object.serverCommand?.state !== undefined &&
      object.serverCommand?.state !== null
    ) {
      message.serverCommand = { $case: "state", state: EditorState.fromPartial(object.serverCommand.state) };
    }
    if (
      object.serverCommand?.$case === "timingPointCreated" &&
      object.serverCommand?.timingPointCreated !== undefined &&
      object.serverCommand?.timingPointCreated !== null
    ) {
      message.serverCommand = {
        $case: "timingPointCreated",
        timingPointCreated: TimingPoint.fromPartial(object.serverCommand.timingPointCreated),
      };
    }
    if (
      object.serverCommand?.$case === "timingPointUpdated" &&
      object.serverCommand?.timingPointUpdated !== undefined &&
      object.serverCommand?.timingPointUpdated !== null
    ) {
      message.serverCommand = {
        $case: "timingPointUpdated",
        timingPointUpdated: TimingPoint.fromPartial(object.serverCommand.timingPointUpdated),
      };
    }
    if (
      object.serverCommand?.$case === "timingPointDeleted" &&
      object.serverCommand?.timingPointDeleted !== undefined &&
      object.serverCommand?.timingPointDeleted !== null
    ) {
      message.serverCommand = {
        $case: "timingPointDeleted",
        timingPointDeleted: object.serverCommand.timingPointDeleted,
      };
    }
    if (
      object.serverCommand?.$case === "hitObjectOverridden" &&
      object.serverCommand?.hitObjectOverridden !== undefined &&
      object.serverCommand?.hitObjectOverridden !== null
    ) {
      message.serverCommand = {
        $case: "hitObjectOverridden",
        hitObjectOverridden: HitObjectOverrideCommand.fromPartial(object.serverCommand.hitObjectOverridden),
      };
    }
    return message;
  },
};

function createBaseMultiServerToClientMessage(): MultiServerToClientMessage {
  return { messages: [] };
}

export const MultiServerToClientMessage = {
  encode(message: MultiServerToClientMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.messages) {
      ServerToClientMessage.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MultiServerToClientMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMultiServerToClientMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.messages.push(ServerToClientMessage.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MultiServerToClientMessage {
    return {
      messages: Array.isArray(object?.messages)
        ? object.messages.map((e: any) => ServerToClientMessage.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MultiServerToClientMessage): unknown {
    const obj: any = {};
    if (message.messages) {
      obj.messages = message.messages.map((e) => e ? ServerToClientMessage.toJSON(e) : undefined);
    } else {
      obj.messages = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MultiServerToClientMessage>, I>>(object: I): MultiServerToClientMessage {
    const message = createBaseMultiServerToClientMessage();
    message.messages = object.messages?.map((e) => ServerToClientMessage.fromPartial(e)) || [];
    return message;
  },
};

function createBaseClientToServerMessage(): ClientToServerMessage {
  return { responseId: undefined, clientCommand: undefined };
}

export const ClientToServerMessage = {
  encode(message: ClientToServerMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.responseId !== undefined) {
      writer.uint32(10).string(message.responseId);
    }
    if (message.clientCommand?.$case === "cursorPos") {
      Vec2.encode(message.clientCommand.cursorPos, writer.uint32(26).fork()).ldelim();
    }
    if (message.clientCommand?.$case === "currentTime") {
      writer.uint32(32).int32(message.clientCommand.currentTime);
    }
    if (message.clientCommand?.$case === "selectHitObject") {
      SelectHitObject.encode(message.clientCommand.selectHitObject, writer.uint32(42).fork()).ldelim();
    }
    if (message.clientCommand?.$case === "createHitObject") {
      CreateHitObject.encode(message.clientCommand.createHitObject, writer.uint32(50).fork()).ldelim();
    }
    if (message.clientCommand?.$case === "updateHitObject") {
      UpdateHitObject.encode(message.clientCommand.updateHitObject, writer.uint32(58).fork()).ldelim();
    }
    if (message.clientCommand?.$case === "deleteHitObject") {
      DeleteHitObject.encode(message.clientCommand.deleteHitObject, writer.uint32(66).fork()).ldelim();
    }
    if (message.clientCommand?.$case === "createTimingPoint") {
      CreateTimingPoint.encode(message.clientCommand.createTimingPoint, writer.uint32(74).fork()).ldelim();
    }
    if (message.clientCommand?.$case === "updateTimingPoint") {
      UpdateTimingPoint.encode(message.clientCommand.updateTimingPoint, writer.uint32(82).fork()).ldelim();
    }
    if (message.clientCommand?.$case === "deleteTimingPoint") {
      DeleteTimingPoint.encode(message.clientCommand.deleteTimingPoint, writer.uint32(90).fork()).ldelim();
    }
    if (message.clientCommand?.$case === "setHitObjectOverrides") {
      HitObjectOverrideCommand.encode(message.clientCommand.setHitObjectOverrides, writer.uint32(138).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClientToServerMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClientToServerMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.responseId = reader.string();
          break;
        case 3:
          message.clientCommand = { $case: "cursorPos", cursorPos: Vec2.decode(reader, reader.uint32()) };
          break;
        case 4:
          message.clientCommand = { $case: "currentTime", currentTime: reader.int32() };
          break;
        case 5:
          message.clientCommand = {
            $case: "selectHitObject",
            selectHitObject: SelectHitObject.decode(reader, reader.uint32()),
          };
          break;
        case 6:
          message.clientCommand = {
            $case: "createHitObject",
            createHitObject: CreateHitObject.decode(reader, reader.uint32()),
          };
          break;
        case 7:
          message.clientCommand = {
            $case: "updateHitObject",
            updateHitObject: UpdateHitObject.decode(reader, reader.uint32()),
          };
          break;
        case 8:
          message.clientCommand = {
            $case: "deleteHitObject",
            deleteHitObject: DeleteHitObject.decode(reader, reader.uint32()),
          };
          break;
        case 9:
          message.clientCommand = {
            $case: "createTimingPoint",
            createTimingPoint: CreateTimingPoint.decode(reader, reader.uint32()),
          };
          break;
        case 10:
          message.clientCommand = {
            $case: "updateTimingPoint",
            updateTimingPoint: UpdateTimingPoint.decode(reader, reader.uint32()),
          };
          break;
        case 11:
          message.clientCommand = {
            $case: "deleteTimingPoint",
            deleteTimingPoint: DeleteTimingPoint.decode(reader, reader.uint32()),
          };
          break;
        case 17:
          message.clientCommand = {
            $case: "setHitObjectOverrides",
            setHitObjectOverrides: HitObjectOverrideCommand.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ClientToServerMessage {
    return {
      responseId: isSet(object.responseId) ? String(object.responseId) : undefined,
      clientCommand: isSet(object.cursorPos)
        ? { $case: "cursorPos", cursorPos: Vec2.fromJSON(object.cursorPos) }
        : isSet(object.currentTime)
        ? { $case: "currentTime", currentTime: Number(object.currentTime) }
        : isSet(object.selectHitObject)
        ? { $case: "selectHitObject", selectHitObject: SelectHitObject.fromJSON(object.selectHitObject) }
        : isSet(object.createHitObject)
        ? { $case: "createHitObject", createHitObject: CreateHitObject.fromJSON(object.createHitObject) }
        : isSet(object.updateHitObject)
        ? { $case: "updateHitObject", updateHitObject: UpdateHitObject.fromJSON(object.updateHitObject) }
        : isSet(object.deleteHitObject)
        ? { $case: "deleteHitObject", deleteHitObject: DeleteHitObject.fromJSON(object.deleteHitObject) }
        : isSet(object.createTimingPoint)
        ? { $case: "createTimingPoint", createTimingPoint: CreateTimingPoint.fromJSON(object.createTimingPoint) }
        : isSet(object.updateTimingPoint)
        ? { $case: "updateTimingPoint", updateTimingPoint: UpdateTimingPoint.fromJSON(object.updateTimingPoint) }
        : isSet(object.deleteTimingPoint)
        ? { $case: "deleteTimingPoint", deleteTimingPoint: DeleteTimingPoint.fromJSON(object.deleteTimingPoint) }
        : isSet(object.setHitObjectOverrides)
        ? {
          $case: "setHitObjectOverrides",
          setHitObjectOverrides: HitObjectOverrideCommand.fromJSON(object.setHitObjectOverrides),
        }
        : undefined,
    };
  },

  toJSON(message: ClientToServerMessage): unknown {
    const obj: any = {};
    message.responseId !== undefined && (obj.responseId = message.responseId);
    message.clientCommand?.$case === "cursorPos" &&
      (obj.cursorPos = message.clientCommand?.cursorPos ? Vec2.toJSON(message.clientCommand?.cursorPos) : undefined);
    message.clientCommand?.$case === "currentTime" &&
      (obj.currentTime = Math.round(message.clientCommand?.currentTime));
    message.clientCommand?.$case === "selectHitObject" && (obj.selectHitObject = message.clientCommand?.selectHitObject
      ? SelectHitObject.toJSON(message.clientCommand?.selectHitObject)
      : undefined);
    message.clientCommand?.$case === "createHitObject" && (obj.createHitObject = message.clientCommand?.createHitObject
      ? CreateHitObject.toJSON(message.clientCommand?.createHitObject)
      : undefined);
    message.clientCommand?.$case === "updateHitObject" && (obj.updateHitObject = message.clientCommand?.updateHitObject
      ? UpdateHitObject.toJSON(message.clientCommand?.updateHitObject)
      : undefined);
    message.clientCommand?.$case === "deleteHitObject" && (obj.deleteHitObject = message.clientCommand?.deleteHitObject
      ? DeleteHitObject.toJSON(message.clientCommand?.deleteHitObject)
      : undefined);
    message.clientCommand?.$case === "createTimingPoint" &&
      (obj.createTimingPoint = message.clientCommand?.createTimingPoint
        ? CreateTimingPoint.toJSON(message.clientCommand?.createTimingPoint)
        : undefined);
    message.clientCommand?.$case === "updateTimingPoint" &&
      (obj.updateTimingPoint = message.clientCommand?.updateTimingPoint
        ? UpdateTimingPoint.toJSON(message.clientCommand?.updateTimingPoint)
        : undefined);
    message.clientCommand?.$case === "deleteTimingPoint" &&
      (obj.deleteTimingPoint = message.clientCommand?.deleteTimingPoint
        ? DeleteTimingPoint.toJSON(message.clientCommand?.deleteTimingPoint)
        : undefined);
    message.clientCommand?.$case === "setHitObjectOverrides" &&
      (obj.setHitObjectOverrides = message.clientCommand?.setHitObjectOverrides
        ? HitObjectOverrideCommand.toJSON(message.clientCommand?.setHitObjectOverrides)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ClientToServerMessage>, I>>(object: I): ClientToServerMessage {
    const message = createBaseClientToServerMessage();
    message.responseId = object.responseId ?? undefined;
    if (
      object.clientCommand?.$case === "cursorPos" &&
      object.clientCommand?.cursorPos !== undefined &&
      object.clientCommand?.cursorPos !== null
    ) {
      message.clientCommand = { $case: "cursorPos", cursorPos: Vec2.fromPartial(object.clientCommand.cursorPos) };
    }
    if (
      object.clientCommand?.$case === "currentTime" &&
      object.clientCommand?.currentTime !== undefined &&
      object.clientCommand?.currentTime !== null
    ) {
      message.clientCommand = { $case: "currentTime", currentTime: object.clientCommand.currentTime };
    }
    if (
      object.clientCommand?.$case === "selectHitObject" &&
      object.clientCommand?.selectHitObject !== undefined &&
      object.clientCommand?.selectHitObject !== null
    ) {
      message.clientCommand = {
        $case: "selectHitObject",
        selectHitObject: SelectHitObject.fromPartial(object.clientCommand.selectHitObject),
      };
    }
    if (
      object.clientCommand?.$case === "createHitObject" &&
      object.clientCommand?.createHitObject !== undefined &&
      object.clientCommand?.createHitObject !== null
    ) {
      message.clientCommand = {
        $case: "createHitObject",
        createHitObject: CreateHitObject.fromPartial(object.clientCommand.createHitObject),
      };
    }
    if (
      object.clientCommand?.$case === "updateHitObject" &&
      object.clientCommand?.updateHitObject !== undefined &&
      object.clientCommand?.updateHitObject !== null
    ) {
      message.clientCommand = {
        $case: "updateHitObject",
        updateHitObject: UpdateHitObject.fromPartial(object.clientCommand.updateHitObject),
      };
    }
    if (
      object.clientCommand?.$case === "deleteHitObject" &&
      object.clientCommand?.deleteHitObject !== undefined &&
      object.clientCommand?.deleteHitObject !== null
    ) {
      message.clientCommand = {
        $case: "deleteHitObject",
        deleteHitObject: DeleteHitObject.fromPartial(object.clientCommand.deleteHitObject),
      };
    }
    if (
      object.clientCommand?.$case === "createTimingPoint" &&
      object.clientCommand?.createTimingPoint !== undefined &&
      object.clientCommand?.createTimingPoint !== null
    ) {
      message.clientCommand = {
        $case: "createTimingPoint",
        createTimingPoint: CreateTimingPoint.fromPartial(object.clientCommand.createTimingPoint),
      };
    }
    if (
      object.clientCommand?.$case === "updateTimingPoint" &&
      object.clientCommand?.updateTimingPoint !== undefined &&
      object.clientCommand?.updateTimingPoint !== null
    ) {
      message.clientCommand = {
        $case: "updateTimingPoint",
        updateTimingPoint: UpdateTimingPoint.fromPartial(object.clientCommand.updateTimingPoint),
      };
    }
    if (
      object.clientCommand?.$case === "deleteTimingPoint" &&
      object.clientCommand?.deleteTimingPoint !== undefined &&
      object.clientCommand?.deleteTimingPoint !== null
    ) {
      message.clientCommand = {
        $case: "deleteTimingPoint",
        deleteTimingPoint: DeleteTimingPoint.fromPartial(object.clientCommand.deleteTimingPoint),
      };
    }
    if (
      object.clientCommand?.$case === "setHitObjectOverrides" &&
      object.clientCommand?.setHitObjectOverrides !== undefined &&
      object.clientCommand?.setHitObjectOverrides !== null
    ) {
      message.clientCommand = {
        $case: "setHitObjectOverrides",
        setHitObjectOverrides: HitObjectOverrideCommand.fromPartial(object.clientCommand.setHitObjectOverrides),
      };
    }
    return message;
  },
};

function createBaseServerTick(): ServerTick {
  return { userTicks: [] };
}

export const ServerTick = {
  encode(message: ServerTick, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.userTicks) {
      UserTick.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ServerTick {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseServerTick();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userTicks.push(UserTick.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ServerTick {
    return {
      userTicks: Array.isArray(object?.userTicks) ? object.userTicks.map((e: any) => UserTick.fromJSON(e)) : [],
    };
  },

  toJSON(message: ServerTick): unknown {
    const obj: any = {};
    if (message.userTicks) {
      obj.userTicks = message.userTicks.map((e) => e ? UserTick.toJSON(e) : undefined);
    } else {
      obj.userTicks = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ServerTick>, I>>(object: I): ServerTick {
    const message = createBaseServerTick();
    message.userTicks = object.userTicks?.map((e) => UserTick.fromPartial(e)) || [];
    return message;
  },
};

function createBaseUserTick(): UserTick {
  return { id: 0, cursorPos: undefined, currentTime: 0 };
}

export const UserTick = {
  encode(message: UserTick, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.cursorPos !== undefined) {
      Vec2.encode(message.cursorPos, writer.uint32(18).fork()).ldelim();
    }
    if (message.currentTime !== 0) {
      writer.uint32(24).int32(message.currentTime);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserTick {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserTick();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = longToNumber(reader.uint64() as Long);
          break;
        case 2:
          message.cursorPos = Vec2.decode(reader, reader.uint32());
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

  fromJSON(object: any): UserTick {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      cursorPos: isSet(object.cursorPos) ? Vec2.fromJSON(object.cursorPos) : undefined,
      currentTime: isSet(object.currentTime) ? Number(object.currentTime) : 0,
    };
  },

  toJSON(message: UserTick): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.cursorPos !== undefined && (obj.cursorPos = message.cursorPos ? Vec2.toJSON(message.cursorPos) : undefined);
    message.currentTime !== undefined && (obj.currentTime = Math.round(message.currentTime));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserTick>, I>>(object: I): UserTick {
    const message = createBaseUserTick();
    message.id = object.id ?? 0;
    message.cursorPos = (object.cursorPos !== undefined && object.cursorPos !== null)
      ? Vec2.fromPartial(object.cursorPos)
      : undefined;
    message.currentTime = object.currentTime ?? 0;
    return message;
  },
};

function createBaseUserInfo(): UserInfo {
  return { id: 0, displayName: "" };
}

export const UserInfo = {
  encode(message: UserInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.displayName !== "") {
      writer.uint32(18).string(message.displayName);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = longToNumber(reader.uint64() as Long);
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

  fromJSON(object: any): UserInfo {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      displayName: isSet(object.displayName) ? String(object.displayName) : "",
    };
  },

  toJSON(message: UserInfo): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.displayName !== undefined && (obj.displayName = message.displayName);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserInfo>, I>>(object: I): UserInfo {
    const message = createBaseUserInfo();
    message.id = object.id ?? 0;
    message.displayName = object.displayName ?? "";
    return message;
  },
};

function createBaseUserList(): UserList {
  return { users: [] };
}

export const UserList = {
  encode(message: UserList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.users) {
      UserInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.users.push(UserInfo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserList {
    return { users: Array.isArray(object?.users) ? object.users.map((e: any) => UserInfo.fromJSON(e)) : [] };
  },

  toJSON(message: UserList): unknown {
    const obj: any = {};
    if (message.users) {
      obj.users = message.users.map((e) => e ? UserInfo.toJSON(e) : undefined);
    } else {
      obj.users = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserList>, I>>(object: I): UserList {
    const message = createBaseUserList();
    message.users = object.users?.map((e) => UserInfo.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCreateHitObject(): CreateHitObject {
  return { hitObject: undefined };
}

export const CreateHitObject = {
  encode(message: CreateHitObject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.hitObject !== undefined) {
      HitObject.encode(message.hitObject, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateHitObject {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateHitObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hitObject = HitObject.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateHitObject {
    return { hitObject: isSet(object.hitObject) ? HitObject.fromJSON(object.hitObject) : undefined };
  },

  toJSON(message: CreateHitObject): unknown {
    const obj: any = {};
    message.hitObject !== undefined &&
      (obj.hitObject = message.hitObject ? HitObject.toJSON(message.hitObject) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateHitObject>, I>>(object: I): CreateHitObject {
    const message = createBaseCreateHitObject();
    message.hitObject = (object.hitObject !== undefined && object.hitObject !== null)
      ? HitObject.fromPartial(object.hitObject)
      : undefined;
    return message;
  },
};

function createBaseUpdateHitObject(): UpdateHitObject {
  return { hitObject: undefined };
}

export const UpdateHitObject = {
  encode(message: UpdateHitObject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.hitObject !== undefined) {
      HitObject.encode(message.hitObject, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateHitObject {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateHitObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hitObject = HitObject.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateHitObject {
    return { hitObject: isSet(object.hitObject) ? HitObject.fromJSON(object.hitObject) : undefined };
  },

  toJSON(message: UpdateHitObject): unknown {
    const obj: any = {};
    message.hitObject !== undefined &&
      (obj.hitObject = message.hitObject ? HitObject.toJSON(message.hitObject) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UpdateHitObject>, I>>(object: I): UpdateHitObject {
    const message = createBaseUpdateHitObject();
    message.hitObject = (object.hitObject !== undefined && object.hitObject !== null)
      ? HitObject.fromPartial(object.hitObject)
      : undefined;
    return message;
  },
};

function createBaseDeleteHitObject(): DeleteHitObject {
  return { ids: [] };
}

export const DeleteHitObject = {
  encode(message: DeleteHitObject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.uint32(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteHitObject {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteHitObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.uint32());
            }
          } else {
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

  fromJSON(object: any): DeleteHitObject {
    return { ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => Number(e)) : [] };
  },

  toJSON(message: DeleteHitObject): unknown {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map((e) => Math.round(e));
    } else {
      obj.ids = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeleteHitObject>, I>>(object: I): DeleteHitObject {
    const message = createBaseDeleteHitObject();
    message.ids = object.ids?.map((e) => e) || [];
    return message;
  },
};

function createBaseHitObjectSelected(): HitObjectSelected {
  return { ids: [], selectedBy: undefined };
}

export const HitObjectSelected = {
  encode(message: HitObjectSelected, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.uint32(v);
    }
    writer.ldelim();
    if (message.selectedBy !== undefined) {
      writer.uint32(16).uint64(message.selectedBy);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HitObjectSelected {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHitObjectSelected();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.uint32());
            }
          } else {
            message.ids.push(reader.uint32());
          }
          break;
        case 2:
          message.selectedBy = longToNumber(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HitObjectSelected {
    return {
      ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => Number(e)) : [],
      selectedBy: isSet(object.selectedBy) ? Number(object.selectedBy) : undefined,
    };
  },

  toJSON(message: HitObjectSelected): unknown {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map((e) => Math.round(e));
    } else {
      obj.ids = [];
    }
    message.selectedBy !== undefined && (obj.selectedBy = Math.round(message.selectedBy));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HitObjectSelected>, I>>(object: I): HitObjectSelected {
    const message = createBaseHitObjectSelected();
    message.ids = object.ids?.map((e) => e) || [];
    message.selectedBy = object.selectedBy ?? undefined;
    return message;
  },
};

function createBaseSelectHitObject(): SelectHitObject {
  return { ids: [], selected: false, unique: false };
}

export const SelectHitObject = {
  encode(message: SelectHitObject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
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

  decode(input: _m0.Reader | Uint8Array, length?: number): SelectHitObject {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSelectHitObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.uint32());
            }
          } else {
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

  fromJSON(object: any): SelectHitObject {
    return {
      ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => Number(e)) : [],
      selected: isSet(object.selected) ? Boolean(object.selected) : false,
      unique: isSet(object.unique) ? Boolean(object.unique) : false,
    };
  },

  toJSON(message: SelectHitObject): unknown {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map((e) => Math.round(e));
    } else {
      obj.ids = [];
    }
    message.selected !== undefined && (obj.selected = message.selected);
    message.unique !== undefined && (obj.unique = message.unique);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SelectHitObject>, I>>(object: I): SelectHitObject {
    const message = createBaseSelectHitObject();
    message.ids = object.ids?.map((e) => e) || [];
    message.selected = object.selected ?? false;
    message.unique = object.unique ?? false;
    return message;
  },
};

function createBaseEditorState(): EditorState {
  return { beatmap: undefined };
}

export const EditorState = {
  encode(message: EditorState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.beatmap !== undefined) {
      Beatmap.encode(message.beatmap, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EditorState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEditorState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.beatmap = Beatmap.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): EditorState {
    return { beatmap: isSet(object.beatmap) ? Beatmap.fromJSON(object.beatmap) : undefined };
  },

  toJSON(message: EditorState): unknown {
    const obj: any = {};
    message.beatmap !== undefined && (obj.beatmap = message.beatmap ? Beatmap.toJSON(message.beatmap) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<EditorState>, I>>(object: I): EditorState {
    const message = createBaseEditorState();
    message.beatmap = (object.beatmap !== undefined && object.beatmap !== null)
      ? Beatmap.fromPartial(object.beatmap)
      : undefined;
    return message;
  },
};

function createBaseCreateTimingPoint(): CreateTimingPoint {
  return { timingPoint: undefined };
}

export const CreateTimingPoint = {
  encode(message: CreateTimingPoint, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timingPoint !== undefined) {
      TimingPoint.encode(message.timingPoint, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateTimingPoint {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateTimingPoint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timingPoint = TimingPoint.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CreateTimingPoint {
    return { timingPoint: isSet(object.timingPoint) ? TimingPoint.fromJSON(object.timingPoint) : undefined };
  },

  toJSON(message: CreateTimingPoint): unknown {
    const obj: any = {};
    message.timingPoint !== undefined &&
      (obj.timingPoint = message.timingPoint ? TimingPoint.toJSON(message.timingPoint) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CreateTimingPoint>, I>>(object: I): CreateTimingPoint {
    const message = createBaseCreateTimingPoint();
    message.timingPoint = (object.timingPoint !== undefined && object.timingPoint !== null)
      ? TimingPoint.fromPartial(object.timingPoint)
      : undefined;
    return message;
  },
};

function createBaseUpdateTimingPoint(): UpdateTimingPoint {
  return { timingPoint: undefined };
}

export const UpdateTimingPoint = {
  encode(message: UpdateTimingPoint, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.timingPoint !== undefined) {
      TimingPoint.encode(message.timingPoint, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateTimingPoint {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateTimingPoint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timingPoint = TimingPoint.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UpdateTimingPoint {
    return { timingPoint: isSet(object.timingPoint) ? TimingPoint.fromJSON(object.timingPoint) : undefined };
  },

  toJSON(message: UpdateTimingPoint): unknown {
    const obj: any = {};
    message.timingPoint !== undefined &&
      (obj.timingPoint = message.timingPoint ? TimingPoint.toJSON(message.timingPoint) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UpdateTimingPoint>, I>>(object: I): UpdateTimingPoint {
    const message = createBaseUpdateTimingPoint();
    message.timingPoint = (object.timingPoint !== undefined && object.timingPoint !== null)
      ? TimingPoint.fromPartial(object.timingPoint)
      : undefined;
    return message;
  },
};

function createBaseDeleteTimingPoint(): DeleteTimingPoint {
  return { ids: [] };
}

export const DeleteTimingPoint = {
  encode(message: DeleteTimingPoint, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.uint32(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteTimingPoint {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteTimingPoint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.uint32());
            }
          } else {
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

  fromJSON(object: any): DeleteTimingPoint {
    return { ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => Number(e)) : [] };
  },

  toJSON(message: DeleteTimingPoint): unknown {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map((e) => Math.round(e));
    } else {
      obj.ids = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeleteTimingPoint>, I>>(object: I): DeleteTimingPoint {
    const message = createBaseDeleteTimingPoint();
    message.ids = object.ids?.map((e) => e) || [];
    return message;
  },
};

function createBaseHitObjectOverrideCommand(): HitObjectOverrideCommand {
  return { id: 0, overrides: undefined };
}

export const HitObjectOverrideCommand = {
  encode(message: HitObjectOverrideCommand, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint32(message.id);
    }
    if (message.overrides !== undefined) {
      HitObjectOverrides.encode(message.overrides, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HitObjectOverrideCommand {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHitObjectOverrideCommand();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint32();
          break;
        case 2:
          message.overrides = HitObjectOverrides.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HitObjectOverrideCommand {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      overrides: isSet(object.overrides) ? HitObjectOverrides.fromJSON(object.overrides) : undefined,
    };
  },

  toJSON(message: HitObjectOverrideCommand): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.overrides !== undefined &&
      (obj.overrides = message.overrides ? HitObjectOverrides.toJSON(message.overrides) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HitObjectOverrideCommand>, I>>(object: I): HitObjectOverrideCommand {
    const message = createBaseHitObjectOverrideCommand();
    message.id = object.id ?? 0;
    message.overrides = (object.overrides !== undefined && object.overrides !== null)
      ? HitObjectOverrides.fromPartial(object.overrides)
      : undefined;
    return message;
  },
};

function createBaseHitObjectOverrides(): HitObjectOverrides {
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

export const HitObjectOverrides = {
  encode(message: HitObjectOverrides, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.position !== undefined) {
      IVec2.encode(message.position, writer.uint32(10).fork()).ldelim();
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
      SliderControlPoints.encode(message.controlPoints, writer.uint32(42).fork()).ldelim();
    }
    if (message.expectedDistance !== undefined) {
      writer.uint32(53).float(message.expectedDistance);
    }
    if (message.repeatCount !== undefined) {
      writer.uint32(56).uint32(message.repeatCount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HitObjectOverrides {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHitObjectOverrides();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.position = IVec2.decode(reader, reader.uint32());
          break;
        case 2:
          message.time = reader.int32();
          break;
        case 3:
          message.selectedBy = longToNumber(reader.uint64() as Long);
          break;
        case 4:
          message.newCombo = reader.bool();
          break;
        case 5:
          message.controlPoints = SliderControlPoints.decode(reader, reader.uint32());
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

  fromJSON(object: any): HitObjectOverrides {
    return {
      position: isSet(object.position) ? IVec2.fromJSON(object.position) : undefined,
      time: isSet(object.time) ? Number(object.time) : undefined,
      selectedBy: isSet(object.selectedBy) ? Number(object.selectedBy) : undefined,
      newCombo: isSet(object.newCombo) ? Boolean(object.newCombo) : undefined,
      controlPoints: isSet(object.controlPoints) ? SliderControlPoints.fromJSON(object.controlPoints) : undefined,
      expectedDistance: isSet(object.expectedDistance) ? Number(object.expectedDistance) : undefined,
      repeatCount: isSet(object.repeatCount) ? Number(object.repeatCount) : undefined,
    };
  },

  toJSON(message: HitObjectOverrides): unknown {
    const obj: any = {};
    message.position !== undefined && (obj.position = message.position ? IVec2.toJSON(message.position) : undefined);
    message.time !== undefined && (obj.time = Math.round(message.time));
    message.selectedBy !== undefined && (obj.selectedBy = Math.round(message.selectedBy));
    message.newCombo !== undefined && (obj.newCombo = message.newCombo);
    message.controlPoints !== undefined &&
      (obj.controlPoints = message.controlPoints ? SliderControlPoints.toJSON(message.controlPoints) : undefined);
    message.expectedDistance !== undefined && (obj.expectedDistance = message.expectedDistance);
    message.repeatCount !== undefined && (obj.repeatCount = Math.round(message.repeatCount));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HitObjectOverrides>, I>>(object: I): HitObjectOverrides {
    const message = createBaseHitObjectOverrides();
    message.position = (object.position !== undefined && object.position !== null)
      ? IVec2.fromPartial(object.position)
      : undefined;
    message.time = object.time ?? undefined;
    message.selectedBy = object.selectedBy ?? undefined;
    message.newCombo = object.newCombo ?? undefined;
    message.controlPoints = (object.controlPoints !== undefined && object.controlPoints !== null)
      ? SliderControlPoints.fromPartial(object.controlPoints)
      : undefined;
    message.expectedDistance = object.expectedDistance ?? undefined;
    message.repeatCount = object.repeatCount ?? undefined;
    return message;
  },
};

function createBaseSliderControlPoints(): SliderControlPoints {
  return { controlPoints: [] };
}

export const SliderControlPoints = {
  encode(message: SliderControlPoints, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.controlPoints) {
      SliderControlPoint.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SliderControlPoints {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSliderControlPoints();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.controlPoints.push(SliderControlPoint.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SliderControlPoints {
    return {
      controlPoints: Array.isArray(object?.controlPoints)
        ? object.controlPoints.map((e: any) => SliderControlPoint.fromJSON(e))
        : [],
    };
  },

  toJSON(message: SliderControlPoints): unknown {
    const obj: any = {};
    if (message.controlPoints) {
      obj.controlPoints = message.controlPoints.map((e) => e ? SliderControlPoint.toJSON(e) : undefined);
    } else {
      obj.controlPoints = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SliderControlPoints>, I>>(object: I): SliderControlPoints {
    const message = createBaseSliderControlPoints();
    message.controlPoints = object.controlPoints?.map((e) => SliderControlPoint.fromPartial(e)) || [];
    return message;
  },
};

function createBaseHitObject(): HitObject {
  return { id: 0, selectedBy: undefined, startTime: 0, position: undefined, newCombo: false, kind: undefined };
}

export const HitObject = {
  encode(message: HitObject, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
      IVec2.encode(message.position, writer.uint32(34).fork()).ldelim();
    }
    if (message.newCombo === true) {
      writer.uint32(40).bool(message.newCombo);
    }
    if (message.kind?.$case === "circle") {
      HitCircle.encode(message.kind.circle, writer.uint32(50).fork()).ldelim();
    }
    if (message.kind?.$case === "slider") {
      Slider.encode(message.kind.slider, writer.uint32(58).fork()).ldelim();
    }
    if (message.kind?.$case === "spinner") {
      Spinner.encode(message.kind.spinner, writer.uint32(66).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HitObject {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHitObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
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
          message.position = IVec2.decode(reader, reader.uint32());
          break;
        case 5:
          message.newCombo = reader.bool();
          break;
        case 6:
          message.kind = { $case: "circle", circle: HitCircle.decode(reader, reader.uint32()) };
          break;
        case 7:
          message.kind = { $case: "slider", slider: Slider.decode(reader, reader.uint32()) };
          break;
        case 8:
          message.kind = { $case: "spinner", spinner: Spinner.decode(reader, reader.uint32()) };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HitObject {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      selectedBy: isSet(object.selectedBy) ? Number(object.selectedBy) : undefined,
      startTime: isSet(object.startTime) ? Number(object.startTime) : 0,
      position: isSet(object.position) ? IVec2.fromJSON(object.position) : undefined,
      newCombo: isSet(object.newCombo) ? Boolean(object.newCombo) : false,
      kind: isSet(object.circle)
        ? { $case: "circle", circle: HitCircle.fromJSON(object.circle) }
        : isSet(object.slider)
        ? { $case: "slider", slider: Slider.fromJSON(object.slider) }
        : isSet(object.spinner)
        ? { $case: "spinner", spinner: Spinner.fromJSON(object.spinner) }
        : undefined,
    };
  },

  toJSON(message: HitObject): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.selectedBy !== undefined && (obj.selectedBy = Math.round(message.selectedBy));
    message.startTime !== undefined && (obj.startTime = Math.round(message.startTime));
    message.position !== undefined && (obj.position = message.position ? IVec2.toJSON(message.position) : undefined);
    message.newCombo !== undefined && (obj.newCombo = message.newCombo);
    message.kind?.$case === "circle" &&
      (obj.circle = message.kind?.circle ? HitCircle.toJSON(message.kind?.circle) : undefined);
    message.kind?.$case === "slider" &&
      (obj.slider = message.kind?.slider ? Slider.toJSON(message.kind?.slider) : undefined);
    message.kind?.$case === "spinner" &&
      (obj.spinner = message.kind?.spinner ? Spinner.toJSON(message.kind?.spinner) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HitObject>, I>>(object: I): HitObject {
    const message = createBaseHitObject();
    message.id = object.id ?? 0;
    message.selectedBy = object.selectedBy ?? undefined;
    message.startTime = object.startTime ?? 0;
    message.position = (object.position !== undefined && object.position !== null)
      ? IVec2.fromPartial(object.position)
      : undefined;
    message.newCombo = object.newCombo ?? false;
    if (object.kind?.$case === "circle" && object.kind?.circle !== undefined && object.kind?.circle !== null) {
      message.kind = { $case: "circle", circle: HitCircle.fromPartial(object.kind.circle) };
    }
    if (object.kind?.$case === "slider" && object.kind?.slider !== undefined && object.kind?.slider !== null) {
      message.kind = { $case: "slider", slider: Slider.fromPartial(object.kind.slider) };
    }
    if (object.kind?.$case === "spinner" && object.kind?.spinner !== undefined && object.kind?.spinner !== null) {
      message.kind = { $case: "spinner", spinner: Spinner.fromPartial(object.kind.spinner) };
    }
    return message;
  },
};

function createBaseHitCircle(): HitCircle {
  return {};
}

export const HitCircle = {
  encode(_: HitCircle, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HitCircle {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHitCircle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): HitCircle {
    return {};
  },

  toJSON(_: HitCircle): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HitCircle>, I>>(_: I): HitCircle {
    const message = createBaseHitCircle();
    return message;
  },
};

function createBaseSpinner(): Spinner {
  return {};
}

export const Spinner = {
  encode(_: Spinner, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Spinner {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSpinner();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): Spinner {
    return {};
  },

  toJSON(_: Spinner): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Spinner>, I>>(_: I): Spinner {
    const message = createBaseSpinner();
    return message;
  },
};

function createBaseBeatmap(): Beatmap {
  return { difficulty: undefined, hitObjects: [], timingPoints: [] };
}

export const Beatmap = {
  encode(message: Beatmap, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.difficulty !== undefined) {
      Difficulty.encode(message.difficulty, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.hitObjects) {
      HitObject.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.timingPoints) {
      TimingPoint.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Beatmap {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBeatmap();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          message.difficulty = Difficulty.decode(reader, reader.uint32());
          break;
        case 4:
          message.hitObjects.push(HitObject.decode(reader, reader.uint32()));
          break;
        case 5:
          message.timingPoints.push(TimingPoint.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Beatmap {
    return {
      difficulty: isSet(object.difficulty) ? Difficulty.fromJSON(object.difficulty) : undefined,
      hitObjects: Array.isArray(object?.hitObjects) ? object.hitObjects.map((e: any) => HitObject.fromJSON(e)) : [],
      timingPoints: Array.isArray(object?.timingPoints)
        ? object.timingPoints.map((e: any) => TimingPoint.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Beatmap): unknown {
    const obj: any = {};
    message.difficulty !== undefined &&
      (obj.difficulty = message.difficulty ? Difficulty.toJSON(message.difficulty) : undefined);
    if (message.hitObjects) {
      obj.hitObjects = message.hitObjects.map((e) => e ? HitObject.toJSON(e) : undefined);
    } else {
      obj.hitObjects = [];
    }
    if (message.timingPoints) {
      obj.timingPoints = message.timingPoints.map((e) => e ? TimingPoint.toJSON(e) : undefined);
    } else {
      obj.timingPoints = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Beatmap>, I>>(object: I): Beatmap {
    const message = createBaseBeatmap();
    message.difficulty = (object.difficulty !== undefined && object.difficulty !== null)
      ? Difficulty.fromPartial(object.difficulty)
      : undefined;
    message.hitObjects = object.hitObjects?.map((e) => HitObject.fromPartial(e)) || [];
    message.timingPoints = object.timingPoints?.map((e) => TimingPoint.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDifficulty(): Difficulty {
  return {
    hpDrainRate: 0,
    circleSize: 0,
    overallDifficulty: 0,
    approachRate: 0,
    sliderMultiplier: 0,
    sliderTickRate: 0,
  };
}

export const Difficulty = {
  encode(message: Difficulty, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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

  decode(input: _m0.Reader | Uint8Array, length?: number): Difficulty {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDifficulty();
    while (reader.pos < end) {
      const tag = reader.uint32();
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

  fromJSON(object: any): Difficulty {
    return {
      hpDrainRate: isSet(object.hpDrainRate) ? Number(object.hpDrainRate) : 0,
      circleSize: isSet(object.circleSize) ? Number(object.circleSize) : 0,
      overallDifficulty: isSet(object.overallDifficulty) ? Number(object.overallDifficulty) : 0,
      approachRate: isSet(object.approachRate) ? Number(object.approachRate) : 0,
      sliderMultiplier: isSet(object.sliderMultiplier) ? Number(object.sliderMultiplier) : 0,
      sliderTickRate: isSet(object.sliderTickRate) ? Number(object.sliderTickRate) : 0,
    };
  },

  toJSON(message: Difficulty): unknown {
    const obj: any = {};
    message.hpDrainRate !== undefined && (obj.hpDrainRate = message.hpDrainRate);
    message.circleSize !== undefined && (obj.circleSize = message.circleSize);
    message.overallDifficulty !== undefined && (obj.overallDifficulty = message.overallDifficulty);
    message.approachRate !== undefined && (obj.approachRate = message.approachRate);
    message.sliderMultiplier !== undefined && (obj.sliderMultiplier = message.sliderMultiplier);
    message.sliderTickRate !== undefined && (obj.sliderTickRate = message.sliderTickRate);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Difficulty>, I>>(object: I): Difficulty {
    const message = createBaseDifficulty();
    message.hpDrainRate = object.hpDrainRate ?? 0;
    message.circleSize = object.circleSize ?? 0;
    message.overallDifficulty = object.overallDifficulty ?? 0;
    message.approachRate = object.approachRate ?? 0;
    message.sliderMultiplier = object.sliderMultiplier ?? 0;
    message.sliderTickRate = object.sliderTickRate ?? 0;
    return message;
  },
};

function createBaseSlider(): Slider {
  return { expectedDistance: 0, controlPoints: [], repeats: 0 };
}

export const Slider = {
  encode(message: Slider, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.expectedDistance !== 0) {
      writer.uint32(13).float(message.expectedDistance);
    }
    for (const v of message.controlPoints) {
      SliderControlPoint.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.repeats !== 0) {
      writer.uint32(24).uint32(message.repeats);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Slider {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSlider();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.expectedDistance = reader.float();
          break;
        case 2:
          message.controlPoints.push(SliderControlPoint.decode(reader, reader.uint32()));
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

  fromJSON(object: any): Slider {
    return {
      expectedDistance: isSet(object.expectedDistance) ? Number(object.expectedDistance) : 0,
      controlPoints: Array.isArray(object?.controlPoints)
        ? object.controlPoints.map((e: any) => SliderControlPoint.fromJSON(e))
        : [],
      repeats: isSet(object.repeats) ? Number(object.repeats) : 0,
    };
  },

  toJSON(message: Slider): unknown {
    const obj: any = {};
    message.expectedDistance !== undefined && (obj.expectedDistance = message.expectedDistance);
    if (message.controlPoints) {
      obj.controlPoints = message.controlPoints.map((e) => e ? SliderControlPoint.toJSON(e) : undefined);
    } else {
      obj.controlPoints = [];
    }
    message.repeats !== undefined && (obj.repeats = Math.round(message.repeats));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Slider>, I>>(object: I): Slider {
    const message = createBaseSlider();
    message.expectedDistance = object.expectedDistance ?? 0;
    message.controlPoints = object.controlPoints?.map((e) => SliderControlPoint.fromPartial(e)) || [];
    message.repeats = object.repeats ?? 0;
    return message;
  },
};

function createBaseSliderControlPoint(): SliderControlPoint {
  return { position: undefined, kind: 0 };
}

export const SliderControlPoint = {
  encode(message: SliderControlPoint, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.position !== undefined) {
      IVec2.encode(message.position, writer.uint32(10).fork()).ldelim();
    }
    if (message.kind !== 0) {
      writer.uint32(16).int32(message.kind);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SliderControlPoint {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSliderControlPoint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.position = IVec2.decode(reader, reader.uint32());
          break;
        case 2:
          message.kind = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SliderControlPoint {
    return {
      position: isSet(object.position) ? IVec2.fromJSON(object.position) : undefined,
      kind: isSet(object.kind) ? controlPointKindFromJSON(object.kind) : 0,
    };
  },

  toJSON(message: SliderControlPoint): unknown {
    const obj: any = {};
    message.position !== undefined && (obj.position = message.position ? IVec2.toJSON(message.position) : undefined);
    message.kind !== undefined && (obj.kind = controlPointKindToJSON(message.kind));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SliderControlPoint>, I>>(object: I): SliderControlPoint {
    const message = createBaseSliderControlPoint();
    message.position = (object.position !== undefined && object.position !== null)
      ? IVec2.fromPartial(object.position)
      : undefined;
    message.kind = object.kind ?? 0;
    return message;
  },
};

function createBaseTimingPoint(): TimingPoint {
  return { id: 0, offset: 0, timing: undefined, sv: undefined, volume: undefined };
}

export const TimingPoint = {
  encode(message: TimingPoint, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint32(message.id);
    }
    if (message.offset !== 0) {
      writer.uint32(16).int32(message.offset);
    }
    if (message.timing !== undefined) {
      TimingInformation.encode(message.timing, writer.uint32(26).fork()).ldelim();
    }
    if (message.sv !== undefined) {
      writer.uint32(37).float(message.sv);
    }
    if (message.volume !== undefined) {
      writer.uint32(45).float(message.volume);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TimingPoint {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimingPoint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint32();
          break;
        case 2:
          message.offset = reader.int32();
          break;
        case 3:
          message.timing = TimingInformation.decode(reader, reader.uint32());
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

  fromJSON(object: any): TimingPoint {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      offset: isSet(object.offset) ? Number(object.offset) : 0,
      timing: isSet(object.timing) ? TimingInformation.fromJSON(object.timing) : undefined,
      sv: isSet(object.sv) ? Number(object.sv) : undefined,
      volume: isSet(object.volume) ? Number(object.volume) : undefined,
    };
  },

  toJSON(message: TimingPoint): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.offset !== undefined && (obj.offset = Math.round(message.offset));
    message.timing !== undefined &&
      (obj.timing = message.timing ? TimingInformation.toJSON(message.timing) : undefined);
    message.sv !== undefined && (obj.sv = message.sv);
    message.volume !== undefined && (obj.volume = message.volume);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<TimingPoint>, I>>(object: I): TimingPoint {
    const message = createBaseTimingPoint();
    message.id = object.id ?? 0;
    message.offset = object.offset ?? 0;
    message.timing = (object.timing !== undefined && object.timing !== null)
      ? TimingInformation.fromPartial(object.timing)
      : undefined;
    message.sv = object.sv ?? undefined;
    message.volume = object.volume ?? undefined;
    return message;
  },
};

function createBaseTimingInformation(): TimingInformation {
  return { bpm: 0, signature: 0 };
}

export const TimingInformation = {
  encode(message: TimingInformation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bpm !== 0) {
      writer.uint32(13).float(message.bpm);
    }
    if (message.signature !== 0) {
      writer.uint32(16).uint32(message.signature);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TimingInformation {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimingInformation();
    while (reader.pos < end) {
      const tag = reader.uint32();
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

  fromJSON(object: any): TimingInformation {
    return {
      bpm: isSet(object.bpm) ? Number(object.bpm) : 0,
      signature: isSet(object.signature) ? Number(object.signature) : 0,
    };
  },

  toJSON(message: TimingInformation): unknown {
    const obj: any = {};
    message.bpm !== undefined && (obj.bpm = message.bpm);
    message.signature !== undefined && (obj.signature = Math.round(message.signature));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<TimingInformation>, I>>(object: I): TimingInformation {
    const message = createBaseTimingInformation();
    message.bpm = object.bpm ?? 0;
    message.signature = object.signature ?? 0;
    return message;
  },
};

function createBaseVec2(): Vec2 {
  return { x: 0, y: 0 };
}

export const Vec2 = {
  encode(message: Vec2, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.x !== 0) {
      writer.uint32(13).float(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(21).float(message.y);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Vec2 {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVec2();
    while (reader.pos < end) {
      const tag = reader.uint32();
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

  fromJSON(object: any): Vec2 {
    return { x: isSet(object.x) ? Number(object.x) : 0, y: isSet(object.y) ? Number(object.y) : 0 };
  },

  toJSON(message: Vec2): unknown {
    const obj: any = {};
    message.x !== undefined && (obj.x = message.x);
    message.y !== undefined && (obj.y = message.y);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Vec2>, I>>(object: I): Vec2 {
    const message = createBaseVec2();
    message.x = object.x ?? 0;
    message.y = object.y ?? 0;
    return message;
  },
};

function createBaseIVec2(): IVec2 {
  return { x: 0, y: 0 };
}

export const IVec2 = {
  encode(message: IVec2, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.x !== 0) {
      writer.uint32(8).int32(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(16).int32(message.y);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): IVec2 {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIVec2();
    while (reader.pos < end) {
      const tag = reader.uint32();
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

  fromJSON(object: any): IVec2 {
    return { x: isSet(object.x) ? Number(object.x) : 0, y: isSet(object.y) ? Number(object.y) : 0 };
  },

  toJSON(message: IVec2): unknown {
    const obj: any = {};
    message.x !== undefined && (obj.x = Math.round(message.x));
    message.y !== undefined && (obj.y = Math.round(message.y));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<IVec2>, I>>(object: I): IVec2 {
    const message = createBaseIVec2();
    message.x = object.x ?? 0;
    message.y = object.y ?? 0;
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
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

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
