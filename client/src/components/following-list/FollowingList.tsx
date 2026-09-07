import { useState } from 'react';
import { Link } from 'react-router';
import { Users, Layers, UserMinus, Compass } from 'lucide-react';
import { useFollowing } from '../../hooks/queries/useFollows';
import { useToggleFollow } from '../../hooks/mutations/useFollowMutations';
import type { FollowTarget } from '../../services/followService';
import Skeleton from '../skeleton/Skeleton';
import { handleAvatarError, handleImgError, DEFAULT_AVATAR } from '../../utils/imageHelpers';
import { toast } from '../../lib/toast';

export default function FollowingList() {
    const [tab, setTab] = useState<FollowTarget>('user');
    const { data, isPending } = useFollowing();
    const toggleFollow = useToggleFollow();

    const users = data?.users ?? [];
    const collections = data?.collections ?? [];

    const unfollow = async (targetType: FollowTarget, targetId: string, name: string) => {
        try {
            await toggleFollow.mutateAsync({ targetType, targetId });
            toast.success(`Unfollowed ${name}.`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "That didn't work. Try again.");
        }
    };

    const isLeaving = (targetId: string) =>
        toggleFollow.isPending && toggleFollow.variables?.targetId === targetId;

    const shown = tab === 'user' ? users.length : collections.length;

    return (
        <div className="following-list">
            <div className="following-list-head">
                <span className="following-list-icon">
                    <Users size={16} strokeWidth={2} />
                </span>
                <div>
                    <h2>Following</h2>
                    <p>Everyone and everything you keep up with.</p>
                </div>
            </div>

            <div className="following-tabs" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'user'}
                    className={`following-tab ${tab === 'user' ? 'following-tab--active' : ''}`}
                    onClick={() => setTab('user')}
                >
                    <Users size={15} strokeWidth={2.1} />
                    People
                    <span className="following-tab-count">{users.length}</span>
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'collection'}
                    className={`following-tab ${tab === 'collection' ? 'following-tab--active' : ''}`}
                    onClick={() => setTab('collection')}
                >
                    <Layers size={15} strokeWidth={2.1} />
                    Collections
                    <span className="following-tab-count">{collections.length}</span>
                </button>
            </div>

            {isPending ? (
                <div className="following-rows">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="following-row">
                            <Skeleton className="following-row-avatar" />
                            <div className="following-row-body">
                                <Skeleton className="following-row-line" />
                                <Skeleton className="following-row-line following-row-line--short" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : shown === 0 ? (
                <div className="following-empty">
                    <Compass size={30} strokeWidth={1.5} />
                    <p>
                        {tab === 'user'
                            ? "You aren't following anyone yet."
                            : "You aren't following any collections yet."}
                    </p>
                    <Link
                        to={tab === 'user' ? '/articles' : '/collections'}
                        className="following-empty-cta"
                    >
                        {tab === 'user' ? 'Find authors' : 'Browse collections'} →
                    </Link>
                </div>
            ) : tab === 'user' ? (
                <ul className="following-rows">
                    {users.map(person => (
                        <li key={person._id} className="following-row">
                            <Link to={`/users/${person._id}`} className="following-row-link">
                                <img
                                    src={person.profilePicture || DEFAULT_AVATAR}
                                    alt=""
                                    className="following-row-avatar"
                                    loading="lazy"
                                    decoding="async"
                                    onError={handleAvatarError}
                                />
                                <span className="following-row-body">
                                    <span className="following-row-title">{person.username}</span>
                                    <span className="following-row-meta">Community author</span>
                                </span>
                            </Link>
                            <button
                                type="button"
                                className="following-unfollow"
                                onClick={() => unfollow('user', person._id, person.username)}
                                disabled={isLeaving(person._id)}
                            >
                                <UserMinus size={14} strokeWidth={2.25} />
                                Unfollow
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className="following-rows">
                    {collections.map(collection => (
                        <li key={collection._id} className="following-row">
                            <Link to={`/collections/${collection.slug}`} className="following-row-link">
                                {collection.coverImage ? (
                                    <img
                                        src={collection.coverImage}
                                        alt=""
                                        className="following-row-cover"
                                        loading="lazy"
                                        decoding="async"
                                        onError={handleImgError}
                                    />
                                ) : (
                                    <span className="following-row-cover following-row-cover--blank">
                                        <Layers size={16} strokeWidth={1.8} />
                                    </span>
                                )}
                                <span className="following-row-body">
                                    <span className="following-row-title">{collection.title}</span>
                                    <span className="following-row-meta">
                                        {collection.articleCount} {collection.articleCount === 1 ? 'part' : 'parts'}
                                        {collection._ownerId ? ` · by ${collection._ownerId.username}` : ''}
                                    </span>
                                </span>
                            </Link>
                            <button
                                type="button"
                                className="following-unfollow"
                                onClick={() => unfollow('collection', collection._id, collection.title)}
                                disabled={isLeaving(collection._id)}
                            >
                                <UserMinus size={14} strokeWidth={2.25} />
                                Unfollow
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
