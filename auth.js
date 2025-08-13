// 認証関連の処理
let currentUser = null;

// DOM要素の取得
document.addEventListener('DOMContentLoaded', function() {
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginContainer = document.getElementById('loginContainer');
    const app = document.getElementById('app');
    
    // Googleログインボタンのイベント
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    // ログアウトボタンのイベント
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 認証状態の監視
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // ログイン済み
            checkAuthorization(user);
        } else {
            // 未ログイン
            showLoginScreen();
        }
    });
});

// Googleログイン処理
async function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        // メールアドレスの承認チェック
        if (isAuthorizedEmail(user.email)) {
            currentUser = user;
            showApp(user);
        } else {
            // 承認されていないメールアドレス
            await firebase.auth().signOut();
            showUnauthorizedMessage();
        }
    } catch (error) {
        console.error('ログインエラー:', error);
        showErrorMessage('ログインに失敗しました。もう一度お試しください。');
    }
}

// メールアドレスの承認チェック
function isAuthorizedEmail(email) {
    return AUTHORIZED_EMAILS.includes(email);
}

// 承認チェック
function checkAuthorization(user) {
    if (isAuthorizedEmail(user.email)) {
        currentUser = user;
        showApp(user);
    } else {
        firebase.auth().signOut();
        showUnauthorizedMessage();
    }
}

// アプリ画面の表示
function showApp(user) {
    const loginContainer = document.getElementById('loginContainer');
    const app = document.getElementById('app');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAvatar = document.getElementById('userAvatar');
    
    // ログイン画面を非表示
    if (loginContainer) {
        loginContainer.style.display = 'none';
    }
    
    // アプリ画面を表示
    if (app) {
        app.style.display = 'block';
    }
    
    // ユーザー情報の表示
    if (userName) {
        userName.textContent = user.displayName || 'メンバー';
    }
    if (userEmail) {
        userEmail.textContent = user.email;
    }
    if (userAvatar && user.photoURL) {
        userAvatar.src = user.photoURL;
    }
    
    // マップとデータの初期化
    if (typeof initializeApp === 'function') {
        initializeApp();
    }
}

// ログイン画面の表示
function showLoginScreen() {
    const loginContainer = document.getElementById('loginContainer');
    const app = document.getElementById('app');
    
    if (loginContainer) {
        loginContainer.style.display = 'flex';
    }
    if (app) {
        app.style.display = 'none';
    }
}

// 未承認メッセージの表示
function showUnauthorizedMessage() {
    alert('申し訳ございません。このメールアドレスは承認されていません。\nコミュニティメンバー登録済みのGoogleアカウントでログインしてください。');
    showLoginScreen();
}

// エラーメッセージの表示
function showErrorMessage(message) {
    alert(message);
}

// ログアウト処理
async function handleLogout() {
    try {
        await firebase.auth().signOut();
        currentUser = null;
        showLoginScreen();
    } catch (error) {
        console.error('ログアウトエラー:', error);
        showErrorMessage('ログアウトに失敗しました。');
    }
}

// 現在のユーザー取得
function getCurrentUser() {
    return currentUser;
}