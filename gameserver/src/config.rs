use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ServerConfig {
    pub port: u16
}

impl Default for ServerConfig {
    fn default() -> Self { Self { 
        port: 7350
    } }

}