use std::f32::consts::PI;

use glam::Vec2;

#[derive(Default)]
pub struct SliderGeometry {
    pub vertices: Vec<SliderVertex>,
    pub indices: Vec<usize>,
}

#[derive(Default, Clone)]
pub struct SliderVertex {
    pub pos: Vec2,
    pub is_edge: f32,
}

impl SliderGeometry {
    pub fn new() -> Self {
        Self {
            vertices: Vec::with_capacity(5000),
            indices: Vec::with_capacity(5000),
        }
    }

    pub fn add_vertex(&mut self, vertex: &SliderVertex) {
        self.vertices.push(vertex.clone())
    }

    pub fn add_vertices<T>(&mut self, vertices: T) where T: IntoIterator<Item=SliderVertex> {
        self.vertices.extend(vertices.into_iter());
    }

    pub fn cursor(&self) -> usize {
        self.vertices.len()
    }

    pub fn add_index(&mut self, index: usize) {
        self.indices.push(index)
    }

    pub fn add_indices<T>(&mut self, indices: T) where T: IntoIterator<Item=usize> {
        self.indices.extend(indices.into_iter());
    }

    pub fn add_triangle(&mut self, vertices: [SliderVertex; 3]) {
        let cursor = self.cursor();
        self.add_vertices(vertices);
        self.add_indices([cursor, cursor + 1, cursor + 2]);
    }

    pub fn add_quad(&mut self, vertices: [SliderVertex; 4]) {
        let cursor = self.cursor();
        self.add_vertices(vertices);
        self.add_indices([
            cursor, cursor + 1, cursor + 2,
            cursor, cursor + 3, cursor + 4
        ]);
    }

    pub fn add_triangle_strip<T>(&mut self, vertices: T) where T: IntoIterator<Item=SliderVertex> {
        let cursor = self.cursor();

        self.add_vertices(vertices);
        let num_pts = self.cursor() - cursor;
        let mut indices = Vec::<usize>::with_capacity(num_pts * 3);

        for i in 1..(num_pts - 1) {
            indices.push(cursor);
            indices.push(cursor + i);
            indices.push(cursor + i + 1);
        }

        self.add_indices(indices);
    }

    pub fn add_straight_segment(&mut self, from: Vec2, to: Vec2, radius: f32) {
        let direction = (to - from).normalize();
        let dir_l = Vec2::new(-direction.y * radius, direction.x * radius);

        let cursor = self.cursor();

        self.add_vertices([
            SliderVertex { pos: from + dir_l, is_edge: 1.0 },
            SliderVertex { pos: from, is_edge: 0.0 },
            SliderVertex { pos: from - dir_l, is_edge: 1.0 },
            SliderVertex { pos: to + dir_l, is_edge: 1.0 },
            SliderVertex { pos: to, is_edge: 0.0 },
            SliderVertex { pos: to - dir_l, is_edge: 1.0 },
        ]);

        self.add_indices([
            cursor,
            cursor + 3,
            cursor + 1,
            cursor + 3,
            cursor + 4,
            cursor + 1,
            cursor + 1,
            cursor + 4,
            cursor + 5,
            cursor + 5,
            cursor + 2,
            cursor + 1
        ]);
    }

    pub fn add_join(&mut self, position: Vec2, theta: f32, theta_diff: f32, radius: f32) {
        let mut theta = theta;

        let step = PI / 24.0;

        let dir = theta_diff.signum();

        let abs_theta_diff = theta_diff.abs();

        let amount_points = (abs_theta_diff / step).ceil() as u16;

        if dir < 0.0 {
            theta += PI;
        }

        let mut vertices = vec![
            SliderVertex { pos: position.clone(), is_edge: 0.0 }
        ];

        for i in 0..=amount_points {
            let angular_offset = ((i as f32) * step).min(abs_theta_diff);
            let angle = theta + dir * angular_offset;

            let pos = position + Vec2::new(
                f32::sin(angle) * radius,
                -f32::cos(angle) * radius,
            );

            vertices.push(SliderVertex {
                pos,
                is_edge: 1.0,
            });
        }

        self.add_triangle_strip(vertices);
    }

    pub fn add_join_pointy(&mut self, position: Vec2, mut theta: f32, theta_diff: f32, radius: f32) {
        let dir = theta_diff.signum();

        let abs_theta_diff = theta_diff.abs();
        if dir < 0.0 {
            theta += PI;
        }

        let start_angle = theta;
        let end_angle = theta + dir * abs_theta_diff;


        let n1 = Vec2::new(
            f32::sin(start_angle) * radius,
            -f32::cos(start_angle) * radius,
        );

        let n2 = Vec2::new(
            f32::sin(end_angle) * radius,
            -f32::cos(end_angle) * radius,
        );


        let angle = (abs_theta_diff * 0.5).min(PI * 0.25) * dir;

        let fac = 1.0 / f32::cos(angle.abs());

        let t1 = Vec2::new(f32::sin(start_angle + angle), -f32::cos(start_angle + angle)) * (radius * fac);
        let t2 = Vec2::new(f32::sin(end_angle - angle), -f32::cos(end_angle - angle)) * (radius * fac);


        self.add_triangle_strip([
            SliderVertex { pos: position, is_edge: 0.0 },
            SliderVertex { pos: position + n1, is_edge: 1.0 },
            SliderVertex { pos: position + t1, is_edge: 1.0 },
            SliderVertex { pos: position + t2, is_edge: 1.0 },
            SliderVertex { pos: position + n2, is_edge: 1.0 }
        ]);
    }
}

