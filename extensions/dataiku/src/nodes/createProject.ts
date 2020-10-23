import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IOfferControlParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			domain: string;
			USER_API_KEY: string;
		};
		projectFolderId: string;
		projectKey: string;
		name: string;
		owner: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const createProjectNode = createNodeDescriptor({
	type: "createProject",
	defaultLabel: "Create Project",
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
			key: "projectFolderId",
			type: "text",
			label: "Enter the project folder id",
			defaultValue: "",
			params: {
				required: true,
			}
		},
		{
			key: "projectKey",
			type: "text",
			label: "Enter the project key of the new project",
			defaultValue: "",
			params: {
				required: true,
			}
		},
		{
			key: "name",
			type: "text",
			label: "Enter the name of the new project",
			defaultValue: "",
			params: {
				required: true,
			}
		},
		{
			key: "owner",
			type: "text",
			label: "Enter the login of the owner of the new project",
			defaultValue: "",
			params: {
				required: true,
			}
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
				"projectFolderID",
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
		const { connection, projectFolderId, projectKey, name, owner, storeLocation, contextKey, inputKey } = config;
		const { domain, USER_API_KEY } = connection;

		try {
			const response = await axios({
				method: 'get',
			  	url: `${domain}public/api/projects?projectFolderId=${projectFolderId}`,
			  	headers: {
					'Content-Type': 'application/json',
					'Authorization': `Basic ${USER_API_KEY}`
				},
				data: {
					projectKey,
					name,
					owner,
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