#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let args: Vec<String> = std::env::args().collect();
    let port = if let Some(pos) = args.iter().position(|a| a == "--port" || a == "-p") {
        args.get(pos + 1)
            .and_then(|s| s.parse::<u16>().ok())
            .unwrap_or(3000)
    } else if let Ok(env_port) = std::env::var("PORT") {
        env_port.parse::<u16>().unwrap_or(3000)
    } else {
        3000
    };

    moviebox_tui::web::run_server(port).await
}

