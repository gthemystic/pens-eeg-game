export interface Answer {
  id: string
  text: string
  isCorrect: boolean
}

export interface Question {
  id: string
  question: string
  answers: Answer[]
  explanation: string
  timeLimit: number // seconds
  points: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  questions: Question[]
  plays: number
  participants: number
}

export const eegQuizzes: Quiz[] = [
  {
    id: 'eeg-essentials-1',
    title: 'EEG Essentials: Interpreting Brainwave Patterns',
    description:
      'Sharpen your neurology skills with key questions on EEG interpretation — from spikes and sharp waves to diffuse slowing and asymmetry. Ideal for trainees and clinicians refining clinical relevance beyond simple alpha vs beta comparisons.',
    category: 'EEG Interpretation',
    difficulty: 'Intermediate',
    plays: 47,
    participants: 312,
    /**
     * Stems & answer choices from Kahoot PDF export:
     * `EEG Essentials_ Interpreting Brainwave Patterns - Details - Kahoot.pdf`
     * Order matches the PDF (questions 1–10). Correct flags follow clinical best practice.
     */
    questions: [
      {
        id: 'q1',
        question: 'What do "spikes" on an EEG suggest?',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: 'Normal brain activity', isCorrect: false },
          { id: 'b', text: 'Sleep pattern', isCorrect: false },
          { id: 'c', text: 'Epileptiform activity', isCorrect: true },
          { id: 'd', text: 'Ask a doctor', isCorrect: false },
        ],
        explanation:
          'Spikes are sharp transients that, in the right clinical context, represent epileptiform activity rather than normal background or sleep architecture alone.',
      },
      {
        id: 'q2',
        question:
          'A provider starts focusing heavily on alpha vs beta waves... what\'s most clinically useful?',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: 'Memorize all wave types', isCorrect: false },
          { id: 'b', text: 'Focus on clinical interpretation', isCorrect: true },
          { id: 'c', text: 'Calculate frequencies', isCorrect: false },
          { id: 'd', text: 'Ask a doctor', isCorrect: false },
        ],
        explanation:
          'Clinically, prioritize overall pattern (focal vs diffuse), epileptiform activity, and correlation with history—not rote alpha/beta trivia.',
      },
      {
        id: 'q3',
        question: 'Focal EEG findings (e.g., right occipital spikes) should prompt:',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: 'Reassurance only', isCorrect: false },
          { id: 'b', text: 'Behavioral therapy', isCorrect: false },
          { id: 'c', text: 'Brain MRI', isCorrect: true },
          { id: 'd', text: 'Ask a doctor', isCorrect: false },
        ],
        explanation:
          'Focal epileptiform abnormalities warrant structural evaluation (MRI) to assess for lesions such as dysplasia, prior stroke, or tumor.',
      },
      {
        id: 'q4',
        question: 'Sharp waves on EEG are best interpreted as:',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: 'Normal variant', isCorrect: false },
          { id: 'b', text: 'Epileptiform abnormality', isCorrect: true },
          { id: 'c', text: 'Muscle artifact', isCorrect: false },
          { id: 'd', text: 'Ask a doctor', isCorrect: false },
        ],
        explanation:
          'Sharp waves are epileptiform transients (typically longer than classic spikes) and are interpreted as abnormal unless clearly mimic artifact or a benign variant.',
      },
      {
        id: 'q5',
        question:
          'rEEG: showed presence of low voltage spikes over the right occipital region. 24hr EEG: Normal. How can you explain to the parent?',
        timeLimit: 30,
        points: 1500,
        answers: [
          {
            id: 'a',
            text: 'Your child has epilepsy and needs treatment immediately',
            isCorrect: false,
          },
          {
            id: 'b',
            text: 'Small finding on short EEG; longer study normal; will monitor closely',
            isCorrect: true,
          },
          {
            id: 'c',
            text: 'The EEG is completely normal, so there is no concern.',
            isCorrect: false,
          },
          { id: 'd', text: 'Ask a doctor', isCorrect: false },
        ],
        explanation:
          'Epileptiform activity can be intermittent. A longer study that is normal reduces concern but does not erase the short study; counseling should allow follow-up and clinical correlation.',
      },
      {
        id: 'q6',
        question: 'Diffuse slowing on EEG should make you think:',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: 'ADHD', isCorrect: false },
          { id: 'b', text: 'Normal variant', isCorrect: false },
          { id: 'c', text: 'Encephalopathy / global dysfunction', isCorrect: true },
          { id: 'd', text: 'Ask a doctor', isCorrect: false },
        ],
        explanation:
          'Diffuse slowing usually reflects global cerebral dysfunction—toxic-metabolic, infection, hypoxia, medications, and related encephalopathies belong in the differential.',
      },
      {
        id: 'q7',
        question: 'Asymmetric EEG findings suggest:',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: 'Whole brain issue', isCorrect: false },
          { id: 'b', text: 'Normal EEG', isCorrect: false },
          { id: 'c', text: 'Focal brain abnormality', isCorrect: true },
          { id: 'd', text: 'Ask a doctor', isCorrect: false },
        ],
        explanation:
          'True asymmetry (after technical factors are ruled out) points to focal structural or functional pathology on the involved side.',
      },
      {
        id: 'q8',
        question: 'What does "low voltage" on an EEG generally indicate?',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: 'Strong epileptiform activity', isCorrect: false },
          { id: 'b', text: 'Reduced amplitude brain activity', isCorrect: true },
          { id: 'c', text: 'Always abnormal', isCorrect: false },
          { id: 'd', text: 'Ask a doctor', isCorrect: false },
        ],
        explanation:
          'Low voltage generally describes reduced amplitude signal from the brain (or attenuation from scalp/skull); it is not specific and is not synonymous with “always abnormal.”',
      },
      {
        id: 'q9',
        question:
          '7yo w/ cognitive regression has EEG showing nearly continuous spike wave activity during sleep. What does this indicate?',
        timeLimit: 30,
        points: 1500,
        answers: [
          {
            id: 'a',
            text: 'Continuous spike-wave during sleep suggests encephalopathy; treat promptly',
            isCorrect: true,
          },
          {
            id: 'b',
            text: 'Continuous spike-wave during sleep is normal in all children — reassurance only',
            isCorrect: false,
          },
          {
            id: 'c',
            text: 'This pattern is only seen in autism — not epilepsy — no medications needed',
            isCorrect: false,
          },
          { id: 'd', text: 'Ask a doctor', isCorrect: false },
        ],
        explanation:
          'Near-continuous slow spike-wave in sleep with cognitive regression fits ESES/CSWS spectrum disorders and warrants urgent epilepsy-directed evaluation and treatment.',
      },
      {
        id: 'q10',
        question:
          'Infant w/ developmental regression has an EEG showing multifocal independent spike discharges. How should you counsel?',
        timeLimit: 30,
        points: 1500,
        answers: [
          {
            id: 'a',
            text: 'Multifocal spikes suggest severe encephalopathy; needs full workup now',
            isCorrect: true,
          },
          {
            id: 'b',
            text: 'Multifocal spikes are completely normal in all infants under one year',
            isCorrect: false,
          },
          {
            id: 'c',
            text: 'This pattern indicates benign sleep myoclonus that resolves by age two',
            isCorrect: false,
          },
          { id: 'd', text: 'Ask a doctor', isCorrect: false },
        ],
        explanation:
          'Multifocal independent spikes with regression are worrisome for an epileptic encephalopathy until proven otherwise—prompt specialist evaluation and workup are indicated.',
      },
    ],
  },
  {
    id: 'eeg-normal-variants',
    title: 'Normal EEG Variants & Artifacts',
    description:
      'Learn to distinguish true epileptiform activity from benign normal variants and artifacts that can mimic pathology. Essential for avoiding over-diagnosis.',
    category: 'EEG Variants',
    difficulty: 'Advanced',
    plays: 23,
    participants: 156,
    questions: [
      {
        id: 'v1',
        question: 'POSTS (Positive Occipital Sharp Transients of Sleep) are:',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: 'Pathological epileptiform discharges', isCorrect: false },
          { id: 'b', text: 'Benign normal variant seen in NREM sleep', isCorrect: true },
          { id: 'c', text: 'Sign of occipital lobe tumor', isCorrect: false },
          { id: 'd', text: 'Marker of infantile spasms', isCorrect: false },
        ],
        explanation:
          'POSTS are positive polarity sharp waves in the occipital region seen during NREM sleep. They are a normal variant and should not be interpreted as epileptiform.',
      },
      {
        id: 'v2',
        question: 'Which of the following is a benign EEG variant that can mimic epileptiform activity?',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: '3 Hz spike-wave', isCorrect: false },
          { id: 'b', text: 'Wicket spikes', isCorrect: true },
          { id: 'c', text: 'Hypsarrhythmia', isCorrect: false },
          { id: 'd', text: 'Burst suppression', isCorrect: false },
        ],
        explanation:
          'Wicket spikes are benign temporal sharp waves seen in drowsiness/sleep in adults. They can look like focal temporal epileptiform discharges but lack after-coming slow wave and have a wicket shape.',
      },
    ],
  },
  {
    id: 'pediatric-epilepsy-syndromes',
    title: 'Pediatric Epilepsy Syndromes',
    description:
      'Test your knowledge of pediatric epilepsy syndromes — from febrile seizures to Dravet syndrome, Lennox-Gastaut, and beyond.',
    category: 'Epilepsy Syndromes',
    difficulty: 'Beginner',
    plays: 89,
    participants: 541,
    questions: [
      {
        id: 's1',
        question: 'What is the characteristic EEG finding in West syndrome (Infantile Spasms)?',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: '3 Hz generalized spike-wave', isCorrect: false },
          { id: 'b', text: 'Hypsarrhythmia', isCorrect: true },
          { id: 'c', text: 'Focal temporal spikes', isCorrect: false },
          { id: 'd', text: 'Sleep spindle excess', isCorrect: false },
        ],
        explanation:
          'Hypsarrhythmia — a chaotic, high-amplitude, disorganized background with multifocal spikes — is the hallmark interictal EEG pattern of West syndrome (Infantile Spasms).',
      },
      {
        id: 's2',
        question: 'Lennox-Gastaut syndrome is characterized by which EEG pattern?',
        timeLimit: 20,
        points: 1000,
        answers: [
          { id: 'a', text: 'Hypsarrhythmia', isCorrect: false },
          { id: 'b', text: 'Slow (< 2.5 Hz) generalized spike-wave and recruiting rhythms', isCorrect: true },
          { id: 'c', text: '3 Hz generalized spike-wave only', isCorrect: false },
          { id: 'd', text: 'Normal EEG between seizures', isCorrect: false },
        ],
        explanation:
          'LGS is defined by the triad of multiple seizure types, cognitive impairment, and characteristic EEG with slow generalized spike-wave (< 2.5 Hz) and generalized paroxysmal fast activity during sleep.',
      },
    ],
  },
]

export const getQuizById = (id: string): Quiz | undefined =>
  eegQuizzes.find((q) => q.id === id)
