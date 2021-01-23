<script lang="ts">

    import {animationFrames, BehaviorSubject, concat, NEVER, timer} from "rxjs";
    import {distinctUntilChanged, map, mergeMap, switchMap} from "rxjs/operators";

    export let position
    const progress$ = new BehaviorSubject(position)
    $: progress$.next(position)

    export let paused
    const paused$ = new BehaviorSubject(paused)
    $: paused$.next(paused)

    export let duration: number

    const millisToMinutesAndSeconds = millis => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    };

    const seeking$ = new BehaviorSubject(false)
    const interpolatedProgress$ = paused$.pipe(
        switchMap(isPaused => isPaused
            ? progress$ // stay at the same time
            : progress$.pipe( // interpolate position based on time
                mergeMap(position => animationFrames().pipe(map(({elapsed}) => elapsed + position)))
            )
        )
    )

    const currentTime$ = seeking$.pipe(
        switchMap(seeking => seeking ? desiredPosition$ : interpolatedProgress$),
        map(position => millisToMinutesAndSeconds(position)),
        distinctUntilChanged()
    )

    const seekbarPosition$ = seeking$.pipe(
        switchMap(seeking => seeking
            ? NEVER // while seeking, we dont want to push new positions to the seekbar under the users mouse/finger
            : concat(timer(200), interpolatedProgress$) // ensure we dont switch back to stale BehaviourSubject State
        )
    )
    const desiredPosition$ = new BehaviorSubject(position)
    seekbarPosition$.set = it => desiredPosition$.next(it)

</script>

<div class="seekbar">
    {$currentTime$}
    <input type=range
           min=0 bind:value={$seekbarPosition$} max={duration}
           on:mousedown={ _ => seeking$.next(true)  }
           on:mouseup={   _ => seeking$.next(false) }
           on:change
    >
    {millisToMinutesAndSeconds(duration)}
</div>