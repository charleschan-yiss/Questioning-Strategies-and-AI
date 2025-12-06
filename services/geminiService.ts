import { GoogleGenAI } from "@google/genai";
import { LessonInput, StrategyNode, StrategySuggestion } from "../types";
import { strategies } from "../data/strategies";

// Helper to flatten the strategy tree into a lightweight list for the AI
const flattenStrategies = (nodes: StrategyNode[]): {id: string, label: string, desc: string}[] => {
    let flat: {id: string, label: string, desc: string}[] = [];
    nodes.forEach(node => {
        // We only want leaf nodes (strategies), not categories, generally. 
        // But if a node has children, we check them.
        if (node.children && node.children.length > 0) {
            flat = [...flat, ...flattenStrategies(node.children)];
        } else {
            flat.push({
                id: node.id,
                label: node.label,
                desc: node.description || node.fullDefinition || ""
            });
        }
    });
    return flat;
};

const getSystemInstruction = () => `
You are an expert curriculum designer, senior teacher, and **Distinguished Biblical Scholar** (specifically modeling the theological depth and tone of **N.T. Wright**). Your goal is to generate high-quality lesson plans that strictly adhere to the YISS Lesson Planner format.

**CORE DIRECTIVE: DEEP, EXPERT INTEGRATION**
You are NOT just a content generator; you are a **Mentor Teacher**. When you use a strategy (CEL 5D+, Kagan, Questioning), you must do more than list it. You must **weave it** into the lesson and explain the **pedagogical reasoning** behind it.

**CRITICAL PERSONA FOR BIBLICAL INTEGRATION (PAQ):**
When generating the Biblical Integration Analysis, you must act as a **Theologian-in-Residence**.
*   **Theological Lens (N.T. Wright Style):** Do not provide shallow moralisms or simple proof-texting. Instead, frame the academic content within the **Grand Narrative of Scripture**: *Creation, Fall, Israel, Jesus, and New Creation*.
*   **Key Themes:**
    *   **Vocation (Imago Dei):** How does mastering this subject help the student act as a genuine image-bearer, reflecting God's wise rule into the world?
    *   **New Creation:** How does this truth anticipate the renewed world? Avoid dualism (separating "spiritual" from "secular"). Show how *this specific topic* matters to God's good creation.
    *   **Epistemology of Love:** How does knowing this truth require us to love the object of our study more?
*   **Teacher Insight:** Write a **substantial, scholarly commentary** (300-400 words) for the teacher. Use academic theological terms (e.g., *Eschatology*, *Teleology*, *Covenant*, *Idolatry*, *Common Grace*) but explain them clearly.
*   **Student Activities:** These must be **deeply formative**. Move beyond "read a verse." Design activities that shape the student's *habits of heart* and *worldview*.

**STRATEGY INTEGRATION RULES (Apply ONLY if selected by user):**

1.  **Effective Questioning Strategies:**
    *   **Cognitive Lift:** Explain *why* a specific questioning technique was chosen.
    *   **Scripting:** Provide specific, high-level questions verbatim.

2.  **CEL 5D+ Framework (University of Washington):**
    *   **Operationalize It:** Do not just list the dimension. Explain the **Teacher Move**.
    *   *Example:* If "Student Engagement" is selected, write: "The teacher facilitates intellectual engagement by assigning a complex task where students must rely on each other (positive interdependence), rather than passive listening."

3.  **Instructional Strategies (Kagan):**
    *   **The "Why":** Explain the social/academic benefit. (e.g., "Fan-N-Pick is used here to ensure equal participation and immediate peer coaching, preventing 'hitchhiking'.")
    *   **Classbuilding (Dual Option):** If a classbuilding strategy is selected, you MUST provide BOTH an "Option A: Academic" (tied to lesson content) and "Option B: Social/Fun" (brain break) variation.

4.  **Biblical Integration (PAQ Method):**
    *   **P – PURPOSE (Teleology):** What is the *divine intent* for this exact subject matter? Why does it exist in God's economy?
    *   **A – ASSUMPTIONS (Worldview):** Uncover hidden worldview assumptions in the secular curriculum (e.g., Naturalism, Relativism, Humanism).
    *   **Q – QUESTIONS (Ethics & Application):** Craft Essential Questions that provoke ethical reasoning and worldview formation.

**Critical Rules:**
*   **Grade Level Accuracy:** If the user does not provide a Grade Level, and it cannot be clearly inferred from uploaded files, you MUST write "Not Specified". Do NOT invent a grade level.
*   **Format:** Output strictly in Markdown. Do not wrap in JSON.
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
  
  // Kagan Lists
  // Generic Kagan structures (Review, Discussion, Thinking)
  const kaganList = selectedStrategies.filter(s => s.id.includes('kagan') && !s.optionA); // Exclude classbuilding which has options
  // Classbuilding Kagan structures
  const kaganClassbuildingList = selectedStrategies.filter(s => s.id.includes('kagan') && s.optionA);

  // Questioning list MUST exclude CEL, PAQ, AND ALL Kagan
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
    ${kaganList.map(s => `- ${s.label}: ${s.fullDefinition} (Script: ${s.teacherScript})`).join('\n')}
  ` : '';

  const kaganClassContext = kaganClassbuildingList.length > 0 ? `
    **SELECTED KAGAN CLASSBUILDING STRUCTURES:**
    ${kaganClassbuildingList.map(s => `
        - ${s.label}: ${s.fullDefinition}
          (Teacher Script: ${s.teacherScript})
          (Academic Goal: ${s.optionA})
          (Social Goal: ${s.optionB})
    `).join('\n')}
  ` : '';

  const celContext = celList.length > 0 ? `
    **SELECTED CEL 5D+ DIMENSIONS:**
    ${celList.map(s => `- ${s.label}: ${s.description} (Pedagogical Value: ${s.pedagogicalValue})`).join('\n')}
  ` : '';

  // 3. Configure PAQ Logic
  const isPaqRootSelected = selectedStrategies.some(s => s.id === 'paq-method-root');
  const isAnyPAQ = paqList.length > 0 || isPaqRootSelected;
  
  const pSelected = isPaqRootSelected || paqList.some(s => s.id === 'paq-p');
  const aSelected = isPaqRootSelected || paqList.some(s => s.id === 'paq-a');
  const qSelected = isPaqRootSelected || paqList.some(s => s.id === 'paq-q');

  let paqTemplate = '';

  if (isAnyPAQ) {
      paqTemplate = `## Biblical Integration Analysis (PAQ Method)
      (NOTE: Write as a Distinguished Scholar (N.T. Wright Persona). Provide DEEP analysis, Extensive Scriptural Exegesis, Original Languages, and Robust Application.)`;
      
      if (pSelected || !isAnyPAQ) {
        paqTemplate += `\n\n### P - Purpose (Teleology & Design)
*   **Divine Intent (Detailed Teleology):** (Provide a deep analysis of the *Telos* of this subject. How does it reflect God's wisdom, order, or beauty? Use the concept of *New Creation*—how will this subject matter in the renewed earth?)
*   **Theological Framework:** (Connect explicitly to Creation, Fall, Redemption, or Restoration.)
*   **Scriptural Foundation & Exegesis:** (Quote full passage(s). Provide a solid paragraph of exegesis. Do not just cite; explain the context and why it applies here.)
*   **Original Language Insight:** (Identify a relevant Greek/Hebrew term—e.g., *Logos, Tzelem, Oikonomia*—define it, and explain its nuance here.)
*   **Teacher Insight:** (Write a comprehensive 300+ word theological reflection. Discuss how teaching this topic well is an act of "Vocational Holiness" or "Royal Priesthood".)
*   **Student Activity Implementation:** (Create a detailed, step-by-step activity guide. Include: 1. Activity Title, 2. Materials Needed, 3. Step-by-Step Procedure, 4. Debrief Questions that explicitly connect the activity to the theological purpose.)`;
      }
      if (aSelected || !isAnyPAQ) {
        paqTemplate += `\n\n### A - Assumptions (Worldview Critique)
*   **Underlying Secular Assumptions:** (Analyze the curriculum deeply. Identify "Idols" of the age—Naturalism, Individualism, Consumerism. How does the standard view distort reality?)
*   **Christian Counter-Narrative (Subversive Fulfillment):** (How does the Christian worldview tell a "better story" that fulfills the longing behind the secular error while correcting the distortion?)
*   **Scriptural Defense:** (Quote full passage(s) that refute the secular view or support the Christian view.)
*   **Teacher Insight:** (Write a comprehensive 300+ word deep dive into the history of ideas regarding this topic. Help the teacher understand the "worldview war" at play.)
*   **Student Activity Implementation:** (Create a "Worldview Detective" or critique activity. Include: 1. Objective, 2. Specific media/text to analyze, 3. Step-by-Step instructions on how to lead the critique, 4. Guiding questions for students.)`;
      }
      if (qSelected || !isAnyPAQ) {
        paqTemplate += `\n\n### Q - Questions (Ethical Application)
*   **Essential Ethical Questions:** (Draft 3-4 complex, multi-layered questions that have no easy answer. These should force students to wrestle with *Virtue* and *Kingdom Ethics*.)
*   **Teacher Insight:** (Write a robust 300+ word explanation of the ethical frameworks necessary to answer these questions from a Christ-centered perspective. Discuss "Virtue Formation" and "Habits of the Heart".)
*   **Student Activity Implementation:** (Design a Case Study, Debate, or Ethical Lab. Include: 1. Scenario Description, 2. Rules of Engagement, 3. Step-by-Step Flow of the activity, 4. Conclusion/Reflection prompt.)`;
      }
  }

  // 4. Configure Output Structure
  const structureInstructions = `
    **OUTPUT STRUCTURE (STRICT) - USE "<<<SECTION_BREAK>>>" TO SEPARATE SECTIONS:**

    ## Full Integrated Lesson Plan
    (The complete, refined lesson plan. WEAVE the selected strategies into the procedures. Do not just list them; explain their integration as a Master Teacher would.)

    <<<SECTION_BREAK>>>

    ${celList.length > 0 ? `
    ## CEL 5D+ Framework
    (MANDATORY: Provide a detailed breakdown of the selected CEL 5D+ Dimensions: ${celList.map(s => s.label).join(', ')}. For each, explain the specific Teacher Move and Student Evidence for this lesson.)
    ` : 'NO_CEL_STRATEGIES'}

    <<<SECTION_BREAK>>>

    ${questioningList.length > 0 ? `
    ## Questioning Strategy Integration Guide
    (Deep dive on Questioning Strategies. Explain the 'Cognitive Lift' of the questions. Why were these specific strategies chosen for this content?)
    ` : 'NO_QUESTIONING_STRATEGIES'}

    <<<SECTION_BREAK>>>

    ${isAnyPAQ ? paqTemplate : 'NO_PAQ_ANALYSIS'}

    <<<SECTION_BREAK>>>

    ${(kaganList.length > 0 || kaganClassbuildingList.length > 0) ? `
    ## Instructional Strategy Integration Guide
    (This is the top-level header for all cooperative learning strategies.)

    ${kaganList.length > 0 ? `
    ### Kagan Structures Integration
    (Detailed instructions. Explain the 'Pedagogical Why'—how this structure enhances engagement or accountability for this specific lesson.)
    ` : ''}

    ${kaganClassbuildingList.length > 0 ? `
    ### Kagan Classbuilding Integration
    (Detailed instructions for: ${kaganClassbuildingList.map(s => s.label).join(', ')}.)
    (CRITICAL: For each Classbuilding strategy, you MUST provide "Option A: Academic" AND "Option B: Social" variations.)
    ` : ''}
    ` : 'NO_INSTRUCTIONAL_STRATEGIES'}

    <<<SECTION_BREAK>>>

    ## Integration Highlights Summary
    (Brief summary of the frameworks used.)
  `;

  let prompt = '';

  if (refinementText && currentPlan) {
      prompt = `
      You are acting as a SURGICAL EDITOR.
      **CURRENT PLAN:** ${currentPlan}
      **USER REQUEST:** "${refinementText}"
      ${questioningContext}
      ${kaganContext}
      ${kaganClassContext}
      ${celContext}
      **STRICT EDITING RULES:** Only change what is requested.
      ${structureInstructions}
      `;
  } else {
      // Logic for "Auto-Fill" if lists are empty but user wants a plan
      // If NO strategies selected at all, we can ask AI to pick best ones.
      const autoFillInstructions = (selectedStrategies.length === 0) 
        ? "NOTE: The user has NOT selected specific strategies. You must ANALYZE the lesson content and AUTO-SELECT the most appropriate Questioning, PAQ, and Kagan strategies to enhance this lesson. Fulfill all sections of the Output Structure using your best judgment." 
        : "";

      prompt = `
        Create a lesson plan.
        Topic: ${input.topic}
        Subject: ${input.subject}
        Grade: ${input.gradeLevel}
        Standards: ${input.standards}
        Context: ${input.context}
        
        ${autoFillInstructions}

        ${questioningContext}
        ${kaganContext}
        ${kaganClassContext}
        ${celContext}

        ${structureInstructions}
      `;
  }

  const userParts: any[] = [{ text: prompt }];
  if (input.files && input.files.length > 0) {
      input.files.forEach(file => {
          userParts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
      });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Upgraded for complex reasoning
      config: { systemInstruction: getSystemInstruction(), temperature: 0.7, maxOutputTokens: 8192 },
      contents: [{ role: 'user', parts: userParts }]
    });
    return response.text || "No response text generated";
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    throw error;
  }
};

export const suggestStrategies = async (input: LessonInput, userPurpose?: string): Promise<StrategySuggestion[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Get all available strategies as a flat list for the AI to choose from
    const allStrategies = flattenStrategies(strategies);
    const strategiesContext = allStrategies.map(s => `${s.id}: ${s.label} - ${s.desc}`).join('\n');

    const prompt = `
      You are an expert instructional coach. 
      Analyze the teacher's lesson inputs below and recommend the BEST teaching strategies from the provided list that would most improve student engagement and learning outcomes for this specific topic.

      ${userPurpose ? `**USER GOAL:** The teacher specifically wants to achieve: "${userPurpose}". **INSTRUCTION:** If the user specifies a number (e.g., "give me 5"), provide exactly that many. If no number is specified, provide exactly 3.` : 'Select exactly 3 strategies.'}

      **TEACHER INPUT:**
      Topic: ${input.topic}
      Subject: ${input.subject}
      Grade: ${input.gradeLevel}
      Context: ${input.context}
      
      **AVAILABLE STRATEGIES:**
      ${strategiesContext}

      **INSTRUCTIONS:**
      1. Select strategies that are a perfect fit.
      2. Return ONLY a JSON array. 
      3. Format: [{ "id": "strategy-id", "label": "Strategy Name", "rationale": "One sentence explaining why this fits.", "action": "A brief actionable tip." }]
    `;

    const userParts: any[] = [{ text: prompt }];
    // Attach files if they exist so the AI can read the lesson plan to make better suggestions
    if (input.files && input.files.length > 0) {
        input.files.forEach(file => {
            userParts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Upgraded for better reasoning
            config: { 
                temperature: 0.5, 
                responseMimeType: "application/json" 
            },
            contents: [{ role: 'user', parts: userParts }]
        });

        if (response.text) {
            const suggestions = JSON.parse(response.text);
            return suggestions;
        }
        return [];
    } catch (error) {
        console.error("Error suggesting strategies:", error);
        throw error;
    }
};

export const generateResourceContent = async (
    strategy: StrategyNode, 
    lessonPlanMarkdown: string,
    customInstructions?: string,
    gradeLevel?: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        You are a world-class educational designer and typography expert.
        
        CONTEXT:
        The teacher is using the cooperative learning strategy: "${strategy.label}" (${strategy.description}).
        Target Audience: Grade ${gradeLevel || 'level implied by content'}.
        
        TEACHER'S CUSTOM INSTRUCTIONS:
        "${customInstructions || 'Create a general activity based on the lesson plan.'}"

        TASK:
        Create a high-quality, print-ready HTML/CSS resource worksheet specifically for this strategy.
        
        STRICT DESIGN & FORMATTING RULES:
        1. **Output Format**: Return ONLY pure, valid HTML code with embedded CSS. Do NOT use markdown code blocks.
        2. **CSS Styling**:
           - Use 'Arial', 'Helvetica', sans-serif for legibility.
           - **Print Optimization**: Use @media print settings to ensure backgrounds print and margins are correct (0.5in).
           - **Borders**: Use thick (2px or 3px) black solid borders for cut-out cards or bingo grids.
           - **Spacing**: Ensure ample whitespace for students to write.
           - **Cards**: If the strategy is "Fan-N-Pick", "Quiz-Quiz-Trade", or "Flashcards", create a grid of cards (e.g., 2x4 or 2x3 per page) with dashed lines for cutting.
           - **Grids**: If the strategy is "Find Someone Who", create a neat 3x3 or 4x4 grid.
           - **Typography**: Headers should be bold and distinct. Content text should be at least 12pt.
        3. **Content Quality**:
           - No spelling errors.
           - Content must be factually accurate based on the lesson plan.
           - Tone should be age-appropriate for Grade ${gradeLevel}.
        
        LESSON PLAN SOURCE MATERIAL:
        ${lessonPlanMarkdown}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Upgraded for high-quality HTML generation
            config: { temperature: 0.4 }, // Lower temperature for precision
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        
        let text = response.text || "<h1>Error generating resource</h1>";
        // Clean up markdown code blocks if present (just in case)
        text = text.replace(/```html/g, '').replace(/```/g, '');
        return text;
    } catch (error) {
        console.error("Error generating resource:", error);
        throw error;
    }
};

export const generateWorksheet = async (
    lessonPlanMarkdown: string, 
    gradeLevel: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        You are an expert curriculum developer.
        
        TASK:
        Create a high-quality, student-facing worksheet based on the lesson plan provided below.
        Target Audience: Grade ${gradeLevel || 'level as implied by content'}.
        
        REQUIREMENTS:
        1. **Professional Header:** Include spaces for Name, Date, and Class.
        2. **Sections:** Include clear sections for:
           - Instructions
           - Key Concepts / Vocabulary (with space for definitions)
           - Main Activity / Questions (numbered, with space for writing answers)
           - Reflection or Exit Ticket
        3. **Tone:** Student-friendly, encouraging, and clear.
        4. **Format:** Output in clean MARKDOWN. Use tables where appropriate.
        
        LESSON PLAN SOURCE:
        ${lessonPlanMarkdown}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Upgraded for better document structuring
            config: { temperature: 0.5 },
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        
        return response.text || "Failed to generate worksheet.";
    } catch (error) {
        console.error("Error generating worksheet:", error);
        throw error;
    }
};