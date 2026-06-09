export const kbSources = {
  visual: "Umwero Visual Cultural (1).pdf",
  connecting: "UmweroConnectingCul.pdf",
}

export const kbDefinitions = {
  umwero:
    "Umwero is a writing system created for Kinyarwanda, inspired by the language's own sounds, identity, and Rwandan cultural heritage.",
  uruziga:
    "Uruziga is where you learn Umwero through guided lessons, writing practice, cultural exploration, and learning tools.",
  creator: "Umwero was created by Kwizera Mugisha.",
  purpose:
    "Umwero was created to help people learn, preserve, and share Kinyarwanda through writing, education, and culture.",
}

export const kbTimeline = [
  {
    date: "2017",
    title: "Kinyarwanda writing questions become clearer",
    body:
      "After secondary studies, Kwizera Mugisha visited his elder brothers in Nairobi and noticed how related Bantu languages used different writing choices for sounds that Kinyarwanda also needed to represent.",
    source: `${kbSources.connecting}, creation history`,
  },
  {
    date: "2019",
    title: "The circle becomes the starting point",
    body:
      "In his first year of Computer Science, Kwizera began shaping Umwero from the idea that a circle does not change, connecting the writing system to Imana and the idea of beginning and end.",
    source: `${kbSources.connecting}, creation history`,
  },
  {
    date: "Design foundation",
    title: "Characters are tied to sound and culture",
    body:
      "Some characters were intentionally connected to Rwandan cultural symbols, while others were first created intuitively and later found cultural meaning.",
    source: `${kbSources.connecting}, design notes`,
  },
]

export const kbFoundations = [
  {
    name: "Imana",
    title: "God and the circle",
    body:
      "In Rwandan cultural thought, Imana is connected to creation and continuity. The circle, with no beginning and no end, carries that idea into the visual foundation of Umwero.",
    source: `${kbSources.connecting}, Imana section`,
  },
  {
    name: "Inka",
    title: "Cattle, sustenance, and Inyambo beauty",
    body:
      "Inka is presented as a central root of Rwandan culture: a symbol of prosperity, milk, family life, and social meaning. The Inyambo cow informs the visual meaning of the letter A.",
    source: `${kbSources.connecting}, Inka section; ${kbSources.visual}, letter A section`,
  },
  {
    name: "Ingoma",
    title: "Drum, throne, and kingdom",
    body:
      "Ingoma is described as more than a drum; it also carries the meaning of kingdom and throne. Umwero connects this idea to cultural authority and naming marks.",
    source: `${kbSources.connecting}, Ingoma section`,
  },
]

export const kbCultureNotes = [
  {
    title: "Circle Symbolism",
    body:
      "The circle, Uruziga, speaks of continuity, unity, beginning, and end. Its form helps Umwero connect writing with deeper ideas of origin, return, and togetherness.",
    source: `${kbSources.connecting}, Imana and family-circle sections; ${kbSources.visual}, circle section`,
  },
  {
    title: "Inyambo Symbolism",
    body:
      "The long, graceful horns of the Inyambo cow are used as a cultural reference for beauty and elegance, and they shape the visual meaning of the Umwero letter A.",
    source: `${kbSources.connecting}, Inka section; ${kbSources.visual}, letter A section`,
  },
  {
    title: "Letter A",
    body:
      "The letter A reflects the head and horns of the Inyambo cow and carries a sound connection to the cow's voice.",
    source: `${kbSources.visual}, letter A section; ${kbSources.connecting}, Inka section`,
  },
  {
    title: "Language and Heritage",
    body:
      "Kinyarwanda carries stories, names, songs, memory, and community. Umwero was created so writing could carry that same sense of identity, sound, and cultural meaning.",
    source: `${kbSources.connecting}, culture and conclusion sections`,
  },
]

export const kbHome = {
  hero:
    "A writing system created to represent Kinyarwanda while preserving and celebrating Rwandan culture, identity, and linguistic heritage.",
  whyWriting:
    "Language carries the memory of a people. Through stories, songs, names, and traditions, culture is passed from one generation to the next. Umwero was created to give Kinyarwanda a writing system inspired by its own sounds, identity, and cultural heritage.",
  nextAction:
    "Learn at your own pace through guided lessons, writing practice, and cultural exploration.",
}

export const kbFunding = {
  mission:
    "Umwero is more than a collection of symbols. It is an effort to celebrate Kinyarwanda through writing, education, and culture.",
  preservation:
    "Your support helps learners access lessons, writing practice, cultural references, and tools that make Umwero easier to study and share.",
  technology:
    "Uruziga helps bring Umwero into everyday learning through practice tools, typing support, and a clear path for learners of different backgrounds.",
}

export const kbSeo = {
  siteTitle: "Uruziga - Learn Umwero for Kinyarwanda",
  siteDescription:
    "Learn Umwero, a writing system created by Kwizera Mugisha to represent Kinyarwanda while preserving Rwandan culture, identity, and linguistic heritage.",
  aboutTitle: "About Umwero and Uruziga",
  cultureTitle: "Umwero Culture and History",
  fundTitle: "Fund Uruziga",
}

export const kbTraceability = [
  {
    area: "Definitions",
    old: "Generic references to an Umwero movement or revolutionary script.",
    new: "Umwero is the writing system; Uruziga is the educational platform.",
    source: `${kbSources.visual}, background and purpose; user requirement for Uruziga platform definition`,
  },
  {
    area: "Cultural foundations",
    old: "Broad cultural preservation claims without structure.",
    new: "Imana, Inka, and Ingoma are presented as the three cultural foundations.",
    source: `${kbSources.connecting}, cultural roots section`,
  },
  {
    area: "Letter symbolism",
    old: "General culture cards and unsourced symbolism.",
    new: "Circle, Inyambo, and letter A explanations come from the Knowledge Base.",
    source: `${kbSources.connecting}, Imana/Inka sections; ${kbSources.visual}, letter A and circle sections`,
  },
  {
    area: "Funding",
    old: "Donation-first and invented impact framing.",
    new: "Mission, preservation, education, and platform work appear before donation options.",
    source: `${kbSources.visual}, purpose section; ${kbSources.connecting}, conclusion`,
  },
]
