import { Context, u128 } from "near-sdk-as";
import { AccountId } from "./user.model";
import { MatchMode } from "./match.model";
import { SwapHistoryStorage, UserHistoryStorage } from "../storage/history.storage";

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
    constructor(public competitor: AccountId, public mode: MatchMode, public result: MatchResult, public bet: u128) {
        this.created = Context.blockTimestamp;
    }

    save(): void {
        const matchHistory = UserHistoryStorage.get(Context.sender);
        matchHistory.add(this);
        UserHistoryStorage.set(Context.sender, matchHistory);
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
