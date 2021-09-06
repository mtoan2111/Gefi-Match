export function ErrorResponse(code: string): String {
    return `{"code": ${code}}`;
}
