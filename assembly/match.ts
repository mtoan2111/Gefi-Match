import { Context, PersistentMap, PersistentVector, math, PersistentSet, logging } from "near-sdk-as";
import { Match, MatchMode, MatchState } from "./model";

let waitingMatch = new PersistentVector<Match>("w");
let runningMatch = new PersistentVector<Match>("r");
let finishedMatch = new PersistentVector<Match>("f");
let idGenerated = new PersistentSet<String>("i");

/**
 * Change Function
 */

/**
 *
 * @param state
 * State of match. See MatchState enum
 * @param mode
 * Mode of match. See MatchMode enum
 * @returns
 * id of match
 */
export function createMatch(mode: MatchMode): String {
    logging.log("creating match");
    let matchId: String = "2";
    // while (matchId == "") {
    //     let idTmp: String = _makeid(32);
    //     if (!idGenerated.has(idTmp)) {
    //         matchId = idTmp;
    //         idGenerated.add(idTmp);
    //     }
    // }

    logging.log("createMatch from: " + Context.sender + " bet: " + Context.attachedDeposit.toString());

    waitingMatch.push(new Match(matchId, Context.attachedDeposit, mode));
    return matchId;
}

/**
 * View function
 */

export function getMatch(): Match[] {
    const waitingMatchLength = waitingMatch.length;
    let results = new Array<Match>(waitingMatchLength);
    for (let i = 0; i < waitingMatchLength; i++) {
        results[i] = waitingMatch[i];
    }
    return results;
}

/**
 * Private function
 */
function _makeid(length: i32): String {
    var result: String = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(<i32>Math.floor(<i32>Math.random() * charactersLength));
    }
    return result;
}
