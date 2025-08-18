# 🚀 Cloudflare R2 アバターアップロード設定手順

## 📅 実装開始: 2025年8月18日

## ✅ Step 1: Cloudflareアカウント準備

1. [Cloudflare](https://dash.cloudflare.com/)にログイン
2. 左メニューから「R2」を選択

## ✅ Step 2: R2バケット作成

```bash
バケット名: gluten-free-avatars
場所: 自動選択（APAC推奨）
```

### バケット設定:
- Public Access: 有効にする
- カスタムドメイン: avatars.your-domain.com（オプション）

## ✅ Step 3: CORS設定

R2バケット > Settings > CORS policy:

```json
[
  {
    "AllowedOrigins": [
      "https://bettger3000.github.io",
      "http://localhost:*",
      "file://*"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## ✅ Step 4: API Token作成

1. R2 > Manage API tokens
2. Create API token
3. 権限:
   - Object Read & Write
   - バケット: gluten-free-avatars

## ✅ Step 5: Cloudflare Worker作成

Workers & Pages > Create Worker

ファイル名: `avatar-upload-worker`

## 📝 必要な情報（控えておく）

```javascript
// これらの値をメモ
const ACCOUNT_ID = "your-account-id";
const ACCESS_KEY_ID = "your-access-key";  
const SECRET_ACCESS_KEY = "your-secret-key";
const BUCKET_NAME = "gluten-free-avatars";
const R2_URL = "https://your-account.r2.cloudflarestorage.com";
```

## 🔄 復元方法

問題発生時:
```bash
git checkout v2.0-stable-before-cloudflare
```

## 📞 サポート

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Workers Docs](https://developers.cloudflare.com/workers/)