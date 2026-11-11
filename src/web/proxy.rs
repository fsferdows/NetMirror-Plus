use axum::{
    body::Body,
    extract::Query,
    http::{header, HeaderMap, StatusCode},
    response::Response,
};
use serde::Deserialize;
use std::sync::LazyLock;

static PROXY_CLIENT: LazyLock<reqwest::Client> = LazyLock::new(|| {
    crate::net::http_client_builder()
        .connect_timeout(std::time::Duration::from_secs(10))
        .tcp_keepalive(std::time::Duration::from_secs(30))
        .pool_idle_timeout(std::time::Duration::from_secs(90))
        .pool_max_idle_per_host(16)
        .build()
        .expect("proxy http client")
});

#[derive(Deserialize)]
pub struct StreamQuery {
    pub url: String,
    pub referer: Option<String>,
    pub ua: Option<String>,
}

pub async fn handle_stream_options() -> Response {
    Response::builder()
        .status(StatusCode::OK)
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .header(
            header::ACCESS_CONTROL_ALLOW_METHODS,
            "GET, HEAD, OPTIONS",
        )
        .header(
            header::ACCESS_CONTROL_ALLOW_HEADERS,
            "Range, Content-Type, Accept, Origin, User-Agent, Referer",
        )
        .header(
            header::ACCESS_CONTROL_EXPOSE_HEADERS,
            "Content-Range, Content-Length, Accept-Ranges, Content-Type",
        )
        .header(header::ACCESS_CONTROL_MAX_AGE, "86400")
        .body(Body::empty())
        .unwrap_or_else(|_| Response::new(Body::empty()))
}

pub async fn handle_stream_proxy(
    Query(params): Query<StreamQuery>,
    client_headers: HeaderMap,
) -> Result<Response, (StatusCode, String)> {
    let mut upstream_req = PROXY_CLIENT.get(&params.url);

    // Forward Range header if requested by browser for seeking
    if let Some(range_val) = client_headers.get(header::RANGE) {
        if let Ok(val) = range_val.to_str() {
            upstream_req = upstream_req.header(header::RANGE, val);
        }
    }

    // Forward referer if provided or needed by upstream provider
    if let Some(ref_val) = &params.referer {
        upstream_req = upstream_req.header(header::REFERER, ref_val);
    }

    // Set User-Agent (default to Android Moviebox UA or provided UA)
    if let Some(ua_val) = &params.ua {
        upstream_req = upstream_req.header(header::USER_AGENT, ua_val);
    } else {
        upstream_req = upstream_req.header(
            header::USER_AGENT,
            "com.community.oneroom/50020120 (Linux; U; Android 12; en_US; M2012K11AG; Build/S1B.220414.015; Cronet/135.0.7012.3)",
        );
    }

    let upstream_res = upstream_req
        .send()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, format!("Upstream CDN error: {e}")))?;

    let status = upstream_res.status();
    let mut builder = Response::builder().status(status.as_u16());

    // CORS & Seeking headers
    builder = builder.header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    builder = builder.header(
        header::ACCESS_CONTROL_ALLOW_METHODS,
        "GET, HEAD, OPTIONS",
    );
    builder = builder.header(
        header::ACCESS_CONTROL_EXPOSE_HEADERS,
        "Content-Range, Content-Length, Accept-Ranges, Content-Type",
    );
    builder = builder.header(header::ACCEPT_RANGES, "bytes");

    // Intelligently map content type so browsers play video instead of downloading
    let content_type = if let Some(ct) = upstream_res.headers().get(header::CONTENT_TYPE) {
        if let Ok(ct_str) = ct.to_str() {
            let lower = ct_str.to_ascii_lowercase();
            if lower.contains("octet-stream") || lower.is_empty() {
                if params.url.contains(".mkv") {
                    "video/x-matroska"
                } else if params.url.contains(".webm") {
                    "video/webm"
                } else {
                    "video/mp4"
                }
            } else {
                ct_str
            }
        } else {
            "video/mp4"
        }
    } else if params.url.contains(".mkv") {
        "video/x-matroska"
    } else {
        "video/mp4"
    };

    builder = builder.header(header::CONTENT_TYPE, content_type);

    if let Some(cr) = upstream_res.headers().get(header::CONTENT_RANGE) {
        builder = builder.header(header::CONTENT_RANGE, cr.as_bytes());
    }

    if let Some(cl) = upstream_res.headers().get(header::CONTENT_LENGTH) {
        builder = builder.header(header::CONTENT_LENGTH, cl.as_bytes());
    }

    let stream = upstream_res.bytes_stream();
    let body = Body::from_stream(stream);

    builder
        .body(body)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}
