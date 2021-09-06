import * as match from "./controller/match.controller";
import * as user from "./controller/user.controller";
import * as history from "./controller/history.controller";
import * as swap from "./controller/swap.controller";
import { Match, MatchMode, MatchState } from "./model/match.model";
import { User, AccountId } from "./model/user.model";
import { MatchResult, MatchHistory } from "./model/history.model";
import { u128 } from "near-sdk-as";
import { PaginationResult } from "./helper/pagination.helper";

export function createMatch(mode: MatchMode, bet: u128): Match {
    return match.createMatch(mode, bet);
}

export function createUser(alias: string, bio: string, avatar: string): User {
    return user.createUser(alias, bio, avatar);
}

export function getMatchs(page: i32): PaginationResult<Match> {
    return match.getMatchs(page);
}

export function getMatch(id: String): Match | null {
    return match.getMatch(id);
}

export function finishMatch(id: string, result: MatchResult, winner: AccountId): String {
    return match.finishMatch(id, result, winner);
}

export function joinMatch(id: string): String {
    return match.joinMatch(id);
}

export function startMatch(id: string): String {
    return match.startMatch(id);
}

export function cancelMatch(id: string): String {
    return match.cancelMatch(id);
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

export function getMatchHistory(id: AccountId, page: i32): PaginationResult<MatchHistory> {
    return history.getMatchHistory(id, page);
}

export function deleteUser(id: AccountId): bool {
    return user.deleteUser(id);
}

export function deposit(): User {
    return swap.deposit();
}

export function withDraw(value: u128): u128 | null {
    return swap.withDraw(value);
}
