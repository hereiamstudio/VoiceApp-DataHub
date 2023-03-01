import type {ReactNode} from 'react';
import type {QuestionType} from '@/types/question';
import type {RequestType} from '@/types/request';

export interface NetworkStatus {
    hasError: boolean;
    isLoading: boolean;
    isSuccessful: boolean;
}

// UI

export interface EventTracking {
    action: string;
    category: string;
    label?: string;
}

export interface Banner {
    text: string;
    cta?: CTA;
}

export type ButtonTheme =
    | 'primary'
    | 'secondary'
    | 'basic'
    | 'white'
    | 'grey'
    | 'destructive'
    | 'destructiveOnHover'
    | 'orderAndDestructiveOnHover';

export type ColourTheme =
    | 'gray'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'teal'
    | 'blue'
    | 'pink'
    | 'purple'
    | 'pink'
    | 'white';

export interface CTA {
    as?: string;
    children?: ReactNode;
    classes?: string;
    disabled?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
    id?: string;
    label?: string;
    labelFlex?: boolean;
    labelGrow?: boolean;
    state?: RequestType;
    track?: EventTracking;
    theme?: ButtonTheme;
    type?: 'button' | 'submit';
    url?: string;
    useDefaultStyles?: boolean;
    [key: string]: any;
}

export interface DataTable {
    createActions?: Function;
    createLinks?: Function;
    items?: {
        id: string;
        values: string[];
        context?: Object;
    }[];
    headings?: string[];
}

export interface DataList {
    actions?: CTA[];
    actionsLabel?: string;
    badges?: {
        theme: ColourTheme;
        title: string;
    }[];
    id?: string;
    subtitle?: string;
    title: string;
}

export interface EventProps {
    action?: string;
    category?: string;
    label?: string;
}

export interface ExceptionProps {
    description?: string;
    fatal?: boolean;
}

export interface ListFilter {
    title: string;
    field: string;
    options: {
        label: string;
        theme?: ColourTheme | string;
        value: boolean | number | string;
    }[];
}

export type ListFilters = ListFilter[];

export enum ModalVisibility {
    HIDDEN,
    VISIBLE,
    LEAVING
}

export interface Pagination {
    activePage: number;
    currentItems: number;
    itemsCountPerPage: number;
    onChange: Function;
    pageRangeDisplayed: number;
    pageUrl: string;
    skip: number;
    totalItemsCount: number;
    type: string;
}

export interface Toast {
    icon?: string;
    text: string;
    title: string;
    type?: 'default' | 'success' | 'error' | 'warning';
}
