<script lang='typescript'>
    import PlaybackState = Spotify.PlaybackState;
    import SpotifyPlayer = Spotify.SpotifyPlayer;
    import LerpedSeekbar from "./LerpedSeekbar.svelte";
    import {api} from "./api";

    export let player: SpotifyPlayer
    export let state: PlaybackState

    $: track = state.track_window.current_track
    $: images = track.album.images

    let liked
    $: api.containsMySavedTracks([track.id]).then(saved => liked = saved[0])

    const toggleSaved = async () => liked
        ? await api.removeFromMySavedTracks([track.id])
        : await api.addToMySavedTracks([track.id]);

    let volume
    player.getVolume().then(vol => volume = vol)
    $: player.setVolume(volume)


</script>

<div class="player">
    <div class="context"> Playing from {JSON.stringify(state.context, null, '\n')}</div>
    <div class="art"><img src={images[0].url} alt="Album Art"></div>
    <div class="name"><a href="/song/state">{track.name}</a></div>
    <div class="artist"> {track.artists[0].name}</div>
    <div class="liked">
        <button on:click={() => toggleSaved()}>{liked ? '❤️' : '🖤'}</button>
    </div>
    <LerpedSeekbar {...state} on:change={ change => player.seek(change.target.value) }/>
    <div class="controls">
        <button on:click={api.setShuffle(!(state.shuffle))}>🔀</button>
        <button on:click={player.previousTrack()} disabled={state.disallows.skipping_prev}>⬅️</button>
        <button on:click={player.togglePlay()}>{state.paused ? '▶️' : '⏸'}</button>
        <button on:click={player.nextTrack()} disabled={state.disallows.skipping_next}>➡️</button>
        <button on:click={() => { }}>{state.repeat_mode}</button>
    </div>
    <div class="volume">
        🔈 <input type=range min=0 max=1.0 bind:value={volume} step=0.01> 🔊
    </div>
</div>

<style>
    .art > img {
        width: 200px;
        height: 200px;
    }
</style>