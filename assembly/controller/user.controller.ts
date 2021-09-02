import { Context, logging, PersistentMap, PersistentSet, PersistentUnorderedMap, PersistentVector, u128 } from "near-sdk-as";
import { NEAR_RATE, NEAR_YOCTO } from "../model/fee.model";
import { AccountId, User } from "../model/user.model";
import { MatchHistory } from "../model/history.model";
import { UserStorage } from "../storage/user.storage";
import { UserHistoryStorage } from "../storage/history.storage";

// let userId = new PersistentSet<String>("us");

export function createUser(alias: string, bio: string, avatar: string): User {
    // if (UserStorage.contains(Context.sender)) {
    //     //Todo
    //     /**
    //      * Nếu attachedDeposit lớn hơn 0 thì topup vào tài khoản user
    //      */
    //     if (u128.gt(Context.attachedDeposit, u128.from("0"))) {
    //         topUp();
    //     }
    //     return UserStorage.get(Context.sender);
    // }

    const user = new User(alias, bio, avatar);
    UserStorage.set(Context.sender, user);
    return user;
}

export function updateUser(alias: string, bio: string, avatar: string): boolean {
    // if (users.contains(Context.sender)) {
    let user = UserStorage.get(Context.sender);
    user.alias = alias;
    user.bio = bio;
    user.avatar = avatar;
    UserStorage.set(Context.sender, user);
    return true;
    // }
    return false;
}

export function getUser(id: AccountId): User | null {
    // if (users.contains(id)) {
    // }
    return UserStorage.get(id);
    // return null;
}

export function getUsers(): User[] {
    return UserStorage.gets();
}

export function deleteUser(id: AccountId): boolean {
    // if (users.contains(id)) {
    //     return true;
    // }
    UserStorage.delete(id);
    return false;
}

export function getHistory(id: AccountId): MatchHistory[] {
    // if (userHistories.contains(id)) {
    // }
    return UserHistoryStorage.get(id);
    // return new Array<MatchHistory>(0);
}

export function topUp(): User {
    let user: User;
    const attachedDeposite: u128 = Context.attachedDeposit;
    const floatDeposit: u128 = u128.div(attachedDeposite, u128.from(NEAR_YOCTO));
    // if (users.contains(Context.sender)) {
    //
    // } else {
    //     user = new User(Context.sender, "", "");
    //     const newToken = u128.mul(floatDeposit, u128.from(NEAR_RATE));
    //     user.token = newToken;
    //     users.set(Context.sender, user);
    // }
    user = UserStorage.get(Context.sender);
    const newToken = u128.add(user.token, u128.mul(floatDeposit, u128.from(NEAR_RATE)));
    user.token = newToken;
    UserStorage.set(Context.sender, user);
    return user;
}

export function withDraw(): bool {
    return true;
}
