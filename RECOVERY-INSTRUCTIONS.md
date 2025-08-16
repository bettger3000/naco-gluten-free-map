# 🆘 緊急復旧手順

## バックアップ情報
- **バックアップ日時**: 2025-08-15
- **タグ名**: `stable-before-pin-auth`
- **コミットID**: `70f1c9b`
- **バックアップ内容**: 画像機能実装完了後、PINコード認証導入前の安定版

## 復旧方法

### 方法1: Gitタグから復旧（推奨）
```bash
# 現在の変更を破棄して、バックアップ時点に戻す
git fetch origin
git reset --hard stable-before-pin-auth
git push origin main --force
```

### 方法2: 特定コミットから復旧
```bash
# コミットIDを指定して復旧
git reset --hard 70f1c9b
git push origin main --force
```

### 方法3: ローカルバックアップから復旧
```bash
# ローカルバックアップファイルから復元
cp index.html.backup-before-pin index.html
git add index.html
git commit -m "PINコード認証前の状態に復旧"
git push origin main
```

### 方法4: GitHubから直接復旧
1. GitHubにアクセス: https://github.com/bettger3000/naco-gluten-free-map
2. タグ一覧を表示: https://github.com/bettger3000/naco-gluten-free-map/tags
3. `stable-before-pin-auth`タグをクリック
4. index.htmlファイルの内容をコピー
5. ローカルのindex.htmlに上書き保存
6. コミット＆プッシュ

## 現在の安定機能一覧
✅ Google認証（デモモード動作）
✅ 店舗リスト表示
✅ 地図表示・検索・フィルター  
✅ 訪問履歴機能（行きたい・行った）
✅ 画像表示・アップロード機能（3枚まで）
✅ モバイル対応UI

## 注意事項
- 復旧前に現在の作業内容を別ブランチに保存することを推奨
- `--force`オプションは慎重に使用すること
- 復旧後はブラウザのキャッシュをクリアすること

## 問題が解決しない場合
1. 別のバックアップタグを確認: `git tag -l`
2. コミット履歴を確認: `git log --oneline -10`
3. 前回の安定版タグ: `stable-v1.0`も利用可能