use moviebox_tui::service::MovieBoxService;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let service = MovieBoxService::new();
    let id = "3330020475752907416";
    let path = format!("/wefeed-mobile-bff/subject-api/resource?subjectId={}&se=1&ep=1&page=1&perPage=20", id);
    println!("Testing resource path for Stranger Things: {}", path);
    if let Ok(v) = service.client.get(&path).await {
        println!("Response: {}", serde_json::to_string_pretty(&v)?);
    }
    Ok(())
}
