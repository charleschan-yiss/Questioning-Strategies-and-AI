
import { GoogleGenAI } from "@google/genai";
import { LessonInput, StrategyNode } from "../types";

const getSystemInstruction = () => `
You are an expert curriculum designer, senior teacher, and **Biblical Scholar** at YISS. Your goal is to generate high-quality lesson plans that strictly adhere to the YISS Lesson Planner format.

**CRITICAL PERSONA FOR BIBLICAL INTEGRATION:**
When generating the Biblical Integration Analysis (PAQ Method), you must act as a **Theologian-in-Residence**.
*   **Avoid superficial connections** (e.g., "God made math so calculate carefully").
*   **Avoid "proof-texting"** (finding a verse just because it shares a keyword).
*   **Focus on Redemptive History:** Connect the topic to Creation, Fall, Redemption, or Restoration.
*   **Focus on Teleology:** What is the ultimate *purpose* or *end goal* of this subject in God's economy?
*   **Scholarship:** Provide hermeneutically sound exegesis.

**The Frameworks (Apply ONLY if selected by user):**

1.  **Effective Questioning Strategies:**
    *   Use the specific strategy/strategies selected by the user.
    *   Create specific questions relevant to the topic using these strategies.

2.  **CEL 5D+ Framework (University of Washington):**
    *   If specific dimensions are selected (e.g., Purpose, Engagement), prioritize those in the lesson design.

3.  **Instructional Strategies (Kagan):**
    *   If Kagan structures are selected, explain exactly how to facilitate them in this lesson.
    *   **Classbuilding (Dual Option):** If a classbuilding strategy is selected, you MUST provide BOTH an "Option A: Academic" (tied to lesson content) and "Option B: Social/Fun" (brain break) variation.

4.  **Biblical Integration (PAQ Method):**
    *   **P – PURPOSE:** Establishing the divine intent/Teleology.
    *   **A – ASSUMPTIONS:** Uncovering worldview/epistemological beliefs.
    *   **Q – QUESTIONS:** Ethical application and heart orientation.

**Critical Rules:**
*   **Grade Level Accuracy:** If the user does not provide a Grade Level, and it cannot be clearly inferred from uploaded files, you MUST write "Not Specified". Do NOT invent a grade level.
*   **Format:** Output strictly in Markdown. Do not wrap in JSON.
*   **Context Awareness:** You must analyze the specific content of uploaded files or user context. Quote specific parts of the lesson plan to show connection.
`;

export const generateLessonPlan = async (
    input: LessonInput, 
    selectedStrategies: StrategyNode[], 
    refinementText?: string,
    currentPlan?: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Separate strategies by type strict filtering
  const celList = selectedStrategies.filter(s => s.id.includes('cel'));
  const paqList = selectedStrategies.filter(s => s.id.includes('paq'));
  const kaganList = selectedStrategies.filter(s => s.id.includes('kagan'));
  // Questioning list MUST exclude CEL, PAQ, AND Kagan
  const questioningList = selectedStrategies.filter(s => 
    !s.id.includes('cel') && 
    !s.id.includes('paq') && 
    !s.id.includes('kagan')
  );
  
  // 2. Build Context Strings
  const questioningContext = questioningList.length > 0 ? `
    **SELECTED QUESTIONING STRATEGIES:**
    ${questioningList.map(s => `- ${s.label}: ${s.description} (Usage: ${s.usage})`).join('\n')}
  ` : '';

  const kaganContext = kaganList.length > 0 ? `
    **SELECTED KAGAN STRUCTURES:**
    ${kaganList.map(s => {
        let details = `- ${s.label}: ${s.fullDefinition} (Script: ${s.teacherScript})`;
        if (s.optionA) details += `\n  - Note: This is a Classbuilding strategy. Generate BOTH Option A (Academic: ${s.optionA}) and Option B (Social: ${s.optionB}) variations.`;
        return details;
    }).join('\n')}
  ` : '';

  const celContext = celList.length > 0 ? `
    **SELECTED CEL 5D+ DIMENSIONS:**
    ${celList.map(s => `- ${s.label}: ${s.description}`).join('\n')}
  ` : '';

  // 3. Configure PAQ Logic
  const pSelected = paqList.some(s => s.id === 'paq-p');
  const aSelected = paqList.some(s => s.id === 'paq-a');
  const qSelected = paqList.some(s => s.id === 'paq-q');
  
  // If NO specific PAQ is selected, and NO PAQ root is selected, we skip it.
  const isSpecificPAQ = pSelected || aSelected || qSelected;
  const isAnyPAQ = paqList.length > 0;

  // Dynamically build the Section Template based on selection
  let paqTemplate = '';
  
  // Only generate PAQ section if specific strategies are selected OR the root category was selected
  if (isAnyPAQ) {
      paqTemplate = `## Biblical Integration Analysis (PAQ Method)`;

      // If specific P is selected OR no specifics are selected (default all), include P
      if (pSelected || !isSpecificPAQ) {
        paqTemplate += `\n\n### P - Purpose (The Foundation)
    *   **Divine Intent (Teleology):** [What is the ultimate purpose of this subject in God's creation? How does it reflect His nature?]
    *   **Scriptural Basis:** [Book Chapter:Verse]
        *   *Scholarly Exegesis:* [Deep theological explanation. Do not just quote it. Explain the context.]
        *   *Word Study (Mandatory if applicable):* [Hebrew/Greek word] - [Definition and nuance]
    *   **Teacher Insight:** [Deep philosophical/theological explanation for the teacher. Connect the "What" of the lesson to the "Why" of the Kingdom.]
    *   **Student Activity:**
        *   *Activity Description:* [Specific activity to deduce this purpose]
        *   *Pedagogical Rationale:* [Why this activity bridges the gap]
        *   *Facilitation:* [Brief steps]`;
      }

      if (aSelected || !isSpecificPAQ) {
        paqTemplate += `\n\n### A - Assumptions (The Logic Check)
    *   **Worldview Analysis:** [Identify a secular claim or "unspoken belief" presented as fact.]
    *   **Scripture for Comparison:** [Book Chapter:Verse]
        *   *Theological Contrast:* [How does the Biblical worldview challenge this assumption?]
    *   **Teacher Insight:** [Deep explanation: How does the textbook's epistemology differ from the Biblical view?]
    *   **Student Activity:**
        *   *Activity Description:* [Connect & Compare activity]
        *   *Pedagogical Rationale:* [Why this activity bridges the gap]
        *   *Facilitation:* [Brief steps]`;
      }

      if (qSelected || !isSpecificPAQ) {
        paqTemplate += `\n\n### Q - Questions (The Ethical Application)
    *   **Essential Questions (Heart Orientation):**
        *(Provide at least 3 distinct, open-ended questions. Format exactly as follows)*:

        1.  **Question:** [Deep Question probing the student's heart/ethics regarding this specific topic]
            *   *Teacher Rationale:* [Explain to the teacher WHY this question is vital. How does it connect the specific academic concept to the Biblical Worldview?]

        2.  **Question:** [Deep Question regarding the application of this knowledge in a fallen world]
            *   *Teacher Rationale:* [Theological connection and facilitation tip.]

        3.  **Question:** [Question provoking personal responsibility or redemptive action]
            *   *Teacher Rationale:* [Theological connection and facilitation tip.]`;
      }
  }

  // 4. Configure Output Structure
  const structureInstructions = `
    **OUTPUT STRUCTURE (STRICT) - USE "<<<SECTION_BREAK>>>" TO SEPARATE SECTIONS:**

    ## Full Integrated Lesson Plan
    (The complete, refined lesson plan incorporating all elements into the standard YISS format: Topic, Standards, Objectives, Materials, Procedures, etc. This must be the FIRST section.)

    <<<SECTION_BREAK>>>

    ${questioningList.length > 0 ? `
    ## Questioning Strategy Integration Guide
    (A deep dive explanation on HOW to use the selected Questioning Strategies within this lesson. Do not just list them; explain the facilitation specifically for this topic.)
    ` : 'NO_QUESTIONING_STRATEGIES'}

    <<<SECTION_BREAK>>>

    ${isAnyPAQ ? paqTemplate : 'NO_PAQ_ANALYSIS'}

    <<<SECTION_BREAK>>>

    ${kaganList.length > 0 ? `
    ## Instructional Strategy Integration Guide
    (Introduction to the strategies selected. This is the top-level header.)

    ### Kagan Structures Integration
    (Detailed instructions on how to run the selected Kagan structures in this specific lesson context. Include the teacher script and social skill focus. This must be a sub-section starting with ###)
    (IF CLASSBUILDING STRUCTURE SELECTED: You MUST provide two distinct sub-headers for that structure: "Option A: Academic Connection" and "Option B: Social/Classbuilding Connection")
    ` : 'NO_INSTRUCTIONAL_STRATEGIES'}

    <<<SECTION_BREAK>>>

    ## Integration Highlights Summary
    (A brief executive summary of what was changed or emphasized.)
  `;

  let prompt = '';

  // MODE 1: REFINEMENT / EDITING
  if (refinementText && currentPlan) {
      prompt = `
      You are acting as a SURGICAL EDITOR for an existing lesson plan.
      
      **CURRENT LESSON PLAN (Context):**
      ${currentPlan}

      **USER REQUEST FOR CHANGES:**
      "${refinementText}"
      
      ${questioningContext}
      ${kaganContext}
      ${celContext}

      ${input.files && input.files.length > 0 ? `**NEWLY ATTACHED FILES:** The user has provided ${input.files.length} new files. Use information from these files to fulfill the request.` : ''}
      ${input.links && input.links.length > 0 ? `**NEWLY ATTACHED LINKS:** ${input.links.join(', ')}.` : ''}

      **STRICT EDITING RULES:**
      1. **ONLY** change the parts of the lesson plan relevant to the "User Request" or the newly selected strategies.
      2. **PRESERVE** the rest of the content exactly as is.
      3. **RE-GENERATE** the analysis sections to match the new edits.

      ${structureInstructions}
      `;
  } 
  // MODE 2: CREATION
  else {
      prompt = `
        Create a detailed lesson plan for the following context:
        Topic: ${input.topic}
        Subject: ${input.subject}
        Grade Level: ${input.gradeLevel}
        Unit Name: ${input.unitName}
        Standards/Goals: ${input.standards}
        Additional Context: ${input.context}
        
        ${input.links && input.links.length > 0 ? `Referenced Links: ${input.links.join(', ')}.` : ''}
        ${input.files && input.files.length > 0 ? `I have attached ${input.files.length} file(s) for reference. Please analyze the content within these files.` : ''}

        **INSTRUCTIONS:**
        1. Base the lesson plan strictly on the provided inputs. If Subject/Grade/Standards are missing, write "Not Specified".
        
        ${questioningContext}
        ${kaganContext}
        ${celContext}

        ${structureInstructions}
      `;
  }

  // Build the parts array for the user message
  const userParts: any[] = [{ text: prompt }];

  // Attach any files as inline data
  if (input.files && input.files.length > 0) {
      input.files.forEach(file => {
          userParts.push({
              inlineData: {
                  mimeType: file.mimeType,
                  data: file.data
              }
          });
      });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.7, 
        maxOutputTokens: 8192,
        tools: [{ googleSearch: {} }]
      },
      contents: [
        { role: 'user', parts: userParts }
      ]
    });

    if (response.text) {
        return response.text;
    } else {
        throw new Error("No response text generated");
    }

  } catch (error) {
    console.error("Error generating lesson plan:", error);
    throw error;
  }
};

export const generateResourceContent = async (strategy: StrategyNode, planContext: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        You are a teaching resource generator.
        
        **TASK:** Create a classroom worksheet/resource for the following Kagan Structure: "${strategy.label}".
        
        **LESSON CONTEXT:**
        ${planContext.substring(0, 2000)}...

        **STRATEGY DETAILS:**
        ${strategy.fullDefinition}
        Option A (Academic): ${strategy.optionA}
        Option B (Social): ${strategy.optionB}

        **INSTRUCTIONS:**
        Generate a clean, printable HTML-formatted list of items (questions, cards, or prompts) suitable for this strategy.
        If it's "Find Someone Who", create a grid of 9-12 items.
        If it's "Who Am I", create a list of identities with clues.
        If it's "Mix-N-Match", create pairs.
        
        Output ONLY the content in HTML format (no markdown code blocks), styled simply for printing.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text || "<p>Could not generate resource.</p>";
};
