import { Context, u128 } from "near-sdk-as";
import { AccountId } from "./user.model";
import { MatchMode } from "./match.model";
import { SwapHistoryStorage } from "../storage/history.storage";

export enum MatchResult {
    WIN,
    LOSE,
    TIE,
}

export enum SwapMode {
    DEPOSIT,
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
    constructor(public mode: SwapMode, public value: u128) {
        this.created = Context.blockTimestamp;
    }

    save(): void {
        const swapHistorys = SwapHistoryStorage.get(Context.sender);
        swapHistorys.add(this);
        SwapHistoryStorage.set(Context.sender, swapHistorys);
    }
}
