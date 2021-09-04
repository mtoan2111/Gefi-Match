import { Context, u128 } from "near-sdk-as";
import { AccountId, User } from "../model/user.model";
import { UserStorage } from "../storage/user.storage";
import { GeFiTransformer } from "../helper/transform.helper";
import { ErrorResponse } from "../helper/response.helper";
// let userId = new PersistentSet<String>("us");

export function createUser(alias: string, bio: string, avatar: string): User {
    const user = new User(alias, bio, avatar);
    const deposit = Context.attachedDeposit;

    if (u128.gt(deposit, u128.from(0))) {
        const earnerToken = GeFiTransformer(deposit);
        user.addBalance(earnerToken);
    }

    return user.save();
}

export function updateUser(alias: string, bio: string, avatar: string): String {
    if (UserStorage.contains(Context.sender)) {
    let user = UserStorage.get(Context.sender);
    user.alias = alias;
    user.bio = bio;
    user.avatar = avatar;
    UserStorage.set(Context.sender, user);
    return user.id.toString();
    } else {
        return ErrorResponse("0x0200"); // USER_NOT_FOUND
    }
}

export function getUser(id: AccountId): User | null {
    return UserStorage.get(id);
}

export function getUsers(): User[] {
    return UserStorage.gets();
}

export function deleteUser(id: AccountId): String {
    if (UserStorage.contains(id) && UserStorage.delete(id)) {
        return `User ${id.toString()} has been deleted!`;
    } else {
        return ErrorResponse("0x0200"); // USER_NOT_FOUND
    }
}
