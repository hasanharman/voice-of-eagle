"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function AdminAddButton() {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) return null;
  
  return (
    <Button asChild>
      <Link href="/rumours/add">
        <Plus className="mr-2 h-4 w-4" />
        Add Rumour
      </Link>
    </Button>
  );
}
