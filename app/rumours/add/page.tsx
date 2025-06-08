"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AddRumourPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    player_name: "",
    age: "",
    nationality: "",
    nationality_code: "",
    positions: [] as string[],
    current_team: "",
    current_league: "",
    market_value: "",
    source_name: "",
    source_url: "",
    transfermarkt_url: "",
    photo_url: "",
  });

  const [newPosition, setNewPosition] = useState("");

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!user) {
    router.push("/");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to add rumours. Only admins can add new rumours.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPosition = () => {
    if (newPosition.trim() && !formData.positions.includes(newPosition.trim())) {
      setFormData(prev => ({
        ...prev,
        positions: [...prev.positions, newPosition.trim()]
      }));
      setNewPosition("");
    }
  };

  const removePosition = (position: string) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter(p => p !== position)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.player_name.trim()) {
      toast.error("Player name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const rumourData = {
        player_name: formData.player_name.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        nationality: formData.nationality.trim() || null,
        nationality_code: formData.nationality_code.trim() || null,
        positions: formData.positions.length > 0 ? formData.positions : null,
        current_team: formData.current_team.trim() || null,
        current_league: formData.current_league.trim() || null,
        market_value: formData.market_value ? parseInt(formData.market_value) * 100 : null,
        source_name: formData.source_name.trim() || null,
        source_url: formData.source_url.trim() || null,
        transfermarkt_url: formData.transfermarkt_url.trim() || null,
        photo_url: formData.photo_url.trim() || null,
        video_links: [],
        status: "active" as const,
        created_by: user.id,
      };

      const { error } = await supabase
        .from("transfer_rumours")
        .insert([rumourData]);

      if (error) throw error;

      toast.success("Rumour added successfully!");
      router.push("/rumours");
    } catch (error) {
      console.error("Error adding rumour:", error);
      toast.error("Failed to add rumour. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Transfer Rumour</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="player_name">Player Name *</Label>
                <Input
                  id="player_name"
                  value={formData.player_name}
                  onChange={(e) => handleInputChange("player_name", e.target.value)}
                  placeholder="Enter player name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder="Enter age"
                />
              </div>

              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange("nationality", e.target.value)}
                  placeholder="Enter nationality"
                />
              </div>

              <div>
                <Label htmlFor="nationality_code">Nationality Code</Label>
                <Input
                  id="nationality_code"
                  value={formData.nationality_code}
                  onChange={(e) => handleInputChange("nationality_code", e.target.value)}
                  placeholder="e.g., TR, EN, DE"
                />
              </div>

              <div>
                <Label htmlFor="current_team">Current Team</Label>
                <Input
                  id="current_team"
                  value={formData.current_team}
                  onChange={(e) => handleInputChange("current_team", e.target.value)}
                  placeholder="Enter current team"
                />
              </div>

              <div>
                <Label htmlFor="current_league">Current League</Label>
                <Input
                  id="current_league"
                  value={formData.current_league}
                  onChange={(e) => handleInputChange("current_league", e.target.value)}
                  placeholder="Enter current league"
                />
              </div>

              <div>
                <Label htmlFor="market_value">Market Value (€)</Label>
                <Input
                  id="market_value"
                  type="number"
                  value={formData.market_value}
                  onChange={(e) => handleInputChange("market_value", e.target.value)}
                  placeholder="Enter market value in euros"
                />
              </div>

              <div>
                <Label htmlFor="source_name">Source Name</Label>
                <Input
                  id="source_name"
                  value={formData.source_name}
                  onChange={(e) => handleInputChange("source_name", e.target.value)}
                  placeholder="Enter source name"
                />
              </div>
            </div>

            <div>
              <Label>Positions</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Add position (e.g., ST, CM, CB)"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPosition())}
                />
                <Button type="button" onClick={addPosition} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.positions.map((position) => (
                  <Badge key={position} variant="secondary" className="flex items-center gap-1">
                    {position}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removePosition(position)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="source_url">Source URL</Label>
              <Input
                id="source_url"
                type="url"
                value={formData.source_url}
                onChange={(e) => handleInputChange("source_url", e.target.value)}
                placeholder="Enter source URL"
              />
            </div>

            <div>
              <Label htmlFor="transfermarkt_url">Transfermarkt URL</Label>
              <Input
                id="transfermarkt_url"
                type="url"
                value={formData.transfermarkt_url}
                onChange={(e) => handleInputChange("transfermarkt_url", e.target.value)}
                placeholder="Enter Transfermarkt URL"
              />
            </div>

            <div>
              <Label htmlFor="photo_url">Photo URL</Label>
              <Input
                id="photo_url"
                type="url"
                value={formData.photo_url}
                onChange={(e) => handleInputChange("photo_url", e.target.value)}
                placeholder="Enter photo URL"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Rumour"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
