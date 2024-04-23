<script>
    import ColorThief from "colorthief";
    import { onMount } from "svelte";
    import { formatHex } from "culori";

    export let videoSource = null;
    let loading = false;
    export const obtenerVideoCamara = async () => {
        try {
            loading = true;
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment"
                },
            });
            videoSource.srcObject = stream;
            videoSource.play();
            loading = false;

            videoSource.addEventListener(
                "canplay",
                (ev) => {
                    canvas.width = videoSource.videoWidth;
                    canvas.height = videoSource.videoHeight;
                },
                false,
            );
        } catch (error) {
            console.log(error);
        }
    };

    onMount(() => {
        const colorThief = new ColorThief();
        const ctx = canvas.getContext("2d");

        img.addEventListener("load", function () {
            const raw_color = colorThief.getColor(img);
            color = formatHex({
                r: raw_color[0] / 255,
                g: raw_color[1] / 255,
                b: raw_color[2] / 255,
                mode: "rgb",
            });
            // dot.style.setProperty("background-color", color);
        });

        setInterval(() => {
            ctx.drawImage(videoSource, 0, 0, canvas.width, canvas.height);
            const image = canvas.toDataURL("image/jpeg");
            // console.log(image);
            img.src = image;
            // console.log(colorThief.getColor(img));
        }, 100);
    });

    let canvas;
    let img;
    export let color;
</script>

<div>
    <!-- {#if loading}
      <h1>LOADING</h1>
    {/if} -->
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this={videoSource} style="display: none" />
    <canvas bind:this={canvas} style="display: none" />
    <img bind:this={img} style="display: none" />
    {#if videoSource && videoSource.srcObject}
        <span class="dot" style="background-color: {color}"></span>
    {/if}
</div>

<style>
    .dot {
        height: 100px;
        width: 100px;
        border-radius: 50%;
        display: inline-block;
    }
</style>
