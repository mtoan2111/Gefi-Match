import { base58, Context, u128, util } from "near-sdk-as";
import { WaitingMatchStorage } from "../storage/match.storage";
import { AccountId } from "./user.model";

export enum MatchState {
    WAITING,
    RUNNING,
    FINISHED,
    CANCELED,
}

export enum MatchMode {
    EASY,
    MEDIUM,
    HARD,
    EXPERT,
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

    join(): void {}

    start(): void {}

    finish(): void {}

    toString(): String {
        return `{"owner":${this.owner},"competitor":${
            this.competitor
        },"bet":${this.bet.toString()},"state":${this.state.toString()},"created":${this.created.toString()}}`;
    }
}

@nearBindgen
export class WaitingMatch extends Match {
    static create(bet: u128, mode: MatchMode): WaitingMatch {
        let matchId: String = "";

        while (matchId == "") {
            const idTmp = Context.sender + Context.blockTimestamp.toString();
            const idHash = base58.encode(util.stringToBytes(idTmp));
            if (!WaitingMatchStorage.contains(idHash)) {
                matchId = idHash;
            }
        }

        return new WaitingMatch(matchId, bet, mode);
    }

    save() {
        WaitingMatchStorage.set(this.id, this);
    }
}
