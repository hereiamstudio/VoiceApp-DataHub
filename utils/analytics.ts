import ReactGA from 'react-ga';
import type {EventProps, ExceptionProps} from '@/types/index';

export const initGA = (userId?: string) => {
    if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
        ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
            gaOptions: {
                userId: userId
            }
        });
    }
};

export const logPageView = () => {
    ReactGA.set({page: window.location.pathname});
    ReactGA.pageview(window.location.pathname);
};

export const logModalView = (name: string) => {
    ReactGA.set({page: window.location.pathname});
    ReactGA.modalview(name);
};

export const logEvent = ({action = '', category = '', label = ''}: EventProps) => {
    if (window.GA_INITIALIZED && category && action) {
        ReactGA.event({category, action, label});
    }
};

export const logException = ({description = '', fatal = false}: ExceptionProps) => {
    if (window.GA_INITIALIZED && description) {
        ReactGA.exception({description, fatal});
    }
};
