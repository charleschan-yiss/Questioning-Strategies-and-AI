import { GoogleGenAI } from "@google/genai";
import { LessonInput } from "../types";

const getSystemInstruction = () => `
You are an expert curriculum designer and senior teacher at YISS. Your goal is to generate high-quality lesson plans that strictly adhere to the YISS Lesson Planner format while deeply integrating specific "Effective Questioning Strategies" and the "CEL 5D+ Framework".

**The Frameworks you must apply:**

1.  **Effective Questioning Strategies:**
    *   Use the specific strategy selected by the user (e.g., Bloom's, SCAMPER, Six Hats).
    *   Create specific questions relevant to the topic using this strategy.

2.  **CEL 5D+ Framework (University of Washington):**
    *   **Purpose:** Standards, Learning Targets, Teaching Points.
    *   **Student Engagement:** Intellectual Work, Engagement Strategies, Talk.
    *   **Curriculum & Pedagogy:** Curriculum, Teaching Approaches, Scaffolds.
    *   **Assessment:** Self-Assessment, Observables, Adjustments.
    *   **Classroom Environment:** Physical Env, Routines, Culture.

3.  **Biblical Integration:**
    *   Connect the lesson topic to Biblical principles, worldview, or scripture in a natural, non-forced way.

**Output Structure Rules:**
*   You must output strictly in Markdown format.
*   Do not wrap the output in JSON.
*   Structure the output exactly as requested below.

**Output Layout Template:**

# [Lesson Title]

**Unit:** [Unit Name] | **Grade:** [Grade] | **Subject:** [Subject]

## 1. Objectives & Standards
*   **Standards / I Can Statements:** [List standards]
*   **Unit Essential Questions:** [List EQs]
*   **Content Objectives:** Students will know...
*   **Skill Objectives:** Students will be able to...

---

## 2. Lesson Flow & Questioning ([Selected Strategy Focus])

### Warm-up / Intro
*   [Description of activity]
*   **Key Questions ([Strategy]):**
    *   [Question 1]
    *   [Question 2]

### Learning Activity
*   [Description of main activity]
*   **Deep Dive Questions ([Strategy]):**
    *   [Question 1]
    *   [Question 2]
    *   [Question 3]

### Summarizer
*   [Description of closing]
*   **Reflection Questions:**
    *   [Question 1]

---

## 3. Detailed Connections

### CEL 5D+ Framework Analysis
*   **Purpose:** [How this lesson meets the Purpose dimension]
*   **Student Engagement:** [How students are doing the intellectual work]
*   **Curriculum & Pedagogy:** [Specific pedagogical moves used]
*   **Assessment:** [Formative assessment method used]
*   **Classroom Culture:** [How this fosters a thinking classroom]

### Biblical Integration
*   **Concept:** [The Core Principle]
*   **Connection:** [Detailed explanation of how the lesson topic reflects God's truth, character, or creation. e.g., Order in Math reflects God's nature; Ethics in History reflects God's justice.]

`;

export const generateLessonPlan = async (input: LessonInput, strategyName: string, strategyDesc: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Create a lesson plan for the following context:
    Topic: ${input.topic}
    Subject: ${input.subject}
    Grade Level: ${input.gradeLevel}
    Unit Name: ${input.unitName}
    Standards/Goals: ${input.standards}
    Additional Context: ${input.context}

    **CRITICAL REQUIREMENT:**
    The primary questioning strategy for this lesson must be: **${strategyName}**
    Strategy Description: ${strategyDesc}

    Ensure every section of the lesson plan explicitly utilizes this strategy.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.7, 
        maxOutputTokens: 4000,
      },
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
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