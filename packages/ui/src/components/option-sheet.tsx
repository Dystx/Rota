"use client";

import type { JSX, ReactNode } from "react";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { Modal } from "./modal";

export function OptionSheet(props: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}): JSX.Element | null {
  const reducedMotion = useReducedMotion();

  return (
    <Modal
      isOpen={props.open}
      title={props.title}
      description={props.description}
      onClose={props.onClose}
      size="md"
      className={reducedMotion ? "animate-none" : undefined}
    >
      {props.children}
    </Modal>
  );
}
