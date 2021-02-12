import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const Orchestrator = require('uipath-orchestrator');

export interface IGetReleasesParams extends INodeFunctionBaseParams {
	config: {
		instanceInfo: {
			accountLogicalName: string;
			tenantLogicalName: string;
			tenancyName: string;
			usernameOrEmailAddress: string;
			password: string;
			hostname: string;
			isSecure: boolean;
			port: 443 | 587,
			invalidCertificate: boolean;
            connectionPool: number;
		};
		accessToken: string;
        releaseKey: string;
        robotIds: {ids: string []};
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getReleasesNode = createNodeDescriptor({
	type: "getReleases",
	defaultLabel: "Get Releases",
	fields: [
		{
			key: "instanceInfo",
			label: "Orchestrator Instance Information",
			type: "connection",
			params: {
				connectionType: "uipathFullConnection",
				required: true
			}
		},
		{
			key: "accessToken",
			label: "Access Token",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			params: {
				options: [
					{
						label: "Input",
						value: "input"
					},
					{
						label: "Context",
						value: "context"
					}
				],
				required: true
			},
			defaultValue: "input"
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "uipath.releases",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath.releases",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storageOption",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "instanceInfo" },
		{ type: "field", key: "accessToken" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IGetReleasesParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, storeLocation, inputKey, contextKey } = config;
		const { accountLogicalName, tenantLogicalName, tenancyName, usernameOrEmailAddress, password, hostname, isSecure, port, invalidCertificate, connectionPool } = instanceInfo;

		const orchestrator = new Orchestrator({
			tenancyName,
			usernameOrEmailAddress,
			password,
			hostname,
			isSecure,
			port,
			invalidCertificate,
			connectionPool
	   });




		try {
			const response = await orchestrator.post('/odata/Releases');
			if (storeLocation === 'context') {
				api.addToContext(contextKey, response, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result.data);
			}
		} catch (error) {
			if (storeLocation === 'context') {
				api.addToContext(contextKey, { error: error.message }, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});