<script lang="ts">

    import {BehaviorSubject, concat, NEVER, timer} from "rxjs";
    import {distinctUntilChanged, map, switchMap} from "rxjs/operators";
    import {duration$, lerpedPosition$, position$} from "./rxSpotifyWebPlayBackSDK";

    const millisToMinutesAndSeconds = millis => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    };

    const seeking$ = new BehaviorSubject(false)

    const currentTime$ = seeking$.pipe(
        switchMap(seeking => seeking ? desiredPosition$ : lerpedPosition$),
        map(position => millisToMinutesAndSeconds(position)),
        distinctUntilChanged()
    )

    const seekbarPosition$ = seeking$.pipe(
        switchMap(seeking => seeking
            ? NEVER // while seeking, we dont want to push new positions to the seekbar under the users mouse/finger
            : concat(timer(200), lerpedPosition$) // ensure we dont switch back to stale BehaviourSubject State
        )
    )
    const desiredPosition$ = new BehaviorSubject(position$)
    seekbarPosition$.set = it => desiredPosition$.next(it)

</script>

<div class="seekbar">
    {$currentTime$}
    <input type=range
           min=0 bind:value={$seekbarPosition$} max={duration$}
           on:mousedown={ _ => seeking$.next(true)  }
           on:mouseup={   _ => seeking$.next(false) }
           on:change
    >
    {millisToMinutesAndSeconds(duration$)}
</div>