import { Context } from "near-sdk-as";
import { pagination, PaginationResult } from "../helper/pagination.helper";
import { MatchHistory, SwapHistory } from "../model/history.model";
import { AccountId } from "../model/user.model";
import { SwapHistoryStorage, UserHistoryStorage } from "../storage/history.storage";

export function getMatchHistory(id: AccountId, page: i32): PaginationResult<MatchHistory> {
    const histories = UserHistoryStorage.get(id).values();
    return pagination(histories, page);
}

export function getSwapHistory(id: AccountId, page: i32): PaginationResult<SwapHistory> | null {
    if (Context.sender != id) {
        return null;
    }
    const histories = SwapHistoryStorage.get(id).values();
    return pagination(histories, page);
}
