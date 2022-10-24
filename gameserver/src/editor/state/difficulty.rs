use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, Clone, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Difficulty {
    pub hp_drain_rate: f32,
    pub circle_size: f32,
    pub overall_difficulty: f32,
    pub approach_rate: f32,
    pub slider_multiplier: f32,
    pub slider_tick_rate: f32,
}

impl Default for Difficulty {
    fn default() -> Self {
        Self {
            hp_drain_rate: 5.0,
            circle_size: 4.0,
            overall_difficulty: 8.5,
            approach_rate: 8.5,
            slider_multiplier: 1.4,
            slider_tick_rate: 1.0,
        }
    }
}
