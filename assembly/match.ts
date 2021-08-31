import {
  Context,
  PersistentMap,
  PersistentVector,
  math,
  PersistentSet,
  logging,
} from "near-sdk-as";
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
  let matchId: String = "";
  while (matchId == "") {
      let idTmp: String = _makeid(32);
      if (!idGenerated.has(idTmp)) {
          matchId = idTmp;
          idGenerated.add(idTmp);
      }
  }

  logging.log(
    "createMatch from: " +
      Context.sender +
      " bet: " +
      Context.attachedDeposit.toString()
  );

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
  let matchIndex: i32;
  switch (state) {
    case MatchState.RUNNING:
        matchIndex = getMatchId(id, waitingMatch);
        if (matchIndex > -1) {
            runningMatch.push(waitingMatch[matchIndex]);
            logging.log("waitingMatch[matchIndex]" + waitingMatch[matchIndex].id);
            waitingMatch.swap_remove(matchIndex);
        }
        break;
    case MatchState.FINISHED:
        matchIndex = getMatchId(id, runningMatch);
        if (matchIndex > -1) {
            finishedMatch.push(runningMatch[matchIndex]);
            logging.log("runningMatch[matchIndex]" + runningMatch[matchIndex].id)
            runningMatch.swap_remove(matchIndex);
        }
        break;
    default: 
        break;
  }
  let result: bool = true;
  return result;
}

function getMatchId(id: string, matchVector: PersistentVector<Match>): i32 {
  for (let i: i32 = 0; i < matchVector.length; i++) {
    if (matchVector[i].id === id) {
      return i;
    }
  }
  return -1;
}
