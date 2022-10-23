use std::sync::Arc;

use glam::Vec2;

use crate::{editor::Presence, proto::commands};

#[derive(Default)]
pub struct UserState {
    users: Vec<UserInfo>,
}

impl UserState {
    pub fn add_user(&mut self, user: UserInfo) {
        self.users.push(user)
    }

    pub fn remove_user(&mut self, id: usize) -> Option<UserInfo> {
        if let Some(index) = self.users.iter().position(|user| user.id() == id) {
            Some(self.users.swap_remove(index))
        } else {
            None
        }
    }

    pub fn find(&self, id: usize) -> Option<&UserInfo> {
        self.users.iter().find(|user| user.id() == id)
    }

    pub fn find_mut(&mut self, id: usize) -> Option<&mut UserInfo> {
        self.users.iter_mut().find(|user| user.id() == id)
    }

    pub fn all(&self) -> &Vec<UserInfo> {
        &self.users
    }
}

#[derive(Clone)]
pub struct UserInfo {
    pub presence: Arc<Presence>,
    pub cursor_pos: Option<Vec2>,
    pub current_time: i32,
}

impl UserInfo {
    pub fn id(&self) -> usize {
        self.presence.id
    }

    pub fn display_name(&self) -> &str {
        self.presence.session.user.display_name.as_str()
    }
}

impl From<UserInfo> for commands::UserInfo {
    fn from(val: UserInfo) -> Self {
        commands::UserInfo {
            id: val.id() as u64,
            display_name: val.display_name().into(),
        }
    }
}
