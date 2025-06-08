import { createClient } from "@/lib/supabase/client";

export async function checkAdminStatus(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function createUserProfile(userId: string, isAdmin: boolean = false) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        is_admin: isAdmin,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
}
