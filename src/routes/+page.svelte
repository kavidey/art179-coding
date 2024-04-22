<script>
    import { supabase } from "$lib/supabaseClient";
    import { parse, oklab, samples, interpolate, formatCss } from "culori";
    import { onMount } from "svelte";
    import { getGeometricColorMix } from "$lib/colormix";

    function generateRandomColor() {
        return "#000000".replace(/0/g, function () {
            return (~~(Math.random() * 16)).toString(16);
        });
    }

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

    /**
     * @param {string} color
     */
    async function addColor(color) {
        const { data, error } = await supabase
            .from("color")
            .insert([{ color: color, x: Math.random(), y: Math.random() }])
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
    const max_colors = 5;

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
</script>

<div id="art-container">
    <canvas
        id="art"
        bind:this={canvas}
        {width}
        {height}
        style="width: 700px; height: 700px;"
    />
</div>
<button
    on:click={() => {
        addColor(generateRandomColor());
    }}>Add Color</button
>
<br />

<!-- 
{#if colors}
{#each colors as color}
<div style:background-color={formatCss(color.c)}>
    {JSON.stringify(color)}
</div>
{/each}
{/if}
 -->

<style>
    #art-container {
        max-width: fit-content;
        margin-left: auto;
        margin-right: auto;
    }
</style>
