use std::{
    sync::{Arc, atomic::AtomicUsize},
    time::Duration,
};

use serde::Serialize;
use tokio::sync::{mpsc::UnboundedSender, RwLock};
use ts_rs::TS;

use crate::SessionInfo;

use self::{
    command::{
        handle_client_command, handle_editor_event,
        messages::{ClientToServerMessage, ServerCommand, ServerTick},
    },
    dispatcher::Dispatcher,
    init::load_beatmap,
    state::EditorState,
};

type Sender = UnboundedSender<Result<warp::ws::Message, warp::Error>>;
type TickNumber = u32;

pub mod command;
pub mod dispatcher;
mod init;
pub mod state;

static NEXT_ID: AtomicUsize = AtomicUsize::new(1);

pub struct EditorSession {
    beatmap_id: String,
    state: EditorState,
    presences: Vec<Arc<Presence>>,
    messages: Vec<(ClientToServerMessage, Arc<Presence>)>,
}

impl EditorSession {
    pub async fn create(beatmap_id: String, token: String) -> Option<Self> {
        load_beatmap(beatmap_id.clone(), token)
            .await
            .map(|state| Self {
                beatmap_id,
                state,
                presences: Default::default(),
                messages: Default::default(),
            })
    }

    pub async fn run(session: Arc<RwLock<EditorSession>>) {
        let mut interval = tokio::time::interval(Duration::from_millis(50));
        let mut tick: TickNumber = 0;

        println!("Session started for beatmap {}", session.read().await.beatmap_id);

        loop {
            interval.tick().await;

            let mut dispatcher = Dispatcher::new();

            if !session.write().await.tick(tick, &mut dispatcher) {
                break;
            }

            tick += 1;
        }

        println!("Session ended for beatmap {}", session.read().await.beatmap_id);
    }

    pub fn tick(&mut self, tick: TickNumber, dispatcher: &mut Dispatcher) -> bool {
        let events: Vec<_> = self.state.events.splice(.., []).collect();
        for event in events {
            handle_editor_event(self, event, dispatcher)
        }

        let messages: Vec<_> = self.messages.splice(.., []).collect();
        for message in messages {
            handle_client_command(self, message.0, message.1, dispatcher)
        }

        dispatcher.broadcast(
            ServerCommand::Tick(ServerTick {
                user_ticks: self
                    .state
                    .users
                    .all()
                    .iter()
                    .map(|user| user.into())
                    .collect(),
            }),
            None,
        );

        if self.presences.is_empty() {
            self.state.empty_ticks += 1;
        } else {
            self.state.empty_ticks = 0;
        }

        dispatcher.flush(self);

        if tick % (30 * 20) == 0 {

            if let Ok(json) = serde_json::to_string(&self.state) {
                let beatmap_id = self.beatmap_id.clone();

                tokio::spawn(async move {
                    let response = reqwest::Client::new()
                        .post(format!(
                            //todo: select endpoint from config
                            "http://osucad.com:3000/beatmap/{}",
                            beatmap_id
                        ))
                        .header("Content-Type", "application/json")
                        .body(json)
                        .send().await;

                    match response {
                        Ok(_) => println!("Successfully saved beatmap {}", beatmap_id),
                        Err(e) => println!("Failed to save beatmap: {:?}", e)
                    }
                });
            }
        }

        self.state.empty_ticks < 10 * 20
    }

    pub fn join(&mut self, session_info: &SessionInfo, sender: Sender) -> usize {
        let id = NEXT_ID.fetch_add(1, std::sync::atomic::Ordering::Relaxed);

        let presence = Arc::new(Presence {
            id,
            session: session_info.clone(),
            sender,
        });

        self.presences.push(presence);

        self.state
            .events
            .push(state::EditorEvent::UserJoined { id });

            println!("User {} joined for beatmap {}", session_info.user.display_name, self.beatmap_id);

        id
    }

    pub fn leave(&mut self, id: usize) {
        if let Some(presence) = self.presence(id) {
            println!("User {} left for beatmap {}", presence.session.user.display_name, self.beatmap_id);

            self.presences.retain(|p| p.id != id);

            self.state.events.push(state::EditorEvent::UserLeft { id });    
        }
    }

    pub async fn insert_message(session: Arc<RwLock<EditorSession>>, presence: usize, str: &str) {
        let message: ClientToServerMessage = match serde_json::from_str(str) {
            Ok(message) => message,
            Err(e) => {
                println!("{:?}: {}", e, str);
                return;
            }
        };

        let mut session = session.write().await;
        if let Some(presence) = session.presence(presence) {
            session.messages.push((message, presence))
        }
    }

    pub fn presence(&self, id: usize) -> Option<Arc<Presence>> {
        self.presences.iter().find(|p| p.id == id).cloned()
    }
}

#[derive(Serialize, TS)]
pub struct Presence {
    id: usize,
    session: SessionInfo,
    #[serde(skip)]
    sender: Sender,
}
