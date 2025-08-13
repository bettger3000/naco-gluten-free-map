-- Supabase用テーブル作成スクリプト
-- このスクリプトをSupabaseのSQL Editorで実行してください

-- 1. 店舗カテゴリテーブル
CREATE TABLE IF NOT EXISTS store_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(7),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 店舗マスターテーブル
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES store_categories(id),
    address TEXT,
    prefecture VARCHAR(50),
    city VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone VARCHAR(20),
    website VARCHAR(500),
    description TEXT,
    gluten_free_options TEXT,
    opening_hours TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. ユーザープロフィールテーブル
CREATE TABLE IF NOT EXISTS user_profiles (
    email VARCHAR(255) PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 訪問履歴テーブル（行きたい・行った店を保存）
CREATE TABLE IF NOT EXISTS visit_history (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) REFERENCES user_profiles(email),
    store_id INTEGER REFERENCES stores(id),
    status VARCHAR(20) CHECK (status IN ('want_to_go', 'visited')),
    visited_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_email, store_id)  -- 同じユーザーが同じ店舗に重複登録を防ぐ
);

-- 5. 画像テーブル
CREATE TABLE IF NOT EXISTS store_images (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    uploaded_by VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. レビューテーブル
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    user_email VARCHAR(255) REFERENCES user_profiles(email),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS (Row Level Security) を有効化
ALTER TABLE visit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成
-- visit_historyテーブルのポリシー
CREATE POLICY "誰でも読み取り可能" ON visit_history
    FOR SELECT USING (true);

CREATE POLICY "誰でも挿入可能" ON visit_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "誰でも更新可能" ON visit_history
    FOR UPDATE USING (true);

CREATE POLICY "誰でも削除可能" ON visit_history
    FOR DELETE USING (true);

-- user_profilesテーブルのポリシー
CREATE POLICY "誰でも読み取り可能" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "誰でも挿入可能" ON user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "誰でも更新可能" ON user_profiles
    FOR UPDATE USING (true);

-- storesテーブルのポリシー
CREATE POLICY "誰でも読み取り可能" ON stores
    FOR SELECT USING (true);

-- reviewsテーブルのポリシー
CREATE POLICY "誰でも読み取り可能" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "誰でも挿入可能" ON reviews
    FOR INSERT WITH CHECK (true);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_visit_history_user_email ON visit_history(user_email);
CREATE INDEX idx_visit_history_store_id ON visit_history(store_id);
CREATE INDEX idx_visit_history_status ON visit_history(status);
CREATE INDEX idx_stores_latitude_longitude ON stores(latitude, longitude);

-- 成功メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ すべてのテーブルが作成されました';
    RAISE NOTICE '✅ RLSポリシーが設定されました';
    RAISE NOTICE '✅ インデックスが作成されました';
END $$;