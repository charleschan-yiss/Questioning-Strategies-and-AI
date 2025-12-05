
import { StrategyNode } from '../types';

// --- KAGAN STRUCTURES DATABASE ---

const kaganReview: StrategyNode[] = [
  {
    id: 'kagan-fan-n-pick',
    label: 'Fan-N-Pick',
    description: 'Teammates play a card game to respond to questions.',
    fullDefinition: '1) Student 1 (Fan) holds cards in a fan. 2) Student 2 (Pick) picks a card, reads aloud, waits 5s. 3) Student 3 (Answer) answers. 4) Student 4 (Praise/Coach) checks/praises. 5) Rotate.',
    usage: 'Use for reviewing content, vocabulary, or math facts.',
    pedagogicalValue: 'Promotes autonomy. The roles lower anxiety while the Praise/Coach role deepens understanding.',
    socialSkill: 'Coaching without giving the answer; accepting feedback.',
    teacherScript: 'Student 1, fan them out! Student 4, listen closely—give a hint, not the answer.'
  },
  {
    id: 'kagan-fan-n-pick-partners',
    label: 'Fan-N-Pick Partners',
    description: 'Paired version of Fan-N-Pick.',
    fullDefinition: 'Same as Fan-N-Pick but with 2 students. Partner A fans; B picks/answers; A praises/coaches. Switch.',
    usage: 'Doubles the practice frequency compared to the team version.',
    pedagogicalValue: 'High engagement dyadic practice.',
    socialSkill: 'Patience and immediate validation.',
    teacherScript: 'Partner A, you are the Fanner. Partner B, you are the Picker. Go!'
  },
  {
    id: 'kagan-dip-a-strip',
    label: 'Dip-A-Strip',
    description: 'Picking question strips from a bundle.',
    fullDefinition: '1) Student A holds a bundle of strips fanned like a bouquet. 2) Student B "dips" (pulls) one strip, reads, answers. 3) Student A checks/praises.',
    usage: 'Adds tactile novelty to simple Q&A. Good for vocab or math facts.',
    pedagogicalValue: 'Novelty increases attention.',
    teacherScript: 'Don\'t look! Just dip and pick a strip.'
  },
  {
    id: 'kagan-flashcard-star',
    label: 'Flashcard Star',
    description: 'Building a pile of mastered cards.',
    fullDefinition: '1) Pair uses flashcards. 2) A shows front. B answers. 3) If correct, card goes to "Star Pile". If wrong, A shows back, coaches, returns to deck.',
    usage: 'Memorization and fact fluency.',
    pedagogicalValue: 'Visual tracking of mastery builds motivation.',
    socialSkill: 'Honesty (don\'t put it in the star pile unless it was perfect).',
    teacherScript: 'Let\'s see which pair can build the biggest Star Pile!'
  },
  {
    id: 'kagan-numbered-heads',
    label: 'Numbered Heads Together',
    description: 'Team consensus then individual answer.',
    fullDefinition: '1) Teacher asks question. 2) Silent write. 3) "Heads Together" to agree. 4) Teacher calls "Number 3!". 5) Number 3s stand and answer.',
    usage: 'Reviewing complex concepts where verification is needed.',
    pedagogicalValue: 'Prevents "hitchhiking". High individual accountability.',
    socialSkill: 'Consensus seeking; ensuring the lowest achiever is ready.',
    teacherScript: 'Put your heads together! Make sure your Number 1 and Number 4 both know the answer.'
  },
  {
    id: 'kagan-paired-heads',
    label: 'Paired Heads Together',
    description: 'Numbered Heads but in pairs.',
    fullDefinition: 'Same as Numbered Heads but in pairs. Teacher calls "Partner A" or "Partner B".',
    usage: 'High intensity review.',
    pedagogicalValue: 'No place to hide; intense active listening.',
    socialSkill: 'Intense active listening.',
    teacherScript: 'Partner A, make sure Partner B is ready to answer for you!'
  },
  {
    id: 'kagan-traveling-heads',
    label: 'Traveling Heads Together',
    description: 'Numbered heads with movement.',
    fullDefinition: '1) Teams solve problem. 2) Teacher calls a number. 3) That student travels to a NEW team to share the answer.',
    usage: 'Calibrating answers across the class.',
    pedagogicalValue: 'Prevents teams from reinforcing wrong data.',
    socialSkill: 'Presenting to strangers (public speaking confidence).',
    teacherScript: 'Number 2s, travel! Go to the table on your right and share your team\'s answer.'
  },
  {
    id: 'kagan-quiz-quiz-trade',
    label: 'Quiz-Quiz-Trade',
    description: ' mingle, quiz partner, trade cards.',
    fullDefinition: '1) Stand Up, Hand Up, Pair Up. 2) Partner A quizzes B. 3) B answers. A praises/coaches. 4) Switch roles. 5) Trade cards and find a new partner.',
    usage: 'Energizer and review.',
    pedagogicalValue: 'Repetition of their own card helps mastery before trading.',
    socialSkill: 'Greeting new partners; parting with a "Thank you."',
    teacherScript: 'Stand up, hand up, pair up! Quiz your partner, trade cards, and find someone new.'
  },
  {
    id: 'kagan-quiz-n-compare',
    label: 'Quiz-N-Compare',
    description: 'Pairs generate answer then check with neighbors.',
    fullDefinition: '1) Teacher asks question. 2) Pairs generate answer. 3) Pairs check with a neighboring pair (Quad Check).',
    usage: 'Validating thinking on open-ended questions.',
    pedagogicalValue: 'If pairs disagree, it sparks deep analysis to find the truth.',
    socialSkill: 'Politeness in disagreement.',
    teacherScript: 'Turn to your neighbors. Do you have the same answer? If not, figure out who is right.'
  },
  {
    id: 'kagan-rally-quiz',
    label: 'Rally Quiz',
    description: 'Partners quiz each other with text/worksheet.',
    fullDefinition: '1) Partners have a text. 2) A asks B a question. B answers (no looking). 3) A checks. 4) Switch.',
    usage: 'High-speed memory check.',
    pedagogicalValue: 'Immediate feedback.',
    socialSkill: 'Trust (not peeking).',
    teacherScript: 'Partner A, hide the answer key. Partner B, eyes on me!'
  },
  {
    id: 'kagan-rally-recall',
    label: 'Rally Recall',
    description: 'Rapid fire recall of facts.',
    fullDefinition: '1) Teacher closes book. 2) A recalls one fact. 3) B recalls a different fact. 4) Ping-pong back and forth.',
    usage: 'Retrieval practice at end of lesson.',
    pedagogicalValue: 'Retrieval practice (Testing Effect). Strengthens neural pathways.',
    teacherScript: 'Close your books. How many facts can you recall in 60 seconds? Go!'
  },
  {
    id: 'kagan-showdown',
    label: 'Showdown',
    description: 'Teammates write secret answers then reveal.',
    fullDefinition: '1) Captain reads question. 2) ALL write answer secretly. 3) Captain calls "Showdown!". 4) Teammates reveal and compare.',
    usage: 'Math problems or short answer verification.',
    pedagogicalValue: 'Safe assessment. Peers correct each other before the teacher sees it.',
    socialSkill: 'Celebrating success ("Great job, we all got it!").',
    teacherScript: 'Write your answer... hide it... and SHOWDOWN!'
  },
  {
    id: 'kagan-rotating-lines',
    label: 'Rotating Lines',
    description: 'Lines of students move to quiz new partners.',
    fullDefinition: '1) Two lines face each other. 2) Discuss/Quiz partner. 3) One line moves down one spot.',
    usage: 'Rapid-fire repetition with multiple partners.',
    pedagogicalValue: 'High volume of practice.',
    socialSkill: 'Adaptability (adjusting to a new partner every minute).',
    teacherScript: 'Line A, take one step to your right. New partner, new greeting!'
  },
  {
    id: 'kagan-traveling-rally-quiz',
    label: 'Traveling Rally Quiz',
    description: 'Quizzing while walking.',
    fullDefinition: 'Partners quiz each other while walking to a destination.',
    usage: 'Transitions.',
    pedagogicalValue: '"Walk and Talk" aids memory retention.',
    teacherScript: 'As you walk to the door, quiz your partner on your 3 vocab words.'
  }
];

const kaganBrainstorming: StrategyNode[] = [
  {
    id: 'kagan-jot-thoughts',
    label: 'Jot Thoughts',
    description: 'Brainstorming on slips of paper.',
    fullDefinition: '1) Topic given. 2) Students write idea on slip, say it, place in center. 3) NO TURNS—Simultaneous speed writing.',
    usage: 'Generating many ideas quickly.',
    pedagogicalValue: 'Prevents dominant talkers. Quieter students contribute equally.',
    socialSkill: 'Respecting space (placing, not throwing).',
    teacherScript: 'Don\'t wait for a turn! If you have an idea, write it and drop it.'
  },
  {
    id: 'kagan-idea-roundup',
    label: 'Idea RoundUp!',
    description: 'Collect ideas from classmates.',
    fullDefinition: '1) StandUp-HandUp-PairUp. 2) Share idea with partner. 3) Partner records it. 4) Switch/Trade papers.',
    usage: 'Cross-pollinating ideas.',
    pedagogicalValue: 'Students "harvest" wisdom from the whole room.',
    socialSkill: 'Appreciation ("That\'s a great idea, I\'m writing it down").',
    teacherScript: 'Round up as many new ideas as you can from your classmates!'
  },
  {
    id: 'kagan-roundtable',
    label: 'RoundTable',
    description: 'Single paper passed around team.',
    fullDefinition: '1) One paper per team. 2) Student A writes & speaks. 3) Pass to left.',
    usage: 'List building or creative writing.',
    pedagogicalValue: 'Enforces equal participation. No one can opt out.',
    socialSkill: 'Patience (waiting for the paper).',
    teacherScript: 'One paper, one pen. Pass it to the left.'
  },
  {
    id: 'kagan-continuous-roundtable',
    label: 'Continuous RoundTable',
    description: 'Fast-paced RoundTable.',
    fullDefinition: 'Same as RoundTable but fast-paced for a set time (e.g., 3 mins).',
    usage: 'Speed brainstorming.',
    pedagogicalValue: 'Bypasses "internal editor" to boost creativity flow.',
    teacherScript: 'Keep that paper moving! Don\'t let it stop.'
  },
  {
    id: 'kagan-single-roundtable',
    label: 'Single RoundTable',
    description: 'One lap only.',
    fullDefinition: 'Paper goes around exactly once.',
    usage: 'Complex answers where quality matters more than quantity.',
    pedagogicalValue: 'Focus on quality contribution.',
    teacherScript: 'We are doing one lap only. Make your contribution count.'
  },
  {
    id: 'kagan-simultaneous-roundtable',
    label: 'Simultaneous RoundTable',
    description: 'All 4 students pass papers at once.',
    fullDefinition: '1) All 4 students have a paper. 2) Write idea. 3) Pass all papers to left at once. 4) Read neighbor\'s list and add to it.',
    usage: 'High volume brainstorming.',
    pedagogicalValue: '4x the engagement of standard RoundTable. No waiting.',
    socialSkill: 'Reading others\' handwriting; building on others\' ideas.',
    teacherScript: 'Everyone write... and PASS! Read what your neighbor wrote and add a new idea.'
  },
  {
    id: 'kagan-timed-roundtable',
    label: 'Timed RoundTable',
    description: 'RoundTable with a timer per person.',
    fullDefinition: 'RoundTable with a timer (e.g., 30 secs per person).',
    usage: 'Keeping focus.',
    pedagogicalValue: 'Urgency focuses the ADHD brain.',
    teacherScript: 'You have 30 seconds... pass!'
  },
  {
    id: 'kagan-rallytable',
    label: 'RallyTable',
    description: 'Pairs pass paper back and forth.',
    fullDefinition: 'Pair shares one paper/pen. A writes, B writes.',
    usage: 'Dyadic brainstorming.',
    pedagogicalValue: 'Intense dyadic collaboration. "Brainstorming loop."',
    teacherScript: 'Shoulder partners. Back and forth. Fill that page!'
  },
  {
    id: 'kagan-simultaneous-rallytable',
    label: 'Simultaneous RallyTable',
    description: 'Both partners write and swap.',
    fullDefinition: 'Both partners have paper. Write, Swap, Read, Add.',
    usage: 'Maximum writing output.',
    pedagogicalValue: 'High engagement.',
    teacherScript: 'Write your answer, swap papers, check your partner\'s work, and add to it.'
  },
  {
    id: 'kagan-pass-n-praise',
    label: 'Pass-N-Praise',
    description: 'Praise previous idea before adding.',
    fullDefinition: 'Write answer, pass paper. Receiver MUST praise the previous entry before writing.',
    usage: 'Classbuilding and writing.',
    pedagogicalValue: 'Makes it safe to share ideas.',
    teacherScript: 'Before you write, read your neighbor\'s idea and tell them why it\'s good.'
  },
  {
    id: 'kagan-snowball',
    label: 'Snowball',
    description: 'Write, crumple, toss, read.',
    fullDefinition: '1) Write idea. 2) Crumple paper. 3) Toss it! 4) Pick up new snowball, read, add to it.',
    usage: 'Anonymous brainstorming.',
    pedagogicalValue: 'Anonymity encourages risk-taking. Fun physical release.',
    socialSkill: 'Physical safety (throwing safely).',
    teacherScript: 'Write your secret idea. Crumple it up. Snowball fight! Now find a new snowball and open it.'
  }
];

const kaganDiscussion: StrategyNode[] = [
  {
    id: 'kagan-roundrobin',
    label: 'RoundRobin',
    description: 'Oral turn-taking in team.',
    fullDefinition: 'Oral turn-taking in team. Starting with Person 1, go around the circle. Everyone shares one idea.',
    usage: 'Sharing opinions or answers.',
    pedagogicalValue: 'Democratic equalizer. Everyone gets the floor.',
    socialSkill: 'Listening without interrupting.',
    teacherScript: 'Starting with Person 1, go around the circle. Everyone shares one idea.'
  },
  {
    id: 'kagan-continuous-roundrobin',
    label: 'Continuous RoundRobin',
    description: 'Keep going around until stop.',
    fullDefinition: 'Keep going around until time is up.',
    usage: 'Deepening discussion.',
    pedagogicalValue: 'Moves beyond surface answers.',
    teacherScript: 'Keep going around until I say stop. Dig deeper.'
  },
  {
    id: 'kagan-single-roundrobin',
    label: 'Single RoundRobin',
    description: 'Once around the circle.',
    fullDefinition: 'Once around the circle.',
    usage: 'Quick status check.',
    pedagogicalValue: 'Brief check-in.',
    teacherScript: 'One quick lap around the team. Go.'
  },
  {
    id: 'kagan-timed-roundrobin',
    label: 'Timed RoundRobin',
    description: 'Specific time per person.',
    fullDefinition: 'Specific time per person (e.g., 60 secs).',
    usage: 'Lengthy explanations.',
    pedagogicalValue: 'Equity of airtime. Stops "hogs" and encourages "logs".',
    teacherScript: 'Person 1, you have 60 seconds. Teammates, silence until the timer beeps.'
  },
  {
    id: 'kagan-think-write-roundrobin',
    label: 'Think-Write-RoundRobin',
    description: 'Processing time before speaking.',
    fullDefinition: 'Think -> Write -> Share Orally.',
    usage: 'Complex questions.',
    pedagogicalValue: 'Processing time helps introverts/ELLs formulate better answers.',
    teacherScript: 'Think first. Now write it down. Okay, now share what you wrote.'
  },
  {
    id: 'kagan-allrecord-roundrobin',
    label: 'AllRecord RoundRobin',
    description: 'One speaks, all write.',
    fullDefinition: 'One speaks, ALL write it down.',
    usage: 'Note taking.',
    pedagogicalValue: 'Accountability for listening.',
    socialSkill: 'Verification ("Did you say...?").',
    teacherScript: 'If Student 1 says it, everyone writes it. Listen carefully.'
  },
  {
    id: 'kagan-rotating-role-roundrobin',
    label: 'Rotating Role RoundRobin',
    description: 'Roles switch each round.',
    fullDefinition: 'Roles (Timekeeper, Cheerleader) switch each round.',
    usage: 'Skill building.',
    pedagogicalValue: 'Practice different leadership skills.',
    teacherScript: 'Rotate roles one person to the left. New Cheerleader, get ready!'
  },
  {
    id: 'kagan-rallyrobin',
    label: 'RallyRobin',
    description: 'Pair oral ping-pong.',
    fullDefinition: 'Pair oral ping-pong. A, B, A, B.',
    usage: 'Listing or quick sharing.',
    pedagogicalValue: 'Max oral practice (50% of class speaking at once).',
    teacherScript: 'Turn to your partner. A, B, A, B. Go!'
  },
  {
    id: 'kagan-both-record-rallyrobin',
    label: 'Both Record RallyRobin',
    description: 'Say it, then both write it.',
    fullDefinition: 'RallyRobin + both write.',
    usage: 'Creating a list.',
    pedagogicalValue: 'Creates a study guide.',
    teacherScript: 'Say it, then write it. Both of you record the answer.'
  },
  {
    id: 'kagan-timed-pair-share',
    label: 'Timed Pair Share',
    description: 'A shares for X min, B listens.',
    fullDefinition: 'A shares for X min (B listens). Switch.',
    usage: 'In-depth sharing.',
    pedagogicalValue: 'Teaches deep listening. B cannot interrupt.',
    socialSkill: 'Non-verbal listening cues.',
    teacherScript: 'Partner A, you have 1 minute. Partner B, just listen—don\'t talk until the timer beeps.'
  },
  {
    id: 'kagan-traveling-pair-share',
    label: 'Traveling Pair Share',
    description: 'Timed pair share with new partners.',
    fullDefinition: 'Timed Pair Share + move to new partner.',
    usage: 'Social bridging.',
    pedagogicalValue: 'Breaks up cliques.',
    teacherScript: 'Share for 1 minute, then travel to a new partner and share again.'
  },
  {
    id: 'kagan-pair-share',
    label: 'Pair Share',
    description: 'Informal turn and talk.',
    fullDefinition: 'Informal "Turn and Talk".',
    usage: 'Quick processing.',
    pedagogicalValue: 'Quick engagement.',
    teacherScript: 'Turn to your neighbor and tell them what you think.'
  },
  {
    id: 'kagan-talking-chips',
    label: 'Talking Chips',
    description: 'Spend a chip to speak.',
    fullDefinition: 'Place chip to talk. Can\'t talk again until all chips used.',
    usage: 'Discussion regulation.',
    pedagogicalValue: 'Regulates impulse control. Visualizes turn-taking.',
    teacherScript: 'Put your chip in the center to speak. If you have no chips, your job is to listen.'
  },
  {
    id: 'kagan-gossip-gossip',
    label: 'Gossip Gossip',
    description: 'Tell others what your partner said.',
    fullDefinition: 'A tells B. B goes to C and tells them what A said.',
    usage: 'Listening practice.',
    pedagogicalValue: 'Paraphrasing and memory skills.',
    teacherScript: 'Listen closely, because you\'re going to have to tell someone else what your partner just said!'
  },
  {
    id: 'kagan-paraphrase-passport',
    label: 'Paraphrase Passport',
    description: 'Summarize previous speaker to get a turn.',
    fullDefinition: 'A speaks. B says "You said..." before sharing their own idea.',
    usage: 'Conflict resolution or complex discussion.',
    pedagogicalValue: 'Empathy builder. Listening to understand, not just reply.',
    teacherScript: 'You need a passport to speak! Your passport is correctly summarizing what the person before you said.'
  },
  {
    id: 'kagan-team-interview',
    label: 'Team Interview',
    description: 'One student interviewed by teammates.',
    fullDefinition: 'One student interviewed by teammates.',
    usage: 'Spotlighting a student.',
    pedagogicalValue: 'Valuing individual experience.',
    teacherScript: 'Student 1 is the star. Teammates, ask them questions about their topic.'
  },
  {
    id: 'kagan-rally-interview',
    label: 'Rally Interview',
    description: 'Partners interview each other.',
    fullDefinition: 'A interviews B. Switch.',
    usage: 'Getting to know you.',
    pedagogicalValue: 'Inquiry skills (asking follow-ups).',
    teacherScript: 'Partner A, you are the reporter. Interview Partner B.'
  },
  {
    id: 'kagan-timed-pair-interview',
    label: 'Timed Pair Interview',
    description: 'Strict time limits on interview.',
    fullDefinition: 'Strict time limits on interview.',
    usage: 'Fluency under pressure.',
    pedagogicalValue: 'Rapid info gathering.',
    teacherScript: 'You have 2 minutes to get as much info as you can!'
  }
];

const kaganThinking: StrategyNode[] = [
  {
    id: 'kagan-allrecord-consensus',
    label: 'AllRecord Consensus',
    description: 'Discuss, Agree, All Write.',
    fullDefinition: 'Discuss -> Agree -> ALL write.',
    usage: 'Team problem solving.',
    pedagogicalValue: 'Prevents voting. Forces negotiation.',
    teacherScript: 'Do not write until you all agree. If one person disagrees, keep talking.'
  },
  {
    id: 'kagan-roundtable-consensus',
    label: 'RoundTable Consensus',
    description: 'Suggest, Agree, Write, Pass.',
    fullDefinition: 'A suggests. Team agrees? A writes. Pass.',
    usage: 'Constructing a team list.',
    pedagogicalValue: 'Unified team output.',
    teacherScript: 'Discuss the idea first. Does everyone agree? Okay, write it down.'
  },
  {
    id: 'kagan-rallytable-consensus',
    label: 'RallyTable Consensus',
    description: 'Pair negotiation before writing.',
    fullDefinition: 'Pair negotiation before writing.',
    usage: 'Dyadic problem solving.',
    pedagogicalValue: 'Dyadic consensus.',
    teacherScript: 'Partner A, suggest an answer. Partner B, do you agree? If yes, write it.'
  },
  {
    id: 'kagan-sage-n-scribe',
    label: 'Sage-N-Scribe',
    description: 'One thinks/talks, one writes.',
    fullDefinition: 'Sage talks (no pen). Scribe writes (no talking, unless checking).',
    usage: 'Problem solving.',
    pedagogicalValue: 'Metacognition (verbalizing the process).',
    socialSkill: 'Role discipline (not grabbing the pen).',
    teacherScript: 'Sage, tell the Scribe exactly what to do. Scribe, don\'t write unless you understand.'
  },
  {
    id: 'kagan-rallycoach',
    label: 'RallyCoach',
    description: 'Solve and Coach.',
    fullDefinition: 'A solves/talks. B watches/coaches. Switch.',
    usage: 'Skill practice.',
    pedagogicalValue: 'Immediate feedback loop.',
    teacherScript: 'Partner B, watch closely. If A gets stuck, give a clue, not the answer.'
  },
  {
    id: 'kagan-mix-pair-rally-coach',
    label: 'Mix-Pair-Rally Coach',
    description: 'Move, pair up, coach.',
    fullDefinition: 'Mix -> Pair -> RallyCoach problem -> Mix.',
    usage: 'Dynamic practice.',
    pedagogicalValue: 'High energy practice.',
    teacherScript: 'Mix around the room! Freeze! Find a partner and solve Problem 1.'
  },
  {
    id: 'kagan-read-n-review',
    label: 'Read-N-Review',
    description: 'Read and summarize.',
    fullDefinition: 'A reads. B summarizes. Switch.',
    usage: 'Reading comprehension.',
    pedagogicalValue: 'Comprehension check. Prevents "zoning out".',
    teacherScript: 'Read one paragraph, then stop. Partner, tell them what they just read.'
  },
  {
    id: 'kagan-rally-read',
    label: 'Rally Read',
    description: 'Alternate reading sentences.',
    fullDefinition: 'Alternate reading sentences/paragraphs.',
    usage: 'Reading fluency.',
    pedagogicalValue: 'Oral fluency in safe setting.',
    teacherScript: 'Partner A reads a sentence, then Partner B. Keep the rhythm going.'
  },
  {
    id: 'kagan-listen-right',
    label: 'Listen Right!',
    description: 'Lecture, pause, write, share.',
    fullDefinition: 'Lecture -> Pause -> Write -> Share -> Check.',
    usage: 'During lectures.',
    pedagogicalValue: 'Processing time. Moves info to long-term memory.',
    teacherScript: 'Pencils down and listen... Okay, pencils up! Write what you remember.'
  },
  {
    id: 'kagan-invisible-pal',
    label: 'Invisible Pal',
    description: 'Invent a character.',
    fullDefinition: 'Invent character -> Introduce to partner.',
    usage: 'Creative writing prep.',
    pedagogicalValue: 'Imagination/Abstract thinking.',
    teacherScript: 'Introduce your invisible friend to your partner. What are they like?'
  }
];

const kaganClassbuildingNet: StrategyNode[] = [
  {
    id: 'kagan-find-someone-who',
    label: 'Find Someone Who',
    description: 'Circulate to find classmates who fit criteria.',
    fullDefinition: 'Students circulate with a grid of questions, finding different classmates to answer each one and sign their sheet.',
    usage: 'Review or getting to know you.',
    pedagogicalValue: 'Builds a class-wide network. Forces interaction with non-friends.',
    teacherScript: 'Stand up, mix, and find someone who can sign your sheet!',
    optionA: 'Create a "Review Hunt" with questions from the current unit.',
    optionB: 'Create a "People Hunt" with fun traits.',
    requiresResource: true
  },
  {
    id: 'kagan-inside-outside-circle-net',
    label: 'Inside-Outside Circle',
    description: 'Concentric circles for sharing.',
    fullDefinition: 'Concentric circles facing each other. Share with opposite, rotate.',
    usage: 'Sharing opinions or knowledge.',
    pedagogicalValue: 'Removes anxiety of finding a partner. 50% class speaks at once.',
    teacherScript: 'Inside circle face out. Outside circle face in. Share... Rotate!',
    optionA: 'Use open-ended discussion prompts about the lesson.',
    optionB: 'Use "Getting to Know You" prompts.'
  },
  {
    id: 'kagan-who-am-i',
    label: 'Who Am I?',
    description: 'Guess identity on back.',
    fullDefinition: 'Students have a secret identity taped to back. Mix and ask Yes/No questions.',
    usage: 'Reviewing famous people or concepts.',
    pedagogicalValue: 'Builds inquiry and classification skills.',
    teacherScript: 'Mix and ask yes/no questions to find out who you are!',
    optionA: 'Identities are Vocabulary Terms or Historical Figures.',
    optionB: 'Identities are Famous Celebrities or Superheroes.',
    requiresResource: true
  },
  {
    id: 'kagan-mix-n-match',
    label: 'Mix-N-Match',
    description: 'Find partner with matching card.',
    fullDefinition: 'Students mix with cards and must find the classmate holding their matching half.',
    usage: 'Definitions or pairs.',
    pedagogicalValue: 'Physicalizes connection of concepts.',
    teacherScript: 'Mix... Freeze! Find your match!',
    optionA: 'Match Problem to Solution, or Term to Definition.',
    optionB: 'Match "Famous Pairs" (e.g., Peanut Butter & Jelly).',
    requiresResource: true
  }
];

const kaganClassbuildingValues: StrategyNode[] = [
  {
    id: 'kagan-corners',
    label: 'Corners',
    description: 'Move to corner representing opinion.',
    fullDefinition: 'Students move to a corner representing their opinion/choice, then discuss.',
    usage: 'Debate or preferences.',
    pedagogicalValue: 'Visualizes diversity of thought.',
    teacherScript: 'Go to Corner 1 if you agree, Corner 2 if you disagree...',
    optionA: 'Debate a topic (e.g., Best method for solving equation).',
    optionB: 'Fun preferences (e.g., Favorite Season).'
  },
  {
    id: 'kagan-similarity-groups-val',
    label: 'Similarity Groups',
    description: 'Group by trait.',
    fullDefinition: 'Teacher announces a trait; students scramble to form groups with everyone who shares that trait.',
    usage: 'Finding common ground.',
    pedagogicalValue: 'Breaks down cliques.',
    teacherScript: 'Group by [Topic]! Go!',
    optionA: 'Group by "My favorite part of the story was..."',
    optionB: 'Group by "Birthday Month" or "Shoe Color".'
  },
  {
    id: 'kagan-line-ups',
    label: 'Line-Ups',
    description: 'Line up in specific order.',
    fullDefinition: 'Students line up in a specific order (e.g., Value Line) and then "fold" the line to talk.',
    usage: 'Sequencing or opinion scale.',
    pedagogicalValue: 'Kinesthetic sequencing. "Folding" ensures diversity in pairs.',
    teacherScript: 'Line up by [Criteria]. Now fold the line!',
    optionA: 'Line up by understanding or Opinion (Agree to Disagree).',
    optionB: 'Line up by Birthday or Distance from school.'
  }
];

const kaganClassbuildingFun: StrategyNode[] = [
  {
    id: 'kagan-formations',
    label: 'Formations',
    description: 'Form shape/word with bodies.',
    fullDefinition: 'The class works together to physically form a shape, word, or diagram with their bodies.',
    usage: 'Visualizing concepts.',
    pedagogicalValue: 'Total Positive Interdependence.',
    teacherScript: 'Make the shape of...!',
    optionA: 'Form a Geometry Shape or Letter.',
    optionB: 'Form a Smiley Face or School Initials.'
  },
  {
    id: 'kagan-mix-freeze-group',
    label: 'Mix-Freeze-Group',
    description: 'Mix until freeze, form group of X.',
    fullDefinition: 'Students mix until "Freeze," then must quickly form groups of a specific size.',
    usage: 'Energizer or Math.',
    pedagogicalValue: 'High adrenaline; forces quick decision making.',
    teacherScript: 'Mix... Freeze! Form a group of [Number]!',
    optionA: 'Form a group the size of... the square root of 16!',
    optionB: 'Form a group of 5!'
  }
];

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
        id: 'instructional-strategies-root',
        label: 'Instructional Strategies',
        description: 'Kagan Structures & Cooperative Learning.',
        children: [
            {
                id: 'kagan-root',
                label: 'Kagan Structures Integration',
                description: 'Cooperative Learning Structures.',
                children: [
                    { id: 'kagan-review', label: 'Review & Mastery', children: kaganReview },
                    { id: 'kagan-brainstorming', label: 'Brainstorming & Writing', children: kaganBrainstorming },
                    { id: 'kagan-discussion', label: 'Discussion & Oral Sharing', children: kaganDiscussion },
                    { id: 'kagan-thinking', label: 'Thinking, Consensus & Logic', children: kaganThinking }
                ]
            },
            {
                id: 'kagan-classbuilding',
                label: 'Kagan Classbuilding Integration',
                description: 'Team & Class Building Structures',
                children: [
                    { id: 'kagan-getting-acquainted', label: 'Getting Acquainted & Networking', children: kaganClassbuildingNet },
                    { id: 'kagan-values', label: 'Values & Opinions', children: kaganClassbuildingValues },
                    { id: 'kagan-fun', label: 'Fun, Energy & Formations', children: kaganClassbuildingFun }
                ]
            }
        ]
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
