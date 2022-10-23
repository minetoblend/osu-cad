use std::sync::atomic::AtomicU32;

use glam::IVec2;
use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};

use crate::proto::commands::{self, ControlPointKind};

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
            .filter(|h| {
                h.selected_by.clone().is_some() && h.selected_by.unwrap() == selected_by
            })
            .collect()
    }

    pub(crate) fn find_selected_by_mut(&mut self, selected_by: usize) -> Vec<&mut HitObject> {
        self.hit_objects
            .iter_mut()
            .filter(|h| {
                h.selected_by.clone().is_some() && h.selected_by.unwrap() == selected_by
            })
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

#[derive(Serialize, Deserialize)]
#[serde(remote = "IVec2")]
struct IVec2Def {
    x: i32,
    y: i32,
}

static NEXT_ID: AtomicU32 = AtomicU32::new(0);

fn next_id() -> HitObjectId {
    NEXT_ID.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
}

#[derive(Clone, Serialize, Deserialize)]
pub struct HitObject {
    #[serde(default = "next_id", skip_deserializing, skip_serializing)]
    pub id: HitObjectId,
    #[serde(skip_deserializing, skip_serializing, default)]
    pub selected_by: Option<usize>,

    #[serde(alias = "time")]
    pub start_time: i32,
    #[serde(with = "IVec2Def")]
    pub position: IVec2,
    #[serde(alias = "newCombo")]
    pub new_combo: bool,

    #[serde(flatten)]
    pub data: HitObjectKind,
}

impl HitObject {
    pub fn next_id() -> HitObjectId {
        next_id()
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum HitObjectKind {
    #[serde(alias = "circle")]
    HitCircle,
    #[serde(alias = "slider", rename_all = "camelCase")]
    Slider {
        expected_distance: f32,
        control_points: Vec<SliderControlPoint>,
        #[serde(alias = "repeatCount")]
        repeats: u16,
    },
    #[serde(alias = "spinner", rename_all = "camelCase")]
    Spinner {},
}

#[derive(Serialize_repr, Deserialize_repr, PartialEq, Debug)]
#[repr(u8)]
#[serde(remote = "ControlPointKind")]
enum ControlPointKindDef {
    None = 0,
    Bezier = 1,
    Circle = 2,
    Linear = 3,
}

mod control_point {
    use serde::{de::Error, Deserialize, Deserializer, Serialize, Serializer};

    use crate::proto::commands::ControlPointKind;

    pub fn serialize<S>(v: &ControlPointKind, s: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let v = *v as u8;

        v.serialize(s)
    }

    pub fn deserialize<'de, D>(d: D) -> Result<ControlPointKind, D::Error>
    where
        D: Deserializer<'de>,
    {
        use ControlPointKind::*;

        match u8::deserialize(d)? {
            0 => Ok(None),
            1 => Ok(Bezier),
            2 => Ok(Circle),
            3 => Ok(Linear),
            o => Err(D::Error::custom(format_args!("Invalid value {}", o))),
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]

pub struct SliderControlPoint {
    #[serde(with = "IVec2Def")]
    pub position: IVec2,
    #[serde(with = "control_point")]
    pub kind: ControlPointKind,
}

impl From<&HitObject> for commands::HitObject {
    fn from(val: &HitObject) -> Self {
        commands::HitObject {
            id: val.id,
            new_combo: val.new_combo,
            position: Some(commands::IVec2 {
                x: val.position.x,
                y: val.position.y,
            }),
            selected_by: val.selected_by.map(|x| x as u32),
            start_time: val.start_time,
            kind: match val.data.clone() {
                HitObjectKind::HitCircle => {
                    Some(commands::hit_object::Kind::Circle(commands::HitCircle {}))
                }
                HitObjectKind::Slider {
                    expected_distance,
                    control_points,
                    repeats,
                } => Some(commands::hit_object::Kind::Slider(commands::Slider {
                    expected_distance,
                    repeats: repeats as u32,
                    control_points: control_points
                        .iter()
                        .map(|c| commands::SliderControlPoint {
                            position: Some(commands::IVec2 {
                                x: c.position.x,
                                y: c.position.y,
                            }),
                            kind: c.kind as i32,
                        })
                        .collect(),
                })),
                HitObjectKind::Spinner {} => {
                    Some(commands::hit_object::Kind::Spinner(commands::Spinner {}))
                }
            },
        }
    }
}

impl From<HitObject> for commands::HitObject {
    fn from(val: HitObject) -> Self {
        commands::HitObject {
            id: val.id,
            new_combo: val.new_combo,
            position: Some(commands::IVec2 {
                x: val.position.x,
                y: val.position.y,
            }),
            selected_by: val.selected_by.map(|x| x as u32),
            start_time: val.start_time,
            kind: match val.data {
                HitObjectKind::HitCircle => {
                    Some(commands::hit_object::Kind::Circle(commands::HitCircle {}))
                }
                HitObjectKind::Slider {
                    expected_distance,
                    control_points,
                    repeats,
                } => Some(commands::hit_object::Kind::Slider(commands::Slider {
                    expected_distance,
                    repeats: repeats as u32,
                    control_points: control_points
                        .iter()
                        .map(|c| commands::SliderControlPoint {
                            position: Some(commands::IVec2 {
                                x: c.position.x,
                                y: c.position.y,
                            }),
                            kind: c.kind as i32,
                        })
                        .collect(),
                })),
                HitObjectKind::Spinner {} => {
                    Some(commands::hit_object::Kind::Spinner(commands::Spinner {}))
                }
            },
        }
    }
}
