-- user_profilesテーブルにアバタータイプと絵文字フィールドを追加
-- Supabaseで実行してください

-- 既存テーブルにカラムを追加
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_type VARCHAR(10) DEFAULT 'emoji' CHECK (avatar_type IN ('emoji', 'image'));

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_emoji VARCHAR(10) DEFAULT '🍰';

-- 既存データの初期化（必要に応じて）
UPDATE user_profiles 
SET avatar_type = 'emoji', avatar_emoji = '🍰' 
WHERE avatar_type IS NULL;

-- 成功メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ user_profilesテーブルの拡張が完了しました';
    RAISE NOTICE 'カラム追加:';
    RAISE NOTICE '- avatar_type: アバタータイプ（emoji/image）';
    RAISE NOTICE '- avatar_emoji: 絵文字アバター';
    RAISE NOTICE '- avatar_url: 画像アバター（既存）';
END $$;