# Инструкция по переходу на реальный Firebase

Текущая архитектура игры полностью изолирует операции авторизации и сохранения данных в слое сервисов (`src/services/auth.ts` и `src/services/db.ts`). 

Когда вы будете готовы перейти от `localStorage` (Mock-системы) к реальному Firebase, выполните следующие шаги.

---

## Шаг 1: Настройка в консоли Firebase

1. Перейдите в [Консоль Firebase](https://console.firebase.google.com/) и создайте новый проект.
2. **Включите Firebase Authentication**:
   - Перейдите в раздел **Authentication** -> вкладка **Sign-in method**.
   - Нажмите **Add new provider** и выберите **Email/Password** (Электронная почта и пароль).
   - Включите его (первый тумблер) и сохраните.
3. **Включите Cloud Firestore**:
   - Перейдите в раздел **Firestore Database** и нажмите **Create database**.
   - Выберите регион и начните в **Test mode** (Тестовый режим).
   - После создания базы данных перейдите на вкладку **Rules** (Правила) и настройте безопасный доступ:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Пользователь может читать и писать только свой профиль персонажа
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Шаг 2: Установка зависимостей и файла `.env`

1. Установите официальный Firebase Web SDK в проект:
   ```bash
   npm install firebase
   ```
2. Создайте файл `.env` в корневом каталоге проекта (`Naumov Game/`) и заполните его учетными данными вашего Firebase-приложения (вы можете найти их в настройках проекта в консоли Firebase, выбрав пункт "Добавить веб-приложение"):
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyA1...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234:web:abcd
   ```

---

## Шаг 3: Инициализация Firebase в коде

Создайте файл `src/firebase.ts`, который инициализирует SDK с использованием переменных окружения Vite:

```typescript
// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## Шаг 4: Замена кода в сервисном слое

Замените содержимое файлов в `src/services/` на вызовы реального API Firebase.

### Замена `src/services/auth.ts`
```typescript
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth as firebaseAuth } from '../firebase';

export interface UserSession {
  email: string;
  uid: string;
}

type AuthCallback = (user: UserSession | null) => void;

class FirebaseAuthService {
  async login(email: string, password: string): Promise<UserSession> {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return {
      email: userCredential.user.email || email,
      uid: userCredential.user.uid
    };
  }

  async register(email: string, password: string): Promise<UserSession> {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return {
      email: userCredential.user.email || email,
      uid: userCredential.user.uid
    };
  }

  async logout(): Promise<void> {
    await firebaseSignOut(firebaseAuth);
  }

  getCurrentUser(): UserSession | null {
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    return {
      email: user.email || '',
      uid: user.uid
    };
  }

  onAuthStateChange(callback: AuthCallback): () => void {
    return onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        callback({ email: user.email || '', uid: user.uid });
      } else {
        callback(null);
      }
    });
  }
}

export const auth = new FirebaseAuthService();
```

### Замена `src/services/db.ts`
```typescript
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db as firestoreDb } from '../firebase';
import type { Character } from '../types';

class FirestoreDatabaseService {
  async loadCharacter(uid: string): Promise<Character | null> {
    const docRef = doc(firestoreDb, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Character;
    }
    return null;
  }

  async saveCharacter(uid: string, character: Character): Promise<void> {
    const docRef = doc(firestoreDb, 'users', uid);
    await setDoc(docRef, character);
  }
}

export const db = new FirestoreDatabaseService();
```

После этого игра начнет сохранять всех персонажей в реальную облачную базу данных Firestore, а учетные записи будут управляться сервисом авторизации Firebase!
