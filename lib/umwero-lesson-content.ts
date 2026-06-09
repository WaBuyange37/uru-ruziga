import { kbDefinitions, kbFoundations, kbHome } from './umwero-knowledge-base'

type LessonCharacter = {
  vowel?: string
  consonant?: string
  umwero?: string
  title?: string
  description?: string
  culturalNote?: string
  meaning?: string
}

type LessonContent = {
  label: string
  cultureTitle: string
  culture: string
  meaningTitle: string
  meaning: string
  storyTitle: string
  story: string
}

const documentedContent: Record<string, LessonContent> = {
  a: {
    label: 'Letter A',
    cultureTitle: 'Inyambo and the sound of A',
    culture:
      'The letter A is connected to the Inyambo cow, especially the head and long graceful horns. In the Umwero story, this shape links a Kinyarwanda sound with a familiar cultural image.',
    meaningTitle: 'What to notice',
    meaning:
      'A is not only a mark on the page. It invites you to hear the vowel, see the Inyambo form, and remember how language can carry cultural memory.',
    storyTitle: 'Why this character matters',
    story:
      'Begin with A because it shows the heart of Umwero: sound, shape, and heritage working together. As you practice, look for the balance between the open horns and the rounded form below them.',
  },
  b: {
    label: 'Letter B',
    cultureTitle: 'The full cow image',
    culture:
      'The letter B is connected to the cow sound and to the larger visual idea of Inka in Rwandan life. Together with A, it points back to the cow as a cultural foundation.',
    meaningTitle: 'What to notice',
    meaning:
      'Inka is connected with milk, family life, prosperity, and social meaning. This character keeps that cultural root close to the writing lesson.',
    storyTitle: 'Why this character matters',
    story:
      'When you practice B, you are not only memorizing a symbol. You are seeing how Umwero turns a sound and a cultural reference into a written character.',
  },
  r: {
    label: 'Letter R',
    cultureTitle: 'Reverence and Rurema',
    culture:
      'The letter R is connected in the shared Umwero documentation to ideas of Rurema and Rugira, names associated with God. Its form is described through reverence and praise.',
    meaningTitle: 'What to notice',
    meaning:
      'This character shows how Umwero can connect a Kinyarwanda sound with a spiritual and cultural idea, not only with pronunciation.',
    storyTitle: 'Why this character matters',
    story:
      'As you practice R, pay attention to posture and direction. The character carries a sense of respect, making the act of writing feel deliberate.',
  },
  m: {
    label: 'Letter M',
    cultureTitle: 'Motherhood, lineage, and continuity',
    culture:
      'The letter M is connected to maternity, creation, lineage, and the umbilical cord. It carries the idea that identity is passed from one generation to the next.',
    meaningTitle: 'What to notice',
    meaning:
      'M helps learners see writing as a bridge between sound and belonging. Its meaning points toward family, ancestry, and continuity.',
    storyTitle: 'Why this character matters',
    story:
      'When you write M, think about connection: a line from parent to child, from memory to language, and from spoken Kinyarwanda to written form.',
  },
  c: {
    label: 'Letter C',
    cultureTitle: 'Path, movement, and understanding',
    culture:
      'The shared Umwero documentation connects C or CH with Kinyarwanda expressions such as Guca akenge and Guca mu nzira, carrying ideas of movement, passage, and understanding.',
    meaningTitle: 'What to notice',
    meaning:
      'This character reminds learners that writing can hold everyday language images, not only isolated sounds.',
    storyTitle: 'Why this character matters',
    story:
      'As you practice C, follow the movement of the form. Let the character feel like a path: a sound you travel through with your hand.',
  },
  ch: {
    label: 'CH sound',
    cultureTitle: 'Path, movement, and understanding',
    culture:
      'The shared Umwero documentation connects C or CH with Kinyarwanda expressions such as Guca akenge and Guca mu nzira, carrying ideas of movement, passage, and understanding.',
    meaningTitle: 'What to notice',
    meaning:
      'This character reminds learners that writing can hold everyday language images, not only isolated sounds.',
    storyTitle: 'Why this character matters',
    story:
      'As you practice CH, follow the movement of the form. Let the character feel like a path: a sound you travel through with your hand.',
  },
  o: {
    label: 'Letter O',
    cultureTitle: 'The circle and continuity',
    culture:
      'The circle, Uruziga, is connected to continuity, unity, beginning, and end. It is also tied to the idea of Imana having no beginning and no end.',
    meaningTitle: 'What to notice',
    meaning:
      'O gives learners a simple way to see one of Umwero’s core visual ideas: a complete form that returns to itself.',
    storyTitle: 'Why this character matters',
    story:
      'When you practice O, slow down and complete the circle. The lesson is not only shape accuracy; it is learning how continuity becomes visible.',
  },
}

export function getUmweroLessonContent(character: LessonCharacter): LessonContent {
  const key = getCharacterKey(character)
  if (key && documentedContent[key]) return documentedContent[key]

  const label = character.title || (key ? `Character ${key.toUpperCase()}` : 'This character')

  return {
    label,
    cultureTitle: 'Sound, writing, and heritage',
    culture:
      `${kbDefinitions.umwero} ${kbHome.whyWriting}`,
    meaningTitle: 'What to notice',
    meaning:
      character.meaning?.trim() ||
      'This lesson helps you connect the character shape with a Kinyarwanda sound and the larger purpose of Umwero.',
    storyTitle: 'Why this character matters',
    story:
      `Every language tells a story. Practice this character as one step in learning how Kinyarwanda can be written through symbols shaped by sound, identity, and culture.`,
  }
}

export function getFoundationSummary() {
  return kbFoundations.map((foundation) => `${foundation.name}: ${foundation.title}`).join(' • ')
}

function getCharacterKey(character: LessonCharacter) {
  const raw = character.vowel || character.consonant || character.title || ''
  const normalized = raw.toLowerCase().trim()
  if (normalized.includes('ch')) return 'ch'
  if (normalized.length > 1 && documentedContent[normalized]) return normalized
  return normalized.charAt(0)
}
