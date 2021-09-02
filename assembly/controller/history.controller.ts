import { Context } from "near-sdk-as";
import { ErrorResponse } from "../helper/response.helper";
import { MatchHistory, SwapHistory } from "../model/history.model";
import { AccountId } from "../model/user.model";
import { SwapHistoryStorage, UserHistoryStorage } from "../storage/history.storage";

export function getMatchHistory(id: AccountId): MatchHistory[] {
    return UserHistoryStorage.get(id);
}

export function getSwapHistory(id: AccountId): SwapHistory[] | String {
    if (Context.sender != id) {
        return ErrorResponse("0001");
    }
    return SwapHistoryStorage.get(id).values();
}
