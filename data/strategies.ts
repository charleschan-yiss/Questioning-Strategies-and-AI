
import { StrategyNode } from '../types';

const cel5dStrategies: StrategyNode[] = [
  {
    id: 'cel-purpose',
    label: 'Purpose',
    description: 'Standards, learning targets, and teaching points.',
    fullDefinition: 'Setting clear, standards-based learning targets and teaching points that are communicated to students.',
    usage: 'Use to ensure the lesson is meaningful, relevant, and based on grade-level standards.',
    pedagogicalValue: 'Ensures students understand what they are learning, why they are learning it, and how they will know they have learned it.'
  },
  {
    id: 'cel-engagement',
    label: 'Student Engagement',
    description: 'Intellectual work, strategies, and talk.',
    fullDefinition: 'Students engaged in substantive intellectual work, owning their learning through talk and active strategies.',
    usage: 'Design activities where students do the thinking work (high cognitive demand).',
    pedagogicalValue: 'Moves locus of control to students; promotes equitable and purposeful participation.'
  },
  {
    id: 'cel-curriculum',
    label: 'Curriculum & Pedagogy',
    description: 'Materials, teaching approaches, and scaffolds.',
    fullDefinition: 'Using instructional materials and approaches that support learning targets and navigate disciplinary habits of thinking.',
    usage: 'Select scaffolds that support the target concepts and gradually release responsibility.',
    pedagogicalValue: 'Ensures access for all students through culturally responsive and academically relevant materials.'
  },
  {
    id: 'cel-assessment',
    label: 'Assessment for Learning',
    description: 'Self-assessment, feedback, and adjustments.',
    fullDefinition: 'Using formative assessment to inform instruction and providing feedback to students.',
    usage: 'Include checks for understanding and opportunities for students to assess their own work.',
    pedagogicalValue: 'Allows for real-time adjustments to meet student needs and increases student ownership.'
  },
  {
    id: 'cel-environment',
    label: 'Classroom Environment',
    description: 'Physical arrangement, routines, and culture.',
    fullDefinition: 'Creating a culture of inclusivity, equity, and accountability for learning.',
    usage: 'Plan routines that facilitate student responsibility and independence.',
    pedagogicalValue: 'Establishes a safe and productive space for risk-taking and collaboration.'
  }
];

const questioningStrategies: StrategyNode[] = [
  {
    id: 'general-strategies',
    label: 'General Strategies',
    description: 'Core techniques to manage classroom talk and engagement.',
    children: [
      { 
        id: 'thinking-time', 
        label: 'Thinking Time', 
        description: 'Waiting 15-30 seconds before seeking an answer.',
        fullDefinition: 'Consciously waiting for a pupil or class to think through an answer (before you break the silence) e.g., 15–30secs.',
        usage: 'Provide time between setting the question and requiring an answer. Sometimes alert pupils to the approach and the time available to develop an answer.',
        pedagogicalValue: 'Prompts depth of thought and increases levels of challenge. Ensures all pupils have a view or opinion to share before an answer is sought.'
      },
      { 
        id: 'time-out', 
        label: 'Time Out', 
        description: 'Time provided for thinking and talking partners.',
        fullDefinition: 'Time provided for thinking and talking partners, before seeking answers.',
        usage: 'Allow pupils to discuss with a partner before asking for a public response.',
        pedagogicalValue: 'Pupils have thinking time, actively think and collaborate to form answers.'
      },
      { 
        id: 'no-hands', 
        label: 'No Hands Questioning', 
        description: 'Teacher selects who answers; no hand raising.',
        fullDefinition: 'Pupils aware that those required to give an answer will be selected by the teacher. Teachers alert them to this as questions are asked.',
        usage: 'Use the "no hands up" rule. Linked to "thinking time".',
        pedagogicalValue: 'Improves engagement and challenges all pupils to think. When linked to Thinking Time, pupils share ideas and "position" their own views in relation to others.'
      },
      { 
        id: 'basketball', 
        label: 'Basketball Questioning', 
        description: 'Moving questions and discussions between pupils.',
        fullDefinition: 'Teacher establishes movement of ideas and responses around the class. Builds on other pupils’ ideas and comments.',
        usage: 'Move questions and discussions between pupils rather than back to the teacher (Ping-Pong). Accept "half-formed" ideas.',
        pedagogicalValue: 'Engages more pupils. Stops teacher being focus for all questioning. Develops connected thinking and development of ideas.'
      },
      { 
        id: 'conscripts-volunteers', 
        label: 'Conscripts and Volunteers', 
        description: 'A planned mix of selecting students and accepting volunteers.',
        fullDefinition: 'Using a planned mix of "conscripts" (selected students) and "volunteers".',
        usage: 'Teacher selects answers from those who volunteer an answer and an equal amount of those who do not.',
        pedagogicalValue: 'Enhances engagement and challenge for all.'
      },
      { 
        id: 'phone-a-friend', 
        label: 'Phone a Friend', 
        description: 'Removes stress by allowing students to nominate a helper.',
        fullDefinition: 'Those who cannot answer are allowed to nominate a fellow pupil to suggest an answer on their behalf.',
        usage: 'The student asks a peer for help, but they still have to provide their own answer, perhaps building on the suggestion.',
        pedagogicalValue: 'Encourages whole-class listening and participation. Removes stress and builds self-esteem.'
      },
      { 
        id: 'hot-seating', 
        label: 'Hot-seating', 
        description: 'A pupil takes several questions from the class.',
        fullDefinition: 'A pupil is placed in the "hot-seat" to take several questions from the class and teacher.',
        usage: 'Select a student to answer in-depth questions on a topic or persona.',
        pedagogicalValue: 'Encourages listening for detail and provides challenge.'
      },
      { 
        id: 'mantle-expert', 
        label: 'Mantle of the Expert', 
        description: 'Student wears the cloak of the expert.',
        fullDefinition: 'A student wears the cloak of the expert to answer questions from the class.',
        usage: 'Assign a student a role of authority or expertise on the subject matter.',
        pedagogicalValue: 'Builds self-esteem through opportunity to share detailed knowledge.'
      },
      { 
        id: 'preview', 
        label: 'Preview', 
        description: 'Previewing questions in advance.',
        fullDefinition: 'Questions are shared/displayed before being asked, or at the start of the lesson.',
        usage: 'Display questions on the board at the start of the unit or lesson.',
        pedagogicalValue: 'Signals the big concepts and learning of the lesson.'
      },
      { 
        id: 'pair-rehearsal', 
        label: 'Pair Rehearsal', 
        description: 'Pairs discuss and agree responses together.',
        fullDefinition: 'Pairs of pupils are able to discuss and agree responses to questions together.',
        usage: 'Give specific time for pairs to formulate a joint answer.',
        pedagogicalValue: 'Encourages interaction, engagement and depth.'
      },
      { 
        id: 'eavesdropping', 
        label: 'Eavesdropping', 
        description: 'Listening to groups to target specific questions.',
        fullDefinition: 'Listen in to group discussions and target specific questions to groups and individuals.',
        usage: 'Circulate while students talk, listen, and then use that info to ask targeted questions.',
        pedagogicalValue: 'Facilitates informed differentiation as teachers use what they overhear to modify planning and further questioning.'
      },
      { 
        id: '5ws', 
        label: '5 Ws', 
        description: 'Who, What, Where, When, Why.',
        fullDefinition: 'Modeling simple exploratory questions to gather information.',
        usage: 'Teacher models the use of Who, What, Where, When and Why to set out a simple information gathering response.',
        pedagogicalValue: 'Encourages students to rehearse enquiry and comprehension, can extend into reasoning and hypothesis.'
      },
      { 
        id: 'high-challenge', 
        label: 'High Challenge', 
        description: 'Phrasing questions to concentrate on Bloom’s higher levels.',
        fullDefinition: 'Phrasing questions carefully to concentrate on Bloom’s Taxonomy higher challenge areas (analysis, synthesis, evaluation, creativity).',
        usage: 'Questions must be pre-planned, as very difficult to invent during a lesson.',
        pedagogicalValue: 'Provides high challenge thinking, requiring more careful thought, perhaps collaborative thinking and certainly longer more detailed answers.'
      },
      { 
        id: 'staging', 
        label: 'Staging / Sequencing', 
        description: 'Questions with increasing levels of challenge.',
        fullDefinition: 'Increasing the level of challenge with each question, moving from low to higher-order questioning.',
        usage: 'Plan a sequence of questions that climb the cognitive ladder.',
        pedagogicalValue: 'Helps pupils to recognise the range of possible responses and to select appropriately.'
      },
      { 
        id: 'big-questions', 
        label: 'Big Questions', 
        description: 'Substantial, thought provoking questions.',
        fullDefinition: 'Big questions cannot be easily answered by students when the question is posed. They are often set at the beginning of the lesson.',
        usage: 'Set a question like "Where are we from?" that can only be answered by the end of the lesson using all contributions.',
        pedagogicalValue: 'Develops deeper and more profound thinking. Often moral issues or speculative.'
      },
      { 
        id: 'focus-questioning', 
        label: 'Focus Questioning', 
        description: 'Leading students through steps of thinking.',
        fullDefinition: 'When students struggle to answer bigger or more complex questioning, the teacher can model or lead the thinking by asking Focus questions.',
        usage: 'Ask smaller questions to lead the student through the steps of the thinking.',
        pedagogicalValue: 'Develops confidence and the sequencing of small steps in thinking and response.'
      },
      { 
        id: 'fat-questions', 
        label: 'Fat Questions', 
        description: 'Seeking a minimum answer length.',
        fullDefinition: 'Pupils are not allowed to answer a question using less than e.g. 15 words or using a particular word or phrase.',
        usage: 'Require an extended answer or complete sentence.',
        pedagogicalValue: 'Develops speaking and reasoning skills, the correct use of critical and technical language.'
      },
      { 
        id: 'skinny-questions', 
        label: 'Skinny Questions', 
        description: 'Everyday questions with fixed/specific answers.',
        fullDefinition: 'A traditional approach to Q&A asking everyday questions with a fixed or specific answer (Yes/No/Number).',
        usage: 'Use for quick checks of knowledge.',
        pedagogicalValue: 'Challenge level is low. Mostly knowledge and comprehension based. Does not develop thinking or reasoning.'
      },
      { 
        id: 'signal-questions', 
        label: 'Signal Questions', 
        description: 'Guiding the answer via signals.',
        fullDefinition: 'Providing signals to pupils about the kind of answer that would best fit the question being asked.',
        usage: 'Teacher responds to pupils attempt to answer, by signaling and guiding the answers.',
        pedagogicalValue: 'Moves pupils from existing knowledge (unsorted) to organized understanding.'
      },
      { 
        id: 'partial-answer', 
        label: 'Seek a Partial Answer', 
        description: 'Ask a pupil who will provide a partly formed answer.',
        fullDefinition: 'In the context of asking difficult whole class questions, deliberately ask a pupil who will provide only a partly formed answer.',
        usage: 'Use this to promote collective engagement and lead into Basketball questioning.',
        pedagogicalValue: 'Excellent for building understanding from pupil-based language. Develops self-esteem whilst moderating risk.'
      },
      { 
        id: 'key-questions', 
        label: 'Developing Key Questions', 
        description: 'Students identify their own essential questions.',
        fullDefinition: 'Teachers encourage students to identify their own essential or ‘Key’ questions that should be asked.',
        usage: 'Ask students what questions they think are most important to ask about the topic.',
        pedagogicalValue: 'Encourages students to form and prioritise the most essential questions to be asked when analysing information.'
      },
       { 
        id: 'probing-questions', 
        label: 'Probing Questions', 
        description: 'Encourage students to say more or refine.',
        fullDefinition: 'Seek to encourage students to speak and express themselves, say more about their learning and add more detail.',
        usage: 'Ask: "When does that principle apply?", "Always?", "Would you say then that you disagree?"',
        pedagogicalValue: 'Teachers can Probe a student to think and express a view in greater detail.'
      },
      { 
        id: 'stretching-questions', 
        label: 'Stretching Questions', 
        description: 'Set the bar high at the limit of ability.',
        fullDefinition: 'Questions that seek answers at the limit of ability, knowledge or understanding.',
        usage: 'Ask for a transformation of info, a metaphor, or an analogy.',
        pedagogicalValue: 'Requires extended answers that apply a principle or formula.'
      }
    ]
  },
  {
    id: 'mnemonics',
    label: 'Mnemonics & Frameworks',
    description: 'Scaffolds to encourage exploration of ideas.',
    children: [
      { 
        id: 'pose-pause-pounce-bounce', 
        label: 'Pose, Pause, Pounce & Bounce', 
        description: 'Flexible strategy for structuring questioning.',
        fullDefinition: 'Pose (ask big question), Pause (thinking time), Pounce (select student, no hands), Bounce (pass answer to another).',
        usage: 'Use this sequence to ensure every stage of the questioning process is carefully considered.',
        pedagogicalValue: 'Encourages all to add their views or extend the depth and breadth of answers.'
      },
      { 
        id: 'claps', 
        label: 'CLAPS (Analysis)', 
        description: 'Mnemonic to promote analysis thinking.',
        fullDefinition: 'Context, Language, Audience, Purpose, Style.',
        usage: 'Use to build effective and complete analysis of a text, spoken presentation or media.',
        pedagogicalValue: 'Models how analysis thinking should be structured.'
      },
      { 
        id: 'deal', 
        label: 'DEAL (Science)', 
        description: 'Mnemonic to form questions in science.',
        fullDefinition: 'Describe (what you see), Explain (what you think happened), Analyse (draw conclusions), Link (with previous knowledge).',
        usage: 'Use when exploring experiments or phenomena.',
        pedagogicalValue: 'Develops information processing, reasoning, and the ability to apply what has been learnt.'
      },
      { 
        id: 'satip', 
        label: 'SATIP (Reading)', 
        description: 'Mnemonic to frame text reading questions.',
        fullDefinition: 'Sense (meaning), Audience (tone), Technique (effects), Intentions (purpose), Personal opinion.',
        usage: 'Strategy for beginning to engage with reading any text.',
        pedagogicalValue: 'Develops a sense of meaning before using Bloom’s Taxonomy for more challenging questions.'
      },
      { 
        id: 'cpfm', 
        label: 'CPFM (Art/Images)', 
        description: 'Content, Process, Form and Mood.',
        fullDefinition: 'Content (subject matter), Process (how it was made), Form (formal elements like color/shape), Mood (emotion).',
        usage: 'Use as a prompt to visual thinking and identification while looking at an image or creative outcome.',
        pedagogicalValue: 'Promotes enquiry, analysis, reasoning, synthesis, reflection and emotional intelligence.'
      },
      { 
        id: 'scamper', 
        label: 'SCAMPER (Creativity)', 
        description: 'Technique to extend thinking and imagination.',
        fullDefinition: 'Substitute, Combine, Adapt, Modify/Magnify, Put to other purpose, Eliminate, Reverse.',
        usage: 'Use directed questions to come up with new ideas or change an existing idea.',
        pedagogicalValue: 'Provides real imaginative opportunities to extend work. Useful for creative writing and role play.'
      }
    ]
  },
  {
    id: 'cort-tools',
    label: 'CoRT Tools (De Bono)',
    description: 'Thinking Tools for Independent Learning.',
    children: [
      { 
        id: 'pmi', 
        label: 'PMI', 
        description: 'Plus, Minus, Interesting.',
        fullDefinition: 'Plus (good things), Minus (bad things), Interesting (worthy of further thought).',
        usage: 'Classify a list of information into these three categories.',
        pedagogicalValue: 'Forces us to scan in situations where otherwise we should deem scanning unnecessary.'
      },
      { 
        id: 'ebs', 
        label: 'EBS', 
        description: 'Examine Both Sides.',
        fullDefinition: 'What really is the other point of view? The exploration is neutral.',
        usage: 'Explore/empathise with ideas behind different viewpoints.',
        pedagogicalValue: 'Explore differences in viewpoint and opinion.'
      },
      { 
        id: 'ago', 
        label: 'AGO', 
        description: 'Aims, Goals and Objectives.',
        fullDefinition: 'Why am I doing this? An attention directing thinking tool.',
        usage: 'Use to review/define learning objectives & outcomes.',
        pedagogicalValue: 'Self reflection and probing by teacher to foster self evaluation and target setting.'
      },
      { 
        id: 'caf', 
        label: 'CAF', 
        description: 'Consider All Factors.',
        fullDefinition: 'What is involved, what might matter? Look broadly around an issue.',
        usage: 'Consider all factors without attempting to evaluate them yet.',
        pedagogicalValue: 'Probe and analyse viewpoints of people and explore evidence from every perspective.'
      },
      { 
        id: 'apc', 
        label: 'APC', 
        description: 'Alternatives, Possibilities, Choices.',
        fullDefinition: 'Making a deliberate effort to generate alternatives at that particular point.',
        usage: 'Collaborative shared thinking & brainstorming.',
        pedagogicalValue: 'Probe & analyse each Alternative, Possibility and Choice.'
      },
      { 
        id: 'opv', 
        label: 'OPV', 
        description: 'Other People’s Views.',
        fullDefinition: 'The thinker tries to put themselves in the other person’s shoes.',
        usage: 'Empathy based paired/group talk to review evidence.',
        pedagogicalValue: 'Analyse evidence for each person at a time and what informs their viewpoint.'
      },
      { 
        id: 'adi', 
        label: 'ADI', 
        description: 'Agreement, Disagreement, Irrelevance.',
        fullDefinition: 'Comparing two maps/sides to note Agreement, Disagreement, and Irrelevance.',
        usage: 'Explore differences in group thinking based on same evidence.',
        pedagogicalValue: 'Explore the reasoning and critical thinking that leads to a judgement.'
      },
       { 
        id: 'c-and-s', 
        label: 'C & S', 
        description: 'Consequence & Sequel.',
        fullDefinition: 'Attempts to make us think in a more long-term fashion. Immediate, Short, Medium, and Long term.',
        usage: 'Thinking partners followed by jigsawing & class sharing.',
        pedagogicalValue: 'Challenge analysis and reasoning around each time frame.'
      }
    ]
  },
  {
    id: 'six-hats',
    label: 'Six Thinking Hats',
    description: 'Parallel thinking modes developed by De Bono.',
    children: [
      { 
        id: 'white-hat', 
        label: 'White Hat (Information)', 
        description: 'Calls for facts, figures, and information known or needed.',
        fullDefinition: 'The White Hat calls for information known or needed. Covers facts, figures, and evidence gaps.',
        usage: 'Use to drop arguments and look at what we know and what we need.',
        pedagogicalValue: 'Separates fact from opinion.'
      },
      { 
        id: 'yellow-hat', 
        label: 'Yellow Hat (Optimism)', 
        description: 'Symbolises brightness, optimism, benefits.',
        fullDefinition: 'Symbolises brightness and optimism, benefits, speculates positively. The logical positive.',
        usage: 'Why will something work and why will it offer benefits?',
        pedagogicalValue: 'Encourages constructive thinking.'
      },
      { 
        id: 'black-hat', 
        label: 'Black Hat (Caution)', 
        description: 'Judgment, devil’s advocate, risk assessment.',
        fullDefinition: 'Judgment—the devil’s advocate or why something may not work. Points out why a suggestion does not fit facts.',
        usage: 'Use for risk assessment and caution. Must always be logical.',
        pedagogicalValue: 'Prevents mistakes, but can be overused.'
      },
      { 
        id: 'red-hat', 
        label: 'Red Hat (Emotion)', 
        description: 'Feelings, intuition, hunches, and emotion.',
        fullDefinition: 'Signifies feelings, intuition, hunches, and emotion – gut feelings.',
        usage: 'Allows the thinker to put forward an intuition without any need to justify it.',
        pedagogicalValue: 'Separates ego from performance; validates emotions.'
      },
      { 
        id: 'green-hat', 
        label: 'Green Hat (Creativity)', 
        description: 'Creativity, possibilities, alternatives, new ideas.',
        fullDefinition: 'Focuses on creativity, the possibilities, alternatives, and new ideas, growth, energy.',
        usage: 'Use for hypothesis building and provocations.',
        pedagogicalValue: 'Encourages performance rather than ego defense.'
      },
      { 
        id: 'blue-hat', 
        label: 'Blue Hat (Process)', 
        description: 'Manage the thinking process (metacognition).',
        fullDefinition: 'The overview or process control hat. Looks not at the subject itself but at the "thinking" about the subject.',
        usage: 'Teacher usually wears this to manage the sequence of the other hats.',
        pedagogicalValue: 'Develops metacognition.'
      }
    ]
  },
  {
    id: 'cognitive-models',
    label: 'Cognitive Models',
    description: 'Frameworks for learning levels and dialogue.',
    children: [
      { 
        id: 'blooms', 
        label: 'Bloom’s Taxonomy (2001)', 
        description: 'Levels of intellectual behavior.',
        fullDefinition: 'A classification of levels of intellectual behavior important in learning, from simple recall to evaluation and creativity.',
        usage: 'Use to pitch suitable challenge levels and model complex thinking.',
        pedagogicalValue: 'Models the development of increasingly complex thinking.'
      },
      { 
        id: 'dialogic-teaching', 
        label: 'Dialogic Teaching', 
        description: 'Harnesses talk to stimulate thinking.',
        fullDefinition: 'Collective, Reciprocal, Supportive, Cumulative, and Purposeful talk.',
        usage: 'Use to stimulate and extend children’s thinking and advance learning.',
        pedagogicalValue: 'Enables teacher to diagnose and assess. Distinct from simple question-answer routines.'
      },
      { 
        id: 'hypothesis', 
        label: 'Hypothesis Forming', 
        description: 'Higher order thinking activity.',
        fullDefinition: 'Enabling students to guess or define a possible reason or explanation of an occurrence.',
        usage: 'Ask "What are the implications?", "What would happen next if...?"',
        pedagogicalValue: 'Develops Information Processing, Reasoning, Critical and Creative Thinking Skills.'
      }
    ]
  }
];

const paqStrategies: StrategyNode[] = [
    {
        id: 'paq-p',
        label: 'P - Purpose',
        description: 'Establishing the divine intent.',
        fullDefinition: 'Establishing the divine intent for the specific subject matter or topic. Answers "Why does this exist?" or "What foundational truth governs this aspect of reality?"',
        usage: 'Must occur at the beginning of the unit or lesson. The teacher presents a foundational truth, and the student must deduce how that truth applies to the topic.',
        pedagogicalValue: 'Acts as a "measuring rod." All subsequent academic content is compared against this truth. Moves student from passive to active deduction.'
    },
    {
        id: 'paq-a',
        label: 'A - Assumptions',
        description: 'The Logic Check / Worldview Analysis.',
        fullDefinition: 'Uncovering and evaluating the worldview beliefs (historical, philosophical, or theological) hidden within the textbook or curriculum.',
        usage: 'Best situated in the middle of the unit. Students identify a claim or "unspoken belief" and compare it against the foundational truth.',
        pedagogicalValue: 'Teaches discernment. Acts as a "Compare and Contrast" mechanism for deep structural integration rather than surface level agreement.'
    },
    {
        id: 'paq-q',
        label: 'Q - Questions',
        description: 'The Ethical Application.',
        fullDefinition: 'Using "Essential Questions" to provoke ethical reasoning, value judgments, or personal application.',
        usage: 'Can occur throughout the unit. Answering questions that require them to apply the content to their own life, decision-making, or ethical framework.',
        pedagogicalValue: 'Moves knowledge from the "head" (intellect) to the "heart and hands" (behavior).'
    }
];

export const strategies: StrategyNode[] = [
    {
        id: 'cel-5d-root',
        label: 'CEL 5D+ Framework',
        description: 'Instructional Framework for Teaching & Learning',
        children: cel5dStrategies
    },
    {
        id: 'questioning-strategies-root',
        label: 'Questioning Strategies',
        description: 'Methods to facilitate dialogue and thinking.',
        children: questioningStrategies
    },
    {
        id: 'paq-method-root',
        label: 'Biblical Integration (PAQ)',
        description: 'Purpose, Assumptions, Questions Method.',
        children: paqStrategies
    }
];
