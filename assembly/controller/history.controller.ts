import { Context } from "near-sdk-as";
import { ErrorResponse } from "../helper/response.helper";
import { MatchHistory, SwapHistory } from "../model/history.model";
import { AccountId } from "../model/user.model";
import { SwapHistoryStorage, UserHistoryStorage } from "../storage/history.storage";

export function getMatchHistory(id: AccountId): MatchHistory[] {
    return UserHistoryStorage.get(id);
}

export function getSwapHistory(id: AccountId): SwapHistory[] | null {
    if (Context.sender != id) {
        return null;
    }
    return SwapHistoryStorage.get(id).values();
}
