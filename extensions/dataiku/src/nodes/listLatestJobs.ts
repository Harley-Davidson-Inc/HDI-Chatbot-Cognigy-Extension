import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IOfferControlParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			domain: string;
			USER_API_KEY: string;
		};
		projectKey: string;
		limit: number;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const listlatestJobsNode = createNodeDescriptor({
	type: "listLatestJobs",
	defaultLabel: "List Latest Jobs",
	fields: [
		{
			key: "connection",
			label: "Dataiku Connection",
			type: "connection",
			params: {
				connectionType: "Dataiku Connection",
				required: true
			}
		},
		{
			key: "projectkey",
			type: "text",
			label: "Enter the project key",
			defaultValue: "",
			params: {
				required: true
			}
		},
		{
			key: "limit",
			type: "number",
			label: "Enter the number limit of jobs to return",
			defaultValue: "100",
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "dataiku.request",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "dataiku.request",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			defaultValue: "input",
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
		}
	],
	sections: [
		{
			key: "Dataiku",
			label: "Advanced",
			defaultCollapsed: false,
			fields: [
				"projectKey",
				"limit",
			]
		},
		{
			key: "storage",
			label: "Storage Options",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "section", key: "Dataiku" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#3bc5bb"
	},
	function: async ({ cognigy, config }: IOfferControlParams) => {
		const { api, input } = cognigy;
		const { connection, projectKey, limit, storeLocation, contextKey, inputKey } = config;
		const { domain, USER_API_KEY } = connection;

		try {
			const response = await axios({
				method: 'get',
			  	url: `${domain}public/api/projects/${projectKey}}/jobs?limit=${limit}`,
			  	headers: {
					'Content-Type': 'application/json',
					'Authorization': `Basic ${USER_API_KEY}`
				}
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}

		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}

	}
});