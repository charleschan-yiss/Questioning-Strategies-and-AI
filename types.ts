export interface StrategyNode {
  id: string;
  label: string;
  description?: string;
  fullDefinition?: string;
  usage?: string;
  pedagogicalValue?: string;
  children?: StrategyNode[];
}

export interface ReferenceFile {
  name: string;
  mimeType: string;
  data: string; // Base64 string
}

export interface LessonInput {
  unitName: string;
  topic: string;
  gradeLevel: string;
  subject: string;
  standards: string;
  context: string;
  files: ReferenceFile[];
  links: string[];
}

export interface GeneratedPlan {
  markdown: string;
  strategyUsed: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR
}