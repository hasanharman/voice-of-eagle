"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AddRumourDialog } from "./add-rumour-dialog";

export function AdminAddButton() {
  const { isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (!isAdmin) return null;
  
  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Rumour
      </Button>
      <AddRumourDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
