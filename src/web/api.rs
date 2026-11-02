use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};

use crate::{
    models::BrowseMetrics,
    providers::{
        models::{CatalogItem, MediaDetails, MediaType, ProviderKind, ProviderMediaId, Release, ResolutionIntent},
        moviebox::adapt::is_deprecation_notice_url,
        moviebox::title::clean_moviebox_title,
        ReleaseProvider,
    },
    service::MovieBoxService,
    web::subtitles::fetch_and_convert_to_vtt,
};

#[derive(Clone)]
pub struct AppState {
    pub service: Arc<MovieBoxService>,
}

#[derive(Deserialize)]
pub struct HomepageQuery {
    pub tab: Option<String>,
    pub page: Option<usize>,
}

#[derive(Serialize)]
pub struct HomepageResponse {
    pub tab: String,
    pub page: usize,
    pub items: Vec<CatalogItem>,
    pub metrics: std::collections::HashMap<String, BrowseMetrics>,
}

pub async fn get_homepage(
    State(state): State<AppState>,
    Query(params): Query<HomepageQuery>,
) -> Result<Json<HomepageResponse>, (StatusCode, String)> {
    let tab = params.tab.unwrap_or_else(|| "2".to_string());
    let page = params.page.unwrap_or(1);

    match state.service.homepage(&tab, page).await {
        Ok((items, metrics)) => Ok(Json(HomepageResponse {
            tab,
            page,
            items,
            metrics,
        })),
        Err(err) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Homepage error: {err}"),
        )),
    }
}

#[derive(Serialize)]
pub struct BrowseSectionsResponse {
    pub hero: Option<CatalogItem>,
    pub hero_slides: Vec<CatalogItem>,
    pub trending: Vec<CatalogItem>,
    pub netflix: Vec<CatalogItem>,
    pub prime: Vec<CatalogItem>,
    pub disney: Vec<CatalogItem>,
    pub movies: Vec<CatalogItem>,
    pub series: Vec<CatalogItem>,
}

#[derive(Serialize, Clone)]
pub struct PlatformInfo {
    pub key: String,
    pub name: String,
    pub subtitle: String,
    pub badge: String,
    pub count_label: String,
    pub color: String,
    pub bg_gradient: String,
}

#[derive(Deserialize)]
pub struct PlatformQuery {
    pub name: String,
    pub page: Option<usize>,
    pub media_type: Option<String>,
    pub sort_by: Option<String>,
}

#[derive(Serialize)]
pub struct PlatformResponse {
    pub platform: String,
    pub display_name: String,
    pub page: usize,
    pub total_pages: usize,
    pub total_results: usize,
    pub items: Vec<CatalogItem>,
}

pub async fn get_platforms() -> Json<Vec<PlatformInfo>> {
    Json(vec![
        PlatformInfo {
            key: "netflix".to_string(),
            name: "Netflix".to_string(),
            subtitle: "Originals & Exclusives".to_string(),
            badge: "2,200+ Titles".to_string(),
            count_label: "2,271 Titles".to_string(),
            color: "#E50914".to_string(),
            bg_gradient: "linear-gradient(135deg, rgba(229,9,20,0.35) 0%, rgba(20,20,20,0.92) 100%)".to_string(),
        },
        PlatformInfo {
            key: "primeVideo".to_string(),
            name: "Prime Video".to_string(),
            subtitle: "Amazon Exclusives".to_string(),
            badge: "900+ Titles".to_string(),
            count_label: "907 Titles".to_string(),
            color: "#00A8E1".to_string(),
            bg_gradient: "linear-gradient(135deg, rgba(0,168,225,0.35) 0%, rgba(14,25,39,0.92) 100%)".to_string(),
        },
        PlatformInfo {
            key: "disney".to_string(),
            name: "Disney+".to_string(),
            subtitle: "Marvel, Star Wars & Pixar".to_string(),
            badge: "210+ Titles".to_string(),
            count_label: "212 Titles".to_string(),
            color: "#113CCF".to_string(),
            bg_gradient: "linear-gradient(135deg, rgba(17,60,207,0.35) 0%, rgba(15,42,47,0.92) 100%)".to_string(),
        },
        PlatformInfo {
            key: "appleTV".to_string(),
            name: "Apple TV+".to_string(),
            subtitle: "Award-Winning Originals".to_string(),
            badge: "260+ Titles".to_string(),
            count_label: "262 Titles".to_string(),
            color: "#A2AAAD".to_string(),
            bg_gradient: "linear-gradient(135deg, rgba(162,170,173,0.25) 0%, rgba(16,17,20,0.92) 100%)".to_string(),
        },
        PlatformInfo {
            key: "hulu".to_string(),
            name: "Hulu".to_string(),
            subtitle: "Exclusive Series & Docs".to_string(),
            badge: "250+ Titles".to_string(),
            count_label: "259 Titles".to_string(),
            color: "#1CE783".to_string(),
            bg_gradient: "linear-gradient(135deg, rgba(28,231,131,0.3) 0%, rgba(14,51,57,0.92) 100%)".to_string(),
        },
        PlatformInfo {
            key: "zee5".to_string(),
            name: "Zee5".to_string(),
            subtitle: "Indian Cinema & Blockbusters".to_string(),
            badge: "240+ Titles".to_string(),
            count_label: "248 Titles".to_string(),
            color: "#8230C6".to_string(),
            bg_gradient: "linear-gradient(135deg, rgba(130,48,198,0.35) 0%, rgba(13,31,54,0.92) 100%)".to_string(),
        },
        PlatformInfo {
            key: "viu".to_string(),
            name: "Viu".to_string(),
            subtitle: "Asian Dramas & Shows".to_string(),
            badge: "220+ Titles".to_string(),
            count_label: "222 Titles".to_string(),
            color: "#FAAF00".to_string(),
            bg_gradient: "linear-gradient(135deg, rgba(250,175,0,0.3) 0%, rgba(60,51,29,0.92) 100%)".to_string(),
        },
        PlatformInfo {
            key: "vivamax".to_string(),
            name: "Vivamax".to_string(),
            subtitle: "Filipino Exclusives".to_string(),
            badge: "100+ Titles".to_string(),
            count_label: "104 Titles".to_string(),
            color: "#E85D04".to_string(),
            bg_gradient: "linear-gradient(135deg, rgba(232,93,4,0.35) 0%, rgba(52,35,16,0.92) 100%)".to_string(),
        },
        PlatformInfo {
            key: "hoichoi".to_string(),
            name: "Hoichoi".to_string(),
            subtitle: "Bengali Cinema & Shows".to_string(),
            badge: "Exclusive".to_string(),
            count_label: "13 Titles".to_string(),
            color: "#C1121F".to_string(),
            bg_gradient: "linear-gradient(135deg, rgba(193,18,31,0.35) 0%, rgba(41,14,16,0.92) 100%)".to_string(),
        },
    ])
}

fn clean_display_title(title: &str) -> String {
    let mut s = title
        .replace("&amp;", "&")
        .replace("&#039;", "'")
        .replace("&quot;", "\"")
        .replace("&lt;", "<")
        .replace("&gt;", ">");
    while let Some(start) = s.find('[') {
        if let Some(end) = s[start..].find(']') {
            s.replace_range(start..=start + end, "");
        } else {
            break;
        }
    }
    while let Some(start) = s.find('(') {
        if let Some(end) = s[start..].find(')') {
            s.replace_range(start..=start + end, "");
        } else {
            break;
        }
    }
    s.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn get_canonical_title(title: &str) -> String {
    let clean = clean_display_title(title).to_lowercase();
    let words: Vec<&str> = clean
        .split(|c: char| !c.is_alphanumeric() && c != '-')
        .filter(|w| !w.is_empty())
        .filter(|w| {
            !matches!(
                *w,
                "hindi"
                    | "english"
                    | "tamil"
                    | "telugu"
                    | "kannada"
                    | "malayalam"
                    | "bengali"
                    | "dubbed"
                    | "dual"
                    | "audio"
                    | "multi"
                    | "season"
                    | "seasons"
                    | "s1"
                    | "s2"
                    | "s3"
                    | "s4"
                    | "s1-s2"
                    | "s1-s3"
                    | "s1-s4"
            )
        })
        .collect();
    words.concat()
}

fn map_netmirror_item_to_catalog(item: &serde_json::Value) -> Option<CatalogItem> {
    let id_str = item.get("id").and_then(|v| {
        if let Some(n) = v.as_i64() {
            Some(n.to_string())
        } else {
            v.as_str().map(|s| s.to_string())
        }
    })?;

    let raw_title = item.get("title").and_then(|t| t.as_str()).unwrap_or("Untitled").trim();
    let title = clean_display_title(raw_title);
    let mtype_str = item.get("media_type").and_then(|m| m.as_str()).unwrap_or("movie");
    let media_type = if mtype_str.eq_ignore_ascii_case("tv") {
        MediaType::Series
    } else {
        MediaType::Movie
    };

    let year = item.get("release_date").and_then(|r| r.as_str()).map(|d| {
        if let Ok(ts) = d.parse::<i64>() {
            if ts > 1000000000 {
                let approx_year = 1970 + (ts / 31536000);
                approx_year.to_string()
            } else {
                d.to_string()
            }
        } else {
            crate::providers::models::extract_4digit_year(d)
        }
    }).filter(|y| !y.is_empty());

    let poster_url = item.get("backdrop_path").and_then(|p| p.as_str()).map(|s| s.to_string());

    Some(CatalogItem {
        id: ProviderMediaId {
            provider: ProviderKind::MovieBox,
            value: id_str,
        },
        title,
        media_type,
        year,
        poster_url,
        season_count: None,
    })
}

pub async fn get_platform_content(
    Query(params): Query<PlatformQuery>,
) -> Result<Json<PlatformResponse>, (StatusCode, String)> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(4000))
        .build()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let norm_name = params.name.to_lowercase().replace(' ', "").replace('-', "");
    let page = params.page.unwrap_or(1).max(1);
    let page_idx = page - 1;

    let (url, display_name, platform_key) = match norm_name.as_str() {
        "netflix" | "net-flix" => (
            format!("https://api2.imdb3.shop/api/movies/list/filter?page={page_idx}&platform=netflix"),
            "Netflix Originals".to_string(),
            "netflix".to_string(),
        ),
        "prime" | "primevideo" | "amazon" => (
            format!("https://api2.imdb3.shop/api/movies/list/filter?page={page_idx}&platform=primeVideo"),
            "Prime Video Exclusives".to_string(),
            "primeVideo".to_string(),
        ),
        "disney" | "disney+" | "hotstar" => (
            format!("https://api2.imdb3.shop/api/movies/list/filter?page={page_idx}&platform=disney"),
            "Disney+ Hotstar".to_string(),
            "disney".to_string(),
        ),
        "apple" | "appletv" => (
            format!("https://api2.imdb3.shop/api/movies/list/filter?page={page_idx}&platform=appleTV"),
            "Apple TV+ Originals".to_string(),
            "appleTV".to_string(),
        ),
        "hulu" => (
            format!("https://api2.imdb3.shop/api/movies/list/filter?page={page_idx}&platform=hulu"),
            "Hulu Exclusives".to_string(),
            "hulu".to_string(),
        ),
        "zee5" => (
            format!("https://api2.imdb3.shop/api/movies/list/filter?page={page_idx}&platform=zee5"),
            "Zee5 Exclusives".to_string(),
            "zee5".to_string(),
        ),
        "viu" => (
            format!("https://api2.imdb3.shop/api/movies/list/filter?page={page_idx}&platform=viu"),
            "Viu Asian Dramas".to_string(),
            "viu".to_string(),
        ),
        "vivamax" => (
            format!("https://api2.imdb3.shop/api/movies/list/filter?page={page_idx}&platform=vivamax"),
            "Vivamax Filipino".to_string(),
            "vivamax".to_string(),
        ),
        "hoichoi" => (
            format!("https://api2.imdb3.shop/api/movies/list/filter?page={page_idx}&platform=hoichoi"),
            "Hoichoi Bengali".to_string(),
            "hoichoi".to_string(),
        ),
        // Studios and Universes
        "marvel" => (
            format!("https://api2.imdb3.shop/api/tranding?id=42&items_per_page=18&page={page_idx}"),
            "Marvel Cinematic Universe".to_string(),
            "marvel".to_string(),
        ),
        "dc" => (
            format!("https://api2.imdb3.shop/api/tranding?id=58&items_per_page=18&page={page_idx}"),
            "DC Studios Universe".to_string(),
            "dc".to_string(),
        ),
        "anime" => (
            format!("https://api2.imdb3.shop/api/tranding?id=30&items_per_page=18&page={page_idx}"),
            "Anime [English Dubbed]".to_string(),
            "anime".to_string(),
        ),
        "kdrama" => (
            format!("https://api2.imdb3.shop/api/tranding?id=18&items_per_page=18&page={page_idx}"),
            "Korean K-Drama".to_string(),
            "kdrama".to_string(),
        ),
        "bollywood" => (
            format!("https://api2.imdb3.shop/api/tranding?id=14&items_per_page=18&page={page_idx}"),
            "Bollywood Blockbusters".to_string(),
            "bollywood".to_string(),
        ),
        "hollywood" => (
            format!("https://api2.imdb3.shop/api/tranding?id=13&items_per_page=18&page={page_idx}"),
            "Hollywood Hits".to_string(),
            "hollywood".to_string(),
        ),
        "boxoffice" => (
            format!("https://api2.imdb3.shop/api/tranding?id=44&items_per_page=18&page={page_idx}"),
            "Top All-Time Box Office".to_string(),
            "boxoffice".to_string(),
        ),
        _ => (
            format!("https://api2.imdb3.shop/api/movies/list/filter?page={page_idx}&platform={norm_name}"),
            format!("{} Titles", params.name),
            norm_name,
        ),
    };

    let mut final_url = url;
    if let Some(ref mtype) = params.media_type {
        if mtype == "movie" {
            final_url.push_str("&type=1");
        } else if mtype == "tv" {
            final_url.push_str("&type=2");
        }
    }
    if let Some(ref sort) = params.sort_by {
        if sort == "rating" {
            final_url.push_str("&sort_by=rating");
        } else if sort == "date" {
            final_url.push_str("&sort_by=date");
        }
    }

    let res = client
        .get(&final_url)
        .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")
        .send()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, format!("Failed to fetch platform: {e}")))?;

    let json: serde_json::Value = res
        .json()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, format!("Failed to parse platform json: {e}")))?;

    let total_results = json.get("pager")
        .and_then(|p| p.get("total_results"))
        .and_then(|v| v.as_u64())
        .or_else(|| json.get("total_results").and_then(|v| v.as_u64()))
        .unwrap_or(0) as usize;

    let total_pages = json.get("pager")
        .and_then(|p| p.get("total_pages"))
        .and_then(|v| v.as_u64())
        .or_else(|| json.get("total_pages").and_then(|v| v.as_u64()))
        .unwrap_or(1) as usize;

    let raw_results = json.get("results")
        .and_then(|r| r.as_array())
        .cloned()
        .unwrap_or_default();

    let mut seen = std::collections::HashSet::new();
    let items: Vec<CatalogItem> = raw_results
        .iter()
        .filter_map(|raw| {
            let canon = raw.get("title").and_then(|t| t.as_str()).map(get_canonical_title)?;
            if canon.is_empty() || seen.contains(&canon) {
                return None;
            }
            seen.insert(canon);
            map_netmirror_item_to_catalog(raw)
        })
        .collect();

    Ok(Json(PlatformResponse {
        platform: platform_key,
        display_name,
        page,
        total_pages,
        total_results,
        items,
    }))
}

pub async fn get_browse(
    State(state): State<AppState>,
) -> Result<Json<BrowseSectionsResponse>, (StatusCode, String)> {
    let (trending_res, movies_res, series_res) = tokio::join!(
        state.service.homepage("2", 1),
        state.service.homepage("1", 1),
        state.service.homepage("3", 1),
    );

    let raw_trending = trending_res.map(|(items, _)| items).unwrap_or_default();
    let raw_movies = movies_res.map(|(items, _)| items).unwrap_or_default();
    let raw_series = series_res.map(|(items, _)| items).unwrap_or_default();

    // Fetch top preview items for Netflix, Prime Video, Disney+
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(3000))
        .build()
        .ok();

    let mut raw_netflix = Vec::new();
    let mut raw_prime = Vec::new();
    let mut raw_disney = Vec::new();

    if let Some(c) = client {
        let (nf0, nf1, pv0, pv1, dis0, dis1) = tokio::join!(
            c.get("https://api2.imdb3.shop/api/movies/list/filter?page=0&platform=netflix&items_per_page=30").header("User-Agent", "Mozilla/5.0").send(),
            c.get("https://api2.imdb3.shop/api/movies/list/filter?page=1&platform=netflix&items_per_page=30").header("User-Agent", "Mozilla/5.0").send(),
            c.get("https://api2.imdb3.shop/api/movies/list/filter?page=0&platform=primeVideo&items_per_page=30").header("User-Agent", "Mozilla/5.0").send(),
            c.get("https://api2.imdb3.shop/api/movies/list/filter?page=1&platform=primeVideo&items_per_page=30").header("User-Agent", "Mozilla/5.0").send(),
            c.get("https://api2.imdb3.shop/api/movies/list/filter?page=0&platform=disney&items_per_page=30").header("User-Agent", "Mozilla/5.0").send(),
            c.get("https://api2.imdb3.shop/api/movies/list/filter?page=1&platform=disney&items_per_page=30").header("User-Agent", "Mozilla/5.0").send(),
        );

        for res in [nf0, nf1] {
            if let Ok(r) = res {
                if let Ok(json) = r.json::<serde_json::Value>().await {
                    if let Some(arr) = json.get("results").and_then(|r| r.as_array()) {
                        raw_netflix.extend(arr.iter().filter_map(map_netmirror_item_to_catalog));
                    }
                }
            }
        }

        for res in [pv0, pv1] {
            if let Ok(r) = res {
                if let Ok(json) = r.json::<serde_json::Value>().await {
                    if let Some(arr) = json.get("results").and_then(|r| r.as_array()) {
                        raw_prime.extend(arr.iter().filter_map(map_netmirror_item_to_catalog));
                    }
                }
            }
        }

        for res in [dis0, dis1] {
            if let Ok(r) = res {
                if let Ok(json) = r.json::<serde_json::Value>().await {
                    if let Some(arr) = json.get("results").and_then(|r| r.as_array()) {
                        raw_disney.extend(arr.iter().filter_map(map_netmirror_item_to_catalog));
                    }
                }
            }
        }
    }

    let mut global_seen = std::collections::HashSet::new();

    let mut pick_unique = |items: Vec<CatalogItem>, max: usize| -> Vec<CatalogItem> {
        let mut out = Vec::new();
        for item in items {
            let canon = get_canonical_title(&item.title);
            if canon.is_empty() || global_seen.contains(&canon) {
                continue;
            }
            global_seen.insert(canon);
            out.push(item);
            if out.len() >= max {
                break;
            }
        }
        out
    };

    // 1. Hero slides: 5 distinct blockbusters
    let hero_slides = pick_unique(raw_trending.clone(), 5);
    let hero = hero_slides.first().cloned();

    // 2. Trending: remaining trending items (zero overlap with hero slides!)
    let trending = pick_unique(raw_trending, 14);

    // 3. Netflix, Prime, Disney (deduplicated across rails, no audio repeats)
    let netflix = pick_unique(raw_netflix, 14);
    let prime = pick_unique(raw_prime, 14);
    let disney = pick_unique(raw_disney, 14);

    // 4. Popular Movies & TV Series (distinct from all above)
    let movies = pick_unique(raw_movies, 14);
    let series = pick_unique(raw_series, 14);

    Ok(Json(BrowseSectionsResponse {
        hero,
        hero_slides,
        trending,
        netflix,
        prime,
        disney,
        movies,
        series,
    }))
}

async fn resolve_netmirror_subject(id: &str) -> Option<(String, Option<String>, Option<String>, Option<String>, bool)> {
    if id.len() > 10 || !id.chars().all(|c| c.is_ascii_digit()) {
        return None;
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(2000))
        .build()
        .ok()?;

    for mtype in &["movie", "tv"] {
        let url = format!("https://api2.imdb3.shop/api/{mtype}/{id}");
        if let Ok(res) = client.get(&url).header("User-Agent", "Mozilla/5.0").send().await {
            if let Ok(json) = res.json::<serde_json::Value>().await {
                if let Some(arr) = json.get("results").and_then(|r| r.as_array()) {
                    if let Some(item) = arr.first() {
                        let is_tv = mtype == &"tv";
                        let title = item.get("title").and_then(|t| t.as_str()).map(|s| s.trim().to_string());
                        let subjectid = item.get("subjectid").and_then(|s| {
                            if let Some(num) = s.as_i64() {
                                Some(num.to_string())
                            } else {
                                s.as_str().map(|str_val| str_val.to_string())
                            }
                        }).filter(|s| !s.is_empty() && s != "0");
                        let tm_id = item.get("tm_id").and_then(|s| s.as_str()).map(|s| s.to_string());
                        let desc = item.get("dis").and_then(|s| s.as_str()).map(|s| s.trim_matches('"').to_string());

                        return Some((subjectid.unwrap_or_else(|| id.to_string()), title, tm_id, desc, is_tv));
                    }
                }
            }
        }
    }
    None
}

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: String,
    pub page: Option<usize>,
    pub provider: Option<String>,
}

pub async fn get_search(
    State(state): State<AppState>,
    Query(params): Query<SearchQuery>,
) -> Result<Json<Vec<CatalogItem>>, (StatusCode, String)> {
    let query = params.q.trim();
    if query.is_empty() {
        return Ok(Json(vec![]));
    }
    let page = params.page.unwrap_or(1);
    let provider = params
        .provider
        .as_deref()
        .and_then(ProviderKind::parse)
        .unwrap_or(ProviderKind::MovieBox);

    match state.service.search_typed(provider, query, page).await {
        Ok(items) => Ok(Json(items)),
        Err(err) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Search error: {err}"),
        )),
    }
}

#[derive(Deserialize)]
pub struct SuggestQuery {
    pub q: String,
}

pub async fn get_suggest(
    State(state): State<AppState>,
    Query(params): Query<SuggestQuery>,
) -> Result<Json<Vec<String>>, (StatusCode, String)> {
    let query = params.q.trim();
    if query.is_empty() {
        return Ok(Json(vec![]));
    }

    match state.service.suggest(query).await {
        Ok(suggestions) => Ok(Json(suggestions)),
        Err(_) => Ok(Json(vec![])),
    }
}

#[derive(Deserialize)]
pub struct DetailsQuery {
    pub provider: Option<String>,
}

pub async fn get_details(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(params): Query<DetailsQuery>,
) -> Result<Json<MediaDetails>, (StatusCode, String)> {
    let provider = params
        .provider
        .as_deref()
        .and_then(ProviderKind::parse)
        .unwrap_or(ProviderKind::MovieBox);

    let (target_id, fallback_meta) = if id.len() <= 10 && id.chars().all(|c| c.is_ascii_digit()) {
        if let Some((subjectid, title, tm_id, desc, is_tv)) = resolve_netmirror_subject(&id).await {
            (subjectid, Some((title, tm_id, desc, is_tv)))
        } else {
            (id.clone(), None)
        }
    } else {
        (id.clone(), None)
    };

    match state.service.details_typed(provider, &target_id).await {
        Ok(details) => Ok(Json(details)),
        Err(err) => {
            if let Some((Some(title), _tm_id, desc, is_tv)) = fallback_meta {
                let media_type = if is_tv { MediaType::Series } else { MediaType::Movie };
                return Ok(Json(MediaDetails {
                    id: ProviderMediaId { provider: ProviderKind::MovieBox, value: id.clone() },
                    title,
                    media_type,
                    year: None,
                    description: desc,
                    tagline: None,
                    imdb_rating: None,
                    director: None,
                    stars: None,
                    prints: None,
                    audios: None,
                    poster_url: None,
                    duration: None,
                    genres: vec![],
                    seasons: vec![],
                    dubs: vec![],
                }));
            }
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Details error: {err}"),
            ))
        }
    }
}

#[derive(Deserialize)]
pub struct StreamsQuery {
    pub season: Option<usize>,
    pub episode: Option<usize>,
    pub title: Option<String>,
    pub provider: Option<String>,
}

#[derive(Serialize, Clone, Debug)]
pub struct FormattedStream {
    pub server: String,
    pub quality: String,
    pub codec: Option<String>,
    pub size_bytes: Option<u64>,
    pub direct_url: String,
    pub proxy_url: String,
    pub resource_id: Option<String>,
}

#[derive(Serialize, Clone, Debug)]
pub struct EmbedSource {
    pub name: String,
    pub url: String,
}

#[derive(Serialize)]
pub struct StreamsResponse {
    pub releases: Vec<Release>,
    pub streams: Vec<FormattedStream>,
    pub default_stream_url: Option<String>,
    pub resource_id: Option<String>,
    pub embed_urls: Vec<EmbedSource>,
}

async fn resolve_imdb_id(title: &str, year_hint: Option<&str>) -> Option<String> {
    let clean = clean_moviebox_title(title);
    let mut search_term = String::new();
    for c in clean.chars() {
        if c.is_alphanumeric() {
            search_term.push(c.to_ascii_lowercase());
        } else if !search_term.ends_with('_') {
            search_term.push('_');
        }
    }
    let search_term = search_term.trim_matches('_');
    if search_term.is_empty() {
        return None;
    }

    let first_char = search_term.chars().next().unwrap_or('a');
    let url = format!("https://v3.sg.media-imdb.com/suggestion/{first_char}/{search_term}.json");

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(2500))
        .build()
        .ok()?;

    let res = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")
        .send()
        .await
        .ok()?;

    let json: serde_json::Value = res.json().await.ok()?;
    let list = json.get("d")?.as_array()?;

    if let Some(y_str) = year_hint {
        if let Ok(y) = y_str.parse::<i64>() {
            for item in list {
                if let Some(item_y) = item.get("y").and_then(|v| v.as_i64()) {
                    if (item_y - y).abs() <= 1 {
                        if let Some(id) = item.get("id").and_then(|v| v.as_str()) {
                            return Some(id.to_string());
                        }
                    }
                }
            }
        }
    }

    list.first()
        .and_then(|item| item.get("id"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
}

pub async fn get_streams(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(params): Query<StreamsQuery>,
) -> Result<Json<StreamsResponse>, (StatusCode, String)> {
    let req_season = params.season.unwrap_or(0);
    let req_episode = params.episode.unwrap_or(0);
    let provider_hint = params.provider.as_deref().and_then(ProviderKind::parse);

    // If ID is a NetMirror platform ID (e.g. "100985" or "4807"), resolve to subjectid & title
    let (target_id, fallback_title) = if id.len() <= 10 && id.chars().all(|c| c.is_ascii_digit()) {
        if let Some((subjectid, title, _, _, _)) = resolve_netmirror_subject(&id).await {
            (subjectid, title)
        } else {
            (id.clone(), None)
        }
    } else {
        (id.clone(), None)
    };

    // Fetch details to accurately inspect media_type, dubs, and title
    let details_opt = state.service.details_typed(provider_hint.unwrap_or(ProviderKind::MovieBox), &target_id).await.ok();
    let is_series = details_opt.as_ref().map(|d| d.is_series()).unwrap_or(req_season > 0 || req_episode > 0);
    let resolved_title = params.title.clone()
        .or_else(|| fallback_title)
        .or_else(|| details_opt.as_ref().map(|d| d.title.clone()))
        .unwrap_or_default();

    // Accurate season/episode: movies must ALWAYS be 0, 0
    let (season, episode) = if !is_series {
        (0, 0)
    } else {
        (req_season.max(1), req_episode.max(1))
    };

    let mut releases: Vec<Release> = Vec::new();
    let mut streams: Vec<FormattedStream> = Vec::new();
    let mut seen_stream_urls: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut primary_resource_id: Option<String> = None;

    // 1. If explicit provider requested or 4KHDHub path
    if provider_hint == Some(ProviderKind::FourKHdHub) || target_id.starts_with('/') {
        if let Some(fourk) = &state.service.fourk_client {
            let s_num = if !is_series { 0 } else { season };
            let ep_num = if !is_series { 0 } else { episode };
            if let Ok(fourk_rels) = ReleaseProvider::episode_streams(fourk, &target_id, s_num, ep_num).await {
                for rel in &fourk_rels {
                    if let Ok(source) = fourk.resolve_release(rel, ResolutionIntent::Playback).await {
                        if seen_stream_urls.insert(source.url.clone()) {
                            let encoded_url = percent_encoding::utf8_percent_encode(&source.url, percent_encoding::NON_ALPHANUMERIC).to_string();
                            let proxy_url = format!("/api/stream?url={encoded_url}");
                            streams.push(FormattedStream {
                                server: format!("4KHDHub Ultra ({})", rel.quality.as_deref().unwrap_or("HD")),
                                quality: rel.quality.clone().unwrap_or_else(|| "1080p".to_string()),
                                codec: rel.codec.clone(),
                                size_bytes: rel.size_bytes,
                                direct_url: source.url,
                                proxy_url,
                                resource_id: rel.resource_id.clone(),
                            });
                        }
                    }
                }
                releases = fourk_rels;
            }
        }
    }

    // 2. MovieBox primary stream extraction
    let primary_res = state.service.client.episode_streams(&target_id, season, episode).await;
    let mb_releases = match primary_res {
        Ok(r) if !r.is_empty() => Ok(r),
        _ => state.service.client.episode_streams(&target_id, 0, 0).await,
    };

    if let Ok(mb_rels) = mb_releases {
        for rel in &mb_rels {
            if let Some(direct_url) = rel.direct_url() {
                if !is_deprecation_notice_url(direct_url) && seen_stream_urls.insert(direct_url.to_string()) {
                    let encoded_url = percent_encoding::utf8_percent_encode(direct_url, percent_encoding::NON_ALPHANUMERIC).to_string();
                    let proxy_url = format!("/api/stream?url={encoded_url}");
                    if primary_resource_id.is_none() && rel.resource_id.is_some() {
                        primary_resource_id = rel.resource_id.clone();
                    }
                    streams.push(FormattedStream {
                        server: "MovieBox Direct".to_string(),
                        quality: rel.quality.clone().unwrap_or_else(|| "Auto".to_string()),
                        codec: rel.codec.clone(),
                        size_bytes: rel.size_bytes,
                        direct_url: direct_url.to_string(),
                        proxy_url,
                        resource_id: rel.resource_id.clone(),
                    });
                }
            }
        }
        if !mb_rels.is_empty() {
            releases = mb_rels;
        }
    }

    // 3. MovieBox Sibling Dubs (parallelized with 1500ms timeout for ultra-fast response)
    if let Some(ref det) = details_opt {
        let other_dubs: Vec<_> = det.dubs.iter().filter(|d| d.subject_id != target_id).take(2).cloned().collect();
        if !other_dubs.is_empty() {
            let client = &state.service.client;
            let dub_futures = other_dubs.iter().map(|dub| {
                let d_id = dub.subject_id.clone();
                let d_label = dub.label.clone();
                async move {
                    let res = client.episode_streams(&d_id, season, episode).await;
                    match res {
                        Ok(r) if !r.is_empty() => (d_label, r),
                        _ => {
                            let fb = client.episode_streams(&d_id, 0, 0).await.unwrap_or_default();
                            (d_label, fb)
                        }
                    }
                }
            });

            if let Ok(results) = tokio::time::timeout(std::time::Duration::from_millis(1500), futures::future::join_all(dub_futures)).await {
                for (dub_label, dub_rels) in results {
                    for rel in dub_rels {
                        if let Some(direct_url) = rel.direct_url() {
                            if !is_deprecation_notice_url(direct_url) && seen_stream_urls.insert(direct_url.to_string()) {
                                let encoded_url = percent_encoding::utf8_percent_encode(direct_url, percent_encoding::NON_ALPHANUMERIC).to_string();
                                let proxy_url = format!("/api/stream?url={encoded_url}");
                                if primary_resource_id.is_none() && rel.resource_id.is_some() {
                                    primary_resource_id = rel.resource_id.clone();
                                }
                                streams.push(FormattedStream {
                                    server: format!("MovieBox ({})", dub_label),
                                    quality: rel.quality.clone().unwrap_or_else(|| "Auto".to_string()),
                                    codec: rel.codec.clone(),
                                    size_bytes: rel.size_bytes,
                                    direct_url: direct_url.to_string(),
                                    proxy_url,
                                    resource_id: rel.resource_id.clone(),
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    // 4. 4KHDHub multi-provider fallback if streams still empty
    if streams.is_empty() && !resolved_title.is_empty() {
        let clean_title = clean_moviebox_title(&resolved_title);
        if let Some(fourk) = &state.service.fourk_client {
            if let Ok(items) = fourk.search(clean_title).await {
                if let Some(first) = items.first() {
                    let s_num = if !is_series { 0 } else { season };
                    let ep_num = if !is_series { 0 } else { episode };
                    if let Ok(fourk_rels) = ReleaseProvider::episode_streams(fourk, &first.id.value, s_num, ep_num).await {
                        for rel in fourk_rels.iter().take(3) {
                            if let Ok(source) = fourk.resolve_release(rel, ResolutionIntent::Playback).await {
                                if seen_stream_urls.insert(source.url.clone()) {
                                    let encoded_url = percent_encoding::utf8_percent_encode(&source.url, percent_encoding::NON_ALPHANUMERIC).to_string();
                                    let proxy_url = format!("/api/stream?url={encoded_url}");
                                    streams.push(FormattedStream {
                                        server: format!("4KHDHub Ultra ({})", rel.quality.as_deref().unwrap_or("HD")),
                                        quality: rel.quality.clone().unwrap_or_else(|| "1080p".to_string()),
                                        codec: rel.codec.clone(),
                                        size_bytes: rel.size_bytes,
                                        direct_url: source.url,
                                        proxy_url,
                                        resource_id: rel.resource_id.clone(),
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 5. Universal Cloud Embed Players (backed by IMDb ID lookup; NO broken watch21.shop)
    let year_hint = details_opt.as_ref().and_then(|d| d.year.as_deref());
    let imdb_id_opt = resolve_imdb_id(&resolved_title, year_hint).await;

    let clean_title = if !resolved_title.is_empty() {
        clean_moviebox_title(&resolved_title)
    } else {
        "Movie"
    };
    let encoded_title = percent_encoding::utf8_percent_encode(clean_title, percent_encoding::NON_ALPHANUMERIC).to_string();

    let mut embed_urls = Vec::new();

    if let Some(imdb_id) = imdb_id_opt {
        if is_series {
            embed_urls.push(EmbedSource {
                name: "VidSrc Cloud (Fast)".to_string(),
                url: format!("https://vidsrc.pm/embed/tv/{imdb_id}/{season}/{episode}"),
            });
            embed_urls.push(EmbedSource {
                name: "VidSrc Pro (HD)".to_string(),
                url: format!("https://vidsrc.to/embed/tv/{imdb_id}/{season}/{episode}"),
            });
            embed_urls.push(EmbedSource {
                name: "MultiEmbed VIP".to_string(),
                url: format!("https://multiembed.mov/?video_id={imdb_id}&s={season}&e={episode}"),
            });
            embed_urls.push(EmbedSource {
                name: "2Embed Cinema".to_string(),
                url: format!("https://www.2embed.cc/embedtv/{imdb_id}&s={season}&e={episode}"),
            });
            embed_urls.push(EmbedSource {
                name: "VidLink Stream".to_string(),
                url: format!("https://vidlink.pro/tv/{imdb_id}/{season}/{episode}"),
            });
        } else {
            embed_urls.push(EmbedSource {
                name: "VidSrc Cloud (Fast)".to_string(),
                url: format!("https://vidsrc.pm/embed/movie/{imdb_id}"),
            });
            embed_urls.push(EmbedSource {
                name: "VidSrc Pro (HD)".to_string(),
                url: format!("https://vidsrc.to/embed/movie/{imdb_id}"),
            });
            embed_urls.push(EmbedSource {
                name: "MultiEmbed VIP".to_string(),
                url: format!("https://multiembed.mov/?video_id={imdb_id}"),
            });
            embed_urls.push(EmbedSource {
                name: "2Embed Cinema".to_string(),
                url: format!("https://www.2embed.cc/embed/{imdb_id}"),
            });
            embed_urls.push(EmbedSource {
                name: "VidLink Stream".to_string(),
                url: format!("https://vidlink.pro/movie/{imdb_id}"),
            });
        }
    } else {
        if is_series {
            embed_urls.push(EmbedSource {
                name: "VidSrc Cloud (Fast)".to_string(),
                url: format!("https://vidsrc.pm/embed/tv?title={encoded_title}&season={season}&episode={episode}"),
            });
            embed_urls.push(EmbedSource {
                name: "VidSrc Pro (HD)".to_string(),
                url: format!("https://vidsrc.to/embed/tv/{encoded_title}/{season}/{episode}"),
            });
            embed_urls.push(EmbedSource {
                name: "MultiEmbed VIP".to_string(),
                url: format!("https://multiembed.mov/?video_id={encoded_title}&s={season}&e={episode}"),
            });
            embed_urls.push(EmbedSource {
                name: "2Embed Cinema".to_string(),
                url: format!("https://www.2embed.cc/embedtv/{encoded_title}&s={season}&e={episode}"),
            });
        } else {
            embed_urls.push(EmbedSource {
                name: "VidSrc Cloud (Fast)".to_string(),
                url: format!("https://vidsrc.pm/embed/movie?title={encoded_title}"),
            });
            embed_urls.push(EmbedSource {
                name: "VidSrc Pro (HD)".to_string(),
                url: format!("https://vidsrc.to/embed/movie/{encoded_title}"),
            });
            embed_urls.push(EmbedSource {
                name: "MultiEmbed VIP".to_string(),
                url: format!("https://multiembed.mov/?video_id={encoded_title}"),
            });
            embed_urls.push(EmbedSource {
                name: "2Embed Cinema".to_string(),
                url: format!("https://www.2embed.cc/embed/{encoded_title}"),
            });
        }
    }

    let default_stream_url = streams.first().map(|s| s.proxy_url.clone());

    Ok(Json(StreamsResponse {
        releases,
        streams,
        default_stream_url,
        resource_id: primary_resource_id,
        embed_urls,
    }))
}

#[derive(Deserialize)]
pub struct SubtitlesQuery {
    pub season: Option<usize>,
    pub episode: Option<usize>,
}

#[derive(Serialize)]
pub struct FormattedSubtitle {
    pub name: String,
    pub original_url: String,
    pub vtt_url: String,
}

pub async fn get_subtitles(
    State(state): State<AppState>,
    Path((id, resource_id)): Path<(String, String)>,
    Query(params): Query<SubtitlesQuery>,
) -> Result<Json<Vec<FormattedSubtitle>>, (StatusCode, String)> {
    let season = params.season.unwrap_or(0);
    let episode = params.episode.unwrap_or(0);

    let details = state.service.details_typed(ProviderKind::MovieBox, &id).await.ok();
    let sibling_ids = details.as_ref().map(|d| d.sibling_ids()).unwrap_or_default();

    let subs = state
        .service
        .get_ext_captions(&id, &resource_id, &sibling_ids, season, episode)
        .await
        .unwrap_or_default();

    let formatted = subs
        .into_iter()
        .map(|sub| {
            let encoded_url = percent_encoding::utf8_percent_encode(
                &sub.url,
                percent_encoding::NON_ALPHANUMERIC,
            )
            .to_string();
            let vtt_url = format!("/api/subtitles/vtt?url={encoded_url}");
            FormattedSubtitle {
                name: sub.name,
                original_url: sub.url,
                vtt_url,
            }
        })
        .collect();

    Ok(Json(formatted))
}

#[derive(Deserialize)]
pub struct VttQuery {
    pub url: String,
}

pub async fn get_vtt_subtitle(
    Query(params): Query<VttQuery>,
) -> Result<Response, (StatusCode, String)> {
    match fetch_and_convert_to_vtt(&params.url).await {
        Ok(vtt_content) => {
            let response = Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "text/vtt; charset=utf-8")
                .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                .header(header::ACCESS_CONTROL_ALLOW_METHODS, "GET, OPTIONS")
                .body(axum::body::Body::from(vtt_content))
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
            Ok(response)
        }
        Err(err) => Err((
            StatusCode::BAD_GATEWAY,
            format!("Failed to retrieve subtitle: {err}"),
        )),
    }
}

pub async fn get_sports() -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(5000))
        .build()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let (events_res, channels_res) = tokio::join!(
        client.get("https://api.cdnlivetv.tv/api/v1/events/sports/?user=cdnlivetv&plan=free").header("User-Agent", "Mozilla/5.0").send(),
        client.get("https://api.cdnlivetv.tv/api/v1/channels/?user=cdnlivetv&plan=free").header("User-Agent", "Mozilla/5.0").send(),
    );

    let events_json: Option<serde_json::Value> = match events_res {
        Ok(res) => res.json().await.ok(),
        Err(_) => None,
    };

    let channels_json: Option<serde_json::Value> = match channels_res {
        Ok(res) => res.json().await.ok(),
        Err(_) => None,
    };

    let mut matches = Vec::new();
    let mut categories = Vec::new();

    if let Some(root) = events_json.and_then(|j| j.get("cdn-live-tv").cloned()) {
        if let Some(obj) = root.as_object() {
            for (sport, val) in obj {
                if sport.starts_with("total_") {
                    continue;
                }
                if let Some(arr) = val.as_array() {
                    categories.push(sport.clone());
                    for ev in arr {
                        let event_title = ev.get("event").and_then(|v| v.as_str()).unwrap_or("Live Match");
                        let channels = ev.get("channels").and_then(|c| c.as_array()).cloned().unwrap_or_default();
                        let has_stream = !channels.is_empty();

                        let mut mapped_channels = Vec::new();
                        for (idx, ch) in channels.iter().enumerate() {
                            let name = ch.get("channel_name").and_then(|n| n.as_str()).map(|s| s.to_string()).unwrap_or_else(|| format!("Server {}", idx + 1));
                            let id_str = ch.get("id").and_then(|i| i.as_str()).map(|s| s.to_string()).unwrap_or_else(|| idx.to_string());
                            let proxy_url = format!("/api/sports-stream?name={}", percent_encoding::utf8_percent_encode(&name, percent_encoding::NON_ALPHANUMERIC));
                            mapped_channels.push(serde_json::json!({
                                "id": id_str,
                                "name": name,
                                "url": proxy_url
                            }));
                        }

                        matches.push(serde_json::json!({
                            "id": ev.get("gameID").and_then(|g| g.as_str()).unwrap_or(""),
                            "sport": sport,
                            "event": event_title,
                            "home_team": ev.get("homeTeam").and_then(|h| h.as_str()).unwrap_or(""),
                            "away_team": ev.get("awayTeam").and_then(|a| a.as_str()).unwrap_or(""),
                            "home_logo": ev.get("homeTeamIMG").and_then(|l| l.as_str()).unwrap_or(""),
                            "away_logo": ev.get("awayTeamIMG").and_then(|l| l.as_str()).unwrap_or(""),
                            "tournament": ev.get("tournament").and_then(|t| t.as_str()).unwrap_or(sport),
                            "country": ev.get("country").and_then(|c| c.as_str()).unwrap_or(""),
                            "country_flag": ev.get("countryIMG").and_then(|f| f.as_str()).unwrap_or(""),
                            "start": ev.get("start").and_then(|s| s.as_str()).unwrap_or(""),
                            "time": ev.get("time").and_then(|t| t.as_str()).unwrap_or(""),
                            "status": ev.get("status").and_then(|s| s.as_str()).unwrap_or("upcoming"),
                            "has_stream": has_stream,
                            "channels": mapped_channels
                        }));
                    }
                }
            }
        }
    }

    // Sort: items with streams first
    matches.sort_by(|a, b| {
        let a_has = a.get("has_stream").and_then(|v| v.as_bool()).unwrap_or(false);
        let b_has = b.get("has_stream").and_then(|v| v.as_bool()).unwrap_or(false);
        b_has.cmp(&a_has)
    });

    let mut sports_tv = Vec::new();
    if let Some(ch_arr) = channels_json.and_then(|j| j.get("channels").and_then(|c| c.as_array()).cloned()) {
        for c in ch_arr {
            let name = c.get("name").and_then(|n| n.as_str()).unwrap_or("");
            let lower = name.to_lowercase();
            if lower.contains("sport") || lower.contains("espn") || lower.contains("tnt")
                || lower.contains("bein") || lower.contains("sky") || lower.contains("fox")
                || lower.contains("dazn") || lower.contains("cricket") || lower.contains("willow")
                || lower.contains("astro") || lower.contains("football") || lower.contains("soccer")
                || lower.contains("premier") || lower.contains("bundesliga") || lower.contains("golazo")
            {
                let proxy_url = format!("/api/sports-stream?name={}", percent_encoding::utf8_percent_encode(name, percent_encoding::NON_ALPHANUMERIC));
                sports_tv.push(serde_json::json!({
                    "name": name,
                    "url": proxy_url,
                    "status": c.get("status").and_then(|s| s.as_str()).unwrap_or("online")
                }));
            }
        }
    }

    // Sort Cricket & Football channels to the very top
    sports_tv.sort_by(|a, b| {
        let name_a = a.get("name").and_then(|n| n.as_str()).unwrap_or("").to_lowercase();
        let name_b = b.get("name").and_then(|n| n.as_str()).unwrap_or("").to_lowercase();

        let is_cric_a = name_a.contains("cricket") || name_a.contains("willow");
        let is_cric_b = name_b.contains("cricket") || name_b.contains("willow");
        if is_cric_a && !is_cric_b { return std::cmp::Ordering::Less; }
        if is_cric_b && !is_cric_a { return std::cmp::Ordering::Greater; }

        let is_foot_a = name_a.contains("premier league") || name_a.contains("football") || name_a.contains("soccer") || name_a.contains("bundesliga");
        let is_foot_b = name_b.contains("premier league") || name_b.contains("football") || name_b.contains("soccer") || name_b.contains("bundesliga");
        if is_foot_a && !is_foot_b { return std::cmp::Ordering::Less; }
        if is_foot_b && !is_foot_a { return std::cmp::Ordering::Greater; }

        std::cmp::Ordering::Equal
    });

    let live_count = matches.iter().filter(|m| m.get("has_stream").and_then(|v| v.as_bool()).unwrap_or(false)).count();
    let total_matches = matches.len();

    Ok(Json(serde_json::json!({
        "total_matches": total_matches,
        "live_count": live_count,
        "categories": categories,
        "matches": matches,
        "channels": sports_tv
    })))
}

#[derive(Debug, Deserialize)]
pub struct SportsStreamQuery {
    pub name: Option<String>,
}

fn extract_stream_url(html: &str) -> Option<String> {
    use base64::Engine;
    let line = html.lines().find(|l| l.contains(";var ") && l.contains('(') && l.contains('+'))?;
    let mut chunks = Vec::new();
    let mut rest = line;
    while let Some(start) = rest.find('\'') {
        let after_start = &rest[start + 1..];
        if let Some(end) = after_start.find('\'') {
            chunks.push(&after_start[..end]);
            rest = &after_start[end + 1..];
        } else {
            break;
        }
    }
    if chunks.len() < 5 {
        return None;
    }
    let mut decoded = String::new();
    for chunk in chunks {
        let mut s = chunk.replace('-', "+").replace('_', "/");
        while s.len() % 4 != 0 {
            s.push('=');
        }
        if let Ok(bytes) = base64::engine::general_purpose::STANDARD.decode(&s) {
            if let Ok(text) = String::from_utf8(bytes) {
                decoded.push_str(&text);
            }
        }
    }
    if decoded.starts_with("https://") && decoded.contains(".m3u8") {
        Some(decoded)
    } else {
        None
    }
}

fn generate_clean_player_html(channel_name: &str, stream_url: Option<&str>) -> String {
    let url_str = stream_url.unwrap_or("");
    format!(
r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>{channel_name}</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js"></script>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    html, body {{
      width: 100%; height: 100%; background: #000;
      overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }}
    #playerContainer {{
      position: relative; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center; background: #000;
    }}
    video {{
      width: 100%; height: 100%; object-fit: contain; background: #000;
    }}
    .live-top-bar {{
      position: absolute; top: 12px; left: 14px; right: 14px;
      display: flex; align-items: center; justify-content: space-between;
      pointer-events: none; z-index: 20;
    }}
    .live-pill {{
      display: inline-flex; align-items: center; gap: 7px;
      background: rgba(14, 20, 36, 0.88); backdrop-filter: blur(10px);
      padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.18);
      font-size: 12px; font-weight: 700; color: #fff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
    }}
    .live-dot {{
      width: 7px; height: 7px; background: #ff2a2a; border-radius: 50%;
      box-shadow: 0 0 8px #ff2a2a; animation: pulse 1.4s infinite;
    }}
    @keyframes pulse {{ 0% {{ opacity: 1; transform: scale(1); }} 50% {{ opacity: 0.3; transform: scale(0.8); }} 100% {{ opacity: 1; transform: scale(1); }} }}
    .status-overlay {{
      position: absolute; inset: 0;
      background: rgba(6, 10, 18, 0.95);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #fff; z-index: 10; text-align: center; padding: 20px;
      transition: opacity 0.3s ease;
    }}
    .status-overlay.hidden {{ opacity: 0; pointer-events: none; }}
    .spinner {{
      width: 44px; height: 44px; border: 3.5px solid rgba(229, 9, 20, 0.2);
      border-top-color: #e50914; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin-bottom: 16px;
    }}
    @keyframes spin {{ to {{ transform: rotate(360deg); }} }}
    .status-title {{ font-size: 17px; font-weight: 700; margin-bottom: 6px; }}
    .status-desc {{ font-size: 13px; color: #8899a6; max-width: 360px; line-height: 1.4; }}
    .reload-btn {{
      margin-top: 16px; background: #e50914; color: #fff; border: none;
      font-size: 13px; font-weight: 700; padding: 9px 22px; border-radius: 20px;
      cursor: pointer; box-shadow: 0 4px 14px rgba(229, 9, 20, 0.4);
      pointer-events: auto;
    }}
    @media (max-width: 600px) {{
      .live-top-bar {{ top: 8px; left: 8px; right: 8px; }}
      .live-pill {{ font-size: 11px; padding: 4px 10px; }}
      .status-title {{ font-size: 15px; }}
      .status-desc {{ font-size: 12px; }}
    }}
  </style>
</head>
<body>
  <div id="playerContainer">
    <div class="live-top-bar">
      <div class="live-pill">
        <span class="live-dot"></span>
        <span>LIVE • {channel_name}</span>
      </div>
    </div>

    <div class="status-overlay" id="statusOverlay">
      <div class="spinner" id="spinner"></div>
      <div class="status-title" id="statusTitle">Connecting Live Broadcast...</div>
      <div class="status-desc" id="statusDesc">Establishing direct HD sports feed</div>
      <button class="reload-btn" id="reloadBtn" style="display:none;" onclick="location.reload()">Retry Stream</button>
    </div>

    <video id="videoPlayer" controls autoplay playsinline preload="auto"></video>
  </div>

  <script>
    const streamUrl = "{url_str}";
    const video = document.getElementById('videoPlayer');
    const overlay = document.getElementById('statusOverlay');
    const spinner = document.getElementById('spinner');
    const statusTitle = document.getElementById('statusTitle');
    const statusDesc = document.getElementById('statusDesc');
    const reloadBtn = document.getElementById('reloadBtn');

    function showError(msg, sub) {{
      if (overlay) {{
        overlay.classList.remove('hidden');
        if (spinner) spinner.style.display = 'none';
        if (statusTitle) statusTitle.textContent = msg || 'Broadcast Unavailable';
        if (statusDesc) statusDesc.textContent = sub || 'Stream is offline or reconnecting.';
        if (reloadBtn) reloadBtn.style.display = 'inline-block';
      }}
    }}

    function hideOverlay() {{
      if (overlay) overlay.classList.add('hidden');
    }}

    if (!streamUrl || streamUrl === 'null' || streamUrl.length < 10) {{
      showError('Stream Currently Offline', 'This match/channel is preparing its feed. Please check back shortly.');
    }} else if (Hls.isSupported()) {{
      const hls = new Hls({{
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 30,
        manifestLoadingMaxRetry: 6,
        manifestLoadingRetryDelay: 1000,
        levelLoadingMaxRetry: 5,
        fragLoadingMaxRetry: 6
      }});
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function() {{
        video.play().catch(function() {{
          video.muted = true;
          video.play();
        }});
        setTimeout(hideOverlay, 400);
      }});

      hls.on(Hls.Events.ERROR, function(event, data) {{
        if (data.fatal) {{
          switch (data.type) {{
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              showError('Reconnecting Stream...', 'Attempting to resume broadcast.');
              setTimeout(function() {{ hls.startLoad(); }}, 2000);
              break;
          }}
        }}
      }});
    }} else if (video.canPlayType('application/vnd.apple.mpegurl')) {{
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', function() {{
        video.play().catch(function() {{
          video.muted = true;
          video.play();
        }});
        hideOverlay();
      }});
      video.onerror = function() {{
        showError('Stream Offline', 'Could not play stream on this device.');
      }};
    }}

    video.addEventListener('playing', hideOverlay);
  </script>
</body>
</html>"#
    )
}

pub async fn get_sports_stream(
    Query(query): Query<SportsStreamQuery>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let channel_name = query.name.unwrap_or_else(|| "Sky Sports Cricket FHD UK".to_string());
    let target = format!(
        "https://cdnlivetv.tv/api/v1/channels/player/?name={}&code=&user=cdnlivetv&plan=free",
        percent_encoding::utf8_percent_encode(&channel_name, percent_encoding::NON_ALPHANUMERIC)
    );

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let res = client
        .get(&target)
        .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .header("Referer", "https://cdnlivetv.tv/")
        .send()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))?;

    if !res.status().is_success() {
        let fallback = generate_clean_player_html(&channel_name, None);
        return Ok((
            StatusCode::OK,
            [
                ("Content-Type", "text/html; charset=utf-8"),
                ("Access-Control-Allow-Origin", "*"),
                ("Cache-Control", "no-cache, no-store, must-revalidate"),
            ],
            fallback,
        ));
    }

    let html = res.text().await.unwrap_or_default();
    let stream_url = extract_stream_url(&html);

    let output_html = if let Some(ref url) = stream_url {
        generate_clean_player_html(&channel_name, Some(url))
    } else {
        // Fallback: bypass sandbox and _head check in original player if stream extraction didn't find chunks
        let mut safe_html = html;
        if let Some(start) = safe_html.find("// Sandbox iframe detection") {
            if let Some(end) = safe_html[start..].find("})();") {
                safe_html.replace_range(start..=start + end + 4, "/* sandbox bypassed */");
            }
        }
        if let Some(start) = safe_html.find("function _head(u){") {
            if let Some(end) = safe_html[start..].find("}") {
                safe_html.replace_range(start..=start + end, "function _head(u){return Promise.resolve(200);}");
            }
        }
        safe_html
    };

    Ok((
        StatusCode::OK,
        [
            ("Content-Type", "text/html; charset=utf-8"),
            ("Access-Control-Allow-Origin", "*"),
            ("Cache-Control", "no-cache, no-store, must-revalidate"),
        ],
        output_html,
    ))
}
