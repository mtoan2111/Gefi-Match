import * as match from "./controller/match.controller";
import * as user from "./controller/user.controller";
import { Match, MatchMode, MatchState } from "./model/match.model";
import { User, AccountId } from "./model/user.model";
import { MatchResult } from "./model/history.model";
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

export function finishMatch(id: string, state: MatchState, result: MatchResult, winner: AccountId): bool {
    return match.finishMatch(id, result, winner);
}

export function joinMatch(id: string): bool {
    return match.joinMatch(id);
}

export function startMatch(id: string): bool {
    return match.startMatch(id);
}


export function cancelMatch(id: string): bool {
    return match.cancelMatch(id);
}

export function getUsers(): User[] {
    return user.getUsers();
}

export function getUser(id: AccountId): User | null {
    return user.getUser(id);
}

export function deleteUser(id: AccountId): boolean {
    return user.deleteUser(id);
}

export function topUp(): User {
    return user.topUp();
}

export function widthDraw(value: u128): bool {
    return user.withDraw();
}
