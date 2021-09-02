import { u128 } from "near-sdk-as";
import { NEAR_RATE, NEAR_YOCTO } from "../model/fee.model";

export function GeFiTransformer(value: u128): u128 {
    const decimalDeposit: u128 = u128.div(value, u128.from(NEAR_YOCTO));
    const tokenEarner: u128 = u128.mul(decimalDeposit, u128.from(NEAR_RATE));
    return tokenEarner;
}

export function GeFiInversion(value: u128): u128 {
    const tokenInvert: u128 = u128.div(value, u128.from(NEAR_RATE));
    const yoctoWithDraw: u128 = u128.mul(tokenInvert, u128.from(NEAR_YOCTO));
    return yoctoWithDraw;
}
