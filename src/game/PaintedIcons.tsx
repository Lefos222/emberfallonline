import close from "@/assets/icons/ui-close.webp";
import swords from "@/assets/icons/ui-swords.webp";
import shield from "@/assets/icons/ui-shield.webp";
import refresh from "@/assets/icons/ui-refresh.webp";
import exit from "@/assets/icons/ui-exit.webp";
import coins from "@/assets/icons/ui-coins.webp";
import chat from "@/assets/icons/ui-chat.webp";
import friends from "@/assets/icons/ui-friends.webp";
import hourglass from "@/assets/icons/ui-hourglass.webp";
import notes from "@/assets/icons/ui-notes.webp";
import settings from "@/assets/icons/ui-settings.webp";

/**
 * Painted stand-ins for the line icons the game screens used, with the same names and props,
 * so swapping a `lucide-react` import for this module repaints a button without touching it.
 */
type P = { className?: string; "aria-hidden"?: boolean | "true" | "false" };
const make = (src: string) => function PaintedIcon({ className = "h-4 w-4", ...rest }: P) {
  return <img src={src} alt="" draggable={false} {...rest} className={`painted-icon inline-block object-contain ${className.includes("h-") ? className : `h-4 w-4 ${className}`}`} />;
};
export const X = make(close);
export const Swords = make(swords);
export const Shield = make(shield);
export const RefreshCw = make(refresh);
export const LogOut = make(exit);
export const Coins = make(coins);
export const MessageSquare = make(chat);
export const MessageCircle = make(chat);
export const Users = make(friends);
export const Clock = make(hourglass);
export const Hourglass = make(hourglass);
export const ScrollText = make(notes);
export const Settings = make(settings);
