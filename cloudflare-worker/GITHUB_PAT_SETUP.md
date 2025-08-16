# GitHub Fine-grained Personal Access Token (PAT) 設定手順

## 1. GitHub PATの作成

1. GitHubにログイン → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. "Generate new token" をクリック
3. 以下の設定を行う：

### 基本設定
- **Token name**: `gluten-free-map-auto-updater`
- **Expiration**: 1 year (または適切な期間)
- **Resource owner**: kanakugimakoto
- **Selected repositories**: `gluten-free-map-simple` のみ

### 権限設定 (Repository permissions)
- **Contents**: Read and write
- **Metadata**: Read
- **Pull requests**: Write (必要に応じて)

## 2. Cloudflare Workerでのシークレット設定

```bash
# Cloudflare Workerにシークレットを設定
cd cloudflare-worker
npx wrangler secret put GITHUB_TOKEN
# ↑ プロンプトで作成したPATを入力
```

## 3. デプロイ前の確認

```bash
# 設定確認
npx wrangler whoami
npx wrangler secret list

# ローカルテスト
npx wrangler dev --local
```

## 4. 本番デプロイ

```bash
npx wrangler deploy
```

## セキュリティ注意事項

- ✅ PATは最小権限の設定（Contents: Read/Write のみ）
- ✅ 特定のリポジトリのみにアクセス制限
- ✅ 定期的なローテーション（1年以内）
- ✅ Cloudflare Workerのシークレット管理でブラウザから隠蔽
- ⚠️ PATをコードやコミットに含めない

## トラブルシューティング

### よくあるエラー
1. **403 Forbidden**: PAT権限不足
2. **404 Not Found**: リポジトリ名またはファイルパス間違い
3. **422 Unprocessable Entity**: SHA不一致（同時更新の競合）

### デバッグ方法
```bash
# Worker ログ確認
npx wrangler tail

# ローカルでのテスト実行
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"stores": [{"id": 1, "name": "test"}], "commitMessage": "Test update"}'
```