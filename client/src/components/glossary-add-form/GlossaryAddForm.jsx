import { useState } from "react";
import { Plus, X } from "lucide-react";
import * as glossaryService from "../../services/glossaryService";

const CATEGORIES = ['Technology', 'Economics', 'Trading', 'Culture', 'Security'];

export default function GlossaryAddForm({ onTermAdded }) {
    const [formValues, setFormValues] = useState({
        term: '',
        definition: '',
        category: 'Technology',
        extendedDefinition: '',
    });
    const [examples, setExamples] = useState(['']);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const changeHandler = (e) => {
        setFormValues(state => ({ ...state, [e.target.name]: e.target.value }));
        setFormError('');
    };

    const updateExample = (index, value) => {
        setExamples(state => state.map((item, i) => (i === index ? value : item)));
    };

    const addExample = () => {
        if (examples.length >= 10) return;
        setExamples(state => [...state, '']);
    };

    const removeExample = (index) => {
        setExamples(state => (state.length === 1 ? [''] : state.filter((_, i) => i !== index)));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (formValues.term.trim().length < 2) {
            setFormError("Term must be at least 2 characters long!");
            return;
        }
        if (formValues.definition.trim().length < 10) {
            setFormError("Definition must be at least 10 characters long!");
            return;
        }

        const cleanedExamples = examples.map(ex => ex.trim()).filter(Boolean);

        setIsSubmitting(true);
        try {
            const newTerm = await glossaryService.create({
                ...formValues,
                extendedDefinition: formValues.extendedDefinition.trim(),
                examples: cleanedExamples,
            });
            onTermAdded(newTerm);
        } catch (err) {
            setFormError(err.message || "Failed to add term.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glossary-form-container">
            <h3>Contribute a New Term</h3>
            <form className="glossary-form" onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="term">Term</label>
                    <input
                        type="text"
                        id="term"
                        name="term"
                        placeholder="e.g. Lightning Network"
                        value={formValues.term}
                        onChange={changeHandler}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formValues.category}
                        onChange={changeHandler}
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="definition">Short definition</label>
                    <textarea
                        id="definition"
                        name="definition"
                        placeholder="A one-to-two line explanation shown in lists and search results..."
                        value={formValues.definition}
                        onChange={changeHandler}
                        required
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="extendedDefinition">
                        In-depth explanation <span className="form-group-optional">(optional)</span>
                    </label>
                    <textarea
                        id="extendedDefinition"
                        name="extendedDefinition"
                        className="glossary-form-textarea-tall"
                        placeholder="Flesh out the concept with a few paragraphs. Separate paragraphs with a blank line."
                        value={formValues.extendedDefinition}
                        onChange={changeHandler}
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>
                        Examples <span className="form-group-optional">(optional)</span>
                    </label>
                    <div className="glossary-form-examples">
                        {examples.map((example, index) => (
                            <div key={index} className="glossary-form-example-row">
                                <input
                                    type="text"
                                    value={example}
                                    onChange={(e) => updateExample(index, e.target.value)}
                                    placeholder={`Example ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    className="glossary-form-example-remove"
                                    onClick={() => removeExample(index)}
                                    aria-label="Remove example"
                                >
                                    <X size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        ))}
                        {examples.length < 10 && (
                            <button
                                type="button"
                                className="glossary-form-example-add"
                                onClick={addExample}
                            >
                                <Plus size={14} strokeWidth={2.5} />
                                Add example
                            </button>
                        )}
                    </div>
                </div>

                {formError && <p className="field-error">{formError}</p>}

                <input
                    type="submit"
                    value={isSubmitting ? "Adding..." : "Add to Glossary"}
                    className="btn-submit"
                    disabled={isSubmitting}
                />
            </form>
        </div>
    );
}
