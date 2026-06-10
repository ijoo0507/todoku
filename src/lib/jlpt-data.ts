import { JLPTLevel, PlacementWord } from '@/types';

// JLPT word sets — dictionary (basic) forms, as returned by kuromoji basic_form
// Expandable: add more words per level for better coverage

export const JLPT_WORDS: Record<JLPTLevel, Set<string>> = {
  N5: new Set([
    // verbs
    '食べる','飲む','見る','聞く','話す','読む','書く','行く','来る','帰る',
    '入る','出る','起きる','寝る','買う','売る','持つ','使う','教える','習う',
    '働く','休む','遊ぶ','泳ぐ','走る','乗る','降りる','開ける','閉める','洗う',
    '作る','切る','押す','引く','待つ','会う','知る','分かる','できる','ある',
    'いる','する','なる','思う','言う','見える','聞こえる','始まる','終わる',
    // adjectives
    '好き','嫌い','大きい','小さい','新しい','古い','良い','悪い','高い','安い',
    '長い','短い','暑い','寒い','暖かい','涼しい','難しい','易しい','楽しい',
    '悲しい','嬉しい','怖い','忙しい','暇','元気','大丈夫','上手','下手',
    '有名','親切','静か','綺麗',
    // nouns - people
    '人','子供','大人','男','女','父','母','兄','姉','弟','妹','友達','先生',
    '学生','生徒','名前','家族',
    // nouns - places
    '学校','家','部屋','日本','国','駅','空港','銀行','病院','郵便局','店','公園',
    // nouns - things
    'ドア','窓','机','椅子','本','雑誌','新聞','電車','バス','車','飛行機',
    // nouns - food/nature
    '水','食べ物','ご飯','パン','肉','魚','野菜','果物','コーヒー','お茶','天気',
    '雨','雪','晴れ','春','夏','秋','冬',
    // time
    '今日','明日','昨日','今','朝','昼','夜','年','月','日','時','分','秒',
    // numbers/misc
    '一','二','三','四','五','六','七','八','九','十','百','千','万','円',
    '白','黒','赤','青','緑','黄色','言葉','日本語','英語',
  ]),

  N4: new Set([
    // verbs
    '運動する','旅行する','説明する','練習する','準備する','確認する','参加する',
    '連絡する','相談する','報告する','送る','受け取る','借りる','貸す','払う',
    '決める','変える','続ける','止める','増える','減る','困る','心配する',
    '喜ぶ','怒る','泣く','笑う','驚く','急ぐ','疲れる','調べる','比べる',
    '集める','集まる','別れる','迎える','誘う','断る','申し込む','予約する',
    // adjectives
    '痛い','熱い','冷たい','甘い','辛い','苦い','美味しい','正しい','大切',
    '必要','十分','同じ','特別','普通','便利','危険','安全','複雑','簡単',
    // nouns - life
    '仕事','会社','社員','給料','電話','手紙','メール','映画','音楽','スポーツ',
    'ゲーム','料理','洗濯','掃除','買い物','散歩','運転','練習','勉強','試験',
    '合格','失敗','成功','努力','計画','予定','約束','注意',
    // nouns - transport/places
    '地下鉄','新幹線','バイク','自転車','道','橋','建物','ビル','マンション',
    'アパート','図書館','美術館','博物館','レストラン','コンビニ','スーパー',
    // nouns - abstract
    '問題','理由','目的','方法','場所','時間','機会','経験','記憶','感情',
    '意味','意見','考え','気持ち','関係','様子',
    // nouns - body/health
    '体','頭','手','足','目','耳','口','鼻','心','病気','薬','医者','看護師',
    // misc
    '初めて','最近','将来','世界','社会','文化','自然','科学','技術','教育',
  ]),

  N3: new Set([
    // verbs
    '影響する','判断する','解決する','発展する','変化する','増加する','減少する',
    '分析する','研究する','調査する','観察する','発見する','証明する','実現する',
    '達成する','改善する','実施する','導く','支える','乗り越える','取り組む',
    '表す','示す','認める','否定する','批判する','評価する','比較する','選択する',
    '優先する','確保する','維持する','促進する','妨げる',
    // adjectives/na-adj
    '重要','深刻','具体的','抽象的','様々','多様','複雑','単純','一般的',
    '特別','独特','自由','平等','正直','誠実','積極的','消極的',
    // nouns - social
    '影響','結果','原因','状況','場合','関係','立場','態度','可能性',
    '情報','知識','技術','経験','判断','決定','対策','目標','課題',
    // nouns - society
    '法律','規則','制度','政策','選挙','政治','経済','産業','農業','工業',
    '商業','輸出','輸入','貿易','競争','協力','交流','交渉','契約',
    '責任','義務','権利','自由','平等','民主',
    // nouns - culture/knowledge
    '歴史','伝統','文明','芸術','哲学','宗教','信仰','精神','心理','意識',
    '論理','理論','仮説','事実','根拠','証拠',
    // nouns - misc
    '財政','税金','収入','支出','投資','資源','エネルギー','環境',
  ]),

  N2: new Set([
    // verbs
    '概念化する','抽象化する','統合する','体系化する','分類する','定義する',
    '解釈する','推測する','仮定する','検証する','考察する','論じる',
    '矛盾する','妥協する','調和する','貢献する','損失する','主張する',
    '反論する','提唱する','批判する','懸念する','尊重する','配慮する',
    // adjectives
    '複雑','多様','独自','客観的','主観的','論理的','合理的','倫理的',
    '道徳的','哲学的','画期的','革新的','根本的','本質的','表面的',
    // nouns - academic
    '概念','抽象','具体','論理','矛盾','仮説','前提','条件','根拠','証拠',
    '客観','主観','批判','統合','体系','構造','機能','効果','効率',
    // nouns - society/governance
    '優先','緊急','貢献','損失','利益','義務','道徳','倫理','精神',
    '認識','理解','解釈','評価','推理','想像','創造','発想','革新',
    '均衡','対立','調和','補完','代替','転換','変革',
    // nouns - economics/policy
    '財政政策','金融政策','規制緩和','民営化','グローバル化','国際化',
    '少子化','高齢化','格差','貧困','福祉','保障',
  ]),

  N1: new Set([
    // N1 is hardest — rare/literary/specialized
    '概括','抽出','演繹','帰納','弁証','相対','絶対','本質','現象','理念',
    '形而上','弁論','修辞','語彙','意味論','語用論','認知','行動','進化',
    '生態','系統','形態','機能','構造','組織','制御','最適','収束',
  ]),

  unknown: new Set(),
};

// Words known at or below a given level (cumulative)
export function getKnownWords(level: JLPTLevel): Set<string> {
  const order: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const known = new Set<string>();
  for (const l of order) {
    for (const w of JLPT_WORDS[l]) known.add(w);
    if (l === level) break;
  }
  return known;
}

// 20 words for the placement test (5 per level N5-N2)
export const PLACEMENT_WORDS: PlacementWord[] = [
  // N5
  { word: '食べる', reading: 'たべる', meaning: 'to eat', level: 'N5' },
  { word: '学校', reading: 'がっこう', meaning: 'school', level: 'N5' },
  { word: '大きい', reading: 'おおきい', meaning: 'big', level: 'N5' },
  { word: '友達', reading: 'ともだち', meaning: 'friend', level: 'N5' },
  { word: '天気', reading: 'てんき', meaning: 'weather', level: 'N5' },
  // N4
  { word: '旅行', reading: 'りょこう', meaning: 'travel', level: 'N4' },
  { word: '準備', reading: 'じゅんび', meaning: 'preparation', level: 'N4' },
  { word: '経験', reading: 'けいけん', meaning: 'experience', level: 'N4' },
  { word: '気持ち', reading: 'きもち', meaning: 'feeling', level: 'N4' },
  { word: '確認', reading: 'かくにん', meaning: 'confirmation', level: 'N4' },
  // N3
  { word: '影響', reading: 'えいきょう', meaning: 'influence', level: 'N3' },
  { word: '判断', reading: 'はんだん', meaning: 'judgment', level: 'N3' },
  { word: '状況', reading: 'じょうきょう', meaning: 'situation', level: 'N3' },
  { word: '解決', reading: 'かいけつ', meaning: 'resolution', level: 'N3' },
  { word: '可能性', reading: 'かのうせい', meaning: 'possibility', level: 'N3' },
  // N2
  { word: '概念', reading: 'がいねん', meaning: 'concept', level: 'N2' },
  { word: '論理', reading: 'ろんり', meaning: 'logic', level: 'N2' },
  { word: '客観的', reading: 'きゃっかんてき', meaning: 'objective', level: 'N2' },
  { word: '貢献', reading: 'こうけん', meaning: 'contribution', level: 'N2' },
  { word: '均衡', reading: 'きんこう', meaning: 'balance/equilibrium', level: 'N2' },
];

// Determine user level from placement test answers
// answers: map of word → known (true/false)
export function inferLevel(answers: Record<string, boolean>): JLPTLevel {
  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2'];
  let highest: JLPTLevel = 'N5';

  for (const level of levels) {
    const words = PLACEMENT_WORDS.filter(w => w.level === level);
    const known = words.filter(w => answers[w.word]).length;
    if (known >= 3) highest = level; // know ≥3/5 → passes this level
  }
  return highest;
}
