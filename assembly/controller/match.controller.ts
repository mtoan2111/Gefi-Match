import { Context, logging, util, base58, u128, PersistentUnorderedMap, PersistentSet } from "near-sdk-as";
import { Match, MatchMode, MatchState } from "../model/match.model";
import { AccountId, User } from "../model/user.model";
import { MatchResult, MatchHistory } from "../model/history.model";
import { FEE_PERCENT } from "../model/fee.model";
import { UserStorage } from "../storage/user.storage";
import { FinishedMatchStorage, RunningMatchStorage, WaitingMatchStorage } from "../storage/match.storage";
import { UserHistoryStorage } from "../storage/history.storage";

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
    const user: User = UserStorage.get(Context.sender);
    logging.log("token: " + user.token.toString());
    logging.log("bet: " + bet.toString());
    assert(u128.ge(user.token, bet), "Your balance is not enough!");
    // Sub user token
    user.token = u128.sub(user.token, bet);
    user.subToken(bet);
    while (matchId == "") {
        const idTmp = Context.sender + Context.blockTimestamp.toString();
        const idHash = base58.encode(util.stringToBytes(idTmp));
        if (!WaitingMatchStorage.contains(idHash)) {
            matchId = idHash;
        }
    }

    logging.log("createMatch from: " + Context.sender + " bet: " + Context.attachedDeposit.toString());

    WaitingMatchStorage.set(matchId, new Match(matchId, bet, mode));
    return matchId;
}

export function cancelMatch(id: string): bool {
    if (!WaitingMatchStorage.contains(id)) {
        return false; // Match not found
    }
    let cMatch: Match = WaitingMatchStorage.get(id);
    if (cMatch.state !== MatchState.WAITING) {
        return false; // Can not cancel due to this match is not in Waiting state
    }
    // Return token for Owner
    let owner: User = UserStorage.get(cMatch.owner);
    owner.cashBackToken(cMatch.bet);
    // Remove Canceled Match
    WaitingMatchStorage.delete(id);
    return true;
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

export function finishMatch(id: string, result: MatchResult, winner: AccountId): bool {
    let match: Match | null;
    let ret: bool = true;
    let fMatch = RunningMatchStorage.get(id);
    // Widraw token for players
    let owner: User = UserStorage.get(fMatch.owner);
    let competitor: User = UserStorage.get(fMatch.competitor);

    // Finish Match
    fMatch.finish();

    switch (state) {
        case MatchState.FINISHED:
            match = RunningMatchStorage.get(id);
            if (match) {
                logging.log("Match Finished!");
                match.state = MatchState.FINISHED;
                FinishedMatchStorage.set(id, match);
                RunningMatchStorage.delete(id);
                // Perform Finish process
                // The result is Win or Lose
                let fMatch: Match = FinishedMatchStorage.get(id);
                if (result === MatchResult.TIE) {
                    // Return token for all competitor
                    // Return token for Owner
                    logging.log("MatchResult: TIE");
                    let owner: User = UserStorage.get(fMatch.owner);
                    owner.token = withDrawToken(owner.token, fMatch.bet);
                    logging.log("New Owner Token: " + owner.token.toString());
                    UserStorage.set(owner.id, owner);
                    // Return token for Competitor
                    let competitor: User = UserStorage.get(fMatch.competitor);
                    competitor.token = withDrawToken(competitor.token, fMatch.bet);
                    logging.log("New Competitor Token: " + competitor.token.toString());
                    UserStorage.set(competitor.id, competitor);
                    // historyUpdateUser(fMatch.owner, new History(fMatch.competitor, fMatch.mode, u128.from(fMatch.bet), MatchResult.TIE));
                    // historyUpdateUser(fMatch.competitor, new History(fMatch.owner, fMatch.mode, u128.from(fMatch.bet), MatchResult.TIE));
                } else {
                    // assert(users.contains(winner), "User not found. Could not update the match");
                    logging.log("MatchResult: " + result.toString());
                    let bet: u128 = FinishedMatchStorage.get(id).bet;
                    // Add token for winner
                    let user: User = UserStorage.get(winner);
                    // user.token = user.token + bet*2*(1-FEE_PERCENT)
                    user.token = withDrawToken(user.token, u128.mul(bet, u128.from(2)));
                    logging.log("New Winner Token: " + user.token.toString());
                    UserStorage.set(winner, user);
                    // let ownerHis: History = new History(fMatch.competitor, fMatch.mode, bet, MatchResult.WIN);
                    // let competitorHis: History = new History(fMatch.owner, fMatch.mode, bet, MatchResult.LOSE);

                    _historyUpdateUser(fMatch.competitor, fMatch.owner, fMatch.mode, u128.from(fMatch.bet), MatchResult.LOSE);
                    _historyUpdateUser(fMatch.competitor, fMatch.owner, fMatch.mode, u128.from(fMatch.bet), MatchResult.LOSE);

                    // historyUpdateUser(fMatch.owner, fMatch.competitor, fMatch.mode, u128.from(fMatch.bet), MatchResult.WIN);
                    // if (winner === fMatch.owner) {
                    //   historyUpdateUser(fMatch.owner, new History(fMatch.competitor, fMatch.mode, u128.from(fMatch.bet), MatchResult.WIN));
                    //   historyUpdateUser(fMatch.competitor, new History(fMatch.owner, fMatch.mode, u128.from(fMatch.bet), MatchResult.LOSE));
                    // } else {
                    //   historyUpdateUser(fMatch.owner, new History(fMatch.competitor, fMatch.mode, u128.from(fMatch.bet), MatchResult.LOSE));
                    //   historyUpdateUser(fMatch.competitor, new History(fMatch.owner, fMatch.mode, u128.from(fMatch.bet), MatchResult.WIN));
                    // }
                }
            }
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
export function joinMatch(id: string): bool {
    // Check if user available
    let accountId: AccountId = Context.sender;
    if (!UserStorage.contains(accountId)) {
        return false; // User not found. Could not create the match
    }
    let user: User = UserStorage.get(accountId);
    // Check if match available
    if (!WaitingMatchStorage.contains(id)) {
        return false; //Current Match is not available
    }
    let jMatch: Match = WaitingMatchStorage.get(id);
    // Check if user's balance is enough
    logging.log("token: " + user.token.toString());
    logging.log("bet: " + jMatch.bet.toString());
    if (!u128.ge(user.token, jMatch.bet)) {
        return false; // Your balance is not enough!
    }
    jMatch.join(accountId);
    // Tru tien
    user.subToken(jMatch.bet);
    return true;
}

export function startMatch(id: string): bool {
    if (!WaitingMatchStorage.contains(id)) {
        return false; // Match not found in Waiting Hall
    }
    let sMatch: Match = WaitingMatchStorage.get(id);
    if (!sMatch.competitor) {
        return false; // No competitor found
    }
    // Change Match State
    sMatch.start();
    return true;
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

function _historyUpdateUser(id: AccountId, competitor: AccountId, mode: MatchMode, bet: u128, result: MatchResult): void {
    let usrHistory: MatchHistory = new MatchHistory(competitor, mode, result);
    let userHis = new PersistentSet<MatchHistory>(id.toString());
    UserHistoryStorage.set(id, userHis);
}
