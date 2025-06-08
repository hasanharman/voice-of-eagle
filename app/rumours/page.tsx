"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/rumours/data-table";
import { columns } from "@/components/rumours/columns";
import { RumourWithScores } from "@/lib/types/rumours.types";
import { AdminAddButton } from "@/components/rumours/admin-add-button";

function useRumours() {
  const [rumours, setRumours] = useState<RumourWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRumours = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("rumours_with_scores")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching rumours:", error);
          setError(error.message);
          return;
        }

        setRumours(data || []);
      } catch (err) {
        console.error("Error fetching rumours:", err);
        setError("Failed to fetch rumours");
      } finally {
        setLoading(false);
      }
    };

    fetchRumours();
  }, []);

  return { rumours, loading, error };
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

export default function RumoursPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Transfer Rumours</h1>
          <p className="text-muted-foreground">
            Community-driven transfer rumours with voting and priority levels
          </p>
        </div>
        <AdminAddButton />
      </div>

      <RumoursTable />
    </div>
  );
}

function RumoursTable() {
  const { rumours, loading, error } = useRumours();

  if (loading) {
    return <RumoursTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading rumours: {error}</p>
      </div>
    );
  }

  return <DataTable columns={columns} data={rumours} />;
}
