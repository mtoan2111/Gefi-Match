import * as match from "./controller/match.controller";
import * as user from "./controller/user.controller";
import * as history from "./controller/history.controller";
import * as swap from "./controller/swap.controller";
import { Match, MatchMode, MatchState } from "./model/match.model";
import { User, AccountId } from "./model/user.model";
import { MatchResult, MatchHistory } from "./model/history.model";
import { u128 } from "near-sdk-as";

export function createMatch(mode: MatchMode, bet: u128): String {
    return match.createMatch(mode, bet);
}

export function createUser(alias: string, bio: string, avatar: string): User {
    return user.createUser(alias, bio, avatar);
}

export function getMatch(): Match[] {
    return match.getMatch();
}

// export function updateMatch(id: string, state: MatchState, result: MatchResult, winner: AccountId): bool {
//     return match.updateMatch(id, state, result, winner);
// }

// export function joinMatch(id: string, accountId: AccountId): bool {
//     return match.joinMatch(id, accountId);
// }

export function getUsers(): User[] {
    return user.getUsers();
}

export function getUser(id: AccountId): User | null {
    return user.getUser(id);
}

export function getMatchHistory(id: AccountId): MatchHistory[] {
    return history.getMatchHistory(id);
}

export function deleteUser(id: AccountId): bool {
    return user.deleteUser(id);
}

export function deposit(): User {
    return swap.deposit();
}

export function withDraw(value: u128): u128 | String {
    return swap.withDraw(value);
}
