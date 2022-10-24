use std::sync::Arc;

use crate::util::Vec2;

use super::{dispatcher::Dispatcher, EditorSession, Presence, state::EditorEvent};

use self::{
    hitobject::{
        handle_create_hitobject, handle_delete_hitobjects, handle_hitobject_selection,
        handle_update_hitobject,
    },
    messages::{ClientCommand, ClientToServerMessage, ServerCommand},
    timing::{handle_create_timing_point, handle_delete_timing_point, handle_update_timing_point},
    user::{handle_current_time, handle_cursorpos, handle_join, handle_leave},
};

mod hitobject;
pub mod messages;
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
    message: ClientToServerMessage,
    presence: Arc<Presence>,
    dispatcher: &mut Dispatcher,
) {
    match message.command {
        ClientCommand::CursorPos(cursor_pos) => {
            handle_cursorpos(session, presence, Vec2::new(cursor_pos.x, cursor_pos.y))
        }
        ClientCommand::CurrentTime(time) => handle_current_time(session, presence, time),

        ClientCommand::CreateHitObject(hit_object) => handle_create_hitobject(
            session,
            presence,
            hit_object,
            message.response_id,
            dispatcher,
        ),
        ClientCommand::UpdateHitObject(hit_object) => {
            handle_update_hitobject(session, presence, hit_object.id, hit_object, dispatcher)
        }
        ClientCommand::DeleteHitObject(ids) => {
            handle_delete_hitobjects(session, presence, ids, dispatcher, false)
        }
        ClientCommand::SelectHitObject {
            ids,
            selected,
            unique,
        } => handle_hitobject_selection(session, presence, ids, unique, selected, dispatcher),
        ClientCommand::CreateTimingPoint(timing_point) => {
            handle_create_timing_point(session, presence, timing_point, dispatcher);
        }
        ClientCommand::UpdateTimingPoint(timing_point) => {
            handle_update_timing_point(session, presence, timing_point, dispatcher);
        }
        ClientCommand::DeleteTimingPoint(ids) => {
            handle_delete_timing_point(session, presence, ids, dispatcher)
        }
        ClientCommand::SetHitObjectOverrides { id, overrides } => {
            dispatcher.broadcast(ServerCommand::HitObjectOverridden { id, overrides }, None)
        }
    }
}
