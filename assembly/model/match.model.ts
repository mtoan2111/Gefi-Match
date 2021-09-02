import { Context, u128 } from "near-sdk-as";
import { FinishedMatchStorage, RunningMatchStorage, WaitingMatchStorage } from "../storage/match.storage";
import { MatchHistory, MatchResult } from "./history.model";
import { AccountId } from "./user.model";

export enum MatchState {
    WAITING,
    RUNNING,
    FINISHED
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

    toString(): String {
        return `{"owner":${this.owner},"competitor":${
            this.competitor
        },"bet":${this.bet.toString()},"state":${this.state.toString()},"created":${this.created.toString()}}`;
    }
}
