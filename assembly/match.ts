import { Context, PersistentMap, PersistentVector, math, PersistentSet, logging, util, base58, u128, PersistentUnorderedMap } from "near-sdk-as";
import { Match, MatchMode, MatchState, User } from "./model";
import { createUser, users } from "./user";

let waitingMatch = new PersistentUnorderedMap<String, Match>("w");
let runningMatch = new PersistentUnorderedMap<String, Match>("r");
let finishedMatch = new PersistentUnorderedMap<String, Match>("f");
// let idGenerated = new PersistentSet<String>("i")

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
export function createMatch(mode: MatchMode, bet: u128): String {
    let matchId: String = "";
    assert(users.contains(Context.sender), "User not found. Could not create the match");
    const user: User = users.getSome(Context.sender);
    logging.log("token: " + user.token.toString());
    logging.log("bet: " + bet.toString());
    assert(u128.ge(user.token, bet), "Your balance is not enough!");

    while (matchId == "") {
        const idTmp = Context.sender + Context.blockTimestamp.toString();
        const idHash = base58.encode(util.stringToBytes(idTmp));
        if (!waitingMatch.contains(idHash)) {
            matchId = idHash;
        }
    }

    logging.log("createMatch from: " + Context.sender + " bet: " + Context.attachedDeposit.toString());

    waitingMatch.set(matchId, new Match(matchId, Context.attachedDeposit, mode));
    return matchId;
}

/**
 * View function
 */

export function getMatch(): Match[] {
    return waitingMatch.values();
}

/**
 * Private function
 */
function _makeid(length: i32): String {
  var result: String = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(
      <i32>Math.floor(<i32>Math.random() * charactersLength)
    );
  }
  return result;
}

export function updateMatch(id: string, state: MatchState): bool {
  logging.log("Updating match: " + id + "State: " + state.toString());
  const finishedMatchLength = finishedMatch.length;
  const runningMatchLength = runningMatch.length;
  let match: Match | null;
  let result: bool = true;
  switch (state) {
    case MatchState.RUNNING:
        match = waitingMatch.getSome(id);
        if (match) {
            match.state = MatchState.RUNNING;
            runningMatch.set(id, match);
            waitingMatch.delete(id);
        }
        break;
    case MatchState.FINISHED:
        match = runningMatch.getSome(id);
        if (match) {
            match.state = MatchState.FINISHED;
            finishedMatch.set(id, match);
            runningMatch.delete(id);
        }
        break;
    default: 
        assert(!state, "Invalid State!");
        result = false;
        break;
  }
  return result;
}
