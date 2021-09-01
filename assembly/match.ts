import {
  Context,
  PersistentMap,
  PersistentVector,
  math,
  PersistentSet,
  logging,
  util,
  base58,
  u128,
  PersistentUnorderedMap,
} from "near-sdk-as";
import {
  AccountId,
  Match,
  MatchMode,
  MatchResult,
  MatchState,
  User,
  FEE_PERCENT,
  History,
} from "./model";
import { createUser, users, withDraw, userHistories } from "./user";

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
  assert(
    users.contains(Context.sender),
    "User not found. Could not create the match"
  );
  const user: User = users.getSome(Context.sender);
  logging.log("token: " + user.token.toString());
  logging.log("bet: " + bet.toString());
  assert(u128.ge(user.token, bet), "Your balance is not enough!");
  // Sub user token
  user.token = u128.sub(user.token, bet);
  while (matchId == "") {
    const idTmp = Context.sender + Context.blockTimestamp.toString();
    const idHash = base58.encode(util.stringToBytes(idTmp));
    if (!waitingMatch.contains(idHash)) {
      matchId = idHash;
    }
  }

  logging.log(
    "createMatch from: " +
      Context.sender +
      " bet: " +
      Context.attachedDeposit.toString()
  );

  waitingMatch.set(matchId, new Match(matchId, Context.attachedDeposit, mode));
  return matchId;
}

/**
 * Update Match state and information.
 * @param id
 * Match id
 * @param state
 * Match state, 0: Waiting, 1: Running, 2: Finished, 3: Canceled
 * @param result
 * Optional, default = 0 if Match state = 0 (Waiting) or 1 (Running)
 * This match result, 0: Win, 1: Lose, 2: Tie
 * @param winner
 * Optional, default = '' if Match Result = 2 (Tie)
 * AccountId of winner in this match.
 */

export function updateMatch(
  id: string,
  state: MatchState,
  result: MatchResult = 0,
  winner: AccountId = ""
): bool {
  logging.log("Updating match: " + id + "State: " + state.toString());
  let match: Match | null;
  let ret: bool = true;
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
        // Perform Finish process
        // The result is Win or Lose
        let fMatch: Match = finishedMatch.getSome(id);
        if (result === MatchResult.TIE) {
          // Return token for all competitor
          // Return token for Owner
          let owner: User = users.getSome(fMatch.owner);
          owner.token = withDrawToken(owner.token, fMatch.bet);
          // Return token for Competitor
          let competitor: User = users.getSome(fMatch.competitor);
          competitor.token = withDrawToken(competitor.token, fMatch.bet);
        } else {
          assert(
            users.contains(winner),
            "User not found. Could not update the match"
          );
          let bet: u128 = finishedMatch.getSome(id).bet;
          // Add token for winner
          const user: User = users.getSome(winner);
          // user.token = user.token + bet*2*(1-FEE_PERCENT)
          user.token = withDrawToken(user.token, u128.mul(bet, u128.from(2)));
        }
        // Save History
        if (!userHistories.contains(id)) {
          let userHis = new PersistentSet<History>(id);
          userHistories.set(id, userHis);
        }
        userHistories
          .getSome(id)
          .add(new History(fMatch.competitor, fMatch.mode, fMatch.bet, result));
      }
      break;
    case MatchState.CANCELED:
      let cMatch: Match = finishedMatch.getSome(id);
      // Return token for Owner
      let owner: User = users.getSome(cMatch.owner);
      owner.token = withDrawToken(owner.token, cMatch.bet, false);
      break;
    default:
      assert(!state, "Invalid State!");
      ret = false;
      break;
  }
  return ret;
}

/**
 *
 * Lấy trận đấu từ list waiting ra bằng Id => Throw exception nếu không tìm thấy
 * Lấy thông tin người chơi từ users ra => Throw exception nếu không tìm thấy
 * Kiểm tra số token của người chơi có lớn hơn hoặc bằng bet của trận không => Throw exception
 * Nếu kiểm tra điều kiện thành công =>
 * Chuyển trận sang trạng thái running
 * Trừ tiền ngay của người tham gia
 *
 */
export function joinMatch(id: string, accountId: AccountId): bool {
  let ret = true;
  // Check if user available
  assert(
    users.contains(accountId),
    "User not found. Could not create the match"
  );
  const user: User = users.getSome(accountId);
  // Check if match available
  let match: Match = waitingMatch.getSome(id);
  assert(
    match && match.state === MatchState.WAITING,
    "Current Match is available"
  );
  // Check if user's balance is enough
  let bet: u128 = match.bet;
  logging.log("token: " + user.token.toString());
  logging.log("bet: " + bet.toString());
  assert(u128.ge(user.token, bet), "Your balance is not enough!");
  // Change Match State => running
  updateMatch(id, MatchState.RUNNING);
  // Reduce user.token
  user.token = u128.sub(user.token, bet);
  return ret;
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

function withDrawToken(userToken: u128, token: u128, avFee: bool = true): u128 {
  // Add Fee for transaction
  let receivedToken: u128;
  if (avFee) {
    receivedToken = u128.mul(
      token,
      u128.sub(u128.from(1), u128.from(FEE_PERCENT))
    );
  } else {
    receivedToken = token;
  }
  userToken = u128.add(userToken, receivedToken);
  return userToken;
}
