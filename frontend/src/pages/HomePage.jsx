import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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

/**
 * Upgraded HomePage UI
 * - Preserves your original data fetching & mutation logic
 * - Adds small search, result counts, skeletons, nicer card visuals, and micro-interactions
 * - No backend / API changes
 */

const SkeletonCard = () => (
  <div className="card bg-base-200 animate-pulse p-4 h-44 flex flex-col justify-between">
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-gray-300 w-12 h-12" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-300 rounded w-1/2 mt-2" />
      </div>
    </div>
    <div className="h-8 bg-gray-300 rounded mt-4" />
  </div>
);

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [search, setSearch] = useState("");

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

  // derived filtered recommendations (client-side search)
  const filteredRecommendations = useMemo(() => {
    if (!search) return recommendedUsers;
    const q = search.trim().toLowerCase();
    return recommendedUsers.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.bio?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q)
    );
  }, [search, recommendedUsers]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Your Friends
            </h2>
            <p className="text-sm opacity-70 mt-1 mb-2">
              People you connected with — quick access to message or call.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="btn btn-outline btn-sm flex items-center gap-2"
            >
              <UsersIcon className="mr-1 size-4" />
              Friend Requests
            </Link>
            <Link to="/friends" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>
        </div>

        {/* Friends grid */}
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        {/* Recommendations header + controls */}
        <section>
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Meet New Learners
              </h2>
              <p className="opacity-70 mt-1">
                Discover language partners based on your profile — send a
                request to start chatting.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="flex items-center gap-2 w-full sm:w-80">
                <input
                  className="input input-bordered w-full"
                  placeholder="Search name, bio or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search recommendations"
                />
              </label>
              <div className="text-xs opacity-70 ml-auto sm:ml-0">
                {filteredRecommendations.length} results
              </div>
            </div>
          </div>

          {/* Recommendations content */}
          {loadingUsers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommendations available
              </h3>
              <p className="text-base-content opacity-70">
                Check back later — we'll keep looking for matches.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <article
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 rounded-lg overflow-hidden"
                    role="article"
                    aria-label={`Recommendation ${user.fullName}`}
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="avatar size-16 rounded-full ring ring-offset-2 ring-offset-base-100">
                          <img
                            src={user.profilePic || "/default-avatar.png"}
                            alt={user.fullName}
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-lg leading-tight">
                                {user.fullName}
                              </h3>
                              {user.location && (
                                <div className="flex items-center text-xs opacity-70 mt-1">
                                  <MapPinIcon className="size-3 mr-1" />
                                  <span>{user.location}</span>
                                </div>
                              )}
                            </div>

                            {user.mutuals ? (
                              <span className="badge badge-outline self-start">
                                {user.mutuals} mutuals
                              </span>
                            ) : null}
                          </div>

                          {/* Languages with flags */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            <span className="badge badge-secondary">
                              {getLanguageFlag(user.nativeLanguage)}
                              Native: {capitialize(user.nativeLanguage)}
                            </span>
                            <span className="badge badge-outline">
                              {getLanguageFlag(user.learningLanguage)}
                              Learning: {capitialize(user.learningLanguage)}
                            </span>
                          </div>

                          {user.bio && (
                            <p className="text-sm opacity-70 mt-3 line-clamp-3">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action row */}
                      <div className="mt-2">
                        <button
                          className={`btn btn-block  ${
                            hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                          }`}
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={hasRequestBeenSent || isPending}
                          title={
                            hasRequestBeenSent
                              ? "Request already sent"
                              : "Send friend request"
                          }
                          aria-disabled={hasRequestBeenSent || isPending}
                        >
                          {hasRequestBeenSent ? (
                            <>
                              <CheckCircleIcon className="size-4 mr-2 mb-0" />
                              Request Sent
                            </>
                          ) : (
                            <>
                              <span className="flex items-center justify-center gap-2 font-medium">
                                <UserPlusIcon className="w-4 h-4" />
                                <span>Send Request</span>
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
