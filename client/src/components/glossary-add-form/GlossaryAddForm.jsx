import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { createGlossarySchema } from "../../validators/glossarySchemas";
import { useCreateGlossaryTerm } from "../../hooks/mutations/useGlossaryMutations";

const CATEGORIES = ['Technology', 'Economics', 'Trading', 'Culture', 'Security'];

export default function GlossaryAddForm({ onTermAdded }) {
    const [serverError, setServerError] = useState('');
    const createTerm = useCreateGlossaryTerm();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(createGlossarySchema),
        defaultValues: {
            term: '',
            definition: '',
            category: 'Technology',
            extendedDefinition: '',
            examples: [{ value: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'examples',
    });

    const onSubmit = async (values) => {
        setServerError('');
        const cleanedExamples = (values.examples || [])
            .map(item => (typeof item === 'string' ? item : item.value || '').trim())
            .filter(Boolean);

        try {
            const newTerm = await createTerm.mutateAsync({
                term: values.term,
                definition: values.definition,
                category: values.category,
                extendedDefinition: values.extendedDefinition?.trim() || '',
                examples: cleanedExamples,
            });
            reset();
            onTermAdded(newTerm);
        } catch (err) {
            setServerError(err.message || "Failed to add term.");
        }
    };

    return (
        <div className="glossary-form-container">
            <h3>Contribute a New Term</h3>
            <form className="glossary-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="form-group">
                    <label htmlFor="term">Term</label>
                    <input
                        type="text"
                        id="term"
                        placeholder="e.g. Lightning Network"
                        {...register('term')}
                    />
                    {errors.term && <p className="field-error">{errors.term.message}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select id="category" {...register('category')}>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <p className="field-error">{errors.category.message}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="definition">Short definition</label>
                    <textarea
                        id="definition"
                        placeholder="A one-to-two line explanation shown in lists and search results..."
                        {...register('definition')}
                    ></textarea>
                    {errors.definition && <p className="field-error">{errors.definition.message}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="extendedDefinition">
                        In-depth explanation <span className="form-group-optional">(optional)</span>
                    </label>
                    <textarea
                        id="extendedDefinition"
                        className="glossary-form-textarea-tall"
                        placeholder="Flesh out the concept with a few paragraphs. Separate paragraphs with a blank line."
                        {...register('extendedDefinition')}
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>
                        Examples <span className="form-group-optional">(optional)</span>
                    </label>
                    <div className="glossary-form-examples">
                        {fields.map((field, index) => (
                            <div key={field.id} className="glossary-form-example-row">
                                <input
                                    type="text"
                                    placeholder={`Example ${index + 1}`}
                                    {...register(`examples.${index}.value`)}
                                />
                                <button
                                    type="button"
                                    className="glossary-form-example-remove"
                                    onClick={() => fields.length === 1 ? null : remove(index)}
                                    aria-label="Remove example"
                                >
                                    <X size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        ))}
                        {fields.length < 10 && (
                            <button
                                type="button"
                                className="glossary-form-example-add"
                                onClick={() => append({ value: '' })}
                            >
                                <Plus size={14} strokeWidth={2.5} />
                                Add example
                            </button>
                        )}
                    </div>
                </div>

                {serverError && <p className="field-error">{serverError}</p>}

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
