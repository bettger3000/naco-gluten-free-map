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