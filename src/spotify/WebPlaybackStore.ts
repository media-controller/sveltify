import {token} from "./api";

import {concat, from, fromEventPattern, merge, Observable} from "rxjs";
import {map, mergeMap, share, tap} from "rxjs/operators";
import SpotifyPlayer = Spotify.SpotifyPlayer;

import ErrorTypes = Spotify.ErrorTypes;
import PlaybackState = Spotify.PlaybackState;
import WebPlaybackInstance = Spotify.WebPlaybackInstance;

const createSpotifyPlayer = (
    name: string,
    tokenCallback: (cb: (token: string) => void) => void
): Promise<SpotifyPlayer> => new Promise(resolve => {
    console.debug("importing spotify-player.js")
    import(`https://sdk.scdn.co/spotify-player.js`).then(() =>
        console.debug("imported spotify-player.js")
    )
    window.onSpotifyWebPlaybackSDKReady = () => {
        console.debug("onSpotifyWebPlaybackSDKReady")
        resolve(new window.Spotify.Player({
                name: name,
                getOAuthToken: tokenCallback
            })
        );
    };
})

export const player$: Observable<SpotifyPlayer> = from(
    createSpotifyPlayer("Svelte", cb => cb(token))
).pipe(
    tap(player => console.debug("sharing player => ", player)),
    share()
)

export const playbackState$: Observable<PlaybackState | null> = player$.pipe(
    mergeMap(player =>
        concat(
            from(player.getCurrentState()),
            fromEventPattern<PlaybackState>(
                listener => player.addListener("player_state_changed", listener),
                listener => player.removeListener("player_state_changed", listener)
            )
        )
    )
)

const getErrors = (player$: Observable<SpotifyPlayer>, err: ErrorTypes): Observable<Error> => player$.pipe(
    mergeMap((player: SpotifyPlayer) =>
        fromEventPattern<Error>(
            listener => player.addListener(err, listener),
            listener => player.removeListener(err, listener)
        )
    )
)

export const accountErrors$ /*        */ = getErrors(player$, "account_error")
export const authenticationErrors$ /* */ = getErrors(player$, "authentication_error")
export const initializationErrors$ /* */ = getErrors(player$, "initialization_error")
export const playbackErrors$ /*       */ = getErrors(player$, "playback_error")

const readyDevices$: Observable<string[]> = player$.pipe(mergeMap(player =>
    fromEventPattern<WebPlaybackInstance>(
        listener => player.addListener("ready", listener),
        listener => player.removeListener("ready", listener)
    ).pipe(map(inst => [inst.device_id]))
))

const notReadyDevices$: Observable<string[]> = player$.pipe(mergeMap(player =>
    fromEventPattern<WebPlaybackInstance>(
        listener => player.addListener("not_ready", listener),
        listener => player.removeListener("not_ready", listener)
    ).pipe(map(_ => []))
))

export const device$: Observable<string[]> = merge(
    readyDevices$,
    notReadyDevices$
)