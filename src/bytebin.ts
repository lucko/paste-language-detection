interface BytebinResponseSuccess {
  ok: true;
  data: string;
  errorMsg?: never;
}
interface BytebinResponseFailure {
  ok: false;
  data?: never;
  errorMsg: string;
}
export type BytebinResponse = BytebinResponseSuccess | BytebinResponseFailure;

export async function readFromBytebin(
  code: string,
  extraHeaders: Record<string, string>,
): Promise<BytebinResponse> {
  const baseUrl = process.env.BYTEBIN_URL || "https://bytebin.lucko.me/";
  const req = await fetch(baseUrl + code, {
    headers: {
      "User-Agent": "paste-language-detect",
      ...extraHeaders,
    },
  });
  return req.ok
    ? { ok: true, data: await req.text() }
    : { ok: false, errorMsg: `err: ${req.status} - ${req.statusText}` };
}
