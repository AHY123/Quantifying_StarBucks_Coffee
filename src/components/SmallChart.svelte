<script>
    import { onMount, afterUpdate } from "svelte";
    import * as d3 from "d3";

    onMount( async() => {
        const response = await fetch("starbucks.csv");
        const text = await response.text();
        raw_data = d3.csvParse(text, d3.autoType);
        // console.log("data: ");
        console.log(raw_data);
        // console.log("data: ");
        // console.log(raw_data[0]["Beverage"]);
        get_plot_data();
        // console.log("plot_data: ");
        // console.log(plot_data);
    });

    //Chart Configurations
    const margin = { top: 70, bot: 70, left: 400, right: 50 };
    const width = 400 + margin.left + margin.right;
    const height = 400 + margin.top + margin.bot;

    let raw_data = [];
    let plot_data = [];
    $: option_nutrition = "Calories";
    $: option_category = "All";
    $: option_size = "All";
    $: option_added_sugar = 0;
    $: option_added_milk = 0;

    //Chart Creation
    let x_axis;
    let y_axis;
    let svg;
    let innerWidth = width - margin.left - margin.right;
    let innerHeight = height - margin.top - margin.bot;

    $: {
        get_plot_data();
    }

    $: x = d3
        .scaleLinear()
        .range([margin.left, width - margin.right])
        .domain([0, d3.max(plot_data, (d) => d.Data)]);

    $: y = d3
        .scaleBand()
        .padding(0.2)
        .range([height - margin.bot, margin.top])
        .domain(plot_data.map((d) => d.Drink));

    $: color = d3
        .scaleOrdinal()
        .domain(plot_data.map((d) => d.Drink))
        .range(generateColors(plot_data.length));

    $: d3.select(x_axis).call(d3.axisBottom(x));
    $: d3.select(y_axis).call(d3.axisLeft(y));

    $: {
        if (raw_data.length) {
            console.log("Detected Change: ");
        }
    }

    afterUpdate(() => {
        get_plot_data();
    });


    function get_plot_data() {
        plot_data = [];
        raw_data.forEach((row) => {
            console.log(row);
            if (
                (option_size == "All" || row["Size"] == option_size) &&
                (option_category == "All" ||
                    row["Beverage_category"] == option_category)
            ) {
                plot_data.push({
                    Drink: row["Beverage"] + " " + row["Size"],
                    Data: row[option_nutrition],
                });
            }
        });
        plot_data.sort((a, b) => -((+b.Data || 0) - (+a.Data || 0)));
    }

    function generateColors(n) {
        let out = [];
        const colors = [
            "#a6cee3",
            "#1f78b4",
            "#b2df8a",
            "#33a02c",
            "#fb9a99",
            "#e31a1c",
            "#fdbf6f",
            "#ff7f00",
            "#cab2d6",
            "#6a3d9a",
            "#ffff99",
            "#b15928",
        ];
        for (let i = 0; i < n; i++) {
            out.push(colors[i % colors.length]);
        }
        return out;
    }
</script>

<head>
    <title> Quantifying Starbucks Coffee </title>
    <style>
        .row {
            display: flex;
            height: 70vh;
        }
        .col_left {
            width: 70%;
            /* If you want to ensure content is vertically aligned, you can add */
            display: flex;
            justify-content: center; /* Center horizontally */
            align-items: center; /* Center vertically */
        }
        .col_right {
            width: 30%;
            /* Same vertical alignment styles if needed */
            display: flex;
            justify-content: center; /* Center horizontally */
            align-items: center; /* Center vertically */
        }
    </style>
</head>
<div class="row">
    <div class="col_left">
        <!-- <div class="row" display='flex'>Left Column Content</div> -->

        <svg
            class="chart-svg"
            {width}
            {height}
            style="border:5px solid black"
            stroke-opacity="0.2"
            viewBox="0 0 {width} {height}"
        >
            <!-- X-Axis -->
            <g
                bind:this={x_axis}
                transform="translate(0, {height - margin.bot})"
            />
            <!-- Y-Axis -->
            <g bind:this={y_axis} transform="translate({margin.left}, 0)" />

            <g stroke="#000" stroke-opacity="0.2">
                {#each plot_data as d, i}
                    <rect
                        key={i}
                        x={margin.left}
                        y={y(d.Drink)}
                        width={x(d.Data) - margin.left}
                        height={y.bandwidth()}
                        stroke="black"
                        opacity="0.8"
                        fill={color(d.Drink)}
                        drink={d.Drink}
                        data={d.Data}
                    />
                {/each}
                <!-- X-Axis Title -->
                <text
                    x={(width) / 2}
                    y={height - 20}
                    text-anchor="middle"
                    font-size="16"
                    fill="black">{option_nutrition}</text
                >
                <!-- Y-Axis Title -->
                <text
                    transform={`translate(${60}, ${
                        height / 2
                    }) rotate(-90)`}
                    text-anchor="middle"
                    font-size="16"
                    fill="black">{'Starbucks Drinks Based on Filters'}</text
                >
                <!-- Chart Title -->
                <text
                    x={(width) / 2}
                    y={40}
                    text-anchor="middle"
                    font-size="24"
                    fill="black">{'The Amount of ' + option_nutrition + ' in Starbucks Drinks'}</text
                >
            </g></svg
        >
    </div>
    <div class="col_right">right div</div>
</div>
<div class="col_left">
    <p>Select Nutritional Value:</p>
    <select bind:value={option_nutrition} class="select">
        <!-- Add options here based on your data columns e.g., Calories, Total Fat -->
        <option value="Calories">Calories</option>
        <option value="Total Fat (g)">Total Fat (g)</option>
        <option value="Protein (g)">Protein (g)</option>
        <option value="Caffeine (mg)">Caffeine (mg)</option>
    </select>
    <p>Select Size:</p>
    <select bind:value={option_size} class="select">
        <option value="All">All</option>
        <option value="Short">Short</option>
        <option value="Tall">Tall</option>
        <option value="Grande">Grande</option>
        <option value="Venti">Venti</option>
    </select>
    <p>Select Category:</p>
    <select bind:value={option_category} class="select">
        <option value="All">All</option>
        <option value="Coffee">Coffee</option>
        <option value="Classic Espresso Drinks">Classic Espresso Drinks</option>
        <option value="Signature Espresso Drinks"
            >Signature Espresso Drinks</option
        >
        <option value="Tazo® Tea Drinks">Tazo® Tea Drinks</option>
        <option value="Shaken Iced Beverages">Shaken Iced Beverages</option>
        <option value="Frappuccino® Blended Coffee"
            >Frappuccino® Blended Coffee</option
        >
        <option value="Frappuccino® Blended Crème"
            >Frappuccino® Blended Crème</option
        >
    </select>
    <!-- <input class="input"
        type="number"
        bind:value={option_added_sugar}
        min="0"
        placeholder="Add Sugar (g)"
    />
    <input class="input"
        type="number"
        bind:value={option_added_milk}
        min="0"
        placeholder="Add Milk (ml)"
    /> -->
</div>
