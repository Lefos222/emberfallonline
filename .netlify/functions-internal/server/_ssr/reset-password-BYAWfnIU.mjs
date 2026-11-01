import { r as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BP2Q-OrU.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as castle_jpg_asset_default } from "./castle.jpg.asset-BJsU75Uc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-BYAWfnIU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPage() {
	const nav = useNavigate();
	const [pw, setPw] = (0, import_react.useState)("");
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen items-center justify-center p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 bg-cover bg-center",
				style: { backgroundImage: `url(${castle_jpg_asset_default.url})` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-background/60 vignette" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "game-panel anim-pop relative w-full max-w-sm space-y-3 p-6",
				onSubmit: async (e) => {
					e.preventDefault();
					setBusy(true);
					const { error } = await supabase.auth.updateUser({ password: pw });
					setBusy(false);
					if (error) setMsg(error.message);
					else nav({ to: "/" });
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "panel-title text-center text-2xl font-bold",
						children: "New password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "slot w-full px-3 py-2 outline-none",
						type: "password",
						minLength: 6,
						required: true,
						placeholder: "New password",
						value: pw,
						onChange: (e) => setPw(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn-gold w-full py-2.5",
						disabled: busy,
						children: "Save password"
					}),
					msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-hp",
						children: msg
					})
				]
			})
		]
	});
}
//#endregion
export { ResetPage as component };
