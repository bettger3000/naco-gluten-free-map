// CSV一括アップロード機能モジュール
// 完全に独立して動作し、既存コードと干渉しない設計

(function() {
    'use strict';
    
    // CSV機能の名前空間
    window.CSVUploader = {
        // 初期化
        init: function() {
            console.log('CSVUploader initialized');
            this.attachEventListeners();
        },
        
        // イベントリスナー設定
        attachEventListeners: function() {
            // CSV一括アップロードボタン
            const csvBtn = document.getElementById('csvUploadBtn');
            if (csvBtn) {
                csvBtn.onclick = () => this.showModal();
                console.log('CSV button handler attached');
            }
        },
        
        // モーダル表示
        showModal: function() {
            console.log('Opening CSV upload modal');
            
            // 既存のモーダルを削除
            const existingModal = document.getElementById('csvUploadModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // モーダル作成
            const modal = document.createElement('div');
            modal.id = 'csvUploadModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 900px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-file-csv"></i> CSV一括アップロード</h3>
                        <button class="modal-close" onclick="CSVUploader.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="csvWizard">
                            <!-- Step 1: ファイル選択 -->
                            <div id="csvStep1" class="csv-step">
                                <h4>📁 Step 1: CSVファイルを選択</h4>
                                <div style="border: 2px dashed #ccc; border-radius: 8px; padding: 40px; text-align: center; cursor: pointer;" 
                                     onclick="document.getElementById('csvFileInput').click()">
                                    <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
                                    <p>クリックまたはドラッグ＆ドロップでファイルを選択</p>
                                    <input type="file" id="csvFileInput" accept=".csv" style="display: none;" onchange="CSVUploader.handleFile(this)">
                                </div>
                                
                                <div style="margin-top: 2rem; padding: 1rem; background: #f0f9ff; border-radius: 8px;">
                                    <h5>📋 CSVフォーマット</h5>
                                    <code style="display: block; padding: 0.5rem; background: white; border-radius: 4px; font-size: 0.8rem;">
GoogleマップURL,店舗名,カテゴリー,住所,電話番号,営業時間,定休日,ウェブサイト,Instagram URL,画像URL,グルテンフリー対応度,対応メニュー,備考
                                    </code>
                                    <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="CSVUploader.downloadTemplate()">
                                        <i class="fas fa-download"></i> テンプレートをダウンロード
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Step 2: プレビュー -->
                            <div id="csvStep2" class="csv-step" style="display: none;">
                                <h4>👀 Step 2: データ確認</h4>
                                <div id="csvSummary" style="padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 1rem;">
                                    <!-- サマリー情報 -->
                                </div>
                                <div id="csvPreviewTable" style="overflow: auto; max-height: 400px;">
                                    <!-- プレビューテーブル -->
                                </div>
                                <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                                    <button class="btn btn-secondary" onclick="CSVUploader.resetUpload()">
                                        <i class="fas fa-arrow-left"></i> 戻る
                                    </button>
                                    <button class="btn btn-primary" onclick="CSVUploader.startImport()">
                                        <i class="fas fa-upload"></i> インポート開始
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Step 3: 処理中 -->
                            <div id="csvStep3" class="csv-step" style="display: none;">
                                <h4>⚙️ Step 3: インポート中...</h4>
                                <div style="padding: 2rem;">
                                    <div style="background: #e5e7eb; height: 30px; border-radius: 15px; overflow: hidden;">
                                        <div id="csvProgress" style="background: var(--success); height: 100%; width: 0%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white;">
                                            0%
                                        </div>
                                    </div>
                                    <div id="csvStatus" style="text-align: center; margin-top: 1rem; color: var(--text-secondary);">
                                        準備中...
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Step 4: 完了 -->
                            <div id="csvStep4" class="csv-step" style="display: none;">
                                <h4>✅ Step 4: インポート完了</h4>
                                <div id="csvResults" style="padding: 2rem; text-align: center;">
                                    <!-- 結果表示 -->
                                </div>
                                <button class="btn btn-primary" onclick="CSVUploader.closeModal()" style="width: 100%;">
                                    <i class="fas fa-check"></i> 完了
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            modal.style.display = 'block';
        },
        
        // モーダルを閉じる
        closeModal: function() {
            const modal = document.getElementById('csvUploadModal');
            if (modal) {
                modal.remove();
            }
        },
        
        // テンプレートダウンロード
        downloadTemplate: function() {
            const template = `GoogleマップURL,店舗名,カテゴリー,住所,電話番号,営業時間,定休日,ウェブサイト,Instagram URL,画像URL,グルテンフリー対応度,対応メニュー,備考
https://maps.google.com/...,,,,,,,,,完全対応,米粉パン・米粉ケーキ,専門店
,サンプル店舗,カフェ,東京都渋谷区1-1-1,03-1234-5678,10:00-20:00,月曜日,https://example.com,https://instagram.com/sample,,一部対応,グルテンフリーパスタ,要予約`;
            
            const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'gluten_free_stores_template.csv';
            link.click();
            URL.revokeObjectURL(url);
            
            this.showToast('テンプレートをダウンロードしました');
        },
        
        // ファイル処理
        handleFile: function(input) {
            const file = input.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => this.parseCSV(e.target.result);
            reader.readAsText(file, 'UTF-8');
        },
        
        // CSV解析
        csvData: [],
        parseCSV: function(text) {
            try {
                const lines = text.split(/\r?\n/).filter(line => line.trim());
                if (lines.length < 2) {
                    this.showToast('CSVファイルにデータがありません', 'error');
                    return;
                }
                
                // ヘッダー解析
                const headers = this.parseCSVLine(lines[0]);
                
                // データ解析
                this.csvData = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = this.parseCSVLine(lines[i]);
                    if (values.length === headers.length) {
                        const row = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index] || '';
                        });
                        this.csvData.push(row);
                    }
                }
                
                this.showPreview();
            } catch (error) {
                console.error('CSV parse error:', error);
                this.showToast('CSVファイルの解析に失敗しました', 'error');
            }
        },
        
        // CSV行解析
        parseCSVLine: function(line) {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        },
        
        // プレビュー表示
        showPreview: function() {
            document.getElementById('csvStep1').style.display = 'none';
            document.getElementById('csvStep2').style.display = 'block';
            
            // サマリー
            const summary = document.getElementById('csvSummary');
            summary.innerHTML = `
                <div style="display: flex; justify-content: space-around;">
                    <div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">${this.csvData.length}</div>
                        <div>総レコード数</div>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${this.csvData.filter(d => d.GoogleマップURL).length}</div>
                        <div>GoogleマップURL付き</div>
                    </div>
                </div>
            `;
            
            // テーブル
            const table = document.getElementById('csvPreviewTable');
            const headers = Object.keys(this.csvData[0] || {});
            const previewData = this.csvData.slice(0, 10);
            
            table.innerHTML = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f3f4f6;">
                            ${headers.map(h => `<th style="padding: 0.5rem; border: 1px solid #e5e7eb; text-align: left;">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${previewData.map(row => `
                            <tr>
                                ${headers.map(h => `<td style="padding: 0.5rem; border: 1px solid #e5e7eb;">${row[h] || '-'}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${this.csvData.length > 10 ? `<p style="text-align: center; padding: 1rem;">... 他 ${this.csvData.length - 10} 件</p>` : ''}
            `;
        },
        
        // インポート開始
        startImport: async function() {
            document.getElementById('csvStep2').style.display = 'none';
            document.getElementById('csvStep3').style.display = 'block';
            
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < this.csvData.length; i++) {
                const row = this.csvData[i];
                
                try {
                    // 店舗データ作成
                    const storeData = await this.processRow(row);
                    
                    // storesに追加（グローバル変数を使用）
                    if (window.stores) {
                        const newId = Math.max(...window.stores.map(s => s.id || 0), 0) + 1;
                        window.stores.push({
                            id: newId,
                            ...storeData
                        });
                        successCount++;
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    errorCount++;
                }
                
                // プログレス更新
                const progress = Math.round(((i + 1) / this.csvData.length) * 100);
                document.getElementById('csvProgress').style.width = progress + '%';
                document.getElementById('csvProgress').textContent = progress + '%';
                document.getElementById('csvStatus').textContent = `処理中: ${i + 1} / ${this.csvData.length}`;
                
                // UIを更新
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // 保存
            if (window.saveStoresData) {
                window.saveStoresData();
            }
            if (window.displayStoresList) {
                window.displayStoresList();
            }
            
            // 完了表示
            this.showResults(successCount, errorCount);
        },
        
        // 行処理
        processRow: async function(row) {
            let storeData = {
                name: row.店舗名 || '未設定',
                category: row.カテゴリー || 'その他',
                address: row.住所 || '',
                phone: row.電話番号 || '',
                hours: row.営業時間 || '',
                closed: row.定休日 || '',
                website: row.ウェブサイト || '',
                instagram: row['Instagram URL'] || '',
                image_url: row.画像URL || '',
                gluten_free_level: row.グルテンフリー対応度 || '要確認',
                gluten_free_menu: row.対応メニュー || '',
                notes: row.備考 || '',
                latitude: null,
                longitude: null
            };
            
            // GoogleマップURL処理
            if (row.GoogleマップURL) {
                const coords = this.extractCoordsFromURL(row.GoogleマップURL);
                if (coords) {
                    storeData.latitude = coords.lat;
                    storeData.longitude = coords.lng;
                }
                
                // 店舗名取得
                const name = this.extractNameFromURL(row.GoogleマップURL);
                if (name && !row.店舗名) {
                    storeData.name = name;
                }
            }
            
            // 座標がない場合は住所から推定
            if (!storeData.latitude && storeData.address) {
                const coords = this.geocodeAddress(storeData.address);
                storeData.latitude = coords.lat;
                storeData.longitude = coords.lng;
            }
            
            // それでも座標がない場合はデフォルト
            if (!storeData.latitude) {
                storeData.latitude = 35.6762 + (Math.random() - 0.5) * 0.1;
                storeData.longitude = 139.6503 + (Math.random() - 0.5) * 0.1;
            }
            
            return storeData;
        },
        
        // GoogleマップURLから座標抽出
        extractCoordsFromURL: function(url) {
            const match = url.match(/@([+-]?\d+\.\d+),([+-]?\d+\.\d+)/);
            if (match) {
                return {
                    lat: parseFloat(match[1]),
                    lng: parseFloat(match[2])
                };
            }
            return null;
        },
        
        // GoogleマップURLから店舗名抽出
        extractNameFromURL: function(url) {
            const match = url.match(/place\/([^\/]+)/);
            if (match) {
                return decodeURIComponent(match[1]).replace(/\+/g, ' ');
            }
            return null;
        },
        
        // 住所から座標推定（簡易版）
        geocodeAddress: function(address) {
            const cityCoords = {
                '東京': { lat: 35.6762, lng: 139.6503 },
                '大阪': { lat: 34.6937, lng: 135.5023 },
                '横浜': { lat: 35.4437, lng: 139.6380 },
                '名古屋': { lat: 35.1815, lng: 136.9066 },
                '福岡': { lat: 33.5904, lng: 130.4017 },
                '札幌': { lat: 43.0642, lng: 141.3469 },
                '京都': { lat: 35.0116, lng: 135.7681 },
                '神戸': { lat: 34.6901, lng: 135.1955 },
                '仙台': { lat: 38.2682, lng: 140.8694 },
                '広島': { lat: 34.3853, lng: 132.4553 }
            };
            
            for (const [city, coords] of Object.entries(cityCoords)) {
                if (address.includes(city)) {
                    return {
                        lat: coords.lat + (Math.random() - 0.5) * 0.05,
                        lng: coords.lng + (Math.random() - 0.5) * 0.05
                    };
                }
            }
            
            // デフォルト（東京）
            return {
                lat: 35.6762 + (Math.random() - 0.5) * 0.2,
                lng: 139.6503 + (Math.random() - 0.5) * 0.2
            };
        },
        
        // 結果表示
        showResults: function(successCount, errorCount) {
            document.getElementById('csvStep3').style.display = 'none';
            document.getElementById('csvStep4').style.display = 'block';
            
            const results = document.getElementById('csvResults');
            results.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 1rem;">
                    ${successCount > 0 ? '🎉' : '😔'}
                </div>
                <h3>${successCount} 件の店舗を追加しました</h3>
                ${errorCount > 0 ? `<p style="color: var(--error);">エラー: ${errorCount} 件</p>` : ''}
                <p style="margin-top: 2rem;">
                    ${window.githubSettings && window.githubSettings.token ? 
                        '自動デプロイが実行されます...' : 
                        'GitHub連携を設定すると自動デプロイが可能です'}
                </p>
            `;
            
            // GitHub自動デプロイ
            if (successCount > 0 && window.deployToGitHub) {
                setTimeout(() => {
                    window.deployToGitHub();
                    this.showToast('GitHub自動デプロイを開始しました');
                }, 2000);
            }
        },
        
        // リセット
        resetUpload: function() {
            this.csvData = [];
            document.getElementById('csvStep1').style.display = 'block';
            document.getElementById('csvStep2').style.display = 'none';
            document.getElementById('csvFileInput').value = '';
        },
        
        // トースト表示
        showToast: function(message, type = 'success') {
            if (window.showToast) {
                window.showToast(message, type);
            } else {
                console.log(`Toast: ${message} (${type})`);
            }
        }
    };
    
    // DOMContentLoaded時に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CSVUploader.init());
    } else {
        // 既にDOMが読み込まれている場合
        setTimeout(() => CSVUploader.init(), 100);
    }
})();