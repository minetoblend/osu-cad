use super::state::EditorState;

pub async fn load_beatmap(id: String, token: String) -> Option<EditorState> {
    if let Ok(response) = reqwest::Client::new()
        .get(format!("http://osucad.com:3000/beatmap/{}", id))
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
    {
        if response.status().is_success() {
            if let Ok(body) = response.text().await {
                match serde_json::from_str::<EditorState>(body.as_str()) {
                    Ok(state) => return Some(state),
                    Err(e) => {
                        println!("{:?}", e)
                    }
                }
            }
        }
    }
    None
}
