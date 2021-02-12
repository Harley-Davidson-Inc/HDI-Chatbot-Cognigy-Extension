import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { StartJob } from "../../types/uipath";
const Orchestrator = require('uipath-orchestrator');


export interface ICreateTokenParams extends INodeFunctionBaseParams {
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

export const startJobNode = createNodeDescriptor({
	type: "startJobNode",
	defaultLabel: "Start a specific job",
	fields: [
		{
			key: "instanceInfo",
			label: "Orchestrator Instance Information",
			type: "connection",
			params: {
				connectionType: 'uipathFullConnection',
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
			key: "releaseKey",
			label: "Process Release Key",
			type: "cognigyText",
			params: {
				required: true
			}
        },
        {
			key: "robotIds",
			label: "Robot IDs",
			type: "json",
			defaultValue: `{ "ids": [] }`,
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
			defaultValue: "uiPathProcessState",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uiPathProcessState",
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
		{ type: "field", key: "releaseKey" },
		{ type: "field", key: "robotIds" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: ICreateTokenParams) => {
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


        // const endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`;
        // const axiosConfig: AxiosRequestConfig = {
        //     headers: {
        //         'Content-Type': 'application/json',
		// 		'Authorization': `Bearer ${accessToken}`,
		// 		'X-UIPATH-TenantName': tenantLogicalName
        //     }
        // };

		try {
			// const result: AxiosResponse <StartJob> =  await axios.post(endpoint, data, axiosConfig);
			const response = await orchestrator.post('/odata/StartJobs', {
				startInfo: {
					ReleaseKey: releaseKey,
					RobotIds: robotIds.ids,
					Strategy: "Specific"
				  }
			});


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