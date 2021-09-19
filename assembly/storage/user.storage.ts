import { PersistentUnorderedMap } from "near-sdk-as";
import { User } from "../model/user.model";
import { AccountId } from "../model/user.model";

const users = new PersistentUnorderedMap<AccountId, User>("um");

export class UserStorage {
    static get(id: AccountId): User {
        if (users.contains(id)) {
            return users.getSome(id);
        }

        const n_User = new User(id, "", "");
        users.set(id, n_User);
        return new User(id, "", "");
    }

    static set(id: AccountId, value: User): void {
        users.set(id, value);
    }

    static gets(): User[] {
        return users.values();
    }

    static delete(id: AccountId): bool {
        if (users.contains(id)) {
            users.delete(id);
            return true;
        }
        return false;
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
