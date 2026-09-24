import { auth } from "@/auth";
import { exportAccount } from "@/lib/account-data";
import { loadAccess } from "@/lib/profiles";

/**
 * Everything this account holds, as a file the browser saves.
 *
 * A route rather than a server action because the answer is a download: a
 * plain link with a Content-Disposition header works with the keyboard, with
 * "save link as", and with no JavaScript at all.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.memberId) {
    return Response.json({ error: "Sign in first." }, { status: 401 });
  }

  const access = await loadAccess(session.memberId);
  if (!access) {
    return Response.json({ error: "No account for this sign in." }, { status: 404 });
  }

  const data = await exportAccount(access.account);
  const day = data.exportedAt.slice(0, 10);

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="goodsocials-${day}.json"`,
      // Somebody's whole account. No shared cache keeps a copy.
      "Cache-Control": "private, no-store",
    },
  });
}
