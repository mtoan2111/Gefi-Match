import { Context, u128 } from "near-sdk-as";

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
}
