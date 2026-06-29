"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Temporary bypass of auth guard for local development
  return <>{children}</>;
}
