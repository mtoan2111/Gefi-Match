import { Context, logging } from "near-sdk-core";

export function topUp() {
    const attachedDeposite = Context.attachedDeposit;
    logging.log("attachedDeposite: " + attachedDeposite.toString())
}
