import type {Timestamp} from '@/types/firebase';
import type {QuestionType} from '@/types/question';
import type {ActionUser} from '@/types/user';

export enum TemplateType {
    CONSENT = 'consent',
    PROBING_QUESTION = 'probing_question',
    QUESTION = 'question'
}

export interface Template {
    created_at: Timestamp;
    created_by: ActionUser;
    id: string;
    is_archived: boolean;
    primary_language?: string;
    title: string;
    type: TemplateType;
    updated_at?: Timestamp;
    updated_by?: ActionUser;
    usage: string;
}

export interface ConsentTemplate extends Template {
    question_description: string;
    question_options: string[];
    question_title: string;
    question_type: QuestionType;
}

export interface QuestionTemplate extends Template {
    question_description: string;
    question_options: string[] | any[];
    question_title: string;
    question_type: QuestionType;
}
