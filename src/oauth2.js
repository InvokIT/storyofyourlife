// @ flow
import ClientOAuth2 from "client-oauth2";

const tokens = new Map();

const DROPBOX_OAUTH_URI: string = "https://www.dropbox.com/oauth2/authorize";
const DROPBOX_OAUTH_APP_KEY: string = process.env.DROPBOX_APP_KEY || "";
const DROPBOX_OAUTH_RETURN_URI: string = process.env.DROPBOX_RETURN_URI || "";

const providers = {
    "dropbox": new ClientOAuth2({
        clientId: DROPBOX_OAUTH_APP_KEY,
        authorizationUri: DROPBOX_OAUTH_URI,
        redirectUri: DROPBOX_OAUTH_RETURN_URI
    })
};

export const getToken = (provider: string) => {
    return tokens.get(provider);
};

export const beginAuthorization = (provider: string) => {

};

export const finishAuthorization = () => {

};
