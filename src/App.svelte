<script lang='typescript'>
    import Player from "./spotify/Player.svelte";
    import {
        accountErrors$,
        authenticationErrors$,
        initializationErrors$,
        playbackErrors$,
        player$
    } from "./spotify/WebPlaybackStore";

    $: player = $player$
    $: console.error("Acount         :", $accountErrors$)
    $: console.error("Authentication :", $authenticationErrors$)
    $: console.error("Initialization :", $initializationErrors$)
    $: console.error("Playback       :", $playbackErrors$)
</script>

{#if player}
    {#await player.connect()}
        Connecting to player...
    {:then connected}
        {#if connected}
            <Player {player}/>
        {:else}
            failed to connect
        {/if}
    {/await}
{:else}
    Web Playback SDK Loading...
{/if}
