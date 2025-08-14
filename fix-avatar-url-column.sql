-- avatar_url カラムをTEXT型に変更して画像データを保存できるようにする
-- Supabase SQL Editorで実行してください

-- avatar_urlカラムの型をVARCHAR(500)からTEXTに変更
ALTER TABLE user_profiles 
ALTER COLUMN avatar_url TYPE TEXT;

-- 成功メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ avatar_urlカラムの型変更が完了しました';
    RAISE NOTICE '変更内容:';
    RAISE NOTICE '- avatar_url: VARCHAR(500) → TEXT';
    RAISE NOTICE '- Base64エンコードされた画像データも保存可能になりました';
END $$;