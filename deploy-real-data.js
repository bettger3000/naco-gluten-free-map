const fs = require('fs');

// Supabaseから取得した実データ
const realStores = [
  {"id":6,"name":"みちのり弁当（Gluten-Free Michinori Bento）","category_id":6,"address":"名古屋市西区浄心１丁目４−６","latitude":35.1938,"longitude":136.8901,"phone":"052-5086-615","website":"https://gf-michinori.jp/","description":"📍グルテンフリーのお弁当専門店です。\n     テイクアウトのみでご提供しております🍱\n\n     ご注文をいただいてからお作りいたしますので、\n     事前にお電話でご予約いただくと、スムーズにお渡しできます✨","gluten_free_options":"完全GF","opening_hours":"11時00分～19時00分"},
  {"id":7,"name":"Biople 名古屋タカシマヤゲートタワーモール店","category_id":5,"address":"名古屋市中村区名駅１丁目１−３ JRゲートタワー タカシマヤ モール B1F","latitude":35.1722,"longitude":136.882,"phone":"052-5666-112","website":"https://store.biople.jp/","description":"ナチュラル＆オーガニックのセルフケアアイテムを幅広く取り扱うセレクトショップです。\n     グルテンフリーの珍しいお菓子など取り扱っています。\n     ・ZENB BREAD\n     ・グルテンフリーお菓子","gluten_free_options":"部分GF","opening_hours":"9時00分～21時00分"},
  {"id":8,"name":"成城石井 名古屋駅広小路口店","category_id":5,"address":"名古屋市中村区名駅１丁目１−４ 名古屋うまいもん通り 広小路口","latitude":35.1698,"longitude":136.8835,"phone":"052-5872-345","website":"https://shop.seijoishii.co.jp/seijoishii/spot/detail?code=0035","description":"新鮮な野菜・果物、厳選された輸入チーズやワイン、自家製サンドイッチ・お惣\n     菜、パン、スイーツ、オーガニック商品、調味料や冷凍食品も充実しているスーパーマーケットです。","gluten_free_options":"部分GF","opening_hours":"7時30分～22時00分"},
  {"id":9,"name":"成城石井 名古屋 近鉄パッセ店","category_id":5,"address":"名古屋市中村区名駅１丁目２−２ 近鉄パッセ B1F","latitude":35.1695,"longitude":136.8842,"gluten_free_options":"部分GF"},
  {"id":10,"name":"ダモンデ ミールシフォン＆スイーツ","category_id":4,"address":"名古屋市中区錦２丁目１１−２７ ＴＨ錦ビル 1F","latitude":35.1711,"longitude":136.9001,"phone":"052-2119-333","website":"https://da-monde.co.jp/","opening_hours":"11:00-18:00"},
  {"id":11,"name":"ライラック","category_id":4,"address":"名古屋市千種区東山通１丁目１５−２","latitude":35.164,"longitude":136.9651,"phone":"052-8877-818","website":"http://lilacs.jp/","opening_hours":"10:00-19:00"},
  {"id":12,"name":"エンキッチンカフェ","category_id":7,"address":"名古屋市中区大井町３−３１","latitude":35.1507,"longitude":136.9053,"phone":"052-8981-015","website":"http://en-kitchen.com/","opening_hours":"10:30-19:00"},
  {"id":13,"name":"スギヤマ調剤薬局 御器所店","category_id":5,"address":"名古屋市昭和区阿由知通４丁目７","latitude":35.149,"longitude":136.934,"phone":"052-8422-112","website":"https://sugiyama-club.jp/shop/detail.asp?Seq=165","opening_hours":"9:00-19:00,土曜のみ9:00-16:00"},
  {"id":14,"name":"旬楽膳 名古屋・地アミ店","category_id":5,"address":"名古屋市名東区若葉台１４０２","latitude":35.1787,"longitude":136.994,"phone":"052-7603-071","website":"http://www.shun-rakuzen.com/","opening_hours":"10:00-20:00"},
  {"id":15,"name":"コルポ","category_id":7,"address":"名古屋市中川区荒子１丁目１１６","latitude":35.1416,"longitude":136.8603,"phone":"052-3628-686","website":"https://cafe-corpo.owst.jp/","opening_hours":"11:00-18:00"},
  {"id":16,"name":"カルディコーヒーファーム 名古屋ゲートウォーク店","category_id":5,"address":"名古屋市中村区名駅１丁目１−２ ゲートウォーク B1F","latitude":35.1743,"longitude":136.8836,"phone":"052-5898-552","website":"https://www.kaldi.co.jp/","opening_hours":"10:00-22:00"},
  {"id":17,"name":"グルテンフリー 菓子屋 藤ノ宮","category_id":5,"address":"名古屋市中村区千原町４−５０","latitude":35.1812,"longitude":136.8732,"phone":"052-4517-584","opening_hours":"11:00-19:00"},
  {"id":18,"name":"グルテンフリー＆米粉ベーグル屋 はるのはな","category_id":3,"address":"名古屋市千種区萱場２丁目１３−２２","latitude":35.1824,"longitude":136.9452,"website":"https://haruno-hana.com/shop/","opening_hours":"11:00-15:00"},
  {"id":19,"name":"I 'm donut？（アイムドーナツ？）グルテンフリー","category_id":4,"address":"東京都渋谷区神宮前５丁目５３−４","latitude":35.6611,"longitude":139.7077,"description":"本物ドーナツそっくりのふわふわさでとてもよかったです！注文票に使用されてるアレルゲンが記載されてるの素敵だなと思います。","opening_hours":"11:00-19:00"},
  {"id":20,"name":"SO TARTE 代々木上原店","category_id":1,"address":"東京都渋谷区上原１丁目１８−７ 第五大貴ビル","latitude":35.6685,"longitude":139.6801,"phone":"036-4079-260","website":"https://sotarte.jp/","opening_hours":"10:00-18:00"},
  {"id":21,"name":"EWALU -お米農家が営む完全グルテンフリー専門店-","category_id":3,"address":"愛知県弥富市鯏浦町車東23−２","phone":"056-7973-200","opening_hours":"8:00-17:00"},
  {"id":22,"name":"pâtisserie Éclat de","category_id":4,"address":"兵庫県西宮市上甲子園１丁目３−１０","latitude":34.7334,"longitude":135.3701,"phone":"090-4190-1118","website":"https://eclat-de-sourire.com/"},
  {"id":23,"name":"グルテンフリーの⽶粉スイーツ専⾨店 HB Style KIYOKEN","category_id":4,"address":"神奈川県横浜市西区南幸１丁目１−１ CIAL横浜 B1","latitude":35.4662,"longitude":139.6193,"phone":"045-6208-600","website":"https://hb-style-kiyoken.com/","opening_hours":"10:00-21:00"},
  {"id":24,"name":"米m BEIEMU 米粉スイーツ&おにぎり（グルテンフリー ）","category_id":4,"address":"沖縄県読谷村喜名２３４６−１１","latitude":26.3929,"longitude":127.7436},
  {"id":25,"name":"F&F 自然食品のお店","category_id":5,"address":"東京都千代田区麹町４丁目１−３","latitude":35.6837,"longitude":139.735},
  {"id":26,"name":"ペドラブランカ 戸越銀座店","category_id":4,"address":"東京都品川区平塚２丁目１４−８ 1F","latitude":35.6213,"longitude":139.7151,"website":"https://pedrabranca-cafe.com/","opening_hours":"10:00-20:00"},
  {"id":27,"name":"出町ふたば","category_id":4,"address":"京都府京都市上京区青龍町２３６","phone":"075-2311-658","opening_hours":"8:30-17:30"},
  {"id":28,"name":"SOT COFFEE ROASTER Kyoto","category_id":1,"address":"京都府京都市東山区本町新５丁目１４８−２","latitude":34.9917,"longitude":135.7669,"phone":"080-0808-8288","website":"https://www.sotcoffee.com/","opening_hours":"8:00-18:00"},
  {"id":29,"name":"NAYAMACHI DONUTS 君に、あげる","category_id":1,"address":"京都府京都市伏見区中油掛町１０６−７","latitude":34.9315,"longitude":135.7575,"phone":"075-6061-134","opening_hours":"10:00-19:00"},
  {"id":30,"name":"宮古冷麺","category_id":6,"address":"沖縄県宮古島市平良下里３３８−８","latitude":24.8031,"longitude":125.2697,"opening_hours":"11:00-15:00"},
  {"id":31,"name":"OLU OLU Crep","category_id":4,"address":"神奈川県相模原市中央区横山４丁目２３−２０ メゾン村山","latitude":35.5662,"longitude":139.3561,"phone":"042-7070-707","opening_hours":"11:00-18:00"},
  {"id":32,"name":"BEYOND SWEETS （ビヨンドスイーツ）カフェ 表参道店","category_id":4,"address":"東京都港区南青山３丁目１３−９","phone":"036-4340-936","website":"https://beyondsweets-shop-cafe.com/","gluten_free_options":"対応可能","opening_hours":"10:00-19:00"},
  {"id":33,"name":"Creperiz Stand.Nagoya","category_id":4,"address":"名古屋市中区大須３丁目３０−２５ 合点承知ビル １階","latitude":35.1602,"longitude":136.9084,"opening_hours":"10:00-20:00"},
  {"id":34,"name":"みちのり亭","category_id":6,"address":"名古屋市中村区椿町８−７−２F","latitude":35.1695,"longitude":136.879,"website":"https://gf-michinori.jp/pages/michinori-tei","description":"グルテンフリーの定食屋","gluten_free_options":"完全GF","opening_hours":"11:00-15:00(LO14:00)  18:00-22:00(LO21::00"},
  {"id":35,"name":"2525sweets","category_id":4,"address":"愛知県名古屋市中区新栄３丁目３−１ 太陽ビル １F","latitude":35.1695,"longitude":136.9235,"phone":"090-9250-3725","website":"https://2525sweets.base.shop/","opening_hours":"火水木11:00-17:30,金土11:00-18:00"},
  {"id":36,"name":"甲賀米粉たい焼き 勝川店","category_id":4,"address":"愛知県春日井市松新町４丁目8−１","latitude":35.231,"longitude":136.9568,"phone":"090-4426-0940","website":"https://komeko.club/archives/shoplists/970","opening_hours":"11:00-19:00"},
  {"id":37,"name":"定食 笑いーと","category_id":6,"address":"福島県いわき市好間町北好間南町田５５−１","latitude":37.0766,"longitude":140.8651,"phone":"070-8308-6994","website":"https://wara-eat.com/business/teishoku-wara-eat/","opening_hours":"6:00-15:00"},
  {"id":38,"name":"titbit!(ティットビット)","category_id":4,"address":"名古屋市西区那古野１丁目１０−１７","latitude":35.1771,"longitude":136.8887,"phone":"052-5268-133","opening_hours":"11:00-18:00"},
  {"id":39,"name":"米粉の焼菓子 a\" (エーダブルプライム)","category_id":4,"address":"名古屋市昭和区北山本町２丁目１８","latitude":35.1523,"longitude":136.9246,"opening_hours":"11:00-17:00"},
  {"id":40,"name":"グルテンフリー食堂 おみやはん","category_id":6,"address":"名古屋市守山区小幡太田３−３２","latitude":35.1941,"longitude":136.9758,"phone":"080-3548-5679","website":"https://www.omiyahan.com/"},
  {"id":41,"name":"genuine gluten free Where is a dog?","category_id":1,"address":"東京都武蔵野市吉祥寺本町２丁目２４−９ SUNO Ecru 103","latitude":35.7039,"longitude":139.5724,"phone":"042-2272-812","description":"元々パンが大好きだったのでこうしてパンが食べられることができるのがとても幸せでした。","opening_hours":"月〜金　\t 12時00分～15時00分 17時00分～20時00分／土日\t 12時00分～20時00分"},
  {"id":42,"name":"米ぱんの店ぱんて","category_id":3,"address":"福井県福井市文京３丁目９−３４","latitude":36.0766846,"longitude":136.2076805,"phone":"776636781","website":"http://www.pante.jp/?mode=pc","opening_hours":"10:00-19:00"},
  {"id":43,"name":"グルテンフリーラーメン専門店 RYU-Gu 龍旗信","category_id":6,"address":"大阪府堺市西区浜寺石津町西２丁７−６ ａｕ石津川","latitude":34.562,"longitude":135.4503,"website":"http://www.ryukishin.com/","opening_hours":"11:00-14:30,17:30-20:45"},
  {"id":44,"name":"月夜野こまもの店","category_id":1,"address":"長野県上伊那郡辰野町辰野１６１５−３","latitude":35.9826,"longitude":137.9938,"phone":"070-7564-0768","website":"https://tsukikoma-tatsuno.com/","opening_hours":"日11:00-22:00,金11:00-18:00"},
  {"id":45,"name":"縁-enishi-","category_id":3,"address":"長野県長野市若里２丁目１−２３","latitude":36.6342,"longitude":138.1864,"phone":"026-4666-610","website":"https://enishi-sorghum.com/","opening_hours":"9:00-16:00"},
  {"id":46,"name":"Buddha グルテンフリー & ヴィーガン専門店","category_id":1,"address":"大阪府大阪市東成区中道１丁目８−１５ 金井ビル","latitude":34.6778,"longitude":135.5337,"phone":"066-7537-797","website":"https://buddha-online.site/","opening_hours":"10:30-15:30"},
  {"id":47,"name":"where is my chou? 田町タワー店","category_id":4,"address":"東京都港区芝５丁目３３−１１ 田町タワ １－Ｆ","latitude":35.6469,"longitude":139.7464,"opening_hours":"月〜金11:00-19:00/土日11:00-18:00"},
  {"id":48,"name":"米粉ヘルシーカフェ セレンペッシュ 心斎橋店","category_id":1,"address":"大阪府大阪市中央区南船場２丁目４−２０ 大阪福谷ビル 1階","latitude":34.6758,"longitude":135.5031,"phone":"070-2424-3975","website":"https://seren-peche.owst.jp/","opening_hours":"7:30-21:30"},
  {"id":49,"name":"薬膳スパイスカレー＆グルテンフリーバルSpys Oasis","category_id":7,"address":"大阪府大阪市中央区難波１丁目５−８","latitude":34.6675,"longitude":135.4993,"phone":"066-2115-115","website":"http://spys-oasis.com/","opening_hours":"日11:30-22:00,月火水金土11:30-15:00,18:00-0:00"},
  {"id":50,"name":"おやつ 創房優","category_id":4,"address":"岐阜県多治見市本町５丁目9−１ 陶都創造館 １階","latitude":35.3347,"longitude":137.1284,"website":"https://www.soboyu-design.page/","opening_hours":"10:00-15:00"},
  {"id":51,"name":"やまの ひつじ","category_id":1,"address":"東京都渋谷区恵比寿西１丁目２６−２","latitude":35.6478,"longitude":139.7032,"phone":"080-4710-8870","website":"http://hitsuzi.chagasi.com/","opening_hours":"11:30-15:00"},
  {"id":52,"name":"もんじゃ宝島","category_id":6,"address":"東京都中央区月島３丁目５−４","latitude":35.6633,"longitude":139.7784,"phone":"033-5335-700","website":"https://rakukatsu.jp/tsukishima-monjya-takarajima-20210101/","opening_hours":"水木金17:00-22:30/ 土日12:00-16:00,17:00-22:00"},
  {"id":53,"name":"MOCMO sandwiches (Gluten free sandwiches）","category_id":3,"address":"東京都三鷹市下連雀１丁目１７−４ GRATO井の頭公園 1F","latitude":35.7232,"longitude":139.5873,"phone":"036-8208-795","website":"https://phoenix-since2018.com/food/","opening_hours":"月〜金11:00-17:00/土日9:00-17:00"},
  {"id":54,"name":"ソラノイロ ARTISAN NOODLES","category_id":6,"address":"東京都千代田区平河町１丁目３−１０ ブルービル本館 1B","latitude":35.6831,"longitude":139.7369,"phone":"033-2635-460","website":"http://soranoiro-vege.com/","opening_hours":"11:00-15:00,17:00-21:30"},
  {"id":55,"name":"202カリー堂","category_id":7,"address":"東京都世田谷区代田５丁目３４−２１ 202","latitude":35.6614,"longitude":139.6631,"phone":"036-4138-857","opening_hours":"9:00-20:00"},
  {"id":56,"name":"TORIBA COFFEE TOKYO","category_id":1,"address":"東京都中央区八重洲２丁目１−１ YANMAR TOKYO B1F","latitude":35.6798,"longitude":139.7645,"phone":"080-3715-4434","website":"http://www.toriba-coffee.com/","opening_hours":"月〜金10:00-19:00/ 土日10:00-20:00"},
  {"id":57,"name":"premium SOW","category_id":7,"address":"東京都渋谷区代官山町１２−１６ シンフォニー代官山 103","latitude":35.6507,"longitude":139.701,"phone":"035-4223-390","website":"http://premium-sow.com/","opening_hours":"11:00-18:00"},
  {"id":58,"name":"RISO GRAN","category_id":3,"address":"大阪府大阪市此花区春日出中２丁目１４−２３ マンション住田 1F","latitude":34.6799,"longitude":135.4473,"phone":"070-2215-7547","website":"https://risogran.com/","opening_hours":"11:00-14:00"},
  {"id":59,"name":"田田田堂","category_id":4,"address":"兵庫県神戸市東灘区御影郡家１丁目２３−１２","latitude":34.7215,"longitude":135.251,"phone":"078-8553-358","opening_hours":"11:00-18:00"},
  {"id":60,"name":"阿闍梨餅本舗満月 本店","category_id":4,"address":"京都府京都市左京区田中大堰町１３９","latitude":35.0301,"longitude":135.7755,"phone":"075-7914-121","website":"http://www.ajyarimochi.com/","opening_hours":"9:00-18:00"},
  {"id":61,"name":"京都炎神","category_id":6,"address":"京都府京都市中京区中之町５８０−２","latitude":35.0045,"longitude":135.7649,"phone":"075-6064-234","opening_hours":"12:00-22:30"},
  {"id":62,"name":"和レ和レ和アラシヤマ","category_id":6,"address":"京都府京都市右京区嵯峨天龍寺芒ノ馬場町３−１４","latitude":35.0142,"longitude":135.6745,"phone":"075-3349-065","website":"https://www.bread-espresso.jp/shop/warewarewa_arashiyama.html","opening_hours":"8:00-18:00"},
  {"id":63,"name":"エスパルスドリームプラザ","category_id":5,"address":"静岡県静岡市清水区入船町１３−１５","latitude":35.0106,"longitude":138.4902,"phone":"054-3543-360","website":"https://www.dream-plaza.co.jp/","opening_hours":"10:00-20:00"},
  {"id":64,"name":"グルテンフリースイーツ専門店 NachuRa Yoyogi park","category_id":4,"address":"東京都渋谷区富ケ谷１丁目１７−７ 第二山栄ビル １階","latitude":35.6664,"longitude":139.6893,"phone":"070-4680-4217","website":"https://nachura.shop/","opening_hours":"8:00-17:00"},
  {"id":65,"name":"Linda Lindo SWEETS","category_id":4,"address":"岐阜県本巣郡北方町曲路３丁目３９","latitude":35.4311,"longitude":136.6934,"phone":"058-2606-377","website":"https://lindalindo.shop/","opening_hours":"10:00-18:00"},
  {"id":66,"name":"cadeau","category_id":4,"address":"三重県津市八町２丁目１５−１","latitude":34.7204,"longitude":136.4946,"phone":"059-2021-402","website":"https://malalatete.jp/","opening_hours":"10:30-16:30"},
  {"id":67,"name":"お米のいいなり","category_id":6,"address":"和歌山県和歌山市小松原５丁目６−７","latitude":34.2332,"longitude":135.1892,"phone":"073-4228-228","website":"https://komeno-e-nari.com/","opening_hours":"11:30-15:00,18:00-22:00"}
];

// カテゴリマッピング
const categoryMap = {
  1: 'カフェ',
  3: 'パン屋',
  4: 'スイーツ',
  5: '販売店',
  6: '和食',
  7: '洋食'
};

// データ変換
const stores = realStores.map(store => ({
  id: store.id,
  name: store.name,
  category: categoryMap[store.category_id] || 'その他',
  address: store.address,
  latitude: store.latitude,
  longitude: store.longitude,
  phone: store.phone || '',
  website: store.website || '',
  description: store.description || '',
  gluten_free_options: store.gluten_free_options || '',
  opening_hours: store.opening_hours || ''
}));

console.log(`✅ 変換済み店舗数: ${stores.length}`);
console.log(JSON.stringify(stores, null, 2));

// ファイル出力用
fs.writeFileSync('real-stores.json', JSON.stringify(stores, null, 2));