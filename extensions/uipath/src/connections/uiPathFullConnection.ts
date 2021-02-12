/**
 * 	tenancyName: 'test',           // The Orchestrator Tenancy
			usernameOrEmailAddress: 'xxx',// The Orchestrator login
			password: 'yyy',               // The Orchestrator password
			hostname: 'host.company.com', // The instance hostname
			isSecure: true,                // optional (defaults to true)
			port: 443, // optional (defaults to 80 or 443 based on isSecure)
			invalidCertificate: false, // optional (defaults to false)
            connectionPool: 5 // options, 0=unlimited (defaults to 1)

            			accountLogicalName: string;
			tenantLogicalName: string;
 */

import { IConnectionSchema } from "@cognigy/extension-tools";

export const uiPathFullConnection: IConnectionSchema = {
	type: "uipathFullConnection",
	label: "UiPath Connection",
	fields: [
		{ fieldName: "tenancyName" },
        { fieldName: "usernameOrEmailAddress"},
        { fieldName: "hostname" },
        { fieldName: "isSecure"},
        { fieldName: "port" },
        { fieldName: "invalidCertificate"},
        { fieldName: "connectionPool"}
	]
};