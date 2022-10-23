use std::collections::HashMap;
use std::net::ToSocketAddrs;
use std::sync::Arc;

use futures_util::StreamExt;
use serde::Deserialize;
use thiserror::Error;
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::{Filter, Rejection};
use warp::reject::Reject;
use warp::ws::WebSocket;

use config::ServerConfig;
use editor::EditorSession;

pub mod config;
pub mod editor;

pub mod proto {
    pub mod commands {
        tonic::include_proto!("proto.commands");
    }
}

struct SessionContainer {
    session: Arc<RwLock<EditorSession>>,
}

type Sessions = Arc<RwLock<HashMap<String, SessionContainer>>>;

#[derive(Error, Debug)]
enum ApiErrors {
    #[error("user not authorized")]
    NotAuthorized(String),
}

impl Reject for ApiErrors {}

#[tokio::main]
async fn main() -> Result<(), confy::ConfyError> {
    let config: ServerConfig = confy::load_path("config.yml")?;

    let sessions: Sessions = Arc::default();

    let session = warp::any().map(move || sessions.clone());

    let edit_route = warp::path!("edit" / String)
        .and(warp::ws())
        .and(session)
        .and(get_session_info())
        .map(|beatmap_id, ws: warp::ws::Ws, sessions, session_info| {
            ws.on_upgrade(move |socket| join_beatmap(socket, beatmap_id, sessions, session_info))
        });

    let addr: Vec<_> = format!("0.0.0.0:{}", config.port)
        .to_socket_addrs()
        .expect("Unable to parse socket address")
        .collect();

    let routes = edit_route;

    if !addr.is_empty() {
        warp::serve(routes).run(addr[0]).await;
    }
    Ok(())
}

#[derive(Clone, Deserialize)]
pub struct SessionInfo {
    pub token: String,
    pub user: SessionUserInfo,
}

#[derive(Clone, Deserialize)]
pub struct SessionUserInfo {
    pub id: u32,
    #[serde(alias = "avatarUrl")]
    pub avatar_url: String,
    #[serde(alias = "profileId")]
    pub profile_id: u32,
    #[serde(alias = "displayName")]
    pub display_name: String,
}

#[derive(Deserialize)]
struct Query {
    token: String,
}

fn get_session_info() -> impl Filter<Extract = (SessionInfo,), Error = Rejection> + Copy {
    warp::filters::query::query().and_then(|query: Query| async move {
        if let Ok(response) = reqwest::Client::new()
                    .get("http://osucad.com:3000/user/me")
                    .header("Authorization", format!("Bearer {}", query.token))
                    .send()
                    .await {
            if let Ok(body) = response.text().await {
                if let Ok(session_info) = serde_json::from_str::<SessionInfo>(body.as_str()) {
                    return Ok(session_info);
                }
            }
        }
        Err(warp::reject::custom(ApiErrors::NotAuthorized("".into())))
    })
}

async fn join_beatmap(
    ws: WebSocket,
    beatmap_id: String,
    sessions: Sessions,
    session_info: SessionInfo,
) {
    tokio::spawn(async move {
        let (mut client_ws_rcv, session, presence) = {
            let mut sessions = sessions.write().await;

            let session = match sessions.get(&beatmap_id) {
                Some(session) => session.session.clone(),
                None => {
                    if let Some(session) = EditorSession::create(beatmap_id.clone(), session_info.token.clone()).await {
                        let session = Arc::new(RwLock::new(session));

                        sessions.insert(
                            beatmap_id,
                            SessionContainer {
                                session: session.clone(),
                            },
                        );
                        {
                            let session = session.clone();
                            tokio::spawn(async move {
                                EditorSession::run(session).await;
                            });
                        }

                        session
                    } else {
                        return;
                    }
                }
            };

            let (client_ws_sender, client_ws_rcv) = ws.split();
            let (client_sender, client_rcv) = mpsc::unbounded_channel();

            let client_rcv = UnboundedReceiverStream::new(client_rcv);

            tokio::task::spawn(client_rcv.forward(client_ws_sender));

            let presence = session.write().await.join(&session_info, client_sender);

            (client_ws_rcv, session, presence)
        };

        while let Some(result) = client_ws_rcv.next().await {
            let msg = match result {
                Ok(msg) => msg,
                Err(_) => {
                    break;
                }
            };

            EditorSession::insert_message(session.clone(), presence, msg.as_bytes()).await
        }

        session.write().await.leave(presence);
    });

    // let mut client = session.write().await.join(presence_id);
}
