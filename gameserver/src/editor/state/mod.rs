use serde::{Deserialize, Serialize};

use crate::proto::commands;

use self::{
    difficulty::Difficulty, hitobject::HitObjectState, timing::TimingState, user::UserState,
};

pub mod difficulty;
pub mod hitobject;
pub mod math;
pub mod timing;
pub mod user;

#[derive(Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EditorState {
    #[serde(skip_deserializing, skip_serializing)]
    pub empty_ticks: u32,
    #[serde(skip_deserializing, skip_serializing)]
    pub events: Vec<EditorEvent>,
    #[serde(skip_deserializing, skip_serializing)]
    pub users: UserState,

    #[serde(flatten)]
    pub hit_objects: HitObjectState,

    #[serde(flatten)]
    pub timing: TimingState,

    pub difficulty: Difficulty,
}
impl EditorState {}

pub enum EditorEvent {
    UserJoined { id: usize },
    UserLeft { id: usize },
}

impl From<&EditorState> for commands::Beatmap {
    fn from(val: &EditorState) -> Self {
        commands::Beatmap {
            hit_objects: val.hit_objects.all().iter().map(|h| h.into()).collect(),
            timing_points: val.timing.all().iter().map(|t| t.clone().into()).collect(),
            difficulty: Some(val.difficulty.clone().into()),
        }
    }
}
