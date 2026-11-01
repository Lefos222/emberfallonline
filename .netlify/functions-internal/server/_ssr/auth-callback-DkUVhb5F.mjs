import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BP2Q-OrU.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { u as setUser } from "./store-B-nItRWb.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as castle_jpg_asset_default } from "./castle.jpg.asset-BJsU75Uc.mjs";
import { O as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-callback-DkUVhb5F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Landing page for social sign-in. It waits for the session instead of bouncing to /auth. */
function AuthCallbackPage() {
	const nav = useNavigate();
	const [msg, setMsg] = (0, import_react.useState)("Signing you in…");
	(0, import_react.useEffect)(() => {
		let done = false;
		const enter = async (user) => {
			if (done || !user) return;
			done = true;
			await setUser(user.id, user.email ?? null, "event");
			nav({ to: "/" });
		};
		const { data } = supabase.auth.onAuthStateChange((_event, session) => {
			enter(session?.user);
		});
		let tries = 0;
		const poll = setInterval(() => {
			supabase.auth.getSession().then(({ data }) => {
				if (data.session?.user) enter(data.session.user);
				else if (++tries >= 32) {
					clearInterval(poll);
					setMsg("Sign-in didn't finish. Please try again.");
				}
			});
		}, 250);
		return () => {
			data.subscription.unsubscribe();
			clearInterval(poll);
		};
	}, [nav]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen items-center justify-center p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 bg-cover bg-center",
				style: { backgroundImage: `url(${castle_jpg_asset_default.url})` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-background/60 vignette" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "game-panel anim-pop relative w-full max-w-sm p-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "panel-title mb-3 text-2xl font-bold",
						children: "EmberFall Online"
					}),
					msg === "Signing you in…" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto mb-3 h-8 w-8 animate-spin text-gold" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-gold w-full py-2.5",
						onClick: () => void nav({ to: "/auth" }),
						children: "Back to sign in"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: msg
					})
				]
			})
		]
	});
}
//#endregion
export { AuthCallbackPage as component };
