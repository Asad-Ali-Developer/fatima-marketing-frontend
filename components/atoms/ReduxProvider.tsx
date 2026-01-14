"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { getStore } from "@/store";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef(getStore());
  return <Provider store={storeRef.current}>{children}</Provider>;
}
