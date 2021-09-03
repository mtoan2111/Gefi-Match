import { PersistentUnorderedMap } from "near-sdk-as";
import { Match } from "../model/match.model";

const waitingMatch = new PersistentUnorderedMap<String, Match>("w");
const runningMatch = new PersistentUnorderedMap<String, Match>("r");
const finishedMatch = new PersistentUnorderedMap<String, Match>("f");

export class WaitingMatchStorage {
    static get(id: String): Match | null {
        if (waitingMatch.contains(id)) {
            return waitingMatch.getSome(id);
        }
        return null;
    }

    static set(id: String, value: Match): void {
        waitingMatch.set(id, value);
    }

    static gets(): Match[] {
        return waitingMatch.values();
    }

    static contains(id: String): bool {
        return waitingMatch.contains(id);
    }

    static delete(id: String): void {
        waitingMatch.delete(id);
    }
}

export class RunningMatchStorage {
    static get(id: String): Match | null {
        if (runningMatch.contains(id)) {
            return runningMatch.getSome(id);
        }
        return null;
    }

    static set(id: String, value: Match): void {
        runningMatch.set(id, value);
    }

    static gets(): Match[] {
        return runningMatch.values();
    }

    static contains(id: String): bool {
        return runningMatch.contains(id);
    }

    static delete(id: String): void {
        runningMatch.delete(id);
    }
}

export class FinishedMatchStorage {
    static get(id: String): Match {
        return finishedMatch.getSome(id);
    }

    static set(id: String, value: Match): void {
        finishedMatch.set(id, value);
    }

    static gets(): Match[] {
        return finishedMatch.values();
    }

    static contains(id: String): bool {
        return finishedMatch.contains(id);
    }

    static delete(id: String): void {
        finishedMatch.delete(id);
    }
}

/**
 * Something went wrong while trying to implement interface!!!!!
 */

// interface MatchStorage<T> {
//     get(id: String): T;
//     gets(): T[];
//     set(id: String, value: T): void;
//     contains(id: String): bool;
//     delete(id: String): void;
// }

// export const WaitingMatchStorage: MatchStorage<Match> = class WaitingMatchStorage {
//     static get(id: String): Match {
//         return waitingMatch.getSome(id);
//     }

//     static set(id: String, value: Match): void {
//         return waitingMatch.set(id, value);
//     }

//     static gets(): Match[] {
//         return waitingMatch.values();
//     }

//     static contains(id: String): bool {
//         return waitingMatch.contains(id);
//     }

//     static delete(id: String): void {
//         return waitingMatch.delete(id);
//     }
// };

// export const RunningMatchStorage: MatchStorage<Match> = class RunningMatchStorage {
//     static get(id: String): Match {
//         return runningMatch.getSome(id);
//     }

//     static set(id: String, value: Match): void {
//         return runningMatch.set(id, value);
//     }

//     static gets(): Match[] {
//         return runningMatch.values();
//     }

//     static contains(id: String): bool {
//         return runningMatch.contains(id);
//     }

//     static delete(id: String): void {
//         return runningMatch.delete(id);
//     }
// };

// export const FinishedMatchStorage: MatchStorage<Match> = class FinishedMatchStorage {
//     static get(id: String): Match {
//         return finishedMatch.getSome(id);
//     }

//     static set(id: String, value: Match): void {
//         return finishedMatch.set(id, value);
//     }

//     static gets(): Match[] {
//         return finishedMatch.values();
//     }

//     static contains(id: String): bool {
//         return finishedMatch.contains(id);
//     }

//     static delete(id: String): void {
//         return finishedMatch.delete(id);
//     }
// };
