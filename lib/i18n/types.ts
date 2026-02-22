// lib/i18n/types.ts
// TypeScript types for i18n system

export type Language = 'en' | 'rw' | 'um';

export interface TranslationStructure {
  // Navigation
  nav: {
    home: string;
    learn: string;
    tools: string;
    gallery: string;
    translate: string;
    calendar: string;
    community: string;
    dashboard: string;
    cart: string;
    fund: string;
    about: string;
    contact: string;
  };

  // Authentication
  auth: {
    login: string;
    signup: string;
    logout: string;
    welcomeBack: string;
    getStarted: string;
    alreadyHaveAccount: string;
    pleaseLogIn: string;
    accessDenied: string;
  };

  // Common UI Elements
  common: {
    loading: string;
    save: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    view: string;
    manage: string;
    create: string;
    update: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    search: string;
    clear: string;
    close: string;
    yes: string;
    no: string;
    ok: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    message: string;
    description: string;
    title: string;
    date: string;
    time: string;
    duration: string;
    total: string;
    settings: string;
    language: string;
    profile: string;
    viewProfile: string;
    areYouSure: string;
    cannotBeUndone: string;
  };

  // Languages
  languages: {
    english: string;
    kinyarwanda: string;
    umwero: string;
  };

  // Time units
  time: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };

  // Home Page
  home: {
    welcomeToUmwero: string;
    joinCommunity: string;
    enterCircleOfKnowledge: string;
    whereEveryLetterTellsStory: string;
    coreFeatures: string;
    whatYouGetAccess: string;
  };

  // Features
  features: {
    interactiveLessons: string;
    interactiveLessonsTitle: string;
    interactiveLessonsDesc: string;
    trackProgress: string;
    trackProgressTitle: string;
    trackProgressDesc: string;
    funGames: string;
    funGamesTitle: string;
    funGamesDesc: string;
    translationTools: string;
    translationToolsTitle: string;
    translationToolsDesc: string;
    videoTutorials: string;
    videoTutorialsTitle: string;
    learnUmweroTitle: string;
    learnUmweroDesc: string;
    calendarTitle: string;
    calendarDesc: string;
    toolsTitle: string;
    toolsDesc: string;
    gamesTitle: string;
    gamesDesc: string;
  };

  // Learning Section
  learn: {
    startYourUmweroJourneyToday: string;
    interactiveLessonsDescription: string;
    searchLessons: string;
    yourProgress: string;
    scrollForMore: string;
    startLearning: string;
    continueLearn: string;
    lessons: string;
    completed: string;
    startLesson: string;
    continueLesson: string;
    nextLesson: string;
    previousLesson: string;
    lessonComplete: string;
    congratulations: string;
  };

  // Lesson Categories
  lessonCategories: {
    beginner: string;
    intermediate: string;
    advanced: string;
    writtenCourses: string;
    videoTutorials: string;
    practiceTools: string;
    certification: string;
    quizzes: string;
  };

  // Lesson Titles
  lessonTitles: {
    umweroVowels: string;
    learnVowelCharacters: string;
    umweroConsonants: string;
    masterConsonantCharacters: string;
    writingYourFirstWords: string;
    startFormingCompleteWords: string;
    numbersInUmwero: string;
    learnToWriteNumbers: string;
    constructingSimpleSentences: string;
    practiceWritingSimpleSentences: string;
    pronunciationGuide: string;
    learnCorrectPronunciation: string;
    advancedCharacterCombinations: string;
    learnToCombineCharacters: string;
    culturalSignificance: string;
    understandSymbolMeanings: string;
    complexWordFormation: string;
    createComplexWords: string;
    umweroIdiomsAndExpressions: string;
    learnCommonIdioms: string;
    umweroCalligraphy: string;
    developHandwritingStyle: string;
    imibireExploringUmwero: string;
    diveDeepIntoUmwero: string;
    umweroBasicsPartOne: string;
    startUmweroJourney: string;
    umweroBasicsPartTwo: string;
    continueUmweroLearning: string;
    introductionToUmweroTeaching: string;
    watchIntroVideo: string;
  };

  // Lesson Practice
  lessonPractice: {
    vowel: string;
    consonant: string;
    meaning: string;
    culturalStory: string;
    tryIt: string;
    drawingInProgress: string;
    exampleWords: string;
    seeHowVowelUsed: string;
    learningTip: string;
    practicePronouncing: string;
    practiceWriting: string;
    practiceArea: string;
    drawCharacterBelow: string;
    showReference: string;
    hideReference: string;
    compareWithOriginal: string;
    tryAgain: string;
    goodEnough: string;
    yourWriting: string;
    correctForm: string;
    characterCompleted: string;
    allVowelsCompleted: string;
    continueToIntermediate: string;
    hideRef: string;
    showRef: string;
    reference: string;
    analyzing: string;
    compare: string;
    comparisonResult: string;
    howDoesCompare: string;
    score: string;
    good: string;
    scoreRequired: string;
  };

  // Canvas Drawing Feedback
  canvasFeedback: {
    drawCanvasEmpty: string;
    drawVeryLight: string;
    drawGoodStart: string;
    drawGettingCloser: string;
    drawVeryGood: string;
    drawExcellent: string;
    drawPerfect: string;
    comparisonFailed: string;
  };

  // Dashboard
  dashboard: {
    myProgress: string;
    viewYourProgress: string;
    lessonsCompleted: string;
    currentLevel: string;
    timeSpent: string;
    learningStreak: string;
    continueYourJourney: string;
    yourAchievements: string;
    loadingProgress: string;
  };

  // Gallery
  gallery: {
    umweroGallery: string;
    searchPlaceholder: string;
    freeEducationalResources: string;
    download: string;
    noFreeResourcesFound: string;
    umweroProducts: string;
    all: string;
    paintings: string;
    cultural: string;
    fashion: string;
    decoration: string;
    addToCart: string;
    noProductsFound: string;
    productDescription: string;
  };

  // Cart
  cart: {
    viewCart: string;
    cartEmpty: string;
    itemsInCart: string;
    clearCart: string;
    proceedToCheckout: string;
    checkoutInstructions: string;
    ussdInstructions: string;
    useMtnMobileMoney: string;
    uploadPaymentScreenshot: string;
    briefPurchaseDescription: string;
    submitOrder: string;
    emailInstructions: string;
    contactEmail: string;
  };

  // Fund/Donation
  fund: {
    supportOurMission: string;
    supportOurMissionTitle: string;
    supportOurMissionDesc: string;
    supportTheProject: string;
    helpUsPreserve: string;
    yourContributionHelps: string;
    donateNow: string;
    makeDonation: string;
    donate: string;
    optionalMessage: string;
    submitDonation: string;
    donationDescription: string;
    contactUs: string;
    becomeSponsor: string;
    mobileMoneyPayment: string;
    mobileMoneyDescription: string;
    mobileMoneyStep1: string;
    mobileMoneyStep2: string;
    mobileMoneyStep3: string;
    mobileMoneyStep4: string;
    bronzeSponsor: string;
    silverSponsor: string;
    goldSponsor: string;
    sponsorshipLevel: string;
    selectLevel: string;
    applyForSponsorship: string;
  };

  // Community
  community: {
    community: string;
    umweroChat: string;
    joinOurLearningCommunity: string;
    connectWithFellowLearners: string;
    joinDiscussion: string;
    shareProgress: string;
  };

  // Admin Dashboard
  admin: {
    adminDashboard: string;
    fullPlatformControl: string;
    totalUsers: string;
    totalLessons: string;
    totalDonations: string;
    platformHealth: string;
    excellent: string;
    allSystemsOperational: string;
    students: string;
    teachers: string;
    published: string;
    userManagement: string;
    manageUsersRoles: string;
    lessonManagement: string;
    viewEditDeleteLessons: string;
    fundManagement: string;
    viewManageDonations: string;
    platformSettings: string;
    configurePlatformSettings: string;
    changeRole: string;
    deleteAccount: string;
    joined: string;
    recentDonations: string;
    totalFunds: string;
    advertisementManagement: string;
    platformConfiguration: string;
  };

  // Teacher Dashboard
  teacher: {
    teacherDashboard: string;
    yourPermissions: string;
    comingSoon: string;
    createManageLessons: string;
    myLessons: string;
    completionRate: string;
    noLessonsYet: string;
    createFirstLesson: string;
    addNewLesson: string;
    createNewLesson: string;
    lessonTitle: string;
    durationMinutes: string;
    lessonContent: string;
    lessonContentJSON: string;
    enterJSONFormat: string;
    module: string;
    type: string;
    order: string;
    videoUrl: string;
    videoUrlOptional: string;
    thumbnailUrl: string;
    thumbnailUrlOptional: string;
    createLesson: string;
    preview: string;
    draft: string;
  };

  // Lesson Types
  lessonTypes: {
    word: string;
    sentence: string;
    grammar: string;
    culture: string;
  };

  // User Roles
  roles: {
    admin: string;
    teacher: string;
    student: string;
    user: string;
  };

  // Success Messages
  success: {
    successfullyCreated: string;
    successfullyUpdated: string;
    successfullyDeleted: string;
    lessonCreatedSuccess: string;
    lessonUpdatedSuccess: string;
    lessonDeletedSuccess: string;
    userDeletedSuccess: string;
    roleChangedSuccess: string;
  };

  // Error Messages
  errors: {
    errorOccurred: string;
    tryAgainLater: string;
  };

  // Cultural Content
  cultural: {
    umweroMovement: string;
    culturalRenaissance: string;
    ourMission: string;
    preservingKinyarwandaCulture: string;
    umweroAlphabetDescription: string;
    umweroQuote: string;
    ourVision: string;
    buildingCulturalSchool: string;
    visionDescription: string;
    schoolDescription: string;
    joinMovement: string;
    bePartOfRenaissance: string;
    movementParticipationDescription: string;
    startLearningUmwero: string;
    joinUsInPreserving: string;
    umweroMovementDescription: string;
    learnMoreAboutUmwero: string;
    culturalInsights: string;
    didYouKnow: string;
    umweroCircleMeaning: string;
    umweroCharacterMeaning: string;
    languagePreservation: string;
    umweroRoleInPreservation: string;
    cultureAndHistory: string;
    overview: string;
    historyOfWriting: string;
    umweroKabbalah: string;
    cultureHistoryIntro: string;
    importanceOfWriting: string;
    originOfWriting: string;
    firstWritingSystemsDate: string;
    writingAndPower: string;
    sargonExample: string;
    writingDefinition: string;
    writingImportance: string;
    needForUmwero: string;
    latinAlphabetDominance: string;
    umweroCreation: string;
    umweroReasoning: string;
    conclusion: string;
    umweroImportance: string;
    learnMoreUmwero: string;
  };

  // Tools
  tools: {
    virtualKeyboard: string;
    practiceTypingUmwero: string;
    practiceWorksheets: string;
    downloadPDFWorksheets: string;
    testYourKnowledge: string;
    openTool: string;
    watchNow: string;
  };

  // Footer
  footer: {
    allRightsReserved: string;
    privacyPolicy: string;
    termsOfService: string;
    followUs: string;
    quickLinks: string;
    resources: string;
    learningMaterials: string;
    supportUs: string;
    supportUmwero: string;
  };

  // Games
  games: {
    gamesAndQuizzes: string;
  };
}

// Helper type for nested key paths
export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<TranslationStructure>;

export type Translations = Record<Language, TranslationStructure>;
