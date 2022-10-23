use std::sync::Arc;

use crate::{
    editor::{
        dispatcher::Dispatcher,
        EditorSession,
        Presence, state::timing::{TimingPoint, TimingPointId},
    },
    proto::{self, commands::server_to_client_message::ServerCommand},
};

pub fn handle_create_timing_point(
    session: &mut EditorSession,
    _presence: Arc<Presence>,
    timing_point: proto::commands::TimingPoint,
    dispatcher: &mut Dispatcher,
) {
    let mut timing_point = TimingPoint::from(timing_point);
    timing_point.id = TimingPoint::next_id();
    session
        .state
        .timing
        .insert_timing_point(timing_point.clone());

    dispatcher.broadcast(ServerCommand::TimingPointCreated(timing_point.into()), None)
}

pub fn handle_update_timing_point(
    session: &mut EditorSession,
    _presence: Arc<Presence>,
    timing_point: proto::commands::TimingPoint,
    dispatcher: &mut Dispatcher,
) {
    let timing_point = TimingPoint::from(timing_point);

    if session
        .state
        .timing
        .update_timing_point(timing_point.id, timing_point.clone())
        .is_ok()
    {
        dispatcher.broadcast(ServerCommand::TimingPointUpdated(timing_point.into()), None)
    }
}

pub fn handle_delete_timing_point(
    session: &mut EditorSession,
    _presence: Arc<Presence>,
    ids: Vec<TimingPointId>,
    dispatcher: &mut Dispatcher,
) {
    let deleted: Vec<_> = ids
        .iter().copied()
        .filter(|id| session.state.timing.find_by_id(*id).is_some())
        .collect();

    deleted.iter().for_each(|id| {
        session.state.timing.delete_timing_point(*id);
        dispatcher.broadcast(ServerCommand::TimingPointDeleted(*id), None)
    });
}
