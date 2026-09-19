import Script from "next/script";

/**
 * Crisp support chat, bottom right on every page.
 *
 * The snippet is Crisp's own, unchanged: it sets the queue on `window.$crisp`
 * so calls made before the widget loads are replayed, then appends the loader
 * to `<head>`. `afterInteractive` keeps it off the hydration path, so a slow
 * response from client.crisp.chat cannot hold up the board.
 *
 * The website id is not a secret. It ships in the HTML of every page by
 * design, so it stays a literal here rather than an environment variable
 * nobody can keep private anyway.
 */
const CRISP_WEBSITE_ID = "87d3ffd5-457a-4c1a-84e9-06c53a854955";

export function CrispChat() {
  return (
    <Script id="crisp-chat" strategy="afterInteractive">
      {`window.$crisp=[];window.CRISP_WEBSITE_ID="${CRISP_WEBSITE_ID}";(function(){var d=document,s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`}
    </Script>
  );
}
