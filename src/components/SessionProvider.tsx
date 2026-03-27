"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { NotificationHost } from "@/components/notifications/NotificationHost";

interface Props {
  children: ReactNode;
}

export default function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
      <NotificationHost />
      {children}
    </NextAuthSessionProvider>
  );
}
