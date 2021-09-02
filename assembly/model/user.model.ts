import { Context, u128 } from "near-sdk-as";
import { UserStorage } from "../storage/user.storage";
import { MatchResult } from "./history.model";

export enum UserRank {
    CHICKEN,
    //...
}

export type AccountId = string;

@nearBindgen
export class User {
    id: AccountId;
    token: u128;
    win: u64;
    lose: u64;
    rank: UserRank;
    constructor(public alias: String, public bio: String, public avatar: String) {
        this.token = u128.Zero;
        this.id = Context.sender;
        this.rank = UserRank.CHICKEN;
    }

    saveMatchResult(): void {}

    endGame(result: MatchResult, bet: u128): void {
        
        
        UserStorage.set(this.id, this);
    }

    addToken(amount: u128): u128 {
        let fee: u128 = this.feeCalculate(amount);
        this.token = u128.sub(u128.add(this.token, amount), fee);
        UserStorage.set(this.id, this);
        return this.token;
    }

    subToken(amount: u128): u128 | null{ 
        let fee: u128 = this.feeCalculate(amount);
        if (u128.le(this.token, amount)) return null;
        this.token = u128.sub(u128.sub(this.token, amount), fee);
        UserStorage.set(this.id, this);
        return this.token;
    }

    cashBackToken(amount: u128): u128 {
        this.token = u128.add(this.token, amount);
        UserStorage.set(this.id, this);
        return this.token;
    }

    feeCalculate(amount: u128): u128 {
        return u128.from(0);
    }
}
