# Phase 2: 完全自動化システム デプロイガイド

## 🎯 現在の状態

✅ **実装完了:**
- JSONファイル分離（Phase 1）
- Cloudflare Worker コード作成
- 管理画面の自動保存機能実装
- エラーハンドリングとフィードバック表示

⚠️ **デプロイ待ち:**
- GitHub Personal Access Token (PAT) 作成
- Cloudflare Worker デプロイ
- Worker URL の管理画面への設定

---

## 🚀 デプロイ手順

### 1. GitHub PATの作成

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. "Generate new token" をクリック
3. 設定:
   - **Name**: `gluten-free-map-auto-updater`
   - **Expiration**: 1 year
   - **Repository**: `gluten-free-map-simple` のみ
   - **Permissions**: Contents (Read and write)

### 2. Cloudflare Worker デプロイ

```bash
# 1. Cloudflare Worker ディレクトリに移動
cd cloudflare-worker

# 2. Cloudflareにログイン（初回のみ）
npx wrangler login

# 3. GitHub PATをシークレットとして設定
npx wrangler secret put GITHUB_TOKEN
# ↑ 先ほど作成したPATを入力

# 4. デプロイ
npx wrangler deploy
```

### 3. Worker URL の設定

デプロイ完了後、表示されるWorker URLを管理画面に設定:

```javascript
// store-manager.html の以下の行を更新
const CLOUDFLARE_WORKER_URL = 'https://gluten-free-store-updater.[YOUR-SUBDOMAIN].workers.dev';
```

---

## 🧪 テスト手順

### 1. ローカルテスト（オプション）

```bash
cd cloudflare-worker
npx wrangler dev --local

# 別ターミナルでテスト
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"stores": [{"id": 1, "name": "test"}], "commitMessage": "Test update"}'
```

### 2. 本番テスト

1. 管理画面 (store-manager.html) にアクセス
2. 認証 (PIN: 999999)
3. 「自動保存」ボタンをクリック
4. ブラウザの開発者ツールでログを確認
5. GitHubリポジトリでコミットが作成されることを確認

---

## 🔄 完全自動化フロー

```
管理画面で店舗編集
    ↓
「自動保存」ボタンクリック
    ↓
Cloudflare Worker 経由
    ↓
GitHub Contents API でJSONファイル更新
    ↓
GitHub Pages 自動デプロイ
    ↓
3-5分後に本番サイトに反映
```

---

## 🛠️ トラブルシューティング

### よくあるエラー

1. **403 Forbidden**
   - GitHub PAT の権限不足
   - リポジトリアクセス権限確認

2. **CORS エラー**
   - Worker の CORS 設定確認
   - ブラウザの開発者ツールでネットワークタブ確認

3. **Worker URL 404**
   - デプロイが正常に完了しているか確認
   - Worker URL が正しく設定されているか確認

### デバッグ方法

```bash
# Worker ログを確認
npx wrangler tail

# 設定確認
npx wrangler whoami
npx wrangler secret list
```

---

## 📊 期待される効果

- ✅ 手動コピペ作業の完全廃止
- ✅ リアルタイムでの本番反映（3-5分）
- ✅ 履歴管理と安全性確保（Git経由）
- ✅ 無料枠内での運用
- ✅ 管理画面のみでの完結した運用

---

## 🔜 Phase 3 (オプション): レビュー付き更新

必要に応じて、PR作成 → レビュー → マージ の流れに変更可能。