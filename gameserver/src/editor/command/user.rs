use std::sync::Arc;

use glam::Vec2;

use crate::editor::{dispatcher::Dispatcher, EditorSession, Presence, state::user::UserInfo};
use crate::proto::commands::HitObjectSelected;
use crate::proto::commands::server_to_client_message::ServerCommand;

pub fn handle_join(session: &mut EditorSession, id: usize, dispatcher: &mut Dispatcher) {
    if let Some(presence) = session.presence(id) {
        let user = UserInfo {
            presence: presence.clone(),
            cursor_pos: None,
            current_time: 0,
        };

        session.state.users.add_user(user.clone());

        dispatcher.broadcast(
            ServerCommand::OwnId(presence.id as u64),
            Some(vec![presence.clone()]),
        );
        dispatcher.broadcast(ServerCommand::UserJoined(user.into()), None);
        dispatcher.broadcast(
            ServerCommand::UserList(crate::proto::commands::UserList {
                users: session
                    .state
                    .users
                    .all()
                    .iter()
                    .map(|u| u.clone().into())
                    .collect(),
            }),
            None,
        );

        dispatcher.broadcast(
            ServerCommand::State(crate::proto::commands::EditorState {
                beatmap: Some((&session.state).into()),
            }),
            Some(vec![presence]),
        )
    }
}

pub fn handle_leave(session: &mut EditorSession, id: usize, dispatcher: &mut Dispatcher) {
    match session.state.users.remove_user(id) {
        Some(user) => dispatcher.broadcast(ServerCommand::UserLeft(user.into()), None),
        _ => return,
    };

    let user_selection: Vec<_> = session
        .state
        .hit_objects
        .find_selected_by_mut(id)
        .iter_mut()
        .map(|hit_object| {
            hit_object.selected_by = None;
            hit_object.id
        })
        .collect();
    dispatcher.broadcast(
        ServerCommand::HitObjectSelected(HitObjectSelected {
            ids: user_selection,
            selected_by: None,
        }),
        None,
    );
}

pub fn handle_cursorpos(session: &mut EditorSession, presence: Arc<Presence>, pos: Vec2) {
    if let Some(user) = session.state.users.find_mut(presence.id) {
        user.cursor_pos = Some(pos)
    }
}

pub fn handle_current_time(session: &mut EditorSession, presence: Arc<Presence>, time: i32) {
    if let Some(user) = session.state.users.find_mut(presence.id) {
        user.current_time = time
    }
}
