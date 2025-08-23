# 🚀 プロフィール管理システム設定手順

## ⚡ 実行する順番

1. **KVネームスペース作成** → 2. **wrangler.toml更新** → 3. **デプロイ** → 4. **テスト**

## 📋 詳細手順

### Step 1: Cloudflare KVネームスペースの作成

```bash
# avatar-upload-workerディレクトリに移動
cd /Users/kanakugimakoto/gluten-free-map-simple/cloudflare-worker/avatar-upload-worker

# KVネームスペースを作成
wrangler kv:namespace create "PROFILE_KV"
```

**実行結果例**:
```
🌀  Creating namespace with title "avatar-upload-worker-PROFILE_KV"
✨  Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "PROFILE_KV", id = "abcd1234efgh5678ijkl9012mnop3456" }
```

### Step 2: プレビュー用KVネームスペースの作成

```bash
# プレビュー用のネームスペースも作成
wrangler kv:namespace create "PROFILE_KV" --preview
```

**実行結果例**:
```
🌀  Creating namespace with title "avatar-upload-worker-PROFILE_KV_preview"
✨  Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "PROFILE_KV", preview_id = "wxyz7890abcd1234efgh5678ijkl9012" }
```

### Step 3: wrangler.tomlの更新

上記の結果をもとに、`wrangler.toml`のKV設定を更新してください：

```toml
[[kv_namespaces]]
binding = "PROFILE_KV"
id = "abcd1234efgh5678ijkl9012mnop3456"          # Step 1で取得したID
preview_id = "wxyz7890abcd1234efgh5678ijkl9012"   # Step 2で取得したID
```

### Step 4: Workerのデプロイ

```bash
# Workerをデプロイ
wrangler deploy
```

**実行結果例**:
```
 ⛅️ wrangler 3.x.x
------------------
Total Upload: 15.82 KiB / gzip: 4.23 KiB
Uploaded avatar-upload-worker (1.23 sec)
Published avatar-upload-worker (2.34 sec)
  https://avatar-upload-worker.your-account.workers.dev
Current Deployment ID: abcd1234-efgh-5678-ijkl-9012mnop3456
```

### Step 5: テスト

デプロイ後、以下のエンドポイントでテストできます：

```bash
# プロフィール取得テスト
curl "https://avatar-upload-worker.your-account.workers.dev/profile?email=test@example.com"

# プロフィール保存テスト
curl -X POST https://avatar-upload-worker.your-account.workers.dev/profile \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","nickname":"テストユーザー"}'
```

## 🎯 新機能の説明

### 追加されたエンドポイント

1. **GET /profile?email=xxx** - プロフィール取得
2. **POST /profile** - プロフィール新規作成
3. **PUT /profile** - プロフィール更新

### Workers KVの利点

- **高速アクセス**: エッジからの瞬時レスポンス
- **競合回避**: アトミックな読み書き操作
- **グローバル配信**: 世界中で同期されたデータ
- **コスト効率**: 使用量ベースの料金

### データ構造

```javascript
{
  "email": "user@example.com",
  "nickname": "ユーザー名",
  "avatar": "default",
  "avatarType": "preset",
  "avatarUrl": "https://...",
  "bio": "自己紹介",
  "createdAt": "2024-08-23T10:00:00.000Z",
  "updatedAt": "2024-08-23T10:30:00.000Z"
}
```

## 🛠️ トラブルシューティング

### wranglerがインストールされていない場合:
```bash
npm install -g wrangler
wrangler login
```

### デプロイエラーが発生した場合:
```bash
wrangler whoami  # ログイン状態確認
wrangler dev     # ローカルでテスト
```

## 🎯 完全な実行コマンド（コピー&ペースト用）

以下のコマンドを順番に実行してください：

```bash
# 1. ディレクトリに移動
cd /Users/kanakugimakoto/gluten-free-map-simple/cloudflare-worker/avatar-upload-worker

# 2. KVネームスペース作成
wrangler kv:namespace create "PROFILE_KV"
wrangler kv:namespace create "PROFILE_KV" --preview

# 3. 出力されたIDをwrangler.tomlに手動で設定
# [[kv_namespaces]]
# binding = "PROFILE_KV"
# id = "ここに本番ID"
# preview_id = "ここにプレビューID"

# 4. デプロイ
wrangler deploy

# 5. テスト
curl "https://avatar-upload-worker.bettger1000.workers.dev/profile?email=test@example.com"
```

## ✅ 成功確認

以下が表示されれば成功です：

```json
{
  "profile": {
    "email": "test@example.com",
    "nickname": "test",
    "avatar": "default",
    "avatarType": "preset",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=test%40example.com",
    "bio": "",
    "createdAt": "2024-08-23T...",
    "updatedAt": "2024-08-23T..."
  }
}
```

## 🔧 フロントエンド自動切り替え

デプロイ完了後、フロントエンドは自動的にCloudflareを使用します：
- `USE_CLOUDFLARE_PROFILES = true` （既に設定済み）
- Supabaseとの競合が完全に解決されます