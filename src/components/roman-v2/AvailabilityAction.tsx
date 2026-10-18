import Link from "next/link";
import { ArrowRight, ArrowUp } from "lucide-react";
import type { AvailableAction } from "@/lib/roman-v2/types";
import s from "./contemporary-roman.module.css";

export type ActionVariant = "primary" | "outline" | "text" | "icon";
export type ActionArrow = "right" | "up" | "none";

const VARIANT_CLASS: Record<ActionVariant, string> = {
  primary: s.primary,
  outline: s.outline,
  text: s.text,
  icon: s.iconOnly,
};

const ARROWS = { right: ArrowRight, up: ArrowUp } as const;

export function actionClassName(variant: ActionVariant, disabled = false, className?: string) {
  return [s.action, VARIANT_CLASS[variant], disabled && s.disabled, className].filter(Boolean).join(" ");
}

export function ActionArrowIcon({ arrow }: { arrow: ActionArrow }) {
  if (arrow === "none") return null;
  const Icon = ARROWS[arrow];
  return <Icon className={s.actionIcon} size={18} strokeWidth={1.75} aria-hidden="true" />;
}

type Props = {
  action: AvailableAction;
  variant?: ActionVariant;
  arrow?: ActionArrow;
  /** How an unavailable action renders: a disabled button, or an aria-disabled span where a button is not semantic. */
  disabledAs?: "button" | "span";
  className?: string;
};

/**
 * The only way Roman v2 renders a destination. Unavailable actions keep their final look but are inert:
 * no href, no pointer cursor, no hover motion and no tab stop.
 */
export default function AvailabilityAction({
  action,
  variant = "primary",
  arrow = "none",
  disabledAs = "button",
  className,
}: Props) {
  const iconOnly = variant === "icon";
  const content = (
    <>
      {iconOnly ? <span className={s.visuallyHidden}>{action.label}</span> : <span>{action.label}</span>}
      <ActionArrowIcon arrow={arrow} />
    </>
  );

  if (!action.available) {
    const classes = actionClassName(variant, true, className);
    return disabledAs === "span" ? (
      <span className={classes} aria-disabled="true">
        {content}
      </span>
    ) : (
      <button type="button" className={classes} disabled>
        {content}
      </button>
    );
  }

  const classes = actionClassName(variant, false, className);
  const { href } = action;

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      className={classes}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}
