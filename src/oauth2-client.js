//@flow
import queryString from "query-string";
import { v4 as uuid } from "uuid";
import type { Storage } from "./storage";

type Callback = () => void | Promise<void>;

type ProviderConfig = {
    name: string,
    authorization_uri: string,
    params: {
        client_id: string,
        [string]: string
    }
};

type ReturnUri = string | (provider: string) => string;

type TokenStorage = Storage<{[provider: string]: string}>;

type OAuth2Options = {
    tokenStorage: TokenStorage,
    stateStorage: Storage<string>,
    returnUri: ReturnUri
};

const generateState = (providerName: string) => {
    return btoa(JSON.stringify({
        p: providerName,
        id: uuid()
    }));
};

const parseState = (state: string) => {
    const s = JSON.parse(atob(state));
    return {
        provider: s.p,
        id: s.id
    };
};

export default class Oauth2Client {
    _returnUri: ReturnUri;
    _tokenStorage: TokenStorage;
    _stateStorage: Storage<string>;
    +_providers = new Map<string, ProviderConfig>();
    +_beforeAuthCallbacks: Callback[] = [];

    constructor(options: OAuth2Options) {
        this._returnUri = options.returnUri;
        this._tokenStorage = options.tokenStorage;
        this._stateStorage = options.stateStorage;
    }

    addProvider(providerConfig: ProviderConfig) {
        const providerName = providerConfig.name;

        this._providers.set(providerName, providerConfig);
    }

    getToken(provider: string) {
        const tokens = this._tokenStorage.load();
        if (tokens && tokens[provider]) {
            return tokens[provider];
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

        let returnUri = this._returnUri;
        if (typeof returnUri === "function") {
            returnUri = returnUri(providerName);
        }

        const state = generateState(providerName);
        this._stateStorage.save(state);

        const qs = queryString.stringify({
            redirect_uri: returnUri,
            state: state,
            ...providerConfig.params
        });

        const authUri = `${providerConfig.authorization_uri}?${qs}`;

        location.href = authUri;
    }

    finishAuthorization(providerName: string) {
        const params = queryString.parse(location.hash);
        

        if (params.hasOwnProperty("error")) {
            //TODO
        }
    }
}
