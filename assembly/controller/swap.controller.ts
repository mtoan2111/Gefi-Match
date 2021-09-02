import { Context, ContractPromise, ContractPromiseBatch, u128 } from "near-sdk-as";
import { ErrorResponse } from "../helper/response.helper";
import { GeFiInversion, GeFiTransformer } from "../helper/transform.helper";
import { SwapHistory, SwapMode } from "../model/history.model";
import { UserStorage } from "../storage/user.storage";

export function deposit() {
    const deposit = Context.attachedDeposit;
    const earnerToken = GeFiTransformer(deposit);
    let user = UserStorage.get(Context.sender);

    user.addBalance(earnerToken);
    user.save();

    const swpHistory = new SwapHistory(SwapMode.DEPOSIT, earnerToken);
    swpHistory.save();
    
    return user;
}

export function withDraw(value: u128): u128 | String {
    let user = UserStorage.get(Context.sender);
    const curBalance = user.getBalance();
    if (u128.lt(curBalance, value)) {
        return ErrorResponse("0002");
    }

    const yoctoNearWithDraw = GeFiInversion(value);
    ContractPromiseBatch.create(Context.sender).transfer(yoctoNearWithDraw);
    user.subBalance(value);
    const swpHistory = new SwapHistory(SwapMode.WITHDRAW, value);
    swpHistory.save();

    return yoctoNearWithDraw;
}
