//@flow
import queryString from "query-string";
import uuid from "uuid/v4";
import type { Storage } from "./storage";

type Callback = () => void | Promise<void>;

type ProviderConfig = {
    name: string,
    authorization_uri: string,
    client_id: string,
    redirect_uri: ?string,
    scope: ?string
};

type ReturnUri = string | (provider: string) => string;

type Authorization = {
    provider: string,
    token: string,
    expiresAt: ?number
}

type AuthStorage = Storage<{[provider: string]: Authorization}>;

type OAuth2Options = {
    authStorage: AuthStorage,
    stateStorage: Storage<string>,
    returnUri: ReturnUri
};

type Oauth2SuccessResponse = {
    access_token: string,
    expires_in: string,
    scope: ?string,
    state: string
}

type Oauth2ErrorResponse = {
    error: 
        "invalid_request"
        | "unauthorized_client"
        | "access_denied"
        | "unsupported_response_type"
        | "invalid_scope"
        | "server_error"
        | "temporarily_unavailable",
    error_description: ?string,
    error_uri: ?string,
    state: string
}

const generateState = (providerName: string) => {
    return btoa(JSON.stringify({
        p: providerName,
        id: uuid()
    }));
};

const parseState = (state: string) => {
    const s = (JSON.parse(atob(state)): {p:string, id: string});
    return {
        provider: s.p,
        id: s.id
    };
};

export default class Oauth2Client {
    _returnUri: ReturnUri;
    _authStorage: AuthStorage;
    _stateStorage: Storage<string>;
    +_providers = new Map<string, ProviderConfig>();
    +_beforeAuthCallbacks: Callback[] = [];

    constructor(options: OAuth2Options) {
        this._returnUri = options.returnUri;
        this._authStorage = options.authStorage;
        this._stateStorage = options.stateStorage;
    }

    addProvider(providerConfig: ProviderConfig) {
        const providerName = providerConfig.name;

        this._providers.set(providerName, providerConfig);
    }

    getAuthorization(provider: string) {
        const authorizations = this._authStorage.load();
        if (authorizations && authorizations[provider]) {
            // TODO return null of token is expired
            return authorizations[provider];
        } else {
            return null;
        }
    }

    onBeforeAuthorization(cb: Callback) {
        this._beforeAuthCallbacks.push(cb);
    }

    async beginAuthorization(providerName: string) {
        const providerConfig = this._providers.get(providerName);

        if (!providerConfig) {
            throw new Error("Not a known a provider: " + providerName);
        }

        await Promise.all(this._beforeAuthCallbacks.map(cb => cb()));

        const state = generateState(providerName);
        this._stateStorage.save(state);

        const qs = queryString.stringify({
            response_type: "token",
            client_id: providerConfig.client_id,
            redirect_uri: providerConfig.redirect_uri || null,
            scope: providerConfig.scope || null,
            state: state
        });

        const authUri = `${providerConfig.authorization_uri}?${qs}`;

        location.href = authUri;
    }

    finishAuthorization() {
        const response: Oauth2SuccessResponse | Oauth2ErrorResponse = (queryString.parse(location.hash): any);

        if (!response.state) {
            // todo log
            return;
        }

        const savedState = this._stateStorage.load();

        if (savedState !== response.state) {
            throw new Error("state from response does not match saved state.")
        }

        const parsedState = parseState(response.state);
        const provider = parsedState.provider;

        if (response.access_token) {
            const successResponse: Oauth2SuccessResponse = (response: any);
            const accessToken = successResponse.access_token;
            const expiresIn = successResponse.expires_in;

            const auths = this._authStorage.load();
            auths[provider] = {
                provider,
                token: accessToken,
                expiresAt: expiresIn ? Date.now() + (parseInt(expiresIn, 10) * 1000) : null
            };
            this._authStorage.save(auths);
        } else {
            const errorResponse: Oauth2ErrorResponse = (response: any);
        }
    }
}
