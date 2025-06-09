"use client";

import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/rumours/data-table-view-options";
import { DataTableFacetedFilter } from "@/components/rumours/data-table-faceted-filter";
import { Cross } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { t } = useI18n();
  const isFiltered = table.getState().columnFilters.length > 0;

  // Filter options
  const positions = [
    { label: "Goalkeeper", value: "GK" },
    { label: "Center Back", value: "CB" },
    { label: "Left Back", value: "LB" },
    { label: "Right Back", value: "RB" },
    { label: "Left Wing Back", value: "LWB" },
    { label: "Right Wing Back", value: "RWB" },
    { label: "Defensive Midfielder", value: "CDM" },
    { label: "Central Midfielder", value: "CM" },
    { label: "Attacking Midfielder", value: "CAM" },
    { label: "Left Midfielder", value: "LM" },
    { label: "Right Midfielder", value: "RM" },
    { label: "Left Wing", value: "LW" },
    { label: "Right Wing", value: "RW" },
    { label: "Center Forward", value: "CF" },
    { label: "Striker", value: "ST" },
    { label: "Second Striker", value: "SS" },
  ];

  const leagues = [
    { label: "Premier League", value: "Premier League" },
    { label: "La Liga", value: "La Liga" },
    { label: "Serie A", value: "Serie A" },
    { label: "Bundesliga", value: "Bundesliga" },
    { label: "Ligue 1", value: "Ligue 1" },
    { label: "Eredivisie", value: "Eredivisie" },
    { label: "Primeira Liga", value: "Primeira Liga" },
  ];

  const statuses = [
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "rejected" },
    { label: "Expired", value: "expired" },
  ];

  const priorities = [
    { label: "High Priority", value: "high" },
    { label: "Medium Priority", value: "medium" },
    { label: "Low Priority", value: "low" },
  ];

  const directions = [
    { label: t("table.incoming"), value: "incoming" },
    { label: t("table.outgoing"), value: "outgoing" },
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={t("table.filterPlayers")}
          value={
            (table.getColumn("player_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("player_name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn("positions") && (
          <DataTableFacetedFilter
            column={table.getColumn("positions")}
            title={t("table.position")}
            options={positions}
          />
        )}

        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}

        {table.getColumn("calculated_priority_level") && (
          <DataTableFacetedFilter
            column={table.getColumn("calculated_priority_level")}
            title="Priority"
            options={priorities}
          />
        )}

        {table.getColumn("direction") && (
          <DataTableFacetedFilter
            column={table.getColumn("direction")}
            title={t("table.direction")}
            options={directions}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t("table.reset")}
            <Cross className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
