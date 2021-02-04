import SpotifyWebApi from 'spotify-web-api-js';
import {token} from './token';
export {token} from './token';

function setupApi(accessToken: string = token): SpotifyWebApi.SpotifyWebApiJs {
    const spotifyWebApi = new SpotifyWebApi();
    spotifyWebApi.setAccessToken(accessToken)
    return spotifyWebApi
}

export const api: SpotifyWebApi.SpotifyWebApiJs = setupApi();
