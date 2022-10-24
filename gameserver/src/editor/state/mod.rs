use serde::{Deserialize, Serialize};

use self::{
    difficulty::Difficulty, hitobject::HitObjectState, timing::TimingState, user::UserState,
};

pub mod difficulty;
pub mod hitobject;
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