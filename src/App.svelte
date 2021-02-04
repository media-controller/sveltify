<script lang='typescript'>
    import Player from "./spotify/Player.svelte";
    import {player$, playbackState$,} from "./spotify/rxSpotifyWebPlayBackSDK";
    import Me from "./spotify/Me.svelte";
    import Search from "./spotify/Search.svelte";
    import {
        paused$,
        duration$,
        position$,
        currentTrack$,
        currentTrackImages$,
        lerpedPosition$,
    } from "./spotify/rxSpotifyWebPlayBackSDK";

    $: connectedPlayer = $player$
    $: playbackState = $playbackState$

</script>

<Search/>


paused$ = {$paused$} <br>
duration$ = {$duration$} <br>
position$ = {$position$} <br>
currentTrack$ = {$currentTrack$} <br>
currentTrackImages$ = {$currentTrackImages$} <br>
lerpedPosition$ = {$lerpedPosition$} <br>

<Me/>

{#if playbackState }
    Player: <br>
<!--    <Player {connectedPlayer} {playbackState}/>-->
{:else}
    Connecting to Spotify
{/if}
