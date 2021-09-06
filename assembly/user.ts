// import { Context, logging, PersistentMap, PersistentSet, PersistentUnorderedMap, PersistentVector, u128 } from "near-sdk-as";
// import { AccountId, History, NEAR_RATE, NEAR_YOCTO, User } from "./model";

// export let users = new PersistentUnorderedMap<String, User>("um");
// export let userHistories = new PersistentMap<String, PersistentSet<History>>("uh");
// // let userId = new PersistentSet<String>("us");

// export function createUser(alias: string, bio: string, avatar: string): User {
//     if (users.contains(Context.sender)) {
//         //Todo
//         /**
//          * Nếu attachedDeposit lớn hơn 0 thì topup vào tài khoản user
//          */
//         if (u128.gt(Context.attachedDeposit, u128.from("0"))) {
//             topUp();
//         }
//         return users.getSome(Context.sender);
//     }

//     const user = new User(alias, bio, avatar);
//     users.set(Context.sender, user);
//     return user;
// }

// export function updateUser(alias: string, bio: string, avatar: string): boolean {
//     if (users.contains(Context.sender)) {
//         let user = users.getSome(Context.sender);
//         user.alias = alias;
//         user.bio = bio;
//         user.avatar = avatar;
//         users.set(Context.sender, user);
//         return true;
//     }
//     return false;
// }

// export function getUser(id: AccountId): User | null {
//     if (users.contains(id)) {
//         return users.getSome(id);
//     }
//     return null;
// }

// export function getUsers(): User[] {
//     return users.values();
// }

// export function deleteUser(id: AccountId): boolean {
//     if (users.contains(id)) {
//         users.delete(id);
//         return true;
//     }
//     return false;
// }

// export function getHistory(id: AccountId): History[] {
//     if (userHistories.contains(id)) {
//         return userHistories.getSome(id).values();
//     }
//     return new Array<History>(0);
// }

// export function topUp(): User {
//     let user: User;
//     const attachedDeposite: u128 = Context.attachedDeposit;
//     const floatDeposit: u128 = u128.div(attachedDeposite, u128.from(NEAR_YOCTO));
//     if (users.contains(Context.sender)) {
//         user = users.getSome(Context.sender);
//         const newToken = u128.add(user.token, u128.mul(floatDeposit, u128.from(NEAR_RATE)));
//         user.token = newToken;
//         users.set(Context.sender, user);
//     } else {
//         user = new User(Context.sender, "", "");
//         const newToken = u128.mul(floatDeposit, u128.from(NEAR_RATE));
//         user.token = newToken;
//         users.set(Context.sender, user);
//     }
//     return user;
// }

// export function withDraw(): void{
// }