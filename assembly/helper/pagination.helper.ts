import { math } from "near-sdk-core";

const PAGE_SIZE = 10;

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

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = min(args.length, startIndex + PAGE_SIZE);

    let resultDatas = new Array<T>(PAGE_SIZE);
    for (let i = startIndex; i < endIndex; i++) {
        resultDatas[i - startIndex] = args[startIndex];
    }
    return new PaginationResult(page, args.length, resultDatas);
}
