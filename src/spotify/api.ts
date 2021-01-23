import SpotifyWebApi from 'spotify-web-api-js';
import {token} from './token';
export {token} from './token';

function setupApi(accessToken: string = token): SpotifyWebApi.SpotifyWebApiJs {
    const api = new SpotifyWebApi();
    api.setAccessToken(accessToken)
    return api
}

export const api: SpotifyWebApi.SpotifyWebApiJs = setupApi();
