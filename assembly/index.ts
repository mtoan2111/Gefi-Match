import * as match from "./match";
import * as user from "./user";
import { AccountId, History, Match, MatchMode, MatchResult, MatchState, NEAR_YOCTO } from "./model";
import { User } from "./model";
import { Context, u128, ContractPromiseBatch, logging } from "near-sdk-as";

export function createMatch(mode: MatchMode, bet: u128): String {
    return match.createMatch(mode, bet);
}

export function createUser(alias: string, bio: string, avatar: string): User {
    return user.createUser(alias, bio, avatar);
}

export function getMatch(): Match[] {
    return match.getMatch();
}

export function updateMatch(id: string, state: MatchState, result: MatchResult, winner: AccountId): bool {
    return match.updateMatch(id, state, result, winner);
}

export function joinMatch(id: string, accountId: AccountId): bool {
    return match.joinMatch(id, accountId);
}

export function getUsers(): User[] {
    return user.getUsers();
}

export function getUser(id: AccountId): User | null {
    return user.getUser(id);
}

export function getHistory(id: AccountId): History[] {
    return user.getHistory(id);
}

export function deleteUser(id: AccountId): boolean {
    return user.deleteUser(id);
}

export function topUp(): User {
    return user.topUp();
}

export function withDraw(value: u128): boolean {
    // const account = Context.cont;
    const callback_account = Context.contractName;
    const callback_method = "on_complete";
    const callback_args = "";
    const BASIC_GAS = 5000000000000;

    const amount = u128.mul(u128.from(NEAR_YOCTO), value);
    logging.log("amount: " + amount.toString());

    logging.log(Context.sender);
    ContractPromiseBatch.create(Context.sender).transfer(amount).then(callback_account).function_call(
        callback_method, // callback method name
        callback_args, // callback method arguments
        u128.Zero, // deposit attached to the callback
        BASIC_GAS, // gas attached to the callback (~5 Tgas (5e12) per "hop")
    );
    return true;
}

export function on_complete(args: string): void {
    logging.log(args);
}
