import type {Timestamp} from '@/types/firebase';
import type {QuestionType} from '@/types/question';
import type {ActionUser} from '@/types/user';

export interface ResponseQuestion {
    id: string;
    order: number;
    title: string;
    type: QuestionType;
}

export interface ResponseAnswer {
    answer?: string;
    answers: string[];
    is_flagged: boolean;
    is_probing_question: boolean;
    is_proofed?: boolean;
    is_skipped: boolean;
    is_skipped_by_skip_logic?: boolean;
    is_starred: boolean;
    is_translated?: boolean;
    note?: string;
    order: number;
    proofed_at?: Timestamp;
    proofed_by?: ActionUser;
    original_answer?: string;
    original_answers?: string[];
    question: Partial<ResponseQuestion>;
    text?: string;
    total?: number;
    transcribed_answer?: string;
    type: QuestionType;
    used_transcription?: boolean;
}

export type ResponseGender = 'female' | 'male' | 'other';

export interface EnumeratorNote {
    is_proofed?: boolean;
    is_translated?: boolean;
    proofed_at?: Timestamp;
    proofed_by?: ActionUser;
    original_text: string;
    text: string;
}

export interface Response {
    age: number;
    answers: {
        [key: string]: ResponseAnswer;
    };
    consent_relationship: string;
    created_at: string;
    created_by: ActionUser;
    duration: number;
    end_time: string;
    enumerator_notes?: EnumeratorNote;
    gender: ResponseGender;
    id?: string;
    interview: {
        id: string;
        title: string;
    };
    is_beneficiary: boolean;
    original_consent_relationship?: string;
    original_gender?: string;
    primary_language?: string;
    project: {
        id: string;
        title: string;
    };
    start_time: string;
}
