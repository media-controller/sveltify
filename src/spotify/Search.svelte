<script lang='typescript'>
    import {of, fromEvent, from} from 'rxjs'
    import {
        map,
        concatMap,
        catchError,
        switchMap,
        startWith,
        debounceTime,
    } from 'rxjs/operators'
    import {onMount$} from "../util/lifecycles";
    import {api} from "./api";
    import SpotifyPagingObject from "./SpotifyPagingObject.svelte";

    let inputElement

    export let searchDebounceTime = 350
    export let searchPromise

    const searchResults$ = onMount$.pipe(
        concatMap(() =>
            fromEvent(inputElement, 'input').pipe(
                debounceTime(searchDebounceTime),
                map(e => e.target.value),
                switchMap(query =>
                    !query ? of([])
                        : from(api.search(query, ["album", "artist", "playlist", "track"])).pipe(
                        catchError(err => of({error: true, message: err.message})),
                        )),
                startWith([]),
            ),
        ),
    )

    $: albums = ($searchResults$)?.albums
    $: artists = ($searchResults$)?.artists
    $: tracks = ($searchResults$)?.tracks
    $: playlists = ($searchResults$)?.playlists

</script>

Search <br>
<input bind:this="{inputElement}"/> <br>

{#if $searchResults$}
<pre>
    <SpotifyPagingObject pagingObject={albums} />
    <SpotifyPagingObject pagingObject={artists} />
    <SpotifyPagingObject pagingObject={tracks} />
    <SpotifyPagingObject pagingObject={playlists} />
</pre>
{/if}
