<script lang='typescript'>
    import {api} from './api';
</script>

<div class="Me">
    {#await api.getMe() then me}
        <h1>{me.display_name}</h1>
        <img src="{me?.images[0].url}" alt="{me.display_name}'s picture.">
    {:catch err}
        Spotify.getMe() failed: {err.response}
    {/await}
</div>


<style>
    div {
        /*background-color: blue;*/
    }
</style>