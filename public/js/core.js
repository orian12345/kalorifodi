/* ============================================================
   קלוריפודי — core logic: nutrition math, food DB, persistence
   Plain JS, attaches everything to window.KP
   ============================================================ */
(function () {
  const TODAY = () => new Date().toISOString().slice(0, 10);

  // ---- nutrition targets (Mifflin–St Jeor) ----
  function calcTargets(p) {
    const w = +p.weight, h = +p.height, a = +p.age;
    let bmr = 10 * w + 6.25 * h - 5 * a + (p.gender === 'female' ? -161 : 5);
    const factor = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 }[p.activity] || 1.375;
    let tdee = bmr * factor;
    if (p.goal === 'lose') tdee -= 500;
    else if (p.goal === 'gain') tdee += 350;
    const calories = Math.max(1200, Math.round(tdee / 10) * 10);
    const proteinPerKg = p.goal === 'lose' ? 2.0 : p.goal === 'gain' ? 1.9 : 1.6;
    const protein = Math.round(w * proteinPerKg);
    const fat = Math.round((calories * 0.27) / 9);
    const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
    const water = Math.round((w * 33) / 50) * 50; // ml, round to 50
    return { calories, protein, carbs, fat, water, bmr: Math.round(bmr), tdee: Math.round(tdee) };
  }

  const ACTIVITY = [
    { id: 'sedentary', label: 'יושבני', desc: 'רוב היום בישיבה, מעט תנועה' },
    { id: 'light', label: 'קל', desc: 'אימון קל 1–3 פעמים בשבוע' },
    { id: 'moderate', label: 'בינוני', desc: 'אימון 3–5 פעמים בשבוע' },
    { id: 'active', label: 'פעיל', desc: 'אימון 6–7 פעמים בשבוע' },
    { id: 'athlete', label: 'ספורטיבי מאוד', desc: 'אימונים אינטנסיביים / עבודה פיזית' },
  ];
  const GOALS = [
    { id: 'lose', label: 'ירידה במשקל', desc: 'גירעון קלורי מתון', emoji: '🌿' },
    { id: 'maintain', label: 'שמירה על משקל', desc: 'איזון קלורי', emoji: '⚖️' },
    { id: 'gain', label: 'עלייה במסת שריר', desc: 'עודף קלורי מתון', emoji: '💪' },
  ];

  // ---- food database (per serving) ----
  // p=protein c=carbs f=fat (grams), kcal per the given serving, grams=serving weight in grams
  const FOODS = [
    // ── ביצים ──
    { id:'egg',            name:'ביצה קשה',           icon:'🥚', serving:'יחידה',      kcal:78,  p:6,  c:1,  f:5,  grams:60  },
    { id:'egg_fried',      name:'ביצת עין',            icon:'🍳', serving:'יחידה',      kcal:90,  p:6,  c:0,  f:7,  grams:60  },
    { id:'omelet',         name:'חביתה 2 ביצים',       icon:'🍳', serving:'מנה',        kcal:180, p:12, c:2,  f:14, grams:120 },
    { id:'scrambled',      name:'ביצים מקושקשות',      icon:'🍳', serving:'2 ביצים',    kcal:200, p:13, c:2,  f:15, grams:130 },
    { id:'egg_white',      name:'חלבון ביצה',          icon:'🥚', serving:'יחידה',      kcal:17,  p:4,  c:0,  f:0,  grams:33  },

    // ── לחמים ומאפים ──
    { id:'bread',          name:'פרוסת לחם מלא',       icon:'🍞', serving:'פרוסה',      kcal:80,  p:4,  c:14, f:1,  grams:30  },
    { id:'bread_white',    name:'פרוסת לחם לבן',       icon:'🍞', serving:'פרוסה',      kcal:75,  p:3,  c:15, f:1,  grams:28  },
    { id:'bread_rye',      name:'לחם שיפון',           icon:'🍞', serving:'פרוסה',      kcal:65,  p:3,  c:12, f:1,  grams:25  },
    { id:'bread_light',    name:'לחם קל',              icon:'🍞', serving:'פרוסה',      kcal:45,  p:3,  c:8,  f:1,  grams:20  },
    { id:'bread_spelt',    name:'לחם כוסמין',          icon:'🍞', serving:'פרוסה',      kcal:85,  p:4,  c:16, f:1,  grams:32  },
    { id:'pita',           name:'פיתה לבנה',           icon:'🫓', serving:'יחידה',      kcal:165, p:5,  c:33, f:1,  grams:75  },
    { id:'pita_whole',     name:'פיתה מלאה',           icon:'🫓', serving:'יחידה',      kcal:150, p:6,  c:29, f:2,  grams:75  },
    { id:'laffa',          name:'לאפה',                icon:'🫓', serving:'יחידה',      kcal:300, p:9,  c:58, f:4,  grams:135 },
    { id:'bagel',          name:'בייגל ירושלמי',       icon:'🥯', serving:'יחידה',      kcal:270, p:9,  c:52, f:3,  grams:115 },
    { id:'challah',        name:'חלה',                 icon:'🍞', serving:'פרוסה',      kcal:120, p:4,  c:22, f:2,  grams:45  },
    { id:'baguette',       name:'באגט',                icon:'🥖', serving:'100ג',       kcal:275, p:9,  c:54, f:1,  grams:100 },
    { id:'roll',           name:'לחמנייה',             icon:'🥖', serving:'יחידה',      kcal:150, p:5,  c:28, f:2,  grams:55  },
    { id:'croissant',      name:'קרואסון',             icon:'🥐', serving:'יחידה',      kcal:230, p:5,  c:26, f:12, grams:60  },
    { id:'tortilla',       name:'טורטייה קמח',         icon:'🫓', serving:'יחידה',      kcal:200, p:5,  c:36, f:4,  grams:72  },
    { id:'tortilla_corn',  name:'טורטייה תירס',        icon:'🫓', serving:'יחידה',      kcal:120, p:3,  c:24, f:2,  grams:45  },
    { id:'cracker',        name:'קרקר מלוח',           icon:'🫙', serving:'5 יחידות',   kcal:100, p:2,  c:16, f:3,  grams:28  },
    { id:'matza',          name:'מצה',                 icon:'🫓', serving:'יחידה',      kcal:112, p:3,  c:24, f:0,  grams:32  },
    { id:'toast',          name:'טוסט (שתי פרוסות)',   icon:'🍞', serving:'2 פרוסות',   kcal:160, p:6,  c:30, f:2,  grams:60  },
    { id:'pita_chips',     name:'צ׳יפס פיתה',          icon:'🫓', serving:'20ג',        kcal:90,  p:2,  c:14, f:3,  grams:20  },
    { id:'bread_stick',    name:'גריסיני',             icon:'🥖', serving:'5 יחידות',   kcal:110, p:3,  c:21, f:2,  grams:30  },

    // ── דגנים ודיסות ──
    { id:'oats',           name:'שיבולת שועל',         icon:'🥣', serving:'50ג יבש',    kcal:190, p:7,  c:33, f:3,  grams:50  },
    { id:'granola',        name:'גרנולה',              icon:'🥣', serving:'50ג',        kcal:220, p:5,  c:35, f:7,  grams:50  },
    { id:'cornflakes',     name:'קורנפלקס',            icon:'🥣', serving:'30ג',        kcal:115, p:2,  c:26, f:0,  grams:30  },
    { id:'musli',          name:'מוסלי',               icon:'🥣', serving:'50ג',        kcal:195, p:6,  c:35, f:4,  grams:50  },
    { id:'rice_cakes',     name:'עוגות אורז',          icon:'🫙', serving:'2 יחידות',   kcal:70,  p:1,  c:15, f:0,  grams:18  },
    { id:'buckwheat',      name:'כוסמת מבושלת',        icon:'🌾', serving:'100ג',       kcal:92,  p:3,  c:20, f:1,  grams:100 },
    { id:'bulgur',         name:'בורגול מבושל',        icon:'🌾', serving:'100ג',       kcal:83,  p:3,  c:18, f:0,  grams:100 },
    { id:'couscous',       name:'קוסקוס מבושל',        icon:'🌾', serving:'100ג',       kcal:112, p:4,  c:23, f:0,  grams:100 },
    { id:'millet',         name:'דוחן מבושל',          icon:'🌾', serving:'100ג',       kcal:119, p:3,  c:24, f:1,  grams:100 },
    { id:'semolina',       name:'סולת',                icon:'🌾', serving:'30ג',        kcal:105, p:4,  c:22, f:0,  grams:30  },
    { id:'wheat_germ',     name:'נבט חיטה',            icon:'🌾', serving:'2 כפות',     kcal:45,  p:3,  c:6,  f:1,  grams:14  },

    // ── אורז ופסטה ──
    { id:'rice',           name:'אורז לבן מבושל',      icon:'🍚', serving:'כוס',        kcal:205, p:4,  c:45, f:0,  grams:160 },
    { id:'rice_brown',     name:'אורז מלא מבושל',      icon:'🍚', serving:'כוס',        kcal:215, p:5,  c:45, f:2,  grams:195 },
    { id:'rice_basmati',   name:'אורז בסמטי',          icon:'🍚', serving:'כוס',        kcal:200, p:4,  c:44, f:0,  grams:160 },
    { id:'pasta',          name:'פסטה מבושלת',         icon:'🍝', serving:'כוס',        kcal:220, p:8,  c:43, f:1,  grams:140 },
    { id:'pasta_whole',    name:'פסטה מלאה מבושלת',    icon:'🍝', serving:'כוס',        kcal:200, p:8,  c:40, f:1,  grams:140 },
    { id:'spaghetti',      name:'ספגטי מבושל',         icon:'🍝', serving:'כוס',        kcal:220, p:8,  c:43, f:1,  grams:140 },
    { id:'noodles',        name:'אטריות ביצה',         icon:'🍜', serving:'כוס',        kcal:220, p:8,  c:40, f:3,  grams:140 },
    { id:'rice_noodles',   name:'אטריות אורז',         icon:'🍜', serving:'כוס',        kcal:190, p:3,  c:43, f:0,  grams:140 },
    { id:'quinoa',         name:'קינואה מבושלת',       icon:'🌾', serving:'כוס',        kcal:220, p:8,  c:39, f:4,  grams:185 },
    { id:'pasta_sauce',    name:'פסטה ברוטב עגבניות',  icon:'🍝', serving:'כוס',        kcal:260, p:9,  c:47, f:4,  grams:200 },

    // ── מוצרי חלב — יוגורטים ──
    { id:'yogurt_0',       name:'יוגורט 0%',           icon:'🥛', serving:'גביע 150ג',  kcal:60,  p:8,  c:7,  f:0,  grams:150 },
    { id:'yogurt_1',       name:'יוגורט 1.5%',         icon:'🥛', serving:'גביע 150ג',  kcal:75,  p:8,  c:7,  f:1,  grams:150 },
    { id:'yogurt_3',       name:'יוגורט 3%',           icon:'🥛', serving:'גביע 150ג',  kcal:95,  p:8,  c:7,  f:3,  grams:150 },
    { id:'yogurt_greek_0', name:'יוגורט יווני 0%',     icon:'🥛', serving:'גביע 150ג',  kcal:90,  p:15, c:6,  f:0,  grams:150 },
    { id:'yogurt_greek_2', name:'יוגורט יווני 2%',     icon:'🥛', serving:'גביע 150ג',  kcal:105, p:14, c:6,  f:2,  grams:150 },
    { id:'yogurt_greek_5', name:'יוגורט יווני 5%',     icon:'🥛', serving:'גביע 150ג',  kcal:135, p:13, c:5,  f:5,  grams:150 },
    { id:'yogurt_pro',     name:'יוגורט PRO',          icon:'🥛', serving:'גביע 200ג',  kcal:140, p:20, c:8,  f:3,  grams:200 },
    { id:'yogurt_fruit',   name:'יוגורט פירות',        icon:'🥛', serving:'גביע 150ג',  kcal:120, p:5,  c:20, f:2,  grams:150 },
    { id:'yogurt_straw',   name:'יוגורט תות',          icon:'🥛', serving:'גביע 150ג',  kcal:115, p:5,  c:19, f:2,  grams:150 },
    { id:'yogurt_van',     name:'יוגורט וניל',         icon:'🥛', serving:'גביע 150ג',  kcal:120, p:5,  c:20, f:2,  grams:150 },
    { id:'yogurt_blue',    name:'יוגורט אוכמניות',     icon:'🥛', serving:'גביע 150ג',  kcal:118, p:5,  c:20, f:2,  grams:150 },
    { id:'laban',          name:'לבן שתייה 1%',        icon:'🥛', serving:'כוס',        kcal:110, p:9,  c:14, f:1,  grams:240 },
    { id:'laban_3',        name:'לבן שתייה 3%',        icon:'🥛', serving:'כוס',        kcal:145, p:8,  c:13, f:6,  grams:240 },
    { id:'seli',           name:'סלי',                 icon:'🥛', serving:'גביע',       kcal:85,  p:7,  c:11, f:1,  grams:125 },
    { id:'danona',         name:'דנונה',               icon:'🥛', serving:'גביע',       kcal:130, p:5,  c:20, f:3,  grams:125 },
    { id:'bio',            name:'ביו',                 icon:'🥛', serving:'גביע',       kcal:100, p:5,  c:17, f:2,  grams:125 },
    { id:'activia',        name:'אקטיביה',             icon:'🥛', serving:'גביע',       kcal:130, p:5,  c:20, f:3,  grams:125 },
    { id:'yotvata_yog',    name:'יוגורט יוטבתה',       icon:'🥛', serving:'גביע 150ג',  kcal:95,  p:8,  c:8,  f:2,  grams:150 },
    { id:'yogurt_drink',   name:'יוגורט שתייה',        icon:'🥛', serving:'בקבוק 200מל', kcal:140, p:9,  c:20, f:3,  grams:200 },
    { id:'labneh',         name:'לאבנה',               icon:'🧀', serving:'כף גדולה',   kcal:80,  p:5,  c:3,  f:6,  grams:50  },

    // ── מוצרי חלב — גבינות ──
    { id:'cottage',        name:'קוטג׳ 5%',            icon:'🧀', serving:'גביע 250ג',  kcal:230, p:28, c:9,  f:12, grams:250 },
    { id:'cottage_1',      name:'קוטג׳ 1%',            icon:'🧀', serving:'גביע 250ג',  kcal:160, p:28, c:9,  f:2,  grams:250 },
    { id:'cheese_white5',  name:'גבינה לבנה 5%',       icon:'🧀', serving:'100ג',       kcal:105, p:9,  c:4,  f:5,  grams:100 },
    { id:'cheese_white9',  name:'גבינה לבנה 9%',       icon:'🧀', serving:'100ג',       kcal:140, p:8,  c:4,  f:9,  grams:100 },
    { id:'cheese_bulg',    name:'גבינה בולגרית 16%',   icon:'🧀', serving:'30ג',        kcal:80,  p:6,  c:1,  f:6,  grams:30  },
    { id:'cheese_feta',    name:'גבינת פטה',           icon:'🧀', serving:'30ג',        kcal:75,  p:4,  c:1,  f:6,  grams:30  },
    { id:'cheese_yellow',  name:'גבינה צהובה 28%',     icon:'🧀', serving:'פרוסה',      kcal:80,  p:6,  c:1,  f:6,  grams:20  },
    { id:'cheese_emek',    name:'עמק',                 icon:'🧀', serving:'פרוסה',      kcal:85,  p:6,  c:1,  f:6,  grams:20  },
    { id:'cheese_tzfatit', name:'גבינה צפתית',         icon:'🧀', serving:'30ג',        kcal:90,  p:7,  c:1,  f:7,  grams:30  },
    { id:'mozzarella',     name:'מוצרלה',              icon:'🧀', serving:'30ג',        kcal:85,  p:6,  c:1,  f:6,  grams:30  },
    { id:'ricotta',        name:'ריקוטה',              icon:'🧀', serving:'50ג',        kcal:72,  p:5,  c:2,  f:5,  grams:50  },
    { id:'parmesan',       name:'פרמזן',               icon:'🧀', serving:'כף',         kcal:55,  p:5,  c:0,  f:4,  grams:14  },
    { id:'gouda',          name:'גאודה',               icon:'🧀', serving:'פרוסה',      kcal:100, p:7,  c:1,  f:8,  grams:25  },
    { id:'cream_cheese',   name:'שמנת גבינה',          icon:'🧀', serving:'כף',         kcal:70,  p:2,  c:1,  f:7,  grams:28  },
    { id:'cheese_kashkaval',name:'קשקבל',              icon:'🧀', serving:'פרוסה',      kcal:95,  p:7,  c:1,  f:7,  grams:25  },
    { id:'cheese_hard5',   name:'גבינה קשה 5%',        icon:'🧀', serving:'30ג',        kcal:55,  p:9,  c:2,  f:1,  grams:30  },
    { id:'brie',           name:'בְּרִי',              icon:'🧀', serving:'30ג',        kcal:100, p:6,  c:0,  f:8,  grams:30  },
    { id:'halumi',         name:'חלומי',               icon:'🧀', serving:'30ג',        kcal:90,  p:6,  c:0,  f:7,  grams:30  },
    { id:'cheese_goat',    name:'גבינת עיזים',         icon:'🧀', serving:'30ג',        kcal:80,  p:5,  c:0,  f:6,  grams:30  },
    { id:'cheese_9_yotvata',name:'גבינה 9% יוטבתה',   icon:'🧀', serving:'100ג',       kcal:130, p:8,  c:4,  f:9,  grams:100 },

    // ── חלב ושמנות ──
    { id:'milk',           name:'חלב 3%',              icon:'🥛', serving:'כוס',        kcal:150, p:8,  c:12, f:8,  grams:240 },
    { id:'milk_1',         name:'חלב 1%',              icon:'🥛', serving:'כוס',        kcal:105, p:9,  c:12, f:2,  grams:240 },
    { id:'milk_skim',      name:'חלב 0%',              icon:'🥛', serving:'כוס',        kcal:85,  p:9,  c:12, f:0,  grams:240 },
    { id:'soy_milk',       name:'חלב סויה',            icon:'🥛', serving:'כוס',        kcal:100, p:7,  c:8,  f:4,  grams:240 },
    { id:'almond_milk',    name:'חלב שקדים',           icon:'🥛', serving:'כוס',        kcal:40,  p:1,  c:2,  f:3,  grams:240 },
    { id:'oat_milk',       name:'חלב שיבולת שועל',     icon:'🥛', serving:'כוס',        kcal:120, p:3,  c:16, f:5,  grams:240 },
    { id:'cream',          name:'שמנת מתוקה 38%',      icon:'🥛', serving:'כף',         kcal:55,  p:0,  c:0,  f:6,  grams:15  },
    { id:'sour_cream',     name:'שמנת חמוצה',          icon:'🥛', serving:'כף',         kcal:30,  p:1,  c:1,  f:3,  grams:15  },
    { id:'butter',         name:'חמאה',                icon:'🧈', serving:'כף',         kcal:100, p:0,  c:0,  f:11, grams:14  },
    { id:'butter_light',   name:'חמאה קלה',            icon:'🧈', serving:'כף',         kcal:70,  p:0,  c:0,  f:8,  grams:14  },
    { id:'margarine',      name:'מרגרינה',             icon:'🧈', serving:'כף',         kcal:100, p:0,  c:0,  f:11, grams:14  },
    { id:'ice_coffee',     name:'קפה קר 1%',           icon:'🥛', serving:'250מל',      kcal:140, p:6,  c:22, f:3,  grams:250 },

    // ── עוף ובשר עוף ──
    { id:'chicken',        name:'חזה עוף צלוי',        icon:'🍗', serving:'150ג',       kcal:248, p:46, c:0,  f:5,  grams:150 },
    { id:'chicken_thigh',  name:'ירך עוף',             icon:'🍗', serving:'150ג',       kcal:295, p:38, c:0,  f:15, grams:150 },
    { id:'chicken_wing',   name:'כנפיים',              icon:'🍗', serving:'100ג',       kcal:203, p:27, c:0,  f:11, grams:100 },
    { id:'chicken_schnitzel',name:'שניצל עוף',         icon:'🍗', serving:'150ג',       kcal:320, p:35, c:14, f:13, grams:150 },
    { id:'chicken_drum',   name:'שוק עוף',             icon:'🍗', serving:'100ג',       kcal:185, p:28, c:0,  f:8,  grams:100 },
    { id:'chicken_mince',  name:'עוף טחון',            icon:'🍗', serving:'100ג',       kcal:170, p:21, c:0,  f:9,  grams:100 },
    { id:'turkey_breast',  name:'חזה הודו',            icon:'🦃', serving:'150ג',       kcal:240, p:45, c:0,  f:5,  grams:150 },
    { id:'turkey_schnitzel',name:'שניצל הודו',         icon:'🦃', serving:'150ג',       kcal:290, p:38, c:12, f:9,  grams:150 },
    { id:'chicken_kebab',  name:'קבב עוף',             icon:'🍢', serving:'100ג',       kcal:175, p:22, c:3,  f:8,  grams:100 },
    { id:'chicken_nuggets',name:'נאגטס עוף',           icon:'🍗', serving:'100ג',       kcal:250, p:16, c:17, f:13, grams:100 },
    { id:'chicken_liver',  name:'כבד עוף',             icon:'🍗', serving:'100ג',       kcal:172, p:25, c:1,  f:7,  grams:100 },

    // ── בשר בקר ──
    { id:'beef',           name:'בשר בקר רזה',         icon:'🥩', serving:'150ג',       kcal:290, p:39, c:0,  f:14, grams:150 },
    { id:'beef_mince',     name:'בשר טחון רזה',        icon:'🥩', serving:'100ג',       kcal:218, p:26, c:0,  f:12, grams:100 },
    { id:'beef_steak',     name:'סטייק בקר',           icon:'🥩', serving:'200ג',       kcal:420, p:52, c:0,  f:22, grams:200 },
    { id:'burger_patty',   name:'קציצת בורגר',         icon:'🥩', serving:'150ג',       kcal:310, p:28, c:5,  f:19, grams:150 },
    { id:'kebab_beef',     name:'קבב בקר',             icon:'🍢', serving:'100ג',       kcal:250, p:20, c:5,  f:17, grams:100 },
    { id:'beef_shishlik',  name:'שישליק בקר',          icon:'🥩', serving:'100ג',       kcal:240, p:25, c:0,  f:15, grams:100 },
    { id:'veal',           name:'עגל',                 icon:'🥩', serving:'150ג',       kcal:270, p:37, c:0,  f:13, grams:150 },
    { id:'beef_entrecote', name:'אנטריקוט',            icon:'🥩', serving:'200ג',       kcal:480, p:48, c:0,  f:30, grams:200 },
    { id:'beef_liver',     name:'כבד בקר',             icon:'🥩', serving:'100ג',       kcal:175, p:27, c:3,  f:5,  grams:100 },
    { id:'beef_tongue',    name:'לשון בקר',            icon:'🥩', serving:'100ג',       kcal:280, p:19, c:0,  f:22, grams:100 },
    { id:'hotdog',         name:'נקניקייה',            icon:'🌭', serving:'יחידה',      kcal:180, p:7,  c:3,  f:15, grams:55  },
    { id:'salami',         name:'סלמי',                icon:'🍖', serving:'2 פרוסות',   kcal:100, p:6,  c:1,  f:8,  grams:25  },
    { id:'pastrami',       name:'פסטרמה',              icon:'🍖', serving:'3 פרוסות',   kcal:65,  p:11, c:1,  f:2,  grams:45  },
    { id:'shawarma_meat',  name:'בשר שווארמה',         icon:'🥙', serving:'100ג',       kcal:220, p:24, c:3,  f:12, grams:100 },

    // ── דגים ופירות ים ──
    { id:'salmon',         name:'סלמון אפוי',          icon:'🐟', serving:'150ג',       kcal:280, p:34, c:0,  f:16, grams:150 },
    { id:'tuna',           name:'טונה במים',           icon:'🐟', serving:'קופסה 140ג', kcal:130, p:29, c:0,  f:1,  grams:140 },
    { id:'tuna_oil',       name:'טונה בשמן',           icon:'🐟', serving:'קופסה 140ג', kcal:210, p:27, c:0,  f:11, grams:140 },
    { id:'tilapia',        name:'טלפיה',               icon:'🐟', serving:'150ג',       kcal:195, p:35, c:0,  f:5,  grams:150 },
    { id:'trout',          name:'פורל',                icon:'🐟', serving:'150ג',       kcal:255, p:33, c:0,  f:13, grams:150 },
    { id:'sea_bass',       name:'בס ים',               icon:'🐟', serving:'150ג',       kcal:195, p:33, c:0,  f:6,  grams:150 },
    { id:'mackerel',       name:'מקרל',                icon:'🐟', serving:'150ג',       kcal:330, p:30, c:0,  f:22, grams:150 },
    { id:'sardine',        name:'סרדינים',             icon:'🐟', serving:'קופסה 120ג', kcal:190, p:24, c:0,  f:10, grams:120 },
    { id:'carp',           name:'קרפיון',              icon:'🐟', serving:'150ג',       kcal:220, p:30, c:0,  f:10, grams:150 },
    { id:'gefilte_fish',   name:'דג גפילטה',           icon:'🐟', serving:'יחידה',      kcal:60,  p:8,  c:4,  f:1,  grams:60  },
    { id:'shrimp',         name:'שרימפס',              icon:'🦐', serving:'100ג',       kcal:99,  p:24, c:0,  f:1,  grams:100 },
    { id:'calamari',       name:'קלמרי',               icon:'🦑', serving:'100ג',       kcal:175, p:18, c:8,  f:7,  grams:100 },
    { id:'fish_sticks',    name:'אצבעות דג',           icon:'🐟', serving:'3 יחידות',   kcal:180, p:12, c:17, f:7,  grams:90  },

    // ── קטניות ──
    { id:'hummus',         name:'חומוס',               icon:'🫛', serving:'100ג',       kcal:170, p:8,  c:14, f:9,  grams:100 },
    { id:'lentils',        name:'עדשים מבושלות',       icon:'🍲', serving:'כוס',        kcal:230, p:18, c:40, f:1,  grams:200 },
    { id:'lentils_red',    name:'עדשים כתומות',        icon:'🍲', serving:'כוס מבושל',  kcal:215, p:17, c:38, f:1,  grams:200 },
    { id:'chickpeas',      name:'חומוס שלם מבושל',     icon:'🫛', serving:'כוס',        kcal:270, p:15, c:45, f:4,  grams:200 },
    { id:'black_beans',    name:'שעועית שחורה',        icon:'🫘', serving:'כוס',        kcal:230, p:15, c:41, f:1,  grams:200 },
    { id:'kidney_beans',   name:'שעועית אדומה',        icon:'🫘', serving:'כוס',        kcal:225, p:15, c:40, f:1,  grams:200 },
    { id:'white_beans',    name:'שעועית לבנה',         icon:'🫘', serving:'כוס',        kcal:250, p:17, c:45, f:1,  grams:200 },
    { id:'edamame',        name:'אדממה',               icon:'🫘', serving:'כוס',        kcal:190, p:17, c:15, f:8,  grams:155 },
    { id:'peas',           name:'אפונה מבושלת',        icon:'🫛', serving:'כוס',        kcal:135, p:9,  c:25, f:0,  grams:160 },
    { id:'tofu',           name:'טופו',                icon:'🧊', serving:'100ג',       kcal:144, p:16, c:3,  f:9,  grams:100 },
    { id:'tofu_soft',      name:'טופו רך',             icon:'🧊', serving:'100ג',       kcal:55,  p:6,  c:2,  f:3,  grams:100 },
    { id:'falafel',        name:'פלאפל',               icon:'🧆', serving:'3 כדורים',   kcal:170, p:6,  c:18, f:9,  grams:75  },
    { id:'mujaddara',      name:'מג׳דרה',              icon:'🍲', serving:'כוס',        kcal:200, p:8,  c:38, f:3,  grams:200 },

    // ── ירקות ──
    { id:'tomato',         name:'עגבנייה',             icon:'🍅', serving:'בינונית',    kcal:22,  p:1,  c:5,  f:0,  grams:120 },
    { id:'cucumber',       name:'מלפפון',              icon:'🥒', serving:'בינוני',     kcal:16,  p:1,  c:4,  f:0,  grams:200 },
    { id:'broccoli',       name:'ברוקולי מאודה',       icon:'🥦', serving:'כוס',        kcal:55,  p:4,  c:11, f:1,  grams:90  },
    { id:'salad',          name:'סלט ירקות',           icon:'🥗', serving:'קערה',       kcal:90,  p:3,  c:12, f:4,  grams:200 },
    { id:'lettuce',        name:'חסה',                 icon:'🥬', serving:'כוס',        kcal:8,   p:1,  c:1,  f:0,  grams:55  },
    { id:'spinach',        name:'תרד מאודה',           icon:'🌿', serving:'כוס',        kcal:41,  p:5,  c:7,  f:0,  grams:180 },
    { id:'kale',           name:'קייל',                icon:'🌿', serving:'כוס',        kcal:33,  p:3,  c:6,  f:1,  grams:130 },
    { id:'carrot',         name:'גזר',                 icon:'🥕', serving:'בינוני',     kcal:25,  p:1,  c:6,  f:0,  grams:60  },
    { id:'potato',         name:'תפוח אדמה אפוי',      icon:'🥔', serving:'בינוני',     kcal:160, p:4,  c:37, f:0,  grams:150 },
    { id:'sweetpotato',    name:'בטטה אפויה',          icon:'🍠', serving:'בינונית',    kcal:180, p:4,  c:41, f:0,  grams:150 },
    { id:'onion',          name:'בצל',                 icon:'🧅', serving:'בינוני',     kcal:45,  p:1,  c:11, f:0,  grams:110 },
    { id:'garlic',         name:'שום',                 icon:'🧄', serving:'שן',         kcal:5,   p:0,  c:1,  f:0,  grams:4   },
    { id:'pepper_red',     name:'פלפל אדום',           icon:'🫑', serving:'בינוני',     kcal:37,  p:1,  c:9,  f:0,  grams:120 },
    { id:'pepper_green',   name:'פלפל ירוק',           icon:'🫑', serving:'בינוני',     kcal:24,  p:1,  c:6,  f:0,  grams:120 },
    { id:'pepper_yellow',  name:'פלפל צהוב',           icon:'🫑', serving:'בינוני',     kcal:50,  p:2,  c:12, f:0,  grams:120 },
    { id:'eggplant',       name:'חצילים',              icon:'🍆', serving:'100ג',       kcal:35,  p:1,  c:8,  f:0,  grams:100 },
    { id:'zucchini',       name:'קישוא',               icon:'🥒', serving:'בינוני',     kcal:33,  p:2,  c:6,  f:1,  grams:200 },
    { id:'mushroom',       name:'פטריות',              icon:'🍄', serving:'כוס',        kcal:22,  p:3,  c:3,  f:0,  grams:100 },
    { id:'artichoke',      name:'ארטישוק',             icon:'🌿', serving:'בינוני',     kcal:64,  p:4,  c:14, f:0,  grams:120 },
    { id:'corn',           name:'תירס מבושל',          icon:'🌽', serving:'קלח',        kcal:132, p:5,  c:29, f:2,  grams:150 },
    { id:'corn_canned',    name:'תירס קפוא/שימורים',   icon:'🌽', serving:'כוס',        kcal:133, p:5,  c:29, f:2,  grams:154 },
    { id:'celery',         name:'סלרי',                icon:'🌿', serving:'גבעול',      kcal:6,   p:0,  c:1,  f:0,  grams:40  },
    { id:'cabbage',        name:'כרוב',                icon:'🥬', serving:'כוס',        kcal:22,  p:1,  c:5,  f:0,  grams:90  },
    { id:'cauliflower',    name:'כרובית',              icon:'🥦', serving:'כוס',        kcal:27,  p:2,  c:5,  f:0,  grams:100 },
    { id:'asparagus',      name:'אספרגוס',             icon:'🌿', serving:'5 גבעולים',  kcal:20,  p:2,  c:4,  f:0,  grams:90  },
    { id:'beet',           name:'סלק',                 icon:'🫛', serving:'בינוני',     kcal:58,  p:2,  c:13, f:0,  grams:100 },
    { id:'radish',         name:'צנונית',              icon:'🌿', serving:'5 יחידות',   kcal:9,   p:0,  c:2,  f:0,  grams:50  },
    { id:'kohlrabi',       name:'קולרבי',              icon:'🌿', serving:'בינוני',     kcal:36,  p:2,  c:8,  f:0,  grams:135 },
    { id:'leek',           name:'כרישה',               icon:'🌿', serving:'בינונית',    kcal:54,  p:1,  c:13, f:0,  grams:124 },
    { id:'green_onion',    name:'בצל ירוק',            icon:'🌿', serving:'2 גבעולים',  kcal:10,  p:0,  c:2,  f:0,  grams:30  },
    { id:'parsley',        name:'פטרוזיליה',           icon:'🌿', serving:'כוס',        kcal:22,  p:2,  c:4,  f:0,  grams:60  },
    { id:'coriander',      name:'כוסברה',              icon:'🌿', serving:'כוס',        kcal:5,   p:0,  c:1,  f:0,  grams:16  },
    { id:'mint',           name:'נענע',                icon:'🌿', serving:'כף',         kcal:2,   p:0,  c:0,  f:0,  grams:5   },
    { id:'pumpkin',        name:'דלעת אפויה',          icon:'🎃', serving:'100ג',       kcal:45,  p:2,  c:11, f:0,  grams:100 },
    { id:'sweet_potato_mashed',name:'פירה בטטה',       icon:'🍠', serving:'100ג',       kcal:95,  p:2,  c:22, f:0,  grams:100 },
    { id:'tehina',         name:'טחינה גולמית',        icon:'🫙', serving:'כף',         kcal:89,  p:3,  c:3,  f:8,  grams:15  },
    { id:'tahini_ready',   name:'טחינה מוכנה',         icon:'🫙', serving:'כף',         kcal:60,  p:2,  c:3,  f:5,  grams:15  },

    // ── פירות ──
    { id:'avocado',        name:'אבוקדו',              icon:'🥑', serving:'חצי',        kcal:160, p:2,  c:9,  f:15, grams:100 },
    { id:'banana',         name:'בננה',                icon:'🍌', serving:'בינונית',    kcal:105, p:1,  c:27, f:0,  grams:120 },
    { id:'apple',          name:'תפוח',                icon:'🍎', serving:'בינוני',     kcal:95,  p:0,  c:25, f:0,  grams:180 },
    { id:'orange',         name:'תפוז',                icon:'🍊', serving:'בינוני',     kcal:62,  p:1,  c:15, f:0,  grams:130 },
    { id:'berries',        name:'פירות יער',           icon:'🫐', serving:'כוס',        kcal:70,  p:1,  c:17, f:0,  grams:150 },
    { id:'strawberry',     name:'תות שדה',             icon:'🍓', serving:'כוס',        kcal:49,  p:1,  c:12, f:0,  grams:150 },
    { id:'grapes',         name:'ענבים',               icon:'🍇', serving:'כוס',        kcal:104, p:1,  c:27, f:0,  grams:150 },
    { id:'mango',          name:'מנגו',                icon:'🥭', serving:'חצי',        kcal:100, p:1,  c:25, f:1,  grams:170 },
    { id:'pineapple',      name:'אננס',                icon:'🍍', serving:'כוס',        kcal:83,  p:1,  c:22, f:0,  grams:165 },
    { id:'watermelon',     name:'אבטיח',               icon:'🍉', serving:'2 פרוסות',   kcal:86,  p:2,  c:22, f:0,  grams:280 },
    { id:'melon',          name:'מלון',                icon:'🍈', serving:'חצי',        kcal:60,  p:1,  c:16, f:0,  grams:200 },
    { id:'peach',          name:'אפרסק',               icon:'🍑', serving:'בינוני',     kcal:58,  p:1,  c:14, f:0,  grams:147 },
    { id:'pear',           name:'אגס',                 icon:'🍐', serving:'בינוני',     kcal:101, p:1,  c:27, f:0,  grams:178 },
    { id:'plum',           name:'שזיף',                icon:'🍑', serving:'2 יחידות',   kcal:76,  p:1,  c:19, f:0,  grams:130 },
    { id:'lemon',          name:'לימון',               icon:'🍋', serving:'בינוני',     kcal:17,  p:1,  c:5,  f:0,  grams:58  },
    { id:'grapefruit',     name:'אשכולית',             icon:'🍊', serving:'חצי',        kcal:52,  p:1,  c:13, f:0,  grams:154 },
    { id:'kiwi',           name:'קיווי',               icon:'🥝', serving:'יחידה',      kcal:46,  p:1,  c:11, f:0,  grams:77  },
    { id:'pomegranate',    name:'רימון',               icon:'🌰', serving:'חצי',        kcal:72,  p:1,  c:18, f:1,  grams:140 },
    { id:'fig',            name:'תאנה',                icon:'🍑', serving:'2 יחידות',   kcal:74,  p:1,  c:19, f:0,  grams:100 },
    { id:'dates',          name:'תמר',                 icon:'🌴', serving:'2 יחידות',   kcal:133, p:1,  c:36, f:0,  grams:48  },
    { id:'dried_mango',    name:'מנגו מיובש',          icon:'🥭', serving:'30ג',        kcal:99,  p:1,  c:25, f:0,  grams:30  },
    { id:'raisins',        name:'צימוקים',             icon:'🍇', serving:'כף',         kcal:85,  p:1,  c:22, f:0,  grams:28  },
    { id:'dried_apricot',  name:'משמשים מיובשים',      icon:'🍑', serving:'5 יחידות',   kcal:78,  p:1,  c:20, f:0,  grams:35  },
    { id:'prunes',         name:'שזיפים מיובשים',      icon:'🍑', serving:'5 יחידות',   kcal:115, p:1,  c:30, f:0,  grams:42  },
    { id:'cherry',         name:'דובדבן',              icon:'🍒', serving:'כוס',        kcal:87,  p:1,  c:22, f:0,  grams:138 },
    { id:'nectarine',      name:'נקטרינה',             icon:'🍑', serving:'בינונית',    kcal:62,  p:1,  c:15, f:0,  grams:142 },
    { id:'tangerine',      name:'מנדרינה',             icon:'🍊', serving:'בינונית',    kcal:47,  p:1,  c:12, f:0,  grams:109 },
    { id:'passion_fruit',  name:'פסיפלורה',            icon:'🌺', serving:'יחידה',      kcal:17,  p:0,  c:4,  f:0,  grams:18  },
    { id:'guava',          name:'גויאבה',              icon:'🍈', serving:'בינונית',    kcal:46,  p:2,  c:11, f:1,  grams:90  },
    { id:'lychee',         name:'ליצ׳י',               icon:'🍑', serving:'10 יחידות',  kcal:66,  p:1,  c:17, f:0,  grams:100 },

    // ── אגוזים וזרעים ──
    { id:'almonds',        name:'שקדים',               icon:'🌰', serving:'חופן 28ג',   kcal:164, p:6,  c:6,  f:14, grams:28  },
    { id:'walnuts',        name:'אגוזי מלך',           icon:'🌰', serving:'חופן 28ג',   kcal:185, p:4,  c:4,  f:18, grams:28  },
    { id:'cashews',        name:'קשיו',                icon:'🌰', serving:'חופן 28ג',   kcal:157, p:5,  c:9,  f:12, grams:28  },
    { id:'peanuts',        name:'בוטנים',              icon:'🥜', serving:'חופן 28ג',   kcal:161, p:7,  c:5,  f:14, grams:28  },
    { id:'pistachios',     name:'פיסטוקים',            icon:'🌰', serving:'חופן 28ג',   kcal:160, p:6,  c:8,  f:13, grams:28  },
    { id:'hazelnuts',      name:'אגוזי לוז',           icon:'🌰', serving:'חופן 28ג',   kcal:178, p:4,  c:5,  f:17, grams:28  },
    { id:'peanutbutter',   name:'חמאת בוטנים',         icon:'🥜', serving:'כף',         kcal:95,  p:4,  c:3,  f:8,  grams:16  },
    { id:'almond_butter',  name:'חמאת שקדים',          icon:'🌰', serving:'כף',         kcal:98,  p:3,  c:3,  f:9,  grams:16  },
    { id:'sunflower_seeds',name:'גרעיני חמנייה',       icon:'🌻', serving:'28ג',        kcal:165, p:6,  c:7,  f:14, grams:28  },
    { id:'pumpkin_seeds',  name:'גרעיני דלעת',         icon:'🎃', serving:'28ג',        kcal:151, p:7,  c:5,  f:13, grams:28  },
    { id:'sesame',         name:'שומשום',              icon:'🌾', serving:'כף',         kcal:52,  p:2,  c:2,  f:4,  grams:9   },
    { id:'flax_seeds',     name:'זרעי פשתן',           icon:'🌾', serving:'כף',         kcal:55,  p:2,  c:3,  f:4,  grams:10  },
    { id:'chia_seeds',     name:'זרעי צ׳יה',           icon:'🌾', serving:'כף',         kcal:58,  p:2,  c:5,  f:4,  grams:12  },
    { id:'pine_nuts',      name:'צנוברים',             icon:'🌰', serving:'כף',         kcal:100, p:2,  c:1,  f:10, grams:14  },
    { id:'macadamia',      name:'מקדמיה',              icon:'🌰', serving:'חופן 28ג',   kcal:204, p:2,  c:4,  f:21, grams:28  },
    { id:'brazil_nuts',    name:'אגוז ברזיל',          icon:'🌰', serving:'3 יחידות',   kcal:186, p:4,  c:3,  f:19, grams:30  },

    // ── שמנים ורטבים ──
    { id:'olive_oil',      name:'שמן זית',             icon:'🫒', serving:'כף',         kcal:120, p:0,  c:0,  f:14, grams:14  },
    { id:'canola_oil',     name:'שמן קנולה',           icon:'🫙', serving:'כף',         kcal:120, p:0,  c:0,  f:14, grams:14  },
    { id:'coconut_oil',    name:'שמן קוקוס',           icon:'🥥', serving:'כף',         kcal:120, p:0,  c:0,  f:14, grams:14  },
    { id:'ketchup',        name:'קטשופ',               icon:'🍅', serving:'כף',         kcal:20,  p:0,  c:5,  f:0,  grams:17  },
    { id:'mayo',           name:'מיונז',               icon:'🫙', serving:'כף',         kcal:90,  p:0,  c:0,  f:10, grams:13  },
    { id:'mayo_light',     name:'מיונז קל',            icon:'🫙', serving:'כף',         kcal:45,  p:0,  c:1,  f:4,  grams:13  },
    { id:'mustard',        name:'חרדל',                icon:'🌿', serving:'כף',         kcal:10,  p:1,  c:1,  f:1,  grams:12  },
    { id:'soy_sauce',      name:'רוטב סויה',           icon:'🫙', serving:'כף',         kcal:10,  p:1,  c:1,  f:0,  grams:15  },
    { id:'hot_sauce',      name:'שמן חריף',            icon:'🌶️', serving:'כפית',       kcal:5,   p:0,  c:1,  f:0,  grams:5   },
    { id:'honey',          name:'דבש',                 icon:'🍯', serving:'כף',         kcal:64,  p:0,  c:17, f:0,  grams:21  },
    { id:'jam',            name:'ריבה',                icon:'🍓', serving:'כף',         kcal:55,  p:0,  c:14, f:0,  grams:20  },
    { id:'sugar',          name:'סוכר',                icon:'🍬', serving:'כפית',       kcal:16,  p:0,  c:4,  f:0,  grams:4   },
    { id:'vinegar',        name:'חומץ',                icon:'🫙', serving:'כף',         kcal:3,   p:0,  c:0,  f:0,  grams:15  },
    { id:'harissa',        name:'חריסה',               icon:'🌶️', serving:'כפית',       kcal:15,  p:1,  c:2,  f:1,  grams:10  },
    { id:'amba',           name:'עמבה',                icon:'🥭', serving:'כף',         kcal:25,  p:0,  c:6,  f:0,  grams:20  },
    { id:'schug',          name:'זוג (צ׳וג)',          icon:'🌶️', serving:'כפית',       kcal:10,  p:0,  c:2,  f:0,  grams:10  },

    // ── חטיפים ישראליים ──
    { id:'bamba',          name:'במבה',                icon:'🍿', serving:'שקית 25ג',   kcal:130, p:3,  c:15, f:7,  grams:25  },
    { id:'bamba_80',       name:'במבה 80ג',            icon:'🍿', serving:'שקית 80ג',   kcal:420, p:9,  c:48, f:22, grams:80  },
    { id:'bamba_choc',     name:'במבה שוקולד',         icon:'🍿', serving:'שקית 25ג',   kcal:135, p:2,  c:17, f:6,  grams:25  },
    { id:'bisli_grill',    name:'ביסלי גריל',          icon:'🍿', serving:'שקית 25ג',   kcal:115, p:2,  c:17, f:5,  grams:25  },
    { id:'bisli_onion',    name:'ביסלי בצל',           icon:'🍿', serving:'שקית 25ג',   kcal:115, p:2,  c:17, f:5,  grams:25  },
    { id:'bisli_bbq',      name:'ביסלי ברביקיו',       icon:'🍿', serving:'שקית 25ג',   kcal:115, p:2,  c:17, f:5,  grams:25  },
    { id:'bisli_pizza',    name:'ביסלי פיצה',          icon:'🍿', serving:'שקית 25ג',   kcal:115, p:2,  c:17, f:5,  grams:25  },
    { id:'kipod',          name:'קיפוד',               icon:'🍿', serving:'שקית 25ג',   kcal:120, p:2,  c:16, f:5,  grams:25  },
    { id:'kossem',         name:'קיסוס',               icon:'🍿', serving:'שקית 25ג',   kcal:125, p:2,  c:17, f:5,  grams:25  },
    { id:'ofakim',         name:'אופקים',              icon:'🍿', serving:'שקית 25ג',   kcal:120, p:2,  c:16, f:5,  grams:25  },
    { id:'roldaan',        name:'רולדן',               icon:'🍿', serving:'שקית 25ג',   kcal:120, p:2,  c:16, f:6,  grams:25  },
    { id:'shrimps_snack',  name:'שרימפס חטיף',         icon:'🍿', serving:'שקית 25ג',   kcal:115, p:2,  c:16, f:5,  grams:25  },
    { id:'lays_salt',      name:'לייז מלח',            icon:'🥔', serving:'שקית 30ג',   kcal:155, p:2,  c:15, f:10, grams:30  },
    { id:'lays_cream',     name:'לייז שמנת בצל',       icon:'🥔', serving:'שקית 30ג',   kcal:160, p:2,  c:16, f:10, grams:30  },
    { id:'pringles',       name:'פרינגלס',             icon:'🥔', serving:'15 שבבים',   kcal:150, p:1,  c:16, f:9,  grams:28  },
    { id:'tortilla_chips', name:'צ׳יפס תירס',          icon:'🌽', serving:'שקית 30ג',   kcal:140, p:2,  c:19, f:7,  grams:30  },
    { id:'popcorn',        name:'פופקורן',             icon:'🍿', serving:'2 כוסות',    kcal:62,  p:2,  c:12, f:1,  grams:16  },
    { id:'popcorn_butter', name:'פופקורן חמאה',        icon:'🍿', serving:'2 כוסות',    kcal:110, p:2,  c:12, f:6,  grams:28  },
    { id:'pretzel',        name:'פרצל',                icon:'🥨', serving:'30ג',        kcal:115, p:3,  c:24, f:1,  grams:30  },
    { id:'rice_snack',     name:'חטיף אורז',           icon:'🍿', serving:'שקית 25ג',   kcal:100, p:2,  c:21, f:1,  grams:25  },
    { id:'dorsal',         name:'דורסל',               icon:'🍿', serving:'שקית 25ג',   kcal:120, p:2,  c:17, f:5,  grams:25  },
    { id:'peanuts_salted', name:'בוטנים מלוחים',       icon:'🥜', serving:'חופן 30ג',   kcal:170, p:7,  c:5,  f:14, grams:30  },
    { id:'sunflower_roasted',name:'גרעינים קלויים',    icon:'🌻', serving:'30ג',        kcal:170, p:6,  c:7,  f:14, grams:30  },

    // ── ממתקים ומתוקים ──
    { id:'chocolate',      name:'שוקולד מריר',         icon:'🍫', serving:'2 קוביות',   kcal:110, p:1,  c:9,  f:8,  grams:20  },
    { id:'choc_milk',      name:'שוקולד חלב',          icon:'🍫', serving:'2 קוביות',   kcal:120, p:2,  c:13, f:7,  grams:20  },
    { id:'kinder',         name:'קינדר בואנו',         icon:'🍫', serving:'יחידה',      kcal:220, p:4,  c:23, f:12, grams:43  },
    { id:'krembo',         name:'קרמבו',               icon:'🍪', serving:'יחידה',      kcal:110, p:1,  c:18, f:4,  grams:30  },
    { id:'icecream',       name:'גלידה',               icon:'🍨', serving:'כדור',       kcal:140, p:2,  c:17, f:7,  grams:100 },
    { id:'icecream_bar',   name:'ארטיק שוקולד',        icon:'🍦', serving:'יחידה',      kcal:200, p:3,  c:22, f:11, grams:75  },
    { id:'wafer',          name:'וופל',                icon:'🍪', serving:'2 יחידות',   kcal:145, p:2,  c:20, f:7,  grams:30  },
    { id:'cookie',         name:'עוגיית שוקו',         icon:'🍪', serving:'2 יחידות',   kcal:140, p:2,  c:20, f:6,  grams:28  },
    { id:'cookie_oreo',    name:'אוראו',               icon:'🍪', serving:'3 עוגיות',   kcal:160, p:2,  c:25, f:7,  grams:34  },
    { id:'cake_chocolate', name:'עוגת שוקולד',         icon:'🎂', serving:'פרוסה',      kcal:350, p:5,  c:45, f:17, grams:90  },
    { id:'cake_cheese',    name:'עוגת גבינה',          icon:'🎂', serving:'פרוסה',      kcal:320, p:7,  c:38, f:16, grams:110 },
    { id:'cake_carrot',    name:'עוגת גזר',            icon:'🎂', serving:'פרוסה',      kcal:290, p:4,  c:40, f:13, grams:80  },
    { id:'donut',          name:'סופגנייה',            icon:'🍩', serving:'יחידה',      kcal:300, p:5,  c:40, f:14, grams:85  },
    { id:'muffin',         name:'מאפין',               icon:'🧁', serving:'יחידה',      kcal:340, p:5,  c:48, f:15, grams:110 },
    { id:'brownie',        name:'בראוני',              icon:'🍫', serving:'יחידה',      kcal:280, p:4,  c:36, f:14, grams:70  },
    { id:'halva',          name:'חלווה',               icon:'🍬', serving:'30ג',        kcal:170, p:4,  c:15, f:11, grams:30  },
    { id:'rugelach',       name:'רוגעלך',              icon:'🥐', serving:'יחידה',      kcal:110, p:2,  c:14, f:5,  grams:30  },
    { id:'baklava',        name:'בקלאווה',             icon:'🍮', serving:'יחידה',      kcal:180, p:3,  c:22, f:10, grams:45  },
    { id:'knafe',          name:'כנאפה',               icon:'🍮', serving:'100ג',       kcal:280, p:7,  c:36, f:12, grams:100 },
    { id:'gummies',        name:'סוכריות גומי',        icon:'🍬', serving:'10 יחידות',  kcal:90,  p:2,  c:22, f:0,  grams:28  },
    { id:'rice_pudding',   name:'ריזוגלו',             icon:'🍮', serving:'100ג',       kcal:110, p:3,  c:20, f:2,  grams:100 },
    { id:'chocolate_spread',name:'ממרח שוקולד',        icon:'🍫', serving:'כף',         kcal:100, p:1,  c:12, f:6,  grams:20  },
    { id:'marshmallow',    name:'מרשמלו',              icon:'🍬', serving:'5 יחידות',   kcal:90,  p:1,  c:23, f:0,  grams:28  },
    { id:'lollipop',       name:'סוכרייה על מקל',      icon:'🍭', serving:'יחידה',      kcal:60,  p:0,  c:15, f:0,  grams:17  },
    { id:'chewing_gum',    name:'מסטיק',               icon:'🍬', serving:'יחידה',      kcal:10,  p:0,  c:3,  f:0,  grams:3   },
    { id:'candy',          name:'סוכריות',             icon:'🍬', serving:'5 יחידות',   kcal:85,  p:0,  c:22, f:0,  grams:25  },
    { id:'ice_lolly',      name:'ארטיק קרח',           icon:'🧊', serving:'יחידה',      kcal:60,  p:0,  c:15, f:0,  grams:70  },

    // ── שתייה ──
    { id:'water',          name:'מים',                 icon:'💧', serving:'כוס',        kcal:0,   p:0,  c:0,  f:0,  grams:240 },
    { id:'coffee',         name:'קפה הפוך',            icon:'☕', serving:'כוס',        kcal:90,  p:5,  c:8,  f:4,  grams:240 },
    { id:'coffee_black',   name:'קפה שחור',            icon:'☕', serving:'כוס',        kcal:5,   p:0,  c:1,  f:0,  grams:240 },
    { id:'espresso',       name:'אספרסו',              icon:'☕', serving:'כוס',        kcal:5,   p:0,  c:1,  f:0,  grams:30  },
    { id:'cappuccino',     name:'קפוצ׳ינו',            icon:'☕', serving:'כוס',        kcal:80,  p:4,  c:7,  f:3,  grams:180 },
    { id:'latte',          name:'לאטה',                icon:'☕', serving:'כוס גדולה',  kcal:120, p:6,  c:10, f:5,  grams:300 },
    { id:'tea',            name:'תה',                  icon:'🫖', serving:'כוס',        kcal:2,   p:0,  c:0,  f:0,  grams:240 },
    { id:'tea_milk',       name:'תה עם חלב',           icon:'🫖', serving:'כוס',        kcal:40,  p:2,  c:4,  f:2,  grams:240 },
    { id:'oj',             name:'מיץ תפוזים',          icon:'🍊', serving:'כוס',        kcal:112, p:2,  c:26, f:0,  grams:240 },
    { id:'apple_juice',    name:'מיץ תפוחים',          icon:'🍎', serving:'כוס',        kcal:114, p:0,  c:28, f:0,  grams:240 },
    { id:'grape_juice',    name:'מיץ ענבים',           icon:'🍇', serving:'כוס',        kcal:154, p:1,  c:38, f:0,  grams:240 },
    { id:'cola',           name:'קוקה קולה',           icon:'🥤', serving:'פחית 330מל', kcal:140, p:0,  c:35, f:0,  grams:330 },
    { id:'cola_zero',      name:'קולה זירו',           icon:'🥤', serving:'פחית 330מל', kcal:1,   p:0,  c:0,  f:0,  grams:330 },
    { id:'sprite',         name:'ספרייט',              icon:'🥤', serving:'פחית 330מל', kcal:130, p:0,  c:33, f:0,  grams:330 },
    { id:'energy_drink',   name:'רד בול',              icon:'🥤', serving:'פחית 250מל', kcal:110, p:1,  c:28, f:0,  grams:250 },
    { id:'protein_shake',  name:'שייק חלבון',          icon:'🥤', serving:'מנה',        kcal:130, p:25, c:5,  f:1,  grams:300 },
    { id:'smoothie',       name:'שייק פירות',          icon:'🥤', serving:'כוס',        kcal:180, p:2,  c:42, f:1,  grams:300 },
    { id:'beer',           name:'בירה',                icon:'🍺', serving:'פחית 330מל', kcal:150, p:1,  c:13, f:0,  grams:330 },
    { id:'wine_red',       name:'יין אדום',            icon:'🍷', serving:'כוס 150מל',  kcal:127, p:0,  c:4,  f:0,  grams:150 },
    { id:'wine_white',     name:'יין לבן',             icon:'🥂', serving:'כוס 150מל',  kcal:121, p:0,  c:4,  f:0,  grams:150 },
    { id:'soda_water',     name:'סודה',                icon:'💧', serving:'כוס',        kcal:0,   p:0,  c:0,  f:0,  grams:240 },
    { id:'lemonade',       name:'לימונדה',             icon:'🍋', serving:'כוס',        kcal:100, p:0,  c:26, f:0,  grams:240 },
    { id:'chocolate_milk', name:'שוקו',                icon:'🥛', serving:'כוס',        kcal:190, p:8,  c:30, f:5,  grams:240 },
    { id:'ice_tea',        name:'אייס תי',             icon:'🫖', serving:'בקבוק 500מל',kcal:165, p:0,  c:42, f:0,  grams:500 },

    // ── ארוחות ישראליות ──
    { id:'shakshuka',      name:'שקשוקה',              icon:'🍳', serving:'מנה',        kcal:280, p:16, c:15, f:16, grams:300 },
    { id:'shawarma',       name:'שווארמה בלאפה',       icon:'🌯', serving:'מנה',        kcal:620, p:35, c:55, f:28, grams:300 },
    { id:'shawarma_pita',  name:'שווארמה בפיתה',       icon:'🫓', serving:'מנה',        kcal:520, p:32, c:48, f:22, grams:260 },
    { id:'falafel_pita',   name:'פלאפל בפיתה',         icon:'🧆', serving:'מנה',        kcal:440, p:14, c:60, f:17, grams:250 },
    { id:'sabich',         name:'סביח',                icon:'🫓', serving:'מנה',        kcal:490, p:18, c:55, f:22, grams:280 },
    { id:'hummus_plate',   name:'מנת חומוס',           icon:'🫛', serving:'מנה',        kcal:400, p:18, c:45, f:18, grams:300 },
    { id:'bourekas',       name:'בורקס גבינה',         icon:'🫓', serving:'יחידה',      kcal:250, p:8,  c:28, f:12, grams:90  },
    { id:'bourekas_potato',name:'בורקס תפוח אדמה',     icon:'🫓', serving:'יחידה',      kcal:230, p:5,  c:32, f:10, grams:90  },
    { id:'bourekas_mushroom',name:'בורקס פטריות',      icon:'🫓', serving:'יחידה',      kcal:220, p:6,  c:28, f:10, grams:90  },
    { id:'quiche',         name:'קיש',                 icon:'🥧', serving:'פרוסה',      kcal:310, p:10, c:22, f:20, grams:120 },

    { id:'pasta_tuna',     name:'פסטה עם טונה',        icon:'🍝', serving:'מנה',        kcal:380, p:22, c:48, f:8,  grams:280 },
    { id:'soup_chicken',   name:'מרק עוף',             icon:'🍲', serving:'קערה',       kcal:120, p:9,  c:10, f:4,  grams:350 },
    { id:'soup_veg',       name:'מרק ירקות',           icon:'🍲', serving:'קערה',       kcal:80,  p:3,  c:15, f:2,  grams:350 },
    { id:'soup_lentil',    name:'מרק עדשים',           icon:'🍲', serving:'קערה',       kcal:180, p:11, c:32, f:2,  grams:350 },
    { id:'kubeh_soup',     name:'קובה בתוך מרק',       icon:'🍲', serving:'קערה + 2',   kcal:320, p:14, c:40, f:12, grams:400 },
    { id:'rice_chicken',   name:'אורז עם עוף',         icon:'🍚', serving:'מנה',        kcal:450, p:35, c:45, f:10, grams:300 },
    { id:'shakshuka_white',name:'שקשוקה לבנה',         icon:'🍳', serving:'מנה',        kcal:250, p:14, c:8,  f:18, grams:280 },
    { id:'makluba',        name:'מקלובה',              icon:'🍚', serving:'מנה',        kcal:480, p:25, c:55, f:18, grams:350 },
    { id:'couscous_veg',   name:'קוסקוס עם ירקות',     icon:'🌾', serving:'מנה',        kcal:320, p:9,  c:58, f:7,  grams:300 },
    { id:'lachmagine',     name:'לחמג׳ין',             icon:'🫓', serving:'יחידה',      kcal:220, p:10, c:28, f:8,  grams:100 },
    { id:'malabi',         name:'מלבי',                icon:'🍮', serving:'כוס',        kcal:200, p:4,  c:32, f:6,  grams:180 },
    { id:'ptitim',         name:'פתיתים מבושלים',      icon:'🌾', serving:'כוס',        kcal:215, p:7,  c:45, f:1,  grams:200 },
    { id:'jachnun',        name:'ג׳חנון',              icon:'🫓', serving:'גליל',       kcal:380, p:8,  c:42, f:20, grams:130 },
    { id:'borekas_spinach',name:'בורקס תרד',           icon:'🫓', serving:'יחידה',      kcal:210, p:6,  c:25, f:10, grams:85  },
    { id:'laffa_wrap',     name:'לאפה עם ממרחים',      icon:'🌯', serving:'מנה',        kcal:550, p:20, c:65, f:22, grams:320 },

    // ── פיצה, בורגר, מזון מהיר ──
    { id:'pizza',          name:'פיצה',                icon:'🍕', serving:'משולש',      kcal:285, p:12, c:36, f:10, grams:107 },
    { id:'pizza_margherita',name:'פיצה מרגריטה',      icon:'🍕', serving:'משולש',      kcal:270, p:11, c:33, f:10, grams:100 },
    { id:'pizza_pepperoni',name:'פיצה פפרוני',        icon:'🍕', serving:'משולש',      kcal:320, p:14, c:33, f:15, grams:108 },
    { id:'pizza_4cheese',  name:'פיצה 4 גבינות',      icon:'🍕', serving:'משולש',      kcal:340, p:16, c:32, f:17, grams:108 },
    { id:'burger',         name:'המבורגר',             icon:'🍔', serving:'יחידה',      kcal:350, p:20, c:33, f:17, grams:200 },
    { id:'burger_double',  name:'המבורגר כפול',        icon:'🍔', serving:'יחידה',      kcal:550, p:35, c:35, f:28, grams:280 },
    { id:'fries',          name:'צ׳יפס',               icon:'🍟', serving:'מנה',        kcal:312, p:4,  c:41, f:15, grams:100 },
    { id:'fries_large',    name:'צ׳יפס גדול',          icon:'🍟', serving:'מנה גדולה',  kcal:490, p:6,  c:65, f:23, grams:154 },
    { id:'hotdog_bun',     name:'נקניק בלחמנייה',      icon:'🌭', serving:'יחידה',      kcal:290, p:11, c:33, f:13, grams:130 },
    { id:'sushi',          name:'סושי',                icon:'🍣', serving:'6 חתיכות',   kcal:230, p:9,  c:38, f:4,  grams:180 },
    { id:'sushi_salmon',   name:'סושי סלמון',          icon:'🍣', serving:'6 חתיכות',   kcal:250, p:12, c:34, f:6,  grams:180 },
    { id:'spring_roll',    name:'ספרינג רול',          icon:'🌯', serving:'יחידה',      kcal:160, p:4,  c:20, f:7,  grams:70  },
    { id:'pad_thai',       name:'פאד תאי',             icon:'🍜', serving:'מנה',        kcal:460, p:18, c:65, f:14, grams:320 },
    { id:'stir_fry',       name:'מוקפץ ירקות',         icon:'🥦', serving:'מנה',        kcal:200, p:8,  c:28, f:7,  grams:250 },
    { id:'fried_rice',     name:'אורז מטוגן',          icon:'🍚', serving:'מנה',        kcal:370, p:10, c:55, f:12, grams:280 },
    { id:'onion_rings',    name:'טבעות בצל',           icon:'🧅', serving:'מנה',        kcal:280, p:4,  c:35, f:14, grams:100 },
    { id:'corn_dog',       name:'קורן דוג',            icon:'🌭', serving:'יחידה',      kcal:200, p:7,  c:22, f:10, grams:80  },
    { id:'mcburger',       name:'מק רויאל',            icon:'🍔', serving:'יחידה',      kcal:490, p:25, c:41, f:25, grams:200 },
    { id:'mcfries',        name:'מקפריז',              icon:'🍟', serving:'מנה בינונית', kcal:340, p:4,  c:44, f:16, grams:117 },

    // ── מוצרי בשר מעובד ──
    { id:'pastrami_turkey',name:'פסטרמה הודו',          icon:'🍖', serving:'3 פרוסות',   kcal:60,  p:11, c:1,  f:1,  grams:45  },
    { id:'corned_beef',    name:'קורנד ביף',           icon:'🥩', serving:'60ג',        kcal:145, p:12, c:0,  f:10, grams:60  },
    { id:'tuna_salad',     name:'סלט טונה',            icon:'🐟', serving:'100ג',       kcal:180, p:14, c:5,  f:11, grams:100 },
    { id:'egg_salad',      name:'סלט ביצים',           icon:'🥚', serving:'100ג',       kcal:190, p:8,  c:3,  f:16, grams:100 },
    { id:'liver_pate',     name:'פטה כבד',             icon:'🍖', serving:'כף',         kcal:90,  p:4,  c:1,  f:8,  grams:28  },
    { id:'smoked_salmon',  name:'סלמון מעושן',         icon:'🐟', serving:'50ג',        kcal:80,  p:11, c:0,  f:4,  grams:50  },
    { id:'herring',        name:'הרינג',               icon:'🐟', serving:'100ג',       kcal:220, p:19, c:0,  f:15, grams:100 },

    // ── אוכל בריאות ──
    { id:'acai_bowl',      name:'קערת אסאי',           icon:'🫐', serving:'קערה',       kcal:350, p:6,  c:60, f:10, grams:300 },
    { id:'overnight_oats', name:'שיבולת שועל לילית',   icon:'🥣', serving:'כוס',        kcal:330, p:12, c:52, f:8,  grams:300 },
    { id:'protein_bar',    name:'חטיף חלבון',          icon:'🍫', serving:'יחידה',      kcal:200, p:20, c:18, f:7,  grams:60  },
    { id:'granola_bar',    name:'חטיף גרנולה',         icon:'🥜', serving:'יחידה',      kcal:190, p:4,  c:28, f:7,  grams:47  },
    { id:'energy_ball',    name:'כדורי אנרגיה',        icon:'🌰', serving:'2 כדורים',   kcal:170, p:5,  c:20, f:8,  grams:45  },
    { id:'collagen',       name:'קולגן אבקה',          icon:'🥛', serving:'כף',         kcal:35,  p:9,  c:0,  f:0,  grams:10  },
    { id:'whey_protein',   name:'חלבון מי גבינה',      icon:'🥤', serving:'מנה',        kcal:120, p:24, c:3,  f:1,  grams:30  },
    { id:'casein',         name:'קזאין',               icon:'🥤', serving:'מנה',        kcal:120, p:24, c:3,  f:1,  grams:32  },
    { id:'creatine',       name:'קריאטין',             icon:'💊', serving:'כפית',       kcal:0,   p:0,  c:0,  f:0,  grams:5   },
    { id:'spirulina',      name:'ספירולינה',           icon:'🌿', serving:'כפית',       kcal:20,  p:4,  c:2,  f:0,  grams:7   },
    { id:'kombucha',       name:'קומבוצ׳ה',            icon:'🫙', serving:'כוס',        kcal:30,  p:0,  c:7,  f:0,  grams:240 },
    { id:'matcha',         name:'מאצ׳ה',               icon:'🍵', serving:'כפית',       kcal:5,   p:1,  c:1,  f:0,  grams:3   },

    // ── פירות ים ומוצרי ים נוספים ──
    { id:'cod',            name:'בקלה',                icon:'🐟', serving:'150ג',       kcal:195, p:34, c:0,  f:6,  grams:150 },
    { id:'anchovy',        name:'אנשובי',              icon:'🐟', serving:'5 פילטים',   kcal:35,  p:5,  c:0,  f:2,  grams:20  },

    // ── מוצרים ארוזים ישראליים ──
    { id:'toast_bread',    name:'לחם אחיד',            icon:'🍞', serving:'פרוסה',      kcal:70,  p:3,  c:13, f:1,  grams:28  },
    { id:'milk_pudding',   name:'פודינג חלב',          icon:'🍮', serving:'גביע',       kcal:160, p:4,  c:26, f:4,  grams:130 },
    { id:'choc_pudding',   name:'פודינג שוקולד',       icon:'🍮', serving:'גביע',       kcal:170, p:4,  c:28, f:5,  grams:130 },
    { id:'vanilla_pudding',name:'פודינג וניל',         icon:'🍮', serving:'גביע',       kcal:160, p:4,  c:26, f:4,  grams:130 },
    { id:'cottage_big',    name:'קוטג׳ 5% גדול',       icon:'🧀', serving:'500ג',       kcal:460, p:56, c:18, f:24, grams:500 },
    { id:'leben_straw',    name:'לבן תות',             icon:'🥛', serving:'גביע',       kcal:110, p:6,  c:17, f:2,  grams:150 },
    { id:'yoplait',        name:'יופלה',               icon:'🥛', serving:'גביע',       kcal:120, p:5,  c:19, f:3,  grams:125 },
    { id:'milky',          name:'מילקי שוקולד',        icon:'🍮', serving:'גביע',       kcal:200, p:5,  c:28, f:8,  grams:200 },
    { id:'milky_van',      name:'מילקי וניל',          icon:'🍮', serving:'גביע',       kcal:185, p:5,  c:27, f:7,  grams:200 },
    { id:'tnuva_chocolate',name:'שוקולד טנובה',        icon:'🥛', serving:'250מל',      kcal:210, p:8,  c:33, f:5,  grams:250 },
    { id:'white_cheese_30',name:'גבינה לבנה 30%',      icon:'🧀', serving:'100ג',       kcal:280, p:7,  c:3,  f:27, grams:100 },
    { id:'spread_5pct',    name:'ממרח גבינה 5%',       icon:'🧀', serving:'כף',         kcal:40,  p:4,  c:1,  f:2,  grams:28  },
    { id:'spread_25pct',   name:'ממרח גבינה 25%',      icon:'🧀', serving:'כף',         kcal:80,  p:3,  c:1,  f:7,  grams:28  },

    // ── ירקות נוספים ──
    { id:'broccoli_raw',   name:'ברוקולי נא',          icon:'🥦', serving:'כוס',        kcal:31,  p:3,  c:6,  f:0,  grams:90  },
    { id:'spinach_raw',    name:'תרד נא',              icon:'🌿', serving:'כוס',        kcal:7,   p:1,  c:1,  f:0,  grams:30  },
    { id:'arugula',        name:'רוקט',                icon:'🌿', serving:'כוס',        kcal:5,   p:1,  c:1,  f:0,  grams:20  },
    { id:'sweet_corn',     name:'תירס מתוק',           icon:'🌽', serving:'100ג',       kcal:86,  p:3,  c:19, f:1,  grams:100 },
    { id:'edamame_pod',    name:'אדממה בתרמיל',        icon:'🫛', serving:'כוס',        kcal:188, p:17, c:14, f:8,  grams:155 },
    { id:'pickles',        name:'חמוצים',              icon:'🥒', serving:'2 מלפפוניות',kcal:8,   p:0,  c:2,  f:0,  grams:60  },
    { id:'olives',         name:'זיתים',               icon:'🫒', serving:'10 יחידות',  kcal:60,  p:0,  c:2,  f:6,  grams:34  },
    { id:'sun_dried_tomato',name:'עגבניות מיובשות',    icon:'🍅', serving:'כף',         kcal:35,  p:2,  c:7,  f:0,  grams:14  },

    // ── ממרחים ופסטות ──
    { id:'hummus_ready',   name:'חומוס מוכן',          icon:'🫛', serving:'100ג',       kcal:170, p:8,  c:14, f:9,  grams:100 },
    { id:'baba_ganoush',   name:'בבא גנוש',            icon:'🍆', serving:'100ג',       kcal:90,  p:2,  c:8,  f:5,  grams:100 },
    { id:'matbucha',       name:'מטבוחה',              icon:'🍅', serving:'100ג',       kcal:70,  p:2,  c:12, f:2,  grams:100 },
    { id:'tahini_full',    name:'טחינה מלאה',          icon:'🫙', serving:'כף',         kcal:92,  p:3,  c:3,  f:8,  grams:15  },
    { id:'pesto',          name:'פסטו',                icon:'🌿', serving:'כף',         kcal:80,  p:2,  c:1,  f:8,  grams:15  },
    { id:'tapenade',       name:'טפנד',                icon:'🫒', serving:'כף',         kcal:90,  p:1,  c:1,  f:9,  grams:15  },
    { id:'guacamole',      name:'גואקמולה',            icon:'🥑', serving:'100ג',       kcal:150, p:2,  c:9,  f:13, grams:100 },
    { id:'salsa',          name:'סלסה',                icon:'🍅', serving:'כף',         kcal:10,  p:0,  c:2,  f:0,  grams:16  },

    // ── פירות ים נוספים ──
    { id:'mussels',        name:'מולים',               icon:'🦪', serving:'100ג',       kcal:86,  p:12, c:4,  f:2,  grams:100 },
    { id:'crab',           name:'סרטן',                icon:'🦀', serving:'100ג',       kcal:97,  p:19, c:0,  f:2,  grams:100 },
    { id:'lobster',        name:'לובסטר',              icon:'🦞', serving:'100ג',       kcal:97,  p:20, c:1,  f:1,  grams:100 },
    { id:'oyster',         name:'צדפות',               icon:'🦪', serving:'6 יחידות',   kcal:57,  p:6,  c:3,  f:2,  grams:84  },
    { id:'squid',          name:'דיונון',              icon:'🦑', serving:'100ג',       kcal:92,  p:16, c:3,  f:1,  grams:100 },

    // ── ארוחות מוכנות ──
    { id:'lasagna',        name:'לזניה',               icon:'🍝', serving:'מנה',        kcal:380, p:18, c:38, f:17, grams:250 },
    { id:'moussaka',       name:'מוסקה',               icon:'🍆', serving:'מנה',        kcal:320, p:16, c:28, f:16, grams:250 },
    { id:'stuffed_pepper', name:'פלפל ממולא',          icon:'🫑', serving:'יחידה',      kcal:220, p:12, c:28, f:7,  grams:200 },
    { id:'stuffed_vine',   name:'עלי גפן',             icon:'🌿', serving:'5 יחידות',   kcal:180, p:6,  c:24, f:7,  grams:150 },
    { id:'kibbeh',         name:'כיבה',                icon:'🍖', serving:'2 יחידות',   kcal:220, p:12, c:18, f:11, grams:120 },
    { id:'meatball',       name:'קציצות',              icon:'🍖', serving:'3 קציצות',   kcal:240, p:16, c:12, f:14, grams:150 },
    { id:'chicken_soup_kreplach',name:'קרפלך',        icon:'🍲', serving:'3 יחידות',   kcal:180, p:9,  c:22, f:6,  grams:120 },

    // ── מוצרים נוספים ──
    { id:'olive_oil_ev',   name:'שמן זית כתית',        icon:'🫒', serving:'כף',         kcal:120, p:0,  c:0,  f:14, grams:14  },
    { id:'tahini_sesame',  name:'שומשום לבן',          icon:'🌾', serving:'כף',         kcal:52,  p:2,  c:2,  f:4,  grams:9   },
    { id:'za_atar',        name:'זעתר',                icon:'🌿', serving:'כפית',       kcal:5,   p:0,  c:1,  f:0,  grams:2   },
    { id:'sumac',          name:'סומאק',               icon:'🌿', serving:'כפית',       kcal:4,   p:0,  c:1,  f:0,  grams:2   },
    { id:'tahini_sauce',   name:'רוטב טחינה',          icon:'🫙', serving:'2 כפות',     kcal:120, p:4,  c:5,  f:10, grams:30  },
    { id:'coconut_milk',   name:'חלב קוקוס',           icon:'🥥', serving:'100מל',      kcal:200, p:2,  c:3,  f:21, grams:100 },
    { id:'coconut_flakes', name:'קוקוס מגורר',         icon:'🥥', serving:'כף',         kcal:70,  p:1,  c:3,  f:7,  grams:14  },
    { id:'canned_tomatoes',name:'עגבניות שימורים',     icon:'🍅', serving:'100ג',       kcal:18,  p:1,  c:4,  f:0,  grams:100 },
    { id:'tomato_paste',   name:'רסק עגבניות',         icon:'🍅', serving:'כף',         kcal:13,  p:1,  c:3,  f:0,  grams:16  },
    { id:'vegetable_stock',name:'מרק ירקות מוכן',      icon:'🫙', serving:'כוס',        kcal:15,  p:1,  c:3,  f:0,  grams:240 },
    { id:'miso',           name:'מיסו',                icon:'🫙', serving:'כף',         kcal:35,  p:2,  c:5,  f:1,  grams:17  },
    { id:'tahini_choc',    name:'טחינה עם שוקולד',     icon:'🫙', serving:'כף',         kcal:110, p:2,  c:8,  f:8,  grams:20  },
    { id:'date_spread',    name:'ממרח תמרים',          icon:'🌴', serving:'כף',         kcal:70,  p:0,  c:18, f:0,  grams:20  },
    { id:'carob',          name:'חרוב',                icon:'🌿', serving:'30ג',        kcal:70,  p:1,  c:17, f:0,  grams:30  },

    // ── מאפים נוספים ──
    { id:'pancake',        name:'פנקייק',              icon:'🥞', serving:'2 יחידות',   kcal:180, p:5,  c:28, f:5,  grams:120 },
    { id:'waffle',         name:'וופל',                icon:'🧇', serving:'יחידה',      kcal:220, p:6,  c:32, f:8,  grams:75  },
    { id:'french_toast',   name:'טוסט צרפתי',          icon:'🍞', serving:'יחידה',      kcal:230, p:8,  c:30, f:9,  grams:110 },
    { id:'english_muffin', name:'מאפין אנגלי',         icon:'🥯', serving:'יחידה',      kcal:130, p:5,  c:26, f:1,  grams:57  },
    { id:'puff_pastry',    name:'בצק עלים',            icon:'🫓', serving:'100ג',       kcal:400, p:6,  c:40, f:25, grams:100 },
    { id:'phyllo',         name:'בצק פילו',            icon:'🫓', serving:'2 יריעות',   kcal:90,  p:2,  c:17, f:2,  grams:30  },

    // ── קינוחים קפואים ──
    { id:'sorbet',         name:'סורבה',               icon:'🍧', serving:'כדור',       kcal:100, p:0,  c:26, f:0,  grams:100 },
    { id:'frozen_yogurt',  name:'פרוזן יוגורט',        icon:'🍦', serving:'כדור',       kcal:120, p:3,  c:22, f:2,  grams:100 },
    { id:'ice_cream_van',  name:'גלידת וניל',          icon:'🍨', serving:'כדור',       kcal:145, p:2,  c:17, f:7,  grams:100 },
    { id:'popsicle',       name:'ארטיק קרח',           icon:'🧊', serving:'יחידה',      kcal:40,  p:0,  c:10, f:0,  grams:70  },
    { id:'ice_cream_sand', name:'סנדוויץ׳ גלידה',      icon:'🍪', serving:'יחידה',      kcal:240, p:4,  c:34, f:10, grams:110 },

    // ── תוספות ──
    { id:'ketchup_h',      name:'קטשופ היינץ',         icon:'🍅', serving:'כף',         kcal:15,  p:0,  c:4,  f:0,  grams:17  },
    { id:'bbq_sauce',      name:'רוטב ברביקיו',        icon:'🫙', serving:'כף',         kcal:25,  p:0,  c:6,  f:0,  grams:17  },
    { id:'ranch',          name:'ראנץ׳',               icon:'🥗', serving:'כף',         kcal:65,  p:0,  c:1,  f:7,  grams:15  },
    { id:'tahini_lemon',   name:'טחינה לימון',         icon:'🫙', serving:'כף',         kcal:70,  p:2,  c:4,  f:6,  grams:15  },
    { id:'dressing_caesar',name:'רוטב קיסר',           icon:'🥗', serving:'כף',         kcal:80,  p:1,  c:1,  f:8,  grams:15  },
    { id:'dressing_balsam',name:'רוטב בלסמי',          icon:'🫙', serving:'כף',         kcal:25,  p:0,  c:5,  f:1,  grams:15  },

    // ── פיתות ──
    { id:'pita_mini',        name:'פיתה מיני',            icon:'🫓', serving:'2 יחידות',   kcal:120, p:4,  c:23, f:1,  grams:55  },
    { id:'pita_spelt',       name:'פיתה כוסמין',           icon:'🫓', serving:'יחידה',      kcal:160, p:6,  c:30, f:2,  grams:75  },
    { id:'pita_thin',        name:'פיתה דקה',              icon:'🫓', serving:'יחידה',      kcal:130, p:5,  c:26, f:1,  grams:60  },
    { id:'pita_thick',       name:'פיתה עבה',              icon:'🫓', serving:'יחידה',      kcal:190, p:6,  c:38, f:2,  grams:85  },
    { id:'pita_toast',       name:'פיתה טוסט',             icon:'🫓', serving:'יחידה',      kcal:155, p:5,  c:31, f:1,  grams:70  },
    { id:'pita_mini_whole',  name:'פיתה מיני מלאה',        icon:'🫓', serving:'2 יחידות',   kcal:110, p:4,  c:21, f:1,  grams:55  },
    { id:'pita_sesame',      name:'פיתה שומשום',           icon:'🫓', serving:'יחידה',      kcal:175, p:6,  c:33, f:2,  grams:75  },
    { id:'arukhit',          name:'ארוחית',                icon:'🫓', serving:'יחידה',      kcal:70,  p:3,  c:14, f:1,  grams:32  },

    // ── סוגי פסטות ──
    { id:'penne',            name:'פנה מבושלת',            icon:'🍝', serving:'כוס',        kcal:220, p:8,  c:43, f:1,  grams:140 },
    { id:'farfalle',         name:'פרפלה מבושלת',          icon:'🍝', serving:'כוס',        kcal:215, p:8,  c:42, f:1,  grams:140 },
    { id:'rigatoni',         name:'ריגטוני מבושל',         icon:'🍝', serving:'כוס',        kcal:220, p:8,  c:43, f:1,  grams:140 },
    { id:'fusilli',          name:'פוסילי מבושל',          icon:'🍝', serving:'כוס',        kcal:215, p:8,  c:42, f:1,  grams:140 },
    { id:'linguine',         name:'לינגוויני מבושל',       icon:'🍝', serving:'כוס',        kcal:220, p:8,  c:43, f:1,  grams:140 },
    { id:'tagliatelle',      name:'טליאטלה מבושלת',        icon:'🍝', serving:'כוס',        kcal:215, p:7,  c:42, f:1,  grams:140 },
    { id:'gnocchi',          name:'ניוקי',                 icon:'🍝', serving:'כוס',        kcal:250, p:6,  c:51, f:2,  grams:180 },
    { id:'pasta_cream',      name:'פסטה ברוטב שמנת',       icon:'🍝', serving:'מנה',        kcal:440, p:12, c:52, f:20, grams:280 },
    { id:'pasta_bolognese',  name:'פסטה בולונז',           icon:'🍝', serving:'מנה',        kcal:480, p:25, c:50, f:18, grams:300 },
    { id:'pasta_pesto',      name:'פסטה פסטו',             icon:'🍝', serving:'מנה',        kcal:420, p:12, c:50, f:18, grams:280 },
    { id:'pasta_arrab',      name:'פסטה אראביאטה',         icon:'🍝', serving:'מנה',        kcal:340, p:10, c:58, f:8,  grams:280 },
    { id:'pasta_aglio',      name:'פסטה אגליו אוליו',      icon:'🍝', serving:'מנה',        kcal:380, p:10, c:55, f:13, grams:280 },
    { id:'pasta_fresh',      name:'פסטה טרייה',            icon:'🍝', serving:'כוס',        kcal:265, p:9,  c:50, f:3,  grams:140 },
    { id:'pasta_gf',         name:'פסטה ללא גלוטן',        icon:'🍝', serving:'כוס',        kcal:210, p:4,  c:44, f:1,  grams:140 },
    { id:'orzo',             name:'אורזו מבושל',           icon:'🍝', serving:'כוס',        kcal:213, p:7,  c:43, f:1,  grams:140 },

    // ── סוגי אורז ──
    { id:'rice_jasmine',     name:'אורז יסמין',            icon:'🍚', serving:'כוס',        kcal:205, p:4,  c:44, f:0,  grams:160 },
    { id:'rice_arborio',     name:'אורז ארבוריו',          icon:'🍚', serving:'כוס',        kcal:210, p:4,  c:46, f:0,  grams:160 },
    { id:'rice_wild',        name:'אורז בר',               icon:'🍚', serving:'כוס',        kcal:166, p:7,  c:35, f:1,  grams:160 },
    { id:'rice_red',         name:'אורז אדום',             icon:'🍚', serving:'כוס',        kcal:215, p:5,  c:45, f:2,  grams:160 },
    { id:'rice_black',       name:'אורז שחור',             icon:'🍚', serving:'כוס',        kcal:220, p:5,  c:46, f:2,  grams:160 },
    { id:'rice_sticky',      name:'אורז דביק',             icon:'🍚', serving:'כוס',        kcal:215, p:4,  c:47, f:0,  grams:160 },
    { id:'rice_persian',     name:'אורז פרסי (קשקש)',      icon:'🍚', serving:'מנה',        kcal:310, p:5,  c:65, f:3,  grams:250 },
    { id:'risotto',          name:'ריזוטו',                icon:'🍚', serving:'מנה',        kcal:380, p:8,  c:60, f:12, grams:280 },
    { id:'rice_pilaf',       name:'אורז פילאף',            icon:'🍚', serving:'מנה',        kcal:310, p:6,  c:58, f:6,  grams:250 },
    { id:'rice_lentils',     name:'אורז עם עדשים',         icon:'🍚', serving:'מנה',        kcal:300, p:12, c:55, f:3,  grams:250 },
    { id:'rice_saffron',     name:'אורז זעפרן',            icon:'🍚', serving:'מנה',        kcal:290, p:5,  c:61, f:2,  grams:230 },
    { id:'rice_vermicelli',  name:'אורז עם שעורית',        icon:'🍚', serving:'כוס',        kcal:230, p:5,  c:48, f:2,  grams:165 },

    // ── פתיתים ──
    { id:'ptitim_whole',     name:'פתיתים מלאים',          icon:'🌾', serving:'כוס',        kcal:195, p:8,  c:40, f:1,  grams:200 },
    { id:'ptitim_color',     name:'פתיתים צבעוניים',       icon:'🌾', serving:'כוס',        kcal:215, p:7,  c:45, f:1,  grams:200 },
    { id:'ptitim_butter',    name:'פתיתים בחמאה',          icon:'🌾', serving:'כוס',        kcal:285, p:7,  c:46, f:8,  grams:220 },
    { id:'ptitim_tomato',    name:'פתיתים ברוטב עגבניות',  icon:'🌾', serving:'כוס',        kcal:260, p:8,  c:50, f:4,  grams:230 },
    { id:'ptitim_cream',     name:'פתיתים ברוטב שמנת',     icon:'🌾', serving:'כוס',        kcal:310, p:8,  c:47, f:10, grams:230 },
    { id:'ptitim_fried',     name:'פתיתים מטוגנים',        icon:'🌾', serving:'כוס',        kcal:340, p:7,  c:48, f:13, grams:220 },

    // ── טורטיות ──
    { id:'tortilla_whole',   name:'טורטייה קמח מלא',       icon:'🫓', serving:'יחידה',      kcal:180, p:6,  c:32, f:4,  grams:72  },
    { id:'tortilla_spinach', name:'טורטייה תרד',           icon:'🫓', serving:'יחידה',      kcal:175, p:5,  c:32, f:4,  grams:72  },
    { id:'tortilla_paprika', name:'טורטייה פפריקה',        icon:'🫓', serving:'יחידה',      kcal:190, p:5,  c:34, f:4,  grams:72  },
    { id:'tortilla_large',   name:'טורטייה גדולה (בוריטו)',icon:'🫓', serving:'יחידה',      kcal:290, p:7,  c:52, f:6,  grams:110 },
    { id:'tortilla_mini',    name:'טורטייה מיני',          icon:'🫓', serving:'3 יחידות',   kcal:170, p:5,  c:30, f:3,  grams:65  },
    { id:'wrap_plain',       name:'ראפ לבן',               icon:'🫓', serving:'יחידה',      kcal:220, p:6,  c:40, f:4,  grams:85  },

    // ── גבינות נוספות ──
    { id:'camembert',        name:'קממבר',                icon:'🧀', serving:'30ג',        kcal:90,  p:6,  c:0,  f:7,  grams:30  },
    { id:'edam',             name:'אדם',                  icon:'🧀', serving:'פרוסה',      kcal:85,  p:7,  c:0,  f:6,  grams:20  },
    { id:'emmental',         name:'אמנטל',                icon:'🧀', serving:'פרוסה',      kcal:95,  p:7,  c:0,  f:7,  grams:20  },
    { id:'gruyere',          name:'גרייר',                icon:'🧀', serving:'פרוסה',      kcal:100, p:7,  c:0,  f:8,  grams:20  },
    { id:'philadelphia',     name:'פילדלפיה',             icon:'🧀', serving:'כף',         kcal:75,  p:2,  c:1,  f:7,  grams:28  },
    { id:'mascarpone',       name:'מסקרפונה',             icon:'🧀', serving:'כף',         kcal:120, p:2,  c:1,  f:12, grams:28  },
    { id:'mozz_buffalo',     name:'מוצרלה בופלו',         icon:'🧀', serving:'30ג',        kcal:70,  p:5,  c:1,  f:5,  grams:30  },
    { id:'gouda_smoked',     name:'גאודה מעושנת',         icon:'🧀', serving:'פרוסה',      kcal:105, p:7,  c:1,  f:8,  grams:25  },
    { id:'cheese_tzamat',    name:'גבינה צמת',            icon:'🧀', serving:'100ג',       kcal:290, p:18, c:2,  f:23, grams:100 },
    { id:'cheese_bar',       name:'בארה',                 icon:'🧀', serving:'100ג',       kcal:340, p:10, c:2,  f:31, grams:100 },
    { id:'cheese_emek_hard', name:'עמק קשה',              icon:'🧀', serving:'פרוסה',      kcal:90,  p:6,  c:1,  f:7,  grams:20  },
    { id:'cheese_braided',   name:'גבינה קלועה',          icon:'🧀', serving:'30ג',        kcal:100, p:7,  c:1,  f:8,  grams:30  },
    { id:'tilsit',           name:'טילסיט',               icon:'🧀', serving:'פרוסה',      kcal:95,  p:7,  c:0,  f:7,  grams:20  },
    { id:'roquefort',        name:'רוקפור',               icon:'🧀', serving:'30ג',        kcal:105, p:6,  c:1,  f:9,  grams:30  },
    { id:'cheese_light',     name:'גבינה מופחתת שומן',    icon:'🧀', serving:'פרוסה',      kcal:45,  p:6,  c:0,  f:2,  grams:20  },

    // ── פסטרמות ובשר מעובד נוסף ──
    { id:'pastrami_chicken', name:'פסטרמה עוף',           icon:'🍖', serving:'3 פרוסות',   kcal:55,  p:10, c:1,  f:1,  grams:45  },
    { id:'pastrami_smoked',  name:'פסטרמה מעושנת',        icon:'🍖', serving:'3 פרוסות',   kcal:70,  p:10, c:1,  f:3,  grams:45  },
    { id:'pastrami_bbq',     name:'פסטרמה ברביקיו',       icon:'🍖', serving:'3 פרוסות',   kcal:75,  p:10, c:2,  f:3,  grams:45  },
    { id:'hot_dog_chicken',  name:'נקניקיית עוף',          icon:'🌭', serving:'יחידה',      kcal:120, p:8,  c:3,  f:8,  grams:55  },
    { id:'hot_dog_turkey',   name:'נקניקיית הודו',         icon:'🌭', serving:'יחידה',      kcal:110, p:9,  c:2,  f:6,  grams:55  },
    { id:'kabanos',          name:'קבנוס',                icon:'🍖', serving:'יחידה',      kcal:90,  p:5,  c:1,  f:8,  grams:30  },
    { id:'merguez',          name:'מרגז',                 icon:'🌭', serving:'יחידה',      kcal:220, p:12, c:1,  f:19, grams:80  },
    { id:'bologna',          name:'בולוניה',              icon:'🍖', serving:'2 פרוסות',   kcal:100, p:5,  c:2,  f:8,  grams:30  },
    { id:'mortadella',       name:'מורטדלה',              icon:'🍖', serving:'2 פרוסות',   kcal:95,  p:5,  c:1,  f:8,  grams:30  },
    { id:'turkey_bacon',     name:'בקון הודו',            icon:'🍖', serving:'2 פרוסות',   kcal:70,  p:8,  c:1,  f:4,  grams:28  },
    { id:'vitner',           name:'ויינרס',               icon:'🌭', serving:'יחידה',      kcal:100, p:5,  c:2,  f:8,  grams:40  },
    { id:'salami_chicken',   name:'סלמי עוף',             icon:'🍖', serving:'2 פרוסות',   kcal:80,  p:5,  c:1,  f:6,  grams:25  },
    { id:'schnitzel_beef',   name:'שניצל בקר',            icon:'🥩', serving:'150ג',       kcal:380, p:35, c:14, f:20, grams:150 },
    { id:'lamb',             name:'כבש',                  icon:'🥩', serving:'150ג',       kcal:310, p:35, c:0,  f:18, grams:150 },
    { id:'lamb_chops',       name:'צלעות כבש',            icon:'🥩', serving:'2 צלעות',   kcal:280, p:28, c:0,  f:18, grams:160 },

    // ── מעדנים ישראליים ──
    { id:'milky_coffee',     name:'מילקי קפה',            icon:'🍮', serving:'גביע',       kcal:195, p:5,  c:27, f:8,  grams:200 },
    { id:'milky_strawberry', name:'מילקי תות',            icon:'🍮', serving:'גביע',       kcal:190, p:5,  c:28, f:7,  grams:200 },
    { id:'milky_cream',      name:'מילקי קרמה',           icon:'🍮', serving:'גביע',       kcal:200, p:5,  c:29, f:8,  grams:200 },
    { id:'choc_mousse',      name:'מוס שוקולד',           icon:'🍮', serving:'גביע',       kcal:220, p:4,  c:28, f:10, grams:150 },
    { id:'van_mousse',       name:'מוס וניל',             icon:'🍮', serving:'גביע',       kcal:200, p:4,  c:27, f:8,  grams:150 },
    { id:'adanut',           name:'עדינית',               icon:'🍮', serving:'גביע',       kcal:130, p:4,  c:20, f:4,  grams:120 },
    { id:'yotvata_dessert',  name:'מעדן יוטבתה',          icon:'🍮', serving:'גביע',       kcal:175, p:5,  c:26, f:6,  grams:160 },
    { id:'rice_pud_van',     name:'ריזוגלו וניל',         icon:'🍮', serving:'100ג',       kcal:110, p:3,  c:20, f:2,  grams:100 },
    { id:'creme_caramel',    name:'קרם קרמל',             icon:'🍮', serving:'גביע',       kcal:180, p:4,  c:30, f:5,  grams:150 },
    { id:'panna_cotta',      name:'פאנה קוטה',            icon:'🍮', serving:'גביע',       kcal:200, p:4,  c:22, f:11, grams:150 },
    { id:'tiramisu',         name:'טירמיסו',              icon:'🍮', serving:'פרוסה',      kcal:300, p:6,  c:30, f:17, grams:120 },
    { id:'krembo_van',       name:'קרמבו וניל',           icon:'🍪', serving:'יחידה',      kcal:108, p:1,  c:18, f:4,  grams:29  },

    // ── משקאות חלבון ──
    { id:'whey_vanilla',     name:'חלבון וניל',           icon:'🥤', serving:'מנה 30ג',    kcal:125, p:25, c:3,  f:1,  grams:30  },
    { id:'whey_chocolate',   name:'חלבון שוקולד',         icon:'🥤', serving:'מנה 30ג',    kcal:125, p:25, c:3,  f:1,  grams:30  },
    { id:'whey_strawberry',  name:'חלבון תות',            icon:'🥤', serving:'מנה 30ג',    kcal:120, p:24, c:3,  f:1,  grams:30  },
    { id:'iso_protein',      name:'חלבון איזולט',         icon:'🥤', serving:'מנה 28ג',    kcal:105, p:24, c:1,  f:0,  grams:28  },
    { id:'mass_gainer',      name:'מאס גיינר',            icon:'🥤', serving:'מנה 150ג',   kcal:600, p:30, c:110,f:5,  grams:150 },
    { id:'vegan_protein',    name:'חלבון טבעוני',         icon:'🥤', serving:'מנה 30ג',    kcal:115, p:22, c:4,  f:2,  grams:30  },
    { id:'pea_protein',      name:'חלבון אפונה',          icon:'🥤', serving:'מנה 30ג',    kcal:115, p:23, c:2,  f:2,  grams:30  },
    { id:'soy_protein',      name:'חלבון סויה אבקה',      icon:'🥤', serving:'מנה 28ג',    kcal:95,  p:23, c:0,  f:1,  grams:28  },
    { id:'protein_rtd_van',  name:'שייק חלבון מוכן וניל', icon:'🥤', serving:'פחית',       kcal:160, p:30, c:5,  f:3,  grams:330 },
    { id:'protein_rtd_choc', name:'שייק חלבון מוכן שוקו', icon:'🥤', serving:'פחית',       kcal:170, p:30, c:6,  f:4,  grams:330 },
    { id:'amino_drink',      name:'משקה אמינו',           icon:'🥤', serving:'בקבוק',      kcal:20,  p:5,  c:0,  f:0,  grams:500 },
    { id:'bcaa_drink',       name:'משקה BCAA',            icon:'🥤', serving:'בקבוק',      kcal:10,  p:3,  c:0,  f:0,  grams:500 },
    { id:'protein_bar_choc', name:'חטיף חלבון שוקולד',    icon:'🍫', serving:'יחידה',      kcal:220, p:21, c:20, f:8,  grams:65  },
    { id:'protein_bar_van',  name:'חטיף חלבון וניל',      icon:'🍫', serving:'יחידה',      kcal:200, p:20, c:18, f:7,  grams:60  },
    { id:'casein_choc',      name:'קזאין שוקולד',         icon:'🥤', serving:'מנה 33ג',    kcal:120, p:24, c:3,  f:1,  grams:33  },
    { id:'egg_white_powder', name:'חלבון ביצה אבקה',      icon:'🥤', serving:'מנה 30ג',    kcal:105, p:26, c:0,  f:0,  grams:30  },

    // ── חטיפי שוקולד ──
    { id:'snickers',         name:'סניקרס',               icon:'🍫', serving:'יחידה',      kcal:280, p:4,  c:35, f:14, grams:57  },
    { id:'twix',             name:'טוויקס',               icon:'🍫', serving:'יחידה',      kcal:286, p:3,  c:37, f:14, grams:57  },
    { id:'mars',             name:'מארס',                 icon:'🍫', serving:'יחידה',      kcal:230, p:2,  c:35, f:9,  grams:51  },
    { id:'bounty',           name:'באונטי',               icon:'🍫', serving:'יחידה',      kcal:270, p:2,  c:32, f:14, grams:57  },
    { id:'kinder_surprise',  name:'קינדר סרפרייז',        icon:'🍫', serving:'יחידה',      kcal:110, p:2,  c:11, f:6,  grams:20  },
    { id:'kinder_maxi',      name:'קינדר מקסי',           icon:'🍫', serving:'יחידה',      kcal:230, p:3,  c:25, f:13, grams:42  },
    { id:'kinder_country',   name:'קינדר קאנטרי',         icon:'🍫', serving:'יחידה',      kcal:195, p:3,  c:22, f:11, grams:40  },
    { id:'kit_kat',          name:'קיט קט',               icon:'🍫', serving:'2 אצבעות',   kcal:105, p:1,  c:14, f:5,  grams:21  },
    { id:'ferrero',          name:'פררו רושה',            icon:'🍫', serving:'3 יחידות',   kcal:220, p:3,  c:23, f:14, grams:37  },
    { id:'milka',            name:'מילקה',                icon:'🍫', serving:'2 קוביות',   kcal:110, p:2,  c:13, f:6,  grams:20  },
    { id:'toblerone',        name:'טובלרון',              icon:'🍫', serving:'3 קוביות',   kcal:125, p:2,  c:16, f:6,  grams:23  },
    { id:'rafaello',         name:'רפאלו',                icon:'🍫', serving:'3 יחידות',   kcal:195, p:2,  c:18, f:13, grams:36  },
    { id:'nogah',            name:'נוגה',                 icon:'🍫', serving:'יחידה',      kcal:250, p:4,  c:30, f:13, grams:55  },
    { id:'kif_kef',          name:'קיף קף',               icon:'🍫', serving:'יחידה',      kcal:220, p:3,  c:27, f:11, grams:46  },
    { id:'elite_choc',       name:'שוקולד אלית',          icon:'🍫', serving:'2 קוביות',   kcal:105, p:1,  c:13, f:6,  grams:20  },
    { id:'bambino',          name:'במבינו',               icon:'🍫', serving:'יחידה',      kcal:160, p:2,  c:21, f:8,  grams:37  },
    { id:'choco_pie',        name:'שוקו פאי',             icon:'🍫', serving:'יחידה',      kcal:125, p:1,  c:20, f:5,  grams:35  },
    { id:'after_eight',      name:'אפטר אייט',            icon:'🍫', serving:'3 יחידות',   kcal:70,  p:0,  c:13, f:2,  grams:16  },
    { id:'oreo_double',      name:'אוראו כפול',           icon:'🍪', serving:'2 עוגיות',   kcal:140, p:1,  c:21, f:6,  grams:28  },
    { id:'leibniz_choc',     name:'ליבניץ שוקולד',        icon:'🍪', serving:'2 עוגיות',   kcal:120, p:2,  c:17, f:5,  grams:26  },
    { id:'petite_beurre',    name:'פטי בר',               icon:'🍪', serving:'3 עוגיות',   kcal:120, p:2,  c:20, f:4,  grams:28  },
    { id:'mikimoto',         name:'מיקימוטו',             icon:'🍫', serving:'יחידה',      kcal:95,  p:2,  c:12, f:5,  grams:22  },
    { id:'magnum_classic',   name:'מגנום קלאסיק',         icon:'🍦', serving:'יחידה',      kcal:260, p:4,  c:24, f:16, grams:86  },
    { id:'magnum_almond',    name:'מגנום שקדים',          icon:'🍦', serving:'יחידה',      kcal:290, p:5,  c:26, f:19, grams:90  },
    { id:'cornetto',         name:'קורנטו',               icon:'🍦', serving:'יחידה',      kcal:270, p:4,  c:30, f:14, grams:90  },
    { id:'lotta_choc',       name:'לוטה שוקולד',          icon:'🍫', serving:'יחידה',      kcal:240, p:3,  c:29, f:13, grams:50  },
  ];

  const MEALS = [
    { id: 'breakfast', label: 'ארוחת בוקר', icon: '🌅' },
    { id: 'lunch', label: 'ארוחת צהריים', icon: '☀️' },
    { id: 'dinner', label: 'ארוחת ערב', icon: '🌙' },
    { id: 'snack', label: 'חטיף', icon: '🍪' },
  ];

  // ---- persistence ----
  const UKEY = 'kp_user_v1';
  const LKEY = 'kp_logs_v1';

  function loadUser() {
    try { return JSON.parse(localStorage.getItem(UKEY)); } catch { return null; }
  }
  function saveUser(u) { localStorage.setItem(UKEY, JSON.stringify(u)); }
  function clearAll() { localStorage.removeItem(UKEY); localStorage.removeItem(LKEY); }

  function loadLogs() {
    let logs = {};
    try { logs = JSON.parse(localStorage.getItem(LKEY)) || {}; } catch { logs = {}; }
    // keep only last 7 days
    const keepFrom = new Date(); keepFrom.setDate(keepFrom.getDate() - 6);
    const minKey = keepFrom.toISOString().slice(0, 10);
    Object.keys(logs).forEach(k => { if (k < minKey) delete logs[k]; });
    return logs;
  }
  function saveLogs(logs) { localStorage.setItem(LKEY, JSON.stringify(logs)); }

  function emptyDay() { return { foods: [], water: 0 }; }

  function dayTotals(day) {
    const t = { kcal: 0, p: 0, c: 0, f: 0 };
    (day?.foods || []).forEach(it => {
      t.kcal += it.kcal * it.qty; t.p += it.p * it.qty; t.c += it.c * it.qty; t.f += it.f * it.qty;
    });
    return { kcal: Math.round(t.kcal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) };
  }

  // last 7 day keys, oldest→newest
  function weekKeys() {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
  }
  function dayName(key) {
    const names = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
    const d = new Date(key + 'T00:00:00');
    return names[d.getDay()];
  }

  window.KP = {
    TODAY, calcTargets, ACTIVITY, GOALS, FOODS, MEALS,
    loadUser, saveUser, clearAll, loadLogs, saveLogs, emptyDay,
    dayTotals, weekKeys, dayName,
  };
})();
