import * as R from "ramda";
import { supabase } from "@/supabase";
import {
  Game,
  GameListing,
  NewGame,
  RsvpWithSessionAndGame,
} from "@/typings/Game";
import { Rsvp } from "@/typings/Rsvp";
import { Session } from "@/typings/Session";
import { log } from "@/util/logger";

// helper functions
const sortSessionByTimeAsc = (a: Session, b: Session) => {
  if (a.start_time < b.start_time) return -1;
  if (a.start_time > b.start_time) return 1;
  return 0;
};
const sortSessionsOnGame = (game: GameListing) => {
  return {
    ...game,
    sessions: game.sessions.sort(sortSessionByTimeAsc),
  };
};
const mapToAscSessions = R.map(sortSessionsOnGame);

export async function createGame(newGame: NewGame) {
  const { data, error } = await supabase.from("games").insert(newGame).single();
  if (error) {
    log({ error });
    throw error;
  }
  return data;
}

export async function loadJoinedGames(userId: string) {
  const { data, error } = await supabase
    .from<RsvpWithSessionAndGame>("rsvps")
    .select(
      "id, session_id (id, start_time, end_time, game_id (*, communities (id, name)), rsvps (*))"
    )
    .eq("user_id", userId);
  if (error) {
    log({ error });
  }
  if (data) {
    return data;
  }
}

export async function loadCommunityGames(communityIds: string[]) {
  const { data, error } = await supabase
    .from<GameListing>("games")
    .select("*, community_id (id, name), sessions (id, start_time)")
    .in("community_id", communityIds);
  if (error) {
    log({ error });
  }
  if (data) {
    return mapToAscSessions(data);
  }
}

type SessionsLookup = Omit<Session, "game_id"> & {
  game_id: Game;
  rsvps: Rsvp[];
};

export async function loadManagedGames(userId: string) {
  const today = new Date();
  const { data, error } = await supabase
    .from<SessionsLookup>("sessions")
    .select(
      "*, game_id (*, community_id (id, name)), rsvps (user_id (username))"
    )
    .gte("start_time", today.getTime())
    .eq("creator_id", userId);
  if (error) {
    log({ error });
  }

  if (data) {
    return transformSessionBasedLookupToGames(data);
  }
}

function transformSessionBasedLookupToGames(
  sessions: SessionsLookup[]
): GameListing[] {
  const byGame = R.groupBy((session: SessionsLookup) => {
    return session.game_id.id;
  });
  const removeGameFromSession = R.omit(["game_id"]);
  const reduceSessionsIntoGame = R.reduce(
    (acc, session: SessionsLookup) => {
      return {
        ...acc,
        ...session.game_id,
        sessions: acc.sessions.concat(removeGameFromSession(session)),
      };
    },
    { sessions: [] as Session[] }
  );
  const sessionsByGame = byGame(sessions);
  const mapToGameWithSessions = R.map(reduceSessionsIntoGame);
  // @ts-expect-error confusing types from ramda but swear it works
  return R.compose(
    R.values,
    mapToAscSessions,
    mapToGameWithSessions
  )(sessionsByGame);
}

export async function joinSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const data = await fetch(
    `/.netlify/functions/processRsvp?sessionId=${sessionId}&userId=${userId}`,
    {
      method: "POST",
    }
  ).then((response) => response.json());
  return data;
}

export async function leaveSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const data = await fetch(
    `/.netlify/functions/processRsvp?sessionId=${sessionId}&userId=${userId}`,
    {
      method: "DELETE",
    }
  ).then((response) => response.json());
  return data;
}

// function transformRsvpBasedLookupToGames(rsvps: RsvpWithSessionAndGame[]): GameListing[] {
//   const byGame = R.groupBy((rsvp: RsvpWithSessionAndGame) => {
//     return rsvp.session_id.game_id.id;
//   });
//   const removeGameFromSession = R.omit(["game_id"]);
//   const reduceSessionsIntoGame = R.reduce(
//     (acc, session: SessionsLookup) => {
//       return {
//         ...acc,
//         ...session.game_id,
//         sessions: acc.sessions.concat(removeGameFromSession(session)),
//       };
//     },
//     { sessions: [] as Session[] }
//   );
// }