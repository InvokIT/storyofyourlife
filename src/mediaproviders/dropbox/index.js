//@flow
import type { Storage } from "../../storage";
import type { Album, MediaItem, MediaProvider } from "../types";
import queryString from "query-string";
import { getLocale } from "../../i18n";

const OAUTH_URL: string = "https://www.dropbox.com/oauth2/authorize";
const DROPBOX_APP_KEY: string = process.env.DROPBOX_APP_KEY || "";
const DROPBOX_RETURN_URI: string = process.env.DROPBOX_RETURN_URI || "";

if (!DROPBOX_APP_KEY) {
    // TODO warn
}

if (!DROPBOX_RETURN_URI) {
    // TODO warn
}

const parseAuthorizationResponse = () => {
    const response = queryString.parse(location.hash);
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
            const redirectUrl = OAUTH_URL + queryString.stringify({
                response_type: "token", // Use "token" on client-side apps
                client_id: DROPBOX_APP_KEY,
                redirect_uri: DROPBOX_RETURN_URI,
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
