import type {Timestamp} from '@/types/firebase';

export interface ActionUser {
    first_name: string;
    id: string;
    last_name: string;
}

export enum ActivityAction {
    DELETE_EXPIRED_REPORT_FILE = 'Deleted an expired report export file',
    EXPORT_INTERVIEW_REPORT = 'Exported an interview report',
    EXPORT_PROJECT_INTERVIEWS_REPORT = 'Exported a project report',
    EXPORT_INTERVIEW_QUESTIONS = "Exported an interview's draft questions",
    EXPORT_USERS = 'Exported all users',
    ADD_INTERVIEW = 'Added an interview',
    EDIT_INTERVIEW = 'Edited an interview',
    ARCHIVE_INTERVIEW = 'Archived an interview',
    RESTORE_INTERVIEW = 'Restored an interview',
    ADD_QUESTION = 'Added a question',
    EDIT_QUESTION = 'Edited a question',
    ARCHIVE_QUESTION = 'Archived a question',
    RESTORE_QUESTION = 'Restored a question',
    ADD_PROJECT = 'Added a project',
    EDIT_PROJECT = 'Edited a project',
    ARCHIVE_PROJECT = 'Archived a project',
    RESTORE_PROJECT = 'Restored a project',
    ADD_TEMPLATE = 'Added a template',
    EDIT_TEMPLATE = 'Edited a template',
    ARCHIVE_TEMPLATE = 'Archived a template',
    RESTORE_TEMPLATE = 'Restored a template',
    ADD_USER = 'Added a user (invite pending)',
    EDIT_USER = 'Edited a user',
    ARCHIVE_USER = 'Archived a user',
    RESTORE_USER = 'Restored a user',
    PROOF_OPEN_RESPONSE = 'Proofed an open response',
    PROOF_ENUMERATOR_NOTE = 'Proofed an enumerator note',
    REGISTERED_ACCOUNT = 'Completed registration (via invite)'
}
export enum ActivityType {
    EXPORT = 'Export',
    INTERVIEW = 'Interview',
    PROJECT = 'Project',
    QUESTION = 'Question',
    RESPONSE = 'Response',
    REPORT = 'Report',
    TEMPLATE = 'Template',
    USER = 'User',
    SYSTEM = 'System'
}

export interface Activity {
    action: ActivityAction;
    created_at: Timestamp;
    created_by: ActionUser;
    info: {[key: string]: any};
    ip: string;
    note?: string;
    type: ActivityType;
}
