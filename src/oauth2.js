//@flow
import queryString from "query-string";
import { omit } from "lodash-es";
import type { Storage } from "./storage";

type Callback = () => void | Promise<void>;

type ProviderConfig = {
    name: string,
    authorization_uri: string,
    client_id: string,
    [string]:string
};

type ReturnUriBuilder = (provider: string) => string;

type TokenStorage = Storage<{[provider: string]: string}>;

type OAuth2Options = {
    tokenStorage: TokenStorage,
    returnUriBuilder: ReturnUriBuilder
};

export default class OAuth2 {
    _returnUriBuilder: ReturnUriBuilder;
    _tokenStorage: TokenStorage;
    +_providers = new Map<string, ProviderConfig>();
    +_beforeAuthCallbacks: Callback[] = [];

    constructor(options: OAuth2Options) {
        this._returnUriBuilder = options.returnUriBuilder;
        this._tokenStorage = options.tokenStorage;
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
            throw new Error("Not a known OAuth2 provider: " + providerName);
        }

        await Promise.all(this._beforeAuthCallbacks.map(cb => cb()));

        const params = omit(providerConfig, ["name", "authorizationUri"]);
        params.redirect_uri = this._returnUriBuilder(providerName);

        const authUri = `${providerConfig.authorization_uri}?${queryString.stringify(params)}`;

        location.href = authUri;
    }

    finishAuthorization(providerName: string) {
        const params = queryString.parse(location.hash);

        if (params.hasOwnProperty("error")) {
            //TODO
        }
    }
}
