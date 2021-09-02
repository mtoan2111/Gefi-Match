import { Context, logging, util, base58, u128, PersistentUnorderedMap, PersistentSet } from "near-sdk-as";
import { Match, MatchMode, MatchState, WaitingMatch } from "../model/match.model";
import { AccountId, User } from "../model/user.model";
import { MatchResult, MatchHistory } from "../model/history.model";
import { UserStorage } from "../storage/user.storage";
import { RunningMatchStorage, WaitingMatchStorage } from "../storage/match.storage";
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

export function cancelMatch(id: string): String {
    if (!WaitingMatchStorage.contains(id)) {
        return ErrorResponse("Match not found");
    }
    let cMatch: Match = WaitingMatchStorage.get(id);
    if (cMatch.state !== MatchState.WAITING) {
        return ErrorResponse("Can not cancel due to this match is not in Waiting state");
    }
    // Return token for Owner
    let owner: User = UserStorage.get(cMatch.owner);
    owner.cashBack(cMatch.bet);
    // Remove Canceled Match
    WaitingMatchStorage.delete(id);
    return cMatch.id;
}

export function finishMatch(id: string, result: MatchResult, winner: AccountId = ""): String {
    let fMatch = RunningMatchStorage.get(id);

    if (fMatch == null) {
        return ErrorResponse("0004");
    }

    let owner: User = UserStorage.get(fMatch.owner);
    let competitor: User = UserStorage.get(fMatch.competitor);

    switch (result) {
        case MatchResult.TIE:
            competitor.endGame(MatchResult.TIE, fMatch.bet, fMatch);
            owner.endGame(MatchResult.TIE, fMatch.bet, fMatch);
            break;
        case MatchResult.LOSE:
        case MatchResult.WIN:
            if (UserStorage.contains(winner)) {
                switch (winner) {
                    case owner.id:
                        owner.endGame(MatchResult.WIN, fMatch.bet, fMatch);
                        competitor.endGame(MatchResult.LOSE, fMatch.bet, fMatch);
                        break;
                    case competitor.id:
                        competitor.endGame(MatchResult.WIN, fMatch.bet, fMatch);
                        owner.endGame(MatchResult.LOSE, fMatch.bet, fMatch);
                        break;
                    default:
                        return ErrorResponse("Wrong Match Result ");
                }
            }
            break;
        default:
            return ErrorResponse("Wrong Match Result ");
    }

    fMatch.finish();
    return fMatch.id;
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
export function joinMatch(id: string): String {
    // Check if user available
    let accountId: AccountId = Context.sender;
    if (!UserStorage.contains(accountId)) {
        return ErrorResponse("User not found. Could not create the match");
    }
    let user: User = UserStorage.get(accountId);
    // Check if match available
    if (!WaitingMatchStorage.contains(id)) {
        return ErrorResponse("Current Match is not available");
    }
    let jMatch: Match = WaitingMatchStorage.get(id);
    // Check if user's balance is enough
    logging.log("token: " + user.getBalance().toString());
    logging.log("bet: " + jMatch.bet.toString());
    if (!u128.ge(user.getBalance(), jMatch.bet)) {
        return ErrorResponse("Your balance is not enough! ");
    }
    jMatch.join(accountId);
    // Tru tien
    user.subBalance(jMatch.bet);
    return jMatch.id;
}

export function startMatch(id: string): String {
    if (!WaitingMatchStorage.contains(id)) {
        return ErrorResponse("Match not found in Waiting Hall");
    }
    let sMatch: Match = WaitingMatchStorage.get(id);
    if (!sMatch.competitor) {
        return ErrorResponse("No competitor found");
    }
    // Change Match State
    sMatch.start();
    return sMatch.id;
}

/**
 * View function
 */

export function getMatch(): Match[] {
    return WaitingMatchStorage.gets();
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

// function _historyUpdateUser(id: AccountId, competitor: AccountId, mode: MatchMode, bet: u128, result: MatchResult): void {
//     let usrHistory: MatchHistory = new MatchHistory(competitor, mode, result);
//     let userHis = new PersistentSet<MatchHistory>(id.toString());
//     UserHistoryStorage.set(id, userHis);
// }
