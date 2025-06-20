"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/rumours/data-table";
import { createColumns } from "@/components/rumours/columns";
import { RumourWithScores } from "@/lib/types/rumours.types";
import { AdminAddButton } from "@/components/rumours/admin-add-button";
import { useI18n } from "@/lib/i18n/context";

function useRumours() {
  const [rumours, setRumours] = useState<RumourWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchRumours();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    
    if (typeof supabase.channel === 'function') {
      const subscription = supabase
        .channel('rumours_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'community_votes' },
          () => {
            console.log('Community vote changed, refetching...');
            fetchRumours();
          }
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'priority_votes' },
          () => {
            console.log('Priority vote changed, refetching...');
            fetchRumours();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      console.log('Real-time functionality not available, using polling fallback');
      const interval = setInterval(() => {
        fetchRumours();
      }, 5000);

      return () => {
        clearInterval(interval);
      };
    }
  }, []);

  return { rumours, loading, error, refetch: fetchRumours };
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
  const { t } = useI18n();
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('rumours.title')}</h1>
          <p className="text-muted-foreground">
            {t('rumours.subtitle')}
          </p>
        </div>
        <AdminAddButton />
      </div>

      <RumoursTable />
    </div>
  );
}

function RumoursTable() {
  const { t } = useI18n();
  const { rumours, loading, error } = useRumours();

  if (loading) {
    return <RumoursTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{t('rumours.errorLoading')}: {error}</p>
      </div>
    );
  }

  return <DataTable columns={createColumns(t)} data={rumours} />;
}
