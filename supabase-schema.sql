-- 1. 店舗カテゴリテーブル
CREATE TABLE store_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(7),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 店舗マスターテーブル
CREATE TABLE stores (
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
CREATE TABLE user_profiles (
    email VARCHAR(255) PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 訪問履歴テーブル
CREATE TABLE visit_history (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) REFERENCES user_profiles(email),
    store_id INTEGER REFERENCES stores(id),
    status VARCHAR(20) CHECK (status IN ('want_to_go', 'visited')),
    visited_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. 画像テーブル
CREATE TABLE store_images (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    uploaded_by VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. レビューテーブル
CREATE TABLE reviews (
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

-- 初期データ: カテゴリー
INSERT INTO store_categories (name, icon, color, display_order) VALUES
('カフェ', '☕', '#8B4513', 1),
('レストラン', '🍽️', '#FF6347', 2),
('パン屋', '🥐', '#DEB887', 3),
('スイーツ', '🧁', '#FF69B4', 4),
('販売店', '🛒', '#4169E1', 5);

-- 初期データ: サンプル店舗
INSERT INTO stores (name, category_id, address, prefecture, city, latitude, longitude, description, gluten_free_options) VALUES
('グルテンフリーカフェ 渋谷', 1, '東京都渋谷区道玄坂1-2-3', '東京都', '渋谷区', 35.6595, 139.7004, '完全グルテンフリー専門カフェ', 'グルテンフリーパン、ケーキ、パスタ'),
('米粉パン工房 大阪', 3, '大阪府大阪市北区梅田1-1-1', '大阪府', '大阪市', 34.6937, 135.5023, '毎日焼きたての米粉パン', '米粉パン、グルテンフリー食パン、クッキー'),
('オーガニックレストラン 名古屋', 2, '愛知県名古屋市中区栄3-15-33', '愛知県', '名古屋市', 35.1815, 136.9066, 'グルテンフリーメニュー豊富', '米粉うどん、野菜天ぷら、玄米定食'),
('スイーツショップ 福岡', 4, '福岡県福岡市博多区博多駅前2-1-1', '福岡県', '福岡市', 33.5904, 130.4017, '米粉スイーツ専門店', '米粉ケーキ、豆乳アイス、フルーツタルト'),
('自然食品店 札幌', 5, '北海道札幌市中央区大通西4丁目', '北海道', '札幌市', 43.0642, 141.3469, 'グルテンフリー食材豊富', 'グルテンフリー調味料、米粉、アーモンド粉');