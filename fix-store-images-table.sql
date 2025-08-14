-- store_imagesテーブルのimage_urlカラムをTEXT型に変更
-- Supabase SQL Editorで実行してください

-- 既存のstore_imagesテーブルを削除して再作成
DROP TABLE IF EXISTS store_images;

-- store_imagesテーブルを再作成（image_urlをTEXT型に）
CREATE TABLE store_images (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    uploaded_by VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_store_images_store_id ON store_images(store_id);
CREATE INDEX IF NOT EXISTS idx_store_images_uploaded_by ON store_images(uploaded_by);

-- 成功メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ store_imagesテーブルの修正が完了しました';
    RAISE NOTICE '変更内容:';
    RAISE NOTICE '- image_url: VARCHAR(500) → TEXT';
    RAISE NOTICE '- Base64エンコードされた画像データを保存可能になりました';
    RAISE NOTICE '- インデックスを追加してパフォーマンス向上';
END $$;