import { FinishedMatchStorage, RunningMatchStorage, WaitingMatchStorage } from "../storage/match.storage";
import { MatchHistory, MatchResult } from "./history.model";
import { base58, Context, u128, util, logging } from "near-sdk-as";
import { AccountId } from "./user.model";


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

    join(competitor: AccountId): void {
        this.competitor = competitor;
        WaitingMatchStorage.set(this.id, this);
    }

    start(): void {
        this.state = MatchState.RUNNING;
        // Change Match Storage
        WaitingMatchStorage.delete(this.id);
        RunningMatchStorage.set(this.id, this);
    }

    finish(): void {
        this.state = MatchState.FINISHED;
        FinishedMatchStorage.set(this.id, this);
        RunningMatchStorage.delete(this.id);
    }

    static create(bet: u128, mode: MatchMode): Match {
        let matchId: String = "";
        while (matchId == "") {
            const idTmp = Context.sender + Context.blockTimestamp.toString();
            const idHash = base58.encode(util.stringToBytes(idTmp));
            if (!WaitingMatchStorage.contains(idHash)) {
                matchId = idHash;
            }
        }

        return new Match(matchId, bet, mode);
    }

    save(): void {
        switch (this.state) {
            case MatchState.WAITING:
                WaitingMatchStorage.set(this.id, this);
                break;
            case MatchState.RUNNING:
                RunningMatchStorage.set(this.id, this);
                break;
            case MatchState.FINISHED:
                FinishedMatchStorage.set(this.id, this);
                break;
            default:
                break;
        }
    }

    toString(): String {
        return `{"owner":${this.owner},"competitor":${
            this.competitor
        },"bet":${this.bet.toString()},"state":${this.state.toString()},"created":${this.created.toString()}}`;
    }
}
