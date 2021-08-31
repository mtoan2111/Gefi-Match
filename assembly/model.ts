import { Context, u128 } from "near-sdk-as";

export const NEAR_YOCTO = "1000000000000000000000000"
export const NEAR_RATE = "1000"

export type AccountId = String;

export enum MatchState {
    WAITING,
    RUNNING,
    FINISHED,
}

export enum MatchMode {
    EASY,
    MEDIUM,
    HARD,
    EXPERT,
}

export enum UserRank {
    CHICKEN,
    //...
}

export enum SwapMode {
    TOPUP,
    WITHDRAW,
}

export enum HistoryState {
    WIN,
    LOSE,
}

@nearBindgen
export class Match {
    owner: AccountId;
    competitor: AccountId;
    created: u64;
    state: MatchState;
    constructor(public id: String, public bet: u128, public mode: MatchMode) {
        this.created = Context.blockTimestamp;
        this.state = MatchState.WAITING;
        this.owner = Context.sender;
    }
}

@nearBindgen
export class User {
    id: AccountId;
    token: u128;
    win: u64;
    lose: u64;
    rank: UserRank;
    constructor(public alias: String, public bio: String, public avatar: String) {
        this.token = u128.Zero;
        this.id = Context.sender;
        this.rank = UserRank.CHICKEN;
    }
}

@nearBindgen
export class History {
    created: u64;
    constructor(public competitor: AccountId, public state: String, public mode: MatchMode, public bet: u64) {
        this.created = Context.blockTimestamp;
    }
}

@nearBindgen
export class SwapHistory {
    created: u64;
    constructor(public mode: SwapMode, public value: u32) {
        this.created = Context.blockTimestamp;
    }
}
