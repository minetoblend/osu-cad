use serde::{Deserialize, Serialize};

use crate::proto::commands;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Difficulty {
    pub hp_drain_rate: f32,
    pub circle_size: f32,
    pub overall_difficulty: f32,
    pub approach_rate: f32,
    pub slider_multiplier: f32,
    pub slider_tick_rate: u32,
}

impl Default for Difficulty {
    fn default() -> Self {
        Self {
            hp_drain_rate: 5.0,
            circle_size: 4.0,
            overall_difficulty: 8.5,
            approach_rate: 8.5,
            slider_multiplier: 1.4,
            slider_tick_rate: 1,
        }
    }
}

impl From<Difficulty> for commands::Difficulty {
    fn from(val: Difficulty) -> Self {
        commands::Difficulty {
            hp_drain_rate: val.hp_drain_rate,
            circle_size: val.circle_size,
            overall_difficulty: val.overall_difficulty,
            approach_rate: val.approach_rate,
            slider_multiplier: val.slider_multiplier,
            slider_tick_rate: val.slider_tick_rate,
        }
    }
}
