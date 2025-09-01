🔍 グルテンフリーマップ - 完全フォレンジック解析結果

  実行日時: 2025年8月24日 13:56調査方法:
  コード直接解析、ファイル構造検証、実環境確認

  📍 実際のライブURL（100%確認済み）

  - メインアプリ: https://bettger3000.github.io/naco-gluten-free-map/
  - 最終更新: 2025年8月24日 03:15:08 GMT
  - ファイルサイズ: 672,459バイト（660KB）
  - HTTP Status: 200 OK（正常稼働中）

  🏗️ Gitリポジトリ情報

  - GitHub: https://github.com/bettger3000/naco-gluten-free-map.git
  - ブランチ: main
  - ローカルディレクトリ: /Users/kanakugimakoto/gluten-free-map-simple/

  💾 データベース・ストレージ（コードから抽出）

  Supabase PostgreSQL

  const SUPABASE_URL = 'https://hxrmsjfvgctoaxpbukvo.supabase.co';
  const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh
  4cm1zamZ2Z2N0b2F4cGJ1a3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTI3NTAsImV4
  cCI6MjA3MDQ4ODc1MH0.tM1vDVVhYhh7OHlA1BTj071BfsIzeBG_HatijjtxwLw';

  Cloudflare Workers & R2

  const AVATAR_WORKER_URL =
  'https://avatar-upload-worker.bettger1000.workers.dev';
  PUBLIC_URL = "https://pub-42410d5d2a514b56a139d945cf8eb47f.r2.dev"
  bucket_name = "gluten-free-avatars"
  KV_ID = "8301c0acb1bf44ab9364741e142ff417"
  ALLOWED_ORIGINS =
  "https://bettger3000.github.io,http://localhost:3000,file://"

  🌐 外部サービス・CDN（実際にロードされる）

  1. https://fonts.googleapis.com - Google Fonts
  2. https://fonts.gstatic.com - Google Fonts Static
  3. https://unpkg.com/leaflet@1.9.4/dist/leaflet.css - Leaflet CSS
  4. https://unpkg.com/leaflet@1.9.4/dist/leaflet.js - Leaflet JS
  5.
  https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css
   - Font Awesome
  6. https://unpkg.com/@supabase/supabase-js@2 - Supabase Client
  7. https://api.dicebear.com/7.x/avataaars/svg - アバター生成API

  📁 プロジェクトファイル構造（実ファイル数）

  /Users/kanakugimakoto/gluten-free-map-simple/ (88ファイル)
  ├── index.html (メイン) - 672,459バイト, 16,272行
  ├── nacoキャラクター.png - 172,766バイト
  ├── HTMLファイル: 64個
  ├── JavaScriptファイル: 8個（node_modules除く）
  ├── SQLファイル: 12個
  ├── JSONファイル: 12個（node_modules除く）
  └── cloudflare-worker/
      └── avatar-upload-worker/
          ├── src/index.js
          ├── wrangler.toml
          └── package.json

  🏪 店舗データ（実データ）

  - embeddedStores.json: 62店舗（801行）
  - real-stores.json: 62店舗（同じデータセット）
  - エリア: 全国（名古屋中心）
  - カテゴリ: 和食、販売店、カフェ、パン屋など

  🔐 認証・セキュリティ

  - 承認済みメール: 3件（authorized-emails.json）
  - PINシステム: 4桁コード認証
  - 管理者PIN: 9999（コード内確認）
  - セッション: LocalStorage管理

  ⚙️ 技術スタック（実装確認済み）

  - フロントエンド: HTML5 + Vanilla JavaScript
  - マップ: Leaflet.js + OpenStreetMap
  - スタイル: 純粋CSS（外部フレームワーク不使用）
  - データベース: Supabase PostgreSQL（RLS無効）
  - ストレージ: Cloudflare R2
  - API: Cloudflare Workers
  - ホスティング: GitHub Pages

  🔄 サービス稼働状況

  - ✅ GitHub Pages: 正常稼働
  - ✅ Supabase: 接続確認済み
  - ✅ Cloudflare Workers: エンドポイント存在確認
  - ✅ 外部CDN: 全て正常応答

  📊 データ統計（実測値）

  - 総ファイル数: 88ファイル
  - メインアプリサイズ: 672,459バイト
  - 店舗データ: 62店舗
  - HTMLファイル: 64個（バックアップ含む）
  - 承認済みユーザー: 3名
