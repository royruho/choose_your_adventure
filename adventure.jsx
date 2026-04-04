import { useState, useEffect, useRef, useCallback } from "react";

// ─── TRANSLATIONS (English + Hebrew) ───────────────────────────
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
  whatDoYouDo:      { English: "What do you do?", Hebrew: "מה אתה עושה?" },
  typeAction:       { English: "Or type your own action...", Hebrew: "או הקלד פעולה משלך..." },
  go:               { English: "Go", Hebrew: "קדימה" },
  stats:            { English: "Stats", Hebrew: "נתונים" },
  health:           { English: "Health", Hebrew: "בריאות" },
  inventory:        { English: "Inventory", Hebrew: "מלאי" },
  relationships:    { English: "Relationships", Hebrew: "יחסים" },
  adventureOver:    { English: "Adventure Over", Hebrew: "ההרפתקה הסתיימה" },
  newAdventure:     { English: "New Adventure", Hebrew: "הרפתקה חדשה" },
  storyUnfolds:     { English: "The story unfolds...", Hebrew: "הסיפור מתגלה..." },
  turn:             { English: "Turn", Hebrew: "תור" },
  sAdventure:       { English: "'s Adventure", Hebrew: " - הרפתקה" },
  fantasy:          { English: "Fantasy", Hebrew: "פנטזיה" },
  scifi:            { English: "Sci-Fi", Hebrew: "מדע בדיוני" },
  reality:          { English: "Reality", Hebrew: "מציאות" },
  mystery:          { English: "Mystery", Hebrew: "מסתורין" },
};

// ─── THEMES ────────────────────────────────────────────────────
const THEMES = {
  fantasy: {
    nameKey: "fantasy", bg: "#1a1408", bgCard: "rgba(62, 47, 24, 0.85)", bgStory: "rgba(244, 232, 193, 0.07)",
    primary: "#C9A44A", secondary: "#4A7C3F", accent: "#8B2500", text: "#E8D5B0", textMuted: "#9C8B6E",
    border: "#5C4A2A", heading: "'Cinzel', serif", body: "'Crimson Text', serif",
    bgImage: "radial-gradient(ellipse at 20% 80%, rgba(201,164,74,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(74,124,63,0.06) 0%, transparent 50%)",
    icon: "⚔️", particle: "✦",
  },
  scifi: {
    nameKey: "scifi", bg: "#060B14", bgCard: "rgba(10, 25, 50, 0.85)", bgStory: "rgba(0, 240, 255, 0.04)",
    primary: "#00F0FF", secondary: "#8B5CF6", accent: "#FF3366", text: "#C8E0F0", textMuted: "#5A7A90",
    border: "#1A3050", heading: "'Orbitron', sans-serif", body: "'Fira Code', monospace",
    bgImage: "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.05) 0%, transparent 50%)",
    icon: "🚀", particle: "◇",
  },
  reality: {
    nameKey: "reality", bg: "#0F1114", bgCard: "rgba(28, 32, 42, 0.85)", bgStory: "rgba(100, 180, 255, 0.04)",
    primary: "#64B5F6", secondary: "#4DB6AC", accent: "#EF5350", text: "#D0D8E8", textMuted: "#6B7A90",
    border: "#2A3040", heading: "'DM Sans', sans-serif", body: "'Merriweather', serif",
    bgImage: "radial-gradient(ellipse at 40% 90%, rgba(100,181,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 60% 10%, rgba(77,182,172,0.05) 0%, transparent 50%)",
    icon: "🌍", particle: "●",
  },
  mystery: {
    nameKey: "mystery", bg: "#0D0D1A", bgCard: "rgba(22, 22, 46, 0.85)", bgStory: "rgba(226, 177, 76, 0.04)",
    primary: "#E2B14C", secondary: "#4A3078", accent: "#C0392B", text: "#D0C8E0", textMuted: "#6A6080",
    border: "#2A2050", heading: "'Playfair Display', serif", body: "'Source Serif 4', serif",
    bgImage: "radial-gradient(ellipse at 50% 50%, rgba(74,48,120,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(226,177,76,0.04) 0%, transparent 40%)",
    icon: "🔍", particle: "◆",
  },
};

const GENRE_SKILLS = {
  fantasy: { en: ["Swordsmanship","Magic","Stealth","Diplomacy","Archery","Alchemy","Beast Taming","Healing"], he: ["סייפנות","קסם","התגנבות","דיפלומטיה","קשתות","אלכימיה","אילוף חיות","ריפוי"] },
  scifi:   { en: ["Hacking","Piloting","Marksmanship","Engineering","Telepathy","Medicine","Stealth","Diplomacy"], he: ["פריצה","טיסה","קליעה","הנדסה","טלפתיה","רפואה","התגנבות","דיפלומטיה"] },
  reality: { en: ["Streetwise","Athletics","Persuasion","First Aid","Driving","Tech Savvy","Investigation","Survival"], he: ["תושייה","אתלטיקה","שכנוע","עזרה ראשונה","נהיגה","טכנולוגיה","חקירה","הישרדות"] },
  mystery: { en: ["Deduction","Interrogation","Disguise","Lockpicking","Forensics","Persuasion","Streetwise","Research"], he: ["דדוקציה","חקירה","תחפושת","פריצת מנעולים","זיהוי פלילי","שכנוע","תושייה","מחקר"] },
};

const LANGUAGES = [
  { code: "English", label: "English" }, { code: "Spanish", label: "Español" },
  { code: "French", label: "Français" }, { code: "German", label: "Deutsch" },
  { code: "Italian", label: "Italiano" }, { code: "Portuguese", label: "Português" },
  { code: "Hebrew", label: "עברית" }, { code: "Arabic", label: "العربية" },
  { code: "Chinese", label: "中文" }, { code: "Japanese", label: "日本語" },
  { code: "Korean", label: "한국어" }, { code: "Russian", label: "Русский" },
  { code: "Hindi", label: "हिन्दी" }, { code: "Dutch", label: "Nederlands" },
  { code: "Swedish", label: "Svenska" }, { code: "Polish", label: "Polski" },
  { code: "Turkish", label: "Türkçe" },
];

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Orbitron:wght@400;700;900&family=Fira+Code:wght@400;500&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap";
const SETUP_STEPS = ["language", "genre", "age", "length", "rules", "prompt", "character"];
const RTL_LANGS = ["Hebrew", "Arabic"];

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
      {title && <h2 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 22, margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>}
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
  return { width: "100%", background: `${theme.bg}88`, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "10px 12px", color: theme.text, fontFamily: theme.body, fontSize: 14, outline: "none", boxSizing: "border-box" };
}

// ─── MAIN APP ──────────────────────────────────────────────────
export default function AdventureGame() {
  const [phase, setPhase] = useState("setup");
  const [setupStep, setSetupStep] = useState(0);
  const [config, setConfig] = useState({ genre: "", language: "English", ageTier: "", responseLength: "", deathPossible: null, trackStats: null, storyPrompt: "" });
  const [character, setCharacter] = useState({ name: "", gender: "", age: "", appearance: "", skills: [] });
  const [storyLog, setStoryLog] = useState([]);
  const [stats, setStats] = useState({ health: 100, inventory: [], relationships: {} });
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customAction, setCustomAction] = useState("");
  const [turnCount, setTurnCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const storyEndRef = useRef(null);

  const lang = config.language;
  const isRTL = RTL_LANGS.includes(lang);
  const isHebrew = lang === "Hebrew";
  const t = useCallback((key, replacements) => {
    let str = TR[key]?.[lang] || TR[key]?.English || key;
    if (replacements) Object.entries(replacements).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
    return str;
  }, [lang]);

  const theme = THEMES[config.genre] || THEMES.fantasy;
  const currentStep = SETUP_STEPS[setupStep];

  const getSkillsDisplay = (genre) => isHebrew ? (GENRE_SKILLS[genre]?.he || []) : (GENRE_SKILLS[genre]?.en || []);
  const getSkillEN = (genre, displaySkill) => {
    const g = GENRE_SKILLS[genre];
    if (!g) return displaySkill;
    if (!isHebrew) return displaySkill;
    const idx = g.he.indexOf(displaySkill);
    return idx >= 0 ? g.en[idx] : displaySkill;
  };

  useEffect(() => {
    if (storyEndRef.current) storyEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [storyLog, choices]);

  const buildSystemPrompt = useCallback(() => {
    const ageRules = { kids: "Content suitable for children 8+. No violence beyond mild conflict. No romance. Simple vocabulary.", teen: "Content for ages 13+. Moderate action OK. Light romantic tension fine.", adult: "Content for 18+. Violence, complex themes, romance, sophisticated vocabulary all acceptable." };
    const lengthRules = { short: "1-2 sentences per beat.", medium: "One paragraph (3-5 sentences) per beat.", long: "2-3 rich paragraphs per beat. Be descriptive and immersive." };
    const skillsEN = character.skills.map(s => getSkillEN(config.genre, s));

    return `You are the narrator of an interactive ${THEMES[config.genre]?.nameKey || "fantasy"} adventure game.

LANGUAGE: Respond ENTIRELY in ${config.language}. ALL story text and choices must be in ${config.language}.

CHARACTER: Name: ${character.name || "The Adventurer"}, Gender: ${character.gender || "unspecified"}, Age: ${character.age || "unknown"}, Appearance: ${character.appearance || "unspecified"}, Skills: ${skillsEN.join(", ") || "none"}

CONTENT: ${ageRules[config.ageTier] || ageRules.teen}
LENGTH: ${lengthRules[config.responseLength] || lengthRules.medium}
${config.deathPossible ? "DEATH IS POSSIBLE if very poor choices are made." : "DEATH IS NOT POSSIBLE. Failures redirect the story."}
${config.trackStats ? 'TRACK STATS: Include "stats" object with health (0-100), inventory array, relationships object.' : ""}
SKILLS: When situations relate to character skills, mention the skill and give favorable outcomes.
${config.storyPrompt ? `PREMISE: ${config.storyPrompt}` : "Create an original compelling opening."}

RESPOND WITH VALID JSON ONLY (no markdown fences):
{"story":"...","choices":["...","...","..."],${config.trackStats ? '"stats":{"health":100,"inventory":[],"relationships":{}},' : ''}"gameOver":false,"gameOverReason":""}
Provide 2-5 meaningfully different choices.`;
  }, [config, character, isHebrew]);

  const callAPI = useCallback(async (messages) => {
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildSystemPrompt(), messages }),
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (err) {
      console.error("API error:", err);
      return { story: isHebrew ? "משהו השתבש... נסה שוב." : "Something went wrong... try again.", choices: [isHebrew ? "נסה שוב" : "Try again"], gameOver: false };
    }
  }, [buildSystemPrompt, isHebrew]);

  const startAdventure = async () => {
    setPhase("game"); setLoading(true);
    const result = await callAPI([{ role: "user", content: "Begin the adventure. Set the scene and present the first choices." }]);
    setStoryLog([{ role: "narrator", text: result.story }]);
    setChoices(result.choices || []);
    if (result.stats && config.trackStats) setStats(result.stats);
    setTurnCount(1); setLoading(false);
  };

  const makeChoice = async (choiceText) => {
    if (loading || gameOver) return;
    setLoading(true);
    setStoryLog(prev => [...prev, { role: "player", text: choiceText }]);
    setChoices([]);
    const history = [{ role: "user", content: "Begin the adventure." }];
    for (const entry of storyLog) {
      if (entry.role === "narrator") history.push({ role: "assistant", content: JSON.stringify({ story: entry.text, choices: [] }) });
      else history.push({ role: "user", content: `Player chose: "${entry.text}"` });
    }
    history.push({ role: "user", content: `Player chose: "${choiceText}"` });
    const result = await callAPI(history);
    setStoryLog(prev => [...prev, { role: "narrator", text: result.story }]);
    setChoices(result.choices || []);
    if (result.stats && config.trackStats) setStats(result.stats);
    if (result.gameOver) { setGameOver(true); setChoices([]); }
    setTurnCount(prev => prev + 1); setLoading(false);
  };

  const handleCustomAction = () => { if (customAction.trim()) { makeChoice(customAction.trim()); setCustomAction(""); } };

  const resetGame = () => {
    setPhase("setup"); setSetupStep(0); setStoryLog([]); setChoices([]);
    setStats({ health: 100, inventory: [], relationships: {} });
    setGameOver(false); setTurnCount(0); setCustomAction("");
    setCharacter({ name: "", gender: "", age: "", appearance: "", skills: [] });
  };

  // ─── SETUP STEPS RENDER ───────────────────────────────────────
  const renderSetupStep = () => {
    const nav = { theme, isRTL, backLabel: t("back"), nextLabel: t("continue_") };

    switch (currentStep) {
      case "language":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("language")} subtitle={t("languageSub")}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {LANGUAGES.map(l => (
                <OptionButton key={l.code} theme={theme} selected={config.language === l.code}
                  onClick={() => setConfig(c => ({ ...c, language: l.code }))}
                  style={{ padding: "10px 12px", fontSize: 14, textAlign: "center" }}>{l.label}</OptionButton>
              ))}
            </div>
            <NavButtons {...nav} onNext={() => setSetupStep(1)} canNext={!!config.language} showBack={false} />
          </SetupCard>
        );
      case "genre":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("chooseWorld")} subtitle={t("chooseWorldSub")}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {Object.entries(THEMES).map(([key, th]) => (
                <OptionButton key={key} theme={theme} selected={config.genre === key}
                  onClick={() => { setConfig(c => ({ ...c, genre: key })); setCharacter(c => ({ ...c, skills: [] })); }}>
                  <span style={{ fontSize: 28, display: "block", marginBottom: 6 }}>{th.icon}</span>
                  <span style={{ fontFamily: th.heading, fontWeight: 700, fontSize: 16 }}>{t(th.nameKey)}</span>
                </OptionButton>
              ))}
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
            <NavButtons {...nav} onBack={() => setSetupStep(3)} onNext={() => setSetupStep(5)} canNext={config.deathPossible !== null && config.trackStats !== null} />
          </SetupCard>
        );
      case "prompt":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("storySeed")} subtitle={t("storySeedSub")}>
            <textarea value={config.storyPrompt} onChange={e => setConfig(c => ({ ...c, storyPrompt: e.target.value }))}
              placeholder={t("storySeedPH")}
              style={{ ...inputStyle(theme), minHeight: 120, resize: "vertical", direction: isRTL ? "rtl" : "ltr" }} />
            <NavButtons {...nav} onBack={() => setSetupStep(4)} onNext={() => setSetupStep(6)} canNext />
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
                        onClick={() => setCharacter(c => ({ ...c, skills: sel ? c.skills.filter(s => s !== skill) : c.skills.length < 3 ? [...c.skills, skill] : c.skills }))}
                        style={{ padding: "7px 14px", fontSize: 13 }}>{skill}</OptionButton>
                    );
                  })}
                </div>
              </div>
            </div>
            <NavButtons {...nav} onBack={() => setSetupStep(5)} onNext={startAdventure}
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
        <div style={{
          background: theme.bgCard, backdropFilter: "blur(20px)", border: `1px solid ${theme.border}`,
          borderRadius: 16, padding: "24px 28px", flex: 1, overflowY: "auto", maxHeight: "70vh",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)", textAlign: isRTL ? "right" : "left",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: `1px solid ${theme.border}`, paddingBottom: 12 }}>
            <h1 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 18, margin: 0 }}>
              {theme.icon} {character.name}{t("sAdventure")}
            </h1>
            <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12 }}>{t("turn")} {turnCount}</span>
          </div>

          {storyLog.map((entry, i) => (
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
          ))}

          {loading && (
            <div style={{ textAlign: "center", padding: 30 }}>
              <div style={{ fontSize: 28, animation: "pulse 1.5s ease-in-out infinite" }}>{theme.icon}</div>
              <p style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 13, marginTop: 8 }}>{t("storyUnfolds")}</p>
            </div>
          )}

          {gameOver && (
            <div style={{ textAlign: "center", padding: 30, marginTop: 16, background: `${theme.accent}15`, border: `1px solid ${theme.accent}40`, borderRadius: 12 }}>
              <p style={{ fontFamily: theme.heading, color: theme.accent, fontSize: 20, margin: "0 0 16px" }}>{t("adventureOver")}</p>
              <button onClick={resetGame} style={{
                background: theme.primary, border: "none", borderRadius: 8, padding: "10px 24px",
                color: theme.bg, fontFamily: theme.heading, fontSize: 14, cursor: "pointer", fontWeight: 700,
              }}>{t("newAdventure")}</button>
            </div>
          )}
          <div ref={storyEndRef} />
        </div>

        {!loading && !gameOver && choices.length > 0 && (
          <div style={{
            background: theme.bgCard, backdropFilter: "blur(20px)", border: `1px solid ${theme.border}`,
            borderRadius: 16, padding: "18px 24px", marginTop: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            textAlign: isRTL ? "right" : "left",
          }}>
            <p style={{ fontFamily: theme.heading, color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 12px" }}>{t("whatDoYouDo")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {choices.map((choice, i) => (
                <OptionButton key={i} theme={theme} onClick={() => makeChoice(choice)}>
                  <span style={{ color: theme.primary, fontWeight: 600, marginInlineEnd: 8 }}>{i + 1}.</span>{choice}
                </OptionButton>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input value={customAction} onChange={e => setCustomAction(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCustomAction()}
                placeholder={t("typeAction")}
                style={{ ...inputStyle(theme), flex: 1, margin: 0, direction: isRTL ? "rtl" : "ltr" }} />
              <button onClick={handleCustomAction} style={{
                background: customAction.trim() ? theme.primary : theme.border,
                border: "none", borderRadius: 8, padding: "10px 18px", color: theme.bg,
                fontFamily: theme.heading, fontSize: 13, cursor: customAction.trim() ? "pointer" : "default",
                fontWeight: 700, transition: "all 0.2s",
              }}>{t("go")}</button>
            </div>
          </div>
        )}
      </div>

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
            <div>
              <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 11, textTransform: "uppercase" }}>{t("relationships")}</span>
              {Object.entries(stats.relationships).map(([rName, desc]) => (
                <div key={rName} style={{ fontFamily: theme.body, fontSize: 11, marginTop: 6 }}>
                  <span style={{ color: theme.primary }}>{rName}</span>
                  <span style={{ color: theme.textMuted, display: "block" }}>{String(desc)}</span>
                </div>
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
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.1); } }
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
        <div style={{ position: "relative", zIndex: 1 }}>
          {phase === "setup" && (
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h1 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 32, margin: "0 0 8px", letterSpacing: 2, textShadow: `0 0 40px ${theme.primary}30` }}>
                  {theme.icon} {t("adventureAwaits")}
                </h1>
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
    </>
  );
}
