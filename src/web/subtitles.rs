use std::error::Error;

/// Converts SubRip (.srt) subtitle content into standard WebVTT (.vtt) format.
pub fn srt_to_webvtt(srt_content: &str) -> String {
    let mut vtt = String::with_capacity(srt_content.len() + 64);
    vtt.push_str("WEBVTT\n\n");

    for line in srt_content.lines() {
        let trimmed = line.trim();
        // Check if this line is a timestamp line (e.g. 00:01:20,000 --> 00:01:23,400)
        if trimmed.contains("-->") {
            // Replace comma with dot for milliseconds
            let converted = trimmed.replace(',', ".");
            vtt.push_str(&converted);
            vtt.push('\n');
        } else {
            vtt.push_str(line);
            vtt.push('\n');
        }
    }

    vtt
}

/// Fetches a subtitle file from a URL and converts it to WebVTT.
pub async fn fetch_and_convert_to_vtt(url: &str) -> Result<String, Box<dyn Error + Send + Sync>> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()?;

    let response = client.get(url).send().await?.error_for_status()?;
    let text = response.text().await?;

    if text.trim_start().starts_with("WEBVTT") {
        Ok(text)
    } else {
        Ok(srt_to_webvtt(&text))
    }
}

