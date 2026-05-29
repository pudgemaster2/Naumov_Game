export interface UserSession {
  email: string;
  uid: string;
}

type AuthCallback = (user: UserSession | null) => void;

class MockAuth {
  private listeners: AuthCallback[] = [];

  constructor() {
    // Listen to changes across tabs if necessary, or just local changes
  }

  private getUsers() {
    const usersJson = localStorage.getItem('rpg_mock_users');
    return usersJson ? JSON.parse(usersJson) : {};
  }

  private saveUsers(users: any) {
    localStorage.setItem('rpg_mock_users', JSON.stringify(users));
  }

  private notify(user: UserSession | null) {
    this.listeners.forEach((callback) => callback(user));
  }

  // Mimics: signInWithEmailAndPassword
  async login(email: string, password: string): Promise<UserSession> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.trim().toLowerCase();
        const users = this.getUsers();
        const user = users[normalizedEmail];

        if (!user || user.password !== password) {
          reject(new Error('Неверный адрес почты или пароль.'));
          return;
        }

        const session: UserSession = { email: normalizedEmail, uid: user.uid };
        localStorage.setItem('rpg_mock_session', JSON.stringify(session));
        this.notify(session);
        resolve(session);
      }, 500); // Simulate network lag
    });
  }

  // Mimics: createUserWithEmailAndPassword
  async register(email: string, password: string): Promise<UserSession> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.trim().toLowerCase();
        
        if (password.length < 6) {
          reject(new Error('Пароль должен состоять минимум из 6 символов.'));
          return;
        }

        const users = this.getUsers();
        if (users[normalizedEmail]) {
          reject(new Error('Пользователь с такой почтой уже зарегистрирован.'));
          return;
        }

        const uid = Math.random().toString(36).substring(2, 11);
        users[normalizedEmail] = { password, uid };
        this.saveUsers(users);

        const session: UserSession = { email: normalizedEmail, uid };
        localStorage.setItem('rpg_mock_session', JSON.stringify(session));
        this.notify(session);
        resolve(session);
      }, 500);
    });
  }

  // Mimics: signOut
  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('rpg_mock_session');
        this.notify(null);
        resolve();
      }, 200);
    });
  }

  // Mimics: auth.currentUser
  getCurrentUser(): UserSession | null {
    const sessionJson = localStorage.getItem('rpg_mock_session');
    if (!sessionJson) return null;
    try {
      return JSON.parse(sessionJson) as UserSession;
    } catch {
      return null;
    }
  }

  // Mimics: onAuthStateChanged
  onAuthStateChange(callback: AuthCallback): () => void {
    this.listeners.push(callback);
    
    // Initial call
    const current = this.getCurrentUser();
    callback(current);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }
}

export const auth = new MockAuth();
