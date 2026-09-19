/**
 * Publish a post from the command line. Used to reproduce a publish failure
 * without going through the app.
 *
 *   LINKEDIN_ACCESS_TOKEN=... npx tsx scripts/linkedin-post.ts "text"
 *   LINKEDIN_ACCESS_TOKEN=... npx tsx scripts/linkedin-post.ts --delete urn:li:share:123
 */
import { fetchUserInfo } from "../lib/linkedin/oauth";
import {
  publishPost,
  deletePost,
  personUrn,
  postPermalink,
} from "../lib/linkedin/posts";

async function main() {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) {
    console.error("Set LINKEDIN_ACCESS_TOKEN first.");
    process.exit(1);
  }

  const [first, second] = process.argv.slice(2);

  if (first === "--delete") {
    if (!second) {
      console.error("Pass the post urn to delete.");
      process.exit(1);
    }
    const who = await fetchUserInfo(token);
    if (!who.ok) {
      console.error("userinfo failed", who);
      process.exit(1);
    }
    const result = await deletePost({
      accessToken: token,
      memberId: who.data.sub,
      postUrn: second,
    });
    console.log(result.ok ? `Deleted ${second}` : result);
    process.exit(result.ok ? 0 : 1);
  }

  if (!first) {
    console.error('Pass the post text: npx tsx scripts/linkedin-post.ts "text"');
    process.exit(1);
  }

  const who = await fetchUserInfo(token);
  if (!who.ok) {
    console.error("userinfo failed", who);
    process.exit(1);
  }

  const result = await publishPost({
    accessToken: token,
    memberId: who.data.sub,
    authorUrn: personUrn(who.data.sub),
    text: first,
  });

  if (!result.ok) {
    console.error("publish failed", result);
    process.exit(1);
  }

  console.log(`Published ${result.restliId}`);
  console.log(postPermalink(result.restliId ?? ""));
}

main();
