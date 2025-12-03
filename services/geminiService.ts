
import { GoogleGenAI } from "@google/genai";
import { LessonInput, StrategyNode } from "../types";

const getSystemInstruction = () => `
You are an expert curriculum designer, senior teacher, and **Biblical Scholar** at YISS. Your goal is to generate high-quality lesson plans that strictly adhere to the YISS Lesson Planner format.

**CRITICAL PERSONA FOR BIBLICAL INTEGRATION:**
When generating Section 4 (PAQ Method), you must act as a **Theologian-in-Residence**.
*   **Avoid superficial connections** (e.g., "God made math so calculate carefully").
*   **Avoid "proof-texting"** (finding a verse just because it shares a keyword).
*   **Focus on Redemptive History:** Connect the topic to Creation, Fall, Redemption, or Restoration.
*   **Focus on Teleology:** What is the ultimate *purpose* or *end goal* of this subject in God's economy?

**The Frameworks (Apply ONLY if selected by user):**

1.  **Effective Questioning Strategies:**
    *   Use the specific strategy/strategies selected by the user.
    *   Create specific questions relevant to the topic using these strategies.

2.  **CEL 5D+ Framework (University of Washington):**
    *   If specific dimensions are selected (e.g., Purpose, Engagement), prioritize those in the lesson design.
    *   If *none* are selected, focus on standard lesson structure.

3.  **Biblical Integration (PAQ Method) - MANDATORY SECTION:**
    *   You MUST ALWAYS generate Section 4: Biblical Integration Analysis.
    *   **P – PURPOSE:** Establishing the divine intent/Teleology.
    *   **A – ASSUMPTIONS:** Uncovering worldview/epistemological beliefs.
    *   **Q – QUESTIONS:** Ethical application and heart orientation.
    *   **Scholarship:** Provide hermeneutically sound exegesis.
    *   **Original Language:** If a specific Hebrew or Greek word helps bring the meaning to life (e.g., *Shalom*, *Logos*, *Teleios*, *Avodah*), include it with its definition.

**Critical Rules:**
*   **Grade Level Accuracy:** If the user does not provide a Grade Level, and it cannot be clearly inferred from uploaded files, you MUST write "Not Specified". Do NOT invent a grade level.
*   **Format:** Output strictly in Markdown. Do not wrap in JSON.
*   **Context Awareness:** You must analyze the specific content of uploaded files or user context. Quote specific parts of the lesson plan to show connection in the PAQ section.
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

  // Separate strategies by type for the prompt
  const questioningList = selectedStrategies.filter(s => !s.id.includes('cel') && !s.id.includes('paq'));
  const celList = selectedStrategies.filter(s => s.id.includes('cel'));
  
  // Format the selected strategies for the prompt
  const questioningContext = questioningList.length > 0 ? `
    **SELECTED QUESTIONING STRATEGIES:**
    ${questioningList.map(s => `- ${s.label}: ${s.description} (Usage: ${s.usage})`).join('\n')}
  ` : '';

  const celContext = celList.length > 0 ? `
    **SELECTED CEL 5D+ DIMENSIONS:**
    ${celList.map(s => `- ${s.label}: ${s.description}`).join('\n')}
  ` : '';

  // Check for specific PAQ selections to emphasize
  const pSelected = selectedStrategies.some(s => s.id === 'paq-p');
  const aSelected = selectedStrategies.some(s => s.id === 'paq-a');
  const qSelected = selectedStrategies.some(s => s.id === 'paq-q');

  // Determine if we are in "Specific Mode" (at least one PAQ selected)
  // If no specific PAQ is selected, we default to ALL three.
  const isSpecificPAQ = pSelected || aSelected || qSelected;

  // Dynamically build the Section 4 Template based on selection
  let paqTemplate = `## 2. Biblical Integration Analysis (PAQ Method)\n*(Deep analysis of the lesson content using the PAQ framework.)*`;

  if (!isSpecificPAQ || pSelected) {
    paqTemplate += `\n\n### P - Purpose (The Foundation)
*   **Divine Intent (Teleology):** [What is the ultimate purpose of this subject in God's creation? How does it reflect His nature (Order, Beauty, Justice, Truth)?]
*   **Scriptural Basis:** [Book Chapter:Verse]
    *   *Scholarly Exegesis:* [Provide a deep theological explanation of the passage. Do not just quote it. Explain the context and how it relates to the subject matter.]
    *   *Word Study (Mandatory if applicable):* [Hebrew/Greek word] - [Definition and nuance]
*   **Teacher Insight:** [Deep philosophical/theological explanation for the teacher. Connect the "What" of the lesson to the "Why" of the Kingdom. Explain the Redemptive Historical context.]
*   **Student Activity:**
    *   *Activity Description:* [Specific activity to deduce this purpose]
    *   *Pedagogical Rationale:* [Why this activity bridges the gap]
    *   *Facilitation:* [Brief steps]`;
  }

  if (!isSpecificPAQ || aSelected) {
    paqTemplate += `\n\n### A - Assumptions (The Logic Check)
*   **Worldview Analysis:** [Identify a secular claim, historical motive, or "unspoken belief" presented as fact in the subject matter.]
*   **Scripture for Comparison:** [Book Chapter:Verse]
    *   *Theological Contrast:* [How does the Biblical worldview challenge or fulfill the assumption identified above?]
*   **Teacher Insight:** [Deep explanation: How does the textbook's epistemology (how we know truth) or anthropology (view of man) differ from the Biblical view? Why is this distinction crucial?]
*   **Student Activity:**
    *   *Activity Description:* [Connect & Compare activity]
    *   *Pedagogical Rationale:* [Why this activity bridges the gap]
    *   *Facilitation:* [Brief steps]`;
  }

  if (!isSpecificPAQ || qSelected) {
    paqTemplate += `\n\n### Q - Questions (The Ethical Application)
*   **Essential Questions (Heart Orientation):**
    *(Provide at least 3 distinct, open-ended questions. Format exactly as follows)*:

    1.  **Question:** [Deep Question probing the student's heart/ethics regarding this specific topic]
        *   *Teacher Rationale:* [Explain to the teacher WHY this question is vital. How does it connect the specific academic concept to the Biblical Worldview? How should they guide the discussion?]

    2.  **Question:** [Deep Question regarding the application of this knowledge in a fallen world]
        *   *Teacher Rationale:* [Theological connection and facilitation tip.]

    3.  **Question:** [Question provoking personal responsibility or redemptive action]
        *   *Teacher Rationale:* [Theological connection and facilitation tip.]`;
  }

  let prompt = '';

  const structureInstructions = `
    **OUTPUT STRUCTURE (STRICT):**
    
    ## 1. Integration Strategy Highlights
    (A focused executive summary. Explain specifically HOW the user's selected Questioning Strategies and CEL 5D+ Dimensions have been applied to this specific topic. Do not just list definitions; show application.)

    ${paqTemplate}

    <<<FULL_PLAN_START>>>

    ## 3. Full Integrated Lesson Plan
    (The complete, refined lesson plan incorporating all the above elements into the standard YISS format: Topic, Standards, Objectives, Materials, Procedures, etc.)
  `;

  // MODE 1: REFINEMENT / EDITING
  if (refinementText && currentPlan) {
      prompt = `
      You are acting as a SURGICAL EDITOR for an existing lesson plan.
      
      **CURRENT LESSON PLAN (Context):**
      ${currentPlan}

      **USER REQUEST FOR CHANGES:**
      "${refinementText}"
      
      ${questioningContext}
      ${celContext}

      ${input.files && input.files.length > 0 ? `**NEWLY ATTACHED FILES:** The user has provided ${input.files.length} new files. Use information from these files to fulfill the request.` : ''}
      ${input.links && input.links.length > 0 ? `**NEWLY ATTACHED LINKS:** ${input.links.join(', ')}.` : ''}

      **STRICT EDITING RULES:**
      1. **ONLY** change the parts of the lesson plan relevant to the "User Request" or the newly selected strategies.
      2. **DO NOT** rewrite the Standards, Unit Name, Grade Level, or Topic unless explicitly asked.
      3. **DO NOT** hallucinate new information.
      4. **PRESERVE** the rest of the content exactly as is.

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
        
        ${input.links && input.links.length > 0 ? `Referenced Links (Youtube/Web): ${input.links.join(', ')}. Use Google Search to find relevant content if needed.` : ''}
        ${input.files && input.files.length > 0 ? `I have attached ${input.files.length} file(s) (Documents/Images/Audio/Video) for reference. Please analyze the content within these files to inform the lesson plan material, facts, and context.` : ''}

        **INSTRUCTIONS:**
        1. Base the lesson plan strictly on the provided inputs. If Subject/Grade/Standards are missing, write "Not Specified".
        
        ${questioningContext}
        ${celContext}

        **USER SELECTION LOGIC:**
        ${isSpecificPAQ ? 'User has selected specific PAQ methods. ONLY generate the sub-sections included in the template below.' : 'User has not filtered PAQ methods. Generate a comprehensive analysis covering P, A, and Q.'}

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
