"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/context";

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignupDialog({ open, onOpenChange }: SignupDialogProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(t('auth.pleaseFilAllFields'));
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) throw error;

      toast.success(t('auth.checkEmailConfirmation'));
      onOpenChange(false);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(error.message || t('auth.failedToSignUp'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = async () => {
    if (!email || !password) {
      toast.error(t('auth.pleaseFilAllFields'));
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success(t('auth.signedInSuccessfully'));
      onOpenChange(false);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error(error.message || t('auth.failedToSignIn'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('auth.signUpToVote')}</DialogTitle>
          <DialogDescription>
            {t('auth.signUpDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.enterEmail')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.enterPassword')}
              required
            />
          </div>
          <DialogFooter className="flex-col space-y-2 sm:flex-col sm:space-x-0">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? t('auth.creatingAccount') : t('auth.signUp')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSignin}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? t('auth.signingIn') : t('auth.alreadyHaveAccount')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
