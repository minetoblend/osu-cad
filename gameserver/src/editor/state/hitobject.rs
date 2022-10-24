use std::sync::atomic::AtomicU32;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::util::IVec2;

#[derive(Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HitObjectState {
    hit_objects: Vec<HitObject>,
}

impl HitObjectState {
    pub fn find_index(&self, time: i32) -> Result<usize, usize> {
        self.hit_objects
            .binary_search_by_key(&time, |h| h.start_time)
    }

    pub fn insert_hitobject(&mut self, hit_object: HitObject) {
        match self.find_index(hit_object.start_time) {
            Ok(index) => self.hit_objects.insert(index, hit_object),
            Err(index) => self.hit_objects.insert(index, hit_object),
        }
    }

    pub fn delete_hitobject(&mut self, id: HitObjectId) -> Option<HitObject> {
        if let Some(index) = self
            .hit_objects
            .iter()
            .position(|hit_object| hit_object.id == id)
        {
            Some(self.hit_objects.remove(index))
        } else {
            None
        }
    }

    pub fn update_hitobject(&mut self, id: HitObjectId, hit_object: HitObject) -> Result<(), ()> {
        if let Some(index) = self.hit_objects.iter().position(|h| {
            h.id == id
                && std::mem::discriminant(&h.data) == std::mem::discriminant(&hit_object.data)
        }) {
            self.hit_objects[index] = hit_object;
            Ok(())
        } else {
            Err(())
        }
    }

    pub(crate) fn find_by_id(&self, id: HitObjectId) -> Option<&HitObject> {
        self.hit_objects.iter().find(|x| x.id == id)
    }

    pub(crate) fn find_by_id_mut(&mut self, id: u32) -> Option<&mut HitObject> {
        self.hit_objects.iter_mut().find(|x| x.id == id)
    }

    pub(crate) fn find_selected_by(&self, selected_by: usize) -> Vec<&HitObject> {
        self.hit_objects
            .iter()
            .filter(|h| h.selected_by.clone().is_some() && h.selected_by.unwrap() == selected_by)
            .collect()
    }

    pub(crate) fn find_selected_by_mut(&mut self, selected_by: usize) -> Vec<&mut HitObject> {
        self.hit_objects
            .iter_mut()
            .filter(|h| h.selected_by.clone().is_some() && h.selected_by.unwrap() == selected_by)
            .collect()
    }

    pub fn all(&self) -> &Vec<HitObject> {
        &self.hit_objects
    }

    pub(crate) fn find_by_start_time(&self, start_time: i32) -> Vec<&HitObject> {
        self.hit_objects
            .iter()
            .filter(|h| h.start_time == start_time)
            .collect()
    }
}

pub type HitObjectId = u32;

static NEXT_ID: AtomicU32 = AtomicU32::new(0);

fn next_id() -> HitObjectId {
    NEXT_ID.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct HitObject {
    #[serde(default = "next_id")]
    pub id: HitObjectId,
    #[serde(default)]
    pub selected_by: Option<usize>,
    #[serde(alias="time")]
    pub start_time: i32,
    pub position: IVec2,
    pub new_combo: bool,
    pub data: HitObjectKind,
}

impl HitObject {
    pub fn next_id() -> HitObjectId {
        next_id()
    }

    pub fn is_valid(&self) -> bool {
        match &self.data {
            HitObjectKind::Slider {
                expected_distance,
                control_points,
                repeats,
            } => {
                if control_points.len() < 2 {
                    return false
                }
                if let SliderControlPointKind::None = control_points[0].kind {
                    return false
                }
                *expected_distance >= 0.0 && *repeats >= 1
            }
            _ => true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(tag = "type")]
#[ts(export, rename_all = "camelCase")]
pub enum HitObjectKind {
    #[serde(rename = "circle")]
    #[ts(rename = "circle")]
    HitCircle,
    #[serde(rename = "slider", rename_all = "camelCase")]
    #[ts(rename = "slider")]
    Slider {
        #[ts(rename = "expectedDistance")]
        expected_distance: f32,
        #[ts(rename = "controlPoints")]
        control_points: Vec<SliderControlPoint>,
        #[serde(alias = "repeatCount")]
        repeats: u16,
    },
    #[serde(alias = "spinner", rename_all = "camelCase")]
    #[ts(rename = "circle")]
    Spinner {},
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub enum SliderControlPointKind {
    #[serde(rename = "none")]
    None = 0,
    #[serde(rename = "bezier")]
    Bezier = 1,
    #[serde(rename = "circle")]
    Circle = 2,
    #[serde(rename = "linear")]
    Linear = 3,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename_all = "camelCase")]
pub struct SliderControlPoint {
    pub position: IVec2,
    pub kind: SliderControlPointKind,
}
