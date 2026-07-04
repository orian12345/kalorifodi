/* ============================================================
   קלוריפודי — Recipes (מתכונים דיאטטיים בעברית)
   ============================================================ */

const DIET_RECIPES = [
  // ── עוף ──
  {
    id:'r_chicken_oven', cat:'עוף', emoji:'🍗', name:'חזה עוף בתנור עם ירקות',
    prepTime:10, cookTime:30, servings:2,
    kcal:290, protein:38, carbs:12, fat:8,
    tags:['עשיר בחלבון','ללא גלוטן','דל שומן'],
    ingredients:['500ג חזה עוף','1 קישוא חתוך','1 פלפל אדום חתוך','1 גזר חתוך','2 כפות שמן זית','מלח, פלפל, פפריקה, כורכום','מיץ חצי לימון'],
    instructions:`1. חממי תנור ל-200°.\n2. פרסי את חזה העוף לרצועות שוות.\n3. בקערה ערבבי שמן זית, מיץ לימון ותבלינים.\n4. צפי את העוף והירקות בתערובת התיבול.\n5. פרסי בתבנית עם נייר אפייה — עוף מצד אחד, ירקות מצד שני.\n6. אפי 28-30 דקות עד שהעוף מוכן (טמפ' פנימית 74°).\n7. הגישי חמים. ניתן להוסיף רוטב יוגורט דל שומן.`,
  },
  {
    id:'r_chicken_schnitzel', cat:'עוף', emoji:'🍗', name:'שניצל עוף בתנור (ללא טיגון)',
    prepTime:15, cookTime:25, servings:3,
    kcal:255, protein:34, carbs:14, fat:7,
    tags:['עשיר בחלבון','פחות קלוריות מטיגון'],
    ingredients:['600ג חזה עוף פרוס דק','2 ביצים','50ג פירורי לחם מלא','30ג פרמזן מגורר','מלח, פלפל, שום גרוס','1 כפית פפריקה','שמן ריסוס'],
    instructions:`1. חממי תנור ל-210° וריססי תבנית בשמן.\n2. בקערה אחת טרפי ביצים עם מלח ופלפל.\n3. בקערה שנייה ערבבי פירורי לחם, פרמזן, פפריקה ושום.\n4. טבלי כל נתח עוף בביצה ואחר כך בפירורי הלחם.\n5. סדרי על התבנית וריססי קלות שמן.\n6. אפי 12-13 דקות מכל צד עד שמשחים ופריכים.\n7. הגישי עם סלט ירוק ולימון.`,
  },
  {
    id:'r_chicken_kebab', cat:'עוף', emoji:'🍢', name:'קבב עוף בגריל',
    prepTime:20, cookTime:15, servings:3,
    kcal:230, protein:30, carbs:4, fat:10,
    tags:['עשיר בחלבון','ללא פחמימות','כשר'],
    ingredients:['500ג עוף טחון','1 בצל קטן מגורר','2 שיני שום כתושות','חופן פטרוזיליה קצוצה','1 כפית כמון','מלח, פלפל, פפריקה חריפה','1 ביצה'],
    instructions:`1. ערבבי את כל המרכיבים בקערה ולשי היטב.\n2. צרי קבבים מוארכים (כ-80ג כל אחד) סביב שיפוד.\n3. הניחי במקרר 20-30 דקות לייצוב.\n4. חממי גריל או מחבת גריל לחום גבוה.\n5. צלי את הקבבים 5-6 דקות מכל צד עד שחומים ומוכנים.\n6. הגישי עם חצי פיתה, טחינה וירקות.`,
  },
  {
    id:'r_chicken_soup', cat:'עוף', emoji:'🍲', name:'מרק עוף עם ירקות',
    prepTime:15, cookTime:60, servings:4,
    kcal:165, protein:22, carbs:10, fat:5,
    tags:['דל קלוריות','מזין','מושלם לחורף'],
    ingredients:['400ג חזה עוף שלם','2 גזרים חתוכים','2 גבעולי סלרי','1 בצל גדול קצוץ','2 שיני שום','1 קישוא','כורכום, מלח, פלפל, שמיר','1.5 ליטר מים'],
    instructions:`1. הניחי עוף ומים בסיר גדול ובשלי על אש גבוהה.\n2. הסירי את הקצף שנוצר.\n3. הוסיפי ירקות ותבלינים.\n4. הנמיכי אש, כסי ובשלי 50-60 דקות.\n5. הוצאי את העוף, פרקי לסיבים והחזירי למרק.\n6. טעמי ותתבלי. הגישי חם עם לחם מלא.`,
  },
  // ── דגים ──
  {
    id:'r_salmon_oven', cat:'דגים', emoji:'🐟', name:'פילה סלמון בתנור עם לימון',
    prepTime:5, cookTime:20, servings:2,
    kcal:340, protein:37, carbs:2, fat:19,
    tags:['אומגה 3','ללא פחמימות','מהיר'],
    ingredients:['2 פילה סלמון (150ג כל אחד)','2 כפות שמן זית','מיץ לימון שלם','3 שיני שום פרוסות','שמיר טרי','מלח ופלפל','פרוסות לימון לקישוט'],
    instructions:`1. חממי תנור ל-200°.\n2. הניחי הסלמון על נייר אפייה.\n3. מרחי שמן זית, מיץ לימון, שום, שמיר, מלח ופלפל.\n4. הניחי פרוסות לימון מעל.\n5. אפי 15-18 דקות — עד שהדג פריך מבחוץ ורך מבפנים.\n6. הגישי עם ירקות מאודים או סלט.`,
  },
  {
    id:'r_white_fish', cat:'דגים', emoji:'🐠', name:'דג לבן בתנור עם עגבניות ותבלינים',
    prepTime:10, cookTime:25, servings:2,
    kcal:215, protein:30, carbs:9, fat:7,
    tags:['דל שומן','עשיר בחלבון','ים תיכוני'],
    ingredients:['400ג פילה דג לבן (בקלה / ברמונדי / דניס)','2 עגבניות בשלות חתוכות','1 בצל פרוס','3 שיני שום','1 כף שמן זית','כמון, כורכום, פפריקה, כוסברה','מלח ופלפל','חופן כוסברה טרייה'],
    instructions:`1. חממי תנור ל-190°.\n2. בתבנית פרסי בצל ועגבניות.\n3. הניחי פילה הדג מעל.\n4. בקערה קטנה ערבבי שמן זית, שום, תבלינים ומעט מים.\n5. שפכי על הדג.\n6. כסי בנייר כסף ואפי 20 דקות, הסירי כיסוי ל-5 דקות נוספות.\n7. קשטי בכוסברה טרייה.`,
  },
  {
    id:'r_tuna_steak', cat:'דגים', emoji:'🐟', name:'סטייק טונה בגריל',
    prepTime:10, cookTime:8, servings:2,
    kcal:260, protein:38, carbs:3, fat:10,
    tags:['עשיר בחלבון','מהיר','ללא גלוטן'],
    ingredients:['2 סטייק טונה טרייה (150ג כל אחד)','1 כף שמן שומשום','2 כפות רוטב סויה מופחת נתרן','1 כפית ג\'ינג\'ר מגורר','1 שן שום כתושה','שומשום לקישוט','בצל ירוק קצוץ'],
    instructions:`1. ערבבי שמן שומשום, סויה, ג'ינג'ר ושום.\n2. השרי את הטונה 15 דקות בתערובת.\n3. חממי גריל לחום גבוה מאוד.\n4. צלי 2-3 דקות מכל צד — הטונה צריכה להישאר ורדרדה במרכז.\n5. פרסי, פזרי שומשום ובצל ירוק.\n6. הגישי מיד עם סלט מלפפון.`,
  },
  // ── ביצים ──
  {
    id:'r_egg_white_omelet', cat:'ביצים', emoji:'🍳', name:'חביתה לבנה עם ירקות',
    prepTime:5, cookTime:8, servings:1,
    kcal:145, protein:19, carbs:8, fat:4,
    tags:['דל קלוריות','עשיר בחלבון','מהיר'],
    ingredients:['4 חלבוני ביצה','1 ביצה שלמה','חצי פלפל אדום קצוץ','חצי קישוא קצוץ','5-6 עגבניות שרי חצויות','מלח, פלפל, אורגנו','ריסוס שמן זית'],
    instructions:`1. טרפי חלבונים וביצה שלמה עם מלח ופלפל.\n2. חממי מחבת טפלון עם ריסוס קל שמן.\n3. טגני את הפלפל והקישוא 2-3 דקות.\n4. שפכי תערובת ביצים על הירקות.\n5. בשלי על אש בינונית-נמוכה, בשעה שהביצה מתייצבת מלמטה.\n6. קפלי את החביתה לחצי ורסי לצלחת.\n7. הגישי עם עגבניות שרי.`,
  },
  {
    id:'r_shakshuka', cat:'ביצים', emoji:'🍳', name:'שקשוקה בריאה',
    prepTime:10, cookTime:20, servings:2,
    kcal:230, protein:14, carbs:16, fat:13,
    tags:['ים תיכוני','כשר','צמחוני'],
    ingredients:['4 ביצים','3 עגבניות בשלות חתוכות (או שימורים)','1 פלפל אדום','1 בצל קצוץ','2 שיני שום','1 כף שמן זית','כמון, פפריקה, מלח, פלפל','גבינה בולגרית מפוררת','פטרוזיליה'],
    instructions:`1. חממי שמן זית בסיר/מחבת רחבה ועמוקה.\n2. טגני בצל עד שמזהיב (5 דקות).\n3. הוסיפי שום, פלפל — טגני 2 דקות נוספות.\n4. הוסיפי עגבניות ותבלינים. בשלי 10-12 דקות עד שהרוטב מסמיך.\n5. עשי 4 גומות ברוטב ושברי ביצה לכל גומה.\n6. כסי ובשלי 4-6 דקות — עד שהביצים מוכנות לטעמך.\n7. פזרי גבינה ופטרוזיליה. הגישי עם לחם מלא.`,
  },
  // ── סלטים ──
  {
    id:'r_med_salad', cat:'סלטים', emoji:'🥗', name:'סלט ירקות ים תיכוני',
    prepTime:10, cookTime:0, servings:2,
    kcal:175, protein:4, carbs:14, fat:12,
    tags:['טבעוני','ללא גלוטן','מרענן'],
    ingredients:['3 עגבניות חתוכות','2 מלפפונים חתוכים','1 בצל סגול פרוס','100ג גבינה בולגרית מפוררת','חופן זיתים שחורים','1 מלפפון אנגלי','2 כפות שמן זית','מיץ לימון','מלח, פלפל, אורגנו'],
    instructions:`1. חתכי את כל הירקות לקוביות שוות.\n2. ערבבי בקערה גדולה.\n3. הוסיפי זיתים וגבינה מפוררת.\n4. בכוס קטנה ערבבי שמן זית, מיץ לימון, מלח, פלפל ואורגנו.\n5. שפכי על הסלט וערבבי.\n6. הגישי מיד — הסלט הכי טעים טרי.`,
  },
  {
    id:'r_tuna_salad', cat:'סלטים', emoji:'🥙', name:'סלט טונה עם ירקות',
    prepTime:10, cookTime:0, servings:1,
    kcal:225, protein:26, carbs:8, fat:9,
    tags:['עשיר בחלבון','מהיר','דל קלוריות'],
    ingredients:['1 קופסה טונה במים (160ג)','חצי מלפפון','6 עגבניות שרי חצויות','חצי בצל אדום קצוץ דק','2 כפות גרגרי חומוס מבושלים','1 כפית חרדל','1 כף שמן זית','מיץ לימון','מלח ופלפל'],
    instructions:`1. סנני את הטונה היטב ופרקי בקערה.\n2. חתכי ירקות לחתיכות קטנות.\n3. ערבבי טונה, ירקות וחומוס.\n4. הכיני רוטב: שמן זית + חרדל + לימון + מלח.\n5. שפכי על הסלט, ערבבי.\n6. הגישי על עלי חסה או עם לחם קל.`,
  },
  {
    id:'r_quinoa_salad', cat:'סלטים', emoji:'🥗', name:'סלט קינואה עם ירקות ועשבים',
    prepTime:15, cookTime:15, servings:3,
    kcal:290, protein:10, carbs:36, fat:11,
    tags:['טבעוני','ללא גלוטן','עשיר בסיבים'],
    ingredients:['1 כוס קינואה','2 כוסות מים','1 מלפפון','2 עגבניות','חצי בצל אדום','חופן עלי נענע','חופן פטרוזיליה קצוצה','50ג אגוזי אורן','3 כפות שמן זית','מיץ לימון שלם','מלח ופלפל'],
    instructions:`1. שטפי קינואה היטב וסנני.\n2. בשלי קינואה עם מים רותחים 15 דקות עד שהמים נספגים.\n3. קררי לגמרי (חשוב!).\n4. חתכי ירקות לקוביות קטנות.\n5. ערבבי קינואה קרה, ירקות, עשבים ואגוזי אורן.\n6. תבלי בשמן זית, לימון, מלח ופלפל.\n7. הגישי קר — מחזיק 3 ימים במקרר.`,
  },
  // ── מרקים ──
  {
    id:'r_lentil_soup', cat:'מרקים', emoji:'🍲', name:'מרק עדשים',
    prepTime:10, cookTime:35, servings:4,
    kcal:220, protein:13, carbs:34, fat:4,
    tags:['צמחוני','עשיר בסיבים','פרווה'],
    ingredients:['1.5 כוס עדשות כתומות שטופות','1 בצל גדול קצוץ','2 גזרים חתוכים','4 שיני שום','1.5 ליטר מים','1 כף שמן זית','כמון, כורכום, פפריקה','מלח ופלפל','מיץ לימון לטעם','כוסברה טרייה'],
    instructions:`1. חממי שמן זית בסיר גדול. טגני בצל עד שמזהיב.\n2. הוסיפי שום וגזרים — 2 דקות נוספות.\n3. הוסיפי עדשות, מים ותבלינים.\n4. הביאי לרתיחה, הנמיכי אש, כסי ובשלי 25-30 דקות.\n5. בלנדרי חלק מהמרק לקרמיות (אופציונלי).\n6. הוסיפי מיץ לימון וטעמי.\n7. הגישי עם כוסברה ולחם מלא.`,
  },
  {
    id:'r_veggie_soup', cat:'מרקים', emoji:'🍜', name:'מרק ירקות עם קטניות',
    prepTime:15, cookTime:30, servings:4,
    kcal:185, protein:9, carbs:28, fat:4,
    tags:['טבעוני','דל קלוריות','מזין'],
    ingredients:['2 גזרים','2 גבעולי סלרי','1 בצל','1 קישוא','100ג שעועית לבנה מבושלת','100ג אפונה','1 עגבנייה','1 תפוח אדמה בינוני','1.5 ליטר מים','תיבול: אורגנו, מלח, פלפל, דפנה'],
    instructions:`1. חתכי את כל הירקות לקוביות בגודל שווה.\n2. בשלי בצל וגזר 3-4 דקות בסיר עם מעט שמן.\n3. הוסיפי שאר הירקות, מים ותבלינים.\n4. הביאי לרתיחה, הנמיכי ובשלי 20-25 דקות.\n5. הוסיפי קטניות ל-5 הדקות האחרונות.\n6. טעמי ותתבלי. הגישי חם.`,
  },
  // ── צמחוני / בריאות ──
  {
    id:'r_stuffed_eggplant', cat:'צמחוני', emoji:'🍆', name:'חציל ממולא בשר טחון ועגבניות',
    prepTime:20, cookTime:40, servings:2,
    kcal:285, protein:22, carbs:14, fat:16,
    tags:['עשיר בחלבון','ים תיכוני'],
    ingredients:['2 חצילים גדולים','300ג בשר עגל טחון','2 עגבניות קצוצות','1 בצל קצוץ','2 שיני שום','מלח, פלפל, כמון, קינמון','1 כף שמן זית','פטרוזיליה קצוצה'],
    instructions:`1. חתכי חצילים לאורך וחפרי את הפנים (שמרי את הבשר).\n2. טגני בצל ושום עד שמזהיבים.\n3. הוסיפי בשר טחון — בשלי עד שמשחים.\n4. הוסיפי עגבניות, בשר חציל קצוץ, תבלינים.\n5. בשלי 10 דקות עד שהתערובת מסמיכה.\n6. מלאי את קלופי החציל בתערובת.\n7. אפי 30 דקות ב-180° עד שהחציל רך.`,
  },
  {
    id:'r_hummus', cat:'צמחוני', emoji:'🫙', name:'חומוס ביתי בריא',
    prepTime:15, cookTime:0, servings:6,
    kcal:160, protein:7, carbs:18, fat:7,
    tags:['טבעוני','עשיר בסיבים','ללא גלוטן'],
    ingredients:['400ג חומוס מבושל (קנוי/שימורים)','3 כפות טחינה גולמית','מיץ לימון שלם','2 שיני שום','2 כפות שמן זית','מלח','מעט קרח','פפריקה ושמן לגימור'],
    instructions:`1. שמי חומוס, טחינה, לימון, שום ומלח בבלנדר.\n2. הוסיפי 2-3 קוביות קרח (לחומוס אוורירי!).\n3. טחני 3-4 דקות עד לקרמיות מרבית.\n4. הוסיפי שמן זית — טחני עוד דקה.\n5. טעמי ותתני: יותר לימון/מלח/טחינה לפי הטעם.\n6. העבירי לצלחת, עשי גומה, מלאי בשמן זית ופפריקה.`,
  },
  // ── ארוחת בוקר ──
  {
    id:'r_oat_pancakes', cat:'בוקר', emoji:'🥞', name:'פנקייק שיבולת שועל',
    prepTime:5, cookTime:10, servings:1,
    kcal:285, protein:18, carbs:30, fat:9,
    tags:['עשיר בחלבון','ללא קמח','בריא'],
    ingredients:['50ג שיבולת שועל','2 ביצים','1 בננה בשלה','1 כפית אבקת אפייה','חצי כפית וניל','קינמון','ריסוס שמן'],
    instructions:`1. בלנדרי שיבולת שועל, ביצים, בננה, אבקת אפייה וניל וקינמון.\n2. הניחי 2-3 דקות לנפיחה.\n3. חממי מחבת טפלון עם ריסוס קל שמן.\n4. שפכי כ-4 כפות בצק לכל פנקייק.\n5. בשלי 2-3 דקות עד שבועיות, הפכי ועוד 2 דקות.\n6. הגישי עם יוגורט 0% ופירות טריים.`,
  },
  {
    id:'r_yogurt_bowl', cat:'בוקר', emoji:'🍓', name:'קערת יוגורט עם פירות ואגוזים',
    prepTime:5, cookTime:0, servings:1,
    kcal:310, protein:18, carbs:32, fat:11,
    tags:['מהיר','עשיר בחלבון','ללא בישול'],
    ingredients:['200ג יוגורט יווני 0% שומן','חופן תות/אוכמניות','1 בננה פרוסה','2 כפות גרנולה ביתית','1 כף דבש','1 כף שקדים פרוסים','מעט קינמון'],
    instructions:`1. שמי יוגורט יווני בקערה.\n2. פרסי פירות טרי מעל.\n3. פזרי גרנולה ושקדים.\n4. טפטפי דבש.\n5. אבקי קינמון.\n6. הגישי מיד (הגרנולה תרטב אם תמתיני).`,
  },
  {
    id:'r_avocado_toast', cat:'בוקר', emoji:'🥑', name:'טוסט אבוקדו עם ביצה',
    prepTime:5, cookTime:5, servings:1,
    kcal:330, protein:16, carbs:28, fat:18,
    tags:['שומן בריא','מהיר','סטודנטים'],
    ingredients:['2 פרוסות לחם מלא','1 אבוקדו בשל','2 ביצים','מלח, פלפל שחור','פלפל חריף (אופציונלי)','מיץ לימון','בצל ירוק קצוץ','עגבניות שרי'],
    instructions:`1. צלי פרוסות לחם בטוסטר.\n2. ערבלי אבוקדו עם מלח, פלפל ולימון.\n3. מרחי אבוקדו על הלחם.\n4. בשלי ביצה עין או מקושקשת לפי הבחירה.\n5. הניחי ביצה על האבוקדו.\n6. קשטי בבצל ירוק, עגבניות שרי ופלפל שחור.`,
  },
];

const CATS = [...new Set(DIET_RECIPES.map(r => r.cat))].map(c => {
  const emo = {עוף:'🍗',דגים:'🐟',ביצים:'🍳',סלטים:'🥗',מרקים:'🍲',צמחוני:'🥦',בוקר:'🌅'}[c] || '🍽️';
  return { id: c, label: c, emoji: emo };
});

const TAG_COLORS = {
  'עשיר בחלבון':   { bg:'var(--pink-soft)',   c:'var(--pink-deep)'  },
  'ללא גלוטן':     { bg:'var(--green-soft)',  c:'var(--green-deep)' },
  'דל קלוריות':   { bg:'var(--water-soft)',  c:'var(--water)'      },
  'דל שומן':       { bg:'var(--water-soft)',  c:'var(--water)'      },
  'מהיר':          { bg:'var(--carb)',         c:'#fff'              },
  'ים תיכוני':     { bg:'var(--green-soft)',  c:'var(--green-deep)' },
  default:          { bg:'var(--bg)',           c:'var(--ink-soft)'  },
};

function RecipeTag({ label }) {
  const s = TAG_COLORS[label] || TAG_COLORS.default;
  return (
    <span style={{ fontSize: 11, background: s.bg, color: s.c, borderRadius: 8, padding: '2px 8px', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
  );
}

function MacroBar({ kcal, protein, carbs, fat }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, margin: '16px 0' }}>
      {[['קלוריות', kcal, 'קק"ל', 'var(--green)'],
        ['חלבון',   protein, 'ג׳',  'var(--pink)'],
        ['פחמ׳',    carbs,  'ג׳',  'var(--carb)'],
        ['שומן',    fat,    'ג׳',  'var(--fat)']
      ].map(([l, v, u, c]) => (
        <div key={l} style={{ background: 'var(--card)', borderRadius: 14, padding: '10px 4px', textAlign: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: 3, background: c, margin: '0 auto 5px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>{v}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>{u}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-soft)' }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function Recipes({ initialCategory }) {
  const [view, setView]   = React.useState('categories');
  const [cat,  setCat]    = React.useState(null);
  const [recipe, setRecipe] = React.useState(null);
  const [searchQ, setSearchQ] = React.useState('');
  const [searchRes, setSearchRes] = React.useState(null);

  React.useEffect(() => {
    if (!initialCategory) return;
    const c = CATS.find(c => c.id === initialCategory);
    if (c) openCat(c);
  }, [initialCategory]);

  const openCat = (c) => { setCat(c); setSearchRes(null); setView('list'); };

  const doSearch = () => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return;
    const res = DIET_RECIPES.filter(r =>
      r.name.includes(searchQ.trim()) ||
      r.cat.includes(searchQ.trim()) ||
      r.ingredients.some(i => i.includes(searchQ.trim())) ||
      r.tags.some(t => t.includes(searchQ.trim()))
    );
    setSearchRes(res); setCat(null); setView('list');
  };

  const list = searchRes !== null ? searchRes
    : cat ? DIET_RECIPES.filter(r => r.cat === cat.id)
    : DIET_RECIPES;

  // ── detail ──────────────────────────────────────────────────────
  if (view === 'detail' && recipe) {
    const catColor = { עוף:'#FFF5E5', דגים:'#E5F3FF', ביצים:'#FFF9E5', סלטים:'#E8F5E9', מרקים:'#FCE4EC', צמחוני:'#E8F5E9', בוקר:'#FFF3E0' }[recipe.cat] || 'var(--green-soft)';
    return (
      <div style={{ height:'100%', overflow:'auto', background:'var(--bg)', paddingBottom:112 }}>
        {/* header */}
        <div style={{ background: catColor, padding:'60px 20px 24px', position:'relative' }}>
          <button onClick={() => setView('list')} style={{ position:'absolute', top:50, right:18, border:'none', background:'rgba(255,255,255,.85)', width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Icon.back s={20} c="var(--ink)" />
          </button>
          <div style={{ fontSize:60, textAlign:'center', marginBottom:12 }}>{recipe.emoji}</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', margin:'0 0 8px', textAlign:'center', lineHeight:1.3 }}>{recipe.name}</h2>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center', marginBottom:8 }}>
            {recipe.tags.map(t => <RecipeTag key={t} label={t} />)}
          </div>
          <div style={{ display:'flex', gap:16, justifyContent:'center', fontSize:12.5, color:'var(--ink-soft)', marginTop:6 }}>
            <span>⏱ הכנה: {recipe.prepTime} דק'</span>
            <span>🔥 בישול: {recipe.cookTime} דק'</span>
            <span>🍽 {recipe.servings} מנות</span>
          </div>
        </div>

        <div style={{ padding:'0 18px' }}>
          {/* macros per serving */}
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:13, color:'var(--ink-soft)', fontWeight:600, marginBottom:4 }}>ערכים תזונתיים למנה</div>
            <MacroBar kcal={recipe.kcal} protein={recipe.protein} carbs={recipe.carbs} fat={recipe.fat} />
          </div>

          {/* ingredients */}
          <div style={{ fontSize:15, fontWeight:600, color:'var(--ink)', margin:'16px 0 10px' }}>מרכיבים ({recipe.ingredients.length})</div>
          <div style={{ background:'var(--card)', borderRadius:18, padding:'6px 16px', marginBottom:18 }}>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom: i < recipe.ingredients.length-1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', flexShrink:0 }} />
                <span style={{ fontSize:14, color:'var(--ink)' }}>{ing}</span>
              </div>
            ))}
          </div>

          {/* instructions */}
          <div style={{ fontSize:15, fontWeight:600, color:'var(--ink)', marginBottom:10 }}>הוראות הכנה</div>
          <div style={{ background:'var(--card)', borderRadius:18, padding:'16px', marginBottom:20 }}>
            <p style={{ fontSize:14, color:'var(--ink)', lineHeight:1.9, margin:0, whiteSpace:'pre-wrap' }}>{recipe.instructions}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── list ────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div style={{ height:'100%', overflow:'auto', background:'var(--bg)', paddingBottom:112 }}>
        <div style={{ padding:'58px 22px 0', display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={() => { setView('categories'); setSearchRes(null); setSearchQ(''); }}
            style={{ border:'none', background:'var(--card)', width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
            <Icon.back s={20} c="var(--ink)" />
          </button>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', margin:0 }}>
            {cat ? `${cat.emoji} ${cat.label}` : `חיפוש: "${searchQ}"`}
          </h1>
        </div>
        <div style={{ padding:'16px 18px 0', display:'flex', flexDirection:'column', gap:12 }}>
          {list.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--ink-soft)', fontSize:14 }}>לא נמצאו מתכונים</div>
          ) : list.map(r => (
            <button key={r.id} onClick={() => { setRecipe(r); setView('detail'); }}
              style={{ border:'none', cursor:'pointer', background:'var(--card)', borderRadius:18, padding:'16px', display:'flex', alignItems:'center', gap:14, textAlign:'start', boxShadow:'0 2px 10px -6px rgba(0,0,0,.15)' }}>
              <div style={{ width:60, height:60, borderRadius:14, background:'var(--green-soft)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>{r.emoji}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:600, color:'var(--ink)', marginBottom:4, lineHeight:1.3 }}>{r.name}</div>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:5 }}>
                  {r.tags.slice(0,2).map(t => <RecipeTag key={t} label={t} />)}
                </div>
                <div style={{ fontSize:12, color:'var(--ink-soft)' }}>
                  {r.kcal} קק"ל · {r.protein}ג חלבון · {r.prepTime+r.cookTime} דק' סה"כ
                </div>
              </div>
              <Icon.back s={18} c="var(--ink-soft)" style={{ transform:'scaleX(-1)', flexShrink:0 }} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── categories ──────────────────────────────────────────────────
  return (
    <div style={{ height:'100%', overflow:'auto', background:'var(--bg)', paddingBottom:112 }}>
      <div style={{ padding:'60px 22px 16px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:27, color:'var(--ink)', margin:0, letterSpacing:'-.3px' }}>מתכונים דיאטטיים</h1>
        <p style={{ fontSize:14, color:'var(--ink-soft)', margin:'4px 0 16px' }}>בריאים, קלים להכנה ובעברית</p>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ position:'relative', flex:1 }}>
            <span style={{ position:'absolute', insetInlineStart:14, top:'50%', transform:'translateY(-50%)' }}>
              <Icon.search s={18} c="var(--ink-soft)" />
            </span>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => e.key==='Enter' && doSearch()}
              placeholder="חיפוש לפי שם, מרכיב, תג…"
              style={{ width:'100%', boxSizing:'border-box', border:'none', background:'var(--card)', borderRadius:14, padding:'13px 14px 13px 42px', fontSize:15, fontFamily:'var(--font-body)', color:'var(--ink)', outline:'none' }} />
          </div>
          <button onClick={doSearch}
            style={{ border:'none', cursor:'pointer', background:'var(--green)', borderRadius:14, padding:'0 18px', color:'#fff', fontSize:14, fontWeight:600, fontFamily:'var(--font-body)' }}>
            חפשי
          </button>
        </div>
      </div>

      <div style={{ padding:'0 18px' }}>
        <div style={{ fontSize:13, color:'var(--ink-soft)', fontWeight:500, margin:'0 2px 10px' }}>קטגוריות</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {CATS.map(cat => (
            <button key={cat.id} onClick={() => openCat(cat)}
              style={{ border:'none', cursor:'pointer', background:'var(--card)', borderRadius:20, padding:'22px 18px', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:10, boxShadow:'0 2px 14px -8px rgba(120,90,70,.25)', textAlign:'start' }}>
              <span style={{ fontSize:32 }}>{cat.emoji}</span>
              <div>
                <div style={{ fontSize:16, fontWeight:600, color:'var(--ink)', fontFamily:'var(--font-body)' }}>{cat.label}</div>
                <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2 }}>{DIET_RECIPES.filter(r=>r.cat===cat.id).length} מתכונים</div>
              </div>
            </button>
          ))}
        </div>

        {/* all recipes strip */}
        <div style={{ fontSize:13, color:'var(--ink-soft)', fontWeight:500, margin:'20px 2px 10px' }}>כל המתכונים</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          {DIET_RECIPES.map(r => (
            <button key={r.id} onClick={() => { setRecipe(r); setView('detail'); }}
              style={{ border:'none', cursor:'pointer', background:'var(--card)', borderRadius:16, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, textAlign:'start' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'var(--green-soft)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{r.emoji}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14.5, fontWeight:600, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.name}</div>
                <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2 }}>{r.kcal} קק"ל · {r.protein}ג חלבון</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Recipes });
