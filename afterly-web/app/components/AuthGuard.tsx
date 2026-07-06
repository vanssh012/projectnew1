"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (supabase.auth.getSession() as any).then(({ data }: any) => {
      const session = data?.session;
      if (!session) {
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        router.push("/signin");
        return;
      }
      setAuthChecked(true);
    });
  }, [router]);

  if (!authChecked) {
    return (
      <div
        style={{
          height: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.3)",
          fontSize: 14,
        }}
      >
        checking session...
      </div>
    );
  }

  return <>{children}</>;
}
