import { PersistentUnorderedMap } from "near-sdk-as";
import { User } from "../model/user.model";
import { AccountId } from "../model/user.model";

const users = new PersistentUnorderedMap<AccountId, User>("um");

export class UserStorage {
    static get(id: AccountId): User {
        return users.getSome(id);
    }

    static set(id: AccountId, value: User): void {
        users.set(id, value);
    }

    static gets(): User[] {
        return users.values();
    }

    static delete(id: AccountId): void {
        users.delete(id);
    }

    static contains(id: AccountId): bool {
        return users.contains(id);
    }
}


// interface Storage<T> {
//     get(id: AccountId): T;
//     gets(): T[];
//     set(id: AccountId, value: T): void;
//     delete(id: AccountId): void;
// }

// export const UserStorage: Storage<User> = class UserStorage {
//     static get(id: AccountId): User {
//         return users.getSome(id);
//     }

//     static set(id: AccountId, value: User): void {
//         return users.set(id, value);
//     }

//     static gets(): User[] {
//         return users.values();
//     }

//     static delete(id: AccountId): void {
//         return users.delete(id);
//     }
// };