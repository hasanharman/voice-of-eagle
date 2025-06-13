"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/rumours/data-table";
import { createColumns } from "@/components/rumours/columns";
import { EditRumourDialog } from "@/components/rumours/edit-rumour-dialog";
import { RumourWithScores } from "@/lib/types/rumours.types";
import { AdminAddButton } from "@/components/rumours/admin-add-button";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function useRumours() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchRumours = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rumours_with_scores")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  };

  const {
    data: rumours = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rumours", user?.id],
    queryFn: fetchRumours,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Refetch on auth state change
  useEffect(() => {
    refetch();
  }, [user, refetch]);

  return { rumours, loading, error, refetch };
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
          <h1 className="text-3xl font-bold">{t("rumours.title")}</h1>
          <p className="text-muted-foreground">{t("rumours.subtitle")}</p>
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
  const { isAdmin } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRumourId, setSelectedRumourId] = useState<string | null>(null);

  const handleEditClick = (rumourId: string) => {
    setSelectedRumourId(rumourId);
    setEditDialogOpen(true);
  };

  if (loading) {
    return <RumoursTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">
          {t("rumours.errorLoading")}:{" "}
          {typeof error === "string" ? error : error?.message}
        </p>
      </div>
    );
  }

  const columns = createColumns(t, handleEditClick, isAdmin);

  return (
    <>
      <DataTable columns={columns} data={rumours} />
      <EditRumourDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        rumourId={selectedRumourId}
      />
    </>
  );
}

function clearSupabaseAuthCookies() {
  // Clear generic names (for legacy)
  document.cookie = "sb-access-token=; Max-Age=0; path=/";
  document.cookie = "sb-refresh-token=; Max-Age=0; path=/";
  for (let i = 0; i < 5; i++) {
    document.cookie = `sb-access-token.${i}=; Max-Age=0; path=/`;
    document.cookie = `sb-refresh-token.${i}=; Max-Age=0; path=/`;
  }
  // Dynamically clear all sb-*-auth-token and sb-*-refresh-token cookies
  document.cookie
    .split(";")
    .map((c) => c.trim())
    .forEach((cookie) => {
      const [name] = cookie.split("=");
      if (/^sb-.*-(auth|refresh)-token$/.test(name)) {
        document.cookie = `${name}=; Max-Age=0; path=/`;
      }
    });
}
