import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BP2Q-OrU.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { u as setUser } from "./store-B-nItRWb.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import "./router-cVmQGRwQ.mjs";
import { t as castle_jpg_asset_default } from "./castle.jpg.asset-BJsU75Uc.mjs";
import { L as Eye, O as LoaderCircle, R as EyeOff } from "../_libs/lucide-react.mjs";
import { t as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-B0OQs24w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var lovableAuth = createLovableAuth();
var lovable = { auth: { signInWithOAuth: async (provider, opts) => {
	const result = await lovableAuth.signInWithOAuth(provider, {
		...opts,
		extraParams: { ...opts?.extraParams }
	});
	if (result.redirected) return result;
	if (result.error) return result;
	try {
		await supabase.auth.setSession(result.tokens);
	} catch (e) {
		return { error: e instanceof Error ? e : new Error(String(e)) };
	}
	return result;
} } };
function AuthPage() {
	const nav = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [show, setShow] = (0, import_react.useState)(false);
	const [socialBusy, setSocialBusy] = (0, import_react.useState)(null);
	const enterGame = async (user) => {
		if (!user) return;
		await setUser(user.id, user.email ?? null);
		nav({ to: "/" });
	};
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session?.user) enterGame(data.session.user);
		});
	}, []);
	const friendly = (m) => {
		if (/unauthori[sz]ed|not enabled|provider/i.test(m)) return "Google sign-in couldn't start right now. Please try again, or use email and password.";
		if (/popup/i.test(m)) return "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.";
		if (/email not confirmed/i.test(m)) return "Please confirm your email first — check your inbox.";
		if (/invalid login/i.test(m)) return "Wrong email or password.";
		return m;
	};
	const submit = async (e) => {
		e.preventDefault();
		setBusy(true);
		setMsg(null);
		if (mode === "forgot") {
			const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
			setMsg(error ? error.message : "If that email has an account, a reset link is on its way.");
		} else if (mode === "in") {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (error) setMsg(friendly(error.message));
			else await enterGame(data.user);
		} else {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: { emailRedirectTo: window.location.origin }
			});
			if (error) setMsg(friendly(error.message));
			else if (data.session) await enterGame(data.user);
			else setMsg("Check your email to confirm your account.");
		}
		setBusy(false);
	};
	const social = async (p) => {
		if (socialBusy) return;
		setSocialBusy(p);
		setMsg(null);
		try {
			const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: `${window.location.origin}/auth-callback` });
			if (r.error) {
				setMsg(friendly(String(r.error.message ?? r.error)));
				return;
			}
			if (r.redirected) return;
			const { data } = await supabase.auth.getUser();
			if (data.user) await enterGame(data.user);
			else setMsg("Sign-in didn't finish. Please try again.");
		} catch (e) {
			setMsg(friendly(e instanceof Error ? e.message : String(e)));
		} finally {
			setSocialBusy(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen items-center justify-center p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 bg-cover bg-center",
				style: { backgroundImage: `url(${castle_jpg_asset_default.url})` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-background/60 vignette" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "game-panel anim-pop relative w-full max-w-sm p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "panel-title mb-1 text-center text-3xl font-bold",
						children: "EmberFall Online"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-5 text-center text-sm text-muted-foreground",
						children: mode === "in" ? "Return to your castle" : mode === "up" ? "Forge a new legend" : "Reset your password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "slot w-full px-3 py-2 outline-none",
								type: "email",
								required: true,
								placeholder: "Email",
								value: email,
								onChange: (e) => setEmail(e.target.value)
							}),
							mode !== "forgot" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "slot w-full px-3 py-2 pr-10 outline-none",
									type: show ? "text" : "password",
									required: true,
									minLength: 6,
									placeholder: "Password (min 6)",
									value: password,
									onChange: (e) => setPassword(e.target.value)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground",
									onClick: () => setShow(!show),
									"aria-label": show ? "Hide password" : "Show password",
									children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn-gold w-full py-2.5",
								disabled: busy,
								children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto h-5 w-5 animate-spin" }) : mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Send reset link"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "my-4 text-center text-xs text-muted-foreground",
						children: "or"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-blood w-full py-2.5",
							disabled: !!socialBusy,
							onClick: () => social("google"),
							children: socialBusy === "google" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto h-5 w-5 animate-spin" }) : "Continue with Google"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "lovable-auth-button w-full",
							disabled: !!socialBusy,
							onClick: () => social("lovable"),
							children: socialBusy === "lovable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto h-5 w-5 animate-spin" }) : "Continue with Lovable"
						})]
					}),
					msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-center text-sm text-gold",
						children: msg
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "text-muted-foreground hover:text-gold",
							onClick: () => setMode(mode === "up" ? "in" : "up"),
							children: mode === "up" ? "Have an account? Sign in" : "New here? Sign up"
						}), mode === "in" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "text-muted-foreground hover:text-gold",
							onClick: () => setMode("forgot"),
							children: "Forgot password?"
						}) : mode === "forgot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "text-muted-foreground hover:text-gold",
							onClick: () => setMode("in"),
							children: "Back to sign in"
						}) : null]
					})
				]
			})
		]
	});
}
//#endregion
export { AuthPage as component };
