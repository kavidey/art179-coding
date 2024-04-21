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
        
    }

    /**
     * @param {string} color
     */
    async function addColor(color) {
        const { data, error } = await supabase
            .from("color")
            .insert([{ color: color }])
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
    }
    const width = 500;
    const height = 500;
    const max_colors = 5;

    /**
     * @type {HTMLCanvasElement}
     */
    let canvas;

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

        await getColors();

        const ctx = canvas.getContext("2d");

        // let points = [
        //     { x: 10, y: 10, c: oklab(parse("#FF0000")) },
        //     { x: 70, y: 150, c: oklab(parse("#FFFF00")) },
        //     { x: 224, y: 300, c: oklab(parse("#00FF00")) },
        //     { x: 121, y: 100, c: oklab(parse("#00FFFF")) },
        //     { x: 160, y: 10, c: oklab(parse("#FF00FF")) },
        // ];

        // console.log(points);

        // iterate all the pixels between the given points
        $: {
            if (colors) {
                console.log(colors);
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
        }
    });
</script>

<button
    on:click={() => {
        addColor(generateRandomColor());
    }}>Add Color</button
>
<br>

<canvas bind:this={canvas} {width} {height} />

{#if colors}
{#each colors as color}
<div style:background-color={formatCss(color.c)}>
    {JSON.stringify(color)}
</div>
{/each}
{/if}

