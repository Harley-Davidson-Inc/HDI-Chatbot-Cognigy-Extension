import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AddTransactionItem } from "../../types/uipath";
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
        queueName: string;
        reference: string;
        priority: string;
        specificContent: any;
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const addTransaction = createNodeDescriptor({
	type: "addTransaction",
	defaultLabel: "Add a new transaction",
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
			key: "queueName",
			label: "Queue Name",
			type: "cognigyText",
			params: {
				required: true
			}
        },
        {
			key: "reference",
			label: "Queue Refrence",
			type: "cognigyText",
			params: {
				required: false
			}
		},        {
			key: "priority",
			label: "Transcation Item Priority",
			type: "select",
			params: {
                options: [
                    {
                        label: "Low",
                        value: "Low"
                    },
                    {
                        label: "High",
                        value: "High"
                    }
                ],
				required: true
			}
		},
        {
			key: "specificContent",
			label: "Transaction Item Specific Content",
			type: "json",
			params: {
				required: false
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
			defaultValue: "queueItemId",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "queueItemId",
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
		{ type: "field", key: "queueName" },
		{ type: "field", key: "reference" },
		{ type: "field", key: "priority" },
		{ type: "field", key: "specificContent" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: ICreateTokenParams) => {
		const { api } = cognigy;
		const { instanceInfo, accessToken, queueName, reference, priority, specificContent, storeLocation, inputKey, contextKey } = config;
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


        // const endpoint = `https://platform.uipath.com/${accountLogicalName}/${tenantLogicalName}/odata/Queues/UiPathODataSvc.AddQueueItem%28%29`;
        // const axiosConfig: AxiosRequestConfig = {
        //     headers: {
        //         'Content-Type': 'application/json',
		// 		'Authorization': `Bearer ${accessToken}`,
		// 		'X-UIPATH-TenantName': tenantLogicalName
        //     }
		// };

		try {
			// const result: AxiosResponse <AddTransactionItem> =  await axios.post(endpoint, data, axiosConfig);
			const response = orchestrator.post('/odata/AddQueueItem%28%29', {
				itemData: {
						Name: queueName,
						Reference: reference,
						 Priority: priority.charAt(0).toUpperCase() + priority.slice(1),
						 "SpecificContent": specificContent.data,
						 "DeferDate": null,
						 "DueDate": null
					 }
			   });

			if (storeLocation === 'context') {
				api.addToContext(contextKey, response, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result.data.Id);
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