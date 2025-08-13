-- RLSポリシー修正用SQL
-- このスクリプトをSupabaseのSQL Editorで実行してください

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "誰でも読み取り可能" ON visit_history;
DROP POLICY IF EXISTS "誰でも挿入可能" ON visit_history;
DROP POLICY IF EXISTS "誰でも更新可能" ON visit_history;
DROP POLICY IF EXISTS "誰でも削除可能" ON visit_history;

DROP POLICY IF EXISTS "誰でも読み取り可能" ON user_profiles;
DROP POLICY IF EXISTS "誰でも挿入可能" ON user_profiles;
DROP POLICY IF EXISTS "誰でも更新可能" ON user_profiles;

DROP POLICY IF EXISTS "誰でも読み取り可能" ON stores;

-- RLSを一時的に無効化して、再度有効化（クリーンな状態にする）
ALTER TABLE visit_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;

-- RLSを再度有効化
ALTER TABLE visit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- 新しいポリシーを作成（anonロールでもアクセス可能にする）
-- visit_historyテーブル
CREATE POLICY "Allow anonymous read" ON visit_history
    FOR SELECT 
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous insert" ON visit_history
    FOR INSERT 
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON visit_history
    FOR UPDATE 
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous delete" ON visit_history
    FOR DELETE 
    TO anon
    USING (true);

-- user_profilesテーブル  
CREATE POLICY "Allow anonymous read" ON user_profiles
    FOR SELECT 
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous insert" ON user_profiles
    FOR INSERT 
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON user_profiles
    FOR UPDATE 
    TO anon
    USING (true)
    WITH CHECK (true);

-- storesテーブル
CREATE POLICY "Allow anonymous read" ON stores
    FOR SELECT 
    TO anon
    USING (true);

-- 成功メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ RLSポリシーを修正しました';
    RAISE NOTICE '✅ anonロールでもアクセス可能になりました';
END $$;