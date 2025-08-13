-- シンプルなテーブル作成SQL（RLSなし）
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
    created_at TIMESTAMP DEFAULT NOW()
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

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_visit_history_user_email ON visit_history(user_email);
CREATE INDEX IF NOT EXISTS idx_visit_history_store_id ON visit_history(store_id);
CREATE INDEX IF NOT EXISTS idx_visit_history_status ON visit_history(status);
CREATE INDEX IF NOT EXISTS idx_stores_latitude_longitude ON stores(latitude, longitude);

-- 成功メッセージ
DO $$
BEGIN
    RAISE NOTICE '=================================';
    RAISE NOTICE '✅ テーブル作成完了！';
    RAISE NOTICE '';
    RAISE NOTICE '作成されたテーブル:';
    RAISE NOTICE '- visit_history (行きたい・行った店)';
    RAISE NOTICE '- user_profiles (ユーザー情報)';
    RAISE NOTICE '- stores (店舗マスター)';
    RAISE NOTICE '- store_categories (カテゴリ)';
    RAISE NOTICE '- reviews (レビュー)';
    RAISE NOTICE '- store_images (画像)';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS: 無効（シンプルな実装）';
    RAISE NOTICE '=================================';
END $$;