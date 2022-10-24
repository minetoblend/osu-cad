use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    editor::state::{
        difficulty::Difficulty,
        hitobject::{HitObject, HitObjectId, SliderControlPoint},
        timing::{TimingPoint, TimingPointId},
        user::UserInfo,
    },
    util::{IVec2, Vec2},
};

#[derive(Serialize, Clone, TS)]
#[ts(export, rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ServerToClientMessage {
    pub response_id: Option<String>,
    pub command: ServerCommand,
}

#[derive(Clone, Serialize, TS)]
#[serde(tag="type", content="payload", rename_all="camelCase")]
#[ts(export, rename_all = "camelCase")]
pub enum ServerCommand {
    Multiple(Vec<ServerToClientMessage>),
    OwnId(usize),
    UserJoined(SerializedUserInfo),
    UserLeft(SerializedUserInfo),
    Tick(ServerTick),
    UserList(Vec<SerializedUserInfo>),
    HitObjectCreated(HitObject),
    HitObjectUpdated(HitObject),
    HitObjectDeleted(HitObjectId),
    HitObjectSelected {
        ids: Vec<HitObjectId>,
        #[serde(rename = "selectedBy")]
        selected_by: Option<usize>,
    },
    State(ServerState),
    TimingPointCreated(TimingPoint),
    TimingPointUpdated(TimingPoint),
    TimingPointDeleted(TimingPointId),
    HitObjectOverridden {
        id: HitObjectId,
        overrides: HitObjectOverrides,
    },
}

#[derive(Deserialize, TS)]
#[ts(export, rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ClientToServerMessage {
    pub response_id: Option<String>,
    pub command: ClientCommand,
}

#[derive(Clone, Debug, Deserialize, TS)]
#[serde(tag="type", content="payload", rename_all="camelCase")]
#[ts(export, rename_all = "camelCase")]
pub enum ClientCommand {
    CursorPos(Vec2),
    CurrentTime(i32),
    SelectHitObject {
        ids: Vec<HitObjectId>,
        selected: bool,
        unique: bool,
    },
    CreateHitObject(HitObject),
    UpdateHitObject(HitObject),
    DeleteHitObject(Vec<HitObjectId>),
    CreateTimingPoint(TimingPoint),
    UpdateTimingPoint(TimingPoint),
    DeleteTimingPoint(Vec<TimingPointId>),
    SetHitObjectOverrides {
        id: HitObjectId,
        overrides: HitObjectOverrides,
    },
}

#[derive(Clone, Serialize, TS)]
#[ts(export, rename_all = "camelCase")]
#[serde(rename_all="camelCase")]
pub struct ServerTick {
    pub user_ticks: Vec<UserTick>,
}

#[derive(Serialize, Clone, TS)]
#[ts(export, rename_all = "camelCase")]
#[serde(rename_all="camelCase")]
pub struct UserTick {
    pub id: usize,
    pub cursor_pos: Option<Vec2>,
    pub current_time: i32,
}

impl From<&UserInfo> for UserTick {
    fn from(user: &UserInfo) -> Self {
        Self {
            current_time: user.current_time,
            cursor_pos: user.cursor_pos.clone(),
            id: user.id()
        }
    }
}


#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, rename_all = "camelCase")]
pub struct HitObjectOverrides {
    #[serde(default)]
    pub time: Option<i32>,
    #[serde(default)]
    pub position: Option<IVec2>,
    #[serde(default)]
    pub new_combo: Option<bool>,
    #[serde(default)]
    pub control_points: Option<Vec<SliderControlPoint>>,
    #[serde(default)]
    pub expected_distance: Option<f32>,
    #[serde(default)]
    pub repeat_count: Option<u32>,
}

#[derive(Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase", rename="UserInfo")]
#[ts(export, rename_all = "camelCase")]
pub struct SerializedUserInfo {
    id: usize,
    display_name: String,
    cursor_pos: Option<Vec2>,
    current_time: i32    
}

impl From<&UserInfo> for SerializedUserInfo {
    fn from(user: &UserInfo) -> Self {
        Self {
            id: user.id(),
            display_name: user.display_name().to_string(),
            cursor_pos: user.cursor_pos.clone(),
            current_time: user.current_time
        }
    }
}

#[derive(Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, rename_all = "camelCase")]
pub struct ServerState {
    pub difficulty: Difficulty,
    pub hit_objects: Vec<HitObject>,
    pub timing_points: Vec<TimingPoint>,
}