import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Notifications</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <>
            {/* Incoming Friend Requests */}
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <UserCheckIcon className="h-5 w-5 text-primary" />
                    Friend Requests
                    <span className="ml-2 badge badge-primary">{incomingRequests.length}</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <article
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-14 h-14 rounded-full bg-base-300 overflow-hidden">
                              <img
                                src={request.sender.profilePic || "/default-avatar.png"}
                                alt={request.sender.fullName}
                                className="object-cover w-full h-full"
                              />
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm truncate">{request.sender.fullName}</h3>

                              <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                <span className="badge badge-secondary badge-sm">
                                  Native: {request.sender.nativeLanguage || "—"}
                                </span>
                                <span className="badge badge-outline badge-sm">
                                  Learning: {request.sender.learningLanguage || "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              className="btn btn-primary btn-sm flex items-center gap-2"
                              onClick={() => acceptRequestMutation(request._id)}
                              disabled={isPending}
                              aria-label={`Accept friend request from ${request.sender.fullName}`}
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Accepted Requests / New Connections */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => (
                    <article
                      key={notification._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 w-12 h-12 rounded-full bg-base-300 overflow-hidden">
                            <img
                              src={notification.recipient.profilePic || "/default-avatar.png"}
                              alt={notification.recipient.fullName}
                              className="object-cover w-full h-full"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{notification.recipient.fullName}</h3>
                            <p className="text-sm my-1 truncate">
                              {notification.recipient.fullName} accepted your friend request
                            </p>
                            <p className="text-xs flex items-center gap-1 opacity-70">
                              <ClockIcon className="h-3 w-3" />
                              Recently
                            </p>
                          </div>

                          <div className="badge badge-success flex items-center gap-1">
                            <MessageSquareIcon className="h-3 w-3" />
                            New Friend
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {incomingRequests.length === 0 && acceptedRequests.length === 0 && <NoNotificationsFound />}
          </>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
