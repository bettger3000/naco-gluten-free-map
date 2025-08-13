-- RLSを無効化するSQL（正しい方針）
-- 過去の決定：RLSは使わない、シンプルな実装を優先
-- このスクリプトをSupabaseのSQL Editorで実行してください

-- すべてのテーブルのRLSを無効化
ALTER TABLE visit_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_images DISABLE ROW LEVEL SECURITY;

-- 既存のポリシーがあれば削除（クリーンアップ）
DROP POLICY IF EXISTS "誰でも読み取り可能" ON visit_history;
DROP POLICY IF EXISTS "誰でも挿入可能" ON visit_history;
DROP POLICY IF EXISTS "誰でも更新可能" ON visit_history;
DROP POLICY IF EXISTS "誰でも削除可能" ON visit_history;

DROP POLICY IF EXISTS "Allow anonymous read" ON visit_history;
DROP POLICY IF EXISTS "Allow anonymous insert" ON visit_history;
DROP POLICY IF EXISTS "Allow anonymous update" ON visit_history;
DROP POLICY IF EXISTS "Allow anonymous delete" ON visit_history;

DROP POLICY IF EXISTS "誰でも読み取り可能" ON user_profiles;
DROP POLICY IF EXISTS "誰でも挿入可能" ON user_profiles;
DROP POLICY IF EXISTS "誰でも更新可能" ON user_profiles;

DROP POLICY IF EXISTS "Allow anonymous read" ON user_profiles;
DROP POLICY IF EXISTS "Allow anonymous insert" ON user_profiles;
DROP POLICY IF EXISTS "Allow anonymous update" ON user_profiles;

DROP POLICY IF EXISTS "誰でも読み取り可能" ON stores;
DROP POLICY IF EXISTS "Allow anonymous read" ON stores;

DROP POLICY IF EXISTS "誰でも読み取り可能" ON reviews;
DROP POLICY IF EXISTS "誰でも挿入可能" ON reviews;

-- 成功メッセージ
DO $$
BEGIN
    RAISE NOTICE '=================================';
    RAISE NOTICE '✅ RLSを無効化しました';
    RAISE NOTICE '✅ すべてのテーブルがアクセス可能です';
    RAISE NOTICE '✅ シンプルな実装で進められます';
    RAISE NOTICE '';
    RAISE NOTICE '方針：';
    RAISE NOTICE '- RLSは使わない（複雑すぎるため）';
    RAISE NOTICE '- シンプルな実装を優先';
    RAISE NOTICE '- 必要になったら将来追加';
    RAISE NOTICE '=================================';
END $$;