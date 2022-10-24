use std::sync::Arc;

use serde::Serialize;

use crate::editor::Presence;
use crate::util::Vec2;

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

#[derive(Clone, Serialize)]
pub struct UserInfo {
    #[serde(flatten)]
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