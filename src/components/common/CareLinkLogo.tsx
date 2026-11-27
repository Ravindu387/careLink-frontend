import React from "react";
import logoSrc from "../../assets/carelink-logo.png";

export type CareLinkLogoSize =
  | "sidebar"
  | "compact"
  | "auth"
  | "header"
  | "sm"
  | "md"
  | "lg";

export interface CareLinkLogoProps {
  size?: CareLinkLogoSize;
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  tagline?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  onClick?: () => void;
  alt?: string;
}

const SIZE_MAP: Record<
  CareLinkLogoSize,
  { img: string; title: string; subtitle: string }
> = {
  compact: {
    img: "w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px]",
    title: "text-base font-bold",
    subtitle: "text-xs",
  },
  sidebar: {
    img: "w-[52px] h-[52px] min-w-[52px] min-h-[52px] max-w-[52px] max-h-[52px]",
    title: "text-lg font-bold tracking-tight",
    subtitle: "text-xs font-medium leading-tight",
  },
  auth: {
    img: "w-[100px] h-[100px] min-w-[100px] min-h-[100px] max-w-[100px] max-h-[100px]",
    title: "text-2xl font-bold tracking-tight",
    subtitle: "text-[13px] font-medium",
  },
  header: {
    img: "w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px]",
    title: "text-xl font-bold tracking-tight",
    subtitle: "text-xs font-medium",
  },
  sm: {
    img: "w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px]",
    title: "text-sm font-semibold",
    subtitle: "text-xs",
  },
  md: {
    img: "w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px]",
    title: "text-base font-bold",
    subtitle: "text-xs",
  },
  lg: {
    img: "w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px]",
    title: "text-xl font-bold",
    subtitle: "text-[13px]",
  },
};

export const CareLinkLogo: React.FC<CareLinkLogoProps> = ({
  size = "sidebar",
  className = "",
  imgClassName = "",
  showText = false,
  tagline = "Connecting Help. Saving Lives.",
  titleClassName = "text-white",
  subtitleClassName = "text-slate-300/90",
  onClick,
  alt = "CareLink Logo",
}) => {
  const config = SIZE_MAP[size] || SIZE_MAP.sidebar;

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      <img
        src={logoSrc}
        alt={alt}
        className={`${config.img} object-contain flex-shrink-0 drop-shadow-sm ${imgClassName}`}
        loading="eager"
      />
      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`${config.title} leading-tight font-bold tracking-tight ${titleClassName}`}
          >
            CareLink
          </span>
          {tagline && (
            <span
              className={`${config.subtitle} truncate font-medium ${subtitleClassName}`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CareLinkLogo;
