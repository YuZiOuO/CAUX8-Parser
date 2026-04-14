mod auth;
mod runtime_error;
mod upload;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            auth::resolve_caux8_session,
            upload::submit_problem
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
