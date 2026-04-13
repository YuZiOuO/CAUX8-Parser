mod upload;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![upload::upload_problem])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
