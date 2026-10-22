import { Search, UserPlus, Users } from "lucide-react";

const friends = [
  { id: 1, name: "Ahmed Abd Al-Rahman", username: "ahmedmutti", followers: 321 },
  { id: 2, name: "Alaa Ashraf", username: "alaaashraf", followers: 258 },
  { id: 3, name: "MrMo", username: "mrmo", followers: 198 },
  { id: 4, name: "menna", username: "gbngssssb", followers: 160 },
  { id: 5, name: "abdalla diaa", username: "abdalla_diaa", followers: 152 },
];

export default function SuggestedFriends() {
  return (
    <aside className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-main">
          <Users size={18} />
          Suggested Friends
        </h2>
        <span className="text-sm text-gray-400 font-semibold">
          {friends.length}
        </span>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          aria-label="Search friends"
          placeholder="Search friends..."
          className="w-full rounded-xl bg-gray-100 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-main/30"
        />
      </div>

      <ul className="space-y-3">
        {friends.map((friend) => (
          <li
            key={friend.id}
            className="rounded-2xl border border-gray-200 p-3 space-y-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={`https://i.pravatar.cc/100?img=${friend.id}`}
                alt={friend.name}
                className="size-9 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 grow">
                <p className="truncate text-sm font-bold text-main">
                  {friend.name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  @{friend.username}
                </p>
              </div>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1 rounded-lg bg-main/10 px-2.5 py-1.5 text-xs font-semibold text-main transition hover:bg-main/20"
              >
                <UserPlus size={14} />
                Follow
              </button>
            </div>
            <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {friend.followers} followers
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-main transition hover:bg-gray-200"
      >
        View more
      </button>
    </aside>
  );
}
