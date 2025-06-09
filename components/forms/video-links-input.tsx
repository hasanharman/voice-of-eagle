"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface VideoLink {
  title: string;
  url: string;
  platform: "youtube";
}

interface VideoLinksInputProps {
  value: VideoLink[];
  onChange: (videoLinks: VideoLink[]) => void;
}

export function VideoLinksInput({ value, onChange }: VideoLinksInputProps) {
  const { t } = useI18n();
  const [newVideo, setNewVideo] = useState({ title: "", url: "", platform: "youtube" as const });

  const addVideoLink = () => {
    if (newVideo.title && newVideo.url) {
      onChange([...value, newVideo]);
      setNewVideo({ title: "", url: "", platform: "youtube" });
    }
  };

  const removeVideoLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {value.map((video, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {video.title}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => removeVideoLink(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          placeholder={t("forms.videoTitle")}
          value={newVideo.title}
          onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
        />
        <Input
          placeholder={t("forms.videoUrl")}
          value={newVideo.url}
          onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
        />
        <Select value={newVideo.platform} onValueChange={(value) => setNewVideo({ ...newVideo, platform: value as "youtube" })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="button" variant="outline" onClick={addVideoLink} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        {t("forms.addVideo")}
      </Button>
    </div>
  );
}
