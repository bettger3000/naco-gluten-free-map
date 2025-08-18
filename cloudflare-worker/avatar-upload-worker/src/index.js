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