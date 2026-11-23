import {
  Sun, Bed, Sunrise, Megaphone, Droplet, House, Shirt, Utensils, HeartPulse, Flower, CloudRain, Wind, Zap, Moon,
  Plane, Store, Baby, Users, CloudLightning, Shield, Coins, RefreshCw, Sparkles, HandHeart, HandHelping, type LucideIcon,
} from "lucide-react";
import { KaabaIcon, MosqueIcon } from "@/components/icons/IslamicIcons";
import { sectionIconKey } from "@/lib/azkarRules";

const MAP: Record<string, LucideIcon> = {
  sun: Sun, bed: Bed, sunrise: Sunrise, mosque: MosqueIcon, megaphone: Megaphone, droplet: Droplet, home: House,
  shirt: Shirt, utensils: Utensils, heartPulse: HeartPulse, flower: Flower, cloudRain: CloudRain, wind: Wind, zap: Zap,
  moon: Moon, plane: Plane, store: Store, kaaba: KaabaIcon, baby: Baby, users: Users, cloudLightning: CloudLightning,
  shield: Shield, coins: Coins, refresh: RefreshCw, sparkles: Sparkles, handHeart: HandHeart, handsPraying: HandHelping,
};

export const sectionIcon = (name: string): LucideIcon => MAP[sectionIconKey(name)] ?? HandHelping;
