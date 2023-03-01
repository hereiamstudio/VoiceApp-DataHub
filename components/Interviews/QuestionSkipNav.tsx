import React, {useEffect, useState} from 'react';
import {Formik} from 'formik';
import FormField from '@/components/FormField';
import Select from '@/components/Form/Select';

interface Props {
    handleSelect: (questionId: string) => void;
    ids: string[];
}

const QuestionSkipNav: React.FC<Props> = ({handleSelect, ids}: Props) => {
    const [anchors, setAnchors] = useState([]);

    const handleChange = (key: string) => {
        const anchor = anchors.find(({key: anchorKey}) => key === anchorKey);

        if (anchor) {
            anchor.$element.scrollIntoView({behavior: 'smooth'});
            handleSelect(key);
        }
    };

    const updateAnchors = () => {
        const $updatedAnchors = ids
            .map(questionKey => {
                const $element = document.getElementById(questionKey);

                if ($element) {
                    return {
                        $element,
                        key: questionKey,
                        label: $element.dataset.label
                    };
                }
            })
            .filter(i => i);

        setAnchors($updatedAnchors);
    };

    useEffect(() => {
        updateAnchors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ids]);

    return (
        <Formik initialValues={{questionId: ''}} onSubmit={null}>
            <form>
                <FormField label="Scroll to question" name="questionId">
                    <Select
                        hasError={false}
                        field={null}
                        name="questionId"
                        onChange={handleChange}
                        options={anchors.map(anchor => ({
                            label: anchor.label,
                            value: anchor.key
                        }))}
                        placeholder="Select a question..."
                    />
                </FormField>
            </form>
        </Formik>
    );
};

export default QuestionSkipNav;
