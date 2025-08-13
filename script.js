// グローバル変数
let map;
let stores = [];
let markers = [];

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadStores();
    setupEventListeners();
});

// マップの初期化
function initMap() {
    // 名古屋の中心座標
    map = L.map('map').setView([35.1815, 136.9066], 12);
    
    // OpenStreetMapタイルを追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// 店舗データの読み込み
async function loadStores() {
    try {
        const response = await fetch('stores.json');
        const data = await response.json();
        stores = data.stores;
        displayStores(stores);
        displayStoreCards(stores);
    } catch (error) {
        console.error('店舗データの読み込みに失敗しました:', error);
        document.getElementById('storeCards').innerHTML = '<p>データの読み込みに失敗しました。</p>';
    }
}

// マップに店舗マーカーを表示
function displayStores(storesData) {
    // 既存のマーカーをクリア
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    storesData.forEach(store => {
        // カテゴリー別のマーカーアイコン
        const iconColor = getCategoryColor(store.category);
        
        const marker = L.marker([store.lat, store.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${iconColor}; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px;">${getCategoryEmoji(store.category)}</div>`,
                iconSize: [25, 25],
                iconAnchor: [12, 12]
            })
        }).addTo(map);
        
        // ポップアップの内容
        const popupContent = createPopupContent(store);
        marker.bindPopup(popupContent);
        
        // マーカークリック時のイベント
        marker.on('click', function() {
            selectStoreCard(store.id);
        });
        
        markers.push(marker);
    });
}

// 店舗カードの表示
function displayStoreCards(storesData) {
    const container = document.getElementById('storeCards');
    container.innerHTML = '';
    
    storesData.forEach(store => {
        const card = createStoreCard(store);
        container.appendChild(card);
    });
}

// 店舗カードの作成
function createStoreCard(store) {
    const card = document.createElement('div');
    card.className = 'store-card';
    card.dataset.storeId = store.id;
    
    card.innerHTML = `
        <h4>${store.name}</h4>
        <span class="store-category">${store.category}</span>
        <div class="store-address">${store.address}</div>
        <div class="store-options">
            <strong>グルテンフリー:</strong>
            <span>${store.glutenFreeOptions.join(', ')}</span>
        </div>
        <div class="store-notes">${store.notes}</div>
        ${store.phone ? `<div class="store-contact">📞 ${store.phone}</div>` : ''}
    `;
    
    // カードクリック時の処理
    card.addEventListener('click', function() {
        const marker = markers.find(m => m.options.storeId === store.id);
        if (marker) {
            map.setView([store.lat, store.lng], 15);
            marker.openPopup();
        }
        selectStoreCard(store.id);
    });
    
    return card;
}

// ポップアップコンテンツの作成
function createPopupContent(store) {
    return `
        <div style="min-width: 200px;">
            <h4>${store.name}</h4>
            <p><strong>カテゴリー:</strong> ${store.category}</p>
            <p><strong>住所:</strong> ${store.address}</p>
            <p><strong>グルテンフリー:</strong> ${store.glutenFreeOptions.join(', ')}</p>
            <p>${store.notes}</p>
            ${store.phone ? `<p>📞 ${store.phone}</p>` : ''}
        </div>
    `;
}

// 店舗カードの選択状態を更新
function selectStoreCard(storeId) {
    // すべてのカードの選択状態を解除
    document.querySelectorAll('.store-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 指定されたカードを選択状態にする
    const selectedCard = document.querySelector(`[data-store-id="${storeId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// カテゴリー別の色を取得
function getCategoryColor(category) {
    const colors = {
        'カフェ': '#8B4513',
        '和食': '#228B22',
        '洋食': '#FF6347',
        'パン屋': '#DEB887',
        'スイーツ': '#FF69B4',
        '販売店': '#4169E1'
    };
    return colors[category] || '#666666';
}

// カテゴリー別の絵文字を取得
function getCategoryEmoji(category) {
    const emojis = {
        'カフェ': '☕',
        '和食': '🍱',
        '洋食': '🍝',
        'パン屋': '🍞',
        'スイーツ': '🧁',
        '販売店': '🛒'
    };
    return emojis[category] || '🏪';
}

// イベントリスナーの設定
function setupEventListeners() {
    // カテゴリーフィルター
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.addEventListener('change', filterStores);
    
    // 検索機能
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', filterStores);
}

// 店舗のフィルタリング
function filterStores() {
    const category = document.getElementById('categoryFilter').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredStores = stores.filter(store => {
        const matchesCategory = !category || store.category === category;
        const matchesSearch = !searchText || 
            store.name.toLowerCase().includes(searchText) ||
            store.address.toLowerCase().includes(searchText) ||
            store.glutenFreeOptions.some(option => option.toLowerCase().includes(searchText));
        
        return matchesCategory && matchesSearch;
    });
    
    displayStores(filteredStores);
    displayStoreCards(filteredStores);
}