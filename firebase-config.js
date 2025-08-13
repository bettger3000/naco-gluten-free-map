// Firebase設定
// ※以下の設定を実際のFirebaseプロジェクトの設定に置き換えてください
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// 承認済みメールアドレスリスト
// ※実際の運用では、Firebaseのデータベースで管理することを推奨
const AUTHORIZED_EMAILS = [
    // ここに承認済みメールアドレスを追加
    "example1@gmail.com",
    "example2@gmail.com",
    "example3@gmail.com"
    // ... 他のメンバーのメールアドレス
];