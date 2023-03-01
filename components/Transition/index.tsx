/**
 * https://gist.github.com/adamwathan/3b9f3ad1a285a2d1b482769aeb862467
 */
import {CSSTransition as ReactCSSTransition} from 'react-transition-group';
import {createContext, ReactNode, useRef, useEffect, useContext} from 'react';

interface Props {
    containerClasses?: string;
    show?: boolean;
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    isInitialRender?: boolean;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
    appear?: boolean;
    children: ReactNode;
}

interface ContextProps {
    parent: Partial<Props>;
}

const TransitionContext = createContext<ContextProps>({
    parent: {}
});

const useIsInitialRender = () => {
    const isInitialRender = useRef(true);

    useEffect(() => {
        isInitialRender.current = false;
    }, []);

    return isInitialRender.current;
};

const CSSTransition: React.FC<Props> = ({
    containerClasses = '',
    show,
    enter = '',
    enterFrom = '',
    enterTo = '',
    leave = '',
    leaveFrom = '',
    leaveTo = '',
    appear,
    children
}: Props) => {
    const nodeRef = useRef(null);
    const enterClasses = enter.split(' ').filter(s => s.length);
    const enterFromClasses = enterFrom.split(' ').filter(s => s.length);
    const enterToClasses = enterTo.split(' ').filter(s => s.length);
    const leaveClasses = leave.split(' ').filter(s => s.length);
    const leaveFromClasses = leaveFrom.split(' ').filter(s => s.length);
    const leaveToClasses = leaveTo.split(' ').filter(s => s.length);

    const addClasses = (node: HTMLElement, classes: string[]) => {
        if (classes.length > 0) {
            node.classList.add(...classes);
        }
    };

    const removeClasses = (node: HTMLElement, classes: string[]) => {
        if (classes.length > 0) {
            node.classList.remove(...classes);
        }
    };

    return (
        <ReactCSSTransition
            appear={appear}
            nodeRef={nodeRef}
            unmountOnExit
            in={show}
            addEndListener={(node, done) => {
                nodeRef.current?.addEventListener('transitionend', done, false);
            }}
            onEnter={node => {
                nodeRef.current &&
                    addClasses(nodeRef.current, [...enterClasses, ...enterFromClasses]);
            }}
            onEntering={node => {
                nodeRef.current && removeClasses(nodeRef.current, enterFromClasses);
                nodeRef.current && addClasses(nodeRef.current, enterToClasses);
            }}
            onEntered={node => {
                nodeRef.current &&
                    removeClasses(nodeRef.current, [...enterToClasses, ...enterClasses]);
            }}
            onExit={node => {
                nodeRef.current &&
                    addClasses(nodeRef.current, [...leaveClasses, ...leaveFromClasses]);
            }}
            onExiting={node => {
                nodeRef.current && removeClasses(nodeRef.current, leaveFromClasses);
                nodeRef.current && addClasses(nodeRef.current, leaveToClasses);
            }}
            onExited={node => {
                nodeRef.current &&
                    removeClasses(nodeRef.current, [...leaveToClasses, ...leaveClasses]);
            }}
        >
            <div ref={nodeRef} className={containerClasses}>
                {children}
            </div>
        </ReactCSSTransition>
    );
};

const Transition: React.FC<Props> = ({containerClasses, show, appear, ...rest}) => {
    const {parent} = useContext(TransitionContext);
    const isInitialRender = useIsInitialRender();
    const isChild = show === undefined;

    if (isChild) {
        return (
            <CSSTransition
                appear={parent.appear || !parent.isInitialRender}
                show={parent.show}
                {...rest}
            />
        );
    }

    return (
        <TransitionContext.Provider
            value={{
                parent: {
                    show,
                    isInitialRender,
                    appear
                }
            }}
        >
            <CSSTransition
                containerClasses={containerClasses}
                appear={appear}
                show={show}
                {...rest}
            />
        </TransitionContext.Provider>
    );
};

export default Transition;
