-- Instagram列をstoresテーブルに追加するSQL
-- 実行日: 2025-09-01
-- 目的: CSVアップロード機能でInstagram URLが保存できるようにする

-- 1. instagram列をstoresテーブルに追加
ALTER TABLE stores 
ADD COLUMN instagram VARCHAR(500);

-- 2. 新しい列にコメントを追加
COMMENT ON COLUMN stores.instagram IS 'Instagram URL (例: https://instagram.com/storename)';

-- 3. 既存データの確認用クエリ（参考）
-- SELECT id, name, website, instagram FROM stores LIMIT 5;

-- 成功メッセージ
DO $$
BEGIN
    RAISE NOTICE '=================================';
    RAISE NOTICE '✅ instagram列の追加完了！';
    RAISE NOTICE '';
    RAISE NOTICE '変更内容:';
    RAISE NOTICE '- stores.instagram VARCHAR(500) 追加';
    RAISE NOTICE '- CSVアップロード機能が利用可能';
    RAISE NOTICE '- 既存データに影響なし';
    RAISE NOTICE '';
    RAISE NOTICE 'SupabaseのSQL Editorで実行してください';
    RAISE NOTICE '=================================';
END $$;