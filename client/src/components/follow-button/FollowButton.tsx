import { Link } from 'react-router';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFollowSummary } from '../../hooks/queries/useFollows';
import { useToggleFollow } from '../../hooks/mutations/useFollowMutations';
import type { FollowTarget } from '../../services/followService';
import { toast } from '../../lib/toast';

interface FollowButtonProps {
    targetType: FollowTarget;
    targetId: string;
    ownerId?: string;
    label?: string;
}

export default function FollowButton({ targetType, targetId, ownerId, label }: FollowButtonProps) {
    const { isAuthenticated, userId } = useAuth();
    const { data: summary } = useFollowSummary(targetType, targetId);
    const toggleFollow = useToggleFollow();

    const isOwn = ownerId !== undefined && String(ownerId) === String(userId);
    if (isOwn) return null;

    const followers = summary?.followers ?? 0;
    const isFollowing = summary?.followedByMe ?? false;
    const noun = followers === 1 ? 'follower' : 'followers';

    if (!isAuthenticated) {
        return (
            <div className="follow-row">
                <Link to="/login" className="follow-btn">
                    <UserPlus size={15} strokeWidth={2.25} />
                    Follow
                </Link>
                <span className="follow-count">{followers} {noun}</span>
            </div>
        );
    }

    const handleClick = async () => {
        try {
            const result = await toggleFollow.mutateAsync({ targetType, targetId });
            toast.success(result.following ? 'Following.' : 'Unfollowed.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "That didn't work. Try again.");
        }
    };

    return (
        <div className="follow-row">
            <button
                type="button"
                className={`follow-btn ${isFollowing ? 'follow-btn--following' : ''}`}
                onClick={handleClick}
                disabled={toggleFollow.isPending}
            >
                {isFollowing
                    ? <><UserCheck size={15} strokeWidth={2.25} />Following</>
                    : <><UserPlus size={15} strokeWidth={2.25} />{label ?? 'Follow'}</>}
            </button>
            <span className="follow-count">{followers} {noun}</span>
        </div>
    );
}
