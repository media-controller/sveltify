<script lang='ts'>

    import SpotifyPlayer = Spotify.SpotifyPlayer;
    import ConnectedPlayer from "./ConnectedPlayer.svelte";
    import {device$, playbackState$} from "./WebPlaybackStore";

    export let player: SpotifyPlayer
    const state = $playbackState$

</script>

{#if state}
    <ConnectedPlayer {player} {state}/>
{:else}
    no state
{/if}
