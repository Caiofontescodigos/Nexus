import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types";

const avatarColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getColor(name: string): string {
  const index = hashName(name) % avatarColors.length;
  return avatarColors[index];
}

interface Props {
  user: Pick<User, "name" | "avatarUrl">;
  className?: string;
}

export function UserAvatar({ user, className }: Props) {
  if (user.avatarUrl) {
    return (
      <Avatar className={className}>
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback className={`${getColor(user.name)} text-white text-xs`}>
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
    );
  }

  const initials = getInitials(user.name);
  const color = getColor(user.name);
  return (
    <Avatar className={className}>
      <AvatarFallback className={`${color} text-white text-xs`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
