// Supabase接続テストスクリプト
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lywfaolwvkewuouvkzlk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5d2Zhb2x3dmtld3VvdXZremxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM0NjU0MDksImV4cCI6MjAzOTA0MTQwOX0.aT5zfpqFww0fNkwG2VbGJ5AEO86CTPxnKdTyOvY5xNc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
    console.log('🔍 Supabase接続テスト開始...');
    
    try {
        // 1. テーブル存在確認
        console.log('\n1. visit_historyテーブル確認...');
        const { data: tables, error: tableError } = await supabase
            .from('visit_history')
            .select('*')
            .limit(1);
            
        if (tableError) {
            console.error('❌ visit_historyテーブルエラー:', tableError);
        } else {
            console.log('✅ visit_historyテーブル接続成功');
        }
        
        // 2. user_profilesテーブル確認
        console.log('\n2. user_profilesテーブル確認...');
        const { data: profiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);
            
        if (profileError) {
            console.error('❌ user_profilesテーブルエラー:', profileError);
        } else {
            console.log('✅ user_profilesテーブル接続成功');
        }
        
        // 3. storesテーブル確認
        console.log('\n3. storesテーブル確認...');
        const { data: stores, error: storeError } = await supabase
            .from('stores')
            .select('id, name')
            .limit(5);
            
        if (storeError) {
            console.error('❌ storesテーブルエラー:', storeError);
        } else {
            console.log('✅ storesテーブル接続成功:', stores?.length, '件');
        }
        
        // 4. テストデータ挿入
        console.log('\n4. テストデータ挿入テスト...');
        const testUser = 'test_user@example.com';
        
        // まずuser_profilesにテストユーザーを作成
        const { error: insertUserError } = await supabase
            .from('user_profiles')
            .upsert({
                email: testUser,
                nickname: 'テストユーザー',
                is_active: true
            });
            
        if (insertUserError) {
            console.error('❌ ユーザー作成エラー:', insertUserError);
        } else {
            console.log('✅ テストユーザー作成成功');
        }
        
        // visit_historyにテストデータ挿入
        const { data: insertData, error: insertError } = await supabase
            .from('visit_history')
            .insert({
                user_email: testUser,
                store_id: 1,
                status: 'want_to_go',
                notes: 'テストデータ'
            })
            .select();
            
        if (insertError) {
            console.error('❌ 訪問履歴挿入エラー:', insertError);
        } else {
            console.log('✅ 訪問履歴挿入成功:', insertData);
        }
        
        // 5. データ取得テスト
        console.log('\n5. データ取得テスト...');
        const { data: historyData, error: selectError } = await supabase
            .from('visit_history')
            .select('*')
            .eq('user_email', testUser);
            
        if (selectError) {
            console.error('❌ データ取得エラー:', selectError);
        } else {
            console.log('✅ データ取得成功:', historyData?.length, '件');
        }
        
        // 6. クリーンアップ
        console.log('\n6. テストデータクリーンアップ...');
        await supabase.from('visit_history').delete().eq('user_email', testUser);
        await supabase.from('user_profiles').delete().eq('email', testUser);
        console.log('✅ クリーンアップ完了');
        
    } catch (error) {
        console.error('❌ 全体的なエラー:', error);
    }
    
    console.log('\n🏁 Supabase接続テスト完了');
}

if (typeof window === 'undefined') {
    // Node.js環境
    testSupabase();
} else {
    // ブラウザ環境
    window.testSupabase = testSupabase;
    console.log('ブラウザコンソールで testSupabase() を実行してください');
}