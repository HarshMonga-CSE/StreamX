import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { completeOnboarding } from "../lib/api";
import toast from "react-hot-toast";
import { Edit2, Save, X, ChevronDown } from "lucide-react";
import { LANGUAGES } from "../constants";

const UserMenu = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    profilePic: authUser?.profilePic || "",
    location: authUser?.location || "",
  });

  useEffect(() => {
    // sync when authUser updates
    setForm({
      fullName: authUser?.fullName || "",
      bio: authUser?.bio || "",
      nativeLanguage: authUser?.nativeLanguage || "",
      learningLanguage: authUser?.learningLanguage || "",
      profilePic: authUser?.profilePic || "",
      location: authUser?.location || "",
    });
  }, [authUser]);

  // outside click closes dropdown
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setEditing(false);
      }
    }
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, []);

  const { mutate: saveProfile, isLoading } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setEditing(false);
      setOpen(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Could not update profile";
      toast.error(msg);
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (
      !form.fullName ||
      !form.bio ||
      !form.nativeLanguage ||
      !form.learningLanguage ||
      !form.location
    ) {
      toast.error("Please fill all fields before saving.");
      return;
    }
    saveProfile(form);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="btn btn-ghost btn-circle p-0 flex items-center gap-2"
        aria-expanded={open}
        aria-label="Open user menu"
      >
        <div className="avatar">
          <div className="w-9 rounded-full overflow-hidden">
            <img
              src={authUser?.profilePic || "/default-avatar.png"}
              alt="User Avatar"
            />
          </div>
        </div>
        <ChevronDown className="ml-2 h-4 w-4 text-base-content opacity-60" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 bg-base-200 border border-base-300 shadow-lg rounded-xl z-50 p-3"
          role="dialog"
          aria-label="User menu"
        >
          {!editing ? (
            <>
              <div className="flex items-start gap-3">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-base-300">
                    <img
                      src={authUser?.profilePic || "/default-avatar.png"}
                      alt={authUser?.fullName}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-sm truncate">
                      {authUser?.fullName}
                    </h3>

                    {/* STOP PROPAGATION so outside click handler does not close the menu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(true);
                      }}
                      className="btn btn-ghost btn-sm p-2"
                      title="Edit profile"
                      aria-label="Edit profile"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>

                  {authUser?.bio && (
                    <p className="text-xs opacity-70 mt-1 line-clamp-3">
                      {authUser.bio}
                    </p>
                  )}

                  <div className="mt-3 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="w-24 opacity-80">Native</strong>
                      <span className="opacity-80">
                        {authUser?.nativeLanguage || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong className="w-24 opacity-80">Learning</strong>
                      <span className="opacity-80">
                        {authUser?.learningLanguage || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong className="w-24 opacity-80">Location</strong>
                      <span className="opacity-80">
                        {authUser?.location || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // START OF EDITED SECTION
            <div className="relative pt-8">
              {/* Cancel Button moved to the top right */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(false);
                  // reset form to current authUser values
                  setForm({
                    fullName: authUser?.fullName || "",
                    bio: authUser?.bio || "",
                    nativeLanguage: authUser?.nativeLanguage || "",
                    learningLanguage: authUser?.learningLanguage || "",
                    profilePic: authUser?.profilePic || "",
                    location: authUser?.location || "",
                  });
                }}
                aria-label="Cancel editing"
                className="absolute right-0 top-0 btn btn-ghost btn-sm p-2" // Positioning at top right
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Edit form — note onClick stopPropagation so the dropdown won't close when interacting */}
              <form
                onSubmit={handleSave}
                className="space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <label className="label">
                    <span className="label-text text-xs">Full Name</span>
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    className="input input-bordered w-full input-sm"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text text-xs">Bio</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="textarea textarea-bordered w-full textarea-sm"
                    placeholder="A short bio"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* Native language SELECT */}
                  <div>
                    <label className="label">
                      <span className="label-text text-xs">
                        Native Language
                      </span>
                    </label>
                    <select
                      value={form.nativeLanguage || ""}
                      onChange={(e) =>
                        setForm({ ...form, nativeLanguage: e.target.value })
                      }
                      className="select select-bordered w-full select-sm"
                      required
                    >
                      <option value="">Select native language</option>
                      {LANGUAGES.map((lang) => (
                        <option
                          key={`native-${lang}`}
                          value={lang.toLowerCase()}
                        >
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Learning language SELECT */}
                  <div>
                    <label className="label">
                      <span className="label-text text-xs">
                        Learning Language
                      </span>
                    </label>
                    <select
                      value={form.learningLanguage || ""}
                      onChange={(e) =>
                        setForm({ ...form, learningLanguage: e.target.value })
                      }
                      className="select select-bordered w-full select-sm"
                      required
                    >
                      <option value="">Select learning language</option>
                      {LANGUAGES.map((lang) => (
                        <option
                          key={`learn-${lang}`}
                          value={lang.toLowerCase()}
                        >
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="label">
                      <span className="label-text text-xs">Location</span>
                    </label>
                    <input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      className="input input-bordered w-full input-sm"
                      placeholder="City, Country"
                      required
                    />
                  </div>
                </div>

                {/* Action row: Save button */}
                <div>
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary w-full" // Removed pr-12
                    disabled={isLoading}
                    aria-label="Complete onboarding"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
            // END OF EDITED SECTION
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;