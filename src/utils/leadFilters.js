/*
|--------------------------------------------------------------------------
| Which leads belong to a scenario or a connection
|--------------------------------------------------------------------------
|
| One definition, used by both the sidebar counts and the inbox list, so
| the number on a row and the rows you get when you click it cannot
| disagree. They were separate implementations and they had drifted:
|
|   - the sidebar's connection matcher ended in `return true`, so every
|     connection reported the same total and every one of them "matched"
|     every lead
|
|   - the inbox list had the same escape hatch, plus one for scenarios
|     ("if the email has no scenarioId, show it anyway") that fired on
|     every message, because Email documents have no scenarioId field at
|     all — the backend stamps matchedScenarioId
|
| Both filters therefore returned the full list. The counts looked
| plausible, which is what made it hard to see.
|
| THE RULE
|
| A lead that carries an explicit link belongs to whatever that link
| names, and to nothing else. A lead with no link falls back to
| heuristics, because mail that predates the stamping still has to be
| findable. What is NOT allowed is a fallback that matches everything —
| that is not a filter.
*/

const text = (value) => String(value || '').toLowerCase().trim();

const idOf = (value) => String(value?._id || value || '');

/*
 * Does this lead belong to this scenario?
 *
 * `scenario` needs { _id, name } and may carry { type }; the sidebar has
 * the full record, the inbox page has only what the URL carries.
 */
export const emailMatchesScenario = (email, scenario) => {
  if (!email || !scenario) return false;

  const targetId = idOf(scenario._id);
  const targetName = text(scenario.name);

  /*
   * The authoritative link, stamped by the backend when the lead arrived.
   * When it is present it is the whole answer — a lead claimed by one
   * scenario must not also appear under another.
   */
  const stamped = idOf(email.matchedScenarioId);

  if (stamped) return Boolean(targetId) && stamped === targetId;

  /* Legacy explicit link, if some older record carries one. */
  const legacyId = idOf(email.scenarioId || email.scenario_id);
  if (legacyId) return Boolean(targetId) && legacyId === targetId;

  /*
   * Unstamped: mail that predates the stamp. Named-match first, then the
   * scenario's own kind.
   */
  const emailScenName = text(email.scenarioName || email.scenario);

  if (targetName && emailScenName) {
    if (
      emailScenName === targetName ||
      emailScenName.includes(targetName) ||
      targetName.includes(emailScenName)
    ) {
      return true;
    }
  }

  const isShopify =
    text(scenario.type) === 'shopify' || targetName.includes('shopify');

  if (isShopify) {
    return (
      text(email.service).includes('shopify') ||
      text(email.subject).includes('shopify') ||
      email.stepType === 'shopify-test-parent' ||
      Boolean(email.extraFields?.storeName)
    );
  }

  /*
   * A custom scenario claims unstamped mail that is NOT a Shopify lead.
   * Deliberately narrow: "everything that isn't Shopify" was the old
   * behaviour and it is already generous.
   */
  return !(
    text(email.service).includes('shopify') ||
    text(email.subject).includes('shopify')
  );
};

/*
 * Does this lead belong to this connection?
 *
 * `connection` needs { _id } and/or an address; the inbox page passes the
 * address through the URL because the id alone is not enough for mail
 * stored before connectionId was populated.
 */
export const emailMatchesConnection = (email, connection) => {
  if (!email || !connection) return false;

  const targetId = idOf(connection._id);
  const targetEmail = text(connection.email || connection.userEmail);

  /*
   * The explicit link wins outright, the same way the scenario stamp
   * does: a lead recorded against one mailbox is not another mailbox's.
   */
  const emailConnId = idOf(email.connectionId || email.connection_id);

  if (emailConnId) return Boolean(targetId) && emailConnId === targetId;

  /*
   * No stored link: match on the address instead. An incoming lead has
   * the connection as its recipient; a reply the scenario sent has it as
   * the sender. The thread's messages are checked too, since a root can
   * predate the reply that names the mailbox.
   */
  if (!targetEmail.includes('@')) return false;

  const carriesAddress = (message) =>
    text(message?.recipientAddress).includes(targetEmail) ||
    text(message?.senderAddress).includes(targetEmail) ||
    text(message?.forwardedMeta?.to).includes(targetEmail) ||
    text(message?.forwardedMeta?.from).includes(targetEmail);

  if (carriesAddress(email)) return true;

  const thread = email.replies || email.conversation || [];

  return Array.isArray(thread) && thread.some(carriesAddress);
};
