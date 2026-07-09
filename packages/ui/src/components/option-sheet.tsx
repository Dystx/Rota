"use client";

import { useCallback, useRef, type JSX, type ReactNode } from "react";
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
  const onCloseRef = useRef(props.onClose);
  onCloseRef.current = props.onClose;
  const onClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  return (
    <Modal
      isOpen={props.open}
      title={props.title}
      description={props.description}
      onClose={onClose}
      size="md"
      className={reducedMotion ? "animate-none" : undefined}
    >
      {props.children}
    </Modal>
  );
}
