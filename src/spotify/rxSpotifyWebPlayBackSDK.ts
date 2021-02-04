import {api, token} from "./api";
import {animationFrames, from, fromEventPattern, merge, Observable, of} from "rxjs";
import {filter, map, mergeMap, share, switchMap, tap} from "rxjs/operators";

import SpotifyPlayer = Spotify.SpotifyPlayer;
import ErrorTypes = Spotify.ErrorTypes;
import PlaybackState = Spotify.PlaybackState;
import WebPlaybackInstance = Spotify.WebPlaybackInstance;
import {isNotNullOrUndefined} from "../util/filters";

const createSpotifyPlayer = (
    name: string,
    tokenCallback: (cb: (token: string) => void) => void
): Promise<SpotifyPlayer> => new Promise(resolve => {
    console.debug("importing spotify-player.js")
    // @ts-ignore
    import(`https://sdk.scdn.co/spotify-player.js`)
    window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
            name: name,
            getOAuthToken: tokenCallback
        })
        console.debug("onSpotifyWebPlaybackSDKReady: ", player)
        resolve(player);
    };
})

const getConnectedPlayer = async () => {
    const player = await createSpotifyPlayer("Svelte", cb => cb(token))
    const connected = await player.connect()
    console.debug("connected to spotify player = ", connected)
    return player
}

const connectedPlayer$: Observable<SpotifyPlayer> = from(getConnectedPlayer())

const readyDevices$: Observable<string[]> = connectedPlayer$.pipe(mergeMap(player =>
    fromEventPattern<WebPlaybackInstance>(
        listener => player.addListener("ready", listener),
        listener => player.removeListener("ready", listener)
    ).pipe(map(inst => [inst.device_id]))
))

const notReadyDevices$: Observable<string[]> = connectedPlayer$.pipe(mergeMap(player =>
    fromEventPattern<WebPlaybackInstance>(
        listener => player.addListener("not_ready", listener),
        listener => player.removeListener("not_ready", listener)
    ).pipe(map(_ => []))
))

const devices$: Observable<string[]> = merge(
    readyDevices$,
    notReadyDevices$
)

export const player$: Observable<SpotifyPlayer> = connectedPlayer$.pipe(
    switchMap((player: SpotifyPlayer) =>
        devices$.pipe(
            filter((devices: string[]) => devices.length > 0),
            tap(player => console.debug("connected players: ", player)),
            switchMap((devices: string[]) =>
                from(api.transferMyPlayback(devices, {play: true})).pipe(
                    switchMap(_ => of(player))
                )
            )
        )
    )
)

export const playbackState$: Observable<PlaybackState> = connectedPlayer$.pipe(
    switchMap(player =>
        merge(
            from(player.getCurrentState()),
            fromEventPattern<PlaybackState>(
                listener => player.addListener("player_state_changed", listener),
                listener => player.removeListener("player_state_changed", listener)
            )
        )
    ),
    isNotNullOrUndefined(),
    share(),
)

const getErrors = (player$: Observable<SpotifyPlayer>, err: ErrorTypes): Observable<Error> => player$.pipe(
    switchMap((player: SpotifyPlayer) =>
        fromEventPattern<Error>(
            listener => player.addListener(err, listener),
            listener => player.removeListener(err, listener)
        )
    )
)

export const accountErrors$ /*        */ = getErrors(connectedPlayer$, "account_error");        accountErrors$.subscribe(console.debug)
export const authenticationErrors$ /* */ = getErrors(connectedPlayer$, "authentication_error"); authenticationErrors$.subscribe(console.debug)
export const initializationErrors$ /* */ = getErrors(connectedPlayer$, "initialization_error"); initializationErrors$.subscribe(console.debug)
export const playbackErrors$ /*       */ = getErrors(connectedPlayer$, "playback_error");       playbackErrors$.subscribe(console.debug)

export let currentTrack$ = playbackState$.pipe(map(state => state.track_window.current_track))
export let currentTrackImages$ = currentTrack$.pipe(map(track => track.album.images))

export let paused$ = playbackState$.pipe(map(state => state.paused))
export let duration$ = playbackState$.pipe(map(state => state.duration))
export let position$ = playbackState$.pipe(map(state => state.position))
export const lerpedPosition$ = paused$.pipe(
    switchMap(isPaused => isPaused
        ? position$ // stay at the same time
        : position$.pipe( // interpolate position based on time
            mergeMap(position => animationFrames().pipe(map(({elapsed}) => elapsed + position)))
        )
    )
)
