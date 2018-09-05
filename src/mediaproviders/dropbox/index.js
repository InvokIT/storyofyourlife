//@flow
import querystring from "querystring";
import ClientOAuth2 from "client-oauth2";
import type { Storage } from "../../storage";
import type { Album, MediaItem, MediaProvider } from "../types";
import { getLocale } from "../../i18n";
import { LocalStorage } from "../../storage";

const DROPBOX_OAUTH_URI: string = "https://www.dropbox.com/oauth2/authorize";
const DROPBOX_OAUTH_APP_KEY: string = process.env.DROPBOX_APP_KEY || "";
const DROPBOX_OAUTH_RETURN_URI: string = process.env.DROPBOX_RETURN_URI || "";

if (!DROPBOX_OAUTH_APP_KEY) {
    // TODO warn
}

if (!DROPBOX_OAUTH_RETURN_URI) {
    // TODO warn
}

const oauth2TokenStorage = new LocalStorage("oauth2-dropbox");

const oauth = new ClientOAuth2({
    clientId: DROPBOX_OAUTH_APP_KEY,
    authorizationUri: DROPBOX_OAUTH_URI,
    redirectUri: DROPBOX_OAUTH_RETURN_URI
});

const parseAuthorizationResponse = async () => {
    dropboxAuth.token.getToken(location.hash)
    const response = querystring.parse(location.hash);
    return response.access_token;
};

export default class DropboxMediaProvider implements MediaProvider {
    _tokenStorage: Storage;

    constructor(options: {tokenStorage: Storage}) {
        this._tokenStorage = options.tokenStorage;

        const token = parseAuthorizationResponse();
        if (token) {
            this._tokenStorage.save(token);
        }
    }

    authorize() {
        let token = this._tokenStorage.load();

        if (!token) {
            // Log in to Dropbox
            const redirectUrl = DROPBOX_OAUTH_URI + querystring.stringify({
                response_type: "token", // Use "token" on client-side apps
                client_id: DROPBOX_OAUTH_APP_KEY,
                redirect_uri: DROPBOX_OAUTH_RETURN_URI,
                state: null,
                locale: getLocale()
            });

            location.href = redirectUrl;
        }
    }

    async isAuthorized() {

    }

    async getAlbums(): Promise<[Album]> {

    }

    async getMedia(album: ?Album, count: ?number): Promise<[MediaItem]> {

    }
}
