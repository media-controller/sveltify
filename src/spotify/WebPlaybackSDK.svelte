<script>
    import {player$} from "./WebPlaybackStore";
    import Player from "./Player.svelte";
</script>

{#if $player$}
    Loading Player...
{:then player}
    <Player {player}/>
{:catch err}
    Error loading player: {err}
{/if}
