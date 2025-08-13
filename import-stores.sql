-- 過去の店舗データをSupabaseに登録
-- まずカテゴリーを追加（存在しない場合）
INSERT INTO store_categories (name, icon, color, display_order) VALUES
('和食', '🍚', '#FF8A80', 6),
('洋食', '🍝', '#81C784', 7)
ON CONFLICT (name) DO NOTHING;

-- 既存の店舗データを削除
DELETE FROM stores WHERE id IN (1,2,3,4,5);

-- 過去の店舗データを追加
INSERT INTO stores (name, category_id, address, prefecture, city, latitude, longitude, phone, description, gluten_free_options) VALUES
(
  'グルテンフリーカフェ 栄',
  (SELECT id FROM store_categories WHERE name = 'カフェ'),
  '愛知県名古屋市中区栄3-15-33',
  '愛知県',
  '名古屋市',
  35.1681,
  136.9066,
  '052-123-4567',
  '完全グルテンフリー専門店。事前予約がおすすめ。',
  'グルテンフリーパン、ケーキ、パスタ'
),
(
  '自然食レストラン みどり',
  (SELECT id FROM store_categories WHERE name = '和食'),
  '愛知県名古屋市東区泉1-23-45',
  '愛知県',
  '名古屋市',
  35.1792,
  136.9154,
  '052-987-6543',
  'オーガニック食材使用。グルテンフリーメニューあり。',
  '米粉うどん、野菜天ぷら、玄米定食'
),
(
  'パン工房 ひまわり',
  (SELECT id FROM store_categories WHERE name = 'パン屋'),
  '愛知県名古屋市西区牛島町6-1',
  '愛知県',
  '名古屋市',
  35.1898,
  136.8776,
  '052-456-7890',
  '毎日焼きたての米粉パンが人気。火曜定休。',
  '米粉パン、グルテンフリー食パン、米粉クッキー'
),
(
  'イタリアン トラットリア',
  (SELECT id FROM store_categories WHERE name = '洋食'),
  '愛知県名古屋市中村区名駅3-26-8',
  '愛知県',
  '名古屋市',
  35.1708,
  136.8816,
  '052-789-0123',
  '本格イタリアンでグルテンフリー対応。要予約。',
  'グルテンフリーピザ、米粉パスタ、リゾット'
),
(
  'スイーツショップ さくら',
  (SELECT id FROM store_categories WHERE name = 'スイーツ'),
  '愛知県名古屋市千種区今池1-8-8',
  '愛知県',
  '名古屋市',
  35.1658,
  136.9298,
  '052-234-5678',
  'アレルギー対応スイーツ専門店。誕生日ケーキも対応。',
  '米粉ケーキ、豆乳アイス、フルーツタルト'
),
(
  '健康食品店 ナチュラル',
  (SELECT id FROM store_categories WHERE name = '販売店'),
  '愛知県名古屋市昭和区御器所2-18-1',
  '愛知県',
  '名古屋市',
  35.1489,
  136.9368,
  '052-345-6789',
  'グルテンフリー食材の品揃え豊富。料理教室も開催。',
  'グルテンフリー調味料、米粉、アーモンド粉'
);