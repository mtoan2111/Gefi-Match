import { logging, math } from "near-sdk-core";

const PAGE_SIZE = 3;

// export type PaginationResult<T> = {
//     page: i32;
//     total: i32;
//     data: T[]
// }

@nearBindgen
export class PaginationResult<T> {
    constructor(public page: i32, public total: i32, public data: T[]) {}
}

export function pagination<T>(args: T[], page: i32): PaginationResult<T> {
    if (page < 1) {
        page = 1;
    }

    const maxPage = floor(args.length / PAGE_SIZE) + 1;
    if (page > maxPage) {
        page = maxPage;
    }

    const startIndex = args.length - (page - 1) * PAGE_SIZE - 1;
    const endIndex = max(0, startIndex - PAGE_SIZE);

    let resultDatas = new Array<T>(PAGE_SIZE);
    for (let i = startIndex; i >= endIndex; i--) {
        resultDatas[startIndex - i] = args[i];
    }
    return new PaginationResult(page, args.length, resultDatas);
}
