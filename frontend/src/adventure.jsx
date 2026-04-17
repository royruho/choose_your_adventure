import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "./api.js";

// ─── TRANSLATIONS ───────────────────────────────────────────────
const TR = {
  adventureAwaits:  { English: "Adventure Awaits", Hebrew: "הרפתקה מחכה" },
  stepOf:           { English: "Step {c} of {t}", Hebrew: "שלב {c} מתוך {t}" },
  chooseWorld:      { English: "Choose Your World", Hebrew: "בחר את העולם שלך" },
  chooseWorldSub:   { English: "Select the genre for your adventure", Hebrew: "בחר את הז'אנר להרפתקה שלך" },
  language:         { English: "Language", Hebrew: "שפה" },
  languageSub:      { English: "Choose the language for your adventure", Hebrew: "בחר את השפה להרפתקה שלך" },
  contentRating:    { English: "Content Rating", Hebrew: "דירוג תוכן" },
  contentRatingSub: { English: "Set appropriate content levels", Hebrew: "הגדר רמות תוכן מתאימות" },
  kids:             { English: "Kids (8+)", Hebrew: "ילדים (8+)" },
  kidsSub:          { English: "Light-hearted, no violence or romance, simple vocabulary", Hebrew: "קליל, ללא אלימות או רומנטיקה, אוצר מילים פשוט" },
  teen:             { English: "Teen (13+)", Hebrew: "נוער (13+)" },
  teenSub:          { English: "Moderate action, light tension, engaging vocabulary", Hebrew: "אקשן מתון, מתח קל, אוצר מילים מרתק" },
  adult:            { English: "Adult (18+)", Hebrew: "מבוגרים (18+)" },
  adultSub:         { English: "Full range of themes, vivid descriptions, mature content", Hebrew: "מגוון נושאים מלא, תיאורים חיים, תוכן בוגר" },
  storyDuration:    { English: "Adventure Length", Hebrew: "אורך ההרפתקה" },
  storyDurationSub: { English: "How many turns should the adventure last?", Hebrew: "כמה תורות תימשך ההרפתקה?" },
  perspective:      { English: "Narrative Perspective", Hebrew: "נקודת מבט" },
  perspectiveSub:   { English: "How should the story refer to you?", Hebrew: "איך הסיפור יתייחס אליך?" },
  firstPerson:      { English: "First Person", Hebrew: "גוף ראשון" },
  firstPersonEx:    { English: "\"I drew my sword and stepped into the dark\"", Hebrew: "\"שלפתי את חרבי וצעדתי אל החושך\"" },
  secondPerson:     { English: "Second Person", Hebrew: "גוף שני" },
  secondPersonEx:   { English: "\"You draw your sword and step into the dark\"", Hebrew: "\"אתה שולף את חרבך וצועד אל החושך\"" },
  storyPacing:      { English: "Story Pacing", Hebrew: "קצב הסיפור" },
  storyPacingSub:   { English: "How detailed should each story beat be?", Hebrew: "כמה מפורט יהיה כל חלק בסיפור?" },
  short:            { English: "Quick & Punchy", Hebrew: "מהיר וקצר" },
  shortSub:         { English: "1-2 sentences per beat — fast-paced action", Hebrew: "1-2 משפטים — קצב מהיר" },
  medium:           { English: "Balanced", Hebrew: "מאוזן" },
  mediumSub:        { English: "A paragraph per beat — good mix of action and description", Hebrew: "פסקה אחת — שילוב טוב של אקשן ותיאור" },
  long:             { English: "Rich & Immersive", Hebrew: "עשיר וסוחף" },
  longSub:          { English: "2-3 paragraphs per beat — deep atmospheric storytelling", Hebrew: "2-3 פסקאות — סיפור אטמוספרי עמוק" },
  gameRules:        { English: "Game Rules", Hebrew: "חוקי המשחק" },
  gameRulesSub:     { English: "Configure how your adventure plays out", Hebrew: "הגדר איך ההרפתקה שלך תתנהל" },
  canDie:           { English: "Can your character die?", Hebrew: "האם הדמות שלך יכולה למות?" },
  yesDeath:         { English: "Yes, risk of death", Hebrew: "כן, סיכון למוות" },
  noDeath:          { English: "No, always continue", Hebrew: "לא, תמיד להמשיך" },
  trackStatsQ:      { English: "Track stats (health, inventory)?", Hebrew: "לעקוב אחר נתונים (בריאות, מלאי)?" },
  yesStats:         { English: "Yes, track stats", Hebrew: "כן, לעקוב" },
  noStats:          { English: "No, pure narrative", Hebrew: "לא, סיפור בלבד" },
  storySeed:        { English: "Story Seed", Hebrew: "זרע הסיפור" },
  storySeedSub:     { English: "Optionally describe a setting, scenario, or theme (or leave blank for a surprise)", Hebrew: "תאר סביבה, תרחיש או נושא (או השאר ריק להפתעה)" },
  storySeedPH:      { English: "e.g. 'A haunted space station orbiting a dying star...'", Hebrew: "למשל: 'תחנת חלל רדופה סביב כוכב גוסס...'" },
  createChar:       { English: "Create Your Character", Hebrew: "צור את הדמות שלך" },
  createCharSub:    { English: "Who are you in this story?", Hebrew: "מי אתה בסיפור הזה?" },
  name:             { English: "Name", Hebrew: "שם" },
  namePH:           { English: "Your character's name", Hebrew: "שם הדמות שלך" },
  age:              { English: "Age", Hebrew: "גיל" },
  agePH:            { English: "e.g. 28", Hebrew: "למשל 28" },
  gender:           { English: "Gender", Hebrew: "מגדר" },
  male:             { English: "Male", Hebrew: "זכר" },
  female:           { English: "Female", Hebrew: "נקבה" },
  nonBinary:        { English: "Non-binary", Hebrew: "לא בינארי" },
  other:            { English: "Other", Hebrew: "אחר" },
  appearance:       { English: "Appearance", Hebrew: "מראה" },
  appearancePH:     { English: "Describe your character's look...", Hebrew: "תאר את המראה של הדמות שלך..." },
  skills:           { English: "Skills", Hebrew: "כישורים" },
  skillsSub:        { English: "(pick up to 3)", Hebrew: "(בחר עד 3)" },
  beginAdventure:   { English: "Begin Adventure", Hebrew: "התחל הרפתקה" },
  continue_:        { English: "Continue", Hebrew: "המשך" },
  back:             { English: "← Back", Hebrew: "חזרה →" },
  whatDoYouDo:      { English: "What do you do?", Hebrew: "מה אתה עושה?", Arabic: "ماذا تفعل؟" },
  typeAction:       { English: "Write your action...", Hebrew: "כתוב את הפעולה שלך...", Arabic: "اكتب فعلك..." },
  orChoose:         { English: "or pick a suggestion", Hebrew: "או בחר הצעה", Arabic: "أو اختر اقتراحاً" },
  go:               { English: "Go", Hebrew: "קדימה", Arabic: "انطلق" },
  stats:            { English: "Stats", Hebrew: "נתונים" },
  health:           { English: "Health", Hebrew: "בריאות" },
  inventory:        { English: "Inventory", Hebrew: "מלאי" },
  relationships:    { English: "Relationships", Hebrew: "יחסים" },
  adventureOver:    { English: "Adventure Over", Hebrew: "ההרפתקה הסתיימה" },
  newAdventure:     { English: "New Adventure", Hebrew: "הרפתקה חדשה" },
  storyUnfolds:     { English: "The story unfolds...", Hebrew: "הסיפור מתגלה..." },
  turn:             { English: "Turn", Hebrew: "תור" },
  sAdventure:       { English: "'s Adventure", Hebrew: " - הרפתקה" },
  exportStory:      { English: "Export Story", Hebrew: "ייצא סיפור" },
  saveGame:         { English: "Save Game", Hebrew: "שמור משחק" },
  loadGame:         { English: "Load Game", Hebrew: "טען משחק" },
  loadGameSub:      { English: "Resume a saved adventure", Hebrew: "המשך הרפתקה שמורה" },
  loadError:        { English: "Could not load save file — file may be corrupted.", Hebrew: "לא ניתן לטעון את קובץ השמירה — הקובץ עלול להיות פגום." },
  fantasy:          { English: "Fantasy", Hebrew: "פנטזיה" },
  scifi:            { English: "Sci-Fi", Hebrew: "מדע בדיוני" },
  reality:          { English: "Reality", Hebrew: "מציאות" },
  mystery:          { English: "Mystery", Hebrew: "מסתורין" },
  // ── Dice & chapters ──
  chapterLabel:     { English: "Chapter", Hebrew: "פרק" },
  of:               { English: "of", Hebrew: "מתוך" },
  fateCheck:        { English: "Fate check required:", Hebrew: "נדרשת בדיקת גורל:" },
  rollBtn:          { English: "Roll the Dice!", Hebrew: "הטל קוביה!" },
  rollingAnim:      { English: "Rolling...", Hebrew: "מטיל..." },
  continueAfterRoll:{ English: "Continue →", Hebrew: "← המשך" },
  critFail:         { English: "Critical Failure", Hebrew: "כישלון חרוץ" },
  minorFail:        { English: "Setback", Hebrew: "מכשול" },
  partSuccess:      { English: "Partial Success", Hebrew: "הצלחה חלקית" },
  critSuccess:      { English: "Critical Success!", Hebrew: "הצלחה מוחלטת!" },
  skillBonusApplied:{ English: "Skill Bonus — rolled twice, kept highest", Hebrew: "בונוס כישור — הוטל פעמיים, נשמר הגבוה" },
  rollRequired:     { English: "Next action may require a fate check", Hebrew: "הפעולה הבאה עשויה לדרוש בדיקת גורל" },
  // ── Key setup screen ──
  keySetupTitle:    { English: "Enter your Gemini API Key", Hebrew: "הזן את מפתח ה-API של Gemini", Arabic: "أدخل مفتاح Gemini API" },
  keySetupSub:      { English: "This app runs entirely in your browser. Your key is stored only on this device and never sent to any server except Google's Gemini API.", Hebrew: "האפליקציה פועלת לחלוטין בדפדפן שלך. המפתח מאוחסן רק במכשיר זה ולא נשלח לשום שרת מלבד Gemini API של Google.", Arabic: "يعمل هذا التطبيق بالكامل في متصفحك. يُخزَّن مفتاحك فقط على هذا الجهاز ولا يُرسَل إلى أي خادم سوى Gemini API من Google." },
  keyPlaceholder:   { English: "Paste your Gemini key here (starts with AIza...)", Hebrew: "הדבק את מפתח ה-Gemini כאן (מתחיל ב-AIza...)", Arabic: "الصق مفتاح Gemini هنا (يبدأ بـ AIza...)" },
  keyValidate:      { English: "Validate & Save", Hebrew: "אמת ושמור", Arabic: "تحقق واحفظ" },
  keyValidating:    { English: "Validating...", Hebrew: "מאמת...", Arabic: "جارٍ التحقق..." },
  keyHowTo:         { English: "How to get a free Gemini key", Hebrew: "איך מקבלים מפתח Gemini בחינם", Arabic: "كيف تحصل على مفتاح Gemini مجاناً" },
  keyStep1:         { English: "Go to aistudio.google.com and sign in", Hebrew: "עבור אל aistudio.google.com והתחבר", Arabic: "انتقل إلى aistudio.google.com وسجّل الدخول" },
  keyStep2:         { English: "Click \"Get API key\" → \"Create API key in new project\"", Hebrew: "לחץ על \"Get API key\" ← \"Create API key in new project\"", Arabic: "انقر على \"Get API key\" ← \"Create API key in new project\"" },
  keyStep3:         { English: "Copy the key (starts with AIza) and paste it above", Hebrew: "העתק את המפתח (מתחיל ב-AIza) והדבק אותו למעלה", Arabic: "انسخ المفتاح (يبدأ بـ AIza) والصقه أعلاه" },
  keyStep4:         { English: "Free tier: 1,500 requests/day, 1,000,000 tokens/min — no rate limits during play", Hebrew: "תוכנית חינמית: 1,500 בקשות ליום, 1,000,000 טוקנים לדקה — ללא הגבלת קצב במשחק", Arabic: "الطبقة المجانية: 1,500 طلب/يوم، مليون رمز/دقيقة — بلا قيود أثناء اللعب" },
  keyError:         { English: "Could not validate key", Hebrew: "לא ניתן לאמת את המפתח", Arabic: "تعذّر التحقق من المفتاح" },
  changeKey:        { English: "Change API key", Hebrew: "שנה מפתח API", Arabic: "تغيير مفتاح API" },
  // ── Home screen ──
  homeTitle:        { English: "Adventure Awaits", Hebrew: "הרפתקה מחכה", Arabic: "المغامرة تنتظر" },
  startNew:         { English: "Start New Adventure", Hebrew: "התחל הרפתקה חדשה", Arabic: "ابدأ مغامرة جديدة" },
  loadSaved:        { English: "Load Saved Adventure", Hebrew: "טען הרפתקה שמורה", Arabic: "تحميل مغامرة محفوظة" },
  loadSavedSub:     { English: "Resume from a .json save file", Hebrew: "המשך מקובץ שמירה .json", Arabic: "استئناف من ملف حفظ .json" },
  versionError:     { English: "This save file was created with an incompatible version of the app and cannot be loaded.", Hebrew: "קובץ השמירה נוצר עם גרסה לא תואמת של האפליקציה ולא ניתן לטעון אותו.", Arabic: "تم إنشاء ملف الحفظ هذا بإصدار غير متوافق من التطبيق ولا يمكن تحميله." },
};

// ─── THEMES ────────────────────────────────────────────────────
const THEMES = {
  fantasy: {
    nameKey: "fantasy", bg: "#1a1408", bgCard: "rgba(62, 47, 24, 0.85)", bgStory: "rgba(244, 232, 193, 0.07)",
    primary: "#C9A44A", secondary: "#4A7C3F", accent: "#8B2500", text: "#E8D5B0", textMuted: "#9C8B6E",
    border: "#5C4A2A", heading: "'Cinzel', serif", body: "'Crimson Text', serif",
    bgImage: "radial-gradient(ellipse at 20% 80%, rgba(201,164,74,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(74,124,63,0.06) 0%, transparent 50%)",
    icon: "⚔️", particle: "✦", icons: ["⚔️", "🧙", "🐉", "🏰", "🌿"],
  },
  scifi: {
    nameKey: "scifi", bg: "#060B14", bgCard: "rgba(10, 25, 50, 0.85)", bgStory: "rgba(0, 240, 255, 0.04)",
    primary: "#00F0FF", secondary: "#8B5CF6", accent: "#FF3366", text: "#C8E0F0", textMuted: "#5A7A90",
    border: "#1A3050", heading: "'Orbitron', sans-serif", body: "'Fira Code', monospace",
    bgImage: "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.05) 0%, transparent 50%)",
    icon: "🚀", particle: "◇", icons: ["🚀", "🤖", "👾", "🛸", "⚡"],
  },
  reality: {
    nameKey: "reality", bg: "#0F1114", bgCard: "rgba(28, 32, 42, 0.85)", bgStory: "rgba(100, 180, 255, 0.04)",
    primary: "#64B5F6", secondary: "#4DB6AC", accent: "#EF5350", text: "#D0D8E8", textMuted: "#6B7A90",
    border: "#2A3040", heading: "'DM Sans', sans-serif", body: "'Merriweather', serif",
    bgImage: "radial-gradient(ellipse at 40% 90%, rgba(100,181,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 60% 10%, rgba(77,182,172,0.05) 0%, transparent 50%)",
    icon: "🌍", particle: "●", icons: ["🌍", "🏙️", "🚗", "💼", "🗺️"],
  },
  mystery: {
    nameKey: "mystery", bg: "#0D0D1A", bgCard: "rgba(22, 22, 46, 0.85)", bgStory: "rgba(226, 177, 76, 0.04)",
    primary: "#E2B14C", secondary: "#4A3078", accent: "#C0392B", text: "#D0C8E0", textMuted: "#6A6080",
    border: "#2A2050", heading: "'Playfair Display', serif", body: "'Source Serif 4', serif",
    bgImage: "radial-gradient(ellipse at 50% 50%, rgba(74,48,120,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(226,177,76,0.04) 0%, transparent 40%)",
    icon: "🔍", particle: "◆", icons: ["🔍", "🕯️", "🗝️", "💀", "🌫️"],
  },
};

const GENRE_SKILLS = {
  fantasy: { en: ["Swordsmanship","Magic","Stealth","Diplomacy","Archery","Alchemy","Beast Taming","Healing"], he: ["סייפנות","קסם","התגנבות","דיפלומטיה","קשתות","אלכימיה","אילוף חיות","ריפוי"] },
  scifi:   { en: ["Hacking","Piloting","Marksmanship","Engineering","Telepathy","Medicine","Stealth","Diplomacy"], he: ["פריצה","טיסה","קליעה","הנדסה","טלפתיה","רפואה","התגנבות","דיפלומטיה"] },
  reality: { en: ["Streetwise","Athletics","Persuasion","First Aid","Driving","Tech Savvy","Investigation","Survival"], he: ["תושייה","אתלטיקה","שכנוע","עזרה ראשונה","נהיגה","טכנולוגיה","חקירה","הישרדות"] },
  mystery: { en: ["Deduction","Interrogation","Disguise","Lockpicking","Forensics","Persuasion","Streetwise","Research"], he: ["דדוקציה","חקירה","תחפושת","פריצת מנעולים","זיהוי פלילי","שכנוע","תושייה","מחקר"] },
};

const LANGUAGES = [
  { code: "English", label: "English" },
  { code: "Hebrew",  label: "עברית" },
  { code: "Arabic",  label: "العربية" },
];

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Orbitron:wght@400;700;900&family=Fira+Code:wght@400;500&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap";
const SETUP_STEPS   = ["language", "genre", "age", "length", "duration", "rules", "perspective", "prompt", "character"];
const SUMMARY_EVERY = 5;
const WINDOW_SIZE   = 12;
const RTL_LANGS     = ["Hebrew", "Arabic"];
// Chapter count per adventure length (goal-based, not turn-based)
const CHAPTER_MAP   = { 5: 1, 10: 2, 20: 4, 40: 8 };

// Dice outcome table
const DICE_OUTCOMES = [
  null,
  { labelKey: "critFail",    color: "#FF2040", bg: "rgba(255,32,64,0.12)",    narrative: "something goes badly wrong — a real setback with consequences" },
  { labelKey: "minorFail",   color: "#FF8C00", bg: "rgba(255,140,0,0.12)",   narrative: "the attempt fails with a complication" },
  { labelKey: "minorFail",   color: "#FF8C00", bg: "rgba(255,140,0,0.12)",   narrative: "the attempt fails with a complication" },
  { labelKey: "partSuccess", color: "#4DB6AC", bg: "rgba(77,182,172,0.12)",  narrative: "partial success — it works but with a cost or catch" },
  { labelKey: "partSuccess", color: "#4DB6AC", bg: "rgba(77,182,172,0.12)",  narrative: "partial success — it works but with a cost or catch" },
  { labelKey: "critSuccess", color: "#66BB6A", bg: "rgba(102,187,106,0.12)", narrative: "exceptional success, better than expected" },
];

// ─── SHARED COMPONENTS ─────────────────────────────────────────
function FloatingParticles({ theme }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} style={{
          position: "absolute", left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          fontSize: `${8 + Math.random() * 14}px`, opacity: 0.08 + Math.random() * 0.12, color: theme.primary,
          animation: `float${i % 3} ${8 + Math.random() * 12}s ease-in-out infinite`, animationDelay: `${Math.random() * 5}s`,
        }}>{theme.particle}</span>
      ))}
    </div>
  );
}

function GenreIconStrip({ theme }) {
  if (!theme.icons) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, margin: "10px 0" }}>
      {theme.icons.map((ic, i) => (
        <span key={i} style={{
          fontSize: i === 0 ? 22 : 16, opacity: i === 0 ? 0.7 : 0.35,
          filter: "drop-shadow(0 0 6px currentColor)", transition: "all 0.4s ease",
        }}>{ic}</span>
      ))}
    </div>
  );
}

// ─── DICE ROLLER OVERLAY ────────────────────────────────────────
function DiceRoller({ theme, context, characterSkills, onResult, isRTL, t }) {
  const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  const [rolling, setRolling]       = useState(false);
  const [displayVal, setDisplayVal] = useState(null);
  const [finalVal, setFinalVal]     = useState(null);
  const [skillBonus, setSkillBonus] = useState(false);

  const checkSkillRelevance = () => {
    if (!characterSkills?.length || !context) return false;
    const ctx = context.toLowerCase();
    return characterSkills.some(skill => {
      const s = skill.toLowerCase();
      if (ctx.includes(s)) return true;
      return s.split(/\s+/).some(w => w.length > 3 && ctx.includes(w));
    });
  };

  const handleRoll = () => {
    setRolling(true);
    setFinalVal(null);
    const hasBonus = checkSkillRelevance();
    setSkillBonus(hasBonus);
    let count = 0;
    const iv = setInterval(() => {
      setDisplayVal(Math.ceil(Math.random() * 6));
      count++;
      if (count >= 20) {
        clearInterval(iv);
        const r1 = Math.ceil(Math.random() * 6);
        const r2 = hasBonus ? Math.ceil(Math.random() * 6) : r1;
        const final = Math.max(r1, r2);
        setDisplayVal(final);
        setFinalVal(final);
        setRolling(false);
      }
    }, 75);
  };

  const outcome = finalVal ? DICE_OUTCOMES[finalVal] : null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      backdropFilter: "blur(8px)", direction: isRTL ? "rtl" : "ltr",
    }}>
      <div style={{
        background: theme.bgCard, border: `1px solid ${outcome ? outcome.color : theme.border}`,
        borderRadius: 20, padding: "36px 44px", maxWidth: 420, width: "90%",
        textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        transition: "border-color 0.5s ease",
      }}>
        <div style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          {t("fateCheck")}
        </div>
        <div style={{ fontFamily: theme.heading, color: theme.text, fontSize: 16, marginBottom: 28, lineHeight: 1.4, fontStyle: "italic" }}>
          "{context}"
        </div>

        {/* Dice face */}
        <div style={{
          fontSize: 100, lineHeight: 1, margin: "0 0 20px",
          color: outcome ? outcome.color : theme.primary,
          transition: "color 0.5s ease",
          animation: rolling ? "diceRoll 0.12s ease-in-out infinite" : "none",
          filter: rolling ? "blur(2px)" : "none",
        }}>
          {displayVal ? DICE_FACES[displayVal] : "🎲"}
        </div>

        {/* Outcome label */}
        {outcome && (
          <div style={{
            background: outcome.bg, border: `1px solid ${outcome.color}50`,
            borderRadius: 10, padding: "10px 24px", marginBottom: 12,
            animation: "fadeIn 0.4s ease",
          }}>
            <div style={{ fontFamily: theme.heading, color: outcome.color, fontSize: 18, letterSpacing: 1.5, fontWeight: 700 }}>
              {t(outcome.labelKey)}
            </div>
            <div style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
              {displayVal} / 6
            </div>
          </div>
        )}

        {skillBonus && finalVal && (
          <div style={{ fontFamily: theme.body, color: theme.secondary || "#4DB6AC", fontSize: 12, marginBottom: 14, opacity: 0.9 }}>
            ✦ {t("skillBonusApplied")}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          {!finalVal ? (
            <button onClick={handleRoll} disabled={rolling} style={{
              background: rolling ? `${theme.border}88` : theme.primary,
              border: "none", borderRadius: 10, padding: "13px 36px",
              color: rolling ? theme.textMuted : theme.bg,
              fontFamily: theme.heading, fontSize: 15, fontWeight: 700,
              cursor: rolling ? "wait" : "pointer", letterSpacing: 1, transition: "all 0.2s",
            }}>
              {rolling ? t("rollingAnim") : t("rollBtn")}
            </button>
          ) : (
            <button
              onClick={() => onResult({ value: finalVal, outcome: t(outcome.labelKey), narrative: outcome.narrative, skillBonus })}
              style={{
                background: outcome.color, border: "none", borderRadius: 10, padding: "13px 36px",
                color: "#000", fontFamily: theme.heading, fontSize: 15, fontWeight: 700,
                cursor: "pointer", letterSpacing: 1, transition: "all 0.2s",
              }}
            >
              {t("continueAfterRoll")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SETUP COMPONENTS ───────────────────────────────────────────
function SetupCard({ theme, active, children, title, subtitle, isRTL }) {
  return (
    <div style={{
      background: theme.bgCard, backdropFilter: "blur(20px)", border: `1px solid ${theme.border}`,
      borderRadius: 16, padding: "36px 32px", maxWidth: 560, width: "100%", margin: "0 auto",
      opacity: active ? 1 : 0, transform: active ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)", position: active ? "relative" : "absolute",
      pointerEvents: active ? "auto" : "none", boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left",
    }}>
      {title    && <h2 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 22, margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>}
      {subtitle && <p style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 14, margin: "0 0 24px" }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function OptionButton({ theme, selected, onClick, children, style = {} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: selected ? `${theme.primary}22` : hovered ? `${theme.primary}0A` : "transparent",
      border: `1.5px solid ${selected ? theme.primary : theme.border}`, borderRadius: 10, padding: "14px 18px",
      color: selected ? theme.primary : theme.text, fontFamily: theme.body, fontSize: 15, cursor: "pointer",
      transition: "all 0.25s ease", textAlign: "inherit",
      boxShadow: selected ? `0 0 20px ${theme.primary}15` : "none", ...style,
    }}>{children}</button>
  );
}

function NavButtons({ theme, onBack, onNext, canNext = true, nextLabel, backLabel, showBack = true, isRTL }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: "flex", justifyContent: showBack ? "space-between" : "flex-end", marginTop: 28, gap: 12, direction: isRTL ? "rtl" : "ltr" }}>
      {showBack && (
        <button onClick={onBack} onMouseEnter={() => setHovered("back")} onMouseLeave={() => setHovered(null)} style={{
          background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 8, padding: "10px 20px",
          color: theme.textMuted, fontFamily: theme.body, fontSize: 14, cursor: "pointer",
          opacity: hovered === "back" ? 1 : 0.7, transition: "all 0.2s",
        }}>{backLabel}</button>
      )}
      <button onClick={onNext} disabled={!canNext} onMouseEnter={() => setHovered("next")} onMouseLeave={() => setHovered(null)} style={{
        background: canNext ? (hovered === "next" ? theme.primary : `${theme.primary}DD`) : `${theme.border}55`,
        border: "none", borderRadius: 8, padding: "10px 28px",
        color: canNext ? theme.bg : theme.textMuted, fontFamily: theme.heading, fontSize: 14, fontWeight: 700,
        cursor: canNext ? "pointer" : "not-allowed", transition: "all 0.25s", letterSpacing: 1, textTransform: "uppercase",
      }}>{nextLabel}</button>
    </div>
  );
}

function inputStyle(theme) {
  return {
    width: "100%", background: `${theme.bg}88`, border: `1px solid ${theme.border}`,
    borderRadius: 8, padding: "10px 12px", color: theme.text, fontFamily: theme.body,
    fontSize: 14, outline: "none", boxSizing: "border-box",
  };
}

// ─── EXPORT / SAVE / LOAD UTILITIES ───────────────────────────
function exportStoryAsText({ storyLog, config, character, stats, turnCount, gameOver, chapterNumber }) {
  const sep   = "═".repeat(42);
  const genre = config.genre ? config.genre.charAt(0).toUpperCase() + config.genre.slice(1) : "";
  const lines = [
    sep,
    `  ${character.name}'s ${genre} Adventure`,
    sep,
    `Character  : ${character.name}${character.gender ? ` (${character.gender}` : ""}${character.age ? `, age ${character.age}` : ""}${character.gender ? ")" : ""}`,
    `Genre      : ${config.genre}  |  Language: ${config.language}`,
    `Content    : ${config.ageTier}  |  Pacing: ${config.responseLength}`,
    `Perspective: ${config.perspective === "first" ? "First person (I)" : "Second person (You)"}`,
    `Death possible: ${config.deathPossible ? "Yes" : "No"}  |  Stats tracked: ${config.trackStats ? "Yes" : "No"}`,
    character.skills?.length ? `Skills     : ${character.skills.join(", ")}` : "",
    config.storyPrompt ? `Premise    : ${config.storyPrompt}` : "",
    `Exported   : ${new Date().toLocaleString()}`,
    sep, "",
  ].filter(l => l !== null);

  let turn = 0;
  storyLog.forEach(entry => {
    if (entry.role === "chapter") {
      lines.push("", `${"─".repeat(42)}`, `  ${entry.text}`, `${"─".repeat(42)}`, "");
    } else if (entry.role === "roll") {
      lines.push(`[Fate Check: ${entry.context} — ${entry.value}/6 (${entry.outcome})${entry.skillBonus ? " ★ Skill Bonus" : ""}]`);
    } else if (entry.role === "narrator") {
      turn++;
      lines.push(`[Turn ${turn} — Narrator]`);
      lines.push(entry.text);
    } else {
      lines.push(`[Turn ${turn} — ${character.name}]`);
      lines.push(entry.text);
    }
    lines.push("");
  });

  if (gameOver) lines.push("*** ADVENTURE ENDED ***", "");

  if (config.trackStats) {
    lines.push(sep, "FINAL STATS", sep);
    lines.push(`Health    : ${stats.health}/100`);
    if (stats.inventory?.length) lines.push(`Inventory : ${stats.inventory.join(", ")}`);
    const rels = Object.entries(stats.relationships || {});
    if (rels.length) { lines.push("Relations :"); rels.forEach(([k, v]) => lines.push(`  ${k}: ${v}`)); }
    lines.push(sep);
  }
  return lines.join("\n");
}

function triggerDownload(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function buildSavePayload({ config, character, stats, storyLog, choices, turnCount, gameOver, storySummary, chapterNumber, chapterBrief, chapterProgress }) {
  return {
    version: 3, savedAt: new Date().toISOString(),
    config, character, stats, storyLog, choices, turnCount, gameOver,
    storySummary, chapterNumber, chapterBrief, chapterProgress,
  };
}

function loadAndValidateSave(json) {
  const data = JSON.parse(json);
  if (!data.config || !data.character || !Array.isArray(data.storyLog))
    throw new Error("invalid");
  // Version 2 and 3 are supported; anything else (or missing) is rejected
  if (data.version !== undefined && data.version < 2)
    throw new Error("version");
  return data;
}

// ─── MAIN APP ──────────────────────────────────────────────────
export default function AdventureGame() {
  const storedKey = typeof localStorage !== "undefined" ? localStorage.getItem("gemini_api_key") : "";
  const [phase, setPhase]           = useState(storedKey ? "home" : "keySetup");
  const [setupStep, setSetupStep]   = useState(0);
  const [config, setConfig]         = useState({ genre: "", language: "English", ageTier: "", responseLength: "", storyLength: 15, deathPossible: null, trackStats: null, perspective: "second", storyPrompt: "" });
  const [character, setCharacter]   = useState({ name: "", gender: "", age: "", appearance: "", skills: [] });
  const [storyLog, setStoryLog]     = useState([]);
  const [stats, setStats]           = useState({ health: 100, inventory: [], relationships: {} });
  const [choices, setChoices]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [customAction, setCustomAction] = useState("");
  const [turnCount, setTurnCount]   = useState(0);
  const [gameOver, setGameOver]     = useState(false);
  const [storySummary, setStorySummary] = useState({ narrative: "", world: null });
  // Chapter system
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterBrief, setChapterBrief]   = useState(null);
  const [chapterBanner, setChapterBanner] = useState(null); // string | null — shown as overlay
  // Dice system
  const [pendingRoll, setPendingRoll]         = useState(null); // { context, choiceText } | null
  const [nextRollRequired, setNextRollRequired] = useState({ required: false, context: "" });
  // Chapter progress — tracks partial goal completion within current chapter
  const [chapterProgress, setChapterProgress] = useState({ achieved: [], clues: [] });

  const [keyInput, setKeyInput]         = useState("");
  const [keyError, setKeyError]         = useState("");
  const [keyValidating, setKeyValidating] = useState(false);

  const storyEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const bannerTimerRef = useRef(null);

  const lang    = config.language;
  const isRTL   = RTL_LANGS.includes(lang);
  const isHebrew = lang === "Hebrew";
  const t = useCallback((key, replacements) => {
    let str = TR[key]?.[lang] || TR[key]?.English || key;
    if (replacements) Object.entries(replacements).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
    return str;
  }, [lang]);

  const theme        = THEMES[config.genre] || THEMES.fantasy;
  const currentStep  = SETUP_STEPS[setupStep];
  const totalChapters = CHAPTER_MAP[config.storyLength] || Math.max(1, Math.round((config.storyLength || 10) / 5));

  const getSkillsDisplay = (genre) => isHebrew ? (GENRE_SKILLS[genre]?.he || []) : (GENRE_SKILLS[genre]?.en || []);
  const getSkillEN = (genre, displaySkill) => {
    const g = GENRE_SKILLS[genre];
    if (!g || !isHebrew) return displaySkill;
    const idx = g.he.indexOf(displaySkill);
    return idx >= 0 ? g.en[idx] : displaySkill;
  };

  useEffect(() => {
    if (storyEndRef.current) storyEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [storyLog, choices]);

  // ─── SYSTEM PROMPT ────────────────────────────────────────────
  const buildSystemPrompt = useCallback(() => {
    const ageRules = {
      kids:  "Content suitable for children 8+. No violence beyond mild conflict. No romance. Simple vocabulary.",
      teen:  "Content for ages 13+. Moderate action OK. Light romantic tension fine.",
      adult: "Content for 18+. Violence, complex themes, romance, sophisticated vocabulary all acceptable.",
    };
    const lengthRules = {
      short:  "1-2 sentences per beat.",
      medium: "One paragraph (3-5 sentences) per beat.",
      long:   "2-3 rich paragraphs per beat. Be descriptive and immersive.",
    };
    const skillsEN = character.skills.map(s => getSkillEN(config.genre, s));

    const chapterSection = chapterBrief
      ? `CHAPTER ${chapterNumber}${totalChapters > 1 ? ` of ${totalChapters}` : ""}: "${chapterBrief.title}" — Goal: ${chapterBrief.goal} | Obstacle: ${chapterBrief.obstacle}\n→ Set chapterComplete:true only when this goal is conclusively achieved. Player may explore freely and hit dead ends.`
      : "";

    const storyContextSection = storySummary.narrative ? `
STORY CONTEXT (events before recent turns — stay consistent, never contradict):
${storySummary.narrative}${storySummary.world?.npcs && Object.keys(storySummary.world.npcs).length ? `
NPCs: ${Object.entries(storySummary.world.npcs).map(([k, v]) => `${k} (${v})`).join(", ")}` : ""}${storySummary.world?.locations?.length ? `
Locations: ${storySummary.world.locations.join(", ")}` : ""}${storySummary.world?.decisions?.length ? `
Key decisions: ${storySummary.world.decisions.join("; ")}` : ""}${storySummary.world?.threads?.length ? `
Active threads: ${storySummary.world.threads.join("; ")}` : ""}` : "";

    const total = config.storyLength || 20;
    const effectiveTurn = Math.min(turnCount, total);
    const pct = effectiveTurn / total;
    const isLastChapter = chapterNumber >= totalChapters;
    let phaseInstr;
    if (turnCount === 0)                         phaseInstr = "PHASE — OPENING: Establish the world, character background, and inciting situation.";
    else if (turnCount >= total && isLastChapter) phaseInstr = "PHASE — FINALE: Deliver a satisfying conclusion. Set gameOver:true once the story reaches a complete resolution.";
    else if (turnCount >= total - 1 && isLastChapter) phaseInstr = "PHASE — CLIMAX: Bring all threads to a head — resolution is close.";
    else if (pct < 0.35)                         phaseInstr = "PHASE — EARLY: Develop the world, introduce complications, build toward the central conflict.";
    else if (pct < 0.65)                         phaseInstr = "PHASE — MIDDLE: Escalate tension, raise stakes, introduce a twist.";
    else                                         phaseInstr = `PHASE — LATE: Push toward the climax. Consequences mount, ${Math.max(1, total - turnCount)} turn(s) remaining.`;

    return `You are the narrator of an interactive ${THEMES[config.genre]?.nameKey || "fantasy"} adventure game.

LANGUAGE: Respond ENTIRELY in ${config.language}. ALL story text and choices must be in ${config.language}.

PERSPECTIVE: ${config.perspective === "first"
  ? isHebrew
    ? 'כתוב בגוף ראשון. השתמש ב"אני", "שלי". דוגמה: "שללתי את חרבי וצעדתי אל החשיכה."'
    : isRTL
      ? 'اكتب بضمير المتكلم. استخدم "أنا"، "لي". مثال: "سللت سيفي وخطوت إلى الظلام."'
      : 'Write in FIRST PERSON. Use "I", "my", "me". Example: "I drew my sword and stepped into the dark."'
  : isHebrew
    ? 'כתוב בגוף שני. השתמש ב"אתה", "שלך". דוגמה: "אתה שולף את חרבך וצועד אל החשיכה."'
    : isRTL
      ? 'اكتب بضمير المخاطب. استخدم "أنت"، "لك". مثال: "تسلّ سيفك وتخطو نحو الظلام."'
      : 'Write in SECOND PERSON. Use "you", "your". Example: "You draw your sword and step into the dark."'}

CHARACTER: Name: ${character.name || "The Adventurer"}, Gender: ${character.gender || "unspecified"}, Age: ${character.age || "unknown"}, Appearance: ${(character.appearance || "unspecified").replace(/\n+/g, ", ")}, Skills: ${skillsEN.join(", ") || "none"}

CONTENT: ${ageRules[config.ageTier] || ageRules.teen}
LENGTH: ${lengthRules[config.responseLength] || lengthRules.medium}
${config.deathPossible ? "DEATH IS POSSIBLE if very poor choices are made." : "DEATH IS NOT POSSIBLE. Failures redirect the story."}
${config.trackStats
  ? `TRACK STATS: Always return a "stats" object with the updated values. Current authoritative state — health: ${stats.health}/100, inventory: [${(stats.inventory || []).join(", ") || "empty"}], relationships: {${Object.entries(stats.relationships || {}).map(([k,v]) => `${k}: ${v}`).join(", ") || "none"}}. Carry these forward and modify based on events. Reduce health on dangerous failures.`
  : ""}
SKILLS: When situations relate to character skills, acknowledge the skill and give more favorable outcomes.
${config.storyPrompt ? `PREMISE: ${config.storyPrompt}` : "Create an original compelling opening."}
${storyContextSection}
${chapterSection}

STORY ARC: ${phaseInstr}

RESPOND WITH VALID JSON ONLY (no markdown fences):
{"story":"...","choices":["...","...","..."],${config.trackStats ? '"stats":{"health":100,"inventory":[],"relationships":{}},' : ''}"gameOver":false,"gameOverReason":"","rollRequired":false,"rollContext":"","chapterComplete":false,"chapterProgress":{"achieved":[],"clues":[]}}

rollRequired: true when next action has meaningful risk (combat, stealth, locks, persuasion). False for safe/narrative choices.
rollContext: Short phrase shown to player before rolling (e.g. "pick the ancient lock").
chapterComplete: true ONLY when the single chapter goal is conclusively achieved.
chapterProgress: Update every turn — achieved: specific milestones completed toward the one chapter goal (cumulative, carry forward); clues: hints/info the player has discovered that help reach the goal (cumulative).
Provide 2-5 meaningfully different choices.`;
  }, [config, character, isHebrew, isRTL, turnCount, storySummary, chapterBrief, chapterNumber, totalChapters, stats]);

  // ─── API CALL ─────────────────────────────────────────────────
  const callAPI = useCallback(async (messages, opts = {}) => {
    try {
      return await api.chat(buildSystemPrompt(), messages, opts);
    } catch (err) {
      console.error("API error:", err);
      const errorMsg = lang === "Hebrew" ? "משהו השתבש... נסה שוב." : lang === "Arabic" ? "حدث خطأ... حاول مرة أخرى." : "Something went wrong... try again.";
      const retryMsg = lang === "Hebrew" ? "נסה שוב" : lang === "Arabic" ? "حاول مرة أخرى" : "Try again";
      return {
        story: errorMsg,
        choices: [retryMsg],
        gameOver: false, rollRequired: false, rollContext: "", chapterComplete: false,
      };
    }
  }, [buildSystemPrompt, lang]);

  // ─── BACKGROUND SUMMARIZER ─────────────────────────────────────
  const triggerSummarize = useCallback(async (fullLog, currentSummary) => {
    const SYSTEM =
      `You track story continuity for an interactive adventure game. Produce a compact JSON summary. ` +
      `RESPOND WITH VALID JSON ONLY:\n` +
      `{"narrative":"2-3 sentences covering key events and current situation","world":{"npcs":{"Name":"relationship/status"},"locations":["place — notes"],"decisions":["decision made"],"threads":["active plot thread"]}}`;

    const parts = [];
    if (currentSummary.narrative) {
      parts.push(`PREVIOUS SUMMARY: ${currentSummary.narrative}`);
      if (currentSummary.world) parts.push(`WORLD STATE: ${JSON.stringify(currentSummary.world)}`);
      parts.push("NEW EVENTS TO INCORPORATE:");
      fullLog.slice(-(SUMMARY_EVERY * 2)).forEach(e => {
        if (e.role === "narrator") parts.push(`Narrator: ${e.text}`);
        else if (e.role === "player") parts.push(`Player: ${e.text}`);
      });
    } else {
      fullLog.forEach(e => {
        if (e.role === "narrator") parts.push(`Narrator: ${e.text}`);
        else if (e.role === "player") parts.push(`Player: ${e.text}`);
      });
    }

    try {
      const result = await api.chat(SYSTEM, [{ role: "user", content: parts.join("\n\n") }], { max_tokens_override: 350 });
      if (result?.narrative) setStorySummary(result);
    } catch (e) {
      console.warn("Summarization failed (non-critical):", e);
    }
  }, []);

  // ─── CHAPTER BRIEF GENERATOR ──────────────────────────────────
  const generateChapterBrief = useCallback(async (chNum, total, summaryContext) => {
    const SYSTEM =
      `You are a story architect for an interactive ${THEMES[config.genre]?.nameKey || "fantasy"} adventure. ` +
      `Design a short chapter brief. The player explores freely and may hit dead ends. ` +
      `RESPOND WITH VALID JSON ONLY — three fields, nothing else:\n` +
      `{"title":"evocative chapter title (3-6 words)","goal":"ONE overarching objective — describe what to achieve, not specific items or steps (e.g. 'Prove your worth to the wizard scout', NOT 'Collect herb A, herb B, and herb C')","obstacle":"the main force or challenge blocking the goal (one sentence)"}`;

    const parts = [
      `Chapter ${chNum} of ${total} in a ${THEMES[config.genre]?.nameKey || "fantasy"} adventure.`,
      `Character: ${character.name}${character.skills.length ? `, skilled in ${character.skills.join(", ")}` : ""}.`,
      config.storyPrompt ? `Premise: ${config.storyPrompt}` : "",
      summaryContext ? `Story so far: ${summaryContext}` : "This is the very beginning of the adventure.",
      `Design chapter ${chNum} of ${total}. ${chNum === 1 ? "This is the opening chapter — establish the world and first conflict." : chNum === total ? "This is the final chapter — converge all threads for a satisfying conclusion." : "Build on events so far, escalate stakes."}`,
    ].filter(Boolean);

    try {
      const result = await api.chat(SYSTEM, [{ role: "user", content: parts.join("\n") }], { max_tokens_override: 300 });
      if (result?.title && result?.goal && result?.obstacle) {
        setChapterBrief(result);
        setChapterNumber(chNum);
        // Show banner
        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        setChapterBanner(`${chNum === 1 ? "" : ""}${result.title}`);
        bannerTimerRef.current = setTimeout(() => setChapterBanner(null), 5000);
      }
    } catch (e) {
      console.warn("Chapter brief generation failed (non-critical):", e);
    }
  }, [config, character]);

  // ─── KEY SETUP ────────────────────────────────────────────────
  const handleValidateKey = async () => {
    setKeyError("");
    setKeyValidating(true);
    try {
      await api.validateKey(keyInput);
      const trimmed = keyInput.trim();
      localStorage.setItem("gemini_api_key", trimmed);
      setPhase("home");
    } catch (err) {
      setKeyError(err.message);
    } finally {
      setKeyValidating(false);
    }
  };

  // ─── START ADVENTURE ──────────────────────────────────────────
  const startAdventure = async () => {
    setPhase("game");
    setLoading(true);

    // Generate chapter 1 brief after a short delay so it doesn't compete with the opening LLM call
    setTimeout(() => generateChapterBrief(1, totalChapters, ""), 5000);

    const openingLength = {
      short:  "3-4 sentences",
      medium: "6-8 sentences (roughly 2 paragraphs)",
      long:   "4-5 rich, descriptive paragraphs",
    }[config.responseLength] || "6-8 sentences";

    const firstMessage = [{ role: "user", content:
      `Begin the adventure with an opening of ${openingLength}. Cover: ` +
      `(1) a brief background on ${character.name} — who they are, personality, and what shaped them; ` +
      `(2) the world — its tone, state, and defining features; ` +
      `(3) the current situation — what is happening right now that sets the story in motion. ` +
      `End with 2-5 meaningful choices.`
    }];

    const result = await callAPI(firstMessage);
    setStoryLog([{ role: "narrator", text: result.story }]);
    setChoices(result.choices || []);
    if (result.stats && config.trackStats) setStats(result.stats);
    setNextRollRequired({ required: !!result.rollRequired, context: result.rollContext || "" });
    setTurnCount(1);
    setLoading(false);
  };

  // ─── CHOICE CLICK (checks for dice) ──────────────────────────
  const handleChoiceClick = (choiceText) => {
    if (loading || gameOver) return;
    if (nextRollRequired.required) {
      setPendingRoll({ context: nextRollRequired.context, choiceText });
    } else {
      makeChoice(choiceText, null);
    }
  };

  // ─── DICE RESULT → PROCEED ────────────────────────────────────
  const handleRollResult = (rollInfo) => {
    const choiceText = pendingRoll.choiceText;
    setPendingRoll(null);
    makeChoice(choiceText, rollInfo);
  };

  // ─── MAKE CHOICE ──────────────────────────────────────────────
  const makeChoice = async (choiceText, rollInfo = null) => {
    if (loading || gameOver) return;
    setLoading(true);

    // Append player entry and optional roll entry to log
    const rollEntry = rollInfo ? {
      role: "roll", value: rollInfo.value, outcome: rollInfo.outcome,
      context: rollInfo.context || pendingRoll?.context || "",
      skillBonus: rollInfo.skillBonus,
    } : null;

    setStoryLog(prev => [
      ...prev,
      { role: "player", text: choiceText },
      ...(rollEntry ? [rollEntry] : []),
    ]);
    setChoices([]);

    // Build LLM history — skip roll/chapter entries, and strip error/retry pairs
    const ERROR_MARKERS = ["Something went wrong", "משהו השתבש", "حدث خطأ"];
    const RETRY_TEXTS   = ["Try again", "נסה שוב", "حاول مرة أخرى"];
    const rawForHistory = storyLog.filter(e => e.role === "narrator" || e.role === "player");
    const logForHistory = rawForHistory.filter(e => {
      if (e.role === "narrator" && ERROR_MARKERS.some(m => e.text.includes(m))) return false;
      if (e.role === "player" && RETRY_TEXTS.includes(e.text)) return false;
      return true;
    });

    // If this is a retry, find the last real player action and resend that instead
    const isRetry = RETRY_TEXTS.includes(choiceText);
    const priorPlayerActions = logForHistory.filter(e => e.role === "player");
    const effectiveChoice = isRetry
      ? (priorPlayerActions.at(-1)?.text ?? null)  // null = opening-turn retry, no prior action exists
      : choiceText;

    let history;
    if (storySummary.narrative && logForHistory.length > WINDOW_SIZE) {
      let windowLog = logForHistory.slice(-WINDOW_SIZE);
      const firstPlayer = windowLog.findIndex(e => e.role === "player");
      if (firstPlayer > 0) windowLog = windowLog.slice(firstPlayer);
      history = [];
      for (const entry of windowLog) {
        if (entry.role === "narrator") history.push({ role: "assistant", content: JSON.stringify({ story: entry.text, choices: [] }) });
        else history.push({ role: "user", content: `Player chose: "${entry.text}"` });
      }
      // Ensure the first message is from user (required by most LLM APIs)
      if (history.length > 0 && history[0].role === "assistant") {
        history.unshift({ role: "user", content: "[story continues]" });
      }
    } else {
      history = [{ role: "user", content: `Begin the adventure with an opening covering ${character.name}'s background, the world, and the current situation.` }];
      for (const entry of logForHistory) {
        if (entry.role === "narrator") history.push({ role: "assistant", content: JSON.stringify({ story: entry.text, choices: [] }) });
        else history.push({ role: "user", content: `Player chose: "${entry.text}"` });
      }
    }

    // Append player choice as last user message.
    // effectiveChoice is null only when retrying the opening turn (no prior player actions) —
    // in that case the opening "Begin the adventure..." message is already the last entry in history.
    if (effectiveChoice !== null) {
      let lastMsg = `Player chose: "${effectiveChoice}"`;

      // Inject authoritative current state so LLM never has to infer from trimmed history
      const stateLines = [];
      if (config.trackStats) {
        stateLines.push(`Health: ${stats.health}/100`);
        if (stats.inventory?.length) stateLines.push(`Inventory: [${stats.inventory.join(", ")}]`);
        const rels = Object.entries(stats.relationships || {});
        if (rels.length) stateLines.push(`Relationships: {${rels.map(([k,v]) => `${k}: ${v}`).join(", ")}}`);
      }
      if (chapterBrief) {
        if (chapterProgress.achieved.length) stateLines.push(`Chapter achieved so far: ${chapterProgress.achieved.join("; ")}`);
        if (chapterProgress.clues.length)    stateLines.push(`Clues found: ${chapterProgress.clues.join("; ")}`);
      }
      if (stateLines.length) {
        lastMsg += `\n\n[CURRENT STATE — carry these values forward and return updated versions]\n${stateLines.join(" | ")}`;
      }

      if (rollInfo) {
        const dangerNote = rollInfo.value === 1
          ? " Narrate a serious consequence. If this was physically dangerous, reduce health in stats."
          : rollInfo.value <= 3
          ? " Narrate a complication or setback."
          : rollInfo.value <= 5
          ? " Narrate partial success with a catch."
          : " Narrate exceptional success, perhaps with an unexpected bonus.";
        lastMsg += `\n\n[FATE CHECK: ${rollInfo.context || "the attempt"}]\nRoll: ${rollInfo.value}/6 — ${rollInfo.outcome}${rollInfo.skillBonus ? " (skill bonus applied)" : ""}.\nOutcome: ${rollInfo.narrative || ""}${dangerNote}`;
      }
      history.push({ role: "user", content: lastMsg });
    }

    const result = await callAPI(history);

    setStoryLog(prev => [...prev, { role: "narrator", text: result.story }]);
    setChoices(result.choices || []);
    if (result.stats && config.trackStats) setStats(result.stats);
    if (result.gameOver) { setGameOver(true); setChoices([]); }

    // Health damage on critical failure if LLM didn't handle it
    if (rollInfo?.value === 1 && config.trackStats && !result.stats) {
      setStats(s => ({ ...s, health: Math.max(0, s.health - 15) }));
    }

    // Store next roll requirement
    setNextRollRequired({ required: !!result.rollRequired, context: result.rollContext || "" });

    // Update chapter progress (cumulative — merge with existing)
    if (result.chapterProgress) {
      const cp = result.chapterProgress;
      setChapterProgress(prev => ({
        achieved: [...new Set([...prev.achieved, ...(cp.achieved || [])])],
        clues:    [...new Set([...prev.clues,    ...(cp.clues    || [])])],
      }));
    }

    // Chapter completion
    if (result.chapterComplete && !result.gameOver) {
      const nextChap = chapterNumber + 1;
      if (nextChap <= totalChapters) {
        const fullLog = [...storyLog, { role: "player", text: choiceText }, { role: "narrator", text: result.story }];
        const summaryCtx = storySummary.narrative || fullLog.filter(e => e.role !== "roll").map(e => `${e.role}: ${e.text}`).join("\n").slice(0, 600);
        setChapterProgress({ achieved: [], clues: [] }); // reset for new chapter
        // Delay so it doesn't compete with the just-completed main call
        setTimeout(() => generateChapterBrief(nextChap, totalChapters, summaryCtx), 10000);
      }
    }

    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    setLoading(false);

    // Skip summarization for short adventures (Sprint/Short have ≤10 turns — not worth the extra call)
    if (newTurnCount % SUMMARY_EVERY === 0 && config.storyLength > 10) {
      const fullNewLog = [...storyLog, { role: "player", text: choiceText }, { role: "narrator", text: result.story }];
      // Delay 20s so background summary doesn't compete with the just-completed main call
      setTimeout(() => triggerSummarize(fullNewLog, storySummary), 20000);
    }
  };

  const handleCustomAction = () => {
    if (customAction.trim()) { handleChoiceClick(customAction.trim()); setCustomAction(""); }
  };

  const resetGame = () => {
    setPhase("home"); setSetupStep(0); setStoryLog([]); setChoices([]);
    setStats({ health: 100, inventory: [], relationships: {} });
    setGameOver(false); setTurnCount(0); setCustomAction("");
    setCharacter({ name: "", gender: "", age: "", appearance: "", skills: [] });
    setConfig({ genre: "", language: "English", ageTier: "", responseLength: "", storyLength: 15, deathPossible: null, trackStats: null, perspective: "second", storyPrompt: "" });
    setStorySummary({ narrative: "", world: null });
    setChapterNumber(1); setChapterBrief(null); setChapterBanner(null);
    setPendingRoll(null); setNextRollRequired({ required: false, context: "" });
    setChapterProgress({ achieved: [], clues: [] });
  };

  const handleExport = () => {
    const content = exportStoryAsText({ storyLog, config, character, stats, turnCount, gameOver, chapterNumber });
    triggerDownload(`${character.name}-adventure-${Date.now()}.txt`, content, "text/plain;charset=utf-8");
  };

  const handleSaveGame = () => {
    const payload = buildSavePayload({ config, character, stats, storyLog, choices, turnCount, gameOver, storySummary, chapterNumber, chapterBrief, chapterProgress });
    triggerDownload(`${character.name}-save-${Date.now()}.json`, JSON.stringify(payload, null, 2), "application/json");
  };

  const handleLoadGame = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const save = loadAndValidateSave(ev.target.result);
        setConfig(save.config);
        setCharacter(save.character);
        setStats(save.stats || { health: 100, inventory: [], relationships: {} });
        setStoryLog(save.storyLog);
        setChoices(save.choices || []);
        setTurnCount(save.turnCount || 0);
        setGameOver(save.gameOver || false);
        setStorySummary(save.storySummary || { narrative: "", world: null });
        setChapterNumber(save.chapterNumber || 1);
        setChapterBrief(save.chapterBrief || null);
        setChapterBanner(null);
        setPendingRoll(null);
        setNextRollRequired({ required: false, context: "" });
        setChapterProgress(save.chapterProgress || { achieved: [], clues: [] });
        setPhase("game");
      } catch (err) {
        alert(err?.message === "version" ? t("versionError") : t("loadError"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ─── SETUP STEPS ──────────────────────────────────────────────
  const renderSetupStep = () => {
    const nav = { theme, isRTL, backLabel: t("back"), nextLabel: t("continue_") };

    switch (currentStep) {
      case "language":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("language")} subtitle={t("languageSub")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LANGUAGES.map(l => (
                <OptionButton key={l.code} theme={theme} selected={config.language === l.code}
                  onClick={() => setConfig(c => ({ ...c, language: l.code }))}
                  style={{ textAlign: "center", fontSize: 16 }}>{l.label}</OptionButton>
              ))}
            </div>
            <NavButtons {...nav} onBack={() => setPhase("home")} onNext={() => setSetupStep(1)} canNext={!!config.language} />
          </SetupCard>
        );

      case "genre":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("chooseWorld")} subtitle={t("chooseWorldSub")}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {Object.entries(THEMES).map(([key, th]) => {
                const selected = config.genre === key;
                return (
                  <OptionButton key={key} theme={theme} selected={selected}
                    onClick={() => { setConfig(c => ({ ...c, genre: key })); setCharacter(c => ({ ...c, skills: [] })); }}>
                    {selected ? (
                      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 8 }}>
                        {th.icons.map((ic, i) => <span key={i} style={{ fontSize: i === 0 ? 26 : 18, opacity: i === 0 ? 1 : 0.75 }}>{ic}</span>)}
                      </div>
                    ) : (
                      <span style={{ fontSize: 28, display: "block", marginBottom: 6 }}>{th.icon}</span>
                    )}
                    <span style={{ fontFamily: th.heading, fontWeight: 700, fontSize: 16 }}>{t(th.nameKey)}</span>
                  </OptionButton>
                );
              })}
            </div>
            <NavButtons {...nav} theme={THEMES[config.genre] || theme} onBack={() => setSetupStep(0)} onNext={() => setSetupStep(2)} canNext={!!config.genre} />
          </SetupCard>
        );

      case "age":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("contentRating")} subtitle={t("contentRatingSub")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["kids","kids","kidsSub"],["teen","teen","teenSub"],["adult","adult","adultSub"]].map(([key,lbl,sub]) => (
                <OptionButton key={key} theme={theme} selected={config.ageTier === key}
                  onClick={() => setConfig(c => ({ ...c, ageTier: key }))}>
                  <strong style={{ fontFamily: theme.heading }}>{t(lbl)}</strong>
                  <span style={{ display: "block", fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{t(sub)}</span>
                </OptionButton>
              ))}
            </div>
            <NavButtons {...nav} onBack={() => setSetupStep(1)} onNext={() => setSetupStep(3)} canNext={!!config.ageTier} />
          </SetupCard>
        );

      case "length":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("storyPacing")} subtitle={t("storyPacingSub")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["short","short","shortSub"],["medium","medium","mediumSub"],["long","long","longSub"]].map(([key,lbl,sub]) => (
                <OptionButton key={key} theme={theme} selected={config.responseLength === key}
                  onClick={() => setConfig(c => ({ ...c, responseLength: key }))}>
                  <strong style={{ fontFamily: theme.heading }}>{t(lbl)}</strong>
                  <span style={{ display: "block", fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{t(sub)}</span>
                </OptionButton>
              ))}
            </div>
            <NavButtons {...nav} onBack={() => setSetupStep(2)} onNext={() => setSetupStep(4)} canNext={!!config.responseLength} />
          </SetupCard>
        );

      case "duration":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("storyDuration")} subtitle={t("storyDurationSub")}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { turns: 5,  icon: "⚡", label: "Sprint",   desc: `~5 turns — 1 chapter` },
                { turns: 10, icon: "🏃", label: "Short",    desc: `~10 turns — 2 chapters` },
                { turns: 20, icon: "📖", label: "Standard", desc: `~20 turns — 4 chapters` },
                { turns: 40, icon: "🏔️", label: "Epic",     desc: `~40 turns — 8 chapters` },
              ].map(({ turns, icon, label, desc }) => (
                <OptionButton key={turns} theme={theme} selected={config.storyLength === turns}
                  onClick={() => setConfig(c => ({ ...c, storyLength: turns }))}
                  style={{ textAlign: "center", padding: "16px 12px" }}>
                  <span style={{ fontSize: 26, display: "block", marginBottom: 6 }}>{icon}</span>
                  <strong style={{ fontFamily: theme.heading, fontSize: 15 }}>{label}</strong>
                  <span style={{ display: "block", fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{desc}</span>
                </OptionButton>
              ))}
            </div>
            <NavButtons {...nav} onBack={() => setSetupStep(3)} onNext={() => setSetupStep(5)} canNext={!!config.storyLength} />
          </SetupCard>
        );

      case "rules":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("gameRules")} subtitle={t("gameRulesSub")}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: theme.body, color: theme.text, fontSize: 14, marginBottom: 10 }}>{t("canDie")}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <OptionButton theme={theme} selected={config.deathPossible === true} onClick={() => setConfig(c => ({ ...c, deathPossible: true }))} style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontSize: 20 }}>💀</span><br />{t("yesDeath")}
                </OptionButton>
                <OptionButton theme={theme} selected={config.deathPossible === false} onClick={() => setConfig(c => ({ ...c, deathPossible: false }))} style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontSize: 20 }}>🛡️</span><br />{t("noDeath")}
                </OptionButton>
              </div>
            </div>
            <div>
              <p style={{ fontFamily: theme.body, color: theme.text, fontSize: 14, marginBottom: 10 }}>{t("trackStatsQ")}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <OptionButton theme={theme} selected={config.trackStats === true} onClick={() => setConfig(c => ({ ...c, trackStats: true }))} style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontSize: 20 }}>📊</span><br />{t("yesStats")}
                </OptionButton>
                <OptionButton theme={theme} selected={config.trackStats === false} onClick={() => setConfig(c => ({ ...c, trackStats: false }))} style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontSize: 20 }}>📖</span><br />{t("noStats")}
                </OptionButton>
              </div>
            </div>
            <NavButtons {...nav} onBack={() => setSetupStep(4)} onNext={() => setSetupStep(6)} canNext={config.deathPossible !== null && config.trackStats !== null} />
          </SetupCard>
        );

      case "perspective":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("perspective")} subtitle={t("perspectiveSub")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { value: "second", labelKey: "secondPerson", exKey: "secondPersonEx", icon: "👤" },
                { value: "first",  labelKey: "firstPerson",  exKey: "firstPersonEx",  icon: "🗣️" },
              ].map(({ value, labelKey, exKey, icon }) => (
                <OptionButton key={value} theme={theme} selected={config.perspective === value}
                  onClick={() => setConfig(c => ({ ...c, perspective: value }))}
                  style={{ textAlign: isRTL ? "right" : "left", padding: "14px 18px" }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{icon} {t(labelKey)}</div>
                  <div style={{ fontSize: 13, opacity: 0.7, fontStyle: "italic" }}>{t(exKey)}</div>
                </OptionButton>
              ))}
            </div>
            <NavButtons {...nav} onBack={() => setSetupStep(5)} onNext={() => setSetupStep(7)} canNext={!!config.perspective} />
          </SetupCard>
        );

      case "prompt":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("storySeed")} subtitle={t("storySeedSub")}>
            <textarea value={config.storyPrompt} onChange={e => setConfig(c => ({ ...c, storyPrompt: e.target.value }))}
              placeholder={t("storySeedPH")}
              style={{ ...inputStyle(theme), minHeight: 120, resize: "vertical", direction: isRTL ? "rtl" : "ltr" }} />
            <NavButtons {...nav} onBack={() => setSetupStep(6)} onNext={() => setSetupStep(8)} canNext />
          </SetupCard>
        );

      case "character": {
        const skillsDisplay = getSkillsDisplay(config.genre);
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("createChar")} subtitle={t("createCharSub")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 4 }}>{t("name")}</label>
                  <input value={character.name} onChange={e => setCharacter(c => ({ ...c, name: e.target.value }))}
                    placeholder={t("namePH")} style={{ ...inputStyle(theme), direction: isRTL ? "rtl" : "ltr" }} />
                </div>
                <div>
                  <label style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 4 }}>{t("age")}</label>
                  <input value={character.age} onChange={e => setCharacter(c => ({ ...c, age: e.target.value }))}
                    placeholder={t("agePH")} style={inputStyle(theme)} />
                </div>
              </div>
              <div>
                <label style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>{t("gender")}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["male","female","nonBinary","other"].map(g => (
                    <OptionButton key={g} theme={theme} selected={character.gender === g}
                      onClick={() => setCharacter(c => ({ ...c, gender: g }))}
                      style={{ flex: 1, textAlign: "center", padding: "8px 4px", fontSize: 13 }}>{t(g)}</OptionButton>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 4 }}>{t("appearance")}</label>
                <textarea value={character.appearance} onChange={e => setCharacter(c => ({ ...c, appearance: e.target.value }))}
                  placeholder={t("appearancePH")} style={{ ...inputStyle(theme), minHeight: 60, resize: "vertical", direction: isRTL ? "rtl" : "ltr" }} />
              </div>
              <div>
                <label style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>
                  {t("skills")} <span style={{ opacity: 0.5 }}>{t("skillsSub")}</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {skillsDisplay.map(skill => {
                    const sel = character.skills.includes(skill);
                    return (
                      <OptionButton key={skill} theme={theme} selected={sel}
                        onClick={() => setCharacter(c => ({
                          ...c, skills: sel ? c.skills.filter(s => s !== skill) : c.skills.length < 3 ? [...c.skills, skill] : c.skills,
                        }))}
                        style={{ padding: "7px 14px", fontSize: 13 }}>{skill}</OptionButton>
                    );
                  })}
                </div>
              </div>
            </div>
            <NavButtons {...nav} onBack={() => setSetupStep(7)} onNext={startAdventure}
              canNext={character.name.trim().length > 0 && character.skills.length > 0} nextLabel={t("beginAdventure")} />
          </SetupCard>
        );
      }
      default: return null;
    }
  };

  // ─── GAME VIEW ────────────────────────────────────────────────
  const renderGame = () => (
    <div style={{ display: "flex", gap: 20, maxWidth: 900, width: "100%", margin: "0 auto", minHeight: "80vh", direction: isRTL ? "rtl" : "ltr" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Story panel */}
        <div style={{
          background: theme.bgCard, backdropFilter: "blur(20px)", border: `1px solid ${theme.border}`,
          borderRadius: 16, padding: "24px 28px", flex: 1, overflowY: "auto", maxHeight: "70vh",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)", textAlign: isRTL ? "right" : "left",
        }}>
          {/* Header */}
          <div style={{ marginBottom: 20, borderBottom: `1px solid ${theme.border}`, paddingBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <h1 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 18, margin: 0 }}>
                  {theme.icon} {character.name}{t("sAdventure")}
                </h1>
                {totalChapters > 1 && chapterBrief && (
                  <div style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
                    {t("chapterLabel")} {chapterNumber} {t("of")} {totalChapters} — <span style={{ color: theme.primary, fontStyle: "italic" }}>{chapterBrief.title}</span>
                  </div>
                )}
                {chapterBrief && chapterProgress.achieved.length > 0 && (
                  <div style={{ fontFamily: theme.body, fontSize: 11, marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {chapterProgress.achieved.map((item, i) => (
                      <span key={i} style={{
                        background: `${theme.secondary || theme.primary}22`, border: `1px solid ${theme.secondary || theme.primary}44`,
                        borderRadius: 4, padding: "1px 7px", color: theme.secondary || theme.primary, fontSize: 10,
                      }}>✓ {item}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <button onClick={handleSaveGame} title={t("saveGame")} style={{
                  background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 6,
                  padding: "4px 10px", color: theme.textMuted, fontFamily: theme.heading, fontSize: 11,
                  cursor: "pointer", letterSpacing: 0.5, transition: "all 0.2s",
                }}
                  onMouseOver={e => { e.target.style.borderColor = theme.primary; e.target.style.color = theme.primary; }}
                  onMouseOut={e  => { e.target.style.borderColor = theme.border;  e.target.style.color = theme.textMuted; }}>
                  💾 {t("saveGame")}
                </button>
                <button onClick={handleExport} title={t("exportStory")} style={{
                  background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 6,
                  padding: "4px 10px", color: theme.textMuted, fontFamily: theme.heading, fontSize: 11,
                  cursor: "pointer", letterSpacing: 0.5, transition: "all 0.2s",
                }}
                  onMouseOver={e => { e.target.style.borderColor = theme.primary; e.target.style.color = theme.primary; }}
                  onMouseOut={e  => { e.target.style.borderColor = theme.border;  e.target.style.color = theme.textMuted; }}>
                  📄 {t("exportStory")}
                </button>
                <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12 }}>{t("turn")} {turnCount}</span>
              </div>
            </div>
            <GenreIconStrip theme={theme} />
          </div>

          {/* Story log */}
          {storyLog.map((entry, i) => {
            if (entry.role === "chapter") {
              return (
                <div key={i} style={{
                  textAlign: "center", margin: "24px 0 20px", padding: "12px 20px",
                  background: `${theme.primary}10`, border: `1px solid ${theme.primary}30`,
                  borderRadius: 10,
                }}>
                  <div style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
                    {t("chapterLabel")} {entry.num || ""}
                  </div>
                  <div style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 16, letterSpacing: 1 }}>
                    {entry.text}
                  </div>
                </div>
              );
            }
            if (entry.role === "roll") {
              const oc = DICE_OUTCOMES[entry.value];
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, margin: "8px 0",
                  padding: "7px 14px", background: `${oc?.color || theme.border}15`,
                  border: `1px solid ${oc?.color || theme.border}35`, borderRadius: 8,
                  animation: "fadeIn 0.3s ease",
                }}>
                  <span style={{ fontSize: 18, color: oc?.color }}>⚄</span>
                  <span style={{ fontFamily: theme.body, fontSize: 12, color: theme.textMuted }}>
                    <span style={{ color: oc?.color, fontWeight: 700 }}>{entry.outcome}</span>
                    {entry.context ? ` — ${entry.context}` : ""}
                    <span style={{ opacity: 0.6, marginLeft: 6 }}>{entry.value}/6{entry.skillBonus ? " ★" : ""}</span>
                  </span>
                </div>
              );
            }
            return (
              <div key={i} style={{
                marginBottom: 16, padding: entry.role === "player" ? "8px 14px" : 0,
                background: entry.role === "player" ? theme.bgStory : "transparent", borderRadius: 8,
                borderInlineStart: entry.role === "player" ? `3px solid ${theme.primary}` : "none",
              }}>
                {entry.role === "player" && (
                  <span style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5 }}>{character.name}</span>
                )}
                <p style={{
                  fontFamily: theme.body, color: entry.role === "player" ? theme.primary : theme.text,
                  fontSize: entry.role === "player" ? 14 : 15, lineHeight: 1.7,
                  margin: entry.role === "player" ? "4px 0 0" : 0,
                  fontStyle: entry.role === "player" ? "italic" : "normal", whiteSpace: "pre-wrap",
                }}>{entry.text}</p>
              </div>
            );
          })}

          {loading && (
            <div style={{ textAlign: "center", padding: 30 }}>
              <div style={{ fontSize: 28, animation: "pulse 1.5s ease-in-out infinite" }}>{theme.icon}</div>
              <p style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 13, marginTop: 8 }}>{t("storyUnfolds")}</p>
            </div>
          )}

          {gameOver && (
            <div style={{ textAlign: "center", padding: 30, marginTop: 16, background: `${theme.accent}15`, border: `1px solid ${theme.accent}40`, borderRadius: 12 }}>
              <p style={{ fontFamily: theme.heading, color: theme.accent, fontSize: 20, margin: "0 0 20px" }}>{t("adventureOver")}</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={resetGame} style={{
                  background: theme.primary, border: "none", borderRadius: 8, padding: "10px 24px",
                  color: theme.bg, fontFamily: theme.heading, fontSize: 14, cursor: "pointer", fontWeight: 700,
                }}>{t("newAdventure")}</button>
                <button onClick={handleExport} style={{
                  background: "transparent", border: `1px solid ${theme.primary}`, borderRadius: 8, padding: "10px 24px",
                  color: theme.primary, fontFamily: theme.heading, fontSize: 14, cursor: "pointer", fontWeight: 700,
                }}>📄 {t("exportStory")}</button>
              </div>
            </div>
          )}
          <div ref={storyEndRef} />
        </div>

        {/* Choices panel */}
        {!loading && !gameOver && choices.length > 0 && (
          <div style={{
            background: theme.bgCard, backdropFilter: "blur(20px)", border: `1px solid ${theme.border}`,
            borderRadius: 16, padding: "18px 24px", marginTop: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            textAlign: isRTL ? "right" : "left",
          }}>
            {/* Fate check indicator */}
            {nextRollRequired.required && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                padding: "7px 12px", background: `${theme.primary}12`,
                border: `1px solid ${theme.primary}30`, borderRadius: 8,
              }}>
                <span style={{ fontSize: 16 }}>⚄</span>
                <span style={{ fontFamily: theme.body, color: theme.primary, fontSize: 12, opacity: 0.9 }}>
                  {t("rollRequired")}
                  {nextRollRequired.context ? ` — "${nextRollRequired.context}"` : ""}
                </span>
              </div>
            )}

            <p style={{ fontFamily: theme.heading, color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 10px" }}>{t("whatDoYouDo")}</p>
            {/* Primary action — text input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={customAction} onChange={e => setCustomAction(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCustomAction()}
                placeholder={t("typeAction")}
                autoFocus
                style={{ ...inputStyle(theme), flex: 1, margin: 0, fontSize: 14, direction: isRTL ? "rtl" : "ltr" }} />
              <button onClick={handleCustomAction} style={{
                background: customAction.trim() ? theme.primary : theme.border,
                border: "none", borderRadius: 8, padding: "10px 18px", color: theme.bg,
                fontFamily: theme.heading, fontSize: 13, cursor: customAction.trim() ? "pointer" : "default",
                fontWeight: 700, transition: "all 0.2s",
              }}>{t("go")}</button>
            </div>
            {/* Suggestions */}
            {choices.length > 0 && (
              <>
                <p style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 11, margin: "0 0 8px", opacity: 0.7 }}>{t("orChoose")}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {choices.map((choice, i) => (
                    <OptionButton key={i} theme={theme} onClick={() => handleChoiceClick(choice)}>
                      <span style={{ color: theme.primary, fontWeight: 600, marginInlineEnd: 8, opacity: 0.7 }}>{i + 1}.</span>{choice}
                    </OptionButton>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Chapter progress sidebar — shown when stats are off but chapters are active */}
      {!config.trackStats && chapterBrief && (chapterProgress.achieved.length > 0 || chapterProgress.clues.length > 0) && (
        <div style={{
          width: 190, flexShrink: 0, background: theme.bgCard, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.border}`, borderRadius: 16, padding: "18px 14px", alignSelf: "flex-start",
          position: "sticky", top: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", textAlign: isRTL ? "right" : "left",
        }}>
          <h3 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 12px" }}>
            {t("chapterLabel")} Progress
          </h3>
          {chapterProgress.achieved.map((a, i) => (
            <div key={i} style={{ fontFamily: theme.body, fontSize: 11, marginBottom: 5, color: theme.secondary || theme.primary }}>✓ {a}</div>
          ))}
          {chapterProgress.clues.map((c, i) => (
            <div key={i} style={{ fontFamily: theme.body, fontSize: 10, marginBottom: 4, color: theme.primary, opacity: 0.75, fontStyle: "italic" }}>💡 {c}</div>
          ))}
        </div>
      )}

      {/* Stats sidebar */}
      {config.trackStats && (
        <div style={{
          width: 200, flexShrink: 0, background: theme.bgCard, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.border}`, borderRadius: 16, padding: "20px 16px", alignSelf: "flex-start",
          position: "sticky", top: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", textAlign: isRTL ? "right" : "left",
        }}>
          <h3 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 16px" }}>{t("stats")}</h3>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 11, textTransform: "uppercase" }}>{t("health")}</span>
            <div style={{ background: `${theme.border}55`, borderRadius: 6, height: 8, marginTop: 4, overflow: "hidden" }}>
              <div style={{ width: `${stats.health}%`, height: "100%", borderRadius: 6, transition: "width 0.5s ease", background: stats.health > 60 ? theme.secondary : stats.health > 30 ? theme.primary : theme.accent }} />
            </div>
            <span style={{ fontFamily: theme.body, color: theme.text, fontSize: 12 }}>{stats.health}/100</span>
          </div>
          {stats.inventory?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 11, textTransform: "uppercase" }}>{t("inventory")}</span>
              {stats.inventory.map((item, i) => (
                <div key={i} style={{ fontFamily: theme.body, color: theme.text, fontSize: 12, padding: "4px 0", borderBottom: `1px solid ${theme.border}33` }}>• {item}</div>
              ))}
            </div>
          )}
          {stats.relationships && Object.keys(stats.relationships).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 11, textTransform: "uppercase" }}>{t("relationships")}</span>
              {Object.entries(stats.relationships).map(([rName, desc]) => (
                <div key={rName} style={{ fontFamily: theme.body, fontSize: 11, marginTop: 6 }}>
                  <span style={{ color: theme.primary }}>{rName}</span>
                  <span style={{ color: theme.textMuted, display: "block" }}>{String(desc)}</span>
                </div>
              ))}
            </div>
          )}
          {chapterBrief && (chapterProgress.achieved.length > 0 || chapterProgress.clues.length > 0) && (
            <div>
              <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                {t("chapterLabel")} {t("stats") === "Stats" ? "Progress" : "התקדמות"}
              </span>
              {chapterProgress.achieved.map((a, i) => (
                <div key={i} style={{ fontFamily: theme.body, fontSize: 11, marginTop: 5, color: theme.secondary || theme.primary }}>✓ {a}</div>
              ))}
              {chapterProgress.clues.map((c, i) => (
                <div key={i} style={{ fontFamily: theme.body, fontSize: 10, marginTop: 4, color: theme.primary, opacity: 0.75, fontStyle: "italic" }}>💡 {c}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const progress = ((setupStep + 1) / SETUP_STEPS.length) * 100;

  return (
    <>
      <link href={FONTS_URL} rel="stylesheet" />
      <style>{`
        @keyframes float0 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(5deg); } }
        @keyframes float1 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(-3deg); } }
        @keyframes float2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-40px) rotate(8deg); } }
        @keyframes pulse  { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.1); } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes diceRoll { 0%,100% { transform:rotate(0deg) scale(1); } 25% { transform:rotate(-15deg) scale(1.05); } 75% { transform:rotate(15deg) scale(0.95); } }
        @keyframes chapterFade { 0% { opacity:0; transform:translateY(-20px) scale(0.95); } 15%,85% { opacity:1; transform:translateY(0) scale(1); } 100% { opacity:0; transform:translateY(-10px) scale(0.98); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 3px; }
        ::placeholder { color: ${theme.textMuted}; opacity: 0.6; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: theme.bg, backgroundImage: theme.bgImage,
        padding: "40px 20px", fontFamily: theme.body, color: theme.text, transition: "background 0.6s ease",
        direction: isRTL ? "rtl" : "ltr",
      }}>
        <FloatingParticles theme={theme} />

        {/* Chapter banner overlay */}
        {chapterBanner && (
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: theme.bgCard, border: `1px solid ${theme.primary}`,
            borderRadius: 16, padding: "28px 52px", textAlign: "center", zIndex: 500,
            boxShadow: `0 0 60px ${theme.primary}30, 0 20px 60px rgba(0,0,0,0.6)`,
            animation: "chapterFade 5s ease-in-out forwards", pointerEvents: "none",
          }}>
            <div style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>
              {t("chapterLabel")} {chapterNumber} {t("of")} {totalChapters}
            </div>
            <div style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 26, letterSpacing: 1, textShadow: `0 0 30px ${theme.primary}60` }}>
              {chapterBanner}
            </div>
          </div>
        )}

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ── Key setup screen ── */}
          {phase === "keySetup" && (
            <div style={{ maxWidth: 500, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h1 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 28, margin: "0 0 8px", letterSpacing: 2, textShadow: `0 0 40px ${theme.primary}30` }}>
                  🗝️ {t("keySetupTitle")}
                </h1>
              </div>
              <div style={{
                background: theme.bgCard, backdropFilter: "blur(20px)", border: `1px solid ${theme.border}`,
                borderRadius: 16, padding: "32px 36px", boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              }}>
                <p style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 13, lineHeight: 1.6, marginTop: 0 }}>
                  {t("keySetupSub")}
                </p>

                {/* How-to steps */}
                <div style={{ background: `${theme.border}30`, borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
                  <p style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 10px" }}>
                    {t("keyHowTo")}
                  </p>
                  {[t("keyStep1"), t("keyStep2"), t("keyStep3"), t("keyStep4")].map((step, i) => (
                    <div key={i} style={{ fontFamily: theme.body, color: theme.text, fontSize: 12, marginBottom: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: theme.primary, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <span>{step}{i === 0 ? (
                        <> — <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>aistudio.google.com</a></>
                      ) : null}</span>
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  value={keyInput}
                  onChange={e => { setKeyInput(e.target.value); setKeyError(""); }}
                  onKeyDown={e => e.key === "Enter" && !keyValidating && handleValidateKey()}
                  placeholder={t("keyPlaceholder")}
                  style={{ ...inputStyle(theme), width: "100%", marginBottom: 10 }}
                  autoFocus
                />
                {keyError && (
                  <div style={{ fontFamily: theme.body, color: theme.accent, fontSize: 13, marginBottom: 10 }}>
                    ⚠ {t("keyError")}: {keyError}
                  </div>
                )}
                <button
                  onClick={handleValidateKey}
                  disabled={keyValidating || !keyInput.trim()}
                  style={{
                    width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
                    background: keyInput.trim() && !keyValidating ? theme.primary : `${theme.border}55`,
                    color: keyInput.trim() && !keyValidating ? theme.bg : theme.textMuted,
                    fontFamily: theme.heading, fontSize: 15, fontWeight: 700, cursor: keyInput.trim() && !keyValidating ? "pointer" : "not-allowed",
                    letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s",
                  }}
                >
                  {keyValidating ? t("keyValidating") : t("keyValidate")}
                </button>
              </div>
            </div>
          )}

          {/* ── Home screen ── */}
          {phase === "home" && (
            <div style={{ maxWidth: 500, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <h1 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 36, margin: "0 0 8px", letterSpacing: 2, textShadow: `0 0 40px ${theme.primary}30` }}>
                  ⚔️ {t("homeTitle")}
                </h1>
                <GenreIconStrip theme={THEMES.fantasy} />
              </div>
              <div style={{
                background: theme.bgCard, backdropFilter: "blur(20px)", border: `1px solid ${theme.border}`,
                borderRadius: 16, padding: "32px 36px", boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                display: "flex", flexDirection: "column", gap: 14,
              }}>
                <button
                  onClick={() => setPhase("setup")}
                  style={{
                    padding: "16px 0", borderRadius: 10, border: "none",
                    background: theme.primary, color: theme.bg,
                    fontFamily: theme.heading, fontSize: 16, fontWeight: 700,
                    cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", transition: "opacity 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  ✦ {t("startNew")}
                </button>
                <button
                  onClick={handleLoadGame}
                  style={{
                    padding: "14px 0", borderRadius: 10, border: `1px solid ${theme.border}`,
                    background: "transparent", color: theme.text,
                    fontFamily: theme.heading, fontSize: 15, fontWeight: 700,
                    cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; }}
                >
                  💾 {t("loadSaved")}
                </button>
                <div style={{ textAlign: "center", paddingTop: 8, borderTop: `1px solid ${theme.border}33` }}>
                  <button
                    onClick={() => { localStorage.removeItem("gemini_api_key"); setKeyInput(""); setPhase("keySetup"); }}
                    style={{ background: "none", border: "none", color: theme.textMuted, fontFamily: theme.body, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
                  >
                    {t("changeKey")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Setup wizard ── */}
          {phase === "setup" && (
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h1 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 32, margin: "0 0 8px", letterSpacing: 2, textShadow: `0 0 40px ${theme.primary}30` }}>
                  {theme.icon} {t("adventureAwaits")}
                </h1>
                {config.genre && <GenreIconStrip theme={theme} />}
                <p style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 14, margin: 0 }}>
                  {t("stepOf", { c: String(setupStep + 1), t: String(SETUP_STEPS.length) })}
                </p>
                <div style={{ width: "100%", height: 3, background: `${theme.border}55`, borderRadius: 2, marginTop: 16, overflow: "hidden" }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: theme.primary, borderRadius: 2, transition: "width 0.4s ease", boxShadow: `0 0 10px ${theme.primary}60` }} />
                </div>
              </div>
              {renderSetupStep()}
            </div>
          )}

          {phase === "game" && renderGame()}
        </div>
      </div>

      {/* Dice roller overlay — renders above everything */}
      {pendingRoll && (
        <DiceRoller
          theme={theme}
          context={pendingRoll.context}
          characterSkills={character.skills}
          onResult={handleRollResult}
          isRTL={isRTL}
          t={t}
        />
      )}

      <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileChange} />
    </>
  );
}
