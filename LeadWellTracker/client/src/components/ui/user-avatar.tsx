import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ src, name, className, fallbackClassName, ...props }: UserAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  // Create a deterministic background color based on the name
  const getColorFromName = (name: string) => {
    const colorOptions = [
      "bg-primary-400",
      "bg-blue-400",
      "bg-purple-400",
      "bg-green-400",
      "bg-orange-400",
      "bg-rose-400",
    ];
    
    if (!name) return colorOptions[0];
    
    // Simple hash function to get deterministic index
    const hash = name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colorOptions[Math.abs(hash) % colorOptions.length];
  };

  return (
    <Avatar className={cn("relative", className)} {...props}>
      {src && <AvatarImage src={src} alt={name || "User"} />}
      <AvatarFallback 
        className={cn(name ? getColorFromName(name) : "bg-neutral-300", "text-white", fallbackClassName)}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}