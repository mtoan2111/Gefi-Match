import { Context, PersistentMap, PersistentSet, PersistentVector } from "near-sdk-as";
import { AccountId, User } from "./model";

export let userIdsPersistentMap = new PersistentMap<String, User>("um");
export let usersPersistentVector = new PersistentVector<User>("uv");
// let userId = new PersistentSet<String>("us");

export function createUser(alias: string, bio: string, avatar: string): User {
    if (userIdsPersistentMap.contains(Context.sender)) {
        //Todo
        /**
         * Nếu attachedDeposit lớn hơn 0 thì topup vào tài khoản user
         */
        return userIdsPersistentMap.getSome(Context.sender);
    }

    const user = new User(alias, bio, avatar);
    userIdsPersistentMap.set(Context.sender, user);
    usersPersistentVector.push(user);
    return user;
}

export function getUser(): User[] {
    const usersPersistentVectorLength = usersPersistentVector.length;
    let results = new Array<User>(usersPersistentVectorLength);
    for (let i = 0; i < usersPersistentVectorLength; i++) {
        results[i] = usersPersistentVector[i];
    }
    return results;
}

export function deleteUser(id: AccountId): boolean {
    if (userIdsPersistentMap.contains(id)) {
        userIdsPersistentMap.delete(id);
    }
    const usersPersistentVectorLength = usersPersistentVector.length;
    for (let i = 0; i < usersPersistentVectorLength; i++) {
        if (usersPersistentVector[i].id == id) {
            usersPersistentVector.swap_remove(i);
        }
    }
    return true
}
