create table "public"."draft_games" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "game_json" jsonb not null,
    "sessions_json" jsonb not null,
    "user_id" uuid not null,
    "preseating_json" jsonb,
    "enabled_access_levels" jsonb not null default '[]'::jsonb
);


alter table "public"."draft_games" enable row level security;

CREATE UNIQUE INDEX draft_games_pkey ON public.draft_games USING btree (id);

alter table "public"."draft_games" add constraint "draft_games_pkey" PRIMARY KEY using index "draft_games_pkey";

alter table "public"."draft_games" add constraint "draft_games_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."draft_games" validate constraint "draft_games_user_id_fkey";

grant delete on table "public"."draft_games" to "anon";

grant insert on table "public"."draft_games" to "anon";

grant references on table "public"."draft_games" to "anon";

grant select on table "public"."draft_games" to "anon";

grant trigger on table "public"."draft_games" to "anon";

grant truncate on table "public"."draft_games" to "anon";

grant update on table "public"."draft_games" to "anon";

grant delete on table "public"."draft_games" to "authenticated";

grant insert on table "public"."draft_games" to "authenticated";

grant references on table "public"."draft_games" to "authenticated";

grant select on table "public"."draft_games" to "authenticated";

grant trigger on table "public"."draft_games" to "authenticated";

grant truncate on table "public"."draft_games" to "authenticated";

grant update on table "public"."draft_games" to "authenticated";

grant delete on table "public"."draft_games" to "service_role";

grant insert on table "public"."draft_games" to "service_role";

grant references on table "public"."draft_games" to "service_role";

grant select on table "public"."draft_games" to "service_role";

grant trigger on table "public"."draft_games" to "service_role";

grant truncate on table "public"."draft_games" to "service_role";

grant update on table "public"."draft_games" to "service_role";

create policy "Enable insert for users based on user_id"
on "public"."draft_games"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


