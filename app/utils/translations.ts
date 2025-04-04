export type TranslationKey =
  | "home"
  | "learn"
  | "tools"
  | "gallery"
  | "fundUs"
  | "logIn"
  | "signup"
  | "name"
  | "email"
  | "password"
  | "createAccount"
  | "translate"
  | "selectLanguage"
  | "english"
  | "kinyarwanda"
  | "umwero"
  | "enterTextToTranslate"
  | "translationWillAppearHere"
  | "translated"
  | "umweroChat"
  | "typeYourMessage"
  | "send"
  | "placeholderBotResponse"
  | "enterCircleOfKnowledge"
  | "whereEveryLetterTellsStory"
  | "startLearning"
  | "coreFeatures"
  | "learnUmwero"
  | "interactiveLessons"
  | "exploreAncientCalendar"
  | "accessTools"
  | "learnThroughGames"
  | "culturalInsights"
  | "didYouKnow"
  | "umweroCircleMeaning"
  | "culturalSignificance"
  | "umweroCharacterMeaning"
  | "languagePreservation"
  | "umweroRoleInPreservation"
  | "supportOurMission"
  | "helpUsPreserve"
  | "donateNow"
  | "quickLinks"
  | "about"
  | "contact"
  | "privacyPolicy"
  | "termsOfService"
  | "resources"
  | "learningMaterials"
  | "cultureAndHistory"
  | "community"
  | "supportUs"
  | "followUs"
  | "allRightsReserved"
  | "youHaveCompleted"
  | "lessons"
  | "continueYourJourney"
  // Learn page specific translations
  | "startYourUmweroJourneyToday"
  | "interactiveLessonsDescription"
  | "watchIntroVideo"
  | "searchLessons"
  | "yourProgress"
  | "writtenCourses"
  | "videoTutorials"
  | "practiceTools"
  | "certification"
  | "beginner"
  | "intermediate"
  | "introductionToUmweroCharacters"
  | "learnBasicShapesAndPrinciples"
  | "basicStrokesAndPatterns"
  | "masterFundamentalStrokes"
  | "writingYourFirstWords"
  | "startFormingCompleteWords"
  | "umweroVowels"
  | "learnVowelCharacters"
  | "umweroConsonants"
  | "masterConsonantCharacters"
  | "numbersInUmwero"
  | "learnToWriteNumbers"
  | "constructingSimpleSentences"
  | "practiceWritingSimpleSentences"
  | "pronunciationGuide"
  | "learnCorrectPronunciation"
  | "advancedCharacterCombinations"
  | "learnToCombineCharacters"
  | "understandSymbolMeanings"
  | "complexWordFormation"
  | "createComplexWords"
  | "umweroIdiomsAndExpressions"
  | "learnCommonIdioms"
  | "umweroCalligraphy"
  | "developHandwritingStyle"
  | "completed"
  | "startLesson"
  | "scrollForMore"
  | "imibireExploringUmwero"
  | "diveDeepIntoUmwero"
  | "umweroBasicsPartOne"
  | "startUmweroJourney"
  | "umweroBasicsPartTwo"
  | "continueUmweroLearning"
  | "watchNow"
  | "virtualKeyboard"
  | "practiceTypingUmwero"
  | "practiceWorksheets"
  | "downloadPDFWorksheets"
  | "quizzes"
  | "testYourKnowledge"
  | "openTool"
  | "availableCertifications"
  | "earnRecognizedCertificates"
  | "umweroBasicsCertificate"
  | "completeBeginnerModules"
  | "startCertification"
  | "umweroAdvancedCertificate"
  | "completeIntermediateModules"
  | "yourCertificates"
  | "trackYourAchievements"
  | "noCertificatesYet"
  | "completeCourseToEarn"
  | "joinOurLearningCommunity"
  | "connectWithFellowLearners"
  | "joinDiscussion"
  | "shareProgress"
  | "introductionToUmweroTeaching"
  | "videoPlaceholder"
  | "interactiveLessonContent"
  | "lessonContentPlaceholder"

  | 'learnMore'
  |'preservingCulturalHeritage'
  | 'step'
  | 'of'
  | 'practice'
  | 'quiz'
  | 'lessonContent'
  | 'exampleCharacter'
  | 'practiceExercise'
  | 'traceTheCharacter'
  | 'drawingArea'
  | 'checkAnswer'
  | 'quickQuiz'
  | 'selectCorrectAnswer'
  | 'nextQuestion'
  | 'previous'
  | 'next'
  |'exploreAncientCalendar'


export const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    home: "Home",
    learn: "Learn",
    tools: "Tools",
    gallery: "Gallery",
    fundUs: "Fund Us",
    logIn: "Log In",
    signup: "Sign Up",
    name: "Name",
    email: "Email",
    password: "Password",
    createAccount: "Create Account",
    translate: "Translate",
    selectLanguage: "Select Language",
    english: "English",
    kinyarwanda: "Kinyarwanda",
    umwero: "Umwero",
    enterTextToTranslate: "Enter text to translate",
    translationWillAppearHere: "Translation will appear here",
    translated: "Translated",
    umweroChat: "Umwero Chat",
    typeYourMessage: "Type your message",
    send: "Send",
    placeholderBotResponse: "This is a placeholder response from the Umwero chatbot.",
    enterCircleOfKnowledge: "Enter the Circle of Knowledge",
    whereEveryLetterTellsStory: "Where Every Letter Tells a Story",
    startLearning: "Start Learning",
    coreFeatures: "Core Features",
    learnUmwero: "Learn Umwero",
    interactiveLessons: "Interactive lessons to master the ancient script",
    exploreAncientCalendar: "Explore Ancient Calendar",
    accessTools: "Access Translation Tools",
    learnThroughGames: "Learn Through Games",
    culturalInsights: "Cultural Insights",
    didYouKnow: "Did You Know?",
    umweroCircleMeaning: "The circular pattern of Umwero represents the cyclical nature of life and knowledge.",
    culturalSignificance: "Cultural Significance",
    umweroCharacterMeaning: "Each Umwero character carries deep cultural meaning beyond its phonetic value.",
    languagePreservation: "Language Preservation",
    umweroRoleInPreservation: "Umwero plays a crucial role in preserving indigenous knowledge systems.",
    supportOurMission: "Support Our Mission",
    helpUsPreserve: "Help us preserve and promote this ancient writing system for future generations.",
    donateNow: "Donate Now",
    quickLinks: "Quick Links",
    about: "About",
    contact: "Contact",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    resources: "Resources",
    learningMaterials: "Learning Materials",
    cultureAndHistory: "Culture & History",
    community: "Community",
    supportUs: "Support Us",
    followUs: "Follow Us",
    allRightsReserved: "All Rights Reserved",
    youHaveCompleted: "You have completed 5",
    lessons: "lessons",
    continueYourJourney: "Continue your journey",
    // Learn page specific translations
    startYourUmweroJourneyToday: "Start Your Umwero Journey Today",
    interactiveLessonsDescription: "Interactive lessons to help you master the ancient Umwero script",
    watchIntroVideo: "Watch Intro Video",
    searchLessons: "Search lessons...",
    yourProgress: "Your Progress:",
    writtenCourses: "Written Courses",
    videoTutorials: "Video Tutorials",
    practiceTools: "Practice Tools",
    certification: "Certification",
    beginner: "Beginner",
    intermediate: "Intermediate",
    introductionToUmweroCharacters: "Introduction to Umwero Characters",
    learnBasicShapesAndPrinciples: "Learn the basic shapes and principles of Umwero",
    basicStrokesAndPatterns: "Basic Strokes and Patterns",
    masterFundamentalStrokes: "Master the fundamental strokes used in Umwero",
    writingYourFirstWords: "Writing Your First Words",
    startFormingCompleteWords: "Start forming complete words in Umwero",
    umweroVowels: "Umwero Vowels",
    learnVowelCharacters: "Learn the vowel characters in Umwero",
    umweroConsonants: "Umwero Consonants",
    masterConsonantCharacters: "Master the consonant characters in Umwero",
    numbersInUmwero: "Numbers in Umwero",
    learnToWriteNumbers: "Learn to write numbers in Umwero",
    constructingSimpleSentences: "Constructing Simple Sentences",
    practiceWritingSimpleSentences: "Practice writing simple sentences in Umwero",
    pronunciationGuide: "Pronunciation Guide",
    learnCorrectPronunciation: "Learn the correct pronunciation of Umwero characters",
    advancedCharacterCombinations: "Advanced Character Combinations",
    learnToCombineCharacters: "Learn to combine characters for complex sounds",
    understandSymbolMeanings: "Understand the deeper meanings behind Umwero symbols",
    complexWordFormation: "Complex Word Formation",
    createComplexWords: "Create complex words and phrases in Umwero",
    umweroIdiomsAndExpressions: "Umwero Idioms and Expressions",
    learnCommonIdioms: "Learn common idioms and expressions in Umwero",
    umweroCalligraphy: "Umwero Calligraphy",
    developHandwritingStyle: "Develop your own Umwero handwriting style",
    completed: "Completed",
    startLesson: "Start Lesson",
    scrollForMore: "Scroll for more",
    imibireExploringUmwero: "Imibire: Exploring Umwero",
    diveDeepIntoUmwero: "Dive deep into the history and culture of Umwero",
    umweroBasicsPartOne: "Umwero Basics - Part One",
    startUmweroJourney: "Start your journey into Umwero script",
    umweroBasicsPartTwo: "Umwero Basics - Part Two",
    continueUmweroLearning: "Continue your learning of Umwero script",
    watchNow: "Watch Now",
    virtualKeyboard: "Virtual Keyboard",
    practiceTypingUmwero: "Practice typing in Umwero script",
    practiceWorksheets: "Practice Worksheets",
    downloadPDFWorksheets: "Download PDF worksheets for practice",
    quizzes: "Quizzes",
    testYourKnowledge: "Test your knowledge of Umwero",
    openTool: "Open Tool",
    availableCertifications: "Available Certifications",
    earnRecognizedCertificates: "Earn recognized certificates in Umwero script",
    umweroBasicsCertificate: "Umwero Basics Certificate",
    completeBeginnerModules: "Complete all beginner modules to earn this certificate",
    startCertification: "Start Certification",
    umweroAdvancedCertificate: "Umwero Advanced Certificate",
    completeIntermediateModules: "Complete all intermediate modules to earn this certificate",
    yourCertificates: "Your Certificates",
    trackYourAchievements: "Track your achievements and certifications",
    noCertificatesYet: "No Certificates Yet",
    completeCourseToEarn: "Complete a course to earn your first certificate",
    joinOurLearningCommunity: "Join Our Learning Community",
    connectWithFellowLearners: "Connect with fellow learners and share your progress",
    joinDiscussion: "Join Discussion",
    shareProgress: "Share Progress",
    introductionToUmweroTeaching: "Introduction to Umwero Teaching",
    videoPlaceholder: "Video content will be displayed here",
    interactiveLessonContent: "This is an interactive lesson to help you learn Umwero",
    lessonContentPlaceholder: "Lesson content will be displayed here",
    learnMore: 'Learn More',
    preservingCulturalHeritage: 'Preserving our cultural heritage through ancient script',
    step: "Step", 
    of: 'of',
    practice: 'Practice',
    quiz: 'Quiz',
    lessonContent: 'Lesson Content',
    exampleCharacter: 'Example Character',
    practiceExercise: 'Practice Exercise',
    traceTheCharacter: 'Trace the character below',
    drawingArea: 'Drawing Area',
    checkAnswer: 'Check Answer',
    quickQuiz: 'Quick Quiz',
    selectCorrectAnswer: 'Select the correct answer',
    nextQuestion: 'Next Question',
    previous: 'Previous',
    next: 'Next',
    exploreAncientCalendar: 'explore Ancient Calendar',
  },
  rw: {
    home: "Ahabanza",
    learn: "Kwiga",
    tools: "Ibikoresho",
    gallery: "Amafoto",
    fundUs: "Dufashe",
    logIn: "Injira",
    signup: "Iyandikishe",
    name: "Izina",
    email: "Imeri",
    password: "Ijambo ryibanga",
    createAccount: "Fungura Konti",
    translate: "Guhindura",
    selectLanguage: "Hitamo Ururimi",
    english: "Icyongereza",
    kinyarwanda: "Ikinyarwanda",
    umwero: "Umwero",
    enterTextToTranslate: "Andika amagambo yo guhindura",
    translationWillAppearHere: "Ibisobanuro bizagaragara hano",
    translated: "Byahinduwe",
    umweroChat: "Kuganira mu Mwero",
    typeYourMessage: "Andika ubutumwa bwawe",
    send: "Ohereza",
    placeholderBotResponse: "Iki ni igisubizo cy'agateganyo giturutse kuri roboti y'Umwero.",
    enterCircleOfKnowledge: "Injira mu Ruziga rw'Ubumenyi",
    whereEveryLetterTellsStory: "Aho Buri Inyuguti Itubwira Inkuru",
    startLearning: "Tangira Kwiga",
    coreFeatures: "Ibintu by'Ingenzi",
    learnUmwero: "Kwiga Umwero",
    interactiveLessons: "Amasomo afasha mu kwiga inyandiko ya kera",
    exploreAncientCalendar: "Kureba Kalendari ya Kera",
    accessTools: "Ibikoresho byo Guhindura",
    learnThroughGames: "Kwiga Ukoresheje Imikino",
    culturalInsights: "Ubumenyi bw'Umuco",
    didYouKnow: "Wari Uzi?",
    umweroCircleMeaning: "Ishusho y'uruziga rw'Umwero ihagarariye imiterere y'ubuzima n'ubumenyi.",
    culturalSignificance: "Agaciro k'Umuco",
    umweroCharacterMeaning: "Buri nyuguti y'Umwero ifite ibisobanuro byimbitse by'umuco birenze ijwi ryayo.",
    languagePreservation: "Kubungabunga Ururimi",
    umweroRoleInPreservation: "Umwero ufite uruhare rukomeye mu kubungabunga uburyo bw'ubumenyi kavukire.",
    supportOurMission: "Dufashe mu Butumwa Bwacu",
    helpUsPreserve: "Dufashe kubungabunga no guteza imbere iyi nyandiko ya kera ku bw'ab'ejo.",
    donateNow: "Tanga Inkunga",
    quickLinks: "Aho Ugera Vuba",
    about: "Ibyerekeye",
    contact: "Twandikire",
    privacyPolicy: "Amabwiriza y'Ibanga",
    termsOfService: "Amasezerano y'Imikorere",
    resources: "Ibikoresho",
    learningMaterials: "Imfashanyigisho",
    cultureAndHistory: "Umuco na Mateka",
    community: "Umuryango",
    supportUs: "Dufashe",
    followUs: "Dukurikire",
    allRightsReserved: "Uburenganzira Bwose Bwihariwe",
    youHaveCompleted: "Urangije amasomo 5",
    lessons: "amasomo",
    continueYourJourney: "Komeza urugendo rwawe",
    // Learn page specific translations
    startYourUmweroJourneyToday: "Tangira Urugendo rwawe rw'Umwero Uyu Munsi",
    interactiveLessonsDescription: "Amasomo afasha mu kwiga inyandiko ya kera y'Umwero",
    watchIntroVideo: "Reba Video y'Intangiriro",
    searchLessons: "Shakisha amasomo...",
    yourProgress: "Aho Ugeze:",
    writtenCourses: "Amasomo Yanditse",
    videoTutorials: "Amasomo ya Video",
    practiceTools: "Ibikoresho byo Kwimenyereza",
    certification: "Impamyabumenyi",
    beginner: "Utangira",
    intermediate: "Ugeze Hagati",
    introductionToUmweroCharacters: "Intangiriro ku Nyuguti z'Umwero",
    learnBasicShapesAndPrinciples: "Iga amashusho y'ibanze n'amahame y'Umwero",
    basicStrokesAndPatterns: "Imirongo y'Ibanze n'Imyubakire",
    masterFundamentalStrokes: "Menya neza imirongo y'ibanze ikoreshwa mu Mwero",
    writingYourFirstWords: "Kwandika Amagambo yawe ya Mbere",
    startFormingCompleteWords: "Tangira gukora amagambo yuzuye mu Mwero",
    umweroVowels: "Ingombajwi z'Umwero",
    learnVowelCharacters: "Iga ingombajwi mu Mwero",
    umweroConsonants: "Indagi z'Umwero",
    masterConsonantCharacters: "Menya neza indagi mu Mwero",
    numbersInUmwero: "Imibare mu Mwero",
    learnToWriteNumbers: "Iga kwandika imibare mu Mwero",
    constructingSimpleSentences: "Gukora Interuro Zoroshye",
    practiceWritingSimpleSentences: "Imenyereze kwandika interuro zoroshye mu Mwero",
    pronunciationGuide: "Uburyo bwo Kuvuga",
    learnCorrectPronunciation: "Iga kuvuga neza inyuguti z'Umwero",
    advancedCharacterCombinations: "Guhuza Inyuguti ku Buryo Bukomeye",
    learnToCombineCharacters: "Iga guhuza inyuguti ku majwi akomeye",
    understandSymbolMeanings: "Menya ibisobanuro byimbitse by'ibimenyetso by'Umwero",
    complexWordFormation: "Gukora Amagambo Akomeye",
    createComplexWords: "Kora amagambo n'interuro bikomeye mu Mwero",
    umweroIdiomsAndExpressions: "Imvugo n'Ibisanzwe mu Mwero",
    learnCommonIdioms: "Iga imvugo zisanzwe mu Mwero",
    umweroCalligraphy: "Umuhango wo Kwandika Umwero",
    developHandwritingStyle: "Gukora uburyo bwawe bwo kwandika Umwero",
    completed: "Byarangiye",
    startLesson: "Tangira Isomo",
    scrollForMore: "Zengurutsa kugira ngo ubone ibindi",
    imibireExploringUmwero: "Imibire: Kureba Umwero",
    diveDeepIntoUmwero: "Injira mu mateka n'umuco by'Umwero",
    umweroBasicsPartOne: "Ibanze by'Umwero - Igice cya Mbere",
    startUmweroJourney: "Tangira urugendo rwawe mu nyandiko y'Umwero",
    umweroBasicsPartTwo: "Ibanze by'Umwero - Igice cya Kabiri",
    continueUmweroLearning: "Komeza kwiga inyandiko y'Umwero",
    watchNow: "Reba Nonaha",
    virtualKeyboard: "Mudasobwa yo Kwandikisha",
    practiceTypingUmwero: "Imenyereze kwandika mu nyandiko y'Umwero",
    practiceWorksheets: "Impapuro zo Kwimenyerezaho",
    downloadPDFWorksheets: "Kuramo impapuro za PDF zo kwimenyerezaho",
    quizzes: "Ibizamini",
    testYourKnowledge: "Gerageza ubumenyi bwawe ku Mwero",
    openTool: "Fungura Igikoresho",
    availableCertifications: "Impamyabumenyi Zihari",
    earnRecognizedCertificates: "Habwa impamyabumenyi zemewe mu nyandiko y'Umwero",
    umweroBasicsCertificate: "Impamyabumenyi y'Ibanze by'Umwero",
    completeBeginnerModules: "Rangiza amasomo yose y'ibanze kugira ngo uhabwe iyi mpamyabumenyi",
    startCertification: "Tangira Impamyabumenyi",
    umweroAdvancedCertificate: "Impamyabumenyi y'Umwero Ukomeye",
    completeIntermediateModules: "Rangiza amasomo yose yo hagati kugira ngo uhabwe iyi mpamyabumenyi",
    yourCertificates: "Impamyabumenyi Zawe",
    trackYourAchievements: "Kurikirana ibyo wagezeho n'impamyabumenyi",
    noCertificatesYet: "Nta Mpamyabumenyi Urafata",
    completeCourseToEarn: "Rangiza isomo kugira ngo uhabwe impamyabumenyi yawe ya mbere",
    joinOurLearningCommunity: "Ifatanye n'Umuryango wacu w'Abiga",
    connectWithFellowLearners: "Ifatanye n'abandi biga kandi usangize ibyo wagezeho",
    joinDiscussion: "Ifatanye mu Kiganiro",
    shareProgress: "Sangiza Ibyo Wagezeho",
    introductionToUmweroTeaching: "Intangiriro ku Kwigisha Umwero",
    videoPlaceholder: "Ibiri muri video bizagaragara hano",
    interactiveLessonContent: "Iri ni isomo rifasha mu kwiga Umwero",
    lessonContentPlaceholder: "Ibiri mu isomo bizagaragara hano",
    learnMore: 'Menya Byinshi',
    preservingCulturalHeritage: 'Kubungabunga umurage wacu w\'umuco binyuze mu nyandiko ya kera',
    step: "Intambwe", 
    of: 'kuri',
    practice: 'Imenyereze',
    quiz: 'Ikizamini',
    lessonContent: 'Ibiri mu Isomo',
    exampleCharacter: 'Urugero rw\'Inyuguti',
    practiceExercise: 'Imyitozo yo Kwimenyereza',
    traceTheCharacter: 'Kurikiza inyuguti ikurikira',
    drawingArea: 'Aho Ushushanya',
    checkAnswer: 'Genzura Igisubizo',
    quickQuiz: 'Ikizamini Cyoroshye',
    selectCorrectAnswer: 'Hitamo igisubizo kiza',
    nextQuestion: 'Ikibazo Gikurikira',
    previous: 'Ibanza',
    next: 'Komeza',
    exploreAncientCalendar: 'sura Karendari za kera',
  },
  um: {
    home: "Home",
    learn: "Learn",
    tools: "Tools",
    gallery: "Gallery",
    fundUs: "Fund Us",
    logIn: "Log In",
    signup: "Sign Up",
    name: "Name",
    email: "Email",
    password: "Password",
    createAccount: "Create Account",
    translate: "Translate",
    selectLanguage: "Select Language",
    english: "English",
    kinyarwanda: "Kinyarwanda",
    umwero: "Umwero",
    enterTextToTranslate: "Enter text to translate",
    translationWillAppearHere: "Translation will appear here",
    translated: "Translated",
    umweroChat: "Umwero Chat",
    typeYourMessage: "Type your message",
    send: "Send",
    placeholderBotResponse: "This is a placeholder response from the Umwero chatbot.",
    enterCircleOfKnowledge: "Enter the Circle of Knowledge",
    whereEveryLetterTellsStory: "Where Every Letter Tells a Story",
    startLearning: "Start Learning",
    coreFeatures: "Core Features",
    learnUmwero: "Learn Umwero",
    interactiveLessons: "Interactive lessons to master the ancient script",
    exploreAncientCalendar: "Explore Ancient Calendar",
    accessTools: "Access Translation Tools",
    learnThroughGames: "Learn Through Games",
    culturalInsights: "Cultural Insights",
    didYouKnow: "Did You Know?",
    umweroCircleMeaning: "The circular pattern of Umwero represents the cyclical nature of life and knowledge.",
    culturalSignificance: "Cultural Significance",
    umweroCharacterMeaning: "Each Umwero character carries deep cultural meaning beyond its phonetic value.",
    languagePreservation: "Language Preservation",
    umweroRoleInPreservation: "Umwero plays a crucial role in preserving indigenous knowledge systems.",
    supportOurMission: "Support Our Mission",
    helpUsPreserve: "Help us preserve and promote this ancient writing system for future generations.",
    donateNow: "Donate Now",
    quickLinks: "Quick Links",
    about: "About",
    contact: "Contact",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    resources: "Resources",
    learningMaterials: "Learning Materials",
    cultureAndHistory: "Culture & History",
    community: "Community",
    supportUs: "Support Us",
    followUs: "Follow Us",
    allRightsReserved: "All Rights Reserved",
    youHaveCompleted: "You have completed 5",
    lessons: "lessons",
    continueYourJourney: "Continue your journey",
    // Learn page specific translations
    startYourUmweroJourneyToday: "Start Your Umwero Journey Today",
    interactiveLessonsDescription: "Interactive lessons to help you master the ancient Umwero script",
    watchIntroVideo: "Watch Intro Video",
    searchLessons: "Search lessons...",
    yourProgress: "Your Progress:",
    writtenCourses: "Written Courses",
    videoTutorials: "Video Tutorials",
    practiceTools: "Practice Tools",
    certification: "Certification",
    beginner: "Beginner",
    intermediate: "Intermediate",
    introductionToUmweroCharacters: "Introduction to Umwero Characters",
    learnBasicShapesAndPrinciples: "Learn the basic shapes and principles of Umwero",
    basicStrokesAndPatterns: "Basic Strokes and Patterns",
    masterFundamentalStrokes: "Master the fundamental strokes used in Umwero",
    writingYourFirstWords: "Writing Your First Words",
    startFormingCompleteWords: "Start forming complete words in Umwero",
    umweroVowels: "Umwero Vowels",
    learnVowelCharacters: "Learn the vowel characters in Umwero",
    umweroConsonants: "Umwero Consonants",
    masterConsonantCharacters: "Master the consonant characters in Umwero",
    numbersInUmwero: "Numbers in Umwero",
    learnToWriteNumbers: "Learn to write numbers in Umwero",
    constructingSimpleSentences: "Constructing Simple Sentences",
    practiceWritingSimpleSentences: "Practice writing simple sentences in Umwero",
    pronunciationGuide: "Pronunciation Guide",
    learnCorrectPronunciation: "Learn the correct pronunciation of Umwero characters",
    advancedCharacterCombinations: "Advanced Character Combinations",
    learnToCombineCharacters: "Learn to combine characters for complex sounds",
    understandSymbolMeanings: "Understand the deeper meanings behind Umwero symbols",
    complexWordFormation: "Complex Word Formation",
    createComplexWords: "Create complex words and phrases in Umwero",
    umweroIdiomsAndExpressions: "Umwero Idioms and Expressions",
    learnCommonIdioms: "Learn common idioms and expressions in Umwero",
    umweroCalligraphy: "Umwero Calligraphy",
    developHandwritingStyle: "Develop your own Umwero handwriting style",
    completed: "Completed",
    startLesson: "Start Lesson",
    scrollForMore: "Scroll for more",
    imibireExploringUmwero: "Imibire: Exploring Umwero",
    diveDeepIntoUmwero: "Dive deep into the history and culture of Umwero",
    umweroBasicsPartOne: "Umwero Basics - Part One",
    startUmweroJourney: "Start your journey into Umwero script",
    umweroBasicsPartTwo: "Umwero Basics - Part Two",
    continueUmweroLearning: "Continue your learning of Umwero script",
    watchNow: "Watch Now",
    virtualKeyboard: "Virtual Keyboard",
    practiceTypingUmwero: "Practice typing in Umwero script",
    practiceWorksheets: "Practice Worksheets",
    downloadPDFWorksheets: "Download PDF worksheets for practice",
    quizzes: "Quizzes",
    testYourKnowledge: "Test your knowledge of Umwero",
    openTool: "Open Tool",
    availableCertifications: "Available Certifications",
    earnRecognizedCertificates: "Earn recognized certificates in Umwero script",
    umweroBasicsCertificate: "Umwero Basics Certificate",
    completeBeginnerModules: "Complete all beginner modules to earn this certificate",
    startCertification: "Start Certification",
    umweroAdvancedCertificate: "Umwero Advanced Certificate",
    completeIntermediateModules: "Complete all intermediate modules to earn this certificate",
    yourCertificates: "Your Certificates",
    trackYourAchievements: "Track your achievements and certifications",
    noCertificatesYet: "No Certificates Yet",
    completeCourseToEarn: "Complete a course to earn your first certificate",
    joinOurLearningCommunity: "Join Our Learning Community",
    connectWithFellowLearners: "Connect with fellow learners and share your progress",
    joinDiscussion: "Join Discussion",
    shareProgress: "Share Progress",
    introductionToUmweroTeaching: "Introduction to Umwero Teaching",
    videoPlaceholder: "Video content will be displayed here",
    interactiveLessonContent: "This is an interactive lesson to help you learn Umwero",
    lessonContentPlaceholder: "Lesson content will be displayed here",
    step: "Intambwe", 
    // reminds me that Umwero should be in Kinyarwanda
    of: 'kuri',
    practice: 'Imenyereze',
    quiz: 'Ikizamini',
    lessonContent: 'Ibiri mu Isomo',
    exampleCharacter: 'Urugero rw\'Inyuguti',
    practiceExercise: 'Imyitozo yo Kwimenyereza',
    traceTheCharacter: 'Kurikiza inyuguti ikurikira',
    drawingArea: 'Aho Ushushanya',
    checkAnswer: 'Genzura Igisubizo',
    quickQuiz: 'Ikizamini Cyoroshye',
    selectCorrectAnswer: 'Hitamo igisubizo kiza',
    nextQuestion: 'Ikibazo Gikurikira',
    previous: 'Ibanza',
    next: 'Komeza',
    exploreAncientCalendar: 'sura Karendari za kera',
  },
}

