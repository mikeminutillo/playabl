import { supabase } from "@/supabase";
import { CommunityAccess } from "@/typings/CommunityAccess";
import { log } from "@/util/logger";

export async function addAccessToMember({
  userId,
  accessId,
  communityId,
}: {
  userId: string;
  accessId: string;
  communityId: string;
}) {
  const { data, error } = await supabase
    .from("community_access")
    .insert({
      user_id: userId,
      community_id: communityId,
      access_level_id: accessId,
    })
    .single();
  if (error) {
    log({ error });
  }
  return data;
}

export async function removeAccessFromMember(communityAccessId: string) {
  const { data, error } = await supabase
    .from("community_access")
    .delete()
    .match({ id: communityAccessId })
    .single();
  if (error) {
    log({ error });
  }
  return data;
}

export async function loadCommunityAccessTimes(communityId: string) {
  const { data, error } = await supabase
    .from("access_levels")
    .select()
    .eq("community_id", communityId);
  if (error) {
    log({ error });
  }
  return data;
}

export async function loadUserCommunityAccess({
  userId,
  communityId,
}: {
  userId: string;
  communityId: string;
}) {
  const { data, error } = await supabase
    .from<CommunityAccess>("community_access")
    .select()
    .match({ community_id: communityId, user_id: userId });
  if (error) {
    log({ error });
  }
  return data;
}