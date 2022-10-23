use std::sync::Arc;

use glam::IVec2;

use crate::{
    editor::{
        dispatcher::Dispatcher,
        EditorSession,
        Presence, state::hitobject::{self, HitObject, HitObjectId, SliderControlPoint},
    },
    proto::{
        self,
        commands::{self, SelectHitObject, server_to_client_message::ServerCommand},
    },
};

fn parse_ivec2(v: &proto::commands::IVec2) -> IVec2 {
    IVec2::new(v.x, v.y)
}

fn parse_hitobject(hit_object: proto::commands::HitObject) -> HitObject {
    HitObject {
        id: hit_object.id,
        selected_by: hit_object.selected_by.map(|x| x as usize),
        start_time: hit_object.start_time,
        position: parse_ivec2(&hit_object.position.unwrap()),
        new_combo: hit_object.new_combo,
        data: match hit_object.kind.unwrap() {
            proto::commands::hit_object::Kind::Circle(_) => hitobject::HitObjectKind::HitCircle,
            proto::commands::hit_object::Kind::Slider(s) => hitobject::HitObjectKind::Slider {
                expected_distance: s.expected_distance,
                control_points: s
                    .control_points
                    .iter()
                    .map(|c| SliderControlPoint {
                        position: parse_ivec2(&c.position.clone().unwrap()),
                        kind: c.kind(),
                    })
                    .collect(),
                repeats: s.repeats as u16,
            },
            proto::commands::hit_object::Kind::Spinner(_) => hitobject::HitObjectKind::Spinner {},
        },
    }
}
/*
fn serialize_hitobject(hit_object: &HitObject) -> proto::commands::HitObject {
    proto::commands::HitObject {
        id: hit_object.id,
        new_combo: hit_object.new_combo,
        position: Some(proto::commands::IVec2 {
            x: hit_object.position.x,
            y: hit_object.position.y,
        }),
        selected_by: hit_object.selected_by.map(|x| x as u32),
        start_time: hit_object.start_time,
        kind: match hit_object.data.clone() {
            hitobject::HitObjectKind::HitCircle => Some(proto::commands::hit_object::Kind::Circle(
                proto::commands::HitCircle {},
            )),
            hitobject::HitObjectKind::Slider {
                expected_distance,
                control_points,
                repeats,
            } => Some(proto::commands::hit_object::Kind::Slider(
                proto::commands::Slider {
                    expected_distance,
                    repeats: repeats as u32,
                    control_points: control_points
                        .iter()
                        .map(|c| proto::commands::SliderControlPoint {
                            position: Some(proto::commands::IVec2 {
                                x: hit_object.position.x,
                                y: hit_object.position.y,
                            }),
                            kind: c.kind as i32,
                        })
                        .collect(),
                },
            )),
        },
    }
}*/

pub fn handle_create_hitobject(
    session: &mut EditorSession,
    presence: Arc<Presence>,
    hit_object: proto::commands::HitObject,
    response_id: Option<String>,
    dispatcher: &mut Dispatcher,
) {
    let overlapping = session
        .state
        .hit_objects
        .find_by_start_time(hit_object.start_time)
        .iter()
        .map(|h| h.id)
        .collect();

    handle_delete_hitobjects(session, presence.clone(), overlapping, dispatcher, true);

    let mut hit_object = parse_hitobject(hit_object);
    hit_object.id = HitObject::next_id();
    hit_object.selected_by = Some(presence.id);

    session
        .state
        .hit_objects
        .insert_hitobject(hit_object.clone());

    dispatcher.broadcast_response(
        ServerCommand::HitObjectCreated(hit_object.clone().into()),
        response_id,
        None,
    );

    handle_hitobject_selection(
        session,
        presence,
        SelectHitObject {
            ids: vec![hit_object.id],
            selected: true,
            unique: true,
        },
        dispatcher,
    );
}

pub fn handle_update_hitobject(
    session: &mut EditorSession,
    presence: Arc<Presence>,
    id: HitObjectId,
    hit_object: proto::commands::HitObject,
    dispatcher: &mut Dispatcher,
) {
    let mut hit_object = parse_hitobject(hit_object);
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
            .update_hitobject(id, hit_object.clone()).is_ok()
        {
            dispatcher.broadcast(ServerCommand::HitObjectUpdated(hit_object.into()), None);
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
        .iter().copied()
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
    selection: SelectHitObject,
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

    if selection.unique {
        for id in previous_selection {
            if let Some(mut hit_object) = session.state.hit_objects.find_by_id_mut(id) {
                if !selection.ids.contains(&hit_object.id) {
                    hit_object.selected_by = None;
                    deselected_ids.push(id);
                }
            }
        }
    }

    for id in selection.ids {
        if let Some(mut hit_object) = session.state.hit_objects.find_by_id_mut(id) {
            match hit_object.selected_by {
                Some(selected_by) => {
                    if selected_by == presence.id && !selection.selected {
                        hit_object.selected_by = None;
                        deselected_ids.push(id);
                    }
                }
                None => {
                    if selection.selected {
                        hit_object.selected_by = Some(presence.id);
                        selected_ids.push(id);
                    }
                }
            }
        }
    }

    if !selected_ids.is_empty() {
        dispatcher.broadcast(
            ServerCommand::HitObjectSelected(commands::HitObjectSelected {
                ids: selected_ids,
                selected_by: Some(presence.id as u64),
            }),
            None,
        )
    }

    if !deselected_ids.is_empty() {
        dispatcher.broadcast(
            ServerCommand::HitObjectSelected(commands::HitObjectSelected {
                ids: deselected_ids,
                selected_by: None,
            }),
            None,
        )
    }
}
