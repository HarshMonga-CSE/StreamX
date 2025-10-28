import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Your Friends
            </h2>
            <p className="text-sm opacity-70 mt-1">
              People you connected with — message them anytime.
            </p>
          </div>

          <Link
            to="/notifications"
            className="btn btn-outline btn-sm flex items-center gap-2"
          >
            <UsersIcon className="size-4" />
            Friend Requests
          </Link>
        </div>

        {/* Friends Grid */}
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {friends.map((friend) => (
              <article
                key={friend._id}
                className="card bg-base-200 hover:shadow-lg transition-transform duration-200 transform hover:-translate-y-1 rounded-lg overflow-hidden"
              >
                <div className="card-body p-5 flex flex-col items-center text-center">
                  <div className="avatar mb-3">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-base-300">
                      <img
                        src={friend.profilePic || "/default-avatar.png"}
                        alt={friend.fullName}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg">{friend.fullName}</h3>

                  {/* Location (optional) */}
                  {friend.location && (
                    <div className="flex items-center text-xs opacity-70 mt-1">
                      <MapPinIcon className="size-3 mr-1" />
                      <span>{friend.location}</span>
                    </div>
                  )}

                  {/* Languages */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="badge badge-secondary">
                      {getLanguageFlag(friend.nativeLanguage)}
                      Native: {capitialize(friend.nativeLanguage || "")}
                    </span>
                    <span className="badge badge-outline">
                      {getLanguageFlag(friend.learningLanguage)}
                      Learning: {capitialize(friend.learningLanguage || "")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 w-full">
                    <Link
                      to={`/chat/${friend._id}`}
                      className="btn btn-sm btn-primary w-full flex items-center justify-center gap-2"
                      aria-label={`Message ${friend.fullName}`}
                    >
                      <UserPlusIcon className="w-4 h-4" />
                      Message
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
