import { useState } from "react";
import { X } from "lucide-react";
import * as glossaryService from "../../services/glossaryService";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../common/ConfirmModal";

export default function GlossaryList({ terms, onTermDeleted }) {
    const { userId } = useAuth();
    const [deleteTarget, setDeleteTarget] = useState(null);

    const confirmDelete = async () => {
        try {
            await glossaryService.remove(deleteTarget.id);
            onTermDeleted(deleteTarget.id);
        } catch (err) {
            console.log("Delete failed:", err.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    const grouped = terms.reduce((acc, term) => {
        const letter = term.term[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(term);
        return acc;
    }, {});

    const sortedLetters = Object.keys(grouped).sort();

    return (
        <>
            {deleteTarget && (
                <ConfirmModal
                    title="Remove Glossary Term?"
                    message={`You are about to remove "${deleteTarget.name}" from the glossary.`}
                    subMessage="This action cannot be undone."
                    confirmLabel="Remove Term"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="glossary-list">
                {sortedLetters.map(letter => (
                    <div key={letter} className="glossary-letter-group">
                        <div
                            className="glossary-letter-heading"
                            id={`glossary-letter-${letter}`}
                            data-letter={letter}
                        >
                            {letter}
                        </div>
                        {grouped[letter].map(term => (
                            <div key={term._id} className="glossary-term-card">
                                <div className="glossary-term-header">
                                    <div className="glossary-term-left">
                                        <span className="glossary-term-name">{term.term}</span>
                                        <span className="glossary-term-category">{term.category}</span>
                                    </div>
                                    {userId && term._ownerId === userId && (
                                        <button
                                            className="glossary-delete-btn"
                                            onClick={() => setDeleteTarget({ id: term._id, name: term.term })}
                                            aria-label="Delete term"
                                        >
                                            <X size={14} strokeWidth={2.25} />
                                        </button>
                                    )}
                                </div>
                                <p className="glossary-term-definition">{term.definition}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}