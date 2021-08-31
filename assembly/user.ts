import { Context, logging, PersistentMap, PersistentSet, PersistentUnorderedMap, PersistentVector, u128 } from "near-sdk-as";
import { AccountId, NEAR_RATE, NEAR_YOCTO, User } from "./model";

export let users = new PersistentUnorderedMap<String, User>("um");
// let userId = new PersistentSet<String>("us");

export function createUser(alias: string, bio: string, avatar: string): User {
    if (users.contains(Context.sender)) {
        //Todo
        /**
         * Nếu attachedDeposit lớn hơn 0 thì topup vào tài khoản user
         */
        return users.getSome(Context.sender);
    }

    const user = new User(alias, bio, avatar);
    users.set(Context.sender, user);
    return user;
}

export function getUser(): User[] {
    return users.values();
}

export function deleteUser(id: AccountId): boolean {
    if (users.contains(id)) {
        users.delete(id);
        return true;
    }
    return false;
}

export function topUp(): User {
    let user: User;
    const attachedDeposite: u128 = Context.attachedDeposit;
    const floatDeposit: u128 = u128.div(attachedDeposite, u128.from(NEAR_YOCTO));
    if (users.contains(Context.sender)) {
        user = users.getSome(Context.sender);
        const newToken = u128.add(user.token, u128.mul(floatDeposit, u128.from(NEAR_RATE)));
        user.token = newToken;
        users.set(Context.sender, user);
    } else {
        user = new User(Context.sender, "", "");
        const newToken = u128.mul(floatDeposit, u128.from(NEAR_RATE));
        user.token = newToken;
        users.set(Context.sender, user);
    }
    return user;
}
