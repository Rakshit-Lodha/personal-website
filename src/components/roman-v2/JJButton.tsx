"use client";

import { useJJSession } from "@/components/jj/JJSessionProvider";
import { ActionArrowIcon, actionClassName, type ActionArrow, type ActionVariant } from "./AvailabilityAction";

/** Opens the existing JJ voice surface. The microphone is only requested after this click. */
export default function JJButton({
  label,
  variant = "outline",
  arrow = "up-right",
  className,
}: {
  label: string;
  variant?: ActionVariant;
  arrow?: ActionArrow;
  className?: string;
}) {
  const { open } = useJJSession();
  return (
    <button type="button" className={actionClassName(variant, false, className)} onClick={open}>
      <span>{label}</span>
      <ActionArrowIcon arrow={arrow} />
    </button>
  );
}
