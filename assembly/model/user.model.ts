import { Context, PersistentSet, u128 } from "near-sdk-as";
import { UserHistoryStorage } from "../storage/history.storage";
import { UserStorage } from "../storage/user.storage";
import { MatchHistory, MatchResult } from "./history.model";
import { Match, MatchMode } from "./match.model";

export enum UserRank {
    CHICKEN,
    //...
}

export type AccountId = string;

@nearBindgen
export class User {
    id: AccountId;
    private token: u128;
    win: u64;
    lose: u64;
    tie: u64;
    rank: UserRank;
    private userHistory: PersistentSet<MatchHistory>;
    constructor(public alias: String, public bio: String, public avatar: String) {
        this.token = u128.Zero;
        this.id = Context.sender;
        this.rank = UserRank.CHICKEN;
        this.win = 0;
        this.lose = 0;
        this.tie = 0;
        this.userHistory = new PersistentSet<MatchHistory>(this.id.toString());
    }

    getBalance(): u128 {
        return this.token;
    }

    save(): User {
        UserStorage.set(this.id, this);
        return this;
    }

    saveMatchResult(result: MatchResult): void {
        switch (result) {
            case MatchResult.TIE:
                this.tie = this.tie + 1;
                break;
            case MatchResult.LOSE:
                this.lose = this.lose + 1;
                break;
            case MatchResult.WIN:
                this.win = this.win + 1;
                break;
            default:
                return;
        }
        this.save();
    }

    endGame(result: MatchResult, bet: u128, match: Match): void {
        switch (result) {
            case MatchResult.TIE:
                this.addBalance(bet);
                break;
            case MatchResult.LOSE:
                break;
            case MatchResult.WIN:
                this.addBalance(u128.mul(bet, u128.from(2)));
                break;
            default:
                return;
        }
        this.saveMatchResult(result);
        this.saveMatchHistory(match, result);
        this.save();
    }

    addBalance(amount: u128): u128 {
        let fee: u128 = this.feeCalculate(amount);
        this.token = u128.sub(u128.add(this.token, amount), fee);
        this.save();
        return this.token;
    }

    subBalance(amount: u128): u128 | null {
        let fee: u128 = this.feeCalculate(amount);
        if (u128.le(this.token, amount)) {
            return null;
        }
        this.token = u128.sub(u128.sub(this.token, amount), fee);
        this.save();
        return this.token;
    }

    cashBack(amount: u128): u128 {
        this.token = u128.add(this.token, amount);
        this.save();
        return this.token;
    }

    feeCalculate(amount: u128): u128 {
        return u128.from(0);
    }

    saveMatchHistory(match: Match, result: MatchResult): void {
        let matchHistory = new MatchHistory((match.owner === this.id) ? match.competitor : match.owner, match.mode, result, match.bet);
        this.userHistory.add(matchHistory)
        UserHistoryStorage.set(this.id, this.userHistory);
    }
}
