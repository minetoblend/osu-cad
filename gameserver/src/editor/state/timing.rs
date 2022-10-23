use std::{sync::atomic::AtomicU32, time::Duration};

use serde::{Deserialize, Serialize};

use crate::proto;

#[derive(Default, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimingState {
    timing_points: Vec<TimingPoint>,
}

pub type TimingPointId = u32;

static NEXT_ID: AtomicU32 = AtomicU32::new(0);

fn next_id() -> TimingPointId {
    NEXT_ID.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TimingPoint {
    #[serde(default = "next_id", skip_deserializing, skip_serializing)]
    pub id: TimingPointId,
    #[serde(alias="time")]
    pub offset: i32,
    pub timing: Option<TimingInformation>,
    pub sv: Option<f32>,
    pub volume: Option<f32>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TimingInformation {
    pub bpm: f32,
    pub signature: u8,
}

impl TimingState {
    pub fn find_index(&self, time: i32) -> Result<usize, usize> {
        self.timing_points.binary_search_by_key(&time, |h| h.offset)
    }

    pub fn insert_timing_point(&mut self, timing_point: TimingPoint) {
        match self.find_index(timing_point.offset) {
            Ok(index) => self.timing_points.insert(index, timing_point),
            Err(index) => self.timing_points.insert(index, timing_point),
        }
    }

    pub fn update_timing_point(
        &mut self,
        id: TimingPointId,
        timing_point: TimingPoint,
    ) -> Result<(), ()> {
        if let Some(index) = self.timing_points.iter().position(|t| t.id == id) {
            self.timing_points[index] = timing_point;
            Ok(())
        } else {
            Err(())
        }
    }

    pub(crate) fn find_by_id(&self, id: u32) -> Option<&TimingPoint> {
        self.timing_points.iter().find(|t| t.id == id)
    }

    pub(crate) fn delete_timing_point(&mut self, id: TimingPointId) -> Option<TimingPoint> {
        if let Some(index) = self
            .timing_points
            .iter()
            .position(|timing_point| timing_point.id == id)
        {
            Some(self.timing_points.remove(index))
        } else {
            None
        }
    }

    pub fn all(&self) -> &Vec<TimingPoint> {
        &self.timing_points
    }
}

impl TimingPoint {
    pub fn time_per_beat(&self) -> Option<Duration> {
        self.timing.as_ref().map(|timing| Duration::from_secs_f32(60.0 / timing.bpm))
    }

    pub(crate) fn next_id() -> TimingPointId {
        next_id()
    }
}

impl From<TimingPoint> for proto::commands::TimingPoint {
    fn from(val: TimingPoint) -> Self {
        proto::commands::TimingPoint {
            id: val.id,
            offset: val.offset,
            sv: val.sv,
            volume: val.volume,
            timing: val
                .timing
                .map(|timing| proto::commands::TimingInformation {
                    bpm: timing.bpm,
                    signature: timing.signature as u32,
                }),
        }
    }
}

impl From<proto::commands::TimingPoint> for TimingPoint {
    fn from(t: proto::commands::TimingPoint) -> Self {
        Self {
            id: t.id,
            offset: t.offset,
            sv: t.sv,
            volume: t.volume,
            timing: t.timing.map(|timing| TimingInformation {
                bpm: timing.bpm,
                signature: timing.signature as u8,
            }),
        }
    }
}
