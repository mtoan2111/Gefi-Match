import { Context, logging, util, base58, u128, PersistentUnorderedMap, PersistentSet } from "near-sdk-as";
import { Match, MatchMode, MatchState, WaitingMatch } from "../model/match.model";
import { AccountId, User } from "../model/user.model";
import { MatchResult, MatchHistory } from "../model/history.model";
import { FEE_PERCENT } from "../model/fee.model";
import { UserStorage } from "../storage/user.storage";
import { FinishedMatchStorage, RunningMatchStorage, WaitingMatchStorage } from "../storage/match.storage";
import { UserHistoryStorage } from "../storage/history.storage";
import { ErrorResponse } from "../helper/response.helper";

// let idGenerated = new PersistentSet<String>("i")

/**
 * Change Function
 */

export function createMatch(mode: MatchMode, bet: u128): String {
    const user: User = UserStorage.get(Context.sender);

    const userBalance = user.subBalance(bet);
    if (userBalance == null) {
        return ErrorResponse("0000");
    }

    user.save();

    let match = WaitingMatch.create(bet, mode);
    match.save();

    logging.log("createMatch from: " + Context.sender + " bet: " + Context.attachedDeposit.toString());

    return match.id;
}

// export function updateMatch(id: string, state: MatchState, result: MatchResult = 0, winner: AccountId = ""): bool {
//     logging.log("Updating match: " + id + " State: " + state.toString());
//     let match: Match | null;
//     let ret: bool = true;
//     switch (state) {
//         case MatchState.RUNNING:
//             match = WaitingMatchStorage.get(id);
//             match.state = MatchState.RUNNING;
//             RunningMatchStorage.set(id, match);
//             WaitingMatchStorage.delete(id);
//             break;
//         case MatchState.FINISHED:
//             match = RunningMatchStorage.get(id);
//             if (match) {
//                 logging.log("Match Finished!");
//                 match.state = MatchState.FINISHED;
//                 FinishedMatchStorage.set(id, match);
//                 RunningMatchStorage.delete(id);
//                 // Perform Finish process
//                 // The result is Win or Lose
//                 let fMatch: Match = FinishedMatchStorage.get(id);
//                 if (result === MatchResult.TIE) {
//                     // Return token for all competitor
//                     // Return token for Owner
//                     logging.log("MatchResult: TIE");
//                     let owner: User = UserStorage.get(fMatch.owner);
//                     owner.token = withDrawToken(owner.token, fMatch.bet);
//                     logging.log("New Owner Token: " + owner.token.toString());
//                     UserStorage.set(owner.id, owner);
//                     // Return token for Competitor
//                     let competitor: User = UserStorage.get(fMatch.competitor);
//                     competitor.token = withDrawToken(competitor.token, fMatch.bet);
//                     logging.log("New Competitor Token: " + competitor.token.toString());
//                     UserStorage.set(competitor.id, competitor);
//                     // historyUpdateUser(fMatch.owner, new History(fMatch.competitor, fMatch.mode, u128.from(fMatch.bet), MatchResult.TIE));
//                     // historyUpdateUser(fMatch.competitor, new History(fMatch.owner, fMatch.mode, u128.from(fMatch.bet), MatchResult.TIE));
//                 } else {
//                     // assert(users.contains(winner), "User not found. Could not update the match");
//                     logging.log("MatchResult: " + result.toString());
//                     let bet: u128 = FinishedMatchStorage.get(id).bet;
//                     // Add token for winner
//                     let user: User = UserStorage.get(winner);
//                     // user.token = user.token + bet*2*(1-FEE_PERCENT)
//                     user.token = withDrawToken(user.token, u128.mul(bet, u128.from(2)));
//                     logging.log("New Winner Token: " + user.token.toString());
//                     UserStorage.set(winner, user);
//                     // let ownerHis: History = new History(fMatch.competitor, fMatch.mode, bet, MatchResult.WIN);
//                     // let competitorHis: History = new History(fMatch.owner, fMatch.mode, bet, MatchResult.LOSE);

//                     _historyUpdateUser(fMatch.competitor, fMatch.owner, fMatch.mode, u128.from(fMatch.bet), MatchResult.LOSE);
//                     _historyUpdateUser(fMatch.competitor, fMatch.owner, fMatch.mode, u128.from(fMatch.bet), MatchResult.LOSE);

//                     // historyUpdateUser(fMatch.owner, fMatch.competitor, fMatch.mode, u128.from(fMatch.bet), MatchResult.WIN);
//                     // if (winner === fMatch.owner) {
//                     //   historyUpdateUser(fMatch.owner, new History(fMatch.competitor, fMatch.mode, u128.from(fMatch.bet), MatchResult.WIN));
//                     //   historyUpdateUser(fMatch.competitor, new History(fMatch.owner, fMatch.mode, u128.from(fMatch.bet), MatchResult.LOSE));
//                     // } else {
//                     //   historyUpdateUser(fMatch.owner, new History(fMatch.competitor, fMatch.mode, u128.from(fMatch.bet), MatchResult.LOSE));
//                     //   historyUpdateUser(fMatch.competitor, new History(fMatch.owner, fMatch.mode, u128.from(fMatch.bet), MatchResult.WIN));
//                     // }
//                 }
//             }
//             break;
//         case MatchState.CANCELED:
//             let cMatch: Match = FinishedMatchStorage.get(id);
//             // Return token for Owner
//             let owner: User = UserStorage.get(cMatch.owner);
//             owner.token = withDrawToken(owner.token, cMatch.bet, false);
//             UserStorage.set(owner.id, owner);
//             break;
//         default:
//             assert(!state, "Invalid State!");
//             ret = false;
//             break;
//     }
//     return ret;
// }

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
// export function joinMatch(id: string, accountId: AccountId): bool {
//     let ret = true;
//     // Check if user available
//     // assert(users.contains(accountId), "User not found. Could not create the match");
//     const user: User = UserStorage.get(accountId);
//     // Check if match available
//     let match: Match = WaitingMatchStorage.get(id);
//     assert(match && match.state === MatchState.WAITING, "Current Match is not available");
//     // Check if user's balance is enough
//     let bet: u128 = match.bet;
//     logging.log("token: " + user.token.toString());
//     logging.log("bet: " + bet.toString());
//     assert(u128.ge(user.token, bet), "Your balance is not enough!");
//     // Change Match State => running
//     user.token = u128.sub(user.token, match.bet);
//     UserStorage.set(user.id, user);
//     updateMatch(id, MatchState.RUNNING);
//     return ret;
// }

/**
 * View function
 */

export function getMatch(): Match[] {
    return WaitingMatchStorage.gets();
}

// function withDrawToken(userToken: u128, token: u128, avFee: bool = true): u128 {
//     // Add Fee for transaction
//     let receivedToken: u128;
//     if (avFee) {
//         receivedToken = u128.mul(token, u128.sub(u128.from(1), u128.from(FEE_PERCENT)));
//     } else {
//         receivedToken = token;
//     }
//     userToken = u128.add(userToken, receivedToken);
//     return userToken;
// }

// function _historyUpdateUser(id: AccountId, competitor: AccountId, mode: MatchMode, bet: u128, result: MatchResult): void {
//     let usrHistory: MatchHistory = new MatchHistory(competitor, mode, result);
//     let userHis = new PersistentSet<MatchHistory>(id.toString());
//     UserHistoryStorage.set(id, userHis);
// }
