/**
 * Cloudflare Worker for Gluten-Free Store Data Auto-Update
 * GitHub Contents APIを使用してdata/embeddedStores.jsonを自動更新
 */

export default {
  async fetch(request, env, ctx) {
    // CORS headers for browser requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests for store updates
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed', 
          message: 'Only POST requests are supported' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Parse request body
      const requestData = await request.json();
      const { stores, commitMessage } = requestData;

      // Validate input
      if (!Array.isArray(stores)) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid data', 
            message: 'stores must be an array' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`📦 Updating stores data: ${stores.length} stores`);

      // Update GitHub file
      const result = await updateGitHubFile(env, stores, commitMessage || 'Auto-update store data from management interface');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Store data updated successfully',
          stores_count: stores.length,
          commit_sha: result.commit.sha,
          commit_url: result.commit.html_url
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('❌ Error updating store data:', error);
      
      return new Response(
        JSON.stringify({ 
          error: 'Update failed', 
          message: error.message,
          details: error.stack 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  },
};

/**
 * GitHub Contents APIを使用してファイルを更新
 */
async function updateGitHubFile(env, stores, commitMessage) {
  const {
    GITHUB_TOKEN,
    GITHUB_REPO_OWNER,
    GITHUB_REPO_NAME,
    GITHUB_BRANCH,
    GITHUB_FILE_PATH
  } = env;

  // Validate environment variables
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }

  const githubApiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}`;

  // Get current file to obtain SHA
  console.log('📡 Getting current file SHA...');
  const getCurrentFile = await fetch(githubApiUrl, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Gluten-Free-Map-Auto-Updater/1.0',
    },
  });

  if (!getCurrentFile.ok) {
    const errorText = await getCurrentFile.text();
    throw new Error(`Failed to get current file: ${getCurrentFile.status} ${errorText}`);
  }

  const currentFileData = await getCurrentFile.json();
  const currentSha = currentFileData.sha;

  // Prepare new content
  const newContent = JSON.stringify(stores, null, 2);
  const encodedContent = btoa(unescape(encodeURIComponent(newContent)));

  // Update file
  console.log('📝 Updating file on GitHub...');
  const updateResponse = await fetch(githubApiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Gluten-Free-Map-Auto-Updater/1.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `${commitMessage}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`,
      content: encodedContent,
      sha: currentSha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    throw new Error(`Failed to update file: ${updateResponse.status} ${errorText}`);
  }

  const updateResult = await updateResponse.json();
  console.log('✅ File updated successfully:', updateResult.commit.sha);
  
  return updateResult;
}