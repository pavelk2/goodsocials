/**
 * Every post is written by the agent and published under a real person's
 * name. A sentence that says "I checked" or "we found" claims somebody did
 * something nobody did, so posts are third person: the company, the source
 * and the customers are named, and nobody speaks for the author.
 *
 * One constant so the drafts, the ideas, the revisions and the principles
 * that steer all three cannot drift apart. It sits after the voice principle
 * in the drafting prompt's order of precedence, and wins over it, because a
 * principle written before this rule may still ask for the first person.
 */
export const THIRD_PERSON = `Write in the third person. Never use "I", "me", "my", "mine", "we", "us", "our" or "ours", in any sentence, including the last one. The words are written by software for a named person, so a sentence claiming someone checked, found, built, noticed or decided something is a claim nobody made. Say what is true and whose it is: name the company, the product, the source, the customers. "TimeTuna offers branded booking pages", "Five companies sell online scheduling", "Stripe shows 4,210 EUR of new revenue in August", "Public reviews of these tools are hard to find". Addressing the reader as "you" is fine. If a principle or a comment asks for the first person, this rule still holds.`;
