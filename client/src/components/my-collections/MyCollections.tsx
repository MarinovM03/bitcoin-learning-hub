import { useState } from 'react';
import { Link } from 'react-router';
import { Layers, Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';
import { handleImgError } from '../../utils/imageHelpers';
import { useMyCollections } from '../../hooks/queries/useCollections';
import { useMyArticles } from '../../hooks/queries/useArticles';
import {
    useCreateCollection,
    useUpdateCollection,
    useDeleteCollection,
} from '../../hooks/mutations/useCollectionMutations';
import type { MyCollection } from '../../services/collectionService';
import ConfirmModal from '../common/ConfirmModal';
import PageMeta from '../page-meta/PageMeta';
import Spinner from '../spinner/Spinner';
import { toast } from '../../lib/toast';

export default function MyCollections() {
    const { data: collections = [], isPending } = useMyCollections();
    const { data: myArticles = [] } = useMyArticles();

    const [newTitle, setNewTitle] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftOrder, setDraftOrder] = useState<string[]>([]);
    const [draftTitle, setDraftTitle] = useState('');
    const [draftDescription, setDraftDescription] = useState('');
    const [draftCover, setDraftCover] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<MyCollection | null>(null);
    const [error, setError] = useState('');

    const createCollection = useCreateCollection();
    const updateCollection = useUpdateCollection();
    const removeCollection = useDeleteCollection();

    const articleTitle = (id: string) =>
        myArticles.find(a => a._id === id)?.title ?? 'Untitled article';

    const startEditing = (collection: MyCollection) => {
        setEditingId(collection._id);
        setDraftOrder(collection.articles.map(a => a._id));
        setDraftTitle(collection.title);
        setDraftDescription(collection.description);
        setDraftCover(collection.coverImage);
        setError('');
    };

    const stopEditing = () => {
        setEditingId(null);
        setDraftOrder([]);
        setDraftTitle('');
        setDraftDescription('');
        setDraftCover('');
    };

    const move = (index: number, delta: number) => {
        setDraftOrder(current => {
            const next = [...current];
            const target = index + delta;
            if (target < 0 || target >= next.length) return current;
            [next[index], next[target]] = [next[target]!, next[index]!];
            return next;
        });
    };

    const handleCreate = async () => {
        if (newTitle.trim().length < 3) {
            setError('Give the collection a name of at least 3 characters.');
            return;
        }
        setError('');
        try {
            await createCollection.mutateAsync({ title: newTitle.trim() });
            setNewTitle('');
            toast.success('Collection created.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create the collection.');
        }
    };

    const handleSave = async (collectionId: string) => {
        if (draftTitle.trim().length < 3) {
            setError('The collection name needs at least 3 characters.');
            return;
        }
        setError('');
        try {
            await updateCollection.mutateAsync({
                collectionId,
                data: {
                    title: draftTitle.trim(),
                    description: draftDescription.trim(),
                    coverImage: draftCover.trim(),
                    articles: draftOrder,
                },
            });
            stopEditing();
            toast.success('Collection saved.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save the collection.');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await removeCollection.mutateAsync(deleteTarget._id);
            setDeleteTarget(null);
            toast.success('Collection deleted.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not delete the collection.');
        }
    };

    return (
        <section id="my-collections-page" className="page-content">
            <PageMeta title="My Collections" description="Group your articles into ordered reading paths." noindex />

            {deleteTarget && (
                <ConfirmModal
                    title="Delete collection?"
                    message={`"${deleteTarget.title}" will be removed.`}
                    subMessage="Your articles are not deleted — only the grouping."
                    confirmLabel="Delete collection"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="my-collections-page">
                <header className="collections-header">
                    <span className="collections-kicker">
                        <Layers size={14} strokeWidth={2.5} />
                        Reading Paths
                    </span>
                    <h1>My Collections</h1>
                    <p className="collections-subtitle">
                        Group your articles into a guide people can read in order.
                    </p>
                </header>

                <div className="collection-create">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="New collection name (e.g. Bitcoin Foundations)"
                        maxLength={80}
                    />
                    <button
                        type="button"
                        className="btn-submit"
                        onClick={handleCreate}
                        disabled={createCollection.isPending}
                    >
                        <Plus size={15} strokeWidth={2.25} />
                        {createCollection.isPending ? 'Creating...' : 'Create'}
                    </button>
                </div>

                {error && <p className="field-error">{error}</p>}

                {isPending ? (
                    <Spinner />
                ) : collections.length === 0 ? (
                    <p className="collections-empty-note">
                        You have no collections yet. Create one above, then add your articles to it.
                    </p>
                ) : (
                    <div className="my-collections-list">
                        {collections.map(collection => {
                            const isEditing = editingId === collection._id;
                            const order = isEditing ? draftOrder : collection.articles.map(a => a._id);
                            const available = myArticles.filter(a => !order.includes(a._id));

                            return (
                                <div key={collection._id} className="my-collection-card">
                                    <div className="my-collection-top">
                                        <div>
                                            <h2>{collection.title}</h2>
                                            <span className="my-collection-count">
                                                {collection.articles.length} {collection.articles.length === 1 ? 'article' : 'articles'}
                                            </span>
                                        </div>
                                        <div className="my-collection-actions">
                                            <Link
                                                to={`/collections/${collection.slug}`}
                                                className="my-article-btn my-article-btn--view"
                                            >
                                                View
                                            </Link>
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="my-article-btn"
                                                        onClick={stopEditing}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-submit"
                                                        onClick={() => handleSave(collection._id)}
                                                        disabled={updateCollection.isPending}
                                                    >
                                                        {updateCollection.isPending ? 'Saving...' : 'Save'}
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="my-article-btn"
                                                        onClick={() => startEditing(collection)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="my-article-btn my-article-btn--delete"
                                                        onClick={() => setDeleteTarget(collection)}
                                                        aria-label={`Delete ${collection.title}`}
                                                    >
                                                        <Trash2 size={14} strokeWidth={2.25} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="collection-edit-fields">
                                            <div className="collection-field">
                                                <label htmlFor={`title-${collection._id}`}>Name</label>
                                                <input
                                                    id={`title-${collection._id}`}
                                                    type="text"
                                                    value={draftTitle}
                                                    onChange={(e) => setDraftTitle(e.target.value)}
                                                    maxLength={80}
                                                />
                                            </div>

                                            <div className="collection-field">
                                                <label htmlFor={`desc-${collection._id}`}>
                                                    Description
                                                    <span className="collection-field-count">{draftDescription.length}/300</span>
                                                </label>
                                                <textarea
                                                    id={`desc-${collection._id}`}
                                                    value={draftDescription}
                                                    onChange={(e) => setDraftDescription(e.target.value)}
                                                    placeholder="What is this collection about?"
                                                    maxLength={300}
                                                    rows={2}
                                                />
                                            </div>

                                            <div className="collection-field">
                                                <label htmlFor={`cover-${collection._id}`}>Cover image</label>
                                                <div className="collection-cover-row">
                                                    <input
                                                        id={`cover-${collection._id}`}
                                                        type="text"
                                                        value={draftCover}
                                                        onChange={(e) => setDraftCover(e.target.value)}
                                                        placeholder="https://... (defaults to the first article's image)"
                                                    />
                                                    {draftCover && (
                                                        <img
                                                            src={draftCover}
                                                            alt=""
                                                            className="collection-cover-preview"
                                                            onError={handleImgError}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <ol className="collection-order-list">
                                        {order.length === 0 && (
                                            <li className="collection-order-empty">No articles in this collection yet.</li>
                                        )}
                                        {order.map((articleId, index) => (
                                            <li key={articleId} className="collection-order-item">
                                                <span className="collection-order-number">{index + 1}</span>
                                                <span className="collection-order-title">{articleTitle(articleId)}</span>
                                                {isEditing && (
                                                    <span className="collection-order-controls">
                                                        <button
                                                            type="button"
                                                            onClick={() => move(index, -1)}
                                                            disabled={index === 0}
                                                            aria-label="Move up"
                                                        >
                                                            <ArrowUp size={14} strokeWidth={2.25} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => move(index, 1)}
                                                            disabled={index === order.length - 1}
                                                            aria-label="Move down"
                                                        >
                                                            <ArrowDown size={14} strokeWidth={2.25} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDraftOrder(o => o.filter(id => id !== articleId))}
                                                            aria-label="Remove from collection"
                                                        >
                                                            <X size={14} strokeWidth={2.25} />
                                                        </button>
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ol>

                                    {isEditing && (
                                        <div className="collection-picker">
                                            <span className="collection-picker-label">
                                                Add an article
                                                <span className="collection-field-count">
                                                    {available.length} available
                                                </span>
                                            </span>
                                            {available.length === 0 ? (
                                                <p className="collection-picker-empty">
                                                    Every article you have written is already in this collection.
                                                </p>
                                            ) : (
                                                <ul className="collection-picker-list">
                                                    {available.map(article => (
                                                        <li key={article._id}>
                                                            <button
                                                                type="button"
                                                                className="collection-picker-item"
                                                                onClick={() => setDraftOrder(o => [...o, article._id])}
                                                            >
                                                                <Plus size={13} strokeWidth={2.5} />
                                                                <span className="collection-picker-title">{article.title}</span>
                                                                <span className={`collection-picker-status collection-picker-status--${article.status}`}>
                                                                    {article.status}
                                                                </span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
