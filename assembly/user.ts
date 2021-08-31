import { Context, PersistentMap, PersistentSet } from "near-sdk-as";
import { User } from "./model";

let users = new PersistentMap<String, User>("u");
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
