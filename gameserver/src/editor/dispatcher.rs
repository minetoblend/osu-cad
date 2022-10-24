use std::sync::Arc;

use super::{
    command::messages::{ServerCommand, ServerToClientMessage},
    EditorSession, Presence,
};

pub struct Dispatcher {
    messages: Vec<DispatcherMessage>,
}

impl Dispatcher {
    pub fn broadcast(&mut self, command: ServerCommand, presences: Option<Vec<Arc<Presence>>>) {
        self.schedule_message(DispatcherMessage {
            message: ServerToClientMessage {
                command,
                response_id: None,
            },
            presences,
        });
    }

    pub fn broadcast_response(
        &mut self,
        command: ServerCommand,
        response_id: Option<String>,
        presences: Option<Vec<Arc<Presence>>>,
    ) {
        self.schedule_message(DispatcherMessage {
            message: ServerToClientMessage {
                command,
                response_id,
            },
            presences,
        });
    }

    fn schedule_message(&mut self, message: DispatcherMessage) {
        self.messages.push(message);
    }

    pub fn flush(&mut self, session: &EditorSession) {
        for message in self.messages.iter().filter(|x| {
            x.presences.is_some() || x.message.response_id.is_some() || self.messages.len() == 1
        }) {
            let presences = match &message.presences {
                Some(presences) => presences.clone(),
                None => session.presences.clone(),
            };

            if let Ok(json) = serde_json::to_string(&message.message) {
                for presence in presences {
                    match presence
                        .sender
                        .send(Ok(warp::ws::Message::text(json.as_str())))
                    {
                        Ok(_) => {}
                        Err(e) => println!("{:?}: {}", e, json),
                    }
                }
            }
        }

        if self.messages.len() > 1 {
            let message = ServerToClientMessage {
                response_id: None,
                command: ServerCommand::Multiple(
                    self.messages
                        .iter()
                        .filter(|x| !(x.presences.is_some() || x.message.response_id.is_some()))
                        .map(|x| ServerToClientMessage {
                            response_id: None,
                            command: x.message.command.clone(),
                        })
                        .collect(),
                ),
            };

            if let Ok(json) = serde_json::to_string(&message) {
                for presence in &session.presences {
                    match presence
                        .sender
                        .send(Ok(warp::ws::Message::text(json.as_str())))
                    {
                        Ok(_) => {}
                        Err(e) => println!("{:?}: {}", e, json),
                    }
                }
            }
        }
    }

    pub(crate) fn new() -> Self {
        Self {
            messages: Default::default(),
        }
    }
}

struct DispatcherMessage {
    message: ServerToClientMessage,
    presences: Option<Vec<Arc<Presence>>>,
}
