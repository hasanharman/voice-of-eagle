import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/rumours/data-table";
import { columns } from "@/components/rumours/columns";
import { RumourWithScores } from "@/lib/types/rumours.types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getRumours(): Promise<RumourWithScores[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rumours_with_scores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rumours:", error);
    return [];
  }

  return data || [];
}

function RumoursTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-[250px] bg-muted animate-pulse rounded" />
        <div className="h-8 w-[100px] bg-muted animate-pulse rounded" />
      </div>
      <div className="border rounded-md">
        <div className="h-[400px] bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export default async function RumoursPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Transfer Rumours</h1>
          <p className="text-muted-foreground">
            Community-driven transfer rumours with voting and priority levels
          </p>
        </div>
        <Button asChild>
          <Link href="/rumours/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Rumour
          </Link>
        </Button>
      </div>

      <Suspense fallback={<RumoursTableSkeleton />}>
        <RumoursTable />
      </Suspense>
    </div>
  );
}

async function RumoursTable() {
  const rumours = await getRumours();

  return <DataTable columns={columns} data={rumours} />;
}
