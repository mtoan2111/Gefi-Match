import * as match from "./match";
import * as user from "./user";
import { Match, MatchMode, MatchState } from "./model";
import { User } from "./model";

export function createMatch(mode: MatchMode): String {
    return match.createMatch(mode);
}

export function createUser(alias: string, bio: string, avatar: string): User {
    return user.createUser(alias, bio, avatar);
}

export function getMatch(): Match[] {
    return match.getMatch()
}

export function updateMatch(id: string, state: MatchState): bool {
    return match.updateMatch(id, state);
}