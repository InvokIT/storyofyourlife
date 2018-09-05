//@flow
import querystring from "querystring";
import type { Album, MediaItem, MediaProvider } from "../types";
import { getLocale } from "../../i18n";
import Storage from "../../storage";

const DROPBOX_OAUTH_APP_KEY: string = process.env.DROPBOX_APP_KEY || "";
const DROPBOX_OAUTH_URI: string = "https://www.dropbox.com/oauth2/authorize";

if (!DROPBOX_OAUTH_APP_KEY) {
    // TODO warn
}

export const oauth2Config = {
    name: "dropbox",
    clientId: DROPBOX_OAUTH_APP_KEY,
    authorizationUri: DROPBOX_OAUTH_URI
};

type TokenProvider = () => string;

type DropboxMediaProviderOptions = {
    tokenProvider: TokenProvider
};

export default class DropboxMediaProvider implements MediaProvider {
    _tokenProvider: TokenProvider;

    constructor(options: DropboxMediaProviderOptions) {
        this._tokenProvider = options.tokenProvider;
    }

    authorize() {
        let token = this._tokenProvider();

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

    // async getAlbums(): Array<Album> {

    // }

    // async getMedia(album: ?Album, count: ?number): Promise<[MediaItem]> {

    // }
}
