"use client"

import { MessageSquare, TrendingUp, Users, Target, Vote, BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function PurposePage() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">{t('purpose.title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('purpose.subtitle')}
          </p>
        </div>

        <div className="bg-background rounded-lg shadow p-6 border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-6 w-6" />
            <h2 className="text-2xl font-bold">{t('purpose.ourMission')}</h2>
          </div>
          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">
              {t('purpose.missionText1')}
            </p>
            <p className="text-foreground leading-relaxed">
              {t('purpose.missionText2')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background rounded-lg shadow p-6 border">
            <div className="flex items-center gap-2 mb-4">
              <Vote className="h-5 w-5" />
              <h3 className="text-xl font-bold">{t('purpose.communityVoting')}</h3>
            </div>
            <p className="text-foreground mb-4">
              {t('purpose.votingDescription')}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-muted text-foreground rounded text-sm">{t('purpose.communityVote')}</span>
                <span className="text-sm text-muted-foreground">{t('purpose.communityVoteDesc')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-muted text-foreground rounded text-sm">{t('purpose.priorityVote')}</span>
                <span className="text-sm text-muted-foreground">{t('purpose.priorityVoteDesc')}</span>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-lg shadow p-6 border">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5" />
              <h3 className="text-xl font-bold">{t('purpose.smartScoring')}</h3>
            </div>
            <p className="text-foreground mb-4">
              {t('purpose.scoringDescription')}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">{t('purpose.communityApproval')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{t('purpose.priorityCalculations')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="text-sm">{t('purpose.overallRankings')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg shadow p-6 border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6" />
            <h2 className="text-2xl font-bold">{t('purpose.howItWorks')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">{t('purpose.submitRumours')}</h4>
              <p className="text-sm text-muted-foreground">{t('purpose.submitDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Vote className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">{t('purpose.votePrioritize')}</h4>
              <p className="text-sm text-muted-foreground">{t('purpose.voteDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">{t('purpose.trackTrends')}</h4>
              <p className="text-sm text-muted-foreground">{t('purpose.trackDesc')}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">{t('purpose.joinCommunity')}</h3>
          <p className="text-blue-700 dark:text-blue-200">
            {t('purpose.joinDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
