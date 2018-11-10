// Exercise: Error Handling Patterns
//
// Senior-level concepts: Result/Option combinators, custom error types,
// the ? operator, and From conversions.

use std::fmt;
use std::fs::File;
use std::io::{self, Read};

// Custom error type implementing the Error trait
#[derive(Debug)]
enum AppError {
    ConfigNotFound(String),
    InvalidConfig(String),
    IoError(io::Error),
    ParseError(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AppError::ConfigNotFound(path) => write!(f, "config file not found: {path}"),
            AppError::InvalidConfig(msg) => write!(f, "invalid configuration: {msg}"),
            AppError::IoError(e) => write!(f, "I/O error: {e}"),
            AppError::ParseError(msg) => write!(f, "parse error: {msg}"),
        }
    }
}

impl std::error::Error for AppError {}

// From conversions let the ? operator work across error types
impl From<io::Error> for AppError {
    fn from(e: io::Error) -> Self {
        AppError::IoError(e)
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::ParseError(e.to_string())
    }
}

// Demonstrates Result combinators
fn parse_port(raw: &str) -> Result<u16, AppError> {
    raw.trim()
        .parse::<u16>()
        .map_err(|_| AppError::InvalidConfig(format!("invalid port: {raw}")))
}

fn load_and_validate(path: &str) -> Result<u16, AppError> {
    // ? operator propagates errors with automatic From conversions
    let mut file = File::open(path).map_err(|_| AppError::ConfigNotFound(path.into()))?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    parse_port(contents.as_str())
}

fn main() {
    // Option combinators
    let maybe_port: Option<&str> = None;
    let port = maybe_port
        .map(|s| s.parse::<u16>().ok())
        .flatten()
        .unwrap_or(8080);
    println!("Fallback port: {port}");

    let result = load_and_validate("/nonexistent/config.toml");
    match result {
        Ok(p) => println!("Loaded port {p}"),
        Err(e) => println!("Failed gracefully: {e}"),
    }
}
