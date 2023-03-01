import type {Timestamp} from '@/types/firebase';
import type {ActionUser} from '@/types/user';

export type InterviewStatus = 'draft' | 'active' | 'complete';

export type QuestionType = 'multi_code' | 'single_code' | 'free_text' | string;

export interface QuestionTranslation {
    [languageKey: string]: {
        description: string;
        options?: string[];
        title: string;
    };
}

export interface QuestionSkipLogic {
    action: 'skip_question' | string;
    id?: string;
    questionId?: string;
    type: 'all' | 'exactly' | 'any' | 'none' | string;
    values: string[];
}

export interface Question {
    created_at: Timestamp;
    created_by: ActionUser;
    description?: string;
    id?: string;
    interview: {
        id: string;
        title: string;
    };
    is_active: boolean;
    is_archived: boolean;
    is_custom: boolean;
    is_translated?: boolean;
    languages: string[];
    options?: string[] | any[];
    order: number;
    skip_logic?: QuestionSkipLogic[];
    title: string;
    translations?: QuestionTranslation;
    type: QuestionType;
    updated_at?: Timestamp;
    updated_by?: ActionUser;
}
