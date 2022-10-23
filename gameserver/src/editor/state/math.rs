use glam::Vec2;

use crate::proto;

pub trait Vec2Ext {
    fn into(self) -> proto::commands::Vec2;
}

impl Vec2Ext for Vec2 {
    fn into(self) -> proto::commands::Vec2 {
        proto::commands::Vec2 { x: self.x, y: self.y }
    }
}

pub trait Vec2MessageExt {
    fn into(self) -> Vec2;
}

impl Vec2MessageExt for proto::commands::Vec2 {
    fn into(self) -> Vec2 {
        Vec2::new(self.x, self.y)
    }
}
