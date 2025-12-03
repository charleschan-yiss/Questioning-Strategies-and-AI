import { GoogleGenAI } from "@google/genai";
import { LessonInput, StrategyNode } from "../types";

const getSystemInstruction = () => `
You are an expert curriculum designer and senior teacher at YISS. Your goal is to generate high-quality lesson plans that strictly adhere to the YISS Lesson Planner format while deeply integrating specific "Effective Questioning Strategies" and the "CEL 5D+ Framework".

**The Frameworks you must apply:**

1.  **Effective Questioning Strategies:**
    *   Use the specific strategy/strategies selected by the user.
    *   Create specific questions relevant to the topic using these strategies.

2.  **CEL 5D+ Framework (University of Washington):**
    *   **Purpose:** Standards, Learning Targets, Teaching Points.
    *   **Student Engagement:** Intellectual Work, Engagement Strategies, Talk.
    *   **Curriculum & Pedagogy:** Curriculum, Teaching Approaches, Scaffolds.
    *   **Assessment:** Self-Assessment, Observables, Adjustments.
    *   **Classroom Environment:** Physical Env, Routines, Culture.

3.  **Biblical Integration (PAQ Method) - MANDATORY:**
    *   **P – PURPOSE:** Establishing the divine intent. Why does this exist?
    *   **A – ASSUMPTIONS:** Uncovering worldview beliefs in the material.
    *   **Q – QUESTIONS:** Ethical application and personal response.
    *   **Scriptural Foundation:** You MUST attach appropriate Biblical passages to the integration.
    *   **Exegesis:** Explain the important ideas behind the passage for the teacher.
    *   **Original Language:** If a specific Hebrew or Greek word helps bring the meaning to life (e.g., *Shalom*, *Logos*, *Teleios*, *Avodah*), include it with its definition.
    *   **Teacher Insight:** For each section (P, A), provide a "Teacher Insight" block. This is NOT an activity. It is a guide for the teacher on the philosophical/theological "How" and "Why" this integration connects to the specific lesson topic.
    *   *Avoid "Parallel" integration (e.g., just adding a verse).*

**Critical Rules:**
*   **Grade Level Accuracy:** If the user does not provide a Grade Level, and it cannot be clearly inferred from uploaded files, you MUST write "Not Specified". Do NOT invent a grade level.
*   **Format:** Output strictly in Markdown. Do not wrap in JSON.
*   **PAQ Integration:** You MUST provide the PAQ analysis (Section 4) at the end of every response. ONLY include the sub-sections (P, A, or Q) that are requested in the prompt template below.
*   **Context Awareness:** You must analyze the specific content of uploaded files or user context. Quote specific parts of the lesson plan to show connection in the PAQ section.
`;

export const generateLessonPlan = async (input: LessonInput, selectedStrategies: StrategyNode[], refinementText?: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Format the selected strategies for the prompt
  const strategyContext = selectedStrategies.map(s => `
    - **Strategy Name:** ${s.label}
    - **Description:** ${s.description}
    - **Usage Instruction:** ${s.usage}
  `).join('\n');

  // Check for specific PAQ selections to emphasize
  const pSelected = selectedStrategies.some(s => s.id === 'paq-p');
  const aSelected = selectedStrategies.some(s => s.id === 'paq-a');
  const qSelected = selectedStrategies.some(s => s.id === 'paq-q');

  // Determine if we are in "Specific Mode" (at least one PAQ selected)
  // If no specific PAQ is selected, we default to ALL three.
  const isSpecificPAQ = pSelected || aSelected || qSelected;

  // Dynamically build the Section 4 Template based on selection
  let paqTemplate = `## 4. Biblical Integration Analysis (PAQ Method)\n*(Analyze the lesson content using the PAQ framework. Quote specific parts of the lesson plan to show connection.)*`;

  if (!isSpecificPAQ || pSelected) {
    paqTemplate += `\n\n### P - Purpose (The Foundation)
*   **Divine Intent:** [What foundational truth governs this aspect of reality?]
*   **Scriptural Basis:** [Book Chapter:Verse]
    *   *Context/Key Idea:* [Explain the theological context for the teacher]
    *   *Word Study (If applicable):* [Hebrew/Greek word] - [Definition/Nuance]
*   **Teacher Insight:** [Deep explanation for the teacher: HOW to weave this truth into the fabric of the lesson and WHY it transforms the understanding of the subject matter.]
*   **Student Activity:** [Specific activity to deduce this purpose]`;
  }

  if (!isSpecificPAQ || aSelected) {
    paqTemplate += `\n\n### A - Assumptions (The Logic Check)
*   **Worldview Analysis:** [Identify a claim or hidden belief in the subject matter]
*   **Scripture for Comparison:** [Book Chapter:Verse] - [Brief connection]
*   **Teacher Insight:** [Deep explanation: How does the textbook's perspective differ from or align with the Biblical one? Why is this distinction crucial for the student's worldview?]
*   **Connect & Compare:** [Activity to compare this against the Foundational Truth]`;
  }

  if (!isSpecificPAQ || qSelected) {
    paqTemplate += `\n\n### Q - Questions (The Ethical Application)
*   **Essential Questions:**
    1. [Ethical/Personal Question 1]
    2. [Ethical/Personal Question 2]`;
  }

  const textPrompt = `
    Create a detailed lesson plan for the following context:
    Topic: ${input.topic}
    Subject: ${input.subject}
    Grade Level: ${input.gradeLevel}
    Unit Name: ${input.unitName}
    Standards/Goals: ${input.standards}
    Additional Context: ${input.context}
    ${refinementText ? `\nUSER REFINEMENT REQUEST: "${refinementText}"\nPlease adjust the plan to address this request specifically.\n` : ''}
    
    ${input.links && input.links.length > 0 ? `Referenced Links (Youtube/Web): ${input.links.join(', ')}. Use Google Search to find relevant content if needed.` : ''}
    ${input.files && input.files.length > 0 ? `I have attached ${input.files.length} file(s) (Documents/Images/Audio/Video) for reference. Please analyze the content within these files to inform the lesson plan material, facts, and context.` : ''}

    **CRITICAL REQUIREMENT 1: Questioning Strategies**
    You must actively incorporate the following selected strategies into the lesson plan's questioning and activities:
    ${strategyContext}
    Ensure these strategies are explicitly named in the "Lesson Flow" section when used (e.g., "**Key Questions (Six Hats - Red)**").

    **CRITICAL REQUIREMENT 2: Biblical Integration (PAQ Method)**
    You MUST generate "Section 4: Biblical Integration Analysis" at the end, strictly following the template below.
    ${isSpecificPAQ ? 'User has selected specific PAQ methods. ONLY generate the sub-sections included in the template below.' : 'User has not filtered PAQ methods. Generate a comprehensive analysis covering P, A, and Q.'}

    Use this specific structure for Section 4:
    ${paqTemplate}
  `;

  // Build the parts array for the user message
  const userParts: any[] = [{ text: textPrompt }];

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