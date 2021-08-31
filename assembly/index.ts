import * as match from "./match";
import * as user from "./user";
import { AccountId, Match, MatchMode } from "./model";
import { User } from "./model";
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

export function getUser(): User[] {
    return user.getUser();
}

export function deleteUser(id: AccountId): boolean {
    return user.deleteUser(id);
}

export function topUp(): User {
    return user.topUp();
}
