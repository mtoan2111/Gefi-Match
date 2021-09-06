import { Context, ContractPromiseBatch, u128 } from "near-sdk-as";
import { GeFiInversion, GeFiTransformer } from "../helper/transform.helper";
import { SwapHistory, SwapMode } from "../model/history.model";
import { User } from "../model/user.model";
import { UserStorage } from "../storage/user.storage";

export function deposit(): User {
    const deposit = Context.attachedDeposit;
    const earnerToken = GeFiTransformer(deposit);
    let user = UserStorage.get(Context.sender);

    user.addBalance(earnerToken);
    user.save();

    const swpHistory = new SwapHistory(SwapMode.DEPOSIT, earnerToken);
    swpHistory.save();

    return user;
}

export function withDraw(value: u128): u128 | null {
    let user = UserStorage.get(Context.sender);
    const curBalance = user.getBalance();
    if (u128.lt(curBalance, value)) {
        return null;
    }

    const yoctoNearWithDraw = GeFiInversion(value);
    ContractPromiseBatch.create(Context.sender).transfer(yoctoNearWithDraw);
    user.subBalance(value);
    const swpHistory = new SwapHistory(SwapMode.WITHDRAW, value);
    swpHistory.save();

    return yoctoNearWithDraw;
}
