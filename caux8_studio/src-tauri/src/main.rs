mod auth;
mod runtime_error;
mod upload;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            auth::resolve_caux8_session,
            upload::upload_problem
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
