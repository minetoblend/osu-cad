use std::sync::Arc;

use glam::Vec2;

use crate::proto::commands::{
    self, client_to_server_message::ClientCommand,
    server_to_client_message::ServerCommand,
};

use super::{dispatcher::Dispatcher, EditorSession, Presence, state::EditorEvent};

use self::{
    hitobject::{
        handle_create_hitobject, handle_delete_hitobjects, handle_hitobject_selection,
        handle_update_hitobject,
    },
    timing::{handle_create_timing_point, handle_delete_timing_point, handle_update_timing_point},
    user::{handle_current_time, handle_cursorpos, handle_join, handle_leave},
};

mod hitobject;
mod timing;
mod user;

pub fn handle_editor_event(
    session: &mut EditorSession,
    event: EditorEvent,
    dispatcher: &mut Dispatcher,
) {
    match event {
        EditorEvent::UserJoined { id } => handle_join(session, id, dispatcher),
        EditorEvent::UserLeft { id } => handle_leave(session, id, dispatcher),
    }
}

pub fn handle_client_command(
    session: &mut EditorSession,
    message: commands::ClientToServerMessage,
    presence: Arc<Presence>,
    dispatcher: &mut Dispatcher,
) {
    if let Some(command) = message.client_command {
        match command {
            ClientCommand::CursorPos(cursor_pos) => {
                handle_cursorpos(session, presence, Vec2::new(cursor_pos.x, cursor_pos.y))
            }
            ClientCommand::CurrentTime(time) => handle_current_time(session, presence, time),

            ClientCommand::CreateHitObject(hit_object) => {
                if let Some(hit_object) = hit_object.hit_object {
                    handle_create_hitobject(
                        session,
                        presence,
                        hit_object,
                        message.response_id,
                        dispatcher,
                    )
                }
            }
            ClientCommand::UpdateHitObject(hit_object) => {
                if let Some(hit_object) = hit_object.hit_object {
                    handle_update_hitobject(
                        session,
                        presence,
                        hit_object.id,
                        hit_object,
                        dispatcher,
                    )
                }
            }
            ClientCommand::DeleteHitObject(delete) => {
                handle_delete_hitobjects(session, presence, delete.ids, dispatcher, false)
            }
            ClientCommand::SelectHitObject(selection) => {
                handle_hitobject_selection(session, presence, selection, dispatcher)
            }
            ClientCommand::CreateTimingPoint(payload) => {
                if let Some(timing_point) = payload.timing_point {
                    handle_create_timing_point(session, presence, timing_point, dispatcher);
                }
            }
            ClientCommand::UpdateTimingPoint(payload) => {
                if let Some(timing_point) = payload.timing_point {
                    handle_update_timing_point(session, presence, timing_point, dispatcher);
                }
            }
            ClientCommand::DeleteTimingPoint(payload) => {
                handle_delete_timing_point(session, presence, payload.ids, dispatcher)
            }
            ClientCommand::SetHitObjectOverrides(payload) => {
                dispatcher.broadcast(ServerCommand::HitObjectOverridden(payload), None)
            }
        }
    }
}
