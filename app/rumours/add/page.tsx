"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n/context";
import { rumourFormSchema, type RumourFormData } from "@/lib/schemas/rumour.schema";
import { VideoLinksInput } from "@/components/forms/video-links-input";
import { CountrySelector } from "@/components/forms/country-selector";

const positions = [
  "GK", "CB", "LB", "RB", "LWB", "RWB", 
  "CDM", "CM", "CAM", "LM", "RM", 
  "LW", "RW", "CF", "ST", "SS"
];

export default function AddRumourPage() {
  const { t } = useI18n();
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">{t('common.loading')}</div>;
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment && !user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t("auth.signInRequired")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isDevelopment && !isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t("rumours.noPermissionToAdd")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: RumourFormData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("transfer_rumours").insert({
        ...data,
        market_value: data.market_value ? data.market_value * 100 : null,
        created_by: user?.id || "dev-user",
        status: "active",
        direction: "incoming"
      });

      if (error) throw error;
      router.push("/rumours");
    } catch (error) {
      console.error("Error adding rumour:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPosition = () => {
    if (newPosition) {
      const currentPositions = form.getValues("positions") || [];
      if (!currentPositions.includes(newPosition)) {
        form.setValue("positions", [...currentPositions, newPosition]);
        setNewPosition("");
      }
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
          <CardTitle>{t("rumours.addNewRumour")}</CardTitle>
          <CardDescription>
            {t("rumours.fillPlayerDetails")}
          </CardDescription>
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
                name="current_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.currentTeam")}</FormLabel>
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
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.direction")}</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="incoming">{t("table.incoming")}</option>
                        <option value="outgoing">{t("table.outgoing")}</option>
                      </select>
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
                {isSubmitting ? t("forms.submitting") : t("forms.addRumour")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
