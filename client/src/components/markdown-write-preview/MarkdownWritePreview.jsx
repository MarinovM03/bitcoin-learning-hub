import { useState, forwardRef } from "react";
import { Eye, Pencil } from "lucide-react";
import MarkdownContent from "../markdown-content/MarkdownContent";

const MarkdownWritePreview = forwardRef(function MarkdownWritePreview(
    { value, onChange, onBlur, name, placeholder, rows = 14 },
    ref
) {
    const [tab, setTab] = useState("write");

    return (
        <div className="md-wp">
            <div className="md-wp-tabs" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "write"}
                    className={`md-wp-tab ${tab === "write" ? "md-wp-tab--active" : ""}`}
                    onClick={() => setTab("write")}
                >
                    <Pencil size={13} strokeWidth={2.25} />
                    Write
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "preview"}
                    className={`md-wp-tab ${tab === "preview" ? "md-wp-tab--active" : ""}`}
                    onClick={() => setTab("preview")}
                >
                    <Eye size={13} strokeWidth={2.25} />
                    Preview
                </button>
                <span className="md-wp-hint">Markdown supported</span>
            </div>

            {tab === "write" ? (
                <textarea
                    ref={ref}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    rows={rows}
                    className="md-wp-textarea"
                />
            ) : (
                <div className="md-wp-preview">
                    {value?.trim() ? (
                        <MarkdownContent content={value} />
                    ) : (
                        <p className="md-wp-empty">Nothing to preview yet.</p>
                    )}
                </div>
            )}
        </div>
    );
});

export default MarkdownWritePreview;
