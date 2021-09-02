import { PersistentUnorderedMap, PersistentSet } from "near-sdk-as";
import { MatchHistory, SwapHistory } from "../model/history.model";
import { AccountId } from "../model/user.model";

const userHistories = new PersistentUnorderedMap<string, PersistentSet<MatchHistory>>("uhh");
const swapHistories = new PersistentUnorderedMap<string, PersistentSet<SwapHistory>>("shh");

@nearBindgen
export class UserHistoryStorage {
    static get(id: string): MatchHistory[] {
        return userHistories.getSome(id).values();
    }

    static set(id: string, value: PersistentSet<MatchHistory>): void {
        userHistories.set(id, value);
    }
}

@nearBindgen
export class SwapHistoryStorage {
    static get(id: AccountId): PersistentSet<SwapHistory> {
        if (swapHistories.contains(id)) {
            return swapHistories.getSome(id);
        }
        return new PersistentSet<SwapHistory>("swh");
    }

    static set(id: AccountId, value: PersistentSet<SwapHistory>): void {
        swapHistories.set(id, value);
    }
}

// interface HistoryStorage<T> {
//     get(id: AccountId): T[];
//     set(id: AccountId, value: PersistentSet<T>): void;
// }

// export const UserHistoryStorage: HistoryStorage<MatchHistory> = class UserHistoryStorage {
//     static get(id: string): MatchHistory[] {
//         return userHistories.getSome(id).values();
//     }

//     static set(id: string, value: PersistentSet<MatchHistory>): void {
//         return userHistories.set(id, value);
//     }
// };

// export const SwapHistoryStorage: HistoryStorage<SwapHistory> = class SwapHistoryStorage {
//     static get(id: AccountId): SwapHistory[] {
//         return swapHistories.getSome(id).values();
//     }

//     static set(id: AccountId, value: PersistentSet<SwapHistory>): void {
//         return swapHistories.set(id, value);
//     }
// };
