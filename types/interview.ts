import type {ActionUser} from '@/types/user';
import {Timestamp} from './firebase';

export interface InterviewConsentConfirmationOption {
    is_correct: boolean;
    label: string;
    order: boolean;
}

export interface InterviewConsent {
    confirmation_options: InterviewConsentConfirmationOption[];
    confirmation_question: string;
    description: string;
    script: string;
    title: string;
}

export enum InterviewConsentSteps {
    TEMPLATE = 'template',
    STEP_1 = 'step_1',
    STEP_2 = 'step_2'
}

export type InterviewStatus = 'draft' | 'active' | 'complete' | string;

export interface Interview {
    assigned_users: ActionUser[] | string[];
    assigned_users_ids: string[];
    consent_step_1: InterviewConsent;
    consent_step_2: InterviewConsent;
    created_at: Timestamp;
    created_by: ActionUser;
    description: string;
    interviews_count: number;
    is_active: boolean;
    is_archived: boolean;
    locale: string;
    location: {
        country: string;
        region: string;
    };
    project: {
        id: string;
        title: string;
    };
    responses_count: number;
    primary_language: string;
    status: InterviewStatus;
    title: string;
    updated_at?: Timestamp;
    updated_by?: ActionUser;
}

export enum InterviewTabBarItem {
    OVERVIEW = 'overview',
    DETAILS = 'details',
    USERS = 'users',
    CONSENT = 'consent',
    QUESTIONS = 'questions',
    REPORT = 'report'
}

export enum OfflineLocales {
    'de-DE' = 'German (Germany)',
    'en-AU' = 'English (Australia)',
    'en-CA' = 'English (Canada)',
    'en-IN' = 'English (India)',
    'en-US' = 'English (US)',
    'en-GB' = 'English (UK)',
    'es-ES' = 'Spanish (Spain)',
    'es-US' = 'Spanish (US)',
    'fr-FR' = 'French (France)',
    'hi-IN' = 'Hindi (India) - हिन्दी (भारत)',
    'id-ID' = 'Indonesian (Indonesia)',
    'it-IT' = 'Italian (Italy)',
    'ja-JP' = 'Japanese (Japan) - 日本語（日本）',
    'nl-NL' = 'Dutch (Netherlands)',
    'pt-BR' = 'Portugese (Brazil)',
    'ru-RU' = 'Russian (Russia)',
    'ko-KR' = 'Korean (South Korea)',
    'yue-Hant-HK' = 'Cantonese (Hong Kong) - 廣東話（香港）',
    'zh-Hant-TW' = 'Chinese/Mandarin (Traditional, Taiwan) - 國語（台灣）',
    'zh-Hant' = 'Chinese/Mandarin (Traditional) - 普通话（中国大陆）'
}
