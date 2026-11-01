//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-CLpI6Gb3.js
var manifest = {
	"137c50ff3b98693823ea37ece243d7fd170720cf0ccaddea5f8c7dec3a1768da": {
		functionName: "adviseStrategy_createServerFn_handler",
		importer: () => import("./_ssr/quests.functions-B95ZUd2p.mjs")
	},
	"f6d3626eac7961bb67133ad1a98c68433af0a4abbe0c2f114a4980c35d7f1b65": {
		functionName: "confirmEventEntry_createServerFn_handler",
		importer: () => import("./_ssr/events.functions-BdvfFSmU.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ??= await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
