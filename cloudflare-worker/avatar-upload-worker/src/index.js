export default {
  async fetch(request, env) {
    // CORSヘッダー設定
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    };

    // OPTIONSリクエスト（CORS preflight）への対応
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    try {
      // ルーティング
      if (url.pathname === '/upload' && request.method === 'POST') {
        return await handleUpload(request, env, corsHeaders);
      } else if (url.pathname === '/presigned-url' && request.method === 'POST') {
        return await generatePresignedUrl(request, env, corsHeaders);
      } else if (url.pathname.startsWith('/avatar/') && request.method === 'GET') {
        return await getAvatar(request, env, corsHeaders);
      } else if (url.pathname === '/reviews' && request.method === 'GET') {
        return await getReviews(request, env, corsHeaders);
      } else if (url.pathname === '/reviews' && request.method === 'POST') {
        return await saveReview(request, env, corsHeaders);
      } else if (url.pathname === '/reviews' && request.method === 'PUT') {
        return await updateReview(request, env, corsHeaders);
      } else if (url.pathname === '/reviews' && request.method === 'DELETE') {
        return await deleteReview(request, env, corsHeaders);
      } else if (url.pathname === '/profile' && request.method === 'GET') {
        return await getProfile(request, env, corsHeaders);
      } else if (url.pathname === '/profile' && request.method === 'POST') {
        return await saveProfile(request, env, corsHeaders);
      } else if (url.pathname === '/profile' && request.method === 'PUT') {
        return await updateProfile(request, env, corsHeaders);
      } else if (url.pathname === '/store-images' && request.method === 'GET') {
        return await getStoreImages(request, env, corsHeaders);
      } else if (url.pathname === '/store-images' && request.method === 'POST') {
        return await saveStoreImages(request, env, corsHeaders);
      } else if (url.pathname === '/store-images' && request.method === 'PUT') {
        return await updateStoreImages(request, env, corsHeaders);
      } else if (url.pathname === '/store-images' && request.method === 'DELETE') {
        return await deleteStoreImages(request, env, corsHeaders);
      } else if (url.pathname === '/stores' && request.method === 'GET') {
        return await getStores(request, env, corsHeaders);
      } else if (url.pathname === '/stores' && request.method === 'POST') {
        return await saveStores(request, env, corsHeaders);
      } else if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'healthy' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// 画像アップロード処理
async function handleUpload(request, env, corsHeaders) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const userEmail = formData.get('email') || 'anonymous';
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ファイルサイズチェック（500KB以下）
    if (file.size > 500 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large (max 500KB)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ファイル名生成（メールアドレスベース）
    const timestamp = Date.now();
    const sanitizedEmail = userEmail.replace(/[@.]/g, '_');
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `avatars/${sanitizedEmail}_${timestamp}.${fileExtension}`;

    // R2にアップロード
    await env.R2_BUCKET.put(fileName, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'image/jpeg',
        cacheControl: 'public, max-age=31536000', // 1年キャッシュ
      },
      customMetadata: {
        uploadedBy: userEmail,
        uploadedAt: new Date().toISOString(),
      }
    });

    // 公開URLを返す
    const publicUrl = `${env.PUBLIC_URL}/${fileName}`;
    
    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      fileName: fileName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 事前署名URL生成（直接アップロード用）
async function generatePresignedUrl(request, env, corsHeaders) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ファイル名生成
    const timestamp = Date.now();
    const sanitizedEmail = email.replace(/[@.]/g, '_');
    const fileName = `avatars/${sanitizedEmail}_${timestamp}.jpg`;
    
    // 注：R2は現在事前署名URLをサポートしていないため、
    // 代わりにWorker経由でアップロードする必要があります
    const uploadUrl = `${new URL(request.url).origin}/upload`;
    
    return new Response(JSON.stringify({
      uploadUrl: uploadUrl,
      fileName: fileName,
      method: 'POST',
      note: 'Use FormData with "image" field'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// アバター取得
async function getAvatar(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const key = url.pathname.substring(1); // Remove leading '/'
    
    const object = await env.R2_BUCKET.get(key);
    
    if (!object) {
      return new Response('Avatar not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    const headers = new Headers(object.httpMetadata || {});
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(object.body, { headers });
  } catch (error) {
    return new Response('Error fetching avatar', {
      status: 500,
      headers: corsHeaders
    });
  }
}

// ============ レビューシステム関数 ============

// レビュー取得
async function getReviews(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const storeId = url.searchParams.get('store_id');
    const userEmail = url.searchParams.get('user_email');
    
    let key = 'reviews/';
    if (storeId) {
      key += `store_${storeId}.json`;
    } else if (userEmail) {
      key += `user_${userEmail.replace('@', '_at_')}.json`;
    } else {
      key += 'all.json';
    }
    
    const object = await env.R2_BUCKET.get(key);
    
    if (!object) {
      return new Response(JSON.stringify({ reviews: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const reviews = await object.json();
    return new Response(JSON.stringify({ reviews }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// レビュー保存
async function saveReview(request, env, corsHeaders) {
  try {
    const review = await request.json();
    
    // 必須フィールドのバリデーション
    if (!review.store_id || !review.user_email || !review.content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // レビューIDを生成
    review.id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    review.created_at = new Date().toISOString();
    review.updated_at = review.created_at;
    review.is_deleted = false;
    
    // 店舗情報も保存（マイレビュー表示用）
    if (review.store_name) review.store_name = review.store_name;
    if (review.store_category) review.store_category = review.store_category;
    if (review.store_latitude) review.store_latitude = review.store_latitude;
    if (review.store_longitude) review.store_longitude = review.store_longitude;
    
    // 店舗別レビューファイルを更新
    const storeKey = `reviews/store_${review.store_id}.json`;
    const storeObject = await env.R2_BUCKET.get(storeKey);
    let storeReviews = [];
    
    if (storeObject) {
      storeReviews = await storeObject.json();
    }
    
    storeReviews.push(review);
    
    await env.R2_BUCKET.put(storeKey, JSON.stringify(storeReviews), {
      httpMetadata: { 'Content-Type': 'application/json' }
    });
    
    // ユーザー別レビューファイルも更新
    const userKey = `reviews/user_${review.user_email.replace('@', '_at_')}.json`;
    const userObject = await env.R2_BUCKET.get(userKey);
    let userReviews = [];
    
    if (userObject) {
      userReviews = await userObject.json();
    }
    
    userReviews.push(review);
    
    await env.R2_BUCKET.put(userKey, JSON.stringify(userReviews), {
      httpMetadata: { 'Content-Type': 'application/json' }
    });
    
    // 全レビューファイルも更新
    const allKey = 'reviews/all.json';
    const allObject = await env.R2_BUCKET.get(allKey);
    let allReviews = [];
    
    if (allObject) {
      allReviews = await allObject.json();
    }
    
    allReviews.push(review);
    
    await env.R2_BUCKET.put(allKey, JSON.stringify(allReviews), {
      httpMetadata: { 'Content-Type': 'application/json' }
    });
    
    return new Response(JSON.stringify({ success: true, review }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save review error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// レビュー更新
async function updateReview(request, env, corsHeaders) {
  try {
    const { id, content } = await request.json();
    
    if (!id || !content) {
      return new Response(JSON.stringify({ error: 'Missing id or content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 全レビューから該当のレビューを探す
    const allKey = 'reviews/all.json';
    const allObject = await env.R2_BUCKET.get(allKey);
    
    if (!allObject) {
      return new Response(JSON.stringify({ error: 'Review not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    let allReviews = await allObject.json();
    const reviewIndex = allReviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) {
      return new Response(JSON.stringify({ error: 'Review not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // レビューを更新
    allReviews[reviewIndex].content = content;
    allReviews[reviewIndex].updated_at = new Date().toISOString();
    
    const updatedReview = allReviews[reviewIndex];
    
    // 全レビューファイルを更新
    await env.R2_BUCKET.put(allKey, JSON.stringify(allReviews), {
      httpMetadata: { 'Content-Type': 'application/json' }
    });
    
    // 店舗別・ユーザー別ファイルも更新
    await updateRelatedFiles(env, updatedReview);
    
    return new Response(JSON.stringify({ success: true, review: updatedReview }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update review error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// レビュー削除（論理削除）
async function deleteReview(request, env, corsHeaders) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 全レビューから該当のレビューを探す
    const allKey = 'reviews/all.json';
    const allObject = await env.R2_BUCKET.get(allKey);
    
    if (!allObject) {
      return new Response(JSON.stringify({ error: 'Review not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    let allReviews = await allObject.json();
    const reviewIndex = allReviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) {
      return new Response(JSON.stringify({ error: 'Review not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 論理削除
    allReviews[reviewIndex].is_deleted = true;
    allReviews[reviewIndex].updated_at = new Date().toISOString();
    
    const deletedReview = allReviews[reviewIndex];
    
    // 全レビューファイルを更新
    await env.R2_BUCKET.put(allKey, JSON.stringify(allReviews), {
      httpMetadata: { 'Content-Type': 'application/json' }
    });
    
    // 店舗別・ユーザー別ファイルも更新
    await updateRelatedFiles(env, deletedReview);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 関連ファイル更新ヘルパー関数
async function updateRelatedFiles(env, review) {
  // 店舗別ファイル更新
  const storeKey = `reviews/store_${review.store_id}.json`;
  const storeObject = await env.R2_BUCKET.get(storeKey);
  
  if (storeObject) {
    let storeReviews = await storeObject.json();
    const index = storeReviews.findIndex(r => r.id === review.id);
    if (index !== -1) {
      storeReviews[index] = review;
      await env.R2_BUCKET.put(storeKey, JSON.stringify(storeReviews), {
        httpMetadata: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // ユーザー別ファイル更新
  const userKey = `reviews/user_${review.user_email.replace('@', '_at_')}.json`;
  const userObject = await env.R2_BUCKET.get(userKey);
  
  if (userObject) {
    let userReviews = await userObject.json();
    const index = userReviews.findIndex(r => r.id === review.id);
    if (index !== -1) {
      userReviews[index] = review;
      await env.R2_BUCKET.put(userKey, JSON.stringify(userReviews), {
        httpMetadata: { 'Content-Type': 'application/json' }
      });
    }
  }
}

// ============ プロフィール管理システム ============

// プロフィール取得
async function getProfile(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email parameter required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Workers KVからプロフィールを取得
    const kvKey = `profile:${email}`;
    const profileData = await env.PROFILE_KV.get(kvKey);
    
    if (!profileData) {
      // デフォルトプロフィールを返す
      const defaultProfile = {
        email: email,
        nickname: email.split('@')[0] || 'ユーザー',
        avatar: 'default',
        avatarType: 'preset',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        bio: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return new Response(JSON.stringify({ profile: defaultProfile }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const profile = JSON.parse(profileData);
    console.log('📖 プロフィール取得成功:', email);
    
    return new Response(JSON.stringify({ profile }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// プロフィール保存（新規作成）
async function saveProfile(request, env, corsHeaders) {
  try {
    const profile = await request.json();
    
    // 必須フィールドのバリデーション
    if (!profile.email || !profile.nickname) {
      return new Response(JSON.stringify({ error: 'Email and nickname are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // プロフィールデータを正規化
    const normalizedProfile = {
      email: profile.email,
      nickname: profile.nickname.trim(),
      avatar: profile.avatar || 'default',
      avatarType: profile.avatarType || 'preset',
      avatarUrl: profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.email)}`,
      bio: profile.bio || '',
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Workers KVに保存
    const kvKey = `profile:${profile.email}`;
    await env.PROFILE_KV.put(kvKey, JSON.stringify(normalizedProfile));
    
    console.log('💾 プロフィール保存成功:', profile.email);
    
    return new Response(JSON.stringify({ 
      success: true, 
      profile: normalizedProfile 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save profile error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// プロフィール更新
async function updateProfile(request, env, corsHeaders) {
  try {
    const profile = await request.json();
    
    if (!profile.email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 既存プロフィールを取得
    const kvKey = `profile:${profile.email}`;
    const existingData = await env.PROFILE_KV.get(kvKey);
    
    let existingProfile = {};
    if (existingData) {
      existingProfile = JSON.parse(existingData);
    }
    
    // 更新データをマージ（既存データを保持しつつ新しいデータで上書き）
    const updatedProfile = {
      ...existingProfile,
      ...profile,
      email: profile.email, // emailは変更不可
      updatedAt: new Date().toISOString()
    };
    
    // ニックネームが提供されていない場合は既存値を保持
    if (!profile.nickname && existingProfile.nickname) {
      updatedProfile.nickname = existingProfile.nickname;
    }
    
    // Workers KVに保存
    await env.PROFILE_KV.put(kvKey, JSON.stringify(updatedProfile));
    
    console.log('🔄 プロフィール更新成功:', profile.email);
    
    return new Response(JSON.stringify({ 
      success: true, 
      profile: updatedProfile 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============ 店舗画像管理システム ============

// 店舗画像取得
async function getStoreImages(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const storeId = url.searchParams.get('store_id');
    
    if (!storeId) {
      return new Response(JSON.stringify({ error: 'store_id parameter required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // R2から店舗画像データを取得
    const key = `store-images/store_${storeId}.json`;
    const object = await env.R2_BUCKET.get(key);
    
    if (!object) {
      return new Response(JSON.stringify({ images: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const images = await object.json();
    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get store images error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 店舗画像保存（URLベース）
async function saveStoreImages(request, env, corsHeaders) {
  try {
    const { store_id, image_urls, uploaded_by } = await request.json();
    
    // バリデーション
    if (!store_id || !image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'store_id and image_urls (array) are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 画像URL数制限（最大3枚）
    if (image_urls.length > 3) {
      return new Response(JSON.stringify({ 
        error: 'Maximum 3 images allowed' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 既存データを取得
    const key = `store-images/store_${store_id}.json`;
    const existingObject = await env.R2_BUCKET.get(key);
    let existingImages = [];
    
    if (existingObject) {
      existingImages = await existingObject.json();
    }
    
    // 新しい画像データを作成
    const timestamp = new Date().toISOString();
    const newImages = image_urls.map((url, index) => ({
      id: `img_${store_id}_${Date.now()}_${index}`,
      store_id: parseInt(store_id),
      image_url: url,
      alt_text: `店舗${store_id}の画像${index + 1}`,
      uploaded_by: uploaded_by || 'admin',
      created_at: timestamp,
      is_primary: index === 0 && existingImages.length === 0
    }));
    
    // 既存画像と結合（重複チェック）
    const allImages = [...existingImages];
    newImages.forEach(newImg => {
      if (!allImages.some(existing => existing.image_url === newImg.image_url)) {
        allImages.push(newImg);
      }
    });
    
    // 最大3枚制限
    const finalImages = allImages.slice(0, 3);
    
    // R2に保存
    await env.R2_BUCKET.put(key, JSON.stringify(finalImages), {
      httpMetadata: { 'Content-Type': 'application/json' }
    });
    
    console.log(`✅ 店舗${store_id}の画像保存完了: ${finalImages.length}枚`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      images: finalImages,
      message: `${finalImages.length}枚の画像を保存しました`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Save store images error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 店舗画像更新
async function updateStoreImages(request, env, corsHeaders) {
  try {
    const { store_id, image_urls } = await request.json();
    
    if (!store_id || !image_urls || !Array.isArray(image_urls)) {
      return new Response(JSON.stringify({ 
        error: 'store_id and image_urls (array) are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 画像URL数制限（最大3枚）
    if (image_urls.length > 3) {
      return new Response(JSON.stringify({ 
        error: 'Maximum 3 images allowed' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 新しい画像データを作成（完全置き換え）
    const timestamp = new Date().toISOString();
    const newImages = image_urls.filter(url => url && url.trim()).map((url, index) => ({
      id: `img_${store_id}_${Date.now()}_${index}`,
      store_id: parseInt(store_id),
      image_url: url.trim(),
      alt_text: `店舗${store_id}の画像${index + 1}`,
      uploaded_by: 'admin',
      created_at: timestamp,
      updated_at: timestamp,
      is_primary: index === 0
    }));
    
    // R2に保存（完全置き換え）
    const key = `store-images/store_${store_id}.json`;
    await env.R2_BUCKET.put(key, JSON.stringify(newImages), {
      httpMetadata: { 'Content-Type': 'application/json' }
    });
    
    console.log(`🔄 店舗${store_id}の画像更新完了: ${newImages.length}枚`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      images: newImages,
      message: `${newImages.length}枚の画像を更新しました`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Update store images error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 店舗画像削除
async function deleteStoreImages(request, env, corsHeaders) {
  try {
    const { store_id } = await request.json();
    
    if (!store_id) {
      return new Response(JSON.stringify({ error: 'store_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // R2から削除
    const key = `store-images/store_${store_id}.json`;
    await env.R2_BUCKET.delete(key);
    
    console.log(`🗑️ 店舗${store_id}の画像削除完了`);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: `店舗${store_id}の画像を削除しました`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Delete store images error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 店舗データ取得
async function getStores(request, env, corsHeaders) {
  try {
    // KVから店舗データを取得
    const storesData = await env.STORES_KV.get('stores-data');
    
    if (!storesData) {
      // データがない場合は空配列を返す
      return new Response(JSON.stringify({ stores: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const stores = JSON.parse(storesData);
    console.log('📍 店舗データ取得成功:', stores.length, '件');
    
    return new Response(JSON.stringify({ stores }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get stores error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 店舗データ保存・更新
async function saveStores(request, env, corsHeaders) {
  try {
    const { stores } = await request.json();
    
    if (!stores || !Array.isArray(stores)) {
      return new Response(JSON.stringify({ error: 'Invalid stores data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // データ検証（基本的なチェック）
    const validStores = stores.filter(store => 
      store && 
      typeof store === 'object' && 
      (store.name || store.id)
    );
    
    if (validStores.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid stores data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // タイムスタンプ追加
    const storesWithMeta = {
      stores: validStores,
      count: validStores.length,
      updatedAt: new Date().toISOString(),
      updatedBy: request.headers.get('X-User-Email') || 'admin'
    };
    
    // KVに保存（メインデータ）
    await env.STORES_KV.put('stores-data', JSON.stringify(validStores));
    
    // メタデータも保存（履歴管理用）
    await env.STORES_KV.put('stores-meta', JSON.stringify(storesWithMeta));
    
    // バックアップ（日付付き）
    const backupKey = `stores-backup-${new Date().toISOString().split('T')[0]}`;
    await env.STORES_KV.put(backupKey, JSON.stringify(validStores));
    
    console.log('💾 店舗データ保存成功:', validStores.length, '件');
    
    return new Response(JSON.stringify({ 
      success: true, 
      count: validStores.length,
      message: `${validStores.length}件の店舗データを保存しました`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save stores error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}