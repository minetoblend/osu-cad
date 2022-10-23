import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "proto.commands";
export declare enum ControlPointKind {
    None = 0,
    Bezier = 1,
    Circle = 2,
    Linear = 3,
    UNRECOGNIZED = -1
}
export declare function controlPointKindFromJSON(object: any): ControlPointKind;
export declare function controlPointKindToJSON(object: ControlPointKind): string;
export interface ServerToClientMessage {
    responseId?: string | undefined;
    serverCommand?: {
        $case: "multiple";
        multiple: MultiServerToClientMessage;
    } | {
        $case: "heartbeat";
        heartbeat: number;
    } | {
        $case: "userJoined";
        userJoined: UserInfo;
    } | {
        $case: "userLeft";
        userLeft: UserInfo;
    } | {
        $case: "tick";
        tick: ServerTick;
    } | {
        $case: "userList";
        userList: UserList;
    } | {
        $case: "ownId";
        ownId: number;
    } | {
        $case: "hitObjectCreated";
        hitObjectCreated: HitObject;
    } | {
        $case: "hitObjectUpdated";
        hitObjectUpdated: HitObject;
    } | {
        $case: "hitObjectDeleted";
        hitObjectDeleted: number;
    } | {
        $case: "hitObjectSelected";
        hitObjectSelected: HitObjectSelected;
    } | {
        $case: "state";
        state: EditorState;
    } | {
        $case: "timingPointCreated";
        timingPointCreated: TimingPoint;
    } | {
        $case: "timingPointUpdated";
        timingPointUpdated: TimingPoint;
    } | {
        $case: "timingPointDeleted";
        timingPointDeleted: number;
    } | {
        $case: "hitObjectOverridden";
        hitObjectOverridden: HitObjectOverrideCommand;
    };
}
export interface MultiServerToClientMessage {
    messages: ServerToClientMessage[];
}
export interface ClientToServerMessage {
    responseId?: string | undefined;
    clientCommand?: {
        $case: "cursorPos";
        cursorPos: Vec2;
    } | {
        $case: "currentTime";
        currentTime: number;
    } | {
        $case: "selectHitObject";
        selectHitObject: SelectHitObject;
    } | {
        $case: "createHitObject";
        createHitObject: CreateHitObject;
    } | {
        $case: "updateHitObject";
        updateHitObject: UpdateHitObject;
    } | {
        $case: "deleteHitObject";
        deleteHitObject: DeleteHitObject;
    } | {
        $case: "createTimingPoint";
        createTimingPoint: CreateTimingPoint;
    } | {
        $case: "updateTimingPoint";
        updateTimingPoint: UpdateTimingPoint;
    } | {
        $case: "deleteTimingPoint";
        deleteTimingPoint: DeleteTimingPoint;
    } | {
        $case: "setHitObjectOverrides";
        setHitObjectOverrides: HitObjectOverrideCommand;
    };
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
    kind?: {
        $case: "circle";
        circle: HitCircle;
    } | {
        $case: "slider";
        slider: Slider;
    } | {
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
export declare const ServerToClientMessage: {
    encode(message: ServerToClientMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ServerToClientMessage;
    fromJSON(object: any): ServerToClientMessage;
    toJSON(message: ServerToClientMessage): unknown;
    fromPartial<I extends {
        responseId?: string | undefined;
        serverCommand?: ({
            multiple?: {
                messages?: any[];
            };
        } & {
            $case: "multiple";
        }) | ({
            heartbeat?: number;
        } & {
            $case: "heartbeat";
        }) | ({
            userJoined?: {
                id?: number;
                displayName?: string;
            };
        } & {
            $case: "userJoined";
        }) | ({
            userLeft?: {
                id?: number;
                displayName?: string;
            };
        } & {
            $case: "userLeft";
        }) | ({
            tick?: {
                userTicks?: {
                    id?: number;
                    cursorPos?: {
                        x?: number;
                        y?: number;
                    };
                    currentTime?: number;
                }[];
            };
        } & {
            $case: "tick";
        }) | ({
            userList?: {
                users?: {
                    id?: number;
                    displayName?: string;
                }[];
            };
        } & {
            $case: "userList";
        }) | ({
            ownId?: number;
        } & {
            $case: "ownId";
        }) | ({
            hitObjectCreated?: {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            };
        } & {
            $case: "hitObjectCreated";
        }) | ({
            hitObjectUpdated?: {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            };
        } & {
            $case: "hitObjectUpdated";
        }) | ({
            hitObjectDeleted?: number;
        } & {
            $case: "hitObjectDeleted";
        }) | ({
            hitObjectSelected?: {
                ids?: number[];
                selectedBy?: number | undefined;
            };
        } & {
            $case: "hitObjectSelected";
        }) | ({
            state?: {
                beatmap?: {
                    difficulty?: {
                        hpDrainRate?: number;
                        circleSize?: number;
                        overallDifficulty?: number;
                        approachRate?: number;
                        sliderMultiplier?: number;
                        sliderTickRate?: number;
                    };
                    hitObjects?: {
                        id?: number;
                        selectedBy?: number | undefined;
                        startTime?: number;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        newCombo?: boolean;
                        kind?: ({
                            circle?: {};
                        } & {
                            $case: "circle";
                        }) | ({
                            slider?: {
                                expectedDistance?: number;
                                controlPoints?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[];
                                repeats?: number;
                            };
                        } & {
                            $case: "slider";
                        }) | ({
                            spinner?: {};
                        } & {
                            $case: "spinner";
                        });
                    }[];
                    timingPoints?: {
                        id?: number;
                        offset?: number;
                        timing?: {
                            bpm?: number;
                            signature?: number;
                        };
                        sv?: number | undefined;
                        volume?: number | undefined;
                    }[];
                };
            };
        } & {
            $case: "state";
        }) | ({
            timingPointCreated?: {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            };
        } & {
            $case: "timingPointCreated";
        }) | ({
            timingPointUpdated?: {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            };
        } & {
            $case: "timingPointUpdated";
        }) | ({
            timingPointDeleted?: number;
        } & {
            $case: "timingPointDeleted";
        }) | ({
            hitObjectOverridden?: {
                id?: number;
                overrides?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    time?: number | undefined;
                    selectedBy?: number | undefined;
                    newCombo?: boolean | undefined;
                    controlPoints?: {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                    };
                    expectedDistance?: number | undefined;
                    repeatCount?: number | undefined;
                };
            };
        } & {
            $case: "hitObjectOverridden";
        });
    } & {
        responseId?: string | undefined;
        serverCommand?: ({
            multiple?: {
                messages?: any[];
            };
        } & {
            $case: "multiple";
        } & {
            multiple?: {
                messages?: any[];
            } & {
                messages?: any[] & ({
                    responseId?: string | undefined;
                    serverCommand?: ({
                        multiple?: {
                            messages?: any[];
                        };
                    } & {
                        $case: "multiple";
                    }) | ({
                        heartbeat?: number;
                    } & {
                        $case: "heartbeat";
                    }) | ({
                        userJoined?: {
                            id?: number;
                            displayName?: string;
                        };
                    } & {
                        $case: "userJoined";
                    }) | ({
                        userLeft?: {
                            id?: number;
                            displayName?: string;
                        };
                    } & {
                        $case: "userLeft";
                    }) | ({
                        tick?: {
                            userTicks?: {
                                id?: number;
                                cursorPos?: {
                                    x?: number;
                                    y?: number;
                                };
                                currentTime?: number;
                            }[];
                        };
                    } & {
                        $case: "tick";
                    }) | ({
                        userList?: {
                            users?: {
                                id?: number;
                                displayName?: string;
                            }[];
                        };
                    } & {
                        $case: "userList";
                    }) | ({
                        ownId?: number;
                    } & {
                        $case: "ownId";
                    }) | ({
                        hitObjectCreated?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        };
                    } & {
                        $case: "hitObjectCreated";
                    }) | ({
                        hitObjectUpdated?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        };
                    } & {
                        $case: "hitObjectUpdated";
                    }) | ({
                        hitObjectDeleted?: number;
                    } & {
                        $case: "hitObjectDeleted";
                    }) | ({
                        hitObjectSelected?: {
                            ids?: number[];
                            selectedBy?: number | undefined;
                        };
                    } & {
                        $case: "hitObjectSelected";
                    }) | ({
                        state?: {
                            beatmap?: {
                                difficulty?: {
                                    hpDrainRate?: number;
                                    circleSize?: number;
                                    overallDifficulty?: number;
                                    approachRate?: number;
                                    sliderMultiplier?: number;
                                    sliderTickRate?: number;
                                };
                                hitObjects?: {
                                    id?: number;
                                    selectedBy?: number | undefined;
                                    startTime?: number;
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    newCombo?: boolean;
                                    kind?: ({
                                        circle?: {};
                                    } & {
                                        $case: "circle";
                                    }) | ({
                                        slider?: {
                                            expectedDistance?: number;
                                            controlPoints?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[];
                                            repeats?: number;
                                        };
                                    } & {
                                        $case: "slider";
                                    }) | ({
                                        spinner?: {};
                                    } & {
                                        $case: "spinner";
                                    });
                                }[];
                                timingPoints?: {
                                    id?: number;
                                    offset?: number;
                                    timing?: {
                                        bpm?: number;
                                        signature?: number;
                                    };
                                    sv?: number | undefined;
                                    volume?: number | undefined;
                                }[];
                            };
                        };
                    } & {
                        $case: "state";
                    }) | ({
                        timingPointCreated?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        };
                    } & {
                        $case: "timingPointCreated";
                    }) | ({
                        timingPointUpdated?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        };
                    } & {
                        $case: "timingPointUpdated";
                    }) | ({
                        timingPointDeleted?: number;
                    } & {
                        $case: "timingPointDeleted";
                    }) | ({
                        hitObjectOverridden?: {
                            id?: number;
                            overrides?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                time?: number | undefined;
                                selectedBy?: number | undefined;
                                newCombo?: boolean | undefined;
                                controlPoints?: {
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                };
                                expectedDistance?: number | undefined;
                                repeatCount?: number | undefined;
                            };
                        };
                    } & {
                        $case: "hitObjectOverridden";
                    });
                } & {
                    responseId?: string | undefined;
                    serverCommand?: ({
                        multiple?: {
                            messages?: any[];
                        };
                    } & {
                        $case: "multiple";
                    } & {
                        multiple?: {
                            messages?: any[];
                        } & {
                            messages?: any[] & ({
                                responseId?: string | undefined;
                                serverCommand?: ({
                                    multiple?: {
                                        messages?: any[];
                                    };
                                } & {
                                    $case: "multiple";
                                }) | ({
                                    heartbeat?: number;
                                } & {
                                    $case: "heartbeat";
                                }) | ({
                                    userJoined?: {
                                        id?: number;
                                        displayName?: string;
                                    };
                                } & {
                                    $case: "userJoined";
                                }) | ({
                                    userLeft?: {
                                        id?: number;
                                        displayName?: string;
                                    };
                                } & {
                                    $case: "userLeft";
                                }) | ({
                                    tick?: {
                                        userTicks?: {
                                            id?: number;
                                            cursorPos?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            currentTime?: number;
                                        }[];
                                    };
                                } & {
                                    $case: "tick";
                                }) | ({
                                    userList?: {
                                        users?: {
                                            id?: number;
                                            displayName?: string;
                                        }[];
                                    };
                                } & {
                                    $case: "userList";
                                }) | ({
                                    ownId?: number;
                                } & {
                                    $case: "ownId";
                                }) | ({
                                    hitObjectCreated?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    };
                                } & {
                                    $case: "hitObjectCreated";
                                }) | ({
                                    hitObjectUpdated?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    };
                                } & {
                                    $case: "hitObjectUpdated";
                                }) | ({
                                    hitObjectDeleted?: number;
                                } & {
                                    $case: "hitObjectDeleted";
                                }) | ({
                                    hitObjectSelected?: {
                                        ids?: number[];
                                        selectedBy?: number | undefined;
                                    };
                                } & {
                                    $case: "hitObjectSelected";
                                }) | ({
                                    state?: {
                                        beatmap?: {
                                            difficulty?: {
                                                hpDrainRate?: number;
                                                circleSize?: number;
                                                overallDifficulty?: number;
                                                approachRate?: number;
                                                sliderMultiplier?: number;
                                                sliderTickRate?: number;
                                            };
                                            hitObjects?: {
                                                id?: number;
                                                selectedBy?: number | undefined;
                                                startTime?: number;
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                newCombo?: boolean;
                                                kind?: ({
                                                    circle?: {};
                                                } & {
                                                    $case: "circle";
                                                }) | ({
                                                    slider?: {
                                                        expectedDistance?: number;
                                                        controlPoints?: {
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            kind?: ControlPointKind;
                                                        }[];
                                                        repeats?: number;
                                                    };
                                                } & {
                                                    $case: "slider";
                                                }) | ({
                                                    spinner?: {};
                                                } & {
                                                    $case: "spinner";
                                                });
                                            }[];
                                            timingPoints?: {
                                                id?: number;
                                                offset?: number;
                                                timing?: {
                                                    bpm?: number;
                                                    signature?: number;
                                                };
                                                sv?: number | undefined;
                                                volume?: number | undefined;
                                            }[];
                                        };
                                    };
                                } & {
                                    $case: "state";
                                }) | ({
                                    timingPointCreated?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    };
                                } & {
                                    $case: "timingPointCreated";
                                }) | ({
                                    timingPointUpdated?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    };
                                } & {
                                    $case: "timingPointUpdated";
                                }) | ({
                                    timingPointDeleted?: number;
                                } & {
                                    $case: "timingPointDeleted";
                                }) | ({
                                    hitObjectOverridden?: {
                                        id?: number;
                                        overrides?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            time?: number | undefined;
                                            selectedBy?: number | undefined;
                                            newCombo?: boolean | undefined;
                                            controlPoints?: {
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                            };
                                            expectedDistance?: number | undefined;
                                            repeatCount?: number | undefined;
                                        };
                                    };
                                } & {
                                    $case: "hitObjectOverridden";
                                });
                            } & {
                                responseId?: string | undefined;
                                serverCommand?: ({
                                    multiple?: {
                                        messages?: any[];
                                    };
                                } & {
                                    $case: "multiple";
                                } & {
                                    multiple?: {
                                        messages?: any[];
                                    } & {
                                        messages?: any[] & ({
                                            responseId?: string | undefined;
                                            serverCommand?: ({
                                                multiple?: {
                                                    messages?: any[];
                                                };
                                            } & {
                                                $case: "multiple";
                                            }) | ({
                                                heartbeat?: number;
                                            } & {
                                                $case: "heartbeat";
                                            }) | ({
                                                userJoined?: {
                                                    id?: number;
                                                    displayName?: string;
                                                };
                                            } & {
                                                $case: "userJoined";
                                            }) | ({
                                                userLeft?: {
                                                    id?: number;
                                                    displayName?: string;
                                                };
                                            } & {
                                                $case: "userLeft";
                                            }) | ({
                                                tick?: {
                                                    userTicks?: {
                                                        id?: number;
                                                        cursorPos?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        currentTime?: number;
                                                    }[];
                                                };
                                            } & {
                                                $case: "tick";
                                            }) | ({
                                                userList?: {
                                                    users?: {
                                                        id?: number;
                                                        displayName?: string;
                                                    }[];
                                                };
                                            } & {
                                                $case: "userList";
                                            }) | ({
                                                ownId?: number;
                                            } & {
                                                $case: "ownId";
                                            }) | ({
                                                hitObjectCreated?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                };
                                            } & {
                                                $case: "hitObjectCreated";
                                            }) | ({
                                                hitObjectUpdated?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                };
                                            } & {
                                                $case: "hitObjectUpdated";
                                            }) | ({
                                                hitObjectDeleted?: number;
                                            } & {
                                                $case: "hitObjectDeleted";
                                            }) | ({
                                                hitObjectSelected?: {
                                                    ids?: number[];
                                                    selectedBy?: number | undefined;
                                                };
                                            } & {
                                                $case: "hitObjectSelected";
                                            }) | ({
                                                state?: {
                                                    beatmap?: {
                                                        difficulty?: {
                                                            hpDrainRate?: number;
                                                            circleSize?: number;
                                                            overallDifficulty?: number;
                                                            approachRate?: number;
                                                            sliderMultiplier?: number;
                                                            sliderTickRate?: number;
                                                        };
                                                        hitObjects?: {
                                                            id?: number;
                                                            selectedBy?: number | undefined;
                                                            startTime?: number;
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            newCombo?: boolean;
                                                            kind?: ({
                                                                circle?: {};
                                                            } & {
                                                                $case: "circle";
                                                            }) | ({
                                                                slider?: {
                                                                    expectedDistance?: number;
                                                                    controlPoints?: {
                                                                        position?: {
                                                                            x?: number;
                                                                            y?: number;
                                                                        };
                                                                        kind?: ControlPointKind;
                                                                    }[];
                                                                    repeats?: number;
                                                                };
                                                            } & {
                                                                $case: "slider";
                                                            }) | ({
                                                                spinner?: {};
                                                            } & {
                                                                $case: "spinner";
                                                            });
                                                        }[];
                                                        timingPoints?: {
                                                            id?: number;
                                                            offset?: number;
                                                            timing?: {
                                                                bpm?: number;
                                                                signature?: number;
                                                            };
                                                            sv?: number | undefined;
                                                            volume?: number | undefined;
                                                        }[];
                                                    };
                                                };
                                            } & {
                                                $case: "state";
                                            }) | ({
                                                timingPointCreated?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                };
                                            } & {
                                                $case: "timingPointCreated";
                                            }) | ({
                                                timingPointUpdated?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                };
                                            } & {
                                                $case: "timingPointUpdated";
                                            }) | ({
                                                timingPointDeleted?: number;
                                            } & {
                                                $case: "timingPointDeleted";
                                            }) | ({
                                                hitObjectOverridden?: {
                                                    id?: number;
                                                    overrides?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        time?: number | undefined;
                                                        selectedBy?: number | undefined;
                                                        newCombo?: boolean | undefined;
                                                        controlPoints?: {
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                        };
                                                        expectedDistance?: number | undefined;
                                                        repeatCount?: number | undefined;
                                                    };
                                                };
                                            } & {
                                                $case: "hitObjectOverridden";
                                            });
                                        } & {
                                            responseId?: string | undefined;
                                            serverCommand?: ({
                                                multiple?: {
                                                    messages?: any[];
                                                };
                                            } & {
                                                $case: "multiple";
                                            } & {
                                                multiple?: {
                                                    messages?: any[];
                                                } & any & { [K in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"], "messages">]: never; };
                                                $case: "multiple";
                                            } & { [K_1 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "multiple" | "$case">]: never; }) | ({
                                                heartbeat?: number;
                                            } & {
                                                $case: "heartbeat";
                                            } & {
                                                heartbeat?: number;
                                                $case: "heartbeat";
                                            } & { [K_2 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "heartbeat" | "$case">]: never; }) | ({
                                                userJoined?: {
                                                    id?: number;
                                                    displayName?: string;
                                                };
                                            } & {
                                                $case: "userJoined";
                                            } & {
                                                userJoined?: {
                                                    id?: number;
                                                    displayName?: string;
                                                } & any & { [K_3 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userJoined"], keyof UserInfo>]: never; };
                                                $case: "userJoined";
                                            } & { [K_4 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userJoined" | "$case">]: never; }) | ({
                                                userLeft?: {
                                                    id?: number;
                                                    displayName?: string;
                                                };
                                            } & {
                                                $case: "userLeft";
                                            } & {
                                                userLeft?: {
                                                    id?: number;
                                                    displayName?: string;
                                                } & any & { [K_5 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userLeft"], keyof UserInfo>]: never; };
                                                $case: "userLeft";
                                            } & { [K_6 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userLeft" | "$case">]: never; }) | ({
                                                tick?: {
                                                    userTicks?: {
                                                        id?: number;
                                                        cursorPos?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        currentTime?: number;
                                                    }[];
                                                };
                                            } & {
                                                $case: "tick";
                                            } & {
                                                tick?: {
                                                    userTicks?: {
                                                        id?: number;
                                                        cursorPos?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        currentTime?: number;
                                                    }[];
                                                } & any & { [K_7 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"], "userTicks">]: never; };
                                                $case: "tick";
                                            } & { [K_8 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "tick" | "$case">]: never; }) | ({
                                                userList?: {
                                                    users?: {
                                                        id?: number;
                                                        displayName?: string;
                                                    }[];
                                                };
                                            } & {
                                                $case: "userList";
                                            } & {
                                                userList?: {
                                                    users?: {
                                                        id?: number;
                                                        displayName?: string;
                                                    }[];
                                                } & any & { [K_9 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"], "users">]: never; };
                                                $case: "userList";
                                            } & { [K_10 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userList" | "$case">]: never; }) | ({
                                                ownId?: number;
                                            } & {
                                                $case: "ownId";
                                            } & {
                                                ownId?: number;
                                                $case: "ownId";
                                            } & { [K_11 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "ownId" | "$case">]: never; }) | ({
                                                hitObjectCreated?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                };
                                            } & {
                                                $case: "hitObjectCreated";
                                            } & {
                                                hitObjectCreated?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                } & any & { [K_12 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"], keyof HitObject>]: never; };
                                                $case: "hitObjectCreated";
                                            } & { [K_13 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectCreated" | "$case">]: never; }) | ({
                                                hitObjectUpdated?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                };
                                            } & {
                                                $case: "hitObjectUpdated";
                                            } & {
                                                hitObjectUpdated?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                } & any & { [K_14 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"], keyof HitObject>]: never; };
                                                $case: "hitObjectUpdated";
                                            } & { [K_15 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectUpdated" | "$case">]: never; }) | ({
                                                hitObjectDeleted?: number;
                                            } & {
                                                $case: "hitObjectDeleted";
                                            } & {
                                                hitObjectDeleted?: number;
                                                $case: "hitObjectDeleted";
                                            } & { [K_16 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectDeleted" | "$case">]: never; }) | ({
                                                hitObjectSelected?: {
                                                    ids?: number[];
                                                    selectedBy?: number | undefined;
                                                };
                                            } & {
                                                $case: "hitObjectSelected";
                                            } & {
                                                hitObjectSelected?: {
                                                    ids?: number[];
                                                    selectedBy?: number | undefined;
                                                } & any & { [K_17 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectSelected"], keyof HitObjectSelected>]: never; };
                                                $case: "hitObjectSelected";
                                            } & { [K_18 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectSelected" | "$case">]: never; }) | ({
                                                state?: {
                                                    beatmap?: {
                                                        difficulty?: {
                                                            hpDrainRate?: number;
                                                            circleSize?: number;
                                                            overallDifficulty?: number;
                                                            approachRate?: number;
                                                            sliderMultiplier?: number;
                                                            sliderTickRate?: number;
                                                        };
                                                        hitObjects?: {
                                                            id?: number;
                                                            selectedBy?: number | undefined;
                                                            startTime?: number;
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            newCombo?: boolean;
                                                            kind?: ({
                                                                circle?: {};
                                                            } & {
                                                                $case: "circle";
                                                            }) | ({
                                                                slider?: {
                                                                    expectedDistance?: number;
                                                                    controlPoints?: {
                                                                        position?: {
                                                                            x?: number;
                                                                            y?: number;
                                                                        };
                                                                        kind?: ControlPointKind;
                                                                    }[];
                                                                    repeats?: number;
                                                                };
                                                            } & {
                                                                $case: "slider";
                                                            }) | ({
                                                                spinner?: {};
                                                            } & {
                                                                $case: "spinner";
                                                            });
                                                        }[];
                                                        timingPoints?: {
                                                            id?: number;
                                                            offset?: number;
                                                            timing?: {
                                                                bpm?: number;
                                                                signature?: number;
                                                            };
                                                            sv?: number | undefined;
                                                            volume?: number | undefined;
                                                        }[];
                                                    };
                                                };
                                            } & {
                                                $case: "state";
                                            } & {
                                                state?: {
                                                    beatmap?: {
                                                        difficulty?: {
                                                            hpDrainRate?: number;
                                                            circleSize?: number;
                                                            overallDifficulty?: number;
                                                            approachRate?: number;
                                                            sliderMultiplier?: number;
                                                            sliderTickRate?: number;
                                                        };
                                                        hitObjects?: {
                                                            id?: number;
                                                            selectedBy?: number | undefined;
                                                            startTime?: number;
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            newCombo?: boolean;
                                                            kind?: ({
                                                                circle?: {};
                                                            } & {
                                                                $case: "circle";
                                                            }) | ({
                                                                slider?: {
                                                                    expectedDistance?: number;
                                                                    controlPoints?: {
                                                                        position?: {
                                                                            x?: number;
                                                                            y?: number;
                                                                        };
                                                                        kind?: ControlPointKind;
                                                                    }[];
                                                                    repeats?: number;
                                                                };
                                                            } & {
                                                                $case: "slider";
                                                            }) | ({
                                                                spinner?: {};
                                                            } & {
                                                                $case: "spinner";
                                                            });
                                                        }[];
                                                        timingPoints?: {
                                                            id?: number;
                                                            offset?: number;
                                                            timing?: {
                                                                bpm?: number;
                                                                signature?: number;
                                                            };
                                                            sv?: number | undefined;
                                                            volume?: number | undefined;
                                                        }[];
                                                    };
                                                } & any & { [K_19 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"], "beatmap">]: never; };
                                                $case: "state";
                                            } & { [K_20 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "state" | "$case">]: never; }) | ({
                                                timingPointCreated?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                };
                                            } & {
                                                $case: "timingPointCreated";
                                            } & {
                                                timingPointCreated?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                } & any & { [K_21 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointCreated"], keyof TimingPoint>]: never; };
                                                $case: "timingPointCreated";
                                            } & { [K_22 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointCreated" | "$case">]: never; }) | ({
                                                timingPointUpdated?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                };
                                            } & {
                                                $case: "timingPointUpdated";
                                            } & {
                                                timingPointUpdated?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                } & any & { [K_23 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointUpdated"], keyof TimingPoint>]: never; };
                                                $case: "timingPointUpdated";
                                            } & { [K_24 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointUpdated" | "$case">]: never; }) | ({
                                                timingPointDeleted?: number;
                                            } & {
                                                $case: "timingPointDeleted";
                                            } & {
                                                timingPointDeleted?: number;
                                                $case: "timingPointDeleted";
                                            } & { [K_25 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointDeleted" | "$case">]: never; }) | ({
                                                hitObjectOverridden?: {
                                                    id?: number;
                                                    overrides?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        time?: number | undefined;
                                                        selectedBy?: number | undefined;
                                                        newCombo?: boolean | undefined;
                                                        controlPoints?: {
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                        };
                                                        expectedDistance?: number | undefined;
                                                        repeatCount?: number | undefined;
                                                    };
                                                };
                                            } & {
                                                $case: "hitObjectOverridden";
                                            } & {
                                                hitObjectOverridden?: {
                                                    id?: number;
                                                    overrides?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        time?: number | undefined;
                                                        selectedBy?: number | undefined;
                                                        newCombo?: boolean | undefined;
                                                        controlPoints?: {
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                        };
                                                        expectedDistance?: number | undefined;
                                                        repeatCount?: number | undefined;
                                                    };
                                                } & any & { [K_26 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"], keyof HitObjectOverrideCommand>]: never; };
                                                $case: "hitObjectOverridden";
                                            } & { [K_27 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectOverridden" | "$case">]: never; });
                                        } & { [K_28 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number], keyof ServerToClientMessage>]: never; })[] & { [K_29 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"], keyof any[]>]: never; };
                                    } & { [K_30 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"], "messages">]: never; };
                                    $case: "multiple";
                                } & { [K_31 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "multiple" | "$case">]: never; }) | ({
                                    heartbeat?: number;
                                } & {
                                    $case: "heartbeat";
                                } & {
                                    heartbeat?: number;
                                    $case: "heartbeat";
                                } & { [K_32 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "heartbeat" | "$case">]: never; }) | ({
                                    userJoined?: {
                                        id?: number;
                                        displayName?: string;
                                    };
                                } & {
                                    $case: "userJoined";
                                } & {
                                    userJoined?: {
                                        id?: number;
                                        displayName?: string;
                                    } & {
                                        id?: number;
                                        displayName?: string;
                                    } & { [K_33 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userJoined"], keyof UserInfo>]: never; };
                                    $case: "userJoined";
                                } & { [K_34 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userJoined" | "$case">]: never; }) | ({
                                    userLeft?: {
                                        id?: number;
                                        displayName?: string;
                                    };
                                } & {
                                    $case: "userLeft";
                                } & {
                                    userLeft?: {
                                        id?: number;
                                        displayName?: string;
                                    } & {
                                        id?: number;
                                        displayName?: string;
                                    } & { [K_35 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userLeft"], keyof UserInfo>]: never; };
                                    $case: "userLeft";
                                } & { [K_36 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userLeft" | "$case">]: never; }) | ({
                                    tick?: {
                                        userTicks?: {
                                            id?: number;
                                            cursorPos?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            currentTime?: number;
                                        }[];
                                    };
                                } & {
                                    $case: "tick";
                                } & {
                                    tick?: {
                                        userTicks?: {
                                            id?: number;
                                            cursorPos?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            currentTime?: number;
                                        }[];
                                    } & {
                                        userTicks?: {
                                            id?: number;
                                            cursorPos?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            currentTime?: number;
                                        }[] & ({
                                            id?: number;
                                            cursorPos?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            currentTime?: number;
                                        } & {
                                            id?: number;
                                            cursorPos?: {
                                                x?: number;
                                                y?: number;
                                            } & {
                                                x?: number;
                                                y?: number;
                                            } & { [K_37 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"][number]["cursorPos"], keyof Vec2>]: never; };
                                            currentTime?: number;
                                        } & { [K_38 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"][number], keyof UserTick>]: never; })[] & { [K_39 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"], keyof {
                                            id?: number;
                                            cursorPos?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            currentTime?: number;
                                        }[]>]: never; };
                                    } & { [K_40 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"], "userTicks">]: never; };
                                    $case: "tick";
                                } & { [K_41 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "tick" | "$case">]: never; }) | ({
                                    userList?: {
                                        users?: {
                                            id?: number;
                                            displayName?: string;
                                        }[];
                                    };
                                } & {
                                    $case: "userList";
                                } & {
                                    userList?: {
                                        users?: {
                                            id?: number;
                                            displayName?: string;
                                        }[];
                                    } & {
                                        users?: {
                                            id?: number;
                                            displayName?: string;
                                        }[] & ({
                                            id?: number;
                                            displayName?: string;
                                        } & {
                                            id?: number;
                                            displayName?: string;
                                        } & { [K_42 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"]["users"][number], keyof UserInfo>]: never; })[] & { [K_43 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"]["users"], keyof {
                                            id?: number;
                                            displayName?: string;
                                        }[]>]: never; };
                                    } & { [K_44 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"], "users">]: never; };
                                    $case: "userList";
                                } & { [K_45 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userList" | "$case">]: never; }) | ({
                                    ownId?: number;
                                } & {
                                    $case: "ownId";
                                } & {
                                    ownId?: number;
                                    $case: "ownId";
                                } & { [K_46 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "ownId" | "$case">]: never; }) | ({
                                    hitObjectCreated?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    };
                                } & {
                                    $case: "hitObjectCreated";
                                } & {
                                    hitObjectCreated?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    } & {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        } & {
                                            x?: number;
                                            y?: number;
                                        } & { [K_47 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["position"], keyof IVec2>]: never; };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        } & {
                                            circle?: {} & {} & { [K_48 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["circle"], never>]: never; };
                                            $case: "circle";
                                        } & { [K_49 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "circle" | "$case">]: never; }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        } & {
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            } & {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[] & ({
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                } & any & { [K_50 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_51 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"], keyof {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[]>]: never; };
                                                repeats?: number;
                                            } & { [K_52 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"], keyof Slider>]: never; };
                                            $case: "slider";
                                        } & { [K_53 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "slider" | "$case">]: never; }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        } & {
                                            spinner?: {} & {} & { [K_54 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["spinner"], never>]: never; };
                                            $case: "spinner";
                                        } & { [K_55 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "spinner" | "$case">]: never; });
                                    } & { [K_56 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"], keyof HitObject>]: never; };
                                    $case: "hitObjectCreated";
                                } & { [K_57 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectCreated" | "$case">]: never; }) | ({
                                    hitObjectUpdated?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    };
                                } & {
                                    $case: "hitObjectUpdated";
                                } & {
                                    hitObjectUpdated?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    } & {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        } & {
                                            x?: number;
                                            y?: number;
                                        } & { [K_58 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["position"], keyof IVec2>]: never; };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        } & {
                                            circle?: {} & {} & { [K_59 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["circle"], never>]: never; };
                                            $case: "circle";
                                        } & { [K_60 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "circle" | "$case">]: never; }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        } & {
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            } & {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[] & ({
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                } & any & { [K_61 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_62 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"], keyof {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[]>]: never; };
                                                repeats?: number;
                                            } & { [K_63 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"], keyof Slider>]: never; };
                                            $case: "slider";
                                        } & { [K_64 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "slider" | "$case">]: never; }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        } & {
                                            spinner?: {} & {} & { [K_65 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["spinner"], never>]: never; };
                                            $case: "spinner";
                                        } & { [K_66 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "spinner" | "$case">]: never; });
                                    } & { [K_67 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"], keyof HitObject>]: never; };
                                    $case: "hitObjectUpdated";
                                } & { [K_68 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectUpdated" | "$case">]: never; }) | ({
                                    hitObjectDeleted?: number;
                                } & {
                                    $case: "hitObjectDeleted";
                                } & {
                                    hitObjectDeleted?: number;
                                    $case: "hitObjectDeleted";
                                } & { [K_69 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectDeleted" | "$case">]: never; }) | ({
                                    hitObjectSelected?: {
                                        ids?: number[];
                                        selectedBy?: number | undefined;
                                    };
                                } & {
                                    $case: "hitObjectSelected";
                                } & {
                                    hitObjectSelected?: {
                                        ids?: number[];
                                        selectedBy?: number | undefined;
                                    } & {
                                        ids?: number[] & number[] & { [K_70 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectSelected"]["ids"], keyof number[]>]: never; };
                                        selectedBy?: number | undefined;
                                    } & { [K_71 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectSelected"], keyof HitObjectSelected>]: never; };
                                    $case: "hitObjectSelected";
                                } & { [K_72 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectSelected" | "$case">]: never; }) | ({
                                    state?: {
                                        beatmap?: {
                                            difficulty?: {
                                                hpDrainRate?: number;
                                                circleSize?: number;
                                                overallDifficulty?: number;
                                                approachRate?: number;
                                                sliderMultiplier?: number;
                                                sliderTickRate?: number;
                                            };
                                            hitObjects?: {
                                                id?: number;
                                                selectedBy?: number | undefined;
                                                startTime?: number;
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                newCombo?: boolean;
                                                kind?: ({
                                                    circle?: {};
                                                } & {
                                                    $case: "circle";
                                                }) | ({
                                                    slider?: {
                                                        expectedDistance?: number;
                                                        controlPoints?: {
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            kind?: ControlPointKind;
                                                        }[];
                                                        repeats?: number;
                                                    };
                                                } & {
                                                    $case: "slider";
                                                }) | ({
                                                    spinner?: {};
                                                } & {
                                                    $case: "spinner";
                                                });
                                            }[];
                                            timingPoints?: {
                                                id?: number;
                                                offset?: number;
                                                timing?: {
                                                    bpm?: number;
                                                    signature?: number;
                                                };
                                                sv?: number | undefined;
                                                volume?: number | undefined;
                                            }[];
                                        };
                                    };
                                } & {
                                    $case: "state";
                                } & {
                                    state?: {
                                        beatmap?: {
                                            difficulty?: {
                                                hpDrainRate?: number;
                                                circleSize?: number;
                                                overallDifficulty?: number;
                                                approachRate?: number;
                                                sliderMultiplier?: number;
                                                sliderTickRate?: number;
                                            };
                                            hitObjects?: {
                                                id?: number;
                                                selectedBy?: number | undefined;
                                                startTime?: number;
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                newCombo?: boolean;
                                                kind?: ({
                                                    circle?: {};
                                                } & {
                                                    $case: "circle";
                                                }) | ({
                                                    slider?: {
                                                        expectedDistance?: number;
                                                        controlPoints?: {
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            kind?: ControlPointKind;
                                                        }[];
                                                        repeats?: number;
                                                    };
                                                } & {
                                                    $case: "slider";
                                                }) | ({
                                                    spinner?: {};
                                                } & {
                                                    $case: "spinner";
                                                });
                                            }[];
                                            timingPoints?: {
                                                id?: number;
                                                offset?: number;
                                                timing?: {
                                                    bpm?: number;
                                                    signature?: number;
                                                };
                                                sv?: number | undefined;
                                                volume?: number | undefined;
                                            }[];
                                        };
                                    } & {
                                        beatmap?: {
                                            difficulty?: {
                                                hpDrainRate?: number;
                                                circleSize?: number;
                                                overallDifficulty?: number;
                                                approachRate?: number;
                                                sliderMultiplier?: number;
                                                sliderTickRate?: number;
                                            };
                                            hitObjects?: {
                                                id?: number;
                                                selectedBy?: number | undefined;
                                                startTime?: number;
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                newCombo?: boolean;
                                                kind?: ({
                                                    circle?: {};
                                                } & {
                                                    $case: "circle";
                                                }) | ({
                                                    slider?: {
                                                        expectedDistance?: number;
                                                        controlPoints?: {
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            kind?: ControlPointKind;
                                                        }[];
                                                        repeats?: number;
                                                    };
                                                } & {
                                                    $case: "slider";
                                                }) | ({
                                                    spinner?: {};
                                                } & {
                                                    $case: "spinner";
                                                });
                                            }[];
                                            timingPoints?: {
                                                id?: number;
                                                offset?: number;
                                                timing?: {
                                                    bpm?: number;
                                                    signature?: number;
                                                };
                                                sv?: number | undefined;
                                                volume?: number | undefined;
                                            }[];
                                        } & {
                                            difficulty?: {
                                                hpDrainRate?: number;
                                                circleSize?: number;
                                                overallDifficulty?: number;
                                                approachRate?: number;
                                                sliderMultiplier?: number;
                                                sliderTickRate?: number;
                                            } & {
                                                hpDrainRate?: number;
                                                circleSize?: number;
                                                overallDifficulty?: number;
                                                approachRate?: number;
                                                sliderMultiplier?: number;
                                                sliderTickRate?: number;
                                            } & { [K_73 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["difficulty"], keyof Difficulty>]: never; };
                                            hitObjects?: {
                                                id?: number;
                                                selectedBy?: number | undefined;
                                                startTime?: number;
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                newCombo?: boolean;
                                                kind?: ({
                                                    circle?: {};
                                                } & {
                                                    $case: "circle";
                                                }) | ({
                                                    slider?: {
                                                        expectedDistance?: number;
                                                        controlPoints?: {
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            kind?: ControlPointKind;
                                                        }[];
                                                        repeats?: number;
                                                    };
                                                } & {
                                                    $case: "slider";
                                                }) | ({
                                                    spinner?: {};
                                                } & {
                                                    $case: "spinner";
                                                });
                                            }[] & ({
                                                id?: number;
                                                selectedBy?: number | undefined;
                                                startTime?: number;
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                newCombo?: boolean;
                                                kind?: ({
                                                    circle?: {};
                                                } & {
                                                    $case: "circle";
                                                }) | ({
                                                    slider?: {
                                                        expectedDistance?: number;
                                                        controlPoints?: {
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            kind?: ControlPointKind;
                                                        }[];
                                                        repeats?: number;
                                                    };
                                                } & {
                                                    $case: "slider";
                                                }) | ({
                                                    spinner?: {};
                                                } & {
                                                    $case: "spinner";
                                                });
                                            } & {
                                                id?: number;
                                                selectedBy?: number | undefined;
                                                startTime?: number;
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                } & any & { [K_74 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["position"], keyof IVec2>]: never; };
                                                newCombo?: boolean;
                                                kind?: ({
                                                    circle?: {};
                                                } & {
                                                    $case: "circle";
                                                } & any & { [K_75 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "circle" | "$case">]: never; }) | ({
                                                    slider?: {
                                                        expectedDistance?: number;
                                                        controlPoints?: {
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            kind?: ControlPointKind;
                                                        }[];
                                                        repeats?: number;
                                                    };
                                                } & {
                                                    $case: "slider";
                                                } & any & { [K_76 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "slider" | "$case">]: never; }) | ({
                                                    spinner?: {};
                                                } & {
                                                    $case: "spinner";
                                                } & any & { [K_77 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "spinner" | "$case">]: never; });
                                            } & { [K_78 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number], keyof HitObject>]: never; })[] & { [K_79 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"], keyof {
                                                id?: number;
                                                selectedBy?: number | undefined;
                                                startTime?: number;
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                newCombo?: boolean;
                                                kind?: ({
                                                    circle?: {};
                                                } & {
                                                    $case: "circle";
                                                }) | ({
                                                    slider?: {
                                                        expectedDistance?: number;
                                                        controlPoints?: {
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            kind?: ControlPointKind;
                                                        }[];
                                                        repeats?: number;
                                                    };
                                                } & {
                                                    $case: "slider";
                                                }) | ({
                                                    spinner?: {};
                                                } & {
                                                    $case: "spinner";
                                                });
                                            }[]>]: never; };
                                            timingPoints?: {
                                                id?: number;
                                                offset?: number;
                                                timing?: {
                                                    bpm?: number;
                                                    signature?: number;
                                                };
                                                sv?: number | undefined;
                                                volume?: number | undefined;
                                            }[] & ({
                                                id?: number;
                                                offset?: number;
                                                timing?: {
                                                    bpm?: number;
                                                    signature?: number;
                                                };
                                                sv?: number | undefined;
                                                volume?: number | undefined;
                                            } & {
                                                id?: number;
                                                offset?: number;
                                                timing?: {
                                                    bpm?: number;
                                                    signature?: number;
                                                } & any & { [K_80 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"][number]["timing"], keyof TimingInformation>]: never; };
                                                sv?: number | undefined;
                                                volume?: number | undefined;
                                            } & { [K_81 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"][number], keyof TimingPoint>]: never; })[] & { [K_82 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"], keyof {
                                                id?: number;
                                                offset?: number;
                                                timing?: {
                                                    bpm?: number;
                                                    signature?: number;
                                                };
                                                sv?: number | undefined;
                                                volume?: number | undefined;
                                            }[]>]: never; };
                                        } & { [K_83 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"], keyof Beatmap>]: never; };
                                    } & { [K_84 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"], "beatmap">]: never; };
                                    $case: "state";
                                } & { [K_85 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "state" | "$case">]: never; }) | ({
                                    timingPointCreated?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    };
                                } & {
                                    $case: "timingPointCreated";
                                } & {
                                    timingPointCreated?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    } & {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        } & {
                                            bpm?: number;
                                            signature?: number;
                                        } & { [K_86 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointCreated"]["timing"], keyof TimingInformation>]: never; };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    } & { [K_87 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointCreated"], keyof TimingPoint>]: never; };
                                    $case: "timingPointCreated";
                                } & { [K_88 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointCreated" | "$case">]: never; }) | ({
                                    timingPointUpdated?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    };
                                } & {
                                    $case: "timingPointUpdated";
                                } & {
                                    timingPointUpdated?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    } & {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        } & {
                                            bpm?: number;
                                            signature?: number;
                                        } & { [K_89 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointUpdated"]["timing"], keyof TimingInformation>]: never; };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    } & { [K_90 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointUpdated"], keyof TimingPoint>]: never; };
                                    $case: "timingPointUpdated";
                                } & { [K_91 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointUpdated" | "$case">]: never; }) | ({
                                    timingPointDeleted?: number;
                                } & {
                                    $case: "timingPointDeleted";
                                } & {
                                    timingPointDeleted?: number;
                                    $case: "timingPointDeleted";
                                } & { [K_92 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointDeleted" | "$case">]: never; }) | ({
                                    hitObjectOverridden?: {
                                        id?: number;
                                        overrides?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            time?: number | undefined;
                                            selectedBy?: number | undefined;
                                            newCombo?: boolean | undefined;
                                            controlPoints?: {
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                            };
                                            expectedDistance?: number | undefined;
                                            repeatCount?: number | undefined;
                                        };
                                    };
                                } & {
                                    $case: "hitObjectOverridden";
                                } & {
                                    hitObjectOverridden?: {
                                        id?: number;
                                        overrides?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            time?: number | undefined;
                                            selectedBy?: number | undefined;
                                            newCombo?: boolean | undefined;
                                            controlPoints?: {
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                            };
                                            expectedDistance?: number | undefined;
                                            repeatCount?: number | undefined;
                                        };
                                    } & {
                                        id?: number;
                                        overrides?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            time?: number | undefined;
                                            selectedBy?: number | undefined;
                                            newCombo?: boolean | undefined;
                                            controlPoints?: {
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                            };
                                            expectedDistance?: number | undefined;
                                            repeatCount?: number | undefined;
                                        } & {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            } & {
                                                x?: number;
                                                y?: number;
                                            } & { [K_93 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["position"], keyof IVec2>]: never; };
                                            time?: number | undefined;
                                            selectedBy?: number | undefined;
                                            newCombo?: boolean | undefined;
                                            controlPoints?: {
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                            } & {
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[] & ({
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                } & any & { [K_94 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_95 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"], keyof {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[]>]: never; };
                                            } & { [K_96 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"], "controlPoints">]: never; };
                                            expectedDistance?: number | undefined;
                                            repeatCount?: number | undefined;
                                        } & { [K_97 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"], keyof HitObjectOverrides>]: never; };
                                    } & { [K_98 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"], keyof HitObjectOverrideCommand>]: never; };
                                    $case: "hitObjectOverridden";
                                } & { [K_99 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectOverridden" | "$case">]: never; });
                            } & { [K_100 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number], keyof ServerToClientMessage>]: never; })[] & { [K_101 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"], keyof any[]>]: never; };
                        } & { [K_102 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"], "messages">]: never; };
                        $case: "multiple";
                    } & { [K_103 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "multiple" | "$case">]: never; }) | ({
                        heartbeat?: number;
                    } & {
                        $case: "heartbeat";
                    } & {
                        heartbeat?: number;
                        $case: "heartbeat";
                    } & { [K_104 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "heartbeat" | "$case">]: never; }) | ({
                        userJoined?: {
                            id?: number;
                            displayName?: string;
                        };
                    } & {
                        $case: "userJoined";
                    } & {
                        userJoined?: {
                            id?: number;
                            displayName?: string;
                        } & {
                            id?: number;
                            displayName?: string;
                        } & { [K_105 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userJoined"], keyof UserInfo>]: never; };
                        $case: "userJoined";
                    } & { [K_106 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userJoined" | "$case">]: never; }) | ({
                        userLeft?: {
                            id?: number;
                            displayName?: string;
                        };
                    } & {
                        $case: "userLeft";
                    } & {
                        userLeft?: {
                            id?: number;
                            displayName?: string;
                        } & {
                            id?: number;
                            displayName?: string;
                        } & { [K_107 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userLeft"], keyof UserInfo>]: never; };
                        $case: "userLeft";
                    } & { [K_108 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userLeft" | "$case">]: never; }) | ({
                        tick?: {
                            userTicks?: {
                                id?: number;
                                cursorPos?: {
                                    x?: number;
                                    y?: number;
                                };
                                currentTime?: number;
                            }[];
                        };
                    } & {
                        $case: "tick";
                    } & {
                        tick?: {
                            userTicks?: {
                                id?: number;
                                cursorPos?: {
                                    x?: number;
                                    y?: number;
                                };
                                currentTime?: number;
                            }[];
                        } & {
                            userTicks?: {
                                id?: number;
                                cursorPos?: {
                                    x?: number;
                                    y?: number;
                                };
                                currentTime?: number;
                            }[] & ({
                                id?: number;
                                cursorPos?: {
                                    x?: number;
                                    y?: number;
                                };
                                currentTime?: number;
                            } & {
                                id?: number;
                                cursorPos?: {
                                    x?: number;
                                    y?: number;
                                } & {
                                    x?: number;
                                    y?: number;
                                } & { [K_109 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"][number]["cursorPos"], keyof Vec2>]: never; };
                                currentTime?: number;
                            } & { [K_110 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"][number], keyof UserTick>]: never; })[] & { [K_111 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"], keyof {
                                id?: number;
                                cursorPos?: {
                                    x?: number;
                                    y?: number;
                                };
                                currentTime?: number;
                            }[]>]: never; };
                        } & { [K_112 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"], "userTicks">]: never; };
                        $case: "tick";
                    } & { [K_113 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "tick" | "$case">]: never; }) | ({
                        userList?: {
                            users?: {
                                id?: number;
                                displayName?: string;
                            }[];
                        };
                    } & {
                        $case: "userList";
                    } & {
                        userList?: {
                            users?: {
                                id?: number;
                                displayName?: string;
                            }[];
                        } & {
                            users?: {
                                id?: number;
                                displayName?: string;
                            }[] & ({
                                id?: number;
                                displayName?: string;
                            } & {
                                id?: number;
                                displayName?: string;
                            } & { [K_114 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"]["users"][number], keyof UserInfo>]: never; })[] & { [K_115 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"]["users"], keyof {
                                id?: number;
                                displayName?: string;
                            }[]>]: never; };
                        } & { [K_116 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"], "users">]: never; };
                        $case: "userList";
                    } & { [K_117 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userList" | "$case">]: never; }) | ({
                        ownId?: number;
                    } & {
                        $case: "ownId";
                    } & {
                        ownId?: number;
                        $case: "ownId";
                    } & { [K_118 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "ownId" | "$case">]: never; }) | ({
                        hitObjectCreated?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        };
                    } & {
                        $case: "hitObjectCreated";
                    } & {
                        hitObjectCreated?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        } & {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            } & {
                                x?: number;
                                y?: number;
                            } & { [K_119 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["position"], keyof IVec2>]: never; };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            } & {
                                circle?: {} & {} & { [K_120 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["circle"], never>]: never; };
                                $case: "circle";
                            } & { [K_121 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "circle" | "$case">]: never; }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            } & {
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                } & {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[] & ({
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    } & {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        } & {
                                            x?: number;
                                            y?: number;
                                        } & { [K_122 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                        kind?: ControlPointKind;
                                    } & { [K_123 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_124 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"], keyof {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[]>]: never; };
                                    repeats?: number;
                                } & { [K_125 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"], keyof Slider>]: never; };
                                $case: "slider";
                            } & { [K_126 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "slider" | "$case">]: never; }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            } & {
                                spinner?: {} & {} & { [K_127 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["spinner"], never>]: never; };
                                $case: "spinner";
                            } & { [K_128 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "spinner" | "$case">]: never; });
                        } & { [K_129 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"], keyof HitObject>]: never; };
                        $case: "hitObjectCreated";
                    } & { [K_130 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectCreated" | "$case">]: never; }) | ({
                        hitObjectUpdated?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        };
                    } & {
                        $case: "hitObjectUpdated";
                    } & {
                        hitObjectUpdated?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        } & {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            } & {
                                x?: number;
                                y?: number;
                            } & { [K_131 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["position"], keyof IVec2>]: never; };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            } & {
                                circle?: {} & {} & { [K_132 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["circle"], never>]: never; };
                                $case: "circle";
                            } & { [K_133 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "circle" | "$case">]: never; }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            } & {
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                } & {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[] & ({
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    } & {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        } & {
                                            x?: number;
                                            y?: number;
                                        } & { [K_134 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                        kind?: ControlPointKind;
                                    } & { [K_135 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_136 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"], keyof {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[]>]: never; };
                                    repeats?: number;
                                } & { [K_137 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"], keyof Slider>]: never; };
                                $case: "slider";
                            } & { [K_138 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "slider" | "$case">]: never; }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            } & {
                                spinner?: {} & {} & { [K_139 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["spinner"], never>]: never; };
                                $case: "spinner";
                            } & { [K_140 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "spinner" | "$case">]: never; });
                        } & { [K_141 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"], keyof HitObject>]: never; };
                        $case: "hitObjectUpdated";
                    } & { [K_142 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectUpdated" | "$case">]: never; }) | ({
                        hitObjectDeleted?: number;
                    } & {
                        $case: "hitObjectDeleted";
                    } & {
                        hitObjectDeleted?: number;
                        $case: "hitObjectDeleted";
                    } & { [K_143 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectDeleted" | "$case">]: never; }) | ({
                        hitObjectSelected?: {
                            ids?: number[];
                            selectedBy?: number | undefined;
                        };
                    } & {
                        $case: "hitObjectSelected";
                    } & {
                        hitObjectSelected?: {
                            ids?: number[];
                            selectedBy?: number | undefined;
                        } & {
                            ids?: number[] & number[] & { [K_144 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectSelected"]["ids"], keyof number[]>]: never; };
                            selectedBy?: number | undefined;
                        } & { [K_145 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectSelected"], keyof HitObjectSelected>]: never; };
                        $case: "hitObjectSelected";
                    } & { [K_146 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectSelected" | "$case">]: never; }) | ({
                        state?: {
                            beatmap?: {
                                difficulty?: {
                                    hpDrainRate?: number;
                                    circleSize?: number;
                                    overallDifficulty?: number;
                                    approachRate?: number;
                                    sliderMultiplier?: number;
                                    sliderTickRate?: number;
                                };
                                hitObjects?: {
                                    id?: number;
                                    selectedBy?: number | undefined;
                                    startTime?: number;
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    newCombo?: boolean;
                                    kind?: ({
                                        circle?: {};
                                    } & {
                                        $case: "circle";
                                    }) | ({
                                        slider?: {
                                            expectedDistance?: number;
                                            controlPoints?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[];
                                            repeats?: number;
                                        };
                                    } & {
                                        $case: "slider";
                                    }) | ({
                                        spinner?: {};
                                    } & {
                                        $case: "spinner";
                                    });
                                }[];
                                timingPoints?: {
                                    id?: number;
                                    offset?: number;
                                    timing?: {
                                        bpm?: number;
                                        signature?: number;
                                    };
                                    sv?: number | undefined;
                                    volume?: number | undefined;
                                }[];
                            };
                        };
                    } & {
                        $case: "state";
                    } & {
                        state?: {
                            beatmap?: {
                                difficulty?: {
                                    hpDrainRate?: number;
                                    circleSize?: number;
                                    overallDifficulty?: number;
                                    approachRate?: number;
                                    sliderMultiplier?: number;
                                    sliderTickRate?: number;
                                };
                                hitObjects?: {
                                    id?: number;
                                    selectedBy?: number | undefined;
                                    startTime?: number;
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    newCombo?: boolean;
                                    kind?: ({
                                        circle?: {};
                                    } & {
                                        $case: "circle";
                                    }) | ({
                                        slider?: {
                                            expectedDistance?: number;
                                            controlPoints?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[];
                                            repeats?: number;
                                        };
                                    } & {
                                        $case: "slider";
                                    }) | ({
                                        spinner?: {};
                                    } & {
                                        $case: "spinner";
                                    });
                                }[];
                                timingPoints?: {
                                    id?: number;
                                    offset?: number;
                                    timing?: {
                                        bpm?: number;
                                        signature?: number;
                                    };
                                    sv?: number | undefined;
                                    volume?: number | undefined;
                                }[];
                            };
                        } & {
                            beatmap?: {
                                difficulty?: {
                                    hpDrainRate?: number;
                                    circleSize?: number;
                                    overallDifficulty?: number;
                                    approachRate?: number;
                                    sliderMultiplier?: number;
                                    sliderTickRate?: number;
                                };
                                hitObjects?: {
                                    id?: number;
                                    selectedBy?: number | undefined;
                                    startTime?: number;
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    newCombo?: boolean;
                                    kind?: ({
                                        circle?: {};
                                    } & {
                                        $case: "circle";
                                    }) | ({
                                        slider?: {
                                            expectedDistance?: number;
                                            controlPoints?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[];
                                            repeats?: number;
                                        };
                                    } & {
                                        $case: "slider";
                                    }) | ({
                                        spinner?: {};
                                    } & {
                                        $case: "spinner";
                                    });
                                }[];
                                timingPoints?: {
                                    id?: number;
                                    offset?: number;
                                    timing?: {
                                        bpm?: number;
                                        signature?: number;
                                    };
                                    sv?: number | undefined;
                                    volume?: number | undefined;
                                }[];
                            } & {
                                difficulty?: {
                                    hpDrainRate?: number;
                                    circleSize?: number;
                                    overallDifficulty?: number;
                                    approachRate?: number;
                                    sliderMultiplier?: number;
                                    sliderTickRate?: number;
                                } & {
                                    hpDrainRate?: number;
                                    circleSize?: number;
                                    overallDifficulty?: number;
                                    approachRate?: number;
                                    sliderMultiplier?: number;
                                    sliderTickRate?: number;
                                } & { [K_147 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["difficulty"], keyof Difficulty>]: never; };
                                hitObjects?: {
                                    id?: number;
                                    selectedBy?: number | undefined;
                                    startTime?: number;
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    newCombo?: boolean;
                                    kind?: ({
                                        circle?: {};
                                    } & {
                                        $case: "circle";
                                    }) | ({
                                        slider?: {
                                            expectedDistance?: number;
                                            controlPoints?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[];
                                            repeats?: number;
                                        };
                                    } & {
                                        $case: "slider";
                                    }) | ({
                                        spinner?: {};
                                    } & {
                                        $case: "spinner";
                                    });
                                }[] & ({
                                    id?: number;
                                    selectedBy?: number | undefined;
                                    startTime?: number;
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    newCombo?: boolean;
                                    kind?: ({
                                        circle?: {};
                                    } & {
                                        $case: "circle";
                                    }) | ({
                                        slider?: {
                                            expectedDistance?: number;
                                            controlPoints?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[];
                                            repeats?: number;
                                        };
                                    } & {
                                        $case: "slider";
                                    }) | ({
                                        spinner?: {};
                                    } & {
                                        $case: "spinner";
                                    });
                                } & {
                                    id?: number;
                                    selectedBy?: number | undefined;
                                    startTime?: number;
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    } & {
                                        x?: number;
                                        y?: number;
                                    } & { [K_148 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["position"], keyof IVec2>]: never; };
                                    newCombo?: boolean;
                                    kind?: ({
                                        circle?: {};
                                    } & {
                                        $case: "circle";
                                    } & {
                                        circle?: {} & {} & { [K_149 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["circle"], never>]: never; };
                                        $case: "circle";
                                    } & { [K_150 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "circle" | "$case">]: never; }) | ({
                                        slider?: {
                                            expectedDistance?: number;
                                            controlPoints?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[];
                                            repeats?: number;
                                        };
                                    } & {
                                        $case: "slider";
                                    } & {
                                        slider?: {
                                            expectedDistance?: number;
                                            controlPoints?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[];
                                            repeats?: number;
                                        } & {
                                            expectedDistance?: number;
                                            controlPoints?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[] & ({
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            } & {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                } & any & { [K_151 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                                kind?: ControlPointKind;
                                            } & { [K_152 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_153 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"], keyof {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[]>]: never; };
                                            repeats?: number;
                                        } & { [K_154 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"], keyof Slider>]: never; };
                                        $case: "slider";
                                    } & { [K_155 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "slider" | "$case">]: never; }) | ({
                                        spinner?: {};
                                    } & {
                                        $case: "spinner";
                                    } & {
                                        spinner?: {} & {} & { [K_156 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["spinner"], never>]: never; };
                                        $case: "spinner";
                                    } & { [K_157 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "spinner" | "$case">]: never; });
                                } & { [K_158 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number], keyof HitObject>]: never; })[] & { [K_159 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"], keyof {
                                    id?: number;
                                    selectedBy?: number | undefined;
                                    startTime?: number;
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    newCombo?: boolean;
                                    kind?: ({
                                        circle?: {};
                                    } & {
                                        $case: "circle";
                                    }) | ({
                                        slider?: {
                                            expectedDistance?: number;
                                            controlPoints?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                kind?: ControlPointKind;
                                            }[];
                                            repeats?: number;
                                        };
                                    } & {
                                        $case: "slider";
                                    }) | ({
                                        spinner?: {};
                                    } & {
                                        $case: "spinner";
                                    });
                                }[]>]: never; };
                                timingPoints?: {
                                    id?: number;
                                    offset?: number;
                                    timing?: {
                                        bpm?: number;
                                        signature?: number;
                                    };
                                    sv?: number | undefined;
                                    volume?: number | undefined;
                                }[] & ({
                                    id?: number;
                                    offset?: number;
                                    timing?: {
                                        bpm?: number;
                                        signature?: number;
                                    };
                                    sv?: number | undefined;
                                    volume?: number | undefined;
                                } & {
                                    id?: number;
                                    offset?: number;
                                    timing?: {
                                        bpm?: number;
                                        signature?: number;
                                    } & {
                                        bpm?: number;
                                        signature?: number;
                                    } & { [K_160 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"][number]["timing"], keyof TimingInformation>]: never; };
                                    sv?: number | undefined;
                                    volume?: number | undefined;
                                } & { [K_161 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"][number], keyof TimingPoint>]: never; })[] & { [K_162 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"], keyof {
                                    id?: number;
                                    offset?: number;
                                    timing?: {
                                        bpm?: number;
                                        signature?: number;
                                    };
                                    sv?: number | undefined;
                                    volume?: number | undefined;
                                }[]>]: never; };
                            } & { [K_163 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"], keyof Beatmap>]: never; };
                        } & { [K_164 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"], "beatmap">]: never; };
                        $case: "state";
                    } & { [K_165 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "state" | "$case">]: never; }) | ({
                        timingPointCreated?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        };
                    } & {
                        $case: "timingPointCreated";
                    } & {
                        timingPointCreated?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        } & {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            } & {
                                bpm?: number;
                                signature?: number;
                            } & { [K_166 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointCreated"]["timing"], keyof TimingInformation>]: never; };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        } & { [K_167 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointCreated"], keyof TimingPoint>]: never; };
                        $case: "timingPointCreated";
                    } & { [K_168 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointCreated" | "$case">]: never; }) | ({
                        timingPointUpdated?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        };
                    } & {
                        $case: "timingPointUpdated";
                    } & {
                        timingPointUpdated?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        } & {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            } & {
                                bpm?: number;
                                signature?: number;
                            } & { [K_169 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointUpdated"]["timing"], keyof TimingInformation>]: never; };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        } & { [K_170 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointUpdated"], keyof TimingPoint>]: never; };
                        $case: "timingPointUpdated";
                    } & { [K_171 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointUpdated" | "$case">]: never; }) | ({
                        timingPointDeleted?: number;
                    } & {
                        $case: "timingPointDeleted";
                    } & {
                        timingPointDeleted?: number;
                        $case: "timingPointDeleted";
                    } & { [K_172 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointDeleted" | "$case">]: never; }) | ({
                        hitObjectOverridden?: {
                            id?: number;
                            overrides?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                time?: number | undefined;
                                selectedBy?: number | undefined;
                                newCombo?: boolean | undefined;
                                controlPoints?: {
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                };
                                expectedDistance?: number | undefined;
                                repeatCount?: number | undefined;
                            };
                        };
                    } & {
                        $case: "hitObjectOverridden";
                    } & {
                        hitObjectOverridden?: {
                            id?: number;
                            overrides?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                time?: number | undefined;
                                selectedBy?: number | undefined;
                                newCombo?: boolean | undefined;
                                controlPoints?: {
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                };
                                expectedDistance?: number | undefined;
                                repeatCount?: number | undefined;
                            };
                        } & {
                            id?: number;
                            overrides?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                time?: number | undefined;
                                selectedBy?: number | undefined;
                                newCombo?: boolean | undefined;
                                controlPoints?: {
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                };
                                expectedDistance?: number | undefined;
                                repeatCount?: number | undefined;
                            } & {
                                position?: {
                                    x?: number;
                                    y?: number;
                                } & {
                                    x?: number;
                                    y?: number;
                                } & { [K_173 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["position"], keyof IVec2>]: never; };
                                time?: number | undefined;
                                selectedBy?: number | undefined;
                                newCombo?: boolean | undefined;
                                controlPoints?: {
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                } & {
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[] & ({
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    } & {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        } & {
                                            x?: number;
                                            y?: number;
                                        } & { [K_174 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                        kind?: ControlPointKind;
                                    } & { [K_175 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_176 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"], keyof {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[]>]: never; };
                                } & { [K_177 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"], "controlPoints">]: never; };
                                expectedDistance?: number | undefined;
                                repeatCount?: number | undefined;
                            } & { [K_178 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"], keyof HitObjectOverrides>]: never; };
                        } & { [K_179 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"], keyof HitObjectOverrideCommand>]: never; };
                        $case: "hitObjectOverridden";
                    } & { [K_180 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectOverridden" | "$case">]: never; });
                } & { [K_181 in Exclude<keyof I["serverCommand"]["multiple"]["messages"][number], keyof ServerToClientMessage>]: never; })[] & { [K_182 in Exclude<keyof I["serverCommand"]["multiple"]["messages"], keyof any[]>]: never; };
            } & { [K_183 in Exclude<keyof I["serverCommand"]["multiple"], "messages">]: never; };
            $case: "multiple";
        } & { [K_184 in Exclude<keyof I["serverCommand"], "multiple" | "$case">]: never; }) | ({
            heartbeat?: number;
        } & {
            $case: "heartbeat";
        } & {
            heartbeat?: number;
            $case: "heartbeat";
        } & { [K_185 in Exclude<keyof I["serverCommand"], "heartbeat" | "$case">]: never; }) | ({
            userJoined?: {
                id?: number;
                displayName?: string;
            };
        } & {
            $case: "userJoined";
        } & {
            userJoined?: {
                id?: number;
                displayName?: string;
            } & {
                id?: number;
                displayName?: string;
            } & { [K_186 in Exclude<keyof I["serverCommand"]["userJoined"], keyof UserInfo>]: never; };
            $case: "userJoined";
        } & { [K_187 in Exclude<keyof I["serverCommand"], "userJoined" | "$case">]: never; }) | ({
            userLeft?: {
                id?: number;
                displayName?: string;
            };
        } & {
            $case: "userLeft";
        } & {
            userLeft?: {
                id?: number;
                displayName?: string;
            } & {
                id?: number;
                displayName?: string;
            } & { [K_188 in Exclude<keyof I["serverCommand"]["userLeft"], keyof UserInfo>]: never; };
            $case: "userLeft";
        } & { [K_189 in Exclude<keyof I["serverCommand"], "userLeft" | "$case">]: never; }) | ({
            tick?: {
                userTicks?: {
                    id?: number;
                    cursorPos?: {
                        x?: number;
                        y?: number;
                    };
                    currentTime?: number;
                }[];
            };
        } & {
            $case: "tick";
        } & {
            tick?: {
                userTicks?: {
                    id?: number;
                    cursorPos?: {
                        x?: number;
                        y?: number;
                    };
                    currentTime?: number;
                }[];
            } & {
                userTicks?: {
                    id?: number;
                    cursorPos?: {
                        x?: number;
                        y?: number;
                    };
                    currentTime?: number;
                }[] & ({
                    id?: number;
                    cursorPos?: {
                        x?: number;
                        y?: number;
                    };
                    currentTime?: number;
                } & {
                    id?: number;
                    cursorPos?: {
                        x?: number;
                        y?: number;
                    } & {
                        x?: number;
                        y?: number;
                    } & { [K_190 in Exclude<keyof I["serverCommand"]["tick"]["userTicks"][number]["cursorPos"], keyof Vec2>]: never; };
                    currentTime?: number;
                } & { [K_191 in Exclude<keyof I["serverCommand"]["tick"]["userTicks"][number], keyof UserTick>]: never; })[] & { [K_192 in Exclude<keyof I["serverCommand"]["tick"]["userTicks"], keyof {
                    id?: number;
                    cursorPos?: {
                        x?: number;
                        y?: number;
                    };
                    currentTime?: number;
                }[]>]: never; };
            } & { [K_193 in Exclude<keyof I["serverCommand"]["tick"], "userTicks">]: never; };
            $case: "tick";
        } & { [K_194 in Exclude<keyof I["serverCommand"], "tick" | "$case">]: never; }) | ({
            userList?: {
                users?: {
                    id?: number;
                    displayName?: string;
                }[];
            };
        } & {
            $case: "userList";
        } & {
            userList?: {
                users?: {
                    id?: number;
                    displayName?: string;
                }[];
            } & {
                users?: {
                    id?: number;
                    displayName?: string;
                }[] & ({
                    id?: number;
                    displayName?: string;
                } & {
                    id?: number;
                    displayName?: string;
                } & { [K_195 in Exclude<keyof I["serverCommand"]["userList"]["users"][number], keyof UserInfo>]: never; })[] & { [K_196 in Exclude<keyof I["serverCommand"]["userList"]["users"], keyof {
                    id?: number;
                    displayName?: string;
                }[]>]: never; };
            } & { [K_197 in Exclude<keyof I["serverCommand"]["userList"], "users">]: never; };
            $case: "userList";
        } & { [K_198 in Exclude<keyof I["serverCommand"], "userList" | "$case">]: never; }) | ({
            ownId?: number;
        } & {
            $case: "ownId";
        } & {
            ownId?: number;
            $case: "ownId";
        } & { [K_199 in Exclude<keyof I["serverCommand"], "ownId" | "$case">]: never; }) | ({
            hitObjectCreated?: {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            };
        } & {
            $case: "hitObjectCreated";
        } & {
            hitObjectCreated?: {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            } & {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                } & {
                    x?: number;
                    y?: number;
                } & { [K_200 in Exclude<keyof I["serverCommand"]["hitObjectCreated"]["position"], keyof IVec2>]: never; };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                } & {
                    circle?: {} & {} & { [K_201 in Exclude<keyof I["serverCommand"]["hitObjectCreated"]["kind"]["circle"], never>]: never; };
                    $case: "circle";
                } & { [K_202 in Exclude<keyof I["serverCommand"]["hitObjectCreated"]["kind"], "circle" | "$case">]: never; }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                } & {
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    } & {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[] & ({
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        } & {
                            position?: {
                                x?: number;
                                y?: number;
                            } & {
                                x?: number;
                                y?: number;
                            } & { [K_203 in Exclude<keyof I["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                            kind?: ControlPointKind;
                        } & { [K_204 in Exclude<keyof I["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_205 in Exclude<keyof I["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"], keyof {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[]>]: never; };
                        repeats?: number;
                    } & { [K_206 in Exclude<keyof I["serverCommand"]["hitObjectCreated"]["kind"]["slider"], keyof Slider>]: never; };
                    $case: "slider";
                } & { [K_207 in Exclude<keyof I["serverCommand"]["hitObjectCreated"]["kind"], "slider" | "$case">]: never; }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                } & {
                    spinner?: {} & {} & { [K_208 in Exclude<keyof I["serverCommand"]["hitObjectCreated"]["kind"]["spinner"], never>]: never; };
                    $case: "spinner";
                } & { [K_209 in Exclude<keyof I["serverCommand"]["hitObjectCreated"]["kind"], "spinner" | "$case">]: never; });
            } & { [K_210 in Exclude<keyof I["serverCommand"]["hitObjectCreated"], keyof HitObject>]: never; };
            $case: "hitObjectCreated";
        } & { [K_211 in Exclude<keyof I["serverCommand"], "hitObjectCreated" | "$case">]: never; }) | ({
            hitObjectUpdated?: {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            };
        } & {
            $case: "hitObjectUpdated";
        } & {
            hitObjectUpdated?: {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            } & {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                } & {
                    x?: number;
                    y?: number;
                } & { [K_212 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"]["position"], keyof IVec2>]: never; };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                } & {
                    circle?: {} & {} & { [K_213 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"]["kind"]["circle"], never>]: never; };
                    $case: "circle";
                } & { [K_214 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"]["kind"], "circle" | "$case">]: never; }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                } & {
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    } & {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[] & ({
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        } & {
                            position?: {
                                x?: number;
                                y?: number;
                            } & {
                                x?: number;
                                y?: number;
                            } & { [K_215 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                            kind?: ControlPointKind;
                        } & { [K_216 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_217 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"], keyof {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[]>]: never; };
                        repeats?: number;
                    } & { [K_218 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"]["kind"]["slider"], keyof Slider>]: never; };
                    $case: "slider";
                } & { [K_219 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"]["kind"], "slider" | "$case">]: never; }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                } & {
                    spinner?: {} & {} & { [K_220 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"]["kind"]["spinner"], never>]: never; };
                    $case: "spinner";
                } & { [K_221 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"]["kind"], "spinner" | "$case">]: never; });
            } & { [K_222 in Exclude<keyof I["serverCommand"]["hitObjectUpdated"], keyof HitObject>]: never; };
            $case: "hitObjectUpdated";
        } & { [K_223 in Exclude<keyof I["serverCommand"], "hitObjectUpdated" | "$case">]: never; }) | ({
            hitObjectDeleted?: number;
        } & {
            $case: "hitObjectDeleted";
        } & {
            hitObjectDeleted?: number;
            $case: "hitObjectDeleted";
        } & { [K_224 in Exclude<keyof I["serverCommand"], "hitObjectDeleted" | "$case">]: never; }) | ({
            hitObjectSelected?: {
                ids?: number[];
                selectedBy?: number | undefined;
            };
        } & {
            $case: "hitObjectSelected";
        } & {
            hitObjectSelected?: {
                ids?: number[];
                selectedBy?: number | undefined;
            } & {
                ids?: number[] & number[] & { [K_225 in Exclude<keyof I["serverCommand"]["hitObjectSelected"]["ids"], keyof number[]>]: never; };
                selectedBy?: number | undefined;
            } & { [K_226 in Exclude<keyof I["serverCommand"]["hitObjectSelected"], keyof HitObjectSelected>]: never; };
            $case: "hitObjectSelected";
        } & { [K_227 in Exclude<keyof I["serverCommand"], "hitObjectSelected" | "$case">]: never; }) | ({
            state?: {
                beatmap?: {
                    difficulty?: {
                        hpDrainRate?: number;
                        circleSize?: number;
                        overallDifficulty?: number;
                        approachRate?: number;
                        sliderMultiplier?: number;
                        sliderTickRate?: number;
                    };
                    hitObjects?: {
                        id?: number;
                        selectedBy?: number | undefined;
                        startTime?: number;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        newCombo?: boolean;
                        kind?: ({
                            circle?: {};
                        } & {
                            $case: "circle";
                        }) | ({
                            slider?: {
                                expectedDistance?: number;
                                controlPoints?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[];
                                repeats?: number;
                            };
                        } & {
                            $case: "slider";
                        }) | ({
                            spinner?: {};
                        } & {
                            $case: "spinner";
                        });
                    }[];
                    timingPoints?: {
                        id?: number;
                        offset?: number;
                        timing?: {
                            bpm?: number;
                            signature?: number;
                        };
                        sv?: number | undefined;
                        volume?: number | undefined;
                    }[];
                };
            };
        } & {
            $case: "state";
        } & {
            state?: {
                beatmap?: {
                    difficulty?: {
                        hpDrainRate?: number;
                        circleSize?: number;
                        overallDifficulty?: number;
                        approachRate?: number;
                        sliderMultiplier?: number;
                        sliderTickRate?: number;
                    };
                    hitObjects?: {
                        id?: number;
                        selectedBy?: number | undefined;
                        startTime?: number;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        newCombo?: boolean;
                        kind?: ({
                            circle?: {};
                        } & {
                            $case: "circle";
                        }) | ({
                            slider?: {
                                expectedDistance?: number;
                                controlPoints?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[];
                                repeats?: number;
                            };
                        } & {
                            $case: "slider";
                        }) | ({
                            spinner?: {};
                        } & {
                            $case: "spinner";
                        });
                    }[];
                    timingPoints?: {
                        id?: number;
                        offset?: number;
                        timing?: {
                            bpm?: number;
                            signature?: number;
                        };
                        sv?: number | undefined;
                        volume?: number | undefined;
                    }[];
                };
            } & {
                beatmap?: {
                    difficulty?: {
                        hpDrainRate?: number;
                        circleSize?: number;
                        overallDifficulty?: number;
                        approachRate?: number;
                        sliderMultiplier?: number;
                        sliderTickRate?: number;
                    };
                    hitObjects?: {
                        id?: number;
                        selectedBy?: number | undefined;
                        startTime?: number;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        newCombo?: boolean;
                        kind?: ({
                            circle?: {};
                        } & {
                            $case: "circle";
                        }) | ({
                            slider?: {
                                expectedDistance?: number;
                                controlPoints?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[];
                                repeats?: number;
                            };
                        } & {
                            $case: "slider";
                        }) | ({
                            spinner?: {};
                        } & {
                            $case: "spinner";
                        });
                    }[];
                    timingPoints?: {
                        id?: number;
                        offset?: number;
                        timing?: {
                            bpm?: number;
                            signature?: number;
                        };
                        sv?: number | undefined;
                        volume?: number | undefined;
                    }[];
                } & {
                    difficulty?: {
                        hpDrainRate?: number;
                        circleSize?: number;
                        overallDifficulty?: number;
                        approachRate?: number;
                        sliderMultiplier?: number;
                        sliderTickRate?: number;
                    } & {
                        hpDrainRate?: number;
                        circleSize?: number;
                        overallDifficulty?: number;
                        approachRate?: number;
                        sliderMultiplier?: number;
                        sliderTickRate?: number;
                    } & { [K_228 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["difficulty"], keyof Difficulty>]: never; };
                    hitObjects?: {
                        id?: number;
                        selectedBy?: number | undefined;
                        startTime?: number;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        newCombo?: boolean;
                        kind?: ({
                            circle?: {};
                        } & {
                            $case: "circle";
                        }) | ({
                            slider?: {
                                expectedDistance?: number;
                                controlPoints?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[];
                                repeats?: number;
                            };
                        } & {
                            $case: "slider";
                        }) | ({
                            spinner?: {};
                        } & {
                            $case: "spinner";
                        });
                    }[] & ({
                        id?: number;
                        selectedBy?: number | undefined;
                        startTime?: number;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        newCombo?: boolean;
                        kind?: ({
                            circle?: {};
                        } & {
                            $case: "circle";
                        }) | ({
                            slider?: {
                                expectedDistance?: number;
                                controlPoints?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[];
                                repeats?: number;
                            };
                        } & {
                            $case: "slider";
                        }) | ({
                            spinner?: {};
                        } & {
                            $case: "spinner";
                        });
                    } & {
                        id?: number;
                        selectedBy?: number | undefined;
                        startTime?: number;
                        position?: {
                            x?: number;
                            y?: number;
                        } & {
                            x?: number;
                            y?: number;
                        } & { [K_229 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["position"], keyof IVec2>]: never; };
                        newCombo?: boolean;
                        kind?: ({
                            circle?: {};
                        } & {
                            $case: "circle";
                        } & {
                            circle?: {} & {} & { [K_230 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["circle"], never>]: never; };
                            $case: "circle";
                        } & { [K_231 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "circle" | "$case">]: never; }) | ({
                            slider?: {
                                expectedDistance?: number;
                                controlPoints?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[];
                                repeats?: number;
                            };
                        } & {
                            $case: "slider";
                        } & {
                            slider?: {
                                expectedDistance?: number;
                                controlPoints?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[];
                                repeats?: number;
                            } & {
                                expectedDistance?: number;
                                controlPoints?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[] & ({
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                } & {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    } & {
                                        x?: number;
                                        y?: number;
                                    } & { [K_232 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                    kind?: ControlPointKind;
                                } & { [K_233 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_234 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"], keyof {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[]>]: never; };
                                repeats?: number;
                            } & { [K_235 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"], keyof Slider>]: never; };
                            $case: "slider";
                        } & { [K_236 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "slider" | "$case">]: never; }) | ({
                            spinner?: {};
                        } & {
                            $case: "spinner";
                        } & {
                            spinner?: {} & {} & { [K_237 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["spinner"], never>]: never; };
                            $case: "spinner";
                        } & { [K_238 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "spinner" | "$case">]: never; });
                    } & { [K_239 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"][number], keyof HitObject>]: never; })[] & { [K_240 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["hitObjects"], keyof {
                        id?: number;
                        selectedBy?: number | undefined;
                        startTime?: number;
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        newCombo?: boolean;
                        kind?: ({
                            circle?: {};
                        } & {
                            $case: "circle";
                        }) | ({
                            slider?: {
                                expectedDistance?: number;
                                controlPoints?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    kind?: ControlPointKind;
                                }[];
                                repeats?: number;
                            };
                        } & {
                            $case: "slider";
                        }) | ({
                            spinner?: {};
                        } & {
                            $case: "spinner";
                        });
                    }[]>]: never; };
                    timingPoints?: {
                        id?: number;
                        offset?: number;
                        timing?: {
                            bpm?: number;
                            signature?: number;
                        };
                        sv?: number | undefined;
                        volume?: number | undefined;
                    }[] & ({
                        id?: number;
                        offset?: number;
                        timing?: {
                            bpm?: number;
                            signature?: number;
                        };
                        sv?: number | undefined;
                        volume?: number | undefined;
                    } & {
                        id?: number;
                        offset?: number;
                        timing?: {
                            bpm?: number;
                            signature?: number;
                        } & {
                            bpm?: number;
                            signature?: number;
                        } & { [K_241 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["timingPoints"][number]["timing"], keyof TimingInformation>]: never; };
                        sv?: number | undefined;
                        volume?: number | undefined;
                    } & { [K_242 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["timingPoints"][number], keyof TimingPoint>]: never; })[] & { [K_243 in Exclude<keyof I["serverCommand"]["state"]["beatmap"]["timingPoints"], keyof {
                        id?: number;
                        offset?: number;
                        timing?: {
                            bpm?: number;
                            signature?: number;
                        };
                        sv?: number | undefined;
                        volume?: number | undefined;
                    }[]>]: never; };
                } & { [K_244 in Exclude<keyof I["serverCommand"]["state"]["beatmap"], keyof Beatmap>]: never; };
            } & { [K_245 in Exclude<keyof I["serverCommand"]["state"], "beatmap">]: never; };
            $case: "state";
        } & { [K_246 in Exclude<keyof I["serverCommand"], "state" | "$case">]: never; }) | ({
            timingPointCreated?: {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            };
        } & {
            $case: "timingPointCreated";
        } & {
            timingPointCreated?: {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            } & {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                } & {
                    bpm?: number;
                    signature?: number;
                } & { [K_247 in Exclude<keyof I["serverCommand"]["timingPointCreated"]["timing"], keyof TimingInformation>]: never; };
                sv?: number | undefined;
                volume?: number | undefined;
            } & { [K_248 in Exclude<keyof I["serverCommand"]["timingPointCreated"], keyof TimingPoint>]: never; };
            $case: "timingPointCreated";
        } & { [K_249 in Exclude<keyof I["serverCommand"], "timingPointCreated" | "$case">]: never; }) | ({
            timingPointUpdated?: {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            };
        } & {
            $case: "timingPointUpdated";
        } & {
            timingPointUpdated?: {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            } & {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                } & {
                    bpm?: number;
                    signature?: number;
                } & { [K_250 in Exclude<keyof I["serverCommand"]["timingPointUpdated"]["timing"], keyof TimingInformation>]: never; };
                sv?: number | undefined;
                volume?: number | undefined;
            } & { [K_251 in Exclude<keyof I["serverCommand"]["timingPointUpdated"], keyof TimingPoint>]: never; };
            $case: "timingPointUpdated";
        } & { [K_252 in Exclude<keyof I["serverCommand"], "timingPointUpdated" | "$case">]: never; }) | ({
            timingPointDeleted?: number;
        } & {
            $case: "timingPointDeleted";
        } & {
            timingPointDeleted?: number;
            $case: "timingPointDeleted";
        } & { [K_253 in Exclude<keyof I["serverCommand"], "timingPointDeleted" | "$case">]: never; }) | ({
            hitObjectOverridden?: {
                id?: number;
                overrides?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    time?: number | undefined;
                    selectedBy?: number | undefined;
                    newCombo?: boolean | undefined;
                    controlPoints?: {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                    };
                    expectedDistance?: number | undefined;
                    repeatCount?: number | undefined;
                };
            };
        } & {
            $case: "hitObjectOverridden";
        } & {
            hitObjectOverridden?: {
                id?: number;
                overrides?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    time?: number | undefined;
                    selectedBy?: number | undefined;
                    newCombo?: boolean | undefined;
                    controlPoints?: {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                    };
                    expectedDistance?: number | undefined;
                    repeatCount?: number | undefined;
                };
            } & {
                id?: number;
                overrides?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    time?: number | undefined;
                    selectedBy?: number | undefined;
                    newCombo?: boolean | undefined;
                    controlPoints?: {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                    };
                    expectedDistance?: number | undefined;
                    repeatCount?: number | undefined;
                } & {
                    position?: {
                        x?: number;
                        y?: number;
                    } & {
                        x?: number;
                        y?: number;
                    } & { [K_254 in Exclude<keyof I["serverCommand"]["hitObjectOverridden"]["overrides"]["position"], keyof IVec2>]: never; };
                    time?: number | undefined;
                    selectedBy?: number | undefined;
                    newCombo?: boolean | undefined;
                    controlPoints?: {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                    } & {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[] & ({
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        } & {
                            position?: {
                                x?: number;
                                y?: number;
                            } & {
                                x?: number;
                                y?: number;
                            } & { [K_255 in Exclude<keyof I["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                            kind?: ControlPointKind;
                        } & { [K_256 in Exclude<keyof I["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_257 in Exclude<keyof I["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"], keyof {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[]>]: never; };
                    } & { [K_258 in Exclude<keyof I["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"], "controlPoints">]: never; };
                    expectedDistance?: number | undefined;
                    repeatCount?: number | undefined;
                } & { [K_259 in Exclude<keyof I["serverCommand"]["hitObjectOverridden"]["overrides"], keyof HitObjectOverrides>]: never; };
            } & { [K_260 in Exclude<keyof I["serverCommand"]["hitObjectOverridden"], keyof HitObjectOverrideCommand>]: never; };
            $case: "hitObjectOverridden";
        } & { [K_261 in Exclude<keyof I["serverCommand"], "hitObjectOverridden" | "$case">]: never; });
    } & { [K_262 in Exclude<keyof I, keyof ServerToClientMessage>]: never; }>(object: I): ServerToClientMessage;
};
export declare const MultiServerToClientMessage: {
    encode(message: MultiServerToClientMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MultiServerToClientMessage;
    fromJSON(object: any): MultiServerToClientMessage;
    toJSON(message: MultiServerToClientMessage): unknown;
    fromPartial<I extends {
        messages?: any[];
    } & {
        messages?: any[] & ({
            responseId?: string | undefined;
            serverCommand?: ({
                multiple?: {
                    messages?: any[];
                };
            } & {
                $case: "multiple";
            }) | ({
                heartbeat?: number;
            } & {
                $case: "heartbeat";
            }) | ({
                userJoined?: {
                    id?: number;
                    displayName?: string;
                };
            } & {
                $case: "userJoined";
            }) | ({
                userLeft?: {
                    id?: number;
                    displayName?: string;
                };
            } & {
                $case: "userLeft";
            }) | ({
                tick?: {
                    userTicks?: {
                        id?: number;
                        cursorPos?: {
                            x?: number;
                            y?: number;
                        };
                        currentTime?: number;
                    }[];
                };
            } & {
                $case: "tick";
            }) | ({
                userList?: {
                    users?: {
                        id?: number;
                        displayName?: string;
                    }[];
                };
            } & {
                $case: "userList";
            }) | ({
                ownId?: number;
            } & {
                $case: "ownId";
            }) | ({
                hitObjectCreated?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                };
            } & {
                $case: "hitObjectCreated";
            }) | ({
                hitObjectUpdated?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                };
            } & {
                $case: "hitObjectUpdated";
            }) | ({
                hitObjectDeleted?: number;
            } & {
                $case: "hitObjectDeleted";
            }) | ({
                hitObjectSelected?: {
                    ids?: number[];
                    selectedBy?: number | undefined;
                };
            } & {
                $case: "hitObjectSelected";
            }) | ({
                state?: {
                    beatmap?: {
                        difficulty?: {
                            hpDrainRate?: number;
                            circleSize?: number;
                            overallDifficulty?: number;
                            approachRate?: number;
                            sliderMultiplier?: number;
                            sliderTickRate?: number;
                        };
                        hitObjects?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        }[];
                        timingPoints?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        }[];
                    };
                };
            } & {
                $case: "state";
            }) | ({
                timingPointCreated?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                };
            } & {
                $case: "timingPointCreated";
            }) | ({
                timingPointUpdated?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                };
            } & {
                $case: "timingPointUpdated";
            }) | ({
                timingPointDeleted?: number;
            } & {
                $case: "timingPointDeleted";
            }) | ({
                hitObjectOverridden?: {
                    id?: number;
                    overrides?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        time?: number | undefined;
                        selectedBy?: number | undefined;
                        newCombo?: boolean | undefined;
                        controlPoints?: {
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                        };
                        expectedDistance?: number | undefined;
                        repeatCount?: number | undefined;
                    };
                };
            } & {
                $case: "hitObjectOverridden";
            });
        } & {
            responseId?: string | undefined;
            serverCommand?: ({
                multiple?: {
                    messages?: any[];
                };
            } & {
                $case: "multiple";
            } & {
                multiple?: {
                    messages?: any[];
                } & {
                    messages?: any[] & ({
                        responseId?: string | undefined;
                        serverCommand?: ({
                            multiple?: {
                                messages?: any[];
                            };
                        } & {
                            $case: "multiple";
                        }) | ({
                            heartbeat?: number;
                        } & {
                            $case: "heartbeat";
                        }) | ({
                            userJoined?: {
                                id?: number;
                                displayName?: string;
                            };
                        } & {
                            $case: "userJoined";
                        }) | ({
                            userLeft?: {
                                id?: number;
                                displayName?: string;
                            };
                        } & {
                            $case: "userLeft";
                        }) | ({
                            tick?: {
                                userTicks?: {
                                    id?: number;
                                    cursorPos?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    currentTime?: number;
                                }[];
                            };
                        } & {
                            $case: "tick";
                        }) | ({
                            userList?: {
                                users?: {
                                    id?: number;
                                    displayName?: string;
                                }[];
                            };
                        } & {
                            $case: "userList";
                        }) | ({
                            ownId?: number;
                        } & {
                            $case: "ownId";
                        }) | ({
                            hitObjectCreated?: {
                                id?: number;
                                selectedBy?: number | undefined;
                                startTime?: number;
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                newCombo?: boolean;
                                kind?: ({
                                    circle?: {};
                                } & {
                                    $case: "circle";
                                }) | ({
                                    slider?: {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                        repeats?: number;
                                    };
                                } & {
                                    $case: "slider";
                                }) | ({
                                    spinner?: {};
                                } & {
                                    $case: "spinner";
                                });
                            };
                        } & {
                            $case: "hitObjectCreated";
                        }) | ({
                            hitObjectUpdated?: {
                                id?: number;
                                selectedBy?: number | undefined;
                                startTime?: number;
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                newCombo?: boolean;
                                kind?: ({
                                    circle?: {};
                                } & {
                                    $case: "circle";
                                }) | ({
                                    slider?: {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                        repeats?: number;
                                    };
                                } & {
                                    $case: "slider";
                                }) | ({
                                    spinner?: {};
                                } & {
                                    $case: "spinner";
                                });
                            };
                        } & {
                            $case: "hitObjectUpdated";
                        }) | ({
                            hitObjectDeleted?: number;
                        } & {
                            $case: "hitObjectDeleted";
                        }) | ({
                            hitObjectSelected?: {
                                ids?: number[];
                                selectedBy?: number | undefined;
                            };
                        } & {
                            $case: "hitObjectSelected";
                        }) | ({
                            state?: {
                                beatmap?: {
                                    difficulty?: {
                                        hpDrainRate?: number;
                                        circleSize?: number;
                                        overallDifficulty?: number;
                                        approachRate?: number;
                                        sliderMultiplier?: number;
                                        sliderTickRate?: number;
                                    };
                                    hitObjects?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    }[];
                                    timingPoints?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    }[];
                                };
                            };
                        } & {
                            $case: "state";
                        }) | ({
                            timingPointCreated?: {
                                id?: number;
                                offset?: number;
                                timing?: {
                                    bpm?: number;
                                    signature?: number;
                                };
                                sv?: number | undefined;
                                volume?: number | undefined;
                            };
                        } & {
                            $case: "timingPointCreated";
                        }) | ({
                            timingPointUpdated?: {
                                id?: number;
                                offset?: number;
                                timing?: {
                                    bpm?: number;
                                    signature?: number;
                                };
                                sv?: number | undefined;
                                volume?: number | undefined;
                            };
                        } & {
                            $case: "timingPointUpdated";
                        }) | ({
                            timingPointDeleted?: number;
                        } & {
                            $case: "timingPointDeleted";
                        }) | ({
                            hitObjectOverridden?: {
                                id?: number;
                                overrides?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    time?: number | undefined;
                                    selectedBy?: number | undefined;
                                    newCombo?: boolean | undefined;
                                    controlPoints?: {
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                    };
                                    expectedDistance?: number | undefined;
                                    repeatCount?: number | undefined;
                                };
                            };
                        } & {
                            $case: "hitObjectOverridden";
                        });
                    } & {
                        responseId?: string | undefined;
                        serverCommand?: ({
                            multiple?: {
                                messages?: any[];
                            };
                        } & {
                            $case: "multiple";
                        } & {
                            multiple?: {
                                messages?: any[];
                            } & {
                                messages?: any[] & ({
                                    responseId?: string | undefined;
                                    serverCommand?: ({
                                        multiple?: {
                                            messages?: any[];
                                        };
                                    } & {
                                        $case: "multiple";
                                    }) | ({
                                        heartbeat?: number;
                                    } & {
                                        $case: "heartbeat";
                                    }) | ({
                                        userJoined?: {
                                            id?: number;
                                            displayName?: string;
                                        };
                                    } & {
                                        $case: "userJoined";
                                    }) | ({
                                        userLeft?: {
                                            id?: number;
                                            displayName?: string;
                                        };
                                    } & {
                                        $case: "userLeft";
                                    }) | ({
                                        tick?: {
                                            userTicks?: {
                                                id?: number;
                                                cursorPos?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                currentTime?: number;
                                            }[];
                                        };
                                    } & {
                                        $case: "tick";
                                    }) | ({
                                        userList?: {
                                            users?: {
                                                id?: number;
                                                displayName?: string;
                                            }[];
                                        };
                                    } & {
                                        $case: "userList";
                                    }) | ({
                                        ownId?: number;
                                    } & {
                                        $case: "ownId";
                                    }) | ({
                                        hitObjectCreated?: {
                                            id?: number;
                                            selectedBy?: number | undefined;
                                            startTime?: number;
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            newCombo?: boolean;
                                            kind?: ({
                                                circle?: {};
                                            } & {
                                                $case: "circle";
                                            }) | ({
                                                slider?: {
                                                    expectedDistance?: number;
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                    repeats?: number;
                                                };
                                            } & {
                                                $case: "slider";
                                            }) | ({
                                                spinner?: {};
                                            } & {
                                                $case: "spinner";
                                            });
                                        };
                                    } & {
                                        $case: "hitObjectCreated";
                                    }) | ({
                                        hitObjectUpdated?: {
                                            id?: number;
                                            selectedBy?: number | undefined;
                                            startTime?: number;
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            newCombo?: boolean;
                                            kind?: ({
                                                circle?: {};
                                            } & {
                                                $case: "circle";
                                            }) | ({
                                                slider?: {
                                                    expectedDistance?: number;
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                    repeats?: number;
                                                };
                                            } & {
                                                $case: "slider";
                                            }) | ({
                                                spinner?: {};
                                            } & {
                                                $case: "spinner";
                                            });
                                        };
                                    } & {
                                        $case: "hitObjectUpdated";
                                    }) | ({
                                        hitObjectDeleted?: number;
                                    } & {
                                        $case: "hitObjectDeleted";
                                    }) | ({
                                        hitObjectSelected?: {
                                            ids?: number[];
                                            selectedBy?: number | undefined;
                                        };
                                    } & {
                                        $case: "hitObjectSelected";
                                    }) | ({
                                        state?: {
                                            beatmap?: {
                                                difficulty?: {
                                                    hpDrainRate?: number;
                                                    circleSize?: number;
                                                    overallDifficulty?: number;
                                                    approachRate?: number;
                                                    sliderMultiplier?: number;
                                                    sliderTickRate?: number;
                                                };
                                                hitObjects?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                }[];
                                                timingPoints?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                }[];
                                            };
                                        };
                                    } & {
                                        $case: "state";
                                    }) | ({
                                        timingPointCreated?: {
                                            id?: number;
                                            offset?: number;
                                            timing?: {
                                                bpm?: number;
                                                signature?: number;
                                            };
                                            sv?: number | undefined;
                                            volume?: number | undefined;
                                        };
                                    } & {
                                        $case: "timingPointCreated";
                                    }) | ({
                                        timingPointUpdated?: {
                                            id?: number;
                                            offset?: number;
                                            timing?: {
                                                bpm?: number;
                                                signature?: number;
                                            };
                                            sv?: number | undefined;
                                            volume?: number | undefined;
                                        };
                                    } & {
                                        $case: "timingPointUpdated";
                                    }) | ({
                                        timingPointDeleted?: number;
                                    } & {
                                        $case: "timingPointDeleted";
                                    }) | ({
                                        hitObjectOverridden?: {
                                            id?: number;
                                            overrides?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                time?: number | undefined;
                                                selectedBy?: number | undefined;
                                                newCombo?: boolean | undefined;
                                                controlPoints?: {
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                };
                                                expectedDistance?: number | undefined;
                                                repeatCount?: number | undefined;
                                            };
                                        };
                                    } & {
                                        $case: "hitObjectOverridden";
                                    });
                                } & {
                                    responseId?: string | undefined;
                                    serverCommand?: ({
                                        multiple?: {
                                            messages?: any[];
                                        };
                                    } & {
                                        $case: "multiple";
                                    } & {
                                        multiple?: {
                                            messages?: any[];
                                        } & {
                                            messages?: any[] & ({
                                                responseId?: string | undefined;
                                                serverCommand?: ({
                                                    multiple?: {
                                                        messages?: any[];
                                                    };
                                                } & {
                                                    $case: "multiple";
                                                }) | ({
                                                    heartbeat?: number;
                                                } & {
                                                    $case: "heartbeat";
                                                }) | ({
                                                    userJoined?: {
                                                        id?: number;
                                                        displayName?: string;
                                                    };
                                                } & {
                                                    $case: "userJoined";
                                                }) | ({
                                                    userLeft?: {
                                                        id?: number;
                                                        displayName?: string;
                                                    };
                                                } & {
                                                    $case: "userLeft";
                                                }) | ({
                                                    tick?: {
                                                        userTicks?: {
                                                            id?: number;
                                                            cursorPos?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            currentTime?: number;
                                                        }[];
                                                    };
                                                } & {
                                                    $case: "tick";
                                                }) | ({
                                                    userList?: {
                                                        users?: {
                                                            id?: number;
                                                            displayName?: string;
                                                        }[];
                                                    };
                                                } & {
                                                    $case: "userList";
                                                }) | ({
                                                    ownId?: number;
                                                } & {
                                                    $case: "ownId";
                                                }) | ({
                                                    hitObjectCreated?: {
                                                        id?: number;
                                                        selectedBy?: number | undefined;
                                                        startTime?: number;
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        newCombo?: boolean;
                                                        kind?: ({
                                                            circle?: {};
                                                        } & {
                                                            $case: "circle";
                                                        }) | ({
                                                            slider?: {
                                                                expectedDistance?: number;
                                                                controlPoints?: {
                                                                    position?: {
                                                                        x?: number;
                                                                        y?: number;
                                                                    };
                                                                    kind?: ControlPointKind;
                                                                }[];
                                                                repeats?: number;
                                                            };
                                                        } & {
                                                            $case: "slider";
                                                        }) | ({
                                                            spinner?: {};
                                                        } & {
                                                            $case: "spinner";
                                                        });
                                                    };
                                                } & {
                                                    $case: "hitObjectCreated";
                                                }) | ({
                                                    hitObjectUpdated?: {
                                                        id?: number;
                                                        selectedBy?: number | undefined;
                                                        startTime?: number;
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        newCombo?: boolean;
                                                        kind?: ({
                                                            circle?: {};
                                                        } & {
                                                            $case: "circle";
                                                        }) | ({
                                                            slider?: {
                                                                expectedDistance?: number;
                                                                controlPoints?: {
                                                                    position?: {
                                                                        x?: number;
                                                                        y?: number;
                                                                    };
                                                                    kind?: ControlPointKind;
                                                                }[];
                                                                repeats?: number;
                                                            };
                                                        } & {
                                                            $case: "slider";
                                                        }) | ({
                                                            spinner?: {};
                                                        } & {
                                                            $case: "spinner";
                                                        });
                                                    };
                                                } & {
                                                    $case: "hitObjectUpdated";
                                                }) | ({
                                                    hitObjectDeleted?: number;
                                                } & {
                                                    $case: "hitObjectDeleted";
                                                }) | ({
                                                    hitObjectSelected?: {
                                                        ids?: number[];
                                                        selectedBy?: number | undefined;
                                                    };
                                                } & {
                                                    $case: "hitObjectSelected";
                                                }) | ({
                                                    state?: {
                                                        beatmap?: {
                                                            difficulty?: {
                                                                hpDrainRate?: number;
                                                                circleSize?: number;
                                                                overallDifficulty?: number;
                                                                approachRate?: number;
                                                                sliderMultiplier?: number;
                                                                sliderTickRate?: number;
                                                            };
                                                            hitObjects?: {
                                                                id?: number;
                                                                selectedBy?: number | undefined;
                                                                startTime?: number;
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                newCombo?: boolean;
                                                                kind?: ({
                                                                    circle?: {};
                                                                } & {
                                                                    $case: "circle";
                                                                }) | ({
                                                                    slider?: {
                                                                        expectedDistance?: number;
                                                                        controlPoints?: {
                                                                            position?: {
                                                                                x?: number;
                                                                                y?: number;
                                                                            };
                                                                            kind?: ControlPointKind;
                                                                        }[];
                                                                        repeats?: number;
                                                                    };
                                                                } & {
                                                                    $case: "slider";
                                                                }) | ({
                                                                    spinner?: {};
                                                                } & {
                                                                    $case: "spinner";
                                                                });
                                                            }[];
                                                            timingPoints?: {
                                                                id?: number;
                                                                offset?: number;
                                                                timing?: {
                                                                    bpm?: number;
                                                                    signature?: number;
                                                                };
                                                                sv?: number | undefined;
                                                                volume?: number | undefined;
                                                            }[];
                                                        };
                                                    };
                                                } & {
                                                    $case: "state";
                                                }) | ({
                                                    timingPointCreated?: {
                                                        id?: number;
                                                        offset?: number;
                                                        timing?: {
                                                            bpm?: number;
                                                            signature?: number;
                                                        };
                                                        sv?: number | undefined;
                                                        volume?: number | undefined;
                                                    };
                                                } & {
                                                    $case: "timingPointCreated";
                                                }) | ({
                                                    timingPointUpdated?: {
                                                        id?: number;
                                                        offset?: number;
                                                        timing?: {
                                                            bpm?: number;
                                                            signature?: number;
                                                        };
                                                        sv?: number | undefined;
                                                        volume?: number | undefined;
                                                    };
                                                } & {
                                                    $case: "timingPointUpdated";
                                                }) | ({
                                                    timingPointDeleted?: number;
                                                } & {
                                                    $case: "timingPointDeleted";
                                                }) | ({
                                                    hitObjectOverridden?: {
                                                        id?: number;
                                                        overrides?: {
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            time?: number | undefined;
                                                            selectedBy?: number | undefined;
                                                            newCombo?: boolean | undefined;
                                                            controlPoints?: {
                                                                controlPoints?: {
                                                                    position?: {
                                                                        x?: number;
                                                                        y?: number;
                                                                    };
                                                                    kind?: ControlPointKind;
                                                                }[];
                                                            };
                                                            expectedDistance?: number | undefined;
                                                            repeatCount?: number | undefined;
                                                        };
                                                    };
                                                } & {
                                                    $case: "hitObjectOverridden";
                                                });
                                            } & {
                                                responseId?: string | undefined;
                                                serverCommand?: ({
                                                    multiple?: {
                                                        messages?: any[];
                                                    };
                                                } & {
                                                    $case: "multiple";
                                                } & any & { [K in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "multiple" | "$case">]: never; }) | ({
                                                    heartbeat?: number;
                                                } & {
                                                    $case: "heartbeat";
                                                } & any & { [K_1 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "heartbeat" | "$case">]: never; }) | ({
                                                    userJoined?: {
                                                        id?: number;
                                                        displayName?: string;
                                                    };
                                                } & {
                                                    $case: "userJoined";
                                                } & any & { [K_2 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userJoined" | "$case">]: never; }) | ({
                                                    userLeft?: {
                                                        id?: number;
                                                        displayName?: string;
                                                    };
                                                } & {
                                                    $case: "userLeft";
                                                } & any & { [K_3 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userLeft" | "$case">]: never; }) | ({
                                                    tick?: {
                                                        userTicks?: {
                                                            id?: number;
                                                            cursorPos?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            currentTime?: number;
                                                        }[];
                                                    };
                                                } & {
                                                    $case: "tick";
                                                } & any & { [K_4 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "tick" | "$case">]: never; }) | ({
                                                    userList?: {
                                                        users?: {
                                                            id?: number;
                                                            displayName?: string;
                                                        }[];
                                                    };
                                                } & {
                                                    $case: "userList";
                                                } & any & { [K_5 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userList" | "$case">]: never; }) | ({
                                                    ownId?: number;
                                                } & {
                                                    $case: "ownId";
                                                } & any & { [K_6 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "ownId" | "$case">]: never; }) | ({
                                                    hitObjectCreated?: {
                                                        id?: number;
                                                        selectedBy?: number | undefined;
                                                        startTime?: number;
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        newCombo?: boolean;
                                                        kind?: ({
                                                            circle?: {};
                                                        } & {
                                                            $case: "circle";
                                                        }) | ({
                                                            slider?: {
                                                                expectedDistance?: number;
                                                                controlPoints?: {
                                                                    position?: {
                                                                        x?: number;
                                                                        y?: number;
                                                                    };
                                                                    kind?: ControlPointKind;
                                                                }[];
                                                                repeats?: number;
                                                            };
                                                        } & {
                                                            $case: "slider";
                                                        }) | ({
                                                            spinner?: {};
                                                        } & {
                                                            $case: "spinner";
                                                        });
                                                    };
                                                } & {
                                                    $case: "hitObjectCreated";
                                                } & any & { [K_7 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectCreated" | "$case">]: never; }) | ({
                                                    hitObjectUpdated?: {
                                                        id?: number;
                                                        selectedBy?: number | undefined;
                                                        startTime?: number;
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        newCombo?: boolean;
                                                        kind?: ({
                                                            circle?: {};
                                                        } & {
                                                            $case: "circle";
                                                        }) | ({
                                                            slider?: {
                                                                expectedDistance?: number;
                                                                controlPoints?: {
                                                                    position?: {
                                                                        x?: number;
                                                                        y?: number;
                                                                    };
                                                                    kind?: ControlPointKind;
                                                                }[];
                                                                repeats?: number;
                                                            };
                                                        } & {
                                                            $case: "slider";
                                                        }) | ({
                                                            spinner?: {};
                                                        } & {
                                                            $case: "spinner";
                                                        });
                                                    };
                                                } & {
                                                    $case: "hitObjectUpdated";
                                                } & any & { [K_8 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectUpdated" | "$case">]: never; }) | ({
                                                    hitObjectDeleted?: number;
                                                } & {
                                                    $case: "hitObjectDeleted";
                                                } & any & { [K_9 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectDeleted" | "$case">]: never; }) | ({
                                                    hitObjectSelected?: {
                                                        ids?: number[];
                                                        selectedBy?: number | undefined;
                                                    };
                                                } & {
                                                    $case: "hitObjectSelected";
                                                } & any & { [K_10 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectSelected" | "$case">]: never; }) | ({
                                                    state?: {
                                                        beatmap?: {
                                                            difficulty?: {
                                                                hpDrainRate?: number;
                                                                circleSize?: number;
                                                                overallDifficulty?: number;
                                                                approachRate?: number;
                                                                sliderMultiplier?: number;
                                                                sliderTickRate?: number;
                                                            };
                                                            hitObjects?: {
                                                                id?: number;
                                                                selectedBy?: number | undefined;
                                                                startTime?: number;
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                newCombo?: boolean;
                                                                kind?: ({
                                                                    circle?: {};
                                                                } & {
                                                                    $case: "circle";
                                                                }) | ({
                                                                    slider?: {
                                                                        expectedDistance?: number;
                                                                        controlPoints?: {
                                                                            position?: {
                                                                                x?: number;
                                                                                y?: number;
                                                                            };
                                                                            kind?: ControlPointKind;
                                                                        }[];
                                                                        repeats?: number;
                                                                    };
                                                                } & {
                                                                    $case: "slider";
                                                                }) | ({
                                                                    spinner?: {};
                                                                } & {
                                                                    $case: "spinner";
                                                                });
                                                            }[];
                                                            timingPoints?: {
                                                                id?: number;
                                                                offset?: number;
                                                                timing?: {
                                                                    bpm?: number;
                                                                    signature?: number;
                                                                };
                                                                sv?: number | undefined;
                                                                volume?: number | undefined;
                                                            }[];
                                                        };
                                                    };
                                                } & {
                                                    $case: "state";
                                                } & any & { [K_11 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "state" | "$case">]: never; }) | ({
                                                    timingPointCreated?: {
                                                        id?: number;
                                                        offset?: number;
                                                        timing?: {
                                                            bpm?: number;
                                                            signature?: number;
                                                        };
                                                        sv?: number | undefined;
                                                        volume?: number | undefined;
                                                    };
                                                } & {
                                                    $case: "timingPointCreated";
                                                } & any & { [K_12 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointCreated" | "$case">]: never; }) | ({
                                                    timingPointUpdated?: {
                                                        id?: number;
                                                        offset?: number;
                                                        timing?: {
                                                            bpm?: number;
                                                            signature?: number;
                                                        };
                                                        sv?: number | undefined;
                                                        volume?: number | undefined;
                                                    };
                                                } & {
                                                    $case: "timingPointUpdated";
                                                } & any & { [K_13 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointUpdated" | "$case">]: never; }) | ({
                                                    timingPointDeleted?: number;
                                                } & {
                                                    $case: "timingPointDeleted";
                                                } & any & { [K_14 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointDeleted" | "$case">]: never; }) | ({
                                                    hitObjectOverridden?: {
                                                        id?: number;
                                                        overrides?: {
                                                            position?: {
                                                                x?: number;
                                                                y?: number;
                                                            };
                                                            time?: number | undefined;
                                                            selectedBy?: number | undefined;
                                                            newCombo?: boolean | undefined;
                                                            controlPoints?: {
                                                                controlPoints?: {
                                                                    position?: {
                                                                        x?: number;
                                                                        y?: number;
                                                                    };
                                                                    kind?: ControlPointKind;
                                                                }[];
                                                            };
                                                            expectedDistance?: number | undefined;
                                                            repeatCount?: number | undefined;
                                                        };
                                                    };
                                                } & {
                                                    $case: "hitObjectOverridden";
                                                } & any & { [K_15 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectOverridden" | "$case">]: never; });
                                            } & { [K_16 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number], keyof ServerToClientMessage>]: never; })[] & { [K_17 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"], keyof any[]>]: never; };
                                        } & { [K_18 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"], "messages">]: never; };
                                        $case: "multiple";
                                    } & { [K_19 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "multiple" | "$case">]: never; }) | ({
                                        heartbeat?: number;
                                    } & {
                                        $case: "heartbeat";
                                    } & {
                                        heartbeat?: number;
                                        $case: "heartbeat";
                                    } & { [K_20 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "heartbeat" | "$case">]: never; }) | ({
                                        userJoined?: {
                                            id?: number;
                                            displayName?: string;
                                        };
                                    } & {
                                        $case: "userJoined";
                                    } & {
                                        userJoined?: {
                                            id?: number;
                                            displayName?: string;
                                        } & {
                                            id?: number;
                                            displayName?: string;
                                        } & { [K_21 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userJoined"], keyof UserInfo>]: never; };
                                        $case: "userJoined";
                                    } & { [K_22 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userJoined" | "$case">]: never; }) | ({
                                        userLeft?: {
                                            id?: number;
                                            displayName?: string;
                                        };
                                    } & {
                                        $case: "userLeft";
                                    } & {
                                        userLeft?: {
                                            id?: number;
                                            displayName?: string;
                                        } & {
                                            id?: number;
                                            displayName?: string;
                                        } & { [K_23 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userLeft"], keyof UserInfo>]: never; };
                                        $case: "userLeft";
                                    } & { [K_24 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userLeft" | "$case">]: never; }) | ({
                                        tick?: {
                                            userTicks?: {
                                                id?: number;
                                                cursorPos?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                currentTime?: number;
                                            }[];
                                        };
                                    } & {
                                        $case: "tick";
                                    } & {
                                        tick?: {
                                            userTicks?: {
                                                id?: number;
                                                cursorPos?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                currentTime?: number;
                                            }[];
                                        } & {
                                            userTicks?: {
                                                id?: number;
                                                cursorPos?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                currentTime?: number;
                                            }[] & ({
                                                id?: number;
                                                cursorPos?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                currentTime?: number;
                                            } & {
                                                id?: number;
                                                cursorPos?: {
                                                    x?: number;
                                                    y?: number;
                                                } & any & { [K_25 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"][number]["cursorPos"], keyof Vec2>]: never; };
                                                currentTime?: number;
                                            } & { [K_26 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"][number], keyof UserTick>]: never; })[] & { [K_27 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"], keyof {
                                                id?: number;
                                                cursorPos?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                currentTime?: number;
                                            }[]>]: never; };
                                        } & { [K_28 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"], "userTicks">]: never; };
                                        $case: "tick";
                                    } & { [K_29 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "tick" | "$case">]: never; }) | ({
                                        userList?: {
                                            users?: {
                                                id?: number;
                                                displayName?: string;
                                            }[];
                                        };
                                    } & {
                                        $case: "userList";
                                    } & {
                                        userList?: {
                                            users?: {
                                                id?: number;
                                                displayName?: string;
                                            }[];
                                        } & {
                                            users?: {
                                                id?: number;
                                                displayName?: string;
                                            }[] & ({
                                                id?: number;
                                                displayName?: string;
                                            } & {
                                                id?: number;
                                                displayName?: string;
                                            } & { [K_30 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"]["users"][number], keyof UserInfo>]: never; })[] & { [K_31 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"]["users"], keyof {
                                                id?: number;
                                                displayName?: string;
                                            }[]>]: never; };
                                        } & { [K_32 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"], "users">]: never; };
                                        $case: "userList";
                                    } & { [K_33 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userList" | "$case">]: never; }) | ({
                                        ownId?: number;
                                    } & {
                                        $case: "ownId";
                                    } & {
                                        ownId?: number;
                                        $case: "ownId";
                                    } & { [K_34 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "ownId" | "$case">]: never; }) | ({
                                        hitObjectCreated?: {
                                            id?: number;
                                            selectedBy?: number | undefined;
                                            startTime?: number;
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            newCombo?: boolean;
                                            kind?: ({
                                                circle?: {};
                                            } & {
                                                $case: "circle";
                                            }) | ({
                                                slider?: {
                                                    expectedDistance?: number;
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                    repeats?: number;
                                                };
                                            } & {
                                                $case: "slider";
                                            }) | ({
                                                spinner?: {};
                                            } & {
                                                $case: "spinner";
                                            });
                                        };
                                    } & {
                                        $case: "hitObjectCreated";
                                    } & {
                                        hitObjectCreated?: {
                                            id?: number;
                                            selectedBy?: number | undefined;
                                            startTime?: number;
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            newCombo?: boolean;
                                            kind?: ({
                                                circle?: {};
                                            } & {
                                                $case: "circle";
                                            }) | ({
                                                slider?: {
                                                    expectedDistance?: number;
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                    repeats?: number;
                                                };
                                            } & {
                                                $case: "slider";
                                            }) | ({
                                                spinner?: {};
                                            } & {
                                                $case: "spinner";
                                            });
                                        } & {
                                            id?: number;
                                            selectedBy?: number | undefined;
                                            startTime?: number;
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            } & {
                                                x?: number;
                                                y?: number;
                                            } & { [K_35 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["position"], keyof IVec2>]: never; };
                                            newCombo?: boolean;
                                            kind?: ({
                                                circle?: {};
                                            } & {
                                                $case: "circle";
                                            } & {
                                                circle?: {} & any & { [K_36 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["circle"], never>]: never; };
                                                $case: "circle";
                                            } & { [K_37 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "circle" | "$case">]: never; }) | ({
                                                slider?: {
                                                    expectedDistance?: number;
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                    repeats?: number;
                                                };
                                            } & {
                                                $case: "slider";
                                            } & {
                                                slider?: {
                                                    expectedDistance?: number;
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                    repeats?: number;
                                                } & any & { [K_38 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"], keyof Slider>]: never; };
                                                $case: "slider";
                                            } & { [K_39 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "slider" | "$case">]: never; }) | ({
                                                spinner?: {};
                                            } & {
                                                $case: "spinner";
                                            } & {
                                                spinner?: {} & any & { [K_40 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["spinner"], never>]: never; };
                                                $case: "spinner";
                                            } & { [K_41 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "spinner" | "$case">]: never; });
                                        } & { [K_42 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"], keyof HitObject>]: never; };
                                        $case: "hitObjectCreated";
                                    } & { [K_43 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectCreated" | "$case">]: never; }) | ({
                                        hitObjectUpdated?: {
                                            id?: number;
                                            selectedBy?: number | undefined;
                                            startTime?: number;
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            newCombo?: boolean;
                                            kind?: ({
                                                circle?: {};
                                            } & {
                                                $case: "circle";
                                            }) | ({
                                                slider?: {
                                                    expectedDistance?: number;
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                    repeats?: number;
                                                };
                                            } & {
                                                $case: "slider";
                                            }) | ({
                                                spinner?: {};
                                            } & {
                                                $case: "spinner";
                                            });
                                        };
                                    } & {
                                        $case: "hitObjectUpdated";
                                    } & {
                                        hitObjectUpdated?: {
                                            id?: number;
                                            selectedBy?: number | undefined;
                                            startTime?: number;
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            newCombo?: boolean;
                                            kind?: ({
                                                circle?: {};
                                            } & {
                                                $case: "circle";
                                            }) | ({
                                                slider?: {
                                                    expectedDistance?: number;
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                    repeats?: number;
                                                };
                                            } & {
                                                $case: "slider";
                                            }) | ({
                                                spinner?: {};
                                            } & {
                                                $case: "spinner";
                                            });
                                        } & {
                                            id?: number;
                                            selectedBy?: number | undefined;
                                            startTime?: number;
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            } & {
                                                x?: number;
                                                y?: number;
                                            } & { [K_44 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["position"], keyof IVec2>]: never; };
                                            newCombo?: boolean;
                                            kind?: ({
                                                circle?: {};
                                            } & {
                                                $case: "circle";
                                            } & {
                                                circle?: {} & any & { [K_45 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["circle"], never>]: never; };
                                                $case: "circle";
                                            } & { [K_46 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "circle" | "$case">]: never; }) | ({
                                                slider?: {
                                                    expectedDistance?: number;
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                    repeats?: number;
                                                };
                                            } & {
                                                $case: "slider";
                                            } & {
                                                slider?: {
                                                    expectedDistance?: number;
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                    repeats?: number;
                                                } & any & { [K_47 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"], keyof Slider>]: never; };
                                                $case: "slider";
                                            } & { [K_48 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "slider" | "$case">]: never; }) | ({
                                                spinner?: {};
                                            } & {
                                                $case: "spinner";
                                            } & {
                                                spinner?: {} & any & { [K_49 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["spinner"], never>]: never; };
                                                $case: "spinner";
                                            } & { [K_50 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "spinner" | "$case">]: never; });
                                        } & { [K_51 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"], keyof HitObject>]: never; };
                                        $case: "hitObjectUpdated";
                                    } & { [K_52 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectUpdated" | "$case">]: never; }) | ({
                                        hitObjectDeleted?: number;
                                    } & {
                                        $case: "hitObjectDeleted";
                                    } & {
                                        hitObjectDeleted?: number;
                                        $case: "hitObjectDeleted";
                                    } & { [K_53 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectDeleted" | "$case">]: never; }) | ({
                                        hitObjectSelected?: {
                                            ids?: number[];
                                            selectedBy?: number | undefined;
                                        };
                                    } & {
                                        $case: "hitObjectSelected";
                                    } & {
                                        hitObjectSelected?: {
                                            ids?: number[];
                                            selectedBy?: number | undefined;
                                        } & {
                                            ids?: number[] & number[] & { [K_54 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectSelected"]["ids"], keyof number[]>]: never; };
                                            selectedBy?: number | undefined;
                                        } & { [K_55 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectSelected"], keyof HitObjectSelected>]: never; };
                                        $case: "hitObjectSelected";
                                    } & { [K_56 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectSelected" | "$case">]: never; }) | ({
                                        state?: {
                                            beatmap?: {
                                                difficulty?: {
                                                    hpDrainRate?: number;
                                                    circleSize?: number;
                                                    overallDifficulty?: number;
                                                    approachRate?: number;
                                                    sliderMultiplier?: number;
                                                    sliderTickRate?: number;
                                                };
                                                hitObjects?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                }[];
                                                timingPoints?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                }[];
                                            };
                                        };
                                    } & {
                                        $case: "state";
                                    } & {
                                        state?: {
                                            beatmap?: {
                                                difficulty?: {
                                                    hpDrainRate?: number;
                                                    circleSize?: number;
                                                    overallDifficulty?: number;
                                                    approachRate?: number;
                                                    sliderMultiplier?: number;
                                                    sliderTickRate?: number;
                                                };
                                                hitObjects?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                }[];
                                                timingPoints?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                }[];
                                            };
                                        } & {
                                            beatmap?: {
                                                difficulty?: {
                                                    hpDrainRate?: number;
                                                    circleSize?: number;
                                                    overallDifficulty?: number;
                                                    approachRate?: number;
                                                    sliderMultiplier?: number;
                                                    sliderTickRate?: number;
                                                };
                                                hitObjects?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                }[];
                                                timingPoints?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                }[];
                                            } & {
                                                difficulty?: {
                                                    hpDrainRate?: number;
                                                    circleSize?: number;
                                                    overallDifficulty?: number;
                                                    approachRate?: number;
                                                    sliderMultiplier?: number;
                                                    sliderTickRate?: number;
                                                } & any & { [K_57 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["difficulty"], keyof Difficulty>]: never; };
                                                hitObjects?: {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                }[] & ({
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                } & any & { [K_58 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number], keyof HitObject>]: never; })[] & { [K_59 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"], keyof {
                                                    id?: number;
                                                    selectedBy?: number | undefined;
                                                    startTime?: number;
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    newCombo?: boolean;
                                                    kind?: ({
                                                        circle?: {};
                                                    } & {
                                                        $case: "circle";
                                                    }) | ({
                                                        slider?: {
                                                            expectedDistance?: number;
                                                            controlPoints?: {
                                                                position?: {
                                                                    x?: number;
                                                                    y?: number;
                                                                };
                                                                kind?: ControlPointKind;
                                                            }[];
                                                            repeats?: number;
                                                        };
                                                    } & {
                                                        $case: "slider";
                                                    }) | ({
                                                        spinner?: {};
                                                    } & {
                                                        $case: "spinner";
                                                    });
                                                }[]>]: never; };
                                                timingPoints?: {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                }[] & ({
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                } & any & { [K_60 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"][number], keyof TimingPoint>]: never; })[] & { [K_61 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"], keyof {
                                                    id?: number;
                                                    offset?: number;
                                                    timing?: {
                                                        bpm?: number;
                                                        signature?: number;
                                                    };
                                                    sv?: number | undefined;
                                                    volume?: number | undefined;
                                                }[]>]: never; };
                                            } & { [K_62 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"], keyof Beatmap>]: never; };
                                        } & { [K_63 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"], "beatmap">]: never; };
                                        $case: "state";
                                    } & { [K_64 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "state" | "$case">]: never; }) | ({
                                        timingPointCreated?: {
                                            id?: number;
                                            offset?: number;
                                            timing?: {
                                                bpm?: number;
                                                signature?: number;
                                            };
                                            sv?: number | undefined;
                                            volume?: number | undefined;
                                        };
                                    } & {
                                        $case: "timingPointCreated";
                                    } & {
                                        timingPointCreated?: {
                                            id?: number;
                                            offset?: number;
                                            timing?: {
                                                bpm?: number;
                                                signature?: number;
                                            };
                                            sv?: number | undefined;
                                            volume?: number | undefined;
                                        } & {
                                            id?: number;
                                            offset?: number;
                                            timing?: {
                                                bpm?: number;
                                                signature?: number;
                                            } & {
                                                bpm?: number;
                                                signature?: number;
                                            } & { [K_65 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointCreated"]["timing"], keyof TimingInformation>]: never; };
                                            sv?: number | undefined;
                                            volume?: number | undefined;
                                        } & { [K_66 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointCreated"], keyof TimingPoint>]: never; };
                                        $case: "timingPointCreated";
                                    } & { [K_67 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointCreated" | "$case">]: never; }) | ({
                                        timingPointUpdated?: {
                                            id?: number;
                                            offset?: number;
                                            timing?: {
                                                bpm?: number;
                                                signature?: number;
                                            };
                                            sv?: number | undefined;
                                            volume?: number | undefined;
                                        };
                                    } & {
                                        $case: "timingPointUpdated";
                                    } & {
                                        timingPointUpdated?: {
                                            id?: number;
                                            offset?: number;
                                            timing?: {
                                                bpm?: number;
                                                signature?: number;
                                            };
                                            sv?: number | undefined;
                                            volume?: number | undefined;
                                        } & {
                                            id?: number;
                                            offset?: number;
                                            timing?: {
                                                bpm?: number;
                                                signature?: number;
                                            } & {
                                                bpm?: number;
                                                signature?: number;
                                            } & { [K_68 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointUpdated"]["timing"], keyof TimingInformation>]: never; };
                                            sv?: number | undefined;
                                            volume?: number | undefined;
                                        } & { [K_69 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointUpdated"], keyof TimingPoint>]: never; };
                                        $case: "timingPointUpdated";
                                    } & { [K_70 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointUpdated" | "$case">]: never; }) | ({
                                        timingPointDeleted?: number;
                                    } & {
                                        $case: "timingPointDeleted";
                                    } & {
                                        timingPointDeleted?: number;
                                        $case: "timingPointDeleted";
                                    } & { [K_71 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointDeleted" | "$case">]: never; }) | ({
                                        hitObjectOverridden?: {
                                            id?: number;
                                            overrides?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                time?: number | undefined;
                                                selectedBy?: number | undefined;
                                                newCombo?: boolean | undefined;
                                                controlPoints?: {
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                };
                                                expectedDistance?: number | undefined;
                                                repeatCount?: number | undefined;
                                            };
                                        };
                                    } & {
                                        $case: "hitObjectOverridden";
                                    } & {
                                        hitObjectOverridden?: {
                                            id?: number;
                                            overrides?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                time?: number | undefined;
                                                selectedBy?: number | undefined;
                                                newCombo?: boolean | undefined;
                                                controlPoints?: {
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                };
                                                expectedDistance?: number | undefined;
                                                repeatCount?: number | undefined;
                                            };
                                        } & {
                                            id?: number;
                                            overrides?: {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                };
                                                time?: number | undefined;
                                                selectedBy?: number | undefined;
                                                newCombo?: boolean | undefined;
                                                controlPoints?: {
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                };
                                                expectedDistance?: number | undefined;
                                                repeatCount?: number | undefined;
                                            } & {
                                                position?: {
                                                    x?: number;
                                                    y?: number;
                                                } & any & { [K_72 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["position"], keyof IVec2>]: never; };
                                                time?: number | undefined;
                                                selectedBy?: number | undefined;
                                                newCombo?: boolean | undefined;
                                                controlPoints?: {
                                                    controlPoints?: {
                                                        position?: {
                                                            x?: number;
                                                            y?: number;
                                                        };
                                                        kind?: ControlPointKind;
                                                    }[];
                                                } & any & { [K_73 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"], "controlPoints">]: never; };
                                                expectedDistance?: number | undefined;
                                                repeatCount?: number | undefined;
                                            } & { [K_74 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"], keyof HitObjectOverrides>]: never; };
                                        } & { [K_75 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"], keyof HitObjectOverrideCommand>]: never; };
                                        $case: "hitObjectOverridden";
                                    } & { [K_76 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectOverridden" | "$case">]: never; });
                                } & { [K_77 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"][number], keyof ServerToClientMessage>]: never; })[] & { [K_78 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"]["messages"], keyof any[]>]: never; };
                            } & { [K_79 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["multiple"], "messages">]: never; };
                            $case: "multiple";
                        } & { [K_80 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "multiple" | "$case">]: never; }) | ({
                            heartbeat?: number;
                        } & {
                            $case: "heartbeat";
                        } & {
                            heartbeat?: number;
                            $case: "heartbeat";
                        } & { [K_81 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "heartbeat" | "$case">]: never; }) | ({
                            userJoined?: {
                                id?: number;
                                displayName?: string;
                            };
                        } & {
                            $case: "userJoined";
                        } & {
                            userJoined?: {
                                id?: number;
                                displayName?: string;
                            } & {
                                id?: number;
                                displayName?: string;
                            } & { [K_82 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userJoined"], keyof UserInfo>]: never; };
                            $case: "userJoined";
                        } & { [K_83 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userJoined" | "$case">]: never; }) | ({
                            userLeft?: {
                                id?: number;
                                displayName?: string;
                            };
                        } & {
                            $case: "userLeft";
                        } & {
                            userLeft?: {
                                id?: number;
                                displayName?: string;
                            } & {
                                id?: number;
                                displayName?: string;
                            } & { [K_84 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userLeft"], keyof UserInfo>]: never; };
                            $case: "userLeft";
                        } & { [K_85 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userLeft" | "$case">]: never; }) | ({
                            tick?: {
                                userTicks?: {
                                    id?: number;
                                    cursorPos?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    currentTime?: number;
                                }[];
                            };
                        } & {
                            $case: "tick";
                        } & {
                            tick?: {
                                userTicks?: {
                                    id?: number;
                                    cursorPos?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    currentTime?: number;
                                }[];
                            } & {
                                userTicks?: {
                                    id?: number;
                                    cursorPos?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    currentTime?: number;
                                }[] & ({
                                    id?: number;
                                    cursorPos?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    currentTime?: number;
                                } & {
                                    id?: number;
                                    cursorPos?: {
                                        x?: number;
                                        y?: number;
                                    } & {
                                        x?: number;
                                        y?: number;
                                    } & { [K_86 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"][number]["cursorPos"], keyof Vec2>]: never; };
                                    currentTime?: number;
                                } & { [K_87 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"][number], keyof UserTick>]: never; })[] & { [K_88 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"]["userTicks"], keyof {
                                    id?: number;
                                    cursorPos?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    currentTime?: number;
                                }[]>]: never; };
                            } & { [K_89 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["tick"], "userTicks">]: never; };
                            $case: "tick";
                        } & { [K_90 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "tick" | "$case">]: never; }) | ({
                            userList?: {
                                users?: {
                                    id?: number;
                                    displayName?: string;
                                }[];
                            };
                        } & {
                            $case: "userList";
                        } & {
                            userList?: {
                                users?: {
                                    id?: number;
                                    displayName?: string;
                                }[];
                            } & {
                                users?: {
                                    id?: number;
                                    displayName?: string;
                                }[] & ({
                                    id?: number;
                                    displayName?: string;
                                } & {
                                    id?: number;
                                    displayName?: string;
                                } & { [K_91 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"]["users"][number], keyof UserInfo>]: never; })[] & { [K_92 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"]["users"], keyof {
                                    id?: number;
                                    displayName?: string;
                                }[]>]: never; };
                            } & { [K_93 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["userList"], "users">]: never; };
                            $case: "userList";
                        } & { [K_94 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "userList" | "$case">]: never; }) | ({
                            ownId?: number;
                        } & {
                            $case: "ownId";
                        } & {
                            ownId?: number;
                            $case: "ownId";
                        } & { [K_95 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "ownId" | "$case">]: never; }) | ({
                            hitObjectCreated?: {
                                id?: number;
                                selectedBy?: number | undefined;
                                startTime?: number;
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                newCombo?: boolean;
                                kind?: ({
                                    circle?: {};
                                } & {
                                    $case: "circle";
                                }) | ({
                                    slider?: {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                        repeats?: number;
                                    };
                                } & {
                                    $case: "slider";
                                }) | ({
                                    spinner?: {};
                                } & {
                                    $case: "spinner";
                                });
                            };
                        } & {
                            $case: "hitObjectCreated";
                        } & {
                            hitObjectCreated?: {
                                id?: number;
                                selectedBy?: number | undefined;
                                startTime?: number;
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                newCombo?: boolean;
                                kind?: ({
                                    circle?: {};
                                } & {
                                    $case: "circle";
                                }) | ({
                                    slider?: {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                        repeats?: number;
                                    };
                                } & {
                                    $case: "slider";
                                }) | ({
                                    spinner?: {};
                                } & {
                                    $case: "spinner";
                                });
                            } & {
                                id?: number;
                                selectedBy?: number | undefined;
                                startTime?: number;
                                position?: {
                                    x?: number;
                                    y?: number;
                                } & {
                                    x?: number;
                                    y?: number;
                                } & { [K_96 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["position"], keyof IVec2>]: never; };
                                newCombo?: boolean;
                                kind?: ({
                                    circle?: {};
                                } & {
                                    $case: "circle";
                                } & {
                                    circle?: {} & {} & { [K_97 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["circle"], never>]: never; };
                                    $case: "circle";
                                } & { [K_98 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "circle" | "$case">]: never; }) | ({
                                    slider?: {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                        repeats?: number;
                                    };
                                } & {
                                    $case: "slider";
                                } & {
                                    slider?: {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                        repeats?: number;
                                    } & {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[] & ({
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        } & {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            } & {
                                                x?: number;
                                                y?: number;
                                            } & { [K_99 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                            kind?: ControlPointKind;
                                        } & { [K_100 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_101 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"], keyof {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[]>]: never; };
                                        repeats?: number;
                                    } & { [K_102 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"], keyof Slider>]: never; };
                                    $case: "slider";
                                } & { [K_103 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "slider" | "$case">]: never; }) | ({
                                    spinner?: {};
                                } & {
                                    $case: "spinner";
                                } & {
                                    spinner?: {} & {} & { [K_104 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["spinner"], never>]: never; };
                                    $case: "spinner";
                                } & { [K_105 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "spinner" | "$case">]: never; });
                            } & { [K_106 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectCreated"], keyof HitObject>]: never; };
                            $case: "hitObjectCreated";
                        } & { [K_107 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectCreated" | "$case">]: never; }) | ({
                            hitObjectUpdated?: {
                                id?: number;
                                selectedBy?: number | undefined;
                                startTime?: number;
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                newCombo?: boolean;
                                kind?: ({
                                    circle?: {};
                                } & {
                                    $case: "circle";
                                }) | ({
                                    slider?: {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                        repeats?: number;
                                    };
                                } & {
                                    $case: "slider";
                                }) | ({
                                    spinner?: {};
                                } & {
                                    $case: "spinner";
                                });
                            };
                        } & {
                            $case: "hitObjectUpdated";
                        } & {
                            hitObjectUpdated?: {
                                id?: number;
                                selectedBy?: number | undefined;
                                startTime?: number;
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                newCombo?: boolean;
                                kind?: ({
                                    circle?: {};
                                } & {
                                    $case: "circle";
                                }) | ({
                                    slider?: {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                        repeats?: number;
                                    };
                                } & {
                                    $case: "slider";
                                }) | ({
                                    spinner?: {};
                                } & {
                                    $case: "spinner";
                                });
                            } & {
                                id?: number;
                                selectedBy?: number | undefined;
                                startTime?: number;
                                position?: {
                                    x?: number;
                                    y?: number;
                                } & {
                                    x?: number;
                                    y?: number;
                                } & { [K_108 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["position"], keyof IVec2>]: never; };
                                newCombo?: boolean;
                                kind?: ({
                                    circle?: {};
                                } & {
                                    $case: "circle";
                                } & {
                                    circle?: {} & {} & { [K_109 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["circle"], never>]: never; };
                                    $case: "circle";
                                } & { [K_110 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "circle" | "$case">]: never; }) | ({
                                    slider?: {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                        repeats?: number;
                                    };
                                } & {
                                    $case: "slider";
                                } & {
                                    slider?: {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                        repeats?: number;
                                    } & {
                                        expectedDistance?: number;
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[] & ({
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        } & {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            } & {
                                                x?: number;
                                                y?: number;
                                            } & { [K_111 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                            kind?: ControlPointKind;
                                        } & { [K_112 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_113 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"], keyof {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[]>]: never; };
                                        repeats?: number;
                                    } & { [K_114 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"], keyof Slider>]: never; };
                                    $case: "slider";
                                } & { [K_115 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "slider" | "$case">]: never; }) | ({
                                    spinner?: {};
                                } & {
                                    $case: "spinner";
                                } & {
                                    spinner?: {} & {} & { [K_116 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["spinner"], never>]: never; };
                                    $case: "spinner";
                                } & { [K_117 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "spinner" | "$case">]: never; });
                            } & { [K_118 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectUpdated"], keyof HitObject>]: never; };
                            $case: "hitObjectUpdated";
                        } & { [K_119 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectUpdated" | "$case">]: never; }) | ({
                            hitObjectDeleted?: number;
                        } & {
                            $case: "hitObjectDeleted";
                        } & {
                            hitObjectDeleted?: number;
                            $case: "hitObjectDeleted";
                        } & { [K_120 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectDeleted" | "$case">]: never; }) | ({
                            hitObjectSelected?: {
                                ids?: number[];
                                selectedBy?: number | undefined;
                            };
                        } & {
                            $case: "hitObjectSelected";
                        } & {
                            hitObjectSelected?: {
                                ids?: number[];
                                selectedBy?: number | undefined;
                            } & {
                                ids?: number[] & number[] & { [K_121 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectSelected"]["ids"], keyof number[]>]: never; };
                                selectedBy?: number | undefined;
                            } & { [K_122 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectSelected"], keyof HitObjectSelected>]: never; };
                            $case: "hitObjectSelected";
                        } & { [K_123 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectSelected" | "$case">]: never; }) | ({
                            state?: {
                                beatmap?: {
                                    difficulty?: {
                                        hpDrainRate?: number;
                                        circleSize?: number;
                                        overallDifficulty?: number;
                                        approachRate?: number;
                                        sliderMultiplier?: number;
                                        sliderTickRate?: number;
                                    };
                                    hitObjects?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    }[];
                                    timingPoints?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    }[];
                                };
                            };
                        } & {
                            $case: "state";
                        } & {
                            state?: {
                                beatmap?: {
                                    difficulty?: {
                                        hpDrainRate?: number;
                                        circleSize?: number;
                                        overallDifficulty?: number;
                                        approachRate?: number;
                                        sliderMultiplier?: number;
                                        sliderTickRate?: number;
                                    };
                                    hitObjects?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    }[];
                                    timingPoints?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    }[];
                                };
                            } & {
                                beatmap?: {
                                    difficulty?: {
                                        hpDrainRate?: number;
                                        circleSize?: number;
                                        overallDifficulty?: number;
                                        approachRate?: number;
                                        sliderMultiplier?: number;
                                        sliderTickRate?: number;
                                    };
                                    hitObjects?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    }[];
                                    timingPoints?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    }[];
                                } & {
                                    difficulty?: {
                                        hpDrainRate?: number;
                                        circleSize?: number;
                                        overallDifficulty?: number;
                                        approachRate?: number;
                                        sliderMultiplier?: number;
                                        sliderTickRate?: number;
                                    } & {
                                        hpDrainRate?: number;
                                        circleSize?: number;
                                        overallDifficulty?: number;
                                        approachRate?: number;
                                        sliderMultiplier?: number;
                                        sliderTickRate?: number;
                                    } & { [K_124 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["difficulty"], keyof Difficulty>]: never; };
                                    hitObjects?: {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    }[] & ({
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    } & {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        } & {
                                            x?: number;
                                            y?: number;
                                        } & { [K_125 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["position"], keyof IVec2>]: never; };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        } & {
                                            circle?: {} & {} & { [K_126 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["circle"], never>]: never; };
                                            $case: "circle";
                                        } & { [K_127 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "circle" | "$case">]: never; }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        } & {
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            } & {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[] & ({
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                } & any & { [K_128 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_129 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"], keyof {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[]>]: never; };
                                                repeats?: number;
                                            } & { [K_130 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"], keyof Slider>]: never; };
                                            $case: "slider";
                                        } & { [K_131 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "slider" | "$case">]: never; }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        } & {
                                            spinner?: {} & {} & { [K_132 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["spinner"], never>]: never; };
                                            $case: "spinner";
                                        } & { [K_133 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "spinner" | "$case">]: never; });
                                    } & { [K_134 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number], keyof HitObject>]: never; })[] & { [K_135 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"], keyof {
                                        id?: number;
                                        selectedBy?: number | undefined;
                                        startTime?: number;
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        newCombo?: boolean;
                                        kind?: ({
                                            circle?: {};
                                        } & {
                                            $case: "circle";
                                        }) | ({
                                            slider?: {
                                                expectedDistance?: number;
                                                controlPoints?: {
                                                    position?: {
                                                        x?: number;
                                                        y?: number;
                                                    };
                                                    kind?: ControlPointKind;
                                                }[];
                                                repeats?: number;
                                            };
                                        } & {
                                            $case: "slider";
                                        }) | ({
                                            spinner?: {};
                                        } & {
                                            $case: "spinner";
                                        });
                                    }[]>]: never; };
                                    timingPoints?: {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    }[] & ({
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    } & {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        } & {
                                            bpm?: number;
                                            signature?: number;
                                        } & { [K_136 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"][number]["timing"], keyof TimingInformation>]: never; };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    } & { [K_137 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"][number], keyof TimingPoint>]: never; })[] & { [K_138 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"], keyof {
                                        id?: number;
                                        offset?: number;
                                        timing?: {
                                            bpm?: number;
                                            signature?: number;
                                        };
                                        sv?: number | undefined;
                                        volume?: number | undefined;
                                    }[]>]: never; };
                                } & { [K_139 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"]["beatmap"], keyof Beatmap>]: never; };
                            } & { [K_140 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["state"], "beatmap">]: never; };
                            $case: "state";
                        } & { [K_141 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "state" | "$case">]: never; }) | ({
                            timingPointCreated?: {
                                id?: number;
                                offset?: number;
                                timing?: {
                                    bpm?: number;
                                    signature?: number;
                                };
                                sv?: number | undefined;
                                volume?: number | undefined;
                            };
                        } & {
                            $case: "timingPointCreated";
                        } & {
                            timingPointCreated?: {
                                id?: number;
                                offset?: number;
                                timing?: {
                                    bpm?: number;
                                    signature?: number;
                                };
                                sv?: number | undefined;
                                volume?: number | undefined;
                            } & {
                                id?: number;
                                offset?: number;
                                timing?: {
                                    bpm?: number;
                                    signature?: number;
                                } & {
                                    bpm?: number;
                                    signature?: number;
                                } & { [K_142 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointCreated"]["timing"], keyof TimingInformation>]: never; };
                                sv?: number | undefined;
                                volume?: number | undefined;
                            } & { [K_143 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointCreated"], keyof TimingPoint>]: never; };
                            $case: "timingPointCreated";
                        } & { [K_144 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointCreated" | "$case">]: never; }) | ({
                            timingPointUpdated?: {
                                id?: number;
                                offset?: number;
                                timing?: {
                                    bpm?: number;
                                    signature?: number;
                                };
                                sv?: number | undefined;
                                volume?: number | undefined;
                            };
                        } & {
                            $case: "timingPointUpdated";
                        } & {
                            timingPointUpdated?: {
                                id?: number;
                                offset?: number;
                                timing?: {
                                    bpm?: number;
                                    signature?: number;
                                };
                                sv?: number | undefined;
                                volume?: number | undefined;
                            } & {
                                id?: number;
                                offset?: number;
                                timing?: {
                                    bpm?: number;
                                    signature?: number;
                                } & {
                                    bpm?: number;
                                    signature?: number;
                                } & { [K_145 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointUpdated"]["timing"], keyof TimingInformation>]: never; };
                                sv?: number | undefined;
                                volume?: number | undefined;
                            } & { [K_146 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["timingPointUpdated"], keyof TimingPoint>]: never; };
                            $case: "timingPointUpdated";
                        } & { [K_147 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointUpdated" | "$case">]: never; }) | ({
                            timingPointDeleted?: number;
                        } & {
                            $case: "timingPointDeleted";
                        } & {
                            timingPointDeleted?: number;
                            $case: "timingPointDeleted";
                        } & { [K_148 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "timingPointDeleted" | "$case">]: never; }) | ({
                            hitObjectOverridden?: {
                                id?: number;
                                overrides?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    time?: number | undefined;
                                    selectedBy?: number | undefined;
                                    newCombo?: boolean | undefined;
                                    controlPoints?: {
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                    };
                                    expectedDistance?: number | undefined;
                                    repeatCount?: number | undefined;
                                };
                            };
                        } & {
                            $case: "hitObjectOverridden";
                        } & {
                            hitObjectOverridden?: {
                                id?: number;
                                overrides?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    time?: number | undefined;
                                    selectedBy?: number | undefined;
                                    newCombo?: boolean | undefined;
                                    controlPoints?: {
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                    };
                                    expectedDistance?: number | undefined;
                                    repeatCount?: number | undefined;
                                };
                            } & {
                                id?: number;
                                overrides?: {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    };
                                    time?: number | undefined;
                                    selectedBy?: number | undefined;
                                    newCombo?: boolean | undefined;
                                    controlPoints?: {
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                    };
                                    expectedDistance?: number | undefined;
                                    repeatCount?: number | undefined;
                                } & {
                                    position?: {
                                        x?: number;
                                        y?: number;
                                    } & {
                                        x?: number;
                                        y?: number;
                                    } & { [K_149 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["position"], keyof IVec2>]: never; };
                                    time?: number | undefined;
                                    selectedBy?: number | undefined;
                                    newCombo?: boolean | undefined;
                                    controlPoints?: {
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[];
                                    } & {
                                        controlPoints?: {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[] & ({
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        } & {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            } & {
                                                x?: number;
                                                y?: number;
                                            } & { [K_150 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                            kind?: ControlPointKind;
                                        } & { [K_151 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_152 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"], keyof {
                                            position?: {
                                                x?: number;
                                                y?: number;
                                            };
                                            kind?: ControlPointKind;
                                        }[]>]: never; };
                                    } & { [K_153 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"], "controlPoints">]: never; };
                                    expectedDistance?: number | undefined;
                                    repeatCount?: number | undefined;
                                } & { [K_154 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"], keyof HitObjectOverrides>]: never; };
                            } & { [K_155 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"]["hitObjectOverridden"], keyof HitObjectOverrideCommand>]: never; };
                            $case: "hitObjectOverridden";
                        } & { [K_156 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number]["serverCommand"], "hitObjectOverridden" | "$case">]: never; });
                    } & { [K_157 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"][number], keyof ServerToClientMessage>]: never; })[] & { [K_158 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"]["messages"], keyof any[]>]: never; };
                } & { [K_159 in Exclude<keyof I["messages"][number]["serverCommand"]["multiple"], "messages">]: never; };
                $case: "multiple";
            } & { [K_160 in Exclude<keyof I["messages"][number]["serverCommand"], "multiple" | "$case">]: never; }) | ({
                heartbeat?: number;
            } & {
                $case: "heartbeat";
            } & {
                heartbeat?: number;
                $case: "heartbeat";
            } & { [K_161 in Exclude<keyof I["messages"][number]["serverCommand"], "heartbeat" | "$case">]: never; }) | ({
                userJoined?: {
                    id?: number;
                    displayName?: string;
                };
            } & {
                $case: "userJoined";
            } & {
                userJoined?: {
                    id?: number;
                    displayName?: string;
                } & {
                    id?: number;
                    displayName?: string;
                } & { [K_162 in Exclude<keyof I["messages"][number]["serverCommand"]["userJoined"], keyof UserInfo>]: never; };
                $case: "userJoined";
            } & { [K_163 in Exclude<keyof I["messages"][number]["serverCommand"], "userJoined" | "$case">]: never; }) | ({
                userLeft?: {
                    id?: number;
                    displayName?: string;
                };
            } & {
                $case: "userLeft";
            } & {
                userLeft?: {
                    id?: number;
                    displayName?: string;
                } & {
                    id?: number;
                    displayName?: string;
                } & { [K_164 in Exclude<keyof I["messages"][number]["serverCommand"]["userLeft"], keyof UserInfo>]: never; };
                $case: "userLeft";
            } & { [K_165 in Exclude<keyof I["messages"][number]["serverCommand"], "userLeft" | "$case">]: never; }) | ({
                tick?: {
                    userTicks?: {
                        id?: number;
                        cursorPos?: {
                            x?: number;
                            y?: number;
                        };
                        currentTime?: number;
                    }[];
                };
            } & {
                $case: "tick";
            } & {
                tick?: {
                    userTicks?: {
                        id?: number;
                        cursorPos?: {
                            x?: number;
                            y?: number;
                        };
                        currentTime?: number;
                    }[];
                } & {
                    userTicks?: {
                        id?: number;
                        cursorPos?: {
                            x?: number;
                            y?: number;
                        };
                        currentTime?: number;
                    }[] & ({
                        id?: number;
                        cursorPos?: {
                            x?: number;
                            y?: number;
                        };
                        currentTime?: number;
                    } & {
                        id?: number;
                        cursorPos?: {
                            x?: number;
                            y?: number;
                        } & {
                            x?: number;
                            y?: number;
                        } & { [K_166 in Exclude<keyof I["messages"][number]["serverCommand"]["tick"]["userTicks"][number]["cursorPos"], keyof Vec2>]: never; };
                        currentTime?: number;
                    } & { [K_167 in Exclude<keyof I["messages"][number]["serverCommand"]["tick"]["userTicks"][number], keyof UserTick>]: never; })[] & { [K_168 in Exclude<keyof I["messages"][number]["serverCommand"]["tick"]["userTicks"], keyof {
                        id?: number;
                        cursorPos?: {
                            x?: number;
                            y?: number;
                        };
                        currentTime?: number;
                    }[]>]: never; };
                } & { [K_169 in Exclude<keyof I["messages"][number]["serverCommand"]["tick"], "userTicks">]: never; };
                $case: "tick";
            } & { [K_170 in Exclude<keyof I["messages"][number]["serverCommand"], "tick" | "$case">]: never; }) | ({
                userList?: {
                    users?: {
                        id?: number;
                        displayName?: string;
                    }[];
                };
            } & {
                $case: "userList";
            } & {
                userList?: {
                    users?: {
                        id?: number;
                        displayName?: string;
                    }[];
                } & {
                    users?: {
                        id?: number;
                        displayName?: string;
                    }[] & ({
                        id?: number;
                        displayName?: string;
                    } & {
                        id?: number;
                        displayName?: string;
                    } & { [K_171 in Exclude<keyof I["messages"][number]["serverCommand"]["userList"]["users"][number], keyof UserInfo>]: never; })[] & { [K_172 in Exclude<keyof I["messages"][number]["serverCommand"]["userList"]["users"], keyof {
                        id?: number;
                        displayName?: string;
                    }[]>]: never; };
                } & { [K_173 in Exclude<keyof I["messages"][number]["serverCommand"]["userList"], "users">]: never; };
                $case: "userList";
            } & { [K_174 in Exclude<keyof I["messages"][number]["serverCommand"], "userList" | "$case">]: never; }) | ({
                ownId?: number;
            } & {
                $case: "ownId";
            } & {
                ownId?: number;
                $case: "ownId";
            } & { [K_175 in Exclude<keyof I["messages"][number]["serverCommand"], "ownId" | "$case">]: never; }) | ({
                hitObjectCreated?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                };
            } & {
                $case: "hitObjectCreated";
            } & {
                hitObjectCreated?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                } & {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    } & {
                        x?: number;
                        y?: number;
                    } & { [K_176 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"]["position"], keyof IVec2>]: never; };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    } & {
                        circle?: {} & {} & { [K_177 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["circle"], never>]: never; };
                        $case: "circle";
                    } & { [K_178 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "circle" | "$case">]: never; }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    } & {
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        } & {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[] & ({
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            } & {
                                position?: {
                                    x?: number;
                                    y?: number;
                                } & {
                                    x?: number;
                                    y?: number;
                                } & { [K_179 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                kind?: ControlPointKind;
                            } & { [K_180 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_181 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"]["controlPoints"], keyof {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[]>]: never; };
                            repeats?: number;
                        } & { [K_182 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["slider"], keyof Slider>]: never; };
                        $case: "slider";
                    } & { [K_183 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "slider" | "$case">]: never; }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    } & {
                        spinner?: {} & {} & { [K_184 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"]["spinner"], never>]: never; };
                        $case: "spinner";
                    } & { [K_185 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"]["kind"], "spinner" | "$case">]: never; });
                } & { [K_186 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectCreated"], keyof HitObject>]: never; };
                $case: "hitObjectCreated";
            } & { [K_187 in Exclude<keyof I["messages"][number]["serverCommand"], "hitObjectCreated" | "$case">]: never; }) | ({
                hitObjectUpdated?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                };
            } & {
                $case: "hitObjectUpdated";
            } & {
                hitObjectUpdated?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                } & {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    } & {
                        x?: number;
                        y?: number;
                    } & { [K_188 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"]["position"], keyof IVec2>]: never; };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    } & {
                        circle?: {} & {} & { [K_189 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["circle"], never>]: never; };
                        $case: "circle";
                    } & { [K_190 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "circle" | "$case">]: never; }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    } & {
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        } & {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[] & ({
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            } & {
                                position?: {
                                    x?: number;
                                    y?: number;
                                } & {
                                    x?: number;
                                    y?: number;
                                } & { [K_191 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                kind?: ControlPointKind;
                            } & { [K_192 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_193 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"]["controlPoints"], keyof {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[]>]: never; };
                            repeats?: number;
                        } & { [K_194 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["slider"], keyof Slider>]: never; };
                        $case: "slider";
                    } & { [K_195 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "slider" | "$case">]: never; }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    } & {
                        spinner?: {} & {} & { [K_196 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"]["spinner"], never>]: never; };
                        $case: "spinner";
                    } & { [K_197 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"]["kind"], "spinner" | "$case">]: never; });
                } & { [K_198 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectUpdated"], keyof HitObject>]: never; };
                $case: "hitObjectUpdated";
            } & { [K_199 in Exclude<keyof I["messages"][number]["serverCommand"], "hitObjectUpdated" | "$case">]: never; }) | ({
                hitObjectDeleted?: number;
            } & {
                $case: "hitObjectDeleted";
            } & {
                hitObjectDeleted?: number;
                $case: "hitObjectDeleted";
            } & { [K_200 in Exclude<keyof I["messages"][number]["serverCommand"], "hitObjectDeleted" | "$case">]: never; }) | ({
                hitObjectSelected?: {
                    ids?: number[];
                    selectedBy?: number | undefined;
                };
            } & {
                $case: "hitObjectSelected";
            } & {
                hitObjectSelected?: {
                    ids?: number[];
                    selectedBy?: number | undefined;
                } & {
                    ids?: number[] & number[] & { [K_201 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectSelected"]["ids"], keyof number[]>]: never; };
                    selectedBy?: number | undefined;
                } & { [K_202 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectSelected"], keyof HitObjectSelected>]: never; };
                $case: "hitObjectSelected";
            } & { [K_203 in Exclude<keyof I["messages"][number]["serverCommand"], "hitObjectSelected" | "$case">]: never; }) | ({
                state?: {
                    beatmap?: {
                        difficulty?: {
                            hpDrainRate?: number;
                            circleSize?: number;
                            overallDifficulty?: number;
                            approachRate?: number;
                            sliderMultiplier?: number;
                            sliderTickRate?: number;
                        };
                        hitObjects?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        }[];
                        timingPoints?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        }[];
                    };
                };
            } & {
                $case: "state";
            } & {
                state?: {
                    beatmap?: {
                        difficulty?: {
                            hpDrainRate?: number;
                            circleSize?: number;
                            overallDifficulty?: number;
                            approachRate?: number;
                            sliderMultiplier?: number;
                            sliderTickRate?: number;
                        };
                        hitObjects?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        }[];
                        timingPoints?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        }[];
                    };
                } & {
                    beatmap?: {
                        difficulty?: {
                            hpDrainRate?: number;
                            circleSize?: number;
                            overallDifficulty?: number;
                            approachRate?: number;
                            sliderMultiplier?: number;
                            sliderTickRate?: number;
                        };
                        hitObjects?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        }[];
                        timingPoints?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        }[];
                    } & {
                        difficulty?: {
                            hpDrainRate?: number;
                            circleSize?: number;
                            overallDifficulty?: number;
                            approachRate?: number;
                            sliderMultiplier?: number;
                            sliderTickRate?: number;
                        } & {
                            hpDrainRate?: number;
                            circleSize?: number;
                            overallDifficulty?: number;
                            approachRate?: number;
                            sliderMultiplier?: number;
                            sliderTickRate?: number;
                        } & { [K_204 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["difficulty"], keyof Difficulty>]: never; };
                        hitObjects?: {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        }[] & ({
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        } & {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            } & {
                                x?: number;
                                y?: number;
                            } & { [K_205 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["position"], keyof IVec2>]: never; };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            } & {
                                circle?: {} & {} & { [K_206 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["circle"], never>]: never; };
                                $case: "circle";
                            } & { [K_207 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "circle" | "$case">]: never; }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            } & {
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                } & {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[] & ({
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    } & {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        } & {
                                            x?: number;
                                            y?: number;
                                        } & { [K_208 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                        kind?: ControlPointKind;
                                    } & { [K_209 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_210 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"], keyof {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[]>]: never; };
                                    repeats?: number;
                                } & { [K_211 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["slider"], keyof Slider>]: never; };
                                $case: "slider";
                            } & { [K_212 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "slider" | "$case">]: never; }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            } & {
                                spinner?: {} & {} & { [K_213 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"]["spinner"], never>]: never; };
                                $case: "spinner";
                            } & { [K_214 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number]["kind"], "spinner" | "$case">]: never; });
                        } & { [K_215 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"][number], keyof HitObject>]: never; })[] & { [K_216 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["hitObjects"], keyof {
                            id?: number;
                            selectedBy?: number | undefined;
                            startTime?: number;
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            newCombo?: boolean;
                            kind?: ({
                                circle?: {};
                            } & {
                                $case: "circle";
                            }) | ({
                                slider?: {
                                    expectedDistance?: number;
                                    controlPoints?: {
                                        position?: {
                                            x?: number;
                                            y?: number;
                                        };
                                        kind?: ControlPointKind;
                                    }[];
                                    repeats?: number;
                                };
                            } & {
                                $case: "slider";
                            }) | ({
                                spinner?: {};
                            } & {
                                $case: "spinner";
                            });
                        }[]>]: never; };
                        timingPoints?: {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        }[] & ({
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        } & {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            } & {
                                bpm?: number;
                                signature?: number;
                            } & { [K_217 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"][number]["timing"], keyof TimingInformation>]: never; };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        } & { [K_218 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"][number], keyof TimingPoint>]: never; })[] & { [K_219 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"]["timingPoints"], keyof {
                            id?: number;
                            offset?: number;
                            timing?: {
                                bpm?: number;
                                signature?: number;
                            };
                            sv?: number | undefined;
                            volume?: number | undefined;
                        }[]>]: never; };
                    } & { [K_220 in Exclude<keyof I["messages"][number]["serverCommand"]["state"]["beatmap"], keyof Beatmap>]: never; };
                } & { [K_221 in Exclude<keyof I["messages"][number]["serverCommand"]["state"], "beatmap">]: never; };
                $case: "state";
            } & { [K_222 in Exclude<keyof I["messages"][number]["serverCommand"], "state" | "$case">]: never; }) | ({
                timingPointCreated?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                };
            } & {
                $case: "timingPointCreated";
            } & {
                timingPointCreated?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                } & {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    } & {
                        bpm?: number;
                        signature?: number;
                    } & { [K_223 in Exclude<keyof I["messages"][number]["serverCommand"]["timingPointCreated"]["timing"], keyof TimingInformation>]: never; };
                    sv?: number | undefined;
                    volume?: number | undefined;
                } & { [K_224 in Exclude<keyof I["messages"][number]["serverCommand"]["timingPointCreated"], keyof TimingPoint>]: never; };
                $case: "timingPointCreated";
            } & { [K_225 in Exclude<keyof I["messages"][number]["serverCommand"], "timingPointCreated" | "$case">]: never; }) | ({
                timingPointUpdated?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                };
            } & {
                $case: "timingPointUpdated";
            } & {
                timingPointUpdated?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                } & {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    } & {
                        bpm?: number;
                        signature?: number;
                    } & { [K_226 in Exclude<keyof I["messages"][number]["serverCommand"]["timingPointUpdated"]["timing"], keyof TimingInformation>]: never; };
                    sv?: number | undefined;
                    volume?: number | undefined;
                } & { [K_227 in Exclude<keyof I["messages"][number]["serverCommand"]["timingPointUpdated"], keyof TimingPoint>]: never; };
                $case: "timingPointUpdated";
            } & { [K_228 in Exclude<keyof I["messages"][number]["serverCommand"], "timingPointUpdated" | "$case">]: never; }) | ({
                timingPointDeleted?: number;
            } & {
                $case: "timingPointDeleted";
            } & {
                timingPointDeleted?: number;
                $case: "timingPointDeleted";
            } & { [K_229 in Exclude<keyof I["messages"][number]["serverCommand"], "timingPointDeleted" | "$case">]: never; }) | ({
                hitObjectOverridden?: {
                    id?: number;
                    overrides?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        time?: number | undefined;
                        selectedBy?: number | undefined;
                        newCombo?: boolean | undefined;
                        controlPoints?: {
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                        };
                        expectedDistance?: number | undefined;
                        repeatCount?: number | undefined;
                    };
                };
            } & {
                $case: "hitObjectOverridden";
            } & {
                hitObjectOverridden?: {
                    id?: number;
                    overrides?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        time?: number | undefined;
                        selectedBy?: number | undefined;
                        newCombo?: boolean | undefined;
                        controlPoints?: {
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                        };
                        expectedDistance?: number | undefined;
                        repeatCount?: number | undefined;
                    };
                } & {
                    id?: number;
                    overrides?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        time?: number | undefined;
                        selectedBy?: number | undefined;
                        newCombo?: boolean | undefined;
                        controlPoints?: {
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                        };
                        expectedDistance?: number | undefined;
                        repeatCount?: number | undefined;
                    } & {
                        position?: {
                            x?: number;
                            y?: number;
                        } & {
                            x?: number;
                            y?: number;
                        } & { [K_230 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["position"], keyof IVec2>]: never; };
                        time?: number | undefined;
                        selectedBy?: number | undefined;
                        newCombo?: boolean | undefined;
                        controlPoints?: {
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                        } & {
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[] & ({
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            } & {
                                position?: {
                                    x?: number;
                                    y?: number;
                                } & {
                                    x?: number;
                                    y?: number;
                                } & { [K_231 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                kind?: ControlPointKind;
                            } & { [K_232 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_233 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"]["controlPoints"], keyof {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[]>]: never; };
                        } & { [K_234 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"]["controlPoints"], "controlPoints">]: never; };
                        expectedDistance?: number | undefined;
                        repeatCount?: number | undefined;
                    } & { [K_235 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectOverridden"]["overrides"], keyof HitObjectOverrides>]: never; };
                } & { [K_236 in Exclude<keyof I["messages"][number]["serverCommand"]["hitObjectOverridden"], keyof HitObjectOverrideCommand>]: never; };
                $case: "hitObjectOverridden";
            } & { [K_237 in Exclude<keyof I["messages"][number]["serverCommand"], "hitObjectOverridden" | "$case">]: never; });
        } & { [K_238 in Exclude<keyof I["messages"][number], keyof ServerToClientMessage>]: never; })[] & { [K_239 in Exclude<keyof I["messages"], keyof any[]>]: never; };
    } & { [K_240 in Exclude<keyof I, "messages">]: never; }>(object: I): MultiServerToClientMessage;
};
export declare const ClientToServerMessage: {
    encode(message: ClientToServerMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClientToServerMessage;
    fromJSON(object: any): ClientToServerMessage;
    toJSON(message: ClientToServerMessage): unknown;
    fromPartial<I extends {
        responseId?: string | undefined;
        clientCommand?: ({
            cursorPos?: {
                x?: number;
                y?: number;
            };
        } & {
            $case: "cursorPos";
        }) | ({
            currentTime?: number;
        } & {
            $case: "currentTime";
        }) | ({
            selectHitObject?: {
                ids?: number[];
                selected?: boolean;
                unique?: boolean;
            };
        } & {
            $case: "selectHitObject";
        }) | ({
            createHitObject?: {
                hitObject?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                };
            };
        } & {
            $case: "createHitObject";
        }) | ({
            updateHitObject?: {
                hitObject?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                };
            };
        } & {
            $case: "updateHitObject";
        }) | ({
            deleteHitObject?: {
                ids?: number[];
            };
        } & {
            $case: "deleteHitObject";
        }) | ({
            createTimingPoint?: {
                timingPoint?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                };
            };
        } & {
            $case: "createTimingPoint";
        }) | ({
            updateTimingPoint?: {
                timingPoint?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                };
            };
        } & {
            $case: "updateTimingPoint";
        }) | ({
            deleteTimingPoint?: {
                ids?: number[];
            };
        } & {
            $case: "deleteTimingPoint";
        }) | ({
            setHitObjectOverrides?: {
                id?: number;
                overrides?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    time?: number | undefined;
                    selectedBy?: number | undefined;
                    newCombo?: boolean | undefined;
                    controlPoints?: {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                    };
                    expectedDistance?: number | undefined;
                    repeatCount?: number | undefined;
                };
            };
        } & {
            $case: "setHitObjectOverrides";
        });
    } & {
        responseId?: string | undefined;
        clientCommand?: ({
            cursorPos?: {
                x?: number;
                y?: number;
            };
        } & {
            $case: "cursorPos";
        } & {
            cursorPos?: {
                x?: number;
                y?: number;
            } & {
                x?: number;
                y?: number;
            } & { [K in Exclude<keyof I["clientCommand"]["cursorPos"], keyof Vec2>]: never; };
            $case: "cursorPos";
        } & { [K_1 in Exclude<keyof I["clientCommand"], "cursorPos" | "$case">]: never; }) | ({
            currentTime?: number;
        } & {
            $case: "currentTime";
        } & {
            currentTime?: number;
            $case: "currentTime";
        } & { [K_2 in Exclude<keyof I["clientCommand"], "currentTime" | "$case">]: never; }) | ({
            selectHitObject?: {
                ids?: number[];
                selected?: boolean;
                unique?: boolean;
            };
        } & {
            $case: "selectHitObject";
        } & {
            selectHitObject?: {
                ids?: number[];
                selected?: boolean;
                unique?: boolean;
            } & {
                ids?: number[] & number[] & { [K_3 in Exclude<keyof I["clientCommand"]["selectHitObject"]["ids"], keyof number[]>]: never; };
                selected?: boolean;
                unique?: boolean;
            } & { [K_4 in Exclude<keyof I["clientCommand"]["selectHitObject"], keyof SelectHitObject>]: never; };
            $case: "selectHitObject";
        } & { [K_5 in Exclude<keyof I["clientCommand"], "selectHitObject" | "$case">]: never; }) | ({
            createHitObject?: {
                hitObject?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                };
            };
        } & {
            $case: "createHitObject";
        } & {
            createHitObject?: {
                hitObject?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                };
            } & {
                hitObject?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                } & {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    } & {
                        x?: number;
                        y?: number;
                    } & { [K_6 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"]["position"], keyof IVec2>]: never; };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    } & {
                        circle?: {} & {} & { [K_7 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"]["kind"]["circle"], never>]: never; };
                        $case: "circle";
                    } & { [K_8 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"]["kind"], "circle" | "$case">]: never; }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    } & {
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        } & {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[] & ({
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            } & {
                                position?: {
                                    x?: number;
                                    y?: number;
                                } & {
                                    x?: number;
                                    y?: number;
                                } & { [K_9 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                kind?: ControlPointKind;
                            } & { [K_10 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_11 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"]["kind"]["slider"]["controlPoints"], keyof {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[]>]: never; };
                            repeats?: number;
                        } & { [K_12 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"]["kind"]["slider"], keyof Slider>]: never; };
                        $case: "slider";
                    } & { [K_13 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"]["kind"], "slider" | "$case">]: never; }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    } & {
                        spinner?: {} & {} & { [K_14 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"]["kind"]["spinner"], never>]: never; };
                        $case: "spinner";
                    } & { [K_15 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"]["kind"], "spinner" | "$case">]: never; });
                } & { [K_16 in Exclude<keyof I["clientCommand"]["createHitObject"]["hitObject"], keyof HitObject>]: never; };
            } & { [K_17 in Exclude<keyof I["clientCommand"]["createHitObject"], "hitObject">]: never; };
            $case: "createHitObject";
        } & { [K_18 in Exclude<keyof I["clientCommand"], "createHitObject" | "$case">]: never; }) | ({
            updateHitObject?: {
                hitObject?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                };
            };
        } & {
            $case: "updateHitObject";
        } & {
            updateHitObject?: {
                hitObject?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                };
            } & {
                hitObject?: {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    });
                } & {
                    id?: number;
                    selectedBy?: number | undefined;
                    startTime?: number;
                    position?: {
                        x?: number;
                        y?: number;
                    } & {
                        x?: number;
                        y?: number;
                    } & { [K_19 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"]["position"], keyof IVec2>]: never; };
                    newCombo?: boolean;
                    kind?: ({
                        circle?: {};
                    } & {
                        $case: "circle";
                    } & {
                        circle?: {} & {} & { [K_20 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"]["kind"]["circle"], never>]: never; };
                        $case: "circle";
                    } & { [K_21 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"]["kind"], "circle" | "$case">]: never; }) | ({
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        };
                    } & {
                        $case: "slider";
                    } & {
                        slider?: {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[];
                            repeats?: number;
                        } & {
                            expectedDistance?: number;
                            controlPoints?: {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[] & ({
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            } & {
                                position?: {
                                    x?: number;
                                    y?: number;
                                } & {
                                    x?: number;
                                    y?: number;
                                } & { [K_22 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                                kind?: ControlPointKind;
                            } & { [K_23 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_24 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"]["kind"]["slider"]["controlPoints"], keyof {
                                position?: {
                                    x?: number;
                                    y?: number;
                                };
                                kind?: ControlPointKind;
                            }[]>]: never; };
                            repeats?: number;
                        } & { [K_25 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"]["kind"]["slider"], keyof Slider>]: never; };
                        $case: "slider";
                    } & { [K_26 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"]["kind"], "slider" | "$case">]: never; }) | ({
                        spinner?: {};
                    } & {
                        $case: "spinner";
                    } & {
                        spinner?: {} & {} & { [K_27 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"]["kind"]["spinner"], never>]: never; };
                        $case: "spinner";
                    } & { [K_28 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"]["kind"], "spinner" | "$case">]: never; });
                } & { [K_29 in Exclude<keyof I["clientCommand"]["updateHitObject"]["hitObject"], keyof HitObject>]: never; };
            } & { [K_30 in Exclude<keyof I["clientCommand"]["updateHitObject"], "hitObject">]: never; };
            $case: "updateHitObject";
        } & { [K_31 in Exclude<keyof I["clientCommand"], "updateHitObject" | "$case">]: never; }) | ({
            deleteHitObject?: {
                ids?: number[];
            };
        } & {
            $case: "deleteHitObject";
        } & {
            deleteHitObject?: {
                ids?: number[];
            } & {
                ids?: number[] & number[] & { [K_32 in Exclude<keyof I["clientCommand"]["deleteHitObject"]["ids"], keyof number[]>]: never; };
            } & { [K_33 in Exclude<keyof I["clientCommand"]["deleteHitObject"], "ids">]: never; };
            $case: "deleteHitObject";
        } & { [K_34 in Exclude<keyof I["clientCommand"], "deleteHitObject" | "$case">]: never; }) | ({
            createTimingPoint?: {
                timingPoint?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                };
            };
        } & {
            $case: "createTimingPoint";
        } & {
            createTimingPoint?: {
                timingPoint?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                };
            } & {
                timingPoint?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                } & {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    } & {
                        bpm?: number;
                        signature?: number;
                    } & { [K_35 in Exclude<keyof I["clientCommand"]["createTimingPoint"]["timingPoint"]["timing"], keyof TimingInformation>]: never; };
                    sv?: number | undefined;
                    volume?: number | undefined;
                } & { [K_36 in Exclude<keyof I["clientCommand"]["createTimingPoint"]["timingPoint"], keyof TimingPoint>]: never; };
            } & { [K_37 in Exclude<keyof I["clientCommand"]["createTimingPoint"], "timingPoint">]: never; };
            $case: "createTimingPoint";
        } & { [K_38 in Exclude<keyof I["clientCommand"], "createTimingPoint" | "$case">]: never; }) | ({
            updateTimingPoint?: {
                timingPoint?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                };
            };
        } & {
            $case: "updateTimingPoint";
        } & {
            updateTimingPoint?: {
                timingPoint?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                };
            } & {
                timingPoint?: {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    };
                    sv?: number | undefined;
                    volume?: number | undefined;
                } & {
                    id?: number;
                    offset?: number;
                    timing?: {
                        bpm?: number;
                        signature?: number;
                    } & {
                        bpm?: number;
                        signature?: number;
                    } & { [K_39 in Exclude<keyof I["clientCommand"]["updateTimingPoint"]["timingPoint"]["timing"], keyof TimingInformation>]: never; };
                    sv?: number | undefined;
                    volume?: number | undefined;
                } & { [K_40 in Exclude<keyof I["clientCommand"]["updateTimingPoint"]["timingPoint"], keyof TimingPoint>]: never; };
            } & { [K_41 in Exclude<keyof I["clientCommand"]["updateTimingPoint"], "timingPoint">]: never; };
            $case: "updateTimingPoint";
        } & { [K_42 in Exclude<keyof I["clientCommand"], "updateTimingPoint" | "$case">]: never; }) | ({
            deleteTimingPoint?: {
                ids?: number[];
            };
        } & {
            $case: "deleteTimingPoint";
        } & {
            deleteTimingPoint?: {
                ids?: number[];
            } & {
                ids?: number[] & number[] & { [K_43 in Exclude<keyof I["clientCommand"]["deleteTimingPoint"]["ids"], keyof number[]>]: never; };
            } & { [K_44 in Exclude<keyof I["clientCommand"]["deleteTimingPoint"], "ids">]: never; };
            $case: "deleteTimingPoint";
        } & { [K_45 in Exclude<keyof I["clientCommand"], "deleteTimingPoint" | "$case">]: never; }) | ({
            setHitObjectOverrides?: {
                id?: number;
                overrides?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    time?: number | undefined;
                    selectedBy?: number | undefined;
                    newCombo?: boolean | undefined;
                    controlPoints?: {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                    };
                    expectedDistance?: number | undefined;
                    repeatCount?: number | undefined;
                };
            };
        } & {
            $case: "setHitObjectOverrides";
        } & {
            setHitObjectOverrides?: {
                id?: number;
                overrides?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    time?: number | undefined;
                    selectedBy?: number | undefined;
                    newCombo?: boolean | undefined;
                    controlPoints?: {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                    };
                    expectedDistance?: number | undefined;
                    repeatCount?: number | undefined;
                };
            } & {
                id?: number;
                overrides?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    time?: number | undefined;
                    selectedBy?: number | undefined;
                    newCombo?: boolean | undefined;
                    controlPoints?: {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                    };
                    expectedDistance?: number | undefined;
                    repeatCount?: number | undefined;
                } & {
                    position?: {
                        x?: number;
                        y?: number;
                    } & {
                        x?: number;
                        y?: number;
                    } & { [K_46 in Exclude<keyof I["clientCommand"]["setHitObjectOverrides"]["overrides"]["position"], keyof IVec2>]: never; };
                    time?: number | undefined;
                    selectedBy?: number | undefined;
                    newCombo?: boolean | undefined;
                    controlPoints?: {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                    } & {
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[] & ({
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        } & {
                            position?: {
                                x?: number;
                                y?: number;
                            } & {
                                x?: number;
                                y?: number;
                            } & { [K_47 in Exclude<keyof I["clientCommand"]["setHitObjectOverrides"]["overrides"]["controlPoints"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                            kind?: ControlPointKind;
                        } & { [K_48 in Exclude<keyof I["clientCommand"]["setHitObjectOverrides"]["overrides"]["controlPoints"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_49 in Exclude<keyof I["clientCommand"]["setHitObjectOverrides"]["overrides"]["controlPoints"]["controlPoints"], keyof {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[]>]: never; };
                    } & { [K_50 in Exclude<keyof I["clientCommand"]["setHitObjectOverrides"]["overrides"]["controlPoints"], "controlPoints">]: never; };
                    expectedDistance?: number | undefined;
                    repeatCount?: number | undefined;
                } & { [K_51 in Exclude<keyof I["clientCommand"]["setHitObjectOverrides"]["overrides"], keyof HitObjectOverrides>]: never; };
            } & { [K_52 in Exclude<keyof I["clientCommand"]["setHitObjectOverrides"], keyof HitObjectOverrideCommand>]: never; };
            $case: "setHitObjectOverrides";
        } & { [K_53 in Exclude<keyof I["clientCommand"], "setHitObjectOverrides" | "$case">]: never; });
    } & { [K_54 in Exclude<keyof I, keyof ClientToServerMessage>]: never; }>(object: I): ClientToServerMessage;
};
export declare const ServerTick: {
    encode(message: ServerTick, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ServerTick;
    fromJSON(object: any): ServerTick;
    toJSON(message: ServerTick): unknown;
    fromPartial<I extends {
        userTicks?: {
            id?: number;
            cursorPos?: {
                x?: number;
                y?: number;
            };
            currentTime?: number;
        }[];
    } & {
        userTicks?: {
            id?: number;
            cursorPos?: {
                x?: number;
                y?: number;
            };
            currentTime?: number;
        }[] & ({
            id?: number;
            cursorPos?: {
                x?: number;
                y?: number;
            };
            currentTime?: number;
        } & {
            id?: number;
            cursorPos?: {
                x?: number;
                y?: number;
            } & {
                x?: number;
                y?: number;
            } & { [K in Exclude<keyof I["userTicks"][number]["cursorPos"], keyof Vec2>]: never; };
            currentTime?: number;
        } & { [K_1 in Exclude<keyof I["userTicks"][number], keyof UserTick>]: never; })[] & { [K_2 in Exclude<keyof I["userTicks"], keyof {
            id?: number;
            cursorPos?: {
                x?: number;
                y?: number;
            };
            currentTime?: number;
        }[]>]: never; };
    } & { [K_3 in Exclude<keyof I, "userTicks">]: never; }>(object: I): ServerTick;
};
export declare const UserTick: {
    encode(message: UserTick, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UserTick;
    fromJSON(object: any): UserTick;
    toJSON(message: UserTick): unknown;
    fromPartial<I extends {
        id?: number;
        cursorPos?: {
            x?: number;
            y?: number;
        };
        currentTime?: number;
    } & {
        id?: number;
        cursorPos?: {
            x?: number;
            y?: number;
        } & {
            x?: number;
            y?: number;
        } & { [K in Exclude<keyof I["cursorPos"], keyof Vec2>]: never; };
        currentTime?: number;
    } & { [K_1 in Exclude<keyof I, keyof UserTick>]: never; }>(object: I): UserTick;
};
export declare const UserInfo: {
    encode(message: UserInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UserInfo;
    fromJSON(object: any): UserInfo;
    toJSON(message: UserInfo): unknown;
    fromPartial<I extends {
        id?: number;
        displayName?: string;
    } & {
        id?: number;
        displayName?: string;
    } & { [K in Exclude<keyof I, keyof UserInfo>]: never; }>(object: I): UserInfo;
};
export declare const UserList: {
    encode(message: UserList, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UserList;
    fromJSON(object: any): UserList;
    toJSON(message: UserList): unknown;
    fromPartial<I extends {
        users?: {
            id?: number;
            displayName?: string;
        }[];
    } & {
        users?: {
            id?: number;
            displayName?: string;
        }[] & ({
            id?: number;
            displayName?: string;
        } & {
            id?: number;
            displayName?: string;
        } & { [K in Exclude<keyof I["users"][number], keyof UserInfo>]: never; })[] & { [K_1 in Exclude<keyof I["users"], keyof {
            id?: number;
            displayName?: string;
        }[]>]: never; };
    } & { [K_2 in Exclude<keyof I, "users">]: never; }>(object: I): UserList;
};
export declare const CreateHitObject: {
    encode(message: CreateHitObject, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CreateHitObject;
    fromJSON(object: any): CreateHitObject;
    toJSON(message: CreateHitObject): unknown;
    fromPartial<I extends {
        hitObject?: {
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            });
        };
    } & {
        hitObject?: {
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            });
        } & {
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            } & {
                x?: number;
                y?: number;
            } & { [K in Exclude<keyof I["hitObject"]["position"], keyof IVec2>]: never; };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            } & {
                circle?: {} & {} & { [K_1 in Exclude<keyof I["hitObject"]["kind"]["circle"], never>]: never; };
                $case: "circle";
            } & { [K_2 in Exclude<keyof I["hitObject"]["kind"], "circle" | "$case">]: never; }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            } & {
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                } & {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[] & ({
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    } & {
                        position?: {
                            x?: number;
                            y?: number;
                        } & {
                            x?: number;
                            y?: number;
                        } & { [K_3 in Exclude<keyof I["hitObject"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                        kind?: ControlPointKind;
                    } & { [K_4 in Exclude<keyof I["hitObject"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_5 in Exclude<keyof I["hitObject"]["kind"]["slider"]["controlPoints"], keyof {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[]>]: never; };
                    repeats?: number;
                } & { [K_6 in Exclude<keyof I["hitObject"]["kind"]["slider"], keyof Slider>]: never; };
                $case: "slider";
            } & { [K_7 in Exclude<keyof I["hitObject"]["kind"], "slider" | "$case">]: never; }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            } & {
                spinner?: {} & {} & { [K_8 in Exclude<keyof I["hitObject"]["kind"]["spinner"], never>]: never; };
                $case: "spinner";
            } & { [K_9 in Exclude<keyof I["hitObject"]["kind"], "spinner" | "$case">]: never; });
        } & { [K_10 in Exclude<keyof I["hitObject"], keyof HitObject>]: never; };
    } & { [K_11 in Exclude<keyof I, "hitObject">]: never; }>(object: I): CreateHitObject;
};
export declare const UpdateHitObject: {
    encode(message: UpdateHitObject, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UpdateHitObject;
    fromJSON(object: any): UpdateHitObject;
    toJSON(message: UpdateHitObject): unknown;
    fromPartial<I extends {
        hitObject?: {
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            });
        };
    } & {
        hitObject?: {
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            });
        } & {
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            } & {
                x?: number;
                y?: number;
            } & { [K in Exclude<keyof I["hitObject"]["position"], keyof IVec2>]: never; };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            } & {
                circle?: {} & {} & { [K_1 in Exclude<keyof I["hitObject"]["kind"]["circle"], never>]: never; };
                $case: "circle";
            } & { [K_2 in Exclude<keyof I["hitObject"]["kind"], "circle" | "$case">]: never; }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            } & {
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                } & {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[] & ({
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    } & {
                        position?: {
                            x?: number;
                            y?: number;
                        } & {
                            x?: number;
                            y?: number;
                        } & { [K_3 in Exclude<keyof I["hitObject"]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                        kind?: ControlPointKind;
                    } & { [K_4 in Exclude<keyof I["hitObject"]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_5 in Exclude<keyof I["hitObject"]["kind"]["slider"]["controlPoints"], keyof {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[]>]: never; };
                    repeats?: number;
                } & { [K_6 in Exclude<keyof I["hitObject"]["kind"]["slider"], keyof Slider>]: never; };
                $case: "slider";
            } & { [K_7 in Exclude<keyof I["hitObject"]["kind"], "slider" | "$case">]: never; }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            } & {
                spinner?: {} & {} & { [K_8 in Exclude<keyof I["hitObject"]["kind"]["spinner"], never>]: never; };
                $case: "spinner";
            } & { [K_9 in Exclude<keyof I["hitObject"]["kind"], "spinner" | "$case">]: never; });
        } & { [K_10 in Exclude<keyof I["hitObject"], keyof HitObject>]: never; };
    } & { [K_11 in Exclude<keyof I, "hitObject">]: never; }>(object: I): UpdateHitObject;
};
export declare const DeleteHitObject: {
    encode(message: DeleteHitObject, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeleteHitObject;
    fromJSON(object: any): DeleteHitObject;
    toJSON(message: DeleteHitObject): unknown;
    fromPartial<I extends {
        ids?: number[];
    } & {
        ids?: number[] & number[] & { [K in Exclude<keyof I["ids"], keyof number[]>]: never; };
    } & { [K_1 in Exclude<keyof I, "ids">]: never; }>(object: I): DeleteHitObject;
};
export declare const HitObjectSelected: {
    encode(message: HitObjectSelected, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HitObjectSelected;
    fromJSON(object: any): HitObjectSelected;
    toJSON(message: HitObjectSelected): unknown;
    fromPartial<I extends {
        ids?: number[];
        selectedBy?: number | undefined;
    } & {
        ids?: number[] & number[] & { [K in Exclude<keyof I["ids"], keyof number[]>]: never; };
        selectedBy?: number | undefined;
    } & { [K_1 in Exclude<keyof I, keyof HitObjectSelected>]: never; }>(object: I): HitObjectSelected;
};
export declare const SelectHitObject: {
    encode(message: SelectHitObject, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SelectHitObject;
    fromJSON(object: any): SelectHitObject;
    toJSON(message: SelectHitObject): unknown;
    fromPartial<I extends {
        ids?: number[];
        selected?: boolean;
        unique?: boolean;
    } & {
        ids?: number[] & number[] & { [K in Exclude<keyof I["ids"], keyof number[]>]: never; };
        selected?: boolean;
        unique?: boolean;
    } & { [K_1 in Exclude<keyof I, keyof SelectHitObject>]: never; }>(object: I): SelectHitObject;
};
export declare const EditorState: {
    encode(message: EditorState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): EditorState;
    fromJSON(object: any): EditorState;
    toJSON(message: EditorState): unknown;
    fromPartial<I extends {
        beatmap?: {
            difficulty?: {
                hpDrainRate?: number;
                circleSize?: number;
                overallDifficulty?: number;
                approachRate?: number;
                sliderMultiplier?: number;
                sliderTickRate?: number;
            };
            hitObjects?: {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            }[];
            timingPoints?: {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            }[];
        };
    } & {
        beatmap?: {
            difficulty?: {
                hpDrainRate?: number;
                circleSize?: number;
                overallDifficulty?: number;
                approachRate?: number;
                sliderMultiplier?: number;
                sliderTickRate?: number;
            };
            hitObjects?: {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            }[];
            timingPoints?: {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            }[];
        } & {
            difficulty?: {
                hpDrainRate?: number;
                circleSize?: number;
                overallDifficulty?: number;
                approachRate?: number;
                sliderMultiplier?: number;
                sliderTickRate?: number;
            } & {
                hpDrainRate?: number;
                circleSize?: number;
                overallDifficulty?: number;
                approachRate?: number;
                sliderMultiplier?: number;
                sliderTickRate?: number;
            } & { [K in Exclude<keyof I["beatmap"]["difficulty"], keyof Difficulty>]: never; };
            hitObjects?: {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            }[] & ({
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            } & {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                } & {
                    x?: number;
                    y?: number;
                } & { [K_1 in Exclude<keyof I["beatmap"]["hitObjects"][number]["position"], keyof IVec2>]: never; };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                } & {
                    circle?: {} & {} & { [K_2 in Exclude<keyof I["beatmap"]["hitObjects"][number]["kind"]["circle"], never>]: never; };
                    $case: "circle";
                } & { [K_3 in Exclude<keyof I["beatmap"]["hitObjects"][number]["kind"], "circle" | "$case">]: never; }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                } & {
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    } & {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[] & ({
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        } & {
                            position?: {
                                x?: number;
                                y?: number;
                            } & {
                                x?: number;
                                y?: number;
                            } & { [K_4 in Exclude<keyof I["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                            kind?: ControlPointKind;
                        } & { [K_5 in Exclude<keyof I["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_6 in Exclude<keyof I["beatmap"]["hitObjects"][number]["kind"]["slider"]["controlPoints"], keyof {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[]>]: never; };
                        repeats?: number;
                    } & { [K_7 in Exclude<keyof I["beatmap"]["hitObjects"][number]["kind"]["slider"], keyof Slider>]: never; };
                    $case: "slider";
                } & { [K_8 in Exclude<keyof I["beatmap"]["hitObjects"][number]["kind"], "slider" | "$case">]: never; }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                } & {
                    spinner?: {} & {} & { [K_9 in Exclude<keyof I["beatmap"]["hitObjects"][number]["kind"]["spinner"], never>]: never; };
                    $case: "spinner";
                } & { [K_10 in Exclude<keyof I["beatmap"]["hitObjects"][number]["kind"], "spinner" | "$case">]: never; });
            } & { [K_11 in Exclude<keyof I["beatmap"]["hitObjects"][number], keyof HitObject>]: never; })[] & { [K_12 in Exclude<keyof I["beatmap"]["hitObjects"], keyof {
                id?: number;
                selectedBy?: number | undefined;
                startTime?: number;
                position?: {
                    x?: number;
                    y?: number;
                };
                newCombo?: boolean;
                kind?: ({
                    circle?: {};
                } & {
                    $case: "circle";
                }) | ({
                    slider?: {
                        expectedDistance?: number;
                        controlPoints?: {
                            position?: {
                                x?: number;
                                y?: number;
                            };
                            kind?: ControlPointKind;
                        }[];
                        repeats?: number;
                    };
                } & {
                    $case: "slider";
                }) | ({
                    spinner?: {};
                } & {
                    $case: "spinner";
                });
            }[]>]: never; };
            timingPoints?: {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            }[] & ({
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            } & {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                } & {
                    bpm?: number;
                    signature?: number;
                } & { [K_13 in Exclude<keyof I["beatmap"]["timingPoints"][number]["timing"], keyof TimingInformation>]: never; };
                sv?: number | undefined;
                volume?: number | undefined;
            } & { [K_14 in Exclude<keyof I["beatmap"]["timingPoints"][number], keyof TimingPoint>]: never; })[] & { [K_15 in Exclude<keyof I["beatmap"]["timingPoints"], keyof {
                id?: number;
                offset?: number;
                timing?: {
                    bpm?: number;
                    signature?: number;
                };
                sv?: number | undefined;
                volume?: number | undefined;
            }[]>]: never; };
        } & { [K_16 in Exclude<keyof I["beatmap"], keyof Beatmap>]: never; };
    } & { [K_17 in Exclude<keyof I, "beatmap">]: never; }>(object: I): EditorState;
};
export declare const CreateTimingPoint: {
    encode(message: CreateTimingPoint, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CreateTimingPoint;
    fromJSON(object: any): CreateTimingPoint;
    toJSON(message: CreateTimingPoint): unknown;
    fromPartial<I extends {
        timingPoint?: {
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            };
            sv?: number | undefined;
            volume?: number | undefined;
        };
    } & {
        timingPoint?: {
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            };
            sv?: number | undefined;
            volume?: number | undefined;
        } & {
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            } & {
                bpm?: number;
                signature?: number;
            } & { [K in Exclude<keyof I["timingPoint"]["timing"], keyof TimingInformation>]: never; };
            sv?: number | undefined;
            volume?: number | undefined;
        } & { [K_1 in Exclude<keyof I["timingPoint"], keyof TimingPoint>]: never; };
    } & { [K_2 in Exclude<keyof I, "timingPoint">]: never; }>(object: I): CreateTimingPoint;
};
export declare const UpdateTimingPoint: {
    encode(message: UpdateTimingPoint, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): UpdateTimingPoint;
    fromJSON(object: any): UpdateTimingPoint;
    toJSON(message: UpdateTimingPoint): unknown;
    fromPartial<I extends {
        timingPoint?: {
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            };
            sv?: number | undefined;
            volume?: number | undefined;
        };
    } & {
        timingPoint?: {
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            };
            sv?: number | undefined;
            volume?: number | undefined;
        } & {
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            } & {
                bpm?: number;
                signature?: number;
            } & { [K in Exclude<keyof I["timingPoint"]["timing"], keyof TimingInformation>]: never; };
            sv?: number | undefined;
            volume?: number | undefined;
        } & { [K_1 in Exclude<keyof I["timingPoint"], keyof TimingPoint>]: never; };
    } & { [K_2 in Exclude<keyof I, "timingPoint">]: never; }>(object: I): UpdateTimingPoint;
};
export declare const DeleteTimingPoint: {
    encode(message: DeleteTimingPoint, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeleteTimingPoint;
    fromJSON(object: any): DeleteTimingPoint;
    toJSON(message: DeleteTimingPoint): unknown;
    fromPartial<I extends {
        ids?: number[];
    } & {
        ids?: number[] & number[] & { [K in Exclude<keyof I["ids"], keyof number[]>]: never; };
    } & { [K_1 in Exclude<keyof I, "ids">]: never; }>(object: I): DeleteTimingPoint;
};
export declare const HitObjectOverrideCommand: {
    encode(message: HitObjectOverrideCommand, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HitObjectOverrideCommand;
    fromJSON(object: any): HitObjectOverrideCommand;
    toJSON(message: HitObjectOverrideCommand): unknown;
    fromPartial<I extends {
        id?: number;
        overrides?: {
            position?: {
                x?: number;
                y?: number;
            };
            time?: number | undefined;
            selectedBy?: number | undefined;
            newCombo?: boolean | undefined;
            controlPoints?: {
                controlPoints?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                }[];
            };
            expectedDistance?: number | undefined;
            repeatCount?: number | undefined;
        };
    } & {
        id?: number;
        overrides?: {
            position?: {
                x?: number;
                y?: number;
            };
            time?: number | undefined;
            selectedBy?: number | undefined;
            newCombo?: boolean | undefined;
            controlPoints?: {
                controlPoints?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                }[];
            };
            expectedDistance?: number | undefined;
            repeatCount?: number | undefined;
        } & {
            position?: {
                x?: number;
                y?: number;
            } & {
                x?: number;
                y?: number;
            } & { [K in Exclude<keyof I["overrides"]["position"], keyof IVec2>]: never; };
            time?: number | undefined;
            selectedBy?: number | undefined;
            newCombo?: boolean | undefined;
            controlPoints?: {
                controlPoints?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                }[];
            } & {
                controlPoints?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                }[] & ({
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                } & {
                    position?: {
                        x?: number;
                        y?: number;
                    } & {
                        x?: number;
                        y?: number;
                    } & { [K_1 in Exclude<keyof I["overrides"]["controlPoints"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                    kind?: ControlPointKind;
                } & { [K_2 in Exclude<keyof I["overrides"]["controlPoints"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_3 in Exclude<keyof I["overrides"]["controlPoints"]["controlPoints"], keyof {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                }[]>]: never; };
            } & { [K_4 in Exclude<keyof I["overrides"]["controlPoints"], "controlPoints">]: never; };
            expectedDistance?: number | undefined;
            repeatCount?: number | undefined;
        } & { [K_5 in Exclude<keyof I["overrides"], keyof HitObjectOverrides>]: never; };
    } & { [K_6 in Exclude<keyof I, keyof HitObjectOverrideCommand>]: never; }>(object: I): HitObjectOverrideCommand;
};
export declare const HitObjectOverrides: {
    encode(message: HitObjectOverrides, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HitObjectOverrides;
    fromJSON(object: any): HitObjectOverrides;
    toJSON(message: HitObjectOverrides): unknown;
    fromPartial<I extends {
        position?: {
            x?: number;
            y?: number;
        };
        time?: number | undefined;
        selectedBy?: number | undefined;
        newCombo?: boolean | undefined;
        controlPoints?: {
            controlPoints?: {
                position?: {
                    x?: number;
                    y?: number;
                };
                kind?: ControlPointKind;
            }[];
        };
        expectedDistance?: number | undefined;
        repeatCount?: number | undefined;
    } & {
        position?: {
            x?: number;
            y?: number;
        } & {
            x?: number;
            y?: number;
        } & { [K in Exclude<keyof I["position"], keyof IVec2>]: never; };
        time?: number | undefined;
        selectedBy?: number | undefined;
        newCombo?: boolean | undefined;
        controlPoints?: {
            controlPoints?: {
                position?: {
                    x?: number;
                    y?: number;
                };
                kind?: ControlPointKind;
            }[];
        } & {
            controlPoints?: {
                position?: {
                    x?: number;
                    y?: number;
                };
                kind?: ControlPointKind;
            }[] & ({
                position?: {
                    x?: number;
                    y?: number;
                };
                kind?: ControlPointKind;
            } & {
                position?: {
                    x?: number;
                    y?: number;
                } & {
                    x?: number;
                    y?: number;
                } & { [K_1 in Exclude<keyof I["controlPoints"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                kind?: ControlPointKind;
            } & { [K_2 in Exclude<keyof I["controlPoints"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_3 in Exclude<keyof I["controlPoints"]["controlPoints"], keyof {
                position?: {
                    x?: number;
                    y?: number;
                };
                kind?: ControlPointKind;
            }[]>]: never; };
        } & { [K_4 in Exclude<keyof I["controlPoints"], "controlPoints">]: never; };
        expectedDistance?: number | undefined;
        repeatCount?: number | undefined;
    } & { [K_5 in Exclude<keyof I, keyof HitObjectOverrides>]: never; }>(object: I): HitObjectOverrides;
};
export declare const SliderControlPoints: {
    encode(message: SliderControlPoints, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SliderControlPoints;
    fromJSON(object: any): SliderControlPoints;
    toJSON(message: SliderControlPoints): unknown;
    fromPartial<I extends {
        controlPoints?: {
            position?: {
                x?: number;
                y?: number;
            };
            kind?: ControlPointKind;
        }[];
    } & {
        controlPoints?: {
            position?: {
                x?: number;
                y?: number;
            };
            kind?: ControlPointKind;
        }[] & ({
            position?: {
                x?: number;
                y?: number;
            };
            kind?: ControlPointKind;
        } & {
            position?: {
                x?: number;
                y?: number;
            } & {
                x?: number;
                y?: number;
            } & { [K in Exclude<keyof I["controlPoints"][number]["position"], keyof IVec2>]: never; };
            kind?: ControlPointKind;
        } & { [K_1 in Exclude<keyof I["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_2 in Exclude<keyof I["controlPoints"], keyof {
            position?: {
                x?: number;
                y?: number;
            };
            kind?: ControlPointKind;
        }[]>]: never; };
    } & { [K_3 in Exclude<keyof I, "controlPoints">]: never; }>(object: I): SliderControlPoints;
};
export declare const HitObject: {
    encode(message: HitObject, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HitObject;
    fromJSON(object: any): HitObject;
    toJSON(message: HitObject): unknown;
    fromPartial<I extends {
        id?: number;
        selectedBy?: number | undefined;
        startTime?: number;
        position?: {
            x?: number;
            y?: number;
        };
        newCombo?: boolean;
        kind?: ({
            circle?: {};
        } & {
            $case: "circle";
        }) | ({
            slider?: {
                expectedDistance?: number;
                controlPoints?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                }[];
                repeats?: number;
            };
        } & {
            $case: "slider";
        }) | ({
            spinner?: {};
        } & {
            $case: "spinner";
        });
    } & {
        id?: number;
        selectedBy?: number | undefined;
        startTime?: number;
        position?: {
            x?: number;
            y?: number;
        } & {
            x?: number;
            y?: number;
        } & { [K in Exclude<keyof I["position"], keyof IVec2>]: never; };
        newCombo?: boolean;
        kind?: ({
            circle?: {};
        } & {
            $case: "circle";
        } & {
            circle?: {} & {} & { [K_1 in Exclude<keyof I["kind"]["circle"], never>]: never; };
            $case: "circle";
        } & { [K_2 in Exclude<keyof I["kind"], "circle" | "$case">]: never; }) | ({
            slider?: {
                expectedDistance?: number;
                controlPoints?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                }[];
                repeats?: number;
            };
        } & {
            $case: "slider";
        } & {
            slider?: {
                expectedDistance?: number;
                controlPoints?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                }[];
                repeats?: number;
            } & {
                expectedDistance?: number;
                controlPoints?: {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                }[] & ({
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                } & {
                    position?: {
                        x?: number;
                        y?: number;
                    } & {
                        x?: number;
                        y?: number;
                    } & { [K_3 in Exclude<keyof I["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                    kind?: ControlPointKind;
                } & { [K_4 in Exclude<keyof I["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_5 in Exclude<keyof I["kind"]["slider"]["controlPoints"], keyof {
                    position?: {
                        x?: number;
                        y?: number;
                    };
                    kind?: ControlPointKind;
                }[]>]: never; };
                repeats?: number;
            } & { [K_6 in Exclude<keyof I["kind"]["slider"], keyof Slider>]: never; };
            $case: "slider";
        } & { [K_7 in Exclude<keyof I["kind"], "slider" | "$case">]: never; }) | ({
            spinner?: {};
        } & {
            $case: "spinner";
        } & {
            spinner?: {} & {} & { [K_8 in Exclude<keyof I["kind"]["spinner"], never>]: never; };
            $case: "spinner";
        } & { [K_9 in Exclude<keyof I["kind"], "spinner" | "$case">]: never; });
    } & { [K_10 in Exclude<keyof I, keyof HitObject>]: never; }>(object: I): HitObject;
};
export declare const HitCircle: {
    encode(_: HitCircle, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HitCircle;
    fromJSON(_: any): HitCircle;
    toJSON(_: HitCircle): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): HitCircle;
};
export declare const Spinner: {
    encode(_: Spinner, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Spinner;
    fromJSON(_: any): Spinner;
    toJSON(_: Spinner): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): Spinner;
};
export declare const Beatmap: {
    encode(message: Beatmap, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Beatmap;
    fromJSON(object: any): Beatmap;
    toJSON(message: Beatmap): unknown;
    fromPartial<I extends {
        difficulty?: {
            hpDrainRate?: number;
            circleSize?: number;
            overallDifficulty?: number;
            approachRate?: number;
            sliderMultiplier?: number;
            sliderTickRate?: number;
        };
        hitObjects?: {
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            });
        }[];
        timingPoints?: {
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            };
            sv?: number | undefined;
            volume?: number | undefined;
        }[];
    } & {
        difficulty?: {
            hpDrainRate?: number;
            circleSize?: number;
            overallDifficulty?: number;
            approachRate?: number;
            sliderMultiplier?: number;
            sliderTickRate?: number;
        } & {
            hpDrainRate?: number;
            circleSize?: number;
            overallDifficulty?: number;
            approachRate?: number;
            sliderMultiplier?: number;
            sliderTickRate?: number;
        } & { [K in Exclude<keyof I["difficulty"], keyof Difficulty>]: never; };
        hitObjects?: {
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            });
        }[] & ({
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            });
        } & {
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            } & {
                x?: number;
                y?: number;
            } & { [K_1 in Exclude<keyof I["hitObjects"][number]["position"], keyof IVec2>]: never; };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            } & {
                circle?: {} & {} & { [K_2 in Exclude<keyof I["hitObjects"][number]["kind"]["circle"], never>]: never; };
                $case: "circle";
            } & { [K_3 in Exclude<keyof I["hitObjects"][number]["kind"], "circle" | "$case">]: never; }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            } & {
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                } & {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[] & ({
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    } & {
                        position?: {
                            x?: number;
                            y?: number;
                        } & {
                            x?: number;
                            y?: number;
                        } & { [K_4 in Exclude<keyof I["hitObjects"][number]["kind"]["slider"]["controlPoints"][number]["position"], keyof IVec2>]: never; };
                        kind?: ControlPointKind;
                    } & { [K_5 in Exclude<keyof I["hitObjects"][number]["kind"]["slider"]["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_6 in Exclude<keyof I["hitObjects"][number]["kind"]["slider"]["controlPoints"], keyof {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[]>]: never; };
                    repeats?: number;
                } & { [K_7 in Exclude<keyof I["hitObjects"][number]["kind"]["slider"], keyof Slider>]: never; };
                $case: "slider";
            } & { [K_8 in Exclude<keyof I["hitObjects"][number]["kind"], "slider" | "$case">]: never; }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            } & {
                spinner?: {} & {} & { [K_9 in Exclude<keyof I["hitObjects"][number]["kind"]["spinner"], never>]: never; };
                $case: "spinner";
            } & { [K_10 in Exclude<keyof I["hitObjects"][number]["kind"], "spinner" | "$case">]: never; });
        } & { [K_11 in Exclude<keyof I["hitObjects"][number], keyof HitObject>]: never; })[] & { [K_12 in Exclude<keyof I["hitObjects"], keyof {
            id?: number;
            selectedBy?: number | undefined;
            startTime?: number;
            position?: {
                x?: number;
                y?: number;
            };
            newCombo?: boolean;
            kind?: ({
                circle?: {};
            } & {
                $case: "circle";
            }) | ({
                slider?: {
                    expectedDistance?: number;
                    controlPoints?: {
                        position?: {
                            x?: number;
                            y?: number;
                        };
                        kind?: ControlPointKind;
                    }[];
                    repeats?: number;
                };
            } & {
                $case: "slider";
            }) | ({
                spinner?: {};
            } & {
                $case: "spinner";
            });
        }[]>]: never; };
        timingPoints?: {
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            };
            sv?: number | undefined;
            volume?: number | undefined;
        }[] & ({
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            };
            sv?: number | undefined;
            volume?: number | undefined;
        } & {
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            } & {
                bpm?: number;
                signature?: number;
            } & { [K_13 in Exclude<keyof I["timingPoints"][number]["timing"], keyof TimingInformation>]: never; };
            sv?: number | undefined;
            volume?: number | undefined;
        } & { [K_14 in Exclude<keyof I["timingPoints"][number], keyof TimingPoint>]: never; })[] & { [K_15 in Exclude<keyof I["timingPoints"], keyof {
            id?: number;
            offset?: number;
            timing?: {
                bpm?: number;
                signature?: number;
            };
            sv?: number | undefined;
            volume?: number | undefined;
        }[]>]: never; };
    } & { [K_16 in Exclude<keyof I, keyof Beatmap>]: never; }>(object: I): Beatmap;
};
export declare const Difficulty: {
    encode(message: Difficulty, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Difficulty;
    fromJSON(object: any): Difficulty;
    toJSON(message: Difficulty): unknown;
    fromPartial<I extends {
        hpDrainRate?: number;
        circleSize?: number;
        overallDifficulty?: number;
        approachRate?: number;
        sliderMultiplier?: number;
        sliderTickRate?: number;
    } & {
        hpDrainRate?: number;
        circleSize?: number;
        overallDifficulty?: number;
        approachRate?: number;
        sliderMultiplier?: number;
        sliderTickRate?: number;
    } & { [K in Exclude<keyof I, keyof Difficulty>]: never; }>(object: I): Difficulty;
};
export declare const Slider: {
    encode(message: Slider, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Slider;
    fromJSON(object: any): Slider;
    toJSON(message: Slider): unknown;
    fromPartial<I extends {
        expectedDistance?: number;
        controlPoints?: {
            position?: {
                x?: number;
                y?: number;
            };
            kind?: ControlPointKind;
        }[];
        repeats?: number;
    } & {
        expectedDistance?: number;
        controlPoints?: {
            position?: {
                x?: number;
                y?: number;
            };
            kind?: ControlPointKind;
        }[] & ({
            position?: {
                x?: number;
                y?: number;
            };
            kind?: ControlPointKind;
        } & {
            position?: {
                x?: number;
                y?: number;
            } & {
                x?: number;
                y?: number;
            } & { [K in Exclude<keyof I["controlPoints"][number]["position"], keyof IVec2>]: never; };
            kind?: ControlPointKind;
        } & { [K_1 in Exclude<keyof I["controlPoints"][number], keyof SliderControlPoint>]: never; })[] & { [K_2 in Exclude<keyof I["controlPoints"], keyof {
            position?: {
                x?: number;
                y?: number;
            };
            kind?: ControlPointKind;
        }[]>]: never; };
        repeats?: number;
    } & { [K_3 in Exclude<keyof I, keyof Slider>]: never; }>(object: I): Slider;
};
export declare const SliderControlPoint: {
    encode(message: SliderControlPoint, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SliderControlPoint;
    fromJSON(object: any): SliderControlPoint;
    toJSON(message: SliderControlPoint): unknown;
    fromPartial<I extends {
        position?: {
            x?: number;
            y?: number;
        };
        kind?: ControlPointKind;
    } & {
        position?: {
            x?: number;
            y?: number;
        } & {
            x?: number;
            y?: number;
        } & { [K in Exclude<keyof I["position"], keyof IVec2>]: never; };
        kind?: ControlPointKind;
    } & { [K_1 in Exclude<keyof I, keyof SliderControlPoint>]: never; }>(object: I): SliderControlPoint;
};
export declare const TimingPoint: {
    encode(message: TimingPoint, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TimingPoint;
    fromJSON(object: any): TimingPoint;
    toJSON(message: TimingPoint): unknown;
    fromPartial<I extends {
        id?: number;
        offset?: number;
        timing?: {
            bpm?: number;
            signature?: number;
        };
        sv?: number | undefined;
        volume?: number | undefined;
    } & {
        id?: number;
        offset?: number;
        timing?: {
            bpm?: number;
            signature?: number;
        } & {
            bpm?: number;
            signature?: number;
        } & { [K in Exclude<keyof I["timing"], keyof TimingInformation>]: never; };
        sv?: number | undefined;
        volume?: number | undefined;
    } & { [K_1 in Exclude<keyof I, keyof TimingPoint>]: never; }>(object: I): TimingPoint;
};
export declare const TimingInformation: {
    encode(message: TimingInformation, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TimingInformation;
    fromJSON(object: any): TimingInformation;
    toJSON(message: TimingInformation): unknown;
    fromPartial<I extends {
        bpm?: number;
        signature?: number;
    } & {
        bpm?: number;
        signature?: number;
    } & { [K in Exclude<keyof I, keyof TimingInformation>]: never; }>(object: I): TimingInformation;
};
export declare const Vec2: {
    encode(message: Vec2, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Vec2;
    fromJSON(object: any): Vec2;
    toJSON(message: Vec2): unknown;
    fromPartial<I extends {
        x?: number;
        y?: number;
    } & {
        x?: number;
        y?: number;
    } & { [K in Exclude<keyof I, keyof Vec2>]: never; }>(object: I): Vec2;
};
export declare const IVec2: {
    encode(message: IVec2, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): IVec2;
    fromJSON(object: any): IVec2;
    toJSON(message: IVec2): unknown;
    fromPartial<I extends {
        x?: number;
        y?: number;
    } & {
        x?: number;
        y?: number;
    } & { [K in Exclude<keyof I, keyof IVec2>]: never; }>(object: I): IVec2;
};
declare type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export declare type DeepPartial<T> = T extends Builtin ? T : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {
    $case: string;
} ? {
    [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]>;
} & {
    $case: T["$case"];
} : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
declare type KeysOfUnion<T> = T extends T ? keyof T : never;
export declare type Exact<P, I extends P> = P extends Builtin ? P : P & {
    [K in keyof P]: Exact<P[K], I[K]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
export {};
