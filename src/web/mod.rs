pub mod api;
pub mod proxy;
pub mod subtitles;

use std::net::SocketAddr;
use std::sync::Arc;

use axum::{
    routing::get,
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

use crate::service::MovieBoxService;
use api::AppState;

pub fn create_router(service: Arc<MovieBoxService>) -> Router {
    let state = AppState { service };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .expose_headers(Any);

    let api_routes = Router::new()
        .route("/homepage", get(api::get_homepage))
        .route("/browse", get(api::get_browse))
        .route("/platforms", get(api::get_platforms))
        .route("/platform", get(api::get_platform_content))
        .route("/sports", get(api::get_sports))
        .route("/sports-stream", get(api::get_sports_stream))
        .route("/search", get(api::get_search))
        .route("/suggest", get(api::get_suggest))
        .route("/details/{id}", get(api::get_details))
        .route("/streams/{id}", get(api::get_streams))
        .route("/subtitles/{id}/{resource_id}", get(api::get_subtitles))
        .route("/subtitles/vtt", get(api::get_vtt_subtitle))
        .route(
            "/stream",
            get(proxy::handle_stream_proxy).options(proxy::handle_stream_options),
        )
        .with_state(state);

    Router::new()
        .nest("/api", api_routes)
        .fallback_service(ServeDir::new("web"))
        .layer(cors)
}

pub async fn run_server(port: u16) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let service = Arc::new(MovieBoxService::new());
    let router = create_router(service);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr).await?;
    let local_port = listener.local_addr()?.port();

    println!("============================================================");
    println!("  🍿 NETMIRROR / MOVIEBOX WEB STREAMING PLATFORM");
    println!("  🚀 Server running at: http://localhost:{}", local_port);
    println!("  🎬 Open your browser and enjoy movies & series!");
    println!("============================================================");

    axum::serve(listener, router).await?;
    Ok(())
}

