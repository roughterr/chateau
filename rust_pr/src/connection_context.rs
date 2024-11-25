pub struct ConnectionContext {
    authenticated: bool,
    current_user_login: String
}

impl ConnectionContext {
    // Constructor to create a new instance of ConnectionContext
    pub fn new() -> Self {
        ConnectionContext {
            current_user_login: "".to_string(),
            authenticated: false,
        }
    }

    // Getter method for current_user_login
    pub fn get_current_user_login(&self) -> &str {
        &self.current_user_login
    }

    // Getter method for the authentication status
    pub fn is_authenticated(&self) -> bool {
        self.authenticated
    }

    // Method to authenticate the user
    pub fn authenticate(&mut self, username: String) {
        // For simplicity, we assume the user is authenticated here
        // You could add logic to authenticate based on a password or other factors
        self.authenticated = true;
        self.current_user_login = username;
    }

    // Method to log out the user
    pub fn logout(&mut self) {
        self.authenticated = false;
        self.current_user_login = "".to_string();
    }
}