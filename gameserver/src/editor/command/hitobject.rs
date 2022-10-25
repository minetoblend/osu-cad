use std::sync::Arc;

use crate::editor::{
    dispatcher::Dispatcher,
    EditorSession,
    Presence, state::hitobject::{HitObject, HitObjectId},
};

use super::messages::ServerCommand;

pub fn handle_create_hitobject(
    session: &mut EditorSession,
    presence: Arc<Presence>,
    mut hit_object: HitObject,
    response_id: Option<String>,
    dispatcher: &mut Dispatcher,
) {
    if !hit_object.is_valid() {
        println!("Invalid hitobject: {:?}", hit_object);
        return;
    }

    let overlapping = session
        .state
        .hit_objects
        .find_by_start_time(hit_object.start_time)
        .iter()
        .map(|h| h.id)
        .collect();

    handle_delete_hitobjects(session, presence.clone(), overlapping, dispatcher, true);

    hit_object.id = HitObject::next_id();
    hit_object.selected_by = Some(presence.id);

    session
        .state
        .hit_objects
        .insert_hitobject(hit_object.clone());

    dispatcher.broadcast_response(
        ServerCommand::HitObjectCreated(hit_object.clone()),
        response_id,
        None,
    );

    
    handle_hitobject_selection(session, presence, vec![hit_object.id], true, true, dispatcher);
}

pub fn handle_update_hitobject(
    session: &mut EditorSession,
    presence: Arc<Presence>,
    id: HitObjectId,
    mut hit_object: HitObject,
    dispatcher: &mut Dispatcher,
) {
    if !hit_object.is_valid() {
        println!("Invalid hitobject: {:?}", hit_object);
        return;
    }

    hit_object.id = id;

    if let Some(original) = session.state.hit_objects.find_by_id(id) {
        match original.selected_by {
            Some(selected_by) => {
                if selected_by != presence.id {
                    return;
                }
            }
            _ => {
                return;
            }
        }

        if session
            .state
            .hit_objects
            .update_hitobject(id, hit_object.clone())
            .is_ok()
        {
            dispatcher.broadcast(ServerCommand::HitObjectUpdated(hit_object), None);
        }
    }
}

pub fn handle_delete_hitobjects(
    session: &mut EditorSession,
    presence: Arc<Presence>,
    ids: Vec<HitObjectId>,
    dispatcher: &mut Dispatcher,
    and_unselected: bool,
) {
    let deleted: Vec<_> = ids
        .iter()
        .copied()
        .filter(|id| {
            if let Some(hit_object) = session.state.hit_objects.find_by_id(*id) {
                if let Some(selected_by) = hit_object.selected_by {
                    if selected_by == presence.id {
                        return true;
                    }
                } else if and_unselected {
                    return true;
                }
            }
            false
        })
        .collect();

    deleted.iter().for_each(|id| {
        session.state.hit_objects.delete_hitobject(*id);
        dispatcher.broadcast(ServerCommand::HitObjectDeleted(*id), None)
    });
}

pub fn handle_hitobject_selection(
    session: &mut EditorSession,
    presence: Arc<Presence>,
    ids: Vec<HitObjectId>,
    unique: bool,
    selected: bool,
    dispatcher: &mut Dispatcher,
) {
    let mut selected_ids: Vec<HitObjectId> = Default::default();
    let mut deselected_ids: Vec<HitObjectId> = Default::default();
    let previous_selection: Vec<_> = session
        .state
        .hit_objects
        .find_selected_by(presence.id)
        .iter()
        .map(|h| h.id)
        .collect();

    if unique {
        for id in previous_selection {
            if let Some(mut hit_object) = session.state.hit_objects.find_by_id_mut(id) {
                if !ids.contains(&hit_object.id) {
                    hit_object.selected_by = None;
                    deselected_ids.push(id);
                }
            }
        }
    }

    for id in ids.clone() {
        if let Some(mut hit_object) = session.state.hit_objects.find_by_id_mut(id) {
            match hit_object.selected_by {
                Some(selected_by) => {
                    if selected_by == presence.id && !selected {
                        hit_object.selected_by = None;
                        deselected_ids.push(id);
                    }
                }
                None => {
                    if selected {
                        hit_object.selected_by = Some(presence.id);
                        selected_ids.push(id);
                    }
                }
            }
        }
    }

    if !selected_ids.is_empty() {
        dispatcher.broadcast(
            ServerCommand::HitObjectSelected {
                ids: selected_ids,
                selected_by: Some(presence.id),
            },
            None,
        )
    }

    if !deselected_ids.is_empty() {
        dispatcher.broadcast(
            ServerCommand::HitObjectSelected {
                ids: deselected_ids,
                selected_by: None,
            },
            None,
        )
    }
}
