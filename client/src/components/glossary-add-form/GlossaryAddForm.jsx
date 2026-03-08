import { useState } from "react";
import * as glossaryService from "../../services/glossaryService";

const CATEGORIES = ['Technology', 'Economics', 'Trading', 'Culture', 'Security'];

export default function GlossaryAddForm({ onTermAdded, onCancel }) {
    const [formValues, setFormValues] = useState({
        term: '',
        definition: '',
        category: 'Technology',
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const changeHandler = (e) => {
        setFormValues(state => ({ ...state, [e.target.name]: e.target.value }));
        setFormError('');
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

        setIsSubmitting(true);
        try {
            const newTerm = await glossaryService.create(formValues);
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
                    <label htmlFor="definition">Definition</label>
                    <textarea
                        id="definition"
                        name="definition"
                        placeholder="Explain this term clearly and concisely..."
                        value={formValues.definition}
                        onChange={changeHandler}
                        required
                    ></textarea>
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