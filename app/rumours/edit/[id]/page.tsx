"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n/context";
import { rumourFormSchema, type RumourFormData } from "@/lib/schemas/rumour.schema";
import { TransferRumour } from "@/lib/types/rumours.types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { VideoLinksInput } from "@/components/forms/video-links-input";
import { CountrySelector } from "@/components/forms/country-selector";

const positions = [
  "GK", "CB", "LB", "RB", "LWB", "RWB", 
  "CDM", "CM", "CAM", "LM", "RM", 
  "LW", "RW", "CF", "ST", "SS"
];

export default function EditRumourPage() {
  const { t } = useI18n();
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [rumour, setRumour] = useState<TransferRumour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPosition, setNewPosition] = useState("");

  const form = useForm({
    resolver: zodResolver(rumourFormSchema),
    defaultValues: {
      player_name: "",
      positions: [],
      video_links: []
    }
  });

  useEffect(() => {
    const fetchRumour = async () => {
      if (!params.id) return;
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transfer_rumours")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        router.push("/rumours");
        return;
      }

      setRumour(data);
      form.reset({
        player_name: data.player_name,
        age: data.age,
        nationality: data.nationality,
        nationality_code: data.nationality_code,
        positions: data.positions || [],
        from_team: data.from_team,
        to_team: data.to_team,
        current_league: data.current_league,
        market_value: data.market_value ? data.market_value / 100 : undefined,
        source_url: data.source_url,
        transfermarkt_url: data.transfermarkt_url,
        photo_url: data.photo_url,
        video_links: data.video_links || []
      });
      setIsLoading(false);
    };

    fetchRumour();
  }, [params.id, form, router]);

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment && (!user || !isAdmin)) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t("rumours.noPermissionToEdit")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">{t("common.loading")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: RumourFormData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("transfer_rumours")
        .update({
          ...data,
          market_value: data.market_value ? data.market_value * 100 : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", params.id);

      if (error) throw error;
      router.push("/rumours");
    } catch (error) {
      console.error("Error updating rumour:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("rumours.editRumour")}</CardTitle>
          <CardDescription>{t("rumours.updatePlayerDetails")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="player_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.playerName")} *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                                className="h-4 w-4 p-0"
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
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">{t("forms.selectPosition")}</option>
                            {positions.map((pos) => (
                              <option key={pos} value={pos}>
                                {t(`positions.${pos}`)}
                              </option>
                            ))}
                          </select>
                          <Button type="button" variant="outline" onClick={addPosition}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="from_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fromTeam")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_league"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.currentLeague")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="1000000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.sourceUrl")}</FormLabel>
                    <FormControl>
                      <Input type="url" {...field} />
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
                      <Input type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.photoUrl")}</FormLabel>
                    <FormControl>
                      <Input type="url" {...field} />
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
                      <VideoLinksInput value={field.value || []} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? t("forms.updating") : t("forms.updateRumour")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
