<script>
    import { supabase } from "$lib/supabaseClient";
    import { parse, oklab, samples, interpolate, formatCss } from "culori";
    import { onMount } from "svelte";
    import { getGeometricColorMix } from "$lib/colormix";
    import Video from "./Video.svelte";

    // function generateRandomColor() {
    //     color =  "#000000".replace(/0/g, function () {
    //         return (~~(Math.random() * 16)).toString(16);
    //     });
    // }

    function drawColors() {
        let xcs = colors.map((p) => p.x);
        let ycs = colors.map((p) => p.y);
        let xmin = Math.min(...xcs);
        let xmax = Math.max(...xcs);
        let ymin = Math.min(...ycs);
        let ymax = Math.max(...ycs);
        let x, y;
        let mixColor;

        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                mixColor = getGeometricColorMix({ x: x, y: y }, colors);
                // @ts-ignore
                ctx.fillStyle = formatCss(mixColor);
                ctx?.fillRect(x, y, 1, 1);
            }
        }
    }

    async function addColor() {
        console.log(camera_color);
        const { data, error } = await supabase
            .from("color")
            .insert([
                { color: camera_color, x: Math.random(), y: Math.random() },
            ])
            .select();
    }

    async function getColors() {
        let { data: color, error } = await supabase.from("color").select("*");

        colors = color.map((color) => {
            return {
                x: color.x * width,
                y: color.y * height,
                c: oklab(color.color),
            };
        });
        colors = colors.slice(Math.max(colors.length - max_colors, 1));
        // console.log("got colors");

        drawColors();
    }
    const width = 100;
    const height = 100;
    const max_colors = 10;

    /**
     * @type {HTMLCanvasElement}
     */
    let canvas;
    /**
     * @type {CanvasRenderingContext2D | null}
     */
    let ctx;

    /**
     * @type {any[]}
     */
    let colors;

    onMount(async () => {
        // https://generated.space/sketch/watercolor/
        // https://generated.space/sketch/color-interpolation/
        // https://culorijs.org/api/

        const channels = supabase
            .channel("custom-all-channel")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "color" },
                (payload) => {
                    // console.log("Change received!", payload);
                    getColors();
                },
            )
            .subscribe();

        ctx = canvas.getContext("2d");
        await getColors();
    });

    const blur_amount = 50;

    /**
     * @type {any}
     */
    let videoSource;
    /**
     * @type {any}
     */
    let loadCamera;

    /**
     * @type {string}
     */
    let camera_color;
</script>

<div class="container">
    <canvas
        id="art"
        bind:this={canvas}
        {width}
        {height}
        style="width: 700px; height: 700px;"
    />
</div>
<div class="container"></div>
<br />
<div class="container">
    <Video
        bind:videoSource
        bind:obtenerVideoCamara={loadCamera}
        bind:color={camera_color}
    />
    <br />
    {#if videoSource && !videoSource.srcObject}
        <button on:click={loadCamera} id="enable-video-button"
            >Enable Video</button
        >
    {:else}
        <div class="main">
            <a
                href="#"
                on:click={() => {
                    addColor();
                }}>Add</a
            >
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: fit-content;
        margin-left: auto;
        margin-right: auto;
    }

    @import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@500&display=swap");
    *,
    *::before,
    *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
    }
    .main {
        width: 170px;
        height: 70px;
        font-weight: bold;
        font-size: 20px;
        font-family: "Josefin Sans", sans-serif;
        background-color: #b4b7bf;
        cursor: pointer;
        box-shadow: 5px 5px 0 0;
        transition: 0.3s;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 20px;
    }
    a {
        position: absolute;
        text-decoration: none;
        color: #000;
        z-index: 1000;
    }
    .main::after {
        content: "";
        top: 0;
        left: 0;
        width: 170px;
        height: 70px;
        background: linear-gradient(to right, #ff7675, #e84393);
        opacity: 0;
        transition: 0.3s;
    }
    .main:hover {
        box-shadow: -5px -5px 0 0;
        transform: scale(0.9);
    }
    .main:hover::after {
        opacity: 1;
    }

    #enable-video-button {
        display: inline-block;
        outline: 0;
        text-align: center;
        cursor: pointer;
        padding: 17px 30px;
        border: 0;
        color: #fff;
        font-size: 17.5px;
        border: 2px solid transparent;
        border-color: #000;
        color: #000;
        background: transparent;
        font-weight: 800;
        line-height: 30px;
    }
</style>
