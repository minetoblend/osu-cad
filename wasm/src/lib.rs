use std::f32::consts::PI;
use std::ops::Sub;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use glam::Vec2;
use prev_iter::PrevPeekable;
use serde::{Deserialize, Serialize};
use serde_repr::*;
use wasm_bindgen::prelude::*;

use crate::geo::SliderGeometry;

mod utils;
mod geo;

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}


#[wasm_bindgen(js_name = computeSliderPath)]
pub fn compute_slider_path(control_points_js: JsValue) {
    let control_points: Vec<ControlPoint> = serde_wasm_bindgen::from_value(control_points_js).unwrap();
}

fn get_theta(from: &Vec2, to: &Vec2) -> f32 {
    f32::atan2(
        to.y - from.y,
        to.x - from.x,
    )
}

#[wasm_bindgen(js_name = createSliderGeo)]
pub fn create_slider_geo(radius: f32, path: JsValue, pointy: bool, pointy_ends: bool) -> JsValue {
    let window = web_sys::window().expect("should have a window in this context");
    let performance = window
        .performance()
        .expect("performance should be available");

    let start = performance.now();

    let points: Vec<JsVec2> = serde_wasm_bindgen::from_value(path).unwrap();
    let mut geo = SliderGeometry::new();

    for i in 1..points.len() {
        let cur: Vec2 = (&points[i]).into();
        let last: Vec2 = (&points[i - 1]).into();

        if cur.distance_squared(last) < 0.01 {
            //continue;
        }

        if i == 1 {
            let theta = get_theta(&last, &cur);

            //console_log!("theta: {} last: {},{} cur: {},{}", theta, last.x, last.y, cur.x, cur.y);

            if pointy_ends {
                geo.add_join_pointy(last, theta + PI, PI, radius);
            } else {
                geo.add_join(last, theta + PI, PI, radius);
            }
        }

        geo.add_straight_segment(last, cur, radius);

        if let Some(next_js) = points.get(i + 1) {
            let next: Vec2 = next_js.into();

            let theta = get_theta(&last, &cur);
            let theta_next = get_theta(&cur, &next);
            let theta_diff = md(theta_next - theta + PI, PI * 2.0) - PI;

            if pointy {
                geo.add_join_pointy(cur, theta, theta_diff, radius);
            } else {
                geo.add_join(cur, theta, theta_diff, radius);
            }
        } else {
            let theta = get_theta(&last, &cur);

            if pointy {
                geo.add_join_pointy(cur, theta, PI, radius);
            } else {
                geo.add_join(cur, theta, PI, radius);
            }
        }
    }

    let mut vertices = Vec::<f32>::with_capacity(geo.vertices.len() * 3);


    for vertex in &geo.vertices {
        vertices.push(vertex.pos.x);
        vertices.push(vertex.pos.y);
        vertices.push(vertex.is_edge);
    }

    let data = SliderGeometryData {
        vertices,
        indices: geo.indices,
    };

    let end = performance.now();

//console_log!("duration (wasm internal): {}ms", end - start);

    serde_wasm_bindgen::to_value(&data).unwrap()
}

fn md(a: f32, n: f32) -> f32 {
    ((a % n) + n) % n
}

#[derive(Serialize, Deserialize)]
struct JsVec2 {
    x: f32,
    y: f32,
}

#[derive(Serialize, Deserialize)]
struct ControlPoint {
    position: ControlPointPosition,
    kind: ControlPointType,
}

#[derive(Serialize, Deserialize)]
struct ControlPointPosition {
    x: f32,
    y: f32,
}

#[derive(Serialize, Deserialize)]
struct SliderGeometryData {
    pub vertices: Vec<f32>,
    pub indices: Vec<usize>,
}


#[derive(Serialize_repr, Deserialize_repr, PartialEq)]
#[repr(u8)]
enum ControlPointType {
    None,
    Linear,
    Bezier,
    Circle,
}

impl Into<Vec2> for &JsVec2 {
    fn into(self) -> Vec2 {
        Vec2::new(self.x, self.y)
    }
}