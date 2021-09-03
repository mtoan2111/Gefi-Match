import { Context, logging, u128 } from "near-sdk-as";
import { Match, MatchMode, MatchState } from "../model/match.model";
import { AccountId, User } from "../model/user.model";
import { MatchResult } from "../model/history.model";
import { UserStorage } from "../storage/user.storage";
import { RunningMatchStorage, WaitingMatchStorage } from "../storage/match.storage";
import { ErrorResponse } from "../helper/response.helper";

/**
 * Change Function
 */

export function createMatch(mode: MatchMode, bet: u128): String {
    const user: User = UserStorage.get(Context.sender);
    user.subBalance(bet);
    user.save();

    let match = Match.create(bet, mode);
    match.save();
    logging.log("createMatch from: " + Context.sender + " bet: " + match.toString());
    return match.id;
}

export function cancelMatch(id: string): String {
    let cMatch: Match | null = WaitingMatchStorage.get(id);
    if (cMatch == null) {
        return ErrorResponse("Match not found");
    }

    if (cMatch.state !== MatchState.WAITING) {
        return ErrorResponse("Can not cancel due to this match is not in Waiting state");
    }

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
            if (owner.id == winner) {
                owner.endGame(MatchResult.WIN, fMatch.bet, fMatch);
                competitor.endGame(MatchResult.LOSE, fMatch.bet, fMatch);
                break;
            }
            if (competitor.id == winner) {
                competitor.endGame(MatchResult.WIN, fMatch.bet, fMatch);
                owner.endGame(MatchResult.LOSE, fMatch.bet, fMatch);
                break;
            }
            return ErrorResponse("Wrong Match Result ");
        default:
            return ErrorResponse("Wrong Match Result ");
    }

    fMatch.finish();
    return fMatch.id;
}

export function joinMatch(id: string): String {
    let accountId: AccountId = Context.sender;

    let user: User = UserStorage.get(accountId);

    let wMatch: Match | null = WaitingMatchStorage.get(id);
    if (wMatch == null) {
        return ErrorResponse("Current Match is not available");
    }

    let subBalanceResult = user.subBalance(wMatch.bet);
    if (u128.eq == null) {
        return ErrorResponse("Your balance is not enough! ");
    }

    wMatch.join(accountId);
    return wMatch.id;
}

export function startMatch(id: string): String {
    let sMatch: Match | null = WaitingMatchStorage.get(id);

    if (sMatch == null) {
        return ErrorResponse("Match not found in Waiting Hall");
    }

    if (sMatch.competitor == null || sMatch.competitor == "") {
        return ErrorResponse("No competitor found");
    }

    sMatch.start();
    return sMatch.id;
}

/**
 * View function
 */

export function getMatch(): Match[] {
    return WaitingMatchStorage.gets();
}
