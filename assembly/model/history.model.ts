import { Context, u128 } from "near-sdk-as";
import { AccountId } from "./user.model";
import { MatchMode } from "./match.model";

export enum MatchResult {
    WIN,
    LOSE,
    TIE,
}

export enum SwapMode {
    TOPUP,
    WITHDRAW,
}

@nearBindgen
export class MatchHistory {
    created: u64;
    bet: u128;
    constructor(public competitor: AccountId, public mode: MatchMode, public result: MatchResult) {
        this.created = Context.blockTimestamp;
        this.bet = u128.Zero;
    }
}

@nearBindgen
export class SwapHistory {
    created: u64;
    constructor(public mode: SwapMode, public value: u32) {
        this.created = Context.blockTimestamp;
    }
}
