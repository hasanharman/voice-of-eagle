"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n/context";
import { rumourFormSchema, type RumourFormData } from "@/lib/schemas/rumour.schema";
import { VideoLinksInput } from "@/components/forms/video-links-input";
import { CountrySelector } from "@/components/forms/country-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


const positions = [
  "GK", "CB", "LB", "RB", "LWB", "RWB", 
  "CDM", "CM", "CAM", "LM", "RM", 
  "LW", "RW", "CF", "ST"
];

interface AddRumourDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRumourDialog({ open, onOpenChange }: AddRumourDialogProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPosition, setNewPosition] = useState("");

  const form = useForm({
    resolver: zodResolver(rumourFormSchema),
    defaultValues: {
      player_name: "",
      positions: [],
      video_links: []
    },
  });

  const addPosition = () => {
    if (newPosition && !form.getValues("positions")?.includes(newPosition)) {
      const currentPositions = form.getValues("positions") || [];
      form.setValue("positions", [...currentPositions, newPosition]);
      setNewPosition("");
    }
  };

  const removePosition = (position: string) => {
    const currentPositions = form.getValues("positions") || [];
    form.setValue("positions", currentPositions.filter(p => p !== position));
  };

  const onSubmit = async (data: RumourFormData) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('transfer_rumours')
        .insert([{
          ...data,
          created_by: user.id,
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error('Error adding rumour:', error);
        console.error("Failed to add rumour:", error);
        return;
      }

      console.log("Rumour added successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding rumour:', error);
      console.error("Failed to add rumour:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("forms.addRumour")}</DialogTitle>
          <DialogDescription>
            {t("forms.addRumourDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="player_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.playerName")} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t("forms.playerNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.age")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={t("forms.agePlaceholder")} 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.nationality")}</FormLabel>
                  <FormControl>
                    <CountrySelector
                      value={form.getValues("nationality_code")}
                      onSelect={(country) => {
                        if (country) {
                          form.setValue("nationality", country.name);
                          form.setValue("nationality_code", country.code);
                        } else {
                          form.setValue("nationality", "");
                          form.setValue("nationality_code", "");
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.positions")}</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {(field.value || []).map((position) => (
                          <Badge key={position} variant="secondary" className="flex items-center gap-1">
                            {t(`positions.${position}`)}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removePosition(position)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <select
                          value={newPosition}
                          onChange={(e) => setNewPosition(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">{t("forms.selectPosition")}</option>
                          {positions.filter(pos => !field.value?.includes(pos)).map(position => (
                            <option key={position} value={position}>
                              {t(`positions.${position}`)}
                            </option>
                          ))}
                        </select>
                        <Button type="button" onClick={addPosition} disabled={!newPosition}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fromTeam")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("forms.fromTeamPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="to_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.toTeam")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("forms.toTeamPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="current_league"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.currentLeague")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("forms.currentLeaguePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="market_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.marketValue")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={t("forms.marketValuePlaceholder")} 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.sourceUrl")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("forms.sourceUrlPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transfermarkt_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.transfermarktUrl")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("forms.transfermarktUrlPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="photo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.photoUrl")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("forms.photoUrlPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_links"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.videoLinks")}</FormLabel>
                  <FormControl>
                    <VideoLinksInput
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("common.submitting") : t("common.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
