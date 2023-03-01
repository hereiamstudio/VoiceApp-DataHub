import type {Timestamp} from '@/types/firebase';
import type {QuestionType} from '@/types/question';
import type {ActionUser} from '@/types/user';

export enum ReportExportFields {
    PROJECT = 'project',
    INTERVIEW = 'interview',
    QUESTION_TITLE = 'title',
    QUESTION_ANSWER = 'answer',
    QUESTION_IS_SKIPPED = 'skipped',
    QUESTION_IS_IGNORED = 'ignored',
    ENUMERATOR_ID = 'enumerator_id',
    ENUMERATOR_NAME = 'enumerator_name',
    ENUMERATOR_NOTES = 'enumerator_notes',
    AGE = 'age',
    GENDER = 'gender',
    CONSENT_RELATIONSHIP = 'consent_relationship',
    beneficIARY = 'beneficiary',
    START_TIME = 'start_time',
    END_TIME = 'end_time',
    QUESTION_IS_FLAGGED = 'flagged',
    QUESTION_IS_STARRED = 'starred',
    QUESTION_ORIGINAL_ANSWER = 'original_answer',
    QUESTION_TRANSLATED = 'translated',
    QUESTION_TRANSCRIPTION = 'used_transcription',
    QUESTION_IS_PROOFED = 'proofed'
}

export interface ReportOpenResponse {
    [probingQuestionId: string]: {
        [responseId: string]: {
            answer: string;
            id: string;
            is_flagged: boolean;
            is_starred: boolean;
            is_proofed?: boolean;
            original_answer?: string;
            proofed_at: Timestamp | string;
            proofed_by: ActionUser | string;
            transcribed_answer?: string;
            used_transcription?: boolean;
        };
    };
}

export interface ReportQuestion {
    id: string;
    number: number;
    options_selected: {
        count: number;
        title: string | {[language: string]: string};
    }[];
    parent_question_number?: number;
    title: {[language: string]: string};
    total_answers: number;
    total_ignores: number;
    total_flags: number;
    total_skips: number;
    type: QuestionType;
}

export interface ReportProbingQuestion {
    [probingQuestionParentId: string]: {
        [probingQuestionId: string]: ReportQuestion;
    }[];
}

export interface ReportFlaggedOrStarredQuestion {
    [questionId: string]: {
        answer: string;
        id: string;
        question: string;
    };
}

export interface ReportSkippedQuestion {
    answer: string;
    total: number;
}

export interface Report {
    additional_consent_percent: string;
    average_duration: number;
    beneficiaries_percent: string;
    end_date: number;
    enumerator_notes: string[];
    flaggedQuestions: ReportFlaggedOrStarredQuestion[];
    genders_count: {
        female: number;
        male: number;
        other: number;
    };
    genders_percent: {
        female: string;
        male: string;
        other: string;
    };
    id?: string;
    openResponses: ReportOpenResponse[];
    openResponsesOrdered: {
        [questionId: string]: string;
    };
    probingQuestions: ReportProbingQuestion[];
    questions: ReportQuestion[];
    respondents_count: number;
    skippedQuestions: ReportSkippedQuestion[];
    starredQuestions: ReportFlaggedOrStarredQuestion[];
    start_date: number;
    total_ignores_count: number;
    total_flags_count: number;
    total_skips_count: number;
}
