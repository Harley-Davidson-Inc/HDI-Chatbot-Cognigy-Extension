import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { AccessToken } from "../../types/uipath";
const Orchestrator = require('uipath-orchestrator');

export interface ICloudAuthenticationParams extends INodeFunctionBaseParams {
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
			clientId: string;
			refreshToken: string;
		};
		accessToken: string;
        releaseKey: string;
        robotIds: {ids: string []};
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const cloudAuthenticationNode = createNodeDescriptor({
	type: "cloudAuthentication",
	defaultLabel: "Cloud Authentication",
	fields: [
		{
			key: "accessInfo",
			label: "UiPath Connection",
			type: "connection",
			params: {
				connectionType: "uipathFullConnection",
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
			defaultValue: "uiPathAccessToken",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uiPathAccessToken",
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
		{ type: "field", key: "accessInfo" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: ICloudAuthenticationParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, releaseKey, robotIds, storeLocation, inputKey, contextKey } = config;
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
			const response = await orchestrator.post('https://account.uipath.com/oauth/token');
			// , {
				// 'grant_type': "refresh_token",
				// 'client_id': clientId,
				// 'refresh_token': refreshToken
			// 	});
			if (storeLocation === 'context') {
				api.addToContext(contextKey, response, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response);
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