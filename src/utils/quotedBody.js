/*
 * Split a message into what was newly written and the history quoted
 * beneath it.
 *
 * A reply carries the whole conversation under it — correct for the mail
 * that goes out, since the recipient may not have our thread view, but in
 * that thread view it is repetition: the quoted text is already on screen
 * as its own message directly above. So the new part is shown and the
 * quote goes behind a "..." the way every mail client does it.
 *
 * Returns { main, quoted }. `quoted` is "" when there is nothing to hide,
 * and the caller then renders no toggle at all.
 *
 * Nothing here can lose content: if no boundary is recognised the whole
 * body is `main`, and the two pieces always concatenate back to the
 * original.
 */
const QUOTE_MARKERS_HTML = [
  /<div[^>]*class="[^"]*gmail_quote[^"]*"/i,
  /<blockquote/i,
  /<div[^>]*class="[^"]*moz-cite-prefix/i,
  /<hr[^>]*id="?stopSpelling/i,
  /<div[^>]*id="?(?:divRplyFwdMsg|appendonsend)/i,
];

/*
 * "On <date> <someone> wrote:" — the line a client writes above a quote.
 * Matched at the start of a line so a mention inside a sentence does not
 * truncate the message.
 */
const QUOTE_MARKERS_TEXT = [
  /^[ \t]*On .{0,120}?wrote:[ \t]*$/im,
  /^[ \t]*-{2,}\s*Original Message\s*-{2,}/im,
  /^[ \t]*_{5,}[ \t]*$/m,
  /^[ \t]*From:.*$/im,
  /^[ \t]*>/m,
];

const firstMatchIndex = (value, patterns) => {
  let found = -1;

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match && match.index !== undefined) {
      if (found === -1 || match.index < found) found = match.index;
    }
  }

  return found;
};

export const splitQuotedBody = (body = "", isHtml = false) => {
  const source = String(body || "");
  if (!source.trim()) return { main: source, quoted: "" };

  const at = firstMatchIndex(
    source,
    isHtml ? QUOTE_MARKERS_HTML : QUOTE_MARKERS_TEXT,
  );

  if (at <= 0) return { main: source, quoted: "" };

  const main = source.slice(0, at);
  const quoted = source.slice(at);

  /*
   * A boundary at the very top means the whole message IS a quote — the
   * first message of a thread that arrived with history attached. Hiding
   * all of it would leave an empty bubble, so nothing is split.
   */
  const mainHasWords = main.replace(/<[^>]+>/g, "").trim();
  if (!mainHasWords) return { main: source, quoted: "" };

  return { main, quoted };
};

export default splitQuotedBody;
