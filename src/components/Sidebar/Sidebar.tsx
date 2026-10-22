import { Bookmark, Globe, Newspaper, Sparkles } from 'lucide-react';

const links = [
  { id: 'feed', label: 'Feed', icon: Newspaper },
  { id: 'posts', label: 'My Posts', icon: Sparkles },
  { id: 'community', label: 'Community', icon: Globe },
  { id: 'saved', label: 'Saved', icon: Bookmark },
];

export default function Sidebar() {
  const activeLink = 'feed';

  return (
    <aside className="w-full bg-white rounded-2xl p-3 shadow-sm">
      <ul className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.id === activeLink;

          return (
            <li key={link.id}>
              <button
                type="button"
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-main/10 text-main'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <Icon size={18} />
                {link.label}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
