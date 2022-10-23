use std::sync::Arc;

use prost::Message;

use crate::proto::commands::{
    MultiServerToClientMessage, server_to_client_message::ServerCommand,
    ServerToClientMessage,
};

use super::{EditorSession, Presence};

pub struct Dispatcher {
    messages: Vec<DispatcherMessage>,
}

impl Dispatcher {
    pub fn broadcast(&mut self, command: ServerCommand, presences: Option<Vec<Arc<Presence>>>) {
        self.schedule_message(DispatcherMessage {
            message: ServerToClientMessage {
                server_command: Some(command),
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
                server_command: Some(command),
                response_id,
            },
            presences,
        });
    }

    fn schedule_message(&mut self, message: DispatcherMessage) {
        self.messages.push(message);
    }

    pub fn flush(&mut self, session: &EditorSession) {
        for message in self
            .messages
            .iter()
            .filter(|x| x.presences.is_some() || x.message.response_id.is_some())
        {
            let presences = match &message.presences {
                Some(presences) => presences.clone(),
                None => session.presences.clone(),
            };

            let mut buf: Vec<u8> = Vec::with_capacity(200);
            message.message.encode(&mut buf).unwrap();

            for presence in presences {
                match presence
                    .sender
                    .send(Ok(warp::ws::Message::binary(buf.clone())))
                {
                    Ok(_) => {}
                    Err(_) => todo!(),
                }
            }
        }

        let message = ServerToClientMessage {
            response_id: None,
            server_command: Some(ServerCommand::Multiple(MultiServerToClientMessage {
                messages: self
                    .messages
                    .iter()
                    .filter(|x| !(x.presences.is_some() || x.message.response_id.is_some()))
                    .map(|x| ServerToClientMessage {
                        response_id: None,
                        server_command: x.message.server_command.clone(),
                    })
                    .collect(),
            })),
        };

        let mut buf: Vec<u8> = Vec::with_capacity(200);
        message.encode(&mut buf).unwrap();

        for presence in &session.presences {
            match presence
                .sender
                .send(Ok(warp::ws::Message::binary(buf.clone())))
            {
                Ok(_) => {}
                Err(_) => todo!(),
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
