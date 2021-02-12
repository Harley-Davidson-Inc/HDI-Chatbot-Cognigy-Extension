import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const Orchestrator = require('uipath-orchestrator');


export interface IOnPremAuthenticationParams extends INodeFunctionBaseParams {
    config: {
        instanceInfo: {
            orchestratorUrl: string;
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

export const onPremAuthenticationNode = createNodeDescriptor({
    type: "onPremAuthentication",
    defaultLabel: "On-Premise Authentication",
    fields: [
        {
            key: "onPremAuthConnection",
            label: "UiPath On-Prem Connection",
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
        { type: "field", key: "onPremAuthConnection" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#fa4514"
    },
    function: async ({ cognigy, config }: IOnPremAuthenticationParams) => {
        const { api } = cognigy;
        const { instanceInfo, accessToken, releaseKey, robotIds, storeLocation, inputKey, contextKey } = config;
		const { orchestratorUrl, accountLogicalName, tenantLogicalName, tenancyName, usernameOrEmailAddress, password, hostname, isSecure, port, invalidCertificate, connectionPool } = instanceInfo;

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




        // const endpoint = `https://${orchestratorUrl}/api/account/authenticate`;
        // const axiosConfig: AxiosRequestConfig = {
        //     "headers":
        //     {
        //         "Content-Type": "application/json"
        //     }
        // };


        try {
            const response = await orchestrator.post(`https://${orchestratorUrl}/api/account/authenticate`);

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