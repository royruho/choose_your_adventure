import { useState, useEffect, useRef, useCallback } from "react";
import { api, saveUserKey, clearUserKey, hasUserKey, FREE_TURN_LIMIT } from "./api.js";

// ─── TRANSLATIONS ───────────────────────────────────────────────
const TR = {
  adventureAwaits:  { English: "Adventure Awaits", Hebrew: "הרפתקה מחכה", Arabic: "تنتظرك مغامرة", Portuguese: "A Aventura Aguarda" },
  stepOf:           { English: "Step {c} of {t}", Hebrew: "שלב {c} מתוך {t}", Arabic: "الخطوة {c} من {t}", Portuguese: "Etapa {c} de {t}" },
  chooseWorld:      { English: "Choose Your World", Hebrew: "בחר את העולם שלך", Arabic: "اختر عالمك", Portuguese: "Escolha seu Mundo" },
  chooseWorldSub:   { English: "Select the genre for your adventure", Hebrew: "בחר את הז'אנר להרפתקה שלך", Arabic: "حدد النوع لمغامرتك", Portuguese: "Selecione o gênero da sua aventura" },
  language:         { English: "Language", Hebrew: "שפה", Arabic: "اللغة", Portuguese: "Idioma" },
  languageSub:      { English: "Choose the language for your adventure", Hebrew: "בחר את השפה להרפתקה שלך", Arabic: "اختر لغة مغامرتك", Portuguese: "Escolha o idioma da sua aventura" },
  contentRating:    { English: "Content Rating", Hebrew: "דירוג תוכן", Arabic: "تصنيف المحتوى", Portuguese: "Classificação de Conteúdo" },
  contentRatingSub: { English: "Set appropriate content levels", Hebrew: "הגדר רמות תוכן מתאימות", Arabic: "حدد مستويات المحتوى المناسبة", Portuguese: "Defina os níveis apropriados de conteúdo" },
  kids:             { English: "Kids (8+)", Hebrew: "ילדים (8+)", Arabic: "أطفال (8+)", Portuguese: "Crianças (8+)" },
  kidsSub:          { English: "Light-hearted, no violence or romance, simple vocabulary", Hebrew: "קליל, ללא אלימות או רומנטיקה, אוצר מילים פשוט", Arabic: "خفيف، بدون عنف أو رومانسية، مفردات بسيطة", Portuguese: "Leve, sem violência nem romance, vocabulário simples" },
  teen:             { English: "Teen (13+)", Hebrew: "נוער (13+)", Arabic: "مراهقون (13+)", Portuguese: "Adolescente (13+)" },
  teenSub:          { English: "Moderate action, light tension, engaging vocabulary", Hebrew: "אקשן מתון, מתח קל, אוצר מילים מרתק", Arabic: "حركة متوسطة، توتر خفيف، مفردات جذابة", Portuguese: "Ação moderada, tensão leve, vocabulário envolvente" },
  adult:            { English: "Adult (18+)", Hebrew: "מבוגרים (18+)", Arabic: "بالغون (18+)", Portuguese: "Adulto (18+)" },
  adultSub:         { English: "Full range of themes, vivid descriptions, mature content", Hebrew: "מגוון נושאים מלא, תיאורים חיים, תוכן בוגר", Arabic: "مجموعة كاملة من المواضيع، أوصاف حية، محتوى ناضج", Portuguese: "Temas completos, descrições vívidas, conteúdo adulto" },
  storyDuration:    { English: "Adventure Length", Hebrew: "אורך ההרפתקה", Arabic: "طول المغامرة", Portuguese: "Duração da Aventura" },
  storyDurationSub: { English: "How many turns should the adventure last?", Hebrew: "כמה תורות תימשך ההרפתקה?", Arabic: "كم عدد الدورات التي ستستغرقها المغامرة؟", Portuguese: "Quantos turnos durará a aventura?" },
  perspective:      { English: "Narrative Perspective", Hebrew: "נקודת מבט", Arabic: "منظور السرد", Portuguese: "Perspectiva Narrativa" },
  perspectiveSub:   { English: "How should the story refer to you?", Hebrew: "איך הסיפור יתייחס אליך?", Arabic: "كيف يجب أن تشير القصة إليك؟", Portuguese: "Como a história deve se referir a você?" },
  firstPerson:      { English: "First Person", Hebrew: "גוף ראשון", Arabic: "ضمير المتكلم", Portuguese: "Primeira Pessoa" },
  firstPersonEx:    { English: "\"I drew my sword and stepped into the dark\"", Hebrew: "\"שלפתי את חרבי וצעדתי אל החושך\"", Arabic: "\"سللت سيفي وخطوت إلى الظلام\"", Portuguese: "\"Desembainhei minha espada e avancei para a escuridão\"" },
  secondPerson:     { English: "Second Person", Hebrew: "גוף שני", Arabic: "ضمير المخاطب", Portuguese: "Segunda Pessoa" },
  secondPersonEx:   { English: "\"You draw your sword and step into the dark\"", Hebrew: "\"אתה שולף את חרבך וצועד אל החושך\"", Arabic: "\"تسلّ سيفك وتخطو نحو الظلام\"", Portuguese: "\"Você desembainha sua espada e avança para a escuridão\"" },
  storyPacing:      { English: "Story Pacing", Hebrew: "קצב הסיפור", Arabic: "إيقاع القصة", Portuguese: "Ritmo da História" },
  storyPacingSub:   { English: "How detailed should each story beat be?", Hebrew: "כמה מפורט יהיה כל חלק בסיפור?", Arabic: "ما مدى تفصيل كل جزء من القصة؟", Portuguese: "Quão detalhado deve ser cada trecho da história?" },
  short:            { English: "Quick & Punchy", Hebrew: "מהיר וקצר", Arabic: "سريع ومختصر", Portuguese: "Rápido e Direto" },
  shortSub:         { English: "1-2 sentences per beat — fast-paced action", Hebrew: "1-2 משפטים — קצב מהיר", Arabic: "1-2 جملة لكل جزء — حركة سريعة", Portuguese: "1-2 frases por trecho — ação acelerada" },
  medium:           { English: "Balanced", Hebrew: "מאוזן", Arabic: "متوازن", Portuguese: "Equilibrado" },
  mediumSub:        { English: "A paragraph per beat — good mix of action and description", Hebrew: "פסקה אחת — שילוב טוב של אקשן ותיאור", Arabic: "فقرة واحدة لكل جزء — مزيج جيد من الحركة والوصف", Portuguese: "Um parágrafo por trecho — boa mistura de ação e descrição" },
  long:             { English: "Rich & Immersive", Hebrew: "עשיר וסוחף", Arabic: "غني وغامر", Portuguese: "Rico e Imersivo" },
  longSub:          { English: "2-3 paragraphs per beat — deep atmospheric storytelling", Hebrew: "2-3 פסקאות — סיפור אטמוספרי עמוק", Arabic: "2-3 فقرات لكل جزء — سرد أجواء عميق", Portuguese: "2-3 parágrafos por trecho — narrativa atmosférica e profunda" },
  gameRules:        { English: "Game Rules", Hebrew: "חוקי המשחק", Arabic: "قواعد اللعبة", Portuguese: "Regras do Jogo" },
  gameRulesSub:     { English: "Configure how your adventure plays out", Hebrew: "הגדר איך ההרפתקה שלך תתנהל", Arabic: "حدد كيف ستسير مغامرتك", Portuguese: "Configure como sua aventura será jogada" },
  canDie:           { English: "Can your character die?", Hebrew: "האם הדמות שלך יכולה למות?", Arabic: "هل يمكن أن تموت شخصيتك؟", Portuguese: "Seu personagem pode morrer?" },
  yesDeath:         { English: "Yes, risk of death", Hebrew: "כן, סיכון למוות", Arabic: "نعم، خطر الموت", Portuguese: "Sim, risco de morte" },
  noDeath:          { English: "No, always continue", Hebrew: "לא, תמיד להמשיך", Arabic: "لا، الاستمرار دائماً", Portuguese: "Não, sempre continuar" },
  trackStatsQ:      { English: "Track stats (health, inventory)?", Hebrew: "לעקוב אחר נתונים (בריאות, מלאי)?", Arabic: "تتبع الإحصائيات (الصحة، المخزون)؟", Portuguese: "Acompanhar stats (vida, inventário)?" },
  yesStats:         { English: "Yes, track stats", Hebrew: "כן, לעקוב", Arabic: "نعم، التتبع", Portuguese: "Sim, acompanhar" },
  noStats:          { English: "No, pure narrative", Hebrew: "לא, סיפור בלבד", Arabic: "لا، سرد فقط", Portuguese: "Não, apenas narrativa" },
  storySeed:        { English: "Story Seed", Hebrew: "זרע הסיפור", Arabic: "بذرة القصة", Portuguese: "Semente da História" },
  storySeedSub:     { English: "Optionally describe a setting, scenario, or theme (or leave blank for a surprise)", Hebrew: "תאר סביבה, תרחיש או נושא (או השאר ריק להפתעה)", Arabic: "اختيارياً صف بيئة أو سيناريو أو موضوعاً (أو اتركه فارغاً للمفاجأة)", Portuguese: "Opcionalmente descreva um cenário, situação ou tema (ou deixe em branco para uma surpresa)" },
  storySeedPH:      { English: "e.g. 'A haunted space station orbiting a dying star...'", Hebrew: "למשל: 'תחנת חלל רדופה סביב כוכב גוסס...'", Arabic: "مثال: 'محطة فضائية مسكونة تدور حول نجم محتضر...'", Portuguese: "ex: 'Uma estação espacial assombrada orbitando uma estrela moribunda...'" },
  createChar:       { English: "Create Your Character", Hebrew: "צור את הדמות שלך", Arabic: "أنشئ شخصيتك", Portuguese: "Crie seu Personagem" },
  createCharSub:    { English: "Who are you in this story?", Hebrew: "מי אתה בסיפור הזה?", Arabic: "من أنت في هذه القصة؟", Portuguese: "Quem é você nesta história?" },
  name:             { English: "Name", Hebrew: "שם", Arabic: "الاسم", Portuguese: "Nome" },
  namePH:           { English: "Your character's name", Hebrew: "שם הדמות שלך", Arabic: "اسم شخصيتك", Portuguese: "Nome do seu personagem" },
  age:              { English: "Age", Hebrew: "גיל", Arabic: "العمر", Portuguese: "Idade" },
  agePH:            { English: "e.g. 28", Hebrew: "למשל 28", Arabic: "مثال: 28", Portuguese: "ex: 28" },
  gender:           { English: "Gender", Hebrew: "מגדר", Arabic: "الجنس", Portuguese: "Gênero" },
  male:             { English: "Male", Hebrew: "זכר", Arabic: "ذكر", Portuguese: "Masculino" },
  female:           { English: "Female", Hebrew: "נקבה", Arabic: "أنثى", Portuguese: "Feminino" },
  nonBinary:        { English: "Non-binary", Hebrew: "לא בינארי", Arabic: "غير ثنائي", Portuguese: "Não-binário" },
  other:            { English: "Other", Hebrew: "אחר", Arabic: "آخر", Portuguese: "Outro" },
  appearance:       { English: "Appearance", Hebrew: "מראה", Arabic: "المظهر", Portuguese: "Aparência" },
  appearancePH:     { English: "Describe your character's look...", Hebrew: "תאר את המראה של הדמות שלך...", Arabic: "صف مظهر شخصيتك...", Portuguese: "Descreva a aparência do seu personagem..." },
  skills:           { English: "Skills", Hebrew: "כישורים", Arabic: "المهارات", Portuguese: "Habilidades" },
  skillsSub:        { English: "(pick up to 3)", Hebrew: "(בחר עד 3)", Arabic: "(اختر حتى 3)", Portuguese: "(escolha até 3)" },
  beginAdventure:   { English: "Begin Adventure", Hebrew: "התחל הרפתקה", Arabic: "ابدأ المغامرة", Portuguese: "Começar Aventura" },
  continue_:        { English: "Continue", Hebrew: "המשך", Arabic: "متابعة", Portuguese: "Continuar" },
  back:             { English: "← Back", Hebrew: "חזרה →", Arabic: "رجوع →", Portuguese: "← Voltar" },
  whatDoYouDo:      { English: "What do you do?", Hebrew: "מה אתה עושה?", Arabic: "ماذا تفعل؟", Portuguese: "O que você faz?" },
  typeAction:       { English: "Write your action...", Hebrew: "כתוב את הפעולה שלך...", Arabic: "اكتب فعلك...", Portuguese: "Escreva sua ação..." },
  orChoose:         { English: "or pick a suggestion", Hebrew: "או בחר הצעה", Arabic: "أو اختر اقتراحاً", Portuguese: "ou escolha uma sugestão" },
  go:               { English: "Go", Hebrew: "קדימה", Arabic: "انطلق", Portuguese: "Ir" },
  stats:            { English: "Stats", Hebrew: "נתונים", Arabic: "الإحصائيات", Portuguese: "Status" },
  health:           { English: "Health", Hebrew: "בריאות", Arabic: "الصحة", Portuguese: "Vida" },
  inventory:        { English: "Inventory", Hebrew: "מלאי", Arabic: "المخزون", Portuguese: "Inventário" },
  relationships:    { English: "Relationships", Hebrew: "יחסים", Arabic: "العلاقات", Portuguese: "Relações" },
  adventureOver:    { English: "Adventure Over", Hebrew: "ההרפתקה הסתיימה", Arabic: "انتهت المغامرة", Portuguese: "Aventura Encerrada" },
  newAdventure:     { English: "New Adventure", Hebrew: "הרפתקה חדשה", Arabic: "مغامرة جديدة", Portuguese: "Nova Aventura" },
  storyUnfolds:     { English: "The story unfolds...", Hebrew: "הסיפור מתגלה...", Arabic: "القصة تتكشف...", Portuguese: "A história se desenrola..." },
  turn:             { English: "Turn", Hebrew: "תור", Arabic: "الدورة", Portuguese: "Turno" },
  sAdventure:       { English: "'s Adventure", Hebrew: " - הרפתקה", Arabic: " - مغامرة", Portuguese: " - Aventura" },
  exportStory:      { English: "Export Story", Hebrew: "ייצא סיפור", Arabic: "تصدير القصة", Portuguese: "Exportar História" },
  saveGame:         { English: "Save Game", Hebrew: "שמור משחק", Arabic: "حفظ اللعبة", Portuguese: "Salvar Jogo" },
  loadGame:         { English: "Load Game", Hebrew: "טען משחק", Arabic: "تحميل اللعبة", Portuguese: "Carregar Jogo" },
  loadGameSub:      { English: "Resume a saved adventure", Hebrew: "המשך הרפתקה שמורה", Arabic: "استأنف مغامرة محفوظة", Portuguese: "Retomar uma aventura salva" },
  loadError:        { English: "Could not load save file — file may be corrupted.", Hebrew: "לא ניתן לטעון את קובץ השמירה — הקובץ עלול להיות פגום.", Arabic: "لا يمكن تحميل ملف الحفظ — قد يكون الملف تالفاً.", Portuguese: "Não foi possível carregar o arquivo salvo — o arquivo pode estar corrompido." },
  fantasy:          { English: "Fantasy", Hebrew: "פנטזיה", Arabic: "فانتازيا", Portuguese: "Fantasia" },
  scifi:            { English: "Sci-Fi", Hebrew: "מדע בדיוני", Arabic: "خيال علمي", Portuguese: "Ficção Científica" },
  reality:          { English: "Reality", Hebrew: "מציאות", Arabic: "واقع", Portuguese: "Realidade" },
  mystery:          { English: "Mystery", Hebrew: "מסתורין", Arabic: "غموض", Portuguese: "Mistério" },
  // ── Dice & chapters ──
  chapterLabel:     { English: "Chapter", Hebrew: "פרק", Arabic: "الفصل", Portuguese: "Capítulo" },
  of:               { English: "of", Hebrew: "מתוך", Arabic: "من", Portuguese: "de" },
  fateCheck:        { English: "Fate check required:", Hebrew: "נדרשת בדיקת גורל:", Arabic: "فحص القدر مطلوب:", Portuguese: "Verificação do destino necessária:" },
  rollBtn:          { English: "Roll the Dice!", Hebrew: "הטל קוביה!", Arabic: "ارمِ النرد!", Portuguese: "Jogue os Dados!" },
  rollingAnim:      { English: "Rolling...", Hebrew: "מטיל...", Arabic: "جارٍ الرمي...", Portuguese: "Rolando..." },
  continueAfterRoll:{ English: "Continue →", Hebrew: "← המשך", Arabic: "← متابعة", Portuguese: "Continuar →" },
  critFail:         { English: "Critical Failure", Hebrew: "כישלון חרוץ", Arabic: "فشل ذريع", Portuguese: "Falha Crítica" },
  minorFail:        { English: "Setback", Hebrew: "מכשול", Arabic: "انتكاسة", Portuguese: "Contratempo" },
  partSuccess:      { English: "Partial Success", Hebrew: "הצלחה חלקית", Arabic: "نجاح جزئي", Portuguese: "Sucesso Parcial" },
  critSuccess:      { English: "Critical Success!", Hebrew: "הצלחה מוחלטת!", Arabic: "نجاح استثنائي!", Portuguese: "Sucesso Crítico!" },
  skillBonusApplied:{ English: "Skill Bonus — rolled twice, kept highest", Hebrew: "בונוס כישור — הוטל פעמיים, נשמר הגבוה", Arabic: "مكافأة مهارة — رُمي مرتين واحتُفظ بالأعلى", Portuguese: "Bônus de Habilidade — rolado duas vezes, maior mantido" },
  rollRequired:     { English: "Next action may require a fate check", Hebrew: "הפעולה הבאה עשויה לדרוש בדיקת גורל", Arabic: "قد يتطلب الفعل التالي فحص قدر", Portuguese: "A próxima ação pode exigir uma verificação do destino" },
  // ── Key modal (shown at turn 20) ──
  keyModalTitle:    { English: "Continue Your Adventure", Hebrew: "המשך את ההרפתקה שלך", Arabic: "تابع مغامرتك", Portuguese: "Continue sua Aventura" },
  keyModalSub:      { English: "You've used your 20 free turns. Add a free OpenRouter key to keep playing — takes 2 minutes.", Hebrew: "השתמשת ב-20 תורות החינמיות. הוסף מפתח OpenRouter חינמי כדי להמשיך — לוקח 2 דקות.", Arabic: "لقد استخدمت 20 دورة مجانية. أضف مفتاح OpenRouter مجاناً لمواصلة اللعب — يستغرق دقيقتين.", Portuguese: "Você usou seus 20 turnos gratuitos. Adicione uma chave OpenRouter gratuita para continuar jogando — leva 2 minutos." },
  keyPlaceholder:   { English: "Paste your OpenRouter key (starts with sk-or-...)", Hebrew: "הדבק את מפתח ה-OpenRouter (מתחיל ב-sk-or-...)", Arabic: "الصق مفتاح OpenRouter (يبدأ بـ sk-or-...)", Portuguese: "Cole sua chave OpenRouter (começa com sk-or-...)" },
  keyValidate:      { English: "Validate & Continue", Hebrew: "אמת והמשך", Arabic: "تحقق وتابع", Portuguese: "Validar e Continuar" },
  keyValidating:    { English: "Validating...", Hebrew: "מאמת...", Arabic: "جارٍ التحقق...", Portuguese: "Validando..." },
  keyHowTo:         { English: "How to get a free OpenRouter key", Hebrew: "איך מקבלים מפתח OpenRouter חינמי", Arabic: "كيف تحصل على مفتاح OpenRouter مجاناً", Portuguese: "Como obter uma chave OpenRouter gratuita" },
  keyStep1:         { English: "Go to openrouter.ai and sign up (free, no credit card)", Hebrew: "עבור אל openrouter.ai והירשם (חינם, ללא כרטיס אשראי)", Arabic: "انتقل إلى openrouter.ai وسجّل (مجاني، بدون بطاقة)", Portuguese: "Acesse openrouter.ai e cadastre-se (grátis, sem cartão)" },
  keyStep2:         { English: "Go to Keys → Create Key", Hebrew: "עבור אל Keys ← Create Key", Arabic: "انتقل إلى Keys ← Create Key", Portuguese: "Vá em Keys → Create Key" },
  keyStep3:         { English: "Copy the key (starts with sk-or-) and paste it above", Hebrew: "העתק את המפתח (מתחיל ב-sk-or-) והדבק אותו למעלה", Arabic: "انسخ المفتاح (يبدأ بـ sk-or-) والصقه أعلاه", Portuguese: "Copie a chave (começa com sk-or-) e cole acima" },
  keyStep4:         { English: "Free models available — no payment needed", Hebrew: "מודלים חינמיים זמינים — אין צורך בתשלום", Arabic: "نماذج مجانية متاحة — لا حاجة للدفع", Portuguese: "Modelos gratuitos disponíveis — sem pagamento" },
  keyError:         { English: "Could not validate key", Hebrew: "לא ניתן לאמת את המפתח", Arabic: "تعذّر التحقق من المفتاح", Portuguese: "Não foi possível validar a chave" },
  changeKey:        { English: "Change API key", Hebrew: "שנה מפתח API", Arabic: "تغيير مفتاح API", Portuguese: "Alterar chave API" },
  freeTurnsLeft:    { English: "{n} free turns remaining", Hebrew: "נשארו {n} תורות חינמיות", Arabic: "تبقّى {n} دورة مجانية", Portuguese: "{n} turnos gratuitos restantes" },
  // ── Home screen ──
  brandName:        { English: "OpenStory AI", Hebrew: "OpenStory AI", Arabic: "OpenStory AI", Portuguese: "OpenStory AI" },
  homeTitle:        { English: "Become the author of your own story", Hebrew: "הפוך למחבר הסיפור שלך", Arabic: "كن مؤلف قصتك الخاصة", Portuguese: "Torne-se o autor da sua própria história" },
  homeTagline:      { English: "Craft interactive adventures in any world — fantasy, sci-fi, mystery, or the real world. Every choice you make shapes the tale.", Hebrew: "צור הרפתקאות אינטראקטיביות בכל עולם — פנטזיה, מדע בדיוני, מסתורין או עולם אמיתי. כל בחירה שלך מעצבת את הסיפור.", Arabic: "صمّم مغامرات تفاعلية في أي عالم — الفانتازيا والخيال العلمي والغموض أو العالم الواقعي. كل اختيار تصنعه يشكّل الحكاية.", Portuguese: "Crie aventuras interativas em qualquer mundo — fantasia, ficção científica, mistério ou o mundo real. Cada escolha molda a história." },
  homeBullet1:      { English: "Pick your genre, set the rules, design your hero.", Hebrew: "בחר ז'אנר, קבע חוקים, עצב את הגיבור שלך.", Arabic: "اختر النوع، اضبط القواعد، صمّم بطلك.", Portuguese: "Escolha o gênero, defina as regras, crie seu herói." },
  homeBullet2:      { English: "AI narrates a living world that reacts to you.", Hebrew: "בינה מלאכותית מספרת עולם חי שמגיב אליך.", Arabic: "الذكاء الاصطناعي يسرد عالماً حياً يتفاعل معك.", Portuguese: "A IA narra um mundo vivo que reage às suas ações." },
  homeBullet3:      { English: "Dice rolls, chapters, and real consequences.", Hebrew: "הטלת קוביות, פרקים והשלכות אמיתיות.", Arabic: "رمي النرد، فصول، وعواقب حقيقية.", Portuguese: "Rolagens de dados, capítulos e consequências reais." },
  startNew:         { English: "Start New Adventure", Hebrew: "התחל הרפתקה חדשה", Arabic: "ابدأ مغامرة جديدة", Portuguese: "Iniciar Nova Aventura" },
  loadSaved:        { English: "Load Saved Adventure", Hebrew: "טען הרפתקה שמורה", Arabic: "تحميل مغامرة محفوظة", Portuguese: "Carregar Aventura Salva" },
  loadSavedSub:     { English: "Resume from a .json save file", Hebrew: "המשך מקובץ שמירה .json", Arabic: "استئناف من ملف حفظ .json", Portuguese: "Retomar de um arquivo .json" },
  versionError:     { English: "This save file was created with an incompatible version of the app and cannot be loaded.", Hebrew: "קובץ השמירה נוצר עם גרסה לא תואמת של האפליקציה ולא ניתן לטעון אותו.", Arabic: "تم إنشاء ملف الحفظ هذا بإصدار غير متوافق من التطبيق ولا يمكن تحميله.", Portuguese: "Este arquivo de salvamento foi criado com uma versão incompatível do app e não pode ser carregado." },
  quitGame:         { English: "Quit Game", Hebrew: "עזוב משחק", Arabic: "إنهاء اللعبة", Portuguese: "Sair do Jogo" },
  addYourKey:       { English: "Add Your Key", Hebrew: "הוסף מפתח", Arabic: "أضف مفتاحك", Portuguese: "Adicionar Chave" },
  unlimitedTurns:   { English: "Unlimited turns", Hebrew: "תורות ללא הגבלה", Arabic: "دورات غير محدودة", Portuguese: "Turnos ilimitados" },
  freeTurnsInfo:    { English: "{n} free turns included · no sign-up needed", Hebrew: "{n} תורות חינמיות כלולות · ללא הרשמה", Arabic: "يشمل {n} دورات مجانية · لا حاجة للتسجيل", Portuguese: "{n} turnos gratuitos inclusos · sem cadastro" },
  keyModalSubHome:  { English: "Add a free OpenRouter key to play without limits — sign up takes 2 minutes, no credit card.", Hebrew: "הוסף מפתח OpenRouter חינמי למשחק ללא הגבלות — ההרשמה לוקחת 2 דקות, ללא כרטיס אשראי.", Arabic: "أضف مفتاح OpenRouter المجاني للعب بدون قيود — التسجيل يستغرق دقيقتين، بدون بطاقة ائتمان.", Portuguese: "Adicione uma chave OpenRouter gratuita para jogar sem limites — cadastro em 2 minutos, sem cartão." },
  turnsLeft:        { English: "{n} free turns left", Hebrew: "נשארו {n} תורות חינמיות", Arabic: "تبقّى {n} دورات مجانية", Portuguese: "{n} turnos gratuitos restantes" },
  suggestedNames:   { English: "Suggested names", Hebrew: "שמות מוצעים", Arabic: "أسماء مقترحة", Portuguese: "Nomes sugeridos" },
  optional_:        { English: "optional", Hebrew: "אופציונלי", Arabic: "اختياري", Portuguese: "opcional" },
  // ── Help ──
  help:             { English: "Help", Hebrew: "עזרה", Arabic: "مساعدة", Portuguese: "Ajuda" },
  helpTitle:        { English: "How OpenStory AI works", Hebrew: "איך OpenStory AI עובד", Arabic: "كيف يعمل OpenStory AI", Portuguese: "Como o OpenStory AI funciona" },
  helpClose:        { English: "Close", Hebrew: "סגור", Arabic: "إغلاق", Portuguese: "Fechar" },
  helpWhatIs:       { English: "What is OpenStory AI?", Hebrew: "מה זה OpenStory AI?", Arabic: "ما هو OpenStory AI؟", Portuguese: "O que é o OpenStory AI?" },
  helpWhatIsBody:   { English: "An AI-powered interactive fiction engine. You set the world, the rules, and your character — then an AI narrator tells the story one turn at a time, reacting to every choice you make.", Hebrew: "מנוע סיפור אינטראקטיבי מבוסס בינה מלאכותית. אתה קובע את העולם, את החוקים ואת הדמות שלך — ואז מספר ה-AI מספר את הסיפור תור אחר תור, מגיב לכל בחירה שלך.", Arabic: "محرك قصص تفاعلية مدعوم بالذكاء الاصطناعي. أنت تحدد العالم والقواعد وشخصيتك — ثم يروي الراوي الذكي القصة دوراً بعد دور، ويتفاعل مع كل اختيار تصنعه.", Portuguese: "Um motor de ficção interativa com IA. Você define o mundo, as regras e o personagem — então um narrador de IA conta a história turno a turno, reagindo a cada escolha sua." },
  helpHowTo:        { English: "How to play", Hebrew: "איך לשחק", Arabic: "كيف تلعب", Portuguese: "Como jogar" },
  helpHowTo1:       { English: "Click Start New Adventure and walk through the setup — choose a language, genre, age rating, pacing, length, and rules.", Hebrew: "לחץ על 'התחל הרפתקה חדשה' ועבור על ההגדרות — בחר שפה, ז'אנר, דירוג גיל, קצב, אורך וחוקים.", Arabic: "انقر على 'ابدأ مغامرة جديدة' واتبع خطوات الإعداد — اختر اللغة والنوع والتصنيف العمري والإيقاع والطول والقواعد.", Portuguese: "Clique em Iniciar Nova Aventura e siga a configuração — escolha idioma, gênero, classificação, ritmo, duração e regras." },
  helpHowTo2:       { English: "Design your character: name, age, appearance, and up to 3 skills. Any field can be left blank — we'll fill it in.", Hebrew: "עצב את הדמות שלך: שם, גיל, מראה ועד 3 כישורים. ניתן להשאיר כל שדה ריק — אנחנו נמלא.", Arabic: "صمّم شخصيتك: الاسم والعمر والمظهر وحتى 3 مهارات. يمكن ترك أي حقل فارغاً — سنملؤه.", Portuguese: "Crie seu personagem: nome, idade, aparência e até 3 habilidades. Qualquer campo pode ficar em branco — nós preenchemos." },
  helpHowTo3:       { English: "When the story begins, type your own action or pick from the suggestions. The AI responds in kind.", Hebrew: "כשהסיפור מתחיל, הקלד פעולה משלך או בחר מההצעות. ה-AI מגיב בהתאם.", Arabic: "عندما تبدأ القصة، اكتب فعلك الخاص أو اختر من الاقتراحات. يستجيب الذكاء الاصطناعي وفقاً لذلك.", Portuguese: "Quando a história começar, digite sua própria ação ou escolha entre as sugestões. A IA responde em conformidade." },
  helpDice:         { English: "Dice & fate checks", Hebrew: "קוביות ובדיקות גורל", Arabic: "النرد وفحوص القدر", Portuguese: "Dados e verificações do destino" },
  helpDiceBody:     { English: "Risky actions trigger a dice roll. A 1 is a critical failure; a 6 is a critical success. If the action matches one of your skills, you roll twice and keep the better result.", Hebrew: "פעולות מסוכנות מפעילות הטלת קובייה. 1 הוא כישלון חרוץ; 6 הוא הצלחה מוחלטת. אם הפעולה תואמת אחד מהכישורים שלך, אתה מטיל פעמיים ושומר על התוצאה הטובה יותר.", Arabic: "الأفعال الخطرة تستدعي رمي النرد. 1 هو فشل ذريع؛ 6 هو نجاح استثنائي. إذا تطابق الفعل مع إحدى مهاراتك، ترمي مرتين وتحتفظ بالنتيجة الأفضل.", Portuguese: "Ações arriscadas acionam uma rolagem de dado. 1 é falha crítica; 6 é sucesso crítico. Se a ação corresponder a uma de suas habilidades, você rola duas vezes e mantém o melhor resultado." },
  helpChapters:     { English: "Chapters", Hebrew: "פרקים", Arabic: "الفصول", Portuguese: "Capítulos" },
  helpChaptersBody: { English: "Longer adventures split into chapters, each with one overarching goal. Explore freely — a chapter ends only when you conclusively achieve its goal.", Hebrew: "הרפתקאות ארוכות מתחלקות לפרקים, לכל אחד מטרה מרכזית אחת. חקור בחופשיות — פרק מסתיים רק כשאתה משיג את מטרתו באופן חד-משמעי.", Arabic: "المغامرات الأطول تنقسم إلى فصول، لكل فصل هدف رئيسي واحد. استكشف بحرية — ينتهي الفصل فقط عندما تحقق هدفه بشكل قاطع.", Portuguese: "Aventuras mais longas se dividem em capítulos, cada um com um objetivo central. Explore livremente — um capítulo só termina quando você alcança seu objetivo de forma conclusiva." },
  helpSaveLoad:     { English: "Save & Load", Hebrew: "שמירה וטעינה", Arabic: "الحفظ والتحميل", Portuguese: "Salvar e Carregar" },
  helpSaveLoadBody: { English: "Saves are .json files downloaded to your device. Nothing is stored on our servers. Load one from the home screen to continue exactly where you left off.", Hebrew: "השמירות הן קבצי .json שמורדים למכשיר שלך. שום דבר לא נשמר בשרתים שלנו. טען אחד מהמסך הראשי כדי להמשיך בדיוק מהמקום בו עצרת.", Arabic: "ملفات الحفظ هي ملفات .json يتم تنزيلها إلى جهازك. لا يتم تخزين أي شيء على خوادمنا. حمّل ملفاً من الشاشة الرئيسية لتستأنف من حيث توقفت تماماً.", Portuguese: "Os salvamentos são arquivos .json baixados para seu dispositivo. Nada é armazenado em nossos servidores. Carregue um da tela inicial para continuar exatamente de onde parou." },
  helpFreemium:     { English: "Free turns & your own key", Hebrew: "תורות חינמיות והמפתח שלך", Arabic: "الأدوار المجانية ومفتاحك الخاص", Portuguese: "Turnos gratuitos e sua chave" },
  helpFreemiumBody: { English: "The first 20 turns are free — no sign-up, no key. After that, add a free OpenRouter API key (takes 2 minutes, no credit card) to play without limits.", Hebrew: "20 התורות הראשונים בחינם — ללא הרשמה וללא מפתח. אחר כך, הוסף מפתח API חינמי של OpenRouter (2 דקות, ללא כרטיס אשראי) כדי לשחק ללא הגבלה.", Arabic: "الأدوار الـ20 الأولى مجانية — بدون تسجيل، بدون مفتاح. بعد ذلك، أضف مفتاح OpenRouter API مجاني (دقيقتان، بدون بطاقة ائتمان) للعب بدون قيود.", Portuguese: "Os primeiros 20 turnos são gratuitos — sem cadastro, sem chave. Depois, adicione uma chave API OpenRouter gratuita (2 minutos, sem cartão) para jogar sem limites." },
  // ── Settings ──
  settings:         { English: "Settings", Hebrew: "הגדרות", Arabic: "إعدادات", Portuguese: "Configurações" },
  settingsSub:      { English: "Customize your reading experience", Hebrew: "התאם את חוויית הקריאה שלך", Arabic: "خصّص تجربة القراءة", Portuguese: "Personalize sua experiência de leitura" },
  theme_:           { English: "Theme", Hebrew: "ערכת נושא", Arabic: "السمة", Portuguese: "Tema" },
  themeDark:        { English: "Dark", Hebrew: "כהה", Arabic: "داكن", Portuguese: "Escuro" },
  themeLight:       { English: "Light", Hebrew: "בהיר", Arabic: "فاتح", Portuguese: "Claro" },
  fontFamily_:      { English: "Font", Hebrew: "גופן", Arabic: "الخط", Portuguese: "Fonte" },
  fontSans:         { English: "Sans", Hebrew: "סאנס", Arabic: "سانس", Portuguese: "Sans" },
  fontSerif:        { English: "Serif", Hebrew: "סריף", Arabic: "سيريف", Portuguese: "Serif" },
  fontMono:         { English: "Mono", Hebrew: "מונו", Arabic: "مونو", Portuguese: "Mono" },
  fontDyslexic:     { English: "Dyslexic", Hebrew: "דיסלקסיה", Arabic: "دسلكسي", Portuguese: "Dislexia" },
  fontSize_:        { English: "Text size", Hebrew: "גודל טקסט", Arabic: "حجم النص", Portuguese: "Tamanho do texto" },
  sizeS:            { English: "S", Hebrew: "S", Arabic: "S", Portuguese: "S" },
  sizeM:            { English: "M", Hebrew: "M", Arabic: "M", Portuguese: "M" },
  sizeL:            { English: "L", Hebrew: "L", Arabic: "L", Portuguese: "L" },
  sizeXL:           { English: "XL", Hebrew: "XL", Arabic: "XL", Portuguese: "XL" },
  music_:           { English: "Music", Hebrew: "מוזיקה", Arabic: "موسيقى", Portuguese: "Música" },
  // ── Adventure length options ──
  sprint:           { English: "Sprint",   Hebrew: "ספרינט",  Arabic: "سريع" },
  sprintDesc:       { English: "~5 turns — 1 chapter",   Hebrew: "~5 תורות — פרק אחד",   Arabic: "~5 جولات — فصل واحد" },
  shortAdv:         { English: "Short",    Hebrew: "קצר",     Arabic: "قصير" },
  shortAdvDesc:     { English: "~10 turns — 2 chapters", Hebrew: "~10 תורות — 2 פרקים",  Arabic: "~10 جولات — فصلان" },
  standard:         { English: "Standard", Hebrew: "רגיל",    Arabic: "عادي" },
  standardDesc:     { English: "~20 turns — 4 chapters", Hebrew: "~20 תורות — 4 פרקים",  Arabic: "~20 جولات — 4 فصول" },
  epic:             { English: "Epic",     Hebrew: "אפי",     Arabic: "ملحمي" },
  epicDesc:         { English: "~40 turns — 8 chapters", Hebrew: "~40 תורות — 8 פרקים",  Arabic: "~40 جولات — 8 فصول" },
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
  { code: "English",    label: "English",   flag: "gb" },
  { code: "Hebrew",     label: "עברית",     flag: "il" },
  { code: "Arabic",     label: "العربية",   flag: "sa" },
  { code: "Portuguese", label: "Português", flag: "br" },
];
const flagSrc = (cc) => `https://flagcdn.com/w40/${cc}.png`;
const flagSrc2x = (cc) => `https://flagcdn.com/w80/${cc}.png`;

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Orbitron:wght@400;700;900&family=Fira+Code:wght@400;500&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Lexend:wght@400;500;700&display=swap";

// ─── BRAND THEME (home, setup, modals) ─────────────────────────
// Two palettes: dark (default) and light. Genre THEMES override in-game.
const BRAND = {
  dark: {
    bg:        "#0B0D12",
    bgSoft:    "#111420",
    bgCard:    "rgba(22, 26, 38, 0.85)",
    bgStory:   "rgba(255, 255, 255, 0.03)",
    primary:   "#E5C07B",   // warm gold — genre-neutral but editorial
    secondary: "#7FB3A6",
    accent:    "#E06C75",
    text:      "#E8E6E1",
    textMuted: "#8B94A7",
    border:    "#2A2F3D",
    bgImage:   "radial-gradient(ellipse at 20% 10%, rgba(229,192,123,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(127,179,166,0.05) 0%, transparent 50%)",
  },
  light: {
    bg:        "#F7F6F3",
    bgSoft:    "#EFEDE8",
    bgCard:    "rgba(255, 255, 255, 0.85)",
    bgStory:   "rgba(0, 0, 0, 0.03)",
    primary:   "#9A7B2E",
    secondary: "#3E7A6A",
    accent:    "#C0392B",
    text:      "#1F2937",
    textMuted: "#6B7280",
    border:    "#D8D4CC",
    bgImage:   "radial-gradient(ellipse at 20% 10%, rgba(154,123,46,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(62,122,106,0.05) 0%, transparent 50%)",
  },
};

// User-customizable font families (applied via CSS vars)
const FONT_STACKS = {
  sans:     { heading: "'Instrument Serif', 'Source Serif 4', serif", body: "'Inter', system-ui, sans-serif" },
  serif:    { heading: "'Instrument Serif', 'Source Serif 4', serif", body: "'Source Serif 4', 'Merriweather', Georgia, serif" },
  mono:     { heading: "'Fira Code', monospace",                       body: "'Fira Code', ui-monospace, monospace" },
  dyslexic: { heading: "'Lexend', system-ui, sans-serif",              body: "'Lexend', system-ui, sans-serif" },
};

const FONT_SIZES = { s: 14, m: 16, l: 18, xl: 20 };
const MOBILE_BREAKPOINT = 720;

function loadPrefs() {
  try {
    const raw = localStorage.getItem("openstory_prefs");
    if (!raw) return null;
    const p = JSON.parse(raw);
    return {
      themeMode: p.themeMode === "light" ? "light" : "dark",
      font:      ["sans","serif","mono","dyslexic"].includes(p.font) ? p.font : "sans",
      size:      ["s","m","l","xl"].includes(p.size) ? p.size : "m",
    };
  } catch { return null; }
}
function savePrefs(p) {
  try { localStorage.setItem("openstory_prefs", JSON.stringify(p)); } catch {}
}
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

// ─── CHARACTER GENERATION ──────────────────────────────────────
const CHARACTER_NAMES = {
  fantasy: {
    male:   ["Aldric", "Theron", "Kael", "Dorian", "Soren", "Varen"],
    female: ["Lyra", "Seraphine", "Elara", "Miryn", "Vesper", "Nara"],
  },
  scifi: {
    male:   ["Zephyr", "Axon", "Riven", "Coda", "Voss", "Nex"],
    female: ["Nova", "Sable", "Zara", "Kira", "Aria", "Cyra"],
  },
  reality: {
    male:   ["Marcus", "Leo", "Dante", "Finn", "Eli", "Rafael"],
    female: ["Maya", "Nora", "Cass", "Elena", "Jade", "Iris"],
  },
  mystery: {
    male:   ["Victor", "Edmund", "Felix", "Caine", "Lucian", "Dorian"],
    female: ["Vera", "Madeleine", "Petra", "Cleo", "Margot", "Isolde"],
  },
};

const DEFAULT_SEEDS = {
  fantasy: "An ancient kingdom teeters on the edge of ruin as a forgotten evil stirs in the northern mountains.",
  scifi:   "A malfunctioning space station drifts toward a black hole while its crew uncovers a sinister conspiracy.",
  reality: "A chance discovery in a city alley pulls an ordinary person into a web of dangerous secrets.",
  mystery: "A locked-room murder at a remote estate — and every guest has something to hide.",
};

const APPEARANCE_PARTS = {
  body:    ["Athletic build", "Slim and wiry", "Stocky and muscular", "Tall and lean", "Average build", "Broad-shouldered", "Petite and nimble", "Short and sturdy"],
  hairLen: ["shaved head", "close-cropped hair", "short hair", "shoulder-length hair", "long hair", "flowing hair"],
  hairCol: ["black", "dark brown", "chestnut brown", "auburn", "dirty blonde", "blonde", "red", "silver", "white"],
  feature: [
    "a scar running across one cheek", "mismatched eye colors", "a small birthmark on the neck",
    "calloused and ink-stained hands", "a faded tattoo on the forearm", "unusually sharp cheekbones",
    "a distinctive hawkish nose", "a warm gap-toothed smile", "unsettlingly pale eyes", "a slight but permanent squint",
  ],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomAppearanceStr() {
  const { body, hairLen, hairCol, feature } = APPEARANCE_PARTS;
  return `${pick(body)}, ${pick(hairCol)} ${pick(hairLen)}, ${pick(feature)}`;
}

// ─── MUSIC ─────────────────────────────────────────────────────
// HOW TO FILL IN TRACKS:
//   1. Go to https://pixabay.com/music/ and search each mood (e.g. "peaceful loop", "tense suspense")
//   2. Open a track page, right-click the play button → Inspect → Network tab → look for .mp3 request
//   3. Copy the full https://cdn.pixabay.com/audio/... URL and paste it below
const MUSIC_TRACKS = {
  peaceful:   "https://cdn.pixabay.com/download/audio/2023/05/16/audio_0636f970ca.mp3?filename=music_for_videos-sad-violin-150146.mp3",
  tense:      "https://cdn.pixabay.com/download/audio/2026/02/12/audio_7d514da87c.mp3?filename=delosound-background-music-483780.mp3",
  action:     "https://cdn.pixabay.com/download/audio/2025/10/06/audio_6718ad291f.mp3?filename=tatamusic-racing-speed-action-music-416097.mp3",
  dramatic:   "https://cdn.pixabay.com/download/audio/2025/10/06/audio_6718ad291f.mp3?filename=tatamusic-racing-speed-action-music-416097.mp3",
  sad:        "https://cdn.pixabay.com/download/audio/2023/05/16/audio_0636f970ca.mp3?filename=music_for_videos-sad-violin-150146.mp3",
  triumphant: "https://cdn.pixabay.com/download/audio/2026/02/18/audio_a52af36248.mp3?filename=sonican-victory-486914.mp3",
  mysterious: "https://cdn.pixabay.com/download/audio/2026/02/12/audio_7d514da87c.mp3?filename=delosound-background-music-483780.mp3",
  neutral:    "https://cdn.pixabay.com/download/audio/2026/02/12/audio_7d514da87c.mp3?filename=delosound-background-music-483780.mp3",
};

function crossfadeTo(url, targetVol, audioRef, currentUrlRef, fadeRef) {
  clearInterval(fadeRef.current);
  const prev = audioRef.current;

  // Fade out previous
  if (prev && !prev.paused) {
    let vol = prev.volume;
    fadeRef.current = setInterval(() => {
      vol = Math.max(0, vol - targetVol / 15);
      try { prev.volume = vol; } catch {}
      if (vol <= 0) {
        clearInterval(fadeRef.current);
        prev.pause();
      }
    }, 100);
  }

  // Start new track
  const audio = new Audio(url);
  audio.loop = true;
  audio.volume = 0;
  audioRef.current = audio;
  currentUrlRef.current = url;
  audio.play().catch(() => {}); // browser may block — silently ignore

  // Fade in
  let vol = 0;
  const timer = setInterval(() => {
    vol = Math.min(targetVol, vol + targetVol / 15);
    try { audio.volume = vol; } catch {}
    if (vol >= targetVol) clearInterval(timer);
  }, 100);
}

function useMusic(mood, volume, enabled) {
  const audioRef      = useRef(null);
  const currentUrlRef = useRef(null);
  const fadeRef       = useRef(null);

  useEffect(() => {
    if (!enabled) {
      // Fade out and pause when disabled
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        let v = audio.volume;
        const t = setInterval(() => {
          v = Math.max(0, v - 0.03);
          try { audio.volume = v; } catch {}
          if (v <= 0) { clearInterval(t); audio.pause(); }
        }, 100);
      }
      return;
    }
    const url = MUSIC_TRACKS[mood] || MUSIC_TRACKS.neutral;
    if (!url || url === currentUrlRef.current) return;
    crossfadeTo(url, volume, audioRef, currentUrlRef, fadeRef);
  }, [mood, volume, enabled]);

  // Resume correct volume when re-enabled
  useEffect(() => {
    if (enabled && audioRef.current && !audioRef.current.paused) {
      try { audioRef.current.volume = volume; } catch {}
    }
  }, [volume, enabled]);

  useEffect(() => () => {
    clearInterval(fadeRef.current);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }, []);
}

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

function SidebarActions({ theme, t, turnCount, isRTL, onSave, onExport, onQuit, onKey, musicEnabled, musicVolume, onMusicToggle, onVolumeChange }) {
  const userHasKey = hasUserKey();
  const free = FREE_TURN_LIMIT;
  const remaining = Math.max(0, free - turnCount);
  const btn = {
    display: "block", width: "100%", background: "transparent",
    border: `1px solid ${theme.border}`, borderRadius: 6, padding: "6px 10px",
    color: theme.textMuted, fontFamily: theme.heading, fontSize: 11,
    cursor: "pointer", letterSpacing: 0.5, textAlign: isRTL ? "right" : "left",
    transition: "all 0.2s", marginBottom: 5,
  };
  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${theme.border}33` }}>
      {/* Turn counter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
          {t("turn")} {turnCount}
        </span>
        <span style={{
          fontFamily: theme.body, fontSize: 11, fontWeight: 700,
          color: userHasKey ? (theme.secondary || "#4A7C3F") : remaining <= 3 ? theme.accent : theme.primary,
        }}>
          {userHasKey ? "∞" : `${remaining} / ${free}`}
        </span>
      </div>
      {/* Action buttons */}
      <button style={btn} onClick={onSave}
        onMouseOver={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.color = theme.primary; }}
        onMouseOut={e  => { e.currentTarget.style.borderColor = theme.border;  e.currentTarget.style.color = theme.textMuted; }}>
        💾 {t("saveGame")}
      </button>
      <button style={btn} onClick={onExport}
        onMouseOver={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.color = theme.primary; }}
        onMouseOut={e  => { e.currentTarget.style.borderColor = theme.border;  e.currentTarget.style.color = theme.textMuted; }}>
        📄 {t("exportStory")}
      </button>
      <button style={btn} onClick={onKey}
        onMouseOver={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.color = theme.primary; }}
        onMouseOut={e  => { e.currentTarget.style.borderColor = theme.border;  e.currentTarget.style.color = theme.textMuted; }}>
        🗝️ {userHasKey ? t("changeKey") : t("addYourKey")}
      </button>
      <button
        style={{ ...btn, marginBottom: 0, borderColor: `${theme.accent}50`, color: theme.accent }}
        onClick={onQuit}
        onMouseOver={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.opacity = "0.8"; }}
        onMouseOut={e  => { e.currentTarget.style.borderColor = `${theme.accent}50`; e.currentTarget.style.opacity = "1"; }}>
        🚪 {t("quitGame")}
      </button>
      {/* Music controls */}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}22`, display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={onMusicToggle}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1, opacity: musicEnabled ? 1 : 0.4, transition: "opacity 0.2s" }}
          title={musicEnabled ? "Mute music" : "Unmute music"}>
          {musicEnabled ? "🎵" : "🔇"}
        </button>
        <input
          type="range" min={0} max={1} step={0.05}
          value={musicVolume}
          onChange={e => onVolumeChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: theme.primary, cursor: "pointer", opacity: musicEnabled ? 0.8 : 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── HELP MODAL ────────────────────────────────────────────────
function HelpModal({ theme, t, isRTL, onClose }) {
  const sections = [
    { titleKey: "helpWhatIs",   bodyKey: "helpWhatIsBody",   icon: "✦" },
    { titleKey: "helpHowTo",    body: null,                  icon: "🎬", steps: ["helpHowTo1", "helpHowTo2", "helpHowTo3"] },
    { titleKey: "helpDice",     bodyKey: "helpDiceBody",     icon: "🎲" },
    { titleKey: "helpChapters", bodyKey: "helpChaptersBody", icon: "📖" },
    { titleKey: "helpSaveLoad", bodyKey: "helpSaveLoadBody", icon: "💾" },
    { titleKey: "helpFreemium", bodyKey: "helpFreemiumBody", icon: "🗝️" },
  ];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 950,
      padding: 16, direction: isRTL ? "rtl" : "ltr",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.bg, border: `1px solid ${theme.border}`,
        borderRadius: 16, padding: "28px 32px", maxWidth: 680, width: "100%",
        maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        textAlign: isRTL ? "right" : "left",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 28, margin: 0, letterSpacing: 0.5 }}>
            {t("helpTitle")}
          </h2>
          <button onClick={onClose} aria-label={t("helpClose")} style={{
            background: "transparent", border: "none", color: theme.textMuted,
            fontSize: 24, cursor: "pointer", padding: "4px 10px", lineHeight: 1,
          }}>✕</button>
        </div>
        <p style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 14, margin: "0 0 20px" }}>
          {t("brandName")} · {t("homeTagline")}
        </p>
        {sections.map(s => (
          <section key={s.titleKey} style={{ marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${theme.border}44` }}>
            <h3 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 18, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>{t(s.titleKey)}
            </h3>
            {s.bodyKey && (
              <p style={{ fontFamily: theme.body, color: theme.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                {t(s.bodyKey)}
              </p>
            )}
            {s.steps && (
              <ol style={{ fontFamily: theme.body, color: theme.text, fontSize: 14, lineHeight: 1.7, margin: "4px 0 0", paddingInlineStart: 22 }}>
                {s.steps.map(k => <li key={k} style={{ marginBottom: 4 }}>{t(k)}</li>)}
              </ol>
            )}
          </section>
        ))}
        <button onClick={onClose} style={{
          marginTop: 8, background: theme.primary, border: "none", borderRadius: 10,
          padding: "12px 28px", color: theme.bg, fontFamily: theme.heading, fontSize: 14, fontWeight: 700,
          cursor: "pointer", letterSpacing: 0.5,
        }}>{t("helpClose")}</button>
      </div>
    </div>
  );
}

// ─── SETTINGS MODAL ────────────────────────────────────────────
function SettingsModal({ theme, t, isRTL, prefs, setPrefs, musicEnabled, setMusicEnabled, musicVolume, setMusicVolume, onClose }) {
  const Row = ({ label, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: theme.heading, color: theme.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
  const Pill = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
      background: active ? theme.primary : "transparent",
      border: `1.5px solid ${active ? theme.primary : theme.border}`,
      color: active ? theme.bg : theme.text,
      borderRadius: 8, padding: "8px 14px", fontFamily: theme.body, fontSize: 13,
      cursor: "pointer", transition: "all 0.2s",
    }}>{children}</button>
  );
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 950,
      padding: 16, direction: isRTL ? "rtl" : "ltr",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.bg, border: `1px solid ${theme.border}`,
        borderRadius: 16, padding: "28px 30px", maxWidth: 440, width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)", textAlign: isRTL ? "right" : "left",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 24, margin: 0 }}>{t("settings")}</h2>
          <button onClick={onClose} aria-label={t("helpClose")} style={{
            background: "transparent", border: "none", color: theme.textMuted,
            fontSize: 22, cursor: "pointer", padding: "4px 10px", lineHeight: 1,
          }}>✕</button>
        </div>
        <p style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 13, margin: "0 0 22px" }}>
          {t("settingsSub")}
        </p>

        <Row label={t("theme_")}>
          <div style={{ display: "flex", gap: 8 }}>
            <Pill active={prefs.themeMode === "dark"}  onClick={() => setPrefs(p => ({ ...p, themeMode: "dark" }))}>🌙 {t("themeDark")}</Pill>
            <Pill active={prefs.themeMode === "light"} onClick={() => setPrefs(p => ({ ...p, themeMode: "light" }))}>☀️ {t("themeLight")}</Pill>
          </div>
        </Row>

        <Row label={t("fontFamily_")}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { v: "auto",     label: "Auto" },
              { v: "sans",     label: t("fontSans") },
              { v: "serif",    label: t("fontSerif") },
              { v: "mono",     label: t("fontMono") },
              { v: "dyslexic", label: t("fontDyslexic") },
            ].map(o => (
              <Pill key={o.v} active={prefs.font === o.v} onClick={() => setPrefs(p => ({ ...p, font: o.v }))}>
                {o.label}
              </Pill>
            ))}
          </div>
        </Row>

        <Row label={t("fontSize_")}>
          <div style={{ display: "flex", gap: 8 }}>
            {[["s","sizeS"],["m","sizeM"],["l","sizeL"],["xl","sizeXL"]].map(([v, k]) => (
              <Pill key={v} active={prefs.size === v} onClick={() => setPrefs(p => ({ ...p, size: v }))}>
                <span style={{ fontSize: v === "s" ? 11 : v === "m" ? 13 : v === "l" ? 15 : 17 }}>{t(k)}</span>
              </Pill>
            ))}
          </div>
        </Row>

        <Row label={t("music_")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setMusicEnabled(v => !v)} style={{
              background: "transparent", border: `1.5px solid ${theme.border}`, borderRadius: 8,
              padding: "8px 14px", cursor: "pointer", fontSize: 16, color: theme.text,
            }}>{musicEnabled ? "🎵" : "🔇"}</button>
            <input type="range" min={0} max={1} step={0.05}
              value={musicVolume}
              onChange={e => setMusicVolume(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: theme.primary, cursor: "pointer", opacity: musicEnabled ? 1 : 0.4 }}
            />
            <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, minWidth: 30, textAlign: "right" }}>
              {Math.round(musicVolume * 100)}%
            </span>
          </div>
        </Row>
      </div>
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
  const [phase, setPhase]           = useState("home");
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

  const [showKeyModal, setShowKeyModal]   = useState(false);
  const [keyModalContext, setKeyModalContext] = useState("game"); // "home" | "game"
  const [keyInput, setKeyInput]           = useState("");
  const [keyError, setKeyError]           = useState("");
  const [keyValidating, setKeyValidating] = useState(false);

  // Music state
  const [currentMood, setCurrentMood]     = useState("neutral");
  const [musicVolume, setMusicVolume]     = useState(0.4);
  const [musicEnabled, setMusicEnabled]   = useState(false);
  const hasInteracted = useRef(false);

  // User preferences (theme, font, size) — persisted to localStorage
  const [prefs, setPrefs] = useState(() => loadPrefs() || { themeMode: "dark", font: "auto", size: "m" });
  useEffect(() => { savePrefs(prefs); }, [prefs]);
  const [showHelp, setShowHelp]         = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile]         = useState(() => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useMusic(currentMood, musicVolume, musicEnabled && phase === "game");

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

  // Resolve theme: BRAND palette on home/setup-before-genre, genre theme during gameplay.
  // User prefs layer on top: light mode swaps bg/text, font pref overrides body font.
  const onBrandScreen = phase === "home" || (phase === "setup" && !config.genre);
  const brandPalette  = BRAND[prefs.themeMode === "light" ? "light" : "dark"];
  const genreTheme    = THEMES[config.genre] || THEMES.fantasy;
  const bodyFontOverride = prefs.font === "auto" ? null : FONT_STACKS[prefs.font].body;
  const theme = onBrandScreen
    ? {
        ...brandPalette,
        heading: "'Instrument Serif', 'Source Serif 4', serif",
        body:    bodyFontOverride || "'Inter', system-ui, sans-serif",
        icon:    "✦",
        particle:"✦",
        icons:   null,
      }
    : prefs.themeMode === "light"
      ? {
          ...genreTheme,
          bg:        BRAND.light.bg,
          bgCard:    BRAND.light.bgCard,
          bgStory:   BRAND.light.bgStory,
          text:      BRAND.light.text,
          textMuted: BRAND.light.textMuted,
          border:    BRAND.light.border,
          bgImage:   BRAND.light.bgImage,
          body:      bodyFontOverride || genreTheme.body,
        }
      : {
          ...genreTheme,
          body: bodyFontOverride || genreTheme.body,
        };
  const storyFontSizePx = FONT_SIZES[prefs.size] || FONT_SIZES.m;
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
  const buildSystemPrompt = useCallback((cfgOverride, charOverride) => {
    const cfg  = cfgOverride  ?? config;
    const char = charOverride ?? character;
    const eLang       = cfg.language || "English";
    const eHebrew     = eLang === "Hebrew";
    const eRTL        = RTL_LANGS.includes(eLang);
    const ePortuguese = eLang === "Portuguese";

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
    const skillsEN = char.skills.map(s => {
      const g = GENRE_SKILLS[cfg.genre];
      if (!g || !eHebrew) return s;
      const idx = g.he.indexOf(s);
      return idx >= 0 ? g.en[idx] : s;
    });

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

    const total = cfg.storyLength || 20;
    const effectiveTurn = Math.min(turnCount, total);
    const pct = effectiveTurn / total;
    const isLastChapter = chapterNumber >= totalChapters;
    let phaseInstr;
    if (turnCount === 0)                              phaseInstr = "PHASE — OPENING: Establish the world, character background, and inciting situation.";
    else if (turnCount >= total && isLastChapter)     phaseInstr = "PHASE — FINALE: Deliver a satisfying conclusion. Set gameOver:true once the story reaches a complete resolution.";
    else if (turnCount >= total - 1 && isLastChapter) phaseInstr = "PHASE — CLIMAX: Bring all threads to a head — resolution is close.";
    else if (pct < 0.35)                              phaseInstr = "PHASE — EARLY: Develop the world, introduce complications, build toward the central conflict.";
    else if (pct < 0.65)                              phaseInstr = "PHASE — MIDDLE: Escalate tension, raise stakes, introduce a twist.";
    else                                              phaseInstr = `PHASE — LATE: Push toward the climax. Consequences mount, ${Math.max(1, total - turnCount)} turn(s) remaining.`;

    return `You are the narrator of an interactive ${THEMES[cfg.genre]?.nameKey || "fantasy"} adventure game.

LANGUAGE: Respond ENTIRELY in ${eLang}. ALL story text and choices must be in ${eLang}.

PERSPECTIVE: ${cfg.perspective === "first"
  ? eHebrew
    ? 'כתוב בגוף ראשון. השתמש ב"אני", "שלי". דוגמה: "שללתי את חרבי וצעדתי אל החשיכה."'
    : eRTL
      ? 'اكتب بضمير المتكلم. استخدم "أنا"، "لي". مثال: "سللت سيفي وخطوت إلى الظلام."'
      : ePortuguese
        ? 'Escreva em PRIMEIRA PESSOA. Use "eu", "meu/minha". Exemplo: "Desembainhei minha espada e avancei para a escuridão."'
        : 'Write in FIRST PERSON. Use "I", "my", "me". Example: "I drew my sword and stepped into the dark."'
  : eHebrew
    ? 'כתוב בגוף שני. השתמש ב"אתה", "שלך". דוגמה: "אתה שולף את חרבך וצועד אל החשיכה."'
    : eRTL
      ? 'اكتب بضمير المخاطب. استخدم "أنت"، "لك". مثال: "تسلّ سيفك وتخطو نحو الظلام."'
      : ePortuguese
        ? 'Escreva em SEGUNDA PESSOA. Use "você", "seu/sua". Exemplo: "Você desembainha sua espada e avança para a escuridão."'
        : 'Write in SECOND PERSON. Use "you", "your". Example: "You draw your sword and step into the dark."'}

CHARACTER: Name: ${char.name || "The Adventurer"}, Gender: ${char.gender || "unspecified"}, Age: ${char.age || "unknown"}, Appearance: ${(char.appearance || "unspecified").replace(/\n+/g, ", ")}, Skills: ${skillsEN.join(", ") || "none"}

CONTENT: ${ageRules[cfg.ageTier] || ageRules.teen}
LENGTH: ${lengthRules[cfg.responseLength] || lengthRules.medium}
${cfg.deathPossible ? "DEATH IS POSSIBLE if very poor choices are made." : "DEATH IS NOT POSSIBLE. Failures redirect the story."}
${cfg.trackStats
  ? `TRACK STATS: Always return a "stats" object with the updated values. Current authoritative state — health: ${stats.health}/100, inventory: [${(stats.inventory || []).join(", ") || "empty"}], relationships: {${Object.entries(stats.relationships || {}).map(([k,v]) => `${k}: ${v}`).join(", ") || "none"}}. Carry these forward and modify based on events. Reduce health on dangerous failures.`
  : ""}
SKILLS: When situations relate to character skills, acknowledge the skill and give more favorable outcomes.
${cfg.storyPrompt ? `PREMISE: ${cfg.storyPrompt}` : "Create an original compelling opening."}
${storyContextSection}
${chapterSection}

STORY ARC: ${phaseInstr}

RESPOND WITH VALID JSON ONLY (no markdown fences):
{"story":"...","choices":["...","...","..."],${cfg.trackStats ? '"stats":{"health":100,"inventory":[],"relationships":{}},' : ''}"gameOver":false,"gameOverReason":"","rollRequired":false,"rollContext":"","chapterComplete":false,"chapterProgress":{"achieved":[],"clues":[]},"mood":"neutral"}

rollRequired: true when next action has meaningful risk (combat, stealth, locks, persuasion). False for safe/narrative choices.
rollContext: Short phrase shown to player before rolling (e.g. "pick the ancient lock").
chapterComplete: true ONLY when the single chapter goal is conclusively achieved.
chapterProgress: Update every turn — achieved: specific milestones completed toward the one chapter goal (cumulative, carry forward); clues: hints/info the player has discovered that help reach the goal (cumulative).
mood: Emotional tone of the story text just returned. One of: peaceful, tense, action, dramatic, sad, triumphant, mysterious, neutral.
Provide 2-5 meaningfully different choices. ALWAYS include at least 1 choice unless gameOver is true.`;
  }, [config, character, turnCount, storySummary, chapterBrief, chapterNumber, totalChapters, stats]);

  // ─── API CALL ─────────────────────────────────────────────────
  const callAPI = useCallback(async (messages, opts = {}) => {
    try {
      const sysPrompt = opts.systemPrompt ?? buildSystemPrompt();
      return await api.chat(sysPrompt, messages, { ...opts, turnCount });
    } catch (err) {
      if (err.message === "__need_key__") {
        setKeyModalContext("game");
        setShowKeyModal(true);
        return null; // caller must handle null
      }
      console.error("API error:", err);
      const errorMsg = lang === "Hebrew" ? "משהו השתבש... נסה שוב." : lang === "Arabic" ? "حدث خطأ... حاول مرة أخرى." : lang === "Portuguese" ? "Algo deu errado... tente novamente." : "Something went wrong... try again.";
      const retryMsg = lang === "Hebrew" ? "נסה שוב" : lang === "Arabic" ? "حاول مرة أخرى" : lang === "Portuguese" ? "Tentar novamente" : "Try again";
      return {
        story: errorMsg,
        choices: [retryMsg],
        gameOver: false, rollRequired: false, rollContext: "", chapterComplete: false,
      };
    }
  }, [buildSystemPrompt, lang, turnCount]);

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
      saveUserKey(keyInput);
      setKeyInput("");
      setShowKeyModal(false);
    } catch (err) {
      setKeyError(err.message);
    } finally {
      setKeyValidating(false);
    }
  };

  // ─── START ADVENTURE ──────────────────────────────────────────
  const startAdventure = async () => {
    // ── Apply defaults for any unset fields ──
    const names   = CHARACTER_NAMES[config.genre] || CHARACTER_NAMES.fantasy;
    const isMale  = Math.random() < 0.5;
    const allSkillsEN = GENRE_SKILLS[config.genre]?.en || [];
    const shuffled = [...allSkillsEN].sort(() => Math.random() - 0.5);

    const finalChar = {
      name:       character.name.trim()    || pick(isMale ? names.male : names.female),
      gender:     character.gender         || (isMale ? "male" : "female"),
      age:        character.age.trim()     || String(Math.floor(Math.random() * 61) + 6),
      appearance: character.appearance.trim() || randomAppearanceStr(),
      skills:     character.skills.length >= 2 ? character.skills : shuffled.slice(0, 2),
    };

    const validLengths = [5, 10, 20, 40];
    const finalCfg = {
      ...config,
      ageTier:        config.ageTier        || "teen",
      responseLength: config.responseLength  || "short",
      storyLength:    validLengths.includes(config.storyLength) ? config.storyLength : 5,
      deathPossible:  config.deathPossible  ?? false,
      trackStats:     config.trackStats     ?? false,
      perspective:    config.perspective    || "second",
      storyPrompt:    config.storyPrompt.trim() || DEFAULT_SEEDS[config.genre] || "",
    };

    // Update state so the rest of the session (makeChoice, saves, etc.) uses final values
    setConfig(finalCfg);
    setCharacter(finalChar);
    setPhase("game");
    setLoading(true);

    const finalTotalChapters = CHAPTER_MAP[finalCfg.storyLength] || 1;
    setTimeout(() => generateChapterBrief(1, finalTotalChapters, ""), 5000);

    const openingLength = {
      short:  "3-4 sentences",
      medium: "6-8 sentences (roughly 2 paragraphs)",
      long:   "4-5 rich, descriptive paragraphs",
    }[finalCfg.responseLength] || "3-4 sentences";

    const firstMessage = [{ role: "user", content:
      `Begin the adventure with an opening of ${openingLength}. Cover: ` +
      `(1) a brief background on ${finalChar.name} — who they are, personality, and what shaped them; ` +
      `(2) the world — its tone, state, and defining features; ` +
      `(3) the current situation — what is happening right now that sets the story in motion. ` +
      `End with 2-5 meaningful choices.`
    }];

    // Build system prompt with final values (state updates above are async; pass overrides directly)
    const systemPrompt = buildSystemPrompt(finalCfg, finalChar);
    const result = await callAPI(firstMessage, { systemPrompt });
    if (!result) { setLoading(false); return; } // key modal shown
    setStoryLog([{ role: "narrator", text: result.story }]);
    setChoices(result.choices?.length ? result.choices : (result.gameOver ? [] : [t("continue_")]));
    if (result.stats && finalCfg.trackStats) setStats(result.stats);
    setNextRollRequired({ required: !!result.rollRequired, context: result.rollContext || "" });
    setCurrentMood(result.mood || "peaceful");
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
    if (!result) { setLoading(false); return; } // key modal shown

    setStoryLog(prev => [...prev, { role: "narrator", text: result.story }]);
    setChoices(result.choices?.length ? result.choices : (result.gameOver ? [] : [t("continue_")]));
    if (result.stats && config.trackStats) setStats(result.stats);
    if (result.gameOver) {
      setGameOver(true);
      setChoices([]);
      setCurrentMood(result.gameOverReason?.toLowerCase().includes("death") ? "sad" : "triumphant");
    } else if (result.chapterComplete) {
      setCurrentMood("triumphant");
    } else {
      setCurrentMood(result.mood || "neutral");
    }

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
                  style={{ textAlign: "center", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <img
                    src={flagSrc(l.flag)}
                    srcSet={`${flagSrc(l.flag)} 1x, ${flagSrc2x(l.flag)} 2x`}
                    alt=""
                    width={28}
                    height={20}
                    style={{ borderRadius: 3, boxShadow: "0 0 0 1px rgba(0,0,0,0.25)", display: "block", objectFit: "cover" }}
                  />
                  <span>{l.label}</span>
                </OptionButton>
              ))}
            </div>
            <NavButtons {...nav} onBack={() => setPhase("home")} onNext={() => setSetupStep(1)} canNext />
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
            <NavButtons {...nav} onBack={() => setSetupStep(1)} onNext={() => setSetupStep(3)} canNext />
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
            <NavButtons {...nav} onBack={() => setSetupStep(2)} onNext={() => setSetupStep(4)} canNext />
          </SetupCard>
        );

      case "duration":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("storyDuration")} subtitle={t("storyDurationSub")}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { turns: 5,  icon: "⚡", labelKey: "sprint",   descKey: "sprintDesc" },
                { turns: 10, icon: "🏃", labelKey: "shortAdv", descKey: "shortAdvDesc" },
                { turns: 20, icon: "📖", labelKey: "standard", descKey: "standardDesc" },
                { turns: 40, icon: "🏔️", labelKey: "epic",     descKey: "epicDesc" },
              ].map(({ turns, icon, labelKey, descKey }) => (
                <OptionButton key={turns} theme={theme} selected={config.storyLength === turns}
                  onClick={() => setConfig(c => ({ ...c, storyLength: turns }))}
                  style={{ textAlign: "center", padding: "16px 12px" }}>
                  <span style={{ fontSize: 26, display: "block", marginBottom: 6 }}>{icon}</span>
                  <strong style={{ fontFamily: theme.heading, fontSize: 15 }}>{t(labelKey)}</strong>
                  <span style={{ display: "block", fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{t(descKey)}</span>
                </OptionButton>
              ))}
            </div>
            <NavButtons {...nav} onBack={() => setSetupStep(3)} onNext={() => setSetupStep(5)} canNext />
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
            <NavButtons {...nav} onBack={() => setSetupStep(4)} onNext={() => setSetupStep(6)} canNext />
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
            <NavButtons {...nav} onBack={() => setSetupStep(5)} onNext={() => setSetupStep(7)} canNext />
          </SetupCard>
        );

      case "prompt":
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("storySeed")} subtitle={t("storySeedSub")}>
            <textarea value={config.storyPrompt} onChange={e => setConfig(c => ({ ...c, storyPrompt: e.target.value }))}
              placeholder={DEFAULT_SEEDS[config.genre] || t("storySeedPH")}
              style={{ ...inputStyle(theme), minHeight: 120, resize: "vertical", direction: isRTL ? "rtl" : "ltr" }} />
            <NavButtons {...nav} onBack={() => setSetupStep(6)} onNext={() => setSetupStep(8)} canNext />
          </SetupCard>
        );

      case "character": {
        const skillsDisplay = getSkillsDisplay(config.genre);
        const nameChips = CHARACTER_NAMES[config.genre] || CHARACTER_NAMES.fantasy;
        const chipBtn = (name, gender) => (
          <button key={name}
            onClick={() => setCharacter(c => ({ ...c, name, gender }))}
            style={{
              background: character.name === name ? theme.primary : "transparent",
              border: `1px solid ${character.name === name ? theme.primary : theme.border}`,
              borderRadius: 14, padding: "3px 11px",
              color: character.name === name ? theme.bg : theme.textMuted,
              fontFamily: theme.body, fontSize: 12, cursor: "pointer", transition: "all 0.15s",
            }}>{name}</button>
        );
        return (
          <SetupCard theme={theme} active isRTL={isRTL} title={t("createChar")} subtitle={t("createCharSub")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 4 }}>
                      {t("name")} <span style={{ opacity: 0.5 }}>({t("optional_")})</span>
                    </label>
                    <input value={character.name} onChange={e => setCharacter(c => ({ ...c, name: e.target.value }))}
                      placeholder={t("namePH")} style={{ ...inputStyle(theme), direction: isRTL ? "rtl" : "ltr" }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 4 }}>
                      {t("age")} <span style={{ opacity: 0.5 }}>({t("optional_")})</span>
                    </label>
                    <input value={character.age} onChange={e => setCharacter(c => ({ ...c, age: e.target.value }))}
                      placeholder="6 – 66" style={inputStyle(theme)} />
                  </div>
                </div>
                {/* Name suggestions */}
                <div style={{ marginBottom: 2 }}>
                  <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 11, display: "block", marginBottom: 5 }}>
                    {t("suggestedNames")}:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 5 }}>
                    <span style={{ color: theme.textMuted, fontSize: 13, alignSelf: "center", minWidth: 14 }}>♂</span>
                    {nameChips.male.map(n => chipBtn(n, "male"))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    <span style={{ color: theme.textMuted, fontSize: 13, alignSelf: "center", minWidth: 14 }}>♀</span>
                    {nameChips.female.map(n => chipBtn(n, "female"))}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>{t("gender")} <span style={{ opacity: 0.5 }}>({t("optional_")})</span></label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["male","female","nonBinary","other"].map(g => (
                    <OptionButton key={g} theme={theme} selected={character.gender === g}
                      onClick={() => setCharacter(c => ({ ...c, gender: g }))}
                      style={{ flex: 1, textAlign: "center", padding: "8px 4px", fontSize: 13 }}>{t(g)}</OptionButton>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 4 }}>
                  {t("appearance")} <span style={{ opacity: 0.5 }}>({t("optional_")})</span>
                </label>
                <textarea value={character.appearance} onChange={e => setCharacter(c => ({ ...c, appearance: e.target.value }))}
                  placeholder={t("appearancePH")} style={{ ...inputStyle(theme), minHeight: 60, resize: "vertical", direction: isRTL ? "rtl" : "ltr" }} />
              </div>
              <div>
                <label style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>
                  {t("skills")} <span style={{ opacity: 0.5 }}>{t("skillsSub")} — {t("optional_")}, 2 will be chosen if skipped</span>
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
              canNext nextLabel={t("beginAdventure")} />
          </SetupCard>
        );
      }
      default: return null;
    }
  };

  // ─── GAME VIEW ────────────────────────────────────────────────
  const renderGame = () => (
    <div style={{
      display: "flex", gap: isMobile ? 12 : 20,
      flexDirection: isMobile ? "column" : "row",
      maxWidth: 900, width: "100%", margin: "0 auto",
      minHeight: "80vh", direction: isRTL ? "rtl" : "ltr",
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
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
                  fontSize: entry.role === "player" ? Math.max(13, storyFontSizePx - 1) : storyFontSizePx,
                  lineHeight: 1.75,
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

        {/* Choices panel — always show input when game is active, even if LLM returned no suggestions */}
        {!loading && !gameOver && (
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

      {/* Minimal sidebar — shown when no stats and no chapter progress yet */}
      {!config.trackStats && !(chapterBrief && (chapterProgress.achieved.length > 0 || chapterProgress.clues.length > 0)) && (
        <div style={{
          width: isMobile ? "100%" : 190, flexShrink: 0, background: theme.bgCard, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.border}`, borderRadius: 16, padding: "18px 14px", alignSelf: "flex-start",
          position: isMobile ? "static" : "sticky", top: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", textAlign: isRTL ? "right" : "left",
        }}>
          <SidebarActions theme={theme} t={t} turnCount={turnCount} isRTL={isRTL}
            onSave={handleSaveGame} onExport={handleExport} onQuit={resetGame}
            onKey={() => { setKeyModalContext("game"); setShowKeyModal(true); setKeyInput(""); setKeyError(""); }}
            musicEnabled={musicEnabled} musicVolume={musicVolume}
            onMusicToggle={() => setMusicEnabled(v => !v)} onVolumeChange={setMusicVolume}
          />
        </div>
      )}

      {/* Chapter progress sidebar — shown when stats are off but chapters are active */}
      {!config.trackStats && chapterBrief && (chapterProgress.achieved.length > 0 || chapterProgress.clues.length > 0) && (
        <div style={{
          width: isMobile ? "100%" : 190, flexShrink: 0, background: theme.bgCard, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.border}`, borderRadius: 16, padding: "18px 14px", alignSelf: "flex-start",
          position: isMobile ? "static" : "sticky", top: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", textAlign: isRTL ? "right" : "left",
          display: "flex", flexDirection: "column",
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
          <SidebarActions theme={theme} t={t} turnCount={turnCount} isRTL={isRTL}
            onSave={handleSaveGame} onExport={handleExport} onQuit={resetGame}
            onKey={() => { setKeyModalContext("game"); setShowKeyModal(true); setKeyInput(""); setKeyError(""); }}
            musicEnabled={musicEnabled} musicVolume={musicVolume}
            onMusicToggle={() => setMusicEnabled(v => !v)} onVolumeChange={setMusicVolume}
          />
        </div>
      )}

      {/* Stats sidebar */}
      {config.trackStats && (
        <div style={{
          width: isMobile ? "100%" : 200, flexShrink: 0, background: theme.bgCard, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.border}`, borderRadius: 16, padding: "20px 16px", alignSelf: "flex-start",
          position: isMobile ? "static" : "sticky", top: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", textAlign: isRTL ? "right" : "left",
          display: "flex", flexDirection: "column",
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
          <SidebarActions theme={theme} t={t} turnCount={turnCount} isRTL={isRTL}
            onSave={handleSaveGame} onExport={handleExport} onQuit={resetGame}
            onKey={() => { setKeyModalContext("game"); setShowKeyModal(true); setKeyInput(""); setKeyError(""); }}
            musicEnabled={musicEnabled} musicVolume={musicVolume}
            onMusicToggle={() => setMusicEnabled(v => !v)} onVolumeChange={setMusicVolume}
          />
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
        html, body { margin: 0; padding: 0; overflow-x: hidden; -webkit-text-size-adjust: 100%; }
        body { background: ${theme.bg}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 3px; }
        ::placeholder { color: ${theme.textMuted}; opacity: 0.6; }
        /* Inputs — ensure minimum 16px on mobile to prevent iOS zoom on focus */
        @media (max-width: ${MOBILE_BREAKPOINT}px) {
          input[type="text"], input[type="number"], textarea { font-size: 16px !important; }
          button { min-height: 40px; }
          .os-hero { font-size: clamp(26px, 8vw, 36px) !important; }
        }
        /* Selection */
        ::selection { background: ${theme.primary}40; color: ${theme.text}; }
      `}</style>

      <div
        style={{
          minHeight: "100vh", background: theme.bg, backgroundImage: theme.bgImage,
          padding: isMobile ? "24px 14px" : "40px 20px",
          fontFamily: theme.body, color: theme.text, transition: "background 0.6s ease",
          direction: isRTL ? "rtl" : "ltr",
        }}
        onClick={() => {
          if (!hasInteracted.current) {
            hasInteracted.current = true;
            setMusicEnabled(true);
          }
        }}
      >
        {prefs.themeMode !== "light" && <FloatingParticles theme={theme} />}

        {/* Top-right floating nav: Help + Settings */}
        <div style={{
          position: "fixed",
          top: 14,
          [isRTL ? "left" : "right"]: 14,
          display: "flex", gap: 8, zIndex: 400,
        }}>
          <button
            onClick={() => setShowHelp(true)}
            aria-label={t("help")}
            title={t("help")}
            style={{
              background: theme.bgCard, border: `1px solid ${theme.border}`,
              borderRadius: 10, width: 38, height: 38, padding: 0,
              color: theme.text, cursor: "pointer", fontSize: 16,
              backdropFilter: "blur(10px)", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.color = theme.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.text; }}
          >❔</button>
          <button
            onClick={() => setShowSettings(true)}
            aria-label={t("settings")}
            title={t("settings")}
            style={{
              background: theme.bgCard, border: `1px solid ${theme.border}`,
              borderRadius: 10, width: 38, height: 38, padding: 0,
              color: theme.text, cursor: "pointer", fontSize: 16,
              backdropFilter: "blur(10px)", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.color = theme.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.text; }}
          >⚙</button>
        </div>

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

          {/* ── Home screen — OpenStory AI ── */}
          {phase === "home" && (
            <div className="os-home" style={{ maxWidth: 640, margin: "0 auto", paddingTop: isMobile ? 48 : 24 }}>
              {/* Wordmark */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  fontFamily: theme.heading, color: theme.primary,
                  fontSize: 14, letterSpacing: 6, textTransform: "uppercase",
                  opacity: 0.85, marginBottom: 12,
                }}>
                  ✦ {t("brandName")} ✦
                </div>
                <h1 className="os-hero" style={{
                  fontFamily: theme.heading, color: theme.text,
                  fontSize: "clamp(30px, 6vw, 52px)", fontWeight: 400,
                  lineHeight: 1.12, margin: "0 auto 14px",
                  maxWidth: 560, letterSpacing: "-0.01em",
                }}>
                  {t("homeTitle")}
                </h1>
                <p style={{
                  fontFamily: theme.body, color: theme.textMuted,
                  fontSize: 16, lineHeight: 1.6, margin: "0 auto",
                  maxWidth: 520,
                }}>
                  {t("homeTagline")}
                </p>
              </div>

              {/* Feature bullets */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: 12, marginBottom: 28,
              }}>
                {[
                  { icon: "🎭", key: "homeBullet1" },
                  { icon: "🪄", key: "homeBullet2" },
                  { icon: "🎲", key: "homeBullet3" },
                ].map(b => (
                  <div key={b.key} style={{
                    background: theme.bgCard, border: `1px solid ${theme.border}`,
                    borderRadius: 12, padding: "14px 16px",
                    fontFamily: theme.body, color: theme.text, fontSize: 13, lineHeight: 1.5,
                    display: "flex", alignItems: "flex-start", gap: 10,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{b.icon}</span>
                    <span>{t(b.key)}</span>
                  </div>
                ))}
              </div>

              {/* CTA card */}
              <div style={{
                background: theme.bgCard, backdropFilter: "blur(20px)",
                border: `1px solid ${theme.border}`, borderRadius: 16,
                padding: isMobile ? "20px 20px" : "26px 30px",
                boxShadow: prefs.themeMode === "light" ? "0 4px 24px rgba(0,0,0,0.06)" : "0 10px 40px rgba(0,0,0,0.3)",
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <button
                  onClick={() => setPhase("setup")}
                  className="os-btn-primary"
                  style={{
                    padding: "16px 0", borderRadius: 12, border: "none",
                    background: theme.primary, color: theme.bg,
                    fontFamily: theme.body, fontSize: 16, fontWeight: 600,
                    cursor: "pointer", letterSpacing: 0.3,
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${theme.primary}40`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {t("startNew")} →
                </button>
                <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
                  <button
                    onClick={handleLoadGame}
                    style={{
                      flex: 1, padding: "12px 0", borderRadius: 10,
                      border: `1px solid ${theme.border}`, background: "transparent",
                      color: theme.text, fontFamily: theme.body, fontSize: 14, fontWeight: 500,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.color = theme.primary; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.text; }}
                  >
                    💾 {t("loadSaved")}
                  </button>
                  <button
                    onClick={() => setShowHelp(true)}
                    style={{
                      flex: 1, padding: "12px 0", borderRadius: 10,
                      border: `1px solid ${theme.border}`, background: "transparent",
                      color: theme.text, fontFamily: theme.body, fontSize: 14, fontWeight: 500,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.color = theme.primary; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.text; }}
                  >
                    ❔ {t("help")}
                  </button>
                </div>
                {/* Key / free-turns footer */}
                <div style={{ paddingTop: 10, marginTop: 4, borderTop: `1px solid ${theme.border}55` }}>
                  {hasUserKey() ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontFamily: theme.body, color: theme.secondary || theme.primary, fontSize: 12 }}>
                        🗝️ {t("unlimitedTurns")}
                      </span>
                      <button
                        onClick={() => { clearUserKey(); }}
                        style={{ background: "none", border: "none", color: theme.textMuted, fontFamily: theme.body, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}
                      >
                        {t("changeKey")}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 12 }}>
                        ✦ {t("freeTurnsInfo", { n: String(FREE_TURN_LIMIT) })}
                      </span>
                      <button
                        onClick={() => { setKeyModalContext("home"); setShowKeyModal(true); setKeyInput(""); setKeyError(""); }}
                        style={{
                          background: "none", border: `1px solid ${theme.primary}80`, borderRadius: 6,
                          color: theme.primary, fontFamily: theme.body, fontSize: 12,
                          cursor: "pointer", padding: "4px 12px",
                        }}
                      >
                        🗝️ {t("addYourKey")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Setup wizard ── */}
          {phase === "setup" && (
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{
                  fontFamily: theme.heading, color: theme.primary,
                  fontSize: 12, letterSpacing: 5, textTransform: "uppercase",
                  opacity: 0.8, marginBottom: 10,
                }}>
                  ✦ {t("brandName")} ✦
                </div>
                <h1 style={{ fontFamily: theme.heading, color: theme.text, fontSize: "clamp(24px, 5vw, 32px)", margin: "0 0 8px", letterSpacing: "-0.01em", fontWeight: 400 }}>
                  {config.genre ? `${theme.icon} ${t("adventureAwaits")}` : t("adventureAwaits")}
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

        {/* Footer */}
        <div style={{
          textAlign: "center", padding: "24px 0 8px",
          fontFamily: theme.body, fontSize: 11, color: theme.textMuted, opacity: 0.6,
        }}>
          Created by{" "}
          <a
            href="https://github.com/royruho/choose_your_adventure"
            target="_blank" rel="noopener noreferrer"
            style={{ color: theme.primary, textDecoration: "none", opacity: 0.8 }}
            onMouseOver={e => e.currentTarget.style.opacity = "1"}
            onMouseOut={e  => e.currentTarget.style.opacity = "0.8"}
          >
            Roy Ruach
          </a>
        </div>
      </div>

      {/* Key modal — shown when free turns are exhausted */}
      {showKeyModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900,
          backdropFilter: "blur(8px)", direction: isRTL ? "rtl" : "ltr",
        }}>
          <div style={{
            background: theme.bgCard, border: `1px solid ${theme.primary}`,
            borderRadius: 20, padding: "36px 40px", maxWidth: 480, width: "90%",
            boxShadow: `0 0 60px ${theme.primary}20, 0 24px 80px rgba(0,0,0,0.6)`,
          }}>
            <h2 style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 22, margin: "0 0 10px", textAlign: "center" }}>
              🗝️ {t("keyModalTitle")}
            </h2>
            <p style={{ fontFamily: theme.body, color: theme.textMuted, fontSize: 13, lineHeight: 1.7, marginTop: 0 }}>
              {t(keyModalContext === "home" ? "keyModalSubHome" : "keyModalSub")}
            </p>
            <div style={{ background: `${theme.border}30`, borderRadius: 10, padding: "14px 18px", marginBottom: 18 }}>
              <p style={{ fontFamily: theme.heading, color: theme.primary, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 8px" }}>
                {t("keyHowTo")}
              </p>
              {[
                { text: t("keyStep1"), link: "https://openrouter.ai" },
                { text: t("keyStep2") },
                { text: t("keyStep3") },
                { text: t("keyStep4") },
              ].map(({ text, link }, i) => (
                <div key={i} style={{ fontFamily: theme.body, color: theme.text, fontSize: 12, marginBottom: 5, display: "flex", gap: 8 }}>
                  <span style={{ color: theme.primary, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span>{link ? <><a href={link} target="_blank" rel="noopener noreferrer" style={{ color: theme.primary }}>openrouter.ai</a> — {text.replace(/^go to openrouter\.ai /i, "")}</> : text}</span>
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
                fontFamily: theme.heading, fontSize: 15, fontWeight: 700,
                cursor: keyInput.trim() && !keyValidating ? "pointer" : "not-allowed",
                letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s",
              }}
            >
              {keyValidating ? t("keyValidating") : t("keyValidate")}
            </button>
          </div>
        </div>
      )}

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

      {/* Help modal */}
      {showHelp && <HelpModal theme={theme} t={t} isRTL={isRTL} onClose={() => setShowHelp(false)} />}

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          theme={theme} t={t} isRTL={isRTL}
          prefs={prefs} setPrefs={setPrefs}
          musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled}
          musicVolume={musicVolume} setMusicVolume={setMusicVolume}
          onClose={() => setShowSettings(false)}
        />
      )}

      <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileChange} />
    </>
  );
}
