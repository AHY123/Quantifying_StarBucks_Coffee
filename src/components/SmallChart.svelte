<script>
    import { onMount, afterUpdate } from "svelte";
    import * as d3 from "d3";

    onMount(async () => {
        const response = await fetch("starbucks.csv");
        const text = await response.text();
        raw_data = d3.csvParse(text, d3.autoType);
        // console.log("data: ");
        // console.log(raw_data);
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
    let hovered = -1;
    let selected_bar = "";
    let recorded_mouse_position = {
        x: 0,
        y: 0,
    };
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
            // console.log(row);
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

    function showTooltip(event, d) {
        const tooltip = document.getElementById("tooltip");
        tooltip.innerHTML = `${d.Drink}: ${d.Data}`;
        tooltip.style.display = "block";
        tooltip.style.left = event.clientX + 10 + "px";
        tooltip.style.top = event.clientY + 10 + "px";
    }

    // Function to hide tooltip
    function hideTooltip() {
        const tooltip = document.getElementById("tooltip");
        tooltip.style.display = "none";
    }
</script>

<head>
    <title> Quantifying Starbucks Coffee </title>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=PT+Sans&display=swap");

        .row {
            display: flex;
            height: 70vh;
        }
        .col_left {
            padding: 20px;
            width: 50%;
            /* If you want to ensure content is vertically aligned, you can add */
            display: flex;
            justify-content: center; /* Center horizontally */
            align-items: center; /* Center vertically */
        }
        .col_right {
            padding: 20px;
            width: 50%;
            /* Same vertical alignment styles if needed */
            /* display: flex; */
            justify-content: center; /* Center horizontally */
            align-items: center; /* Center vertically */
        }
        .writeup {
            font-family: "PT Sans", sans-serif;
            font-size: 14px;
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
            stroke-opacity="0.1"
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
                <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                {#each plot_data as d, i}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
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
                        on:mouseover={(event) => {
                            hovered = i;
                            selected_bar = d;
                            recorded_mouse_position = {
                                x: event.pageX,
                                y: event.pageY,
                            };
                            // console.log(recorded_mouse_position);
                        }}
                        on:mouseout={(event) => {
                            hovered = -1;
                        }}
                    />
                {/each}
                <!-- X-Axis Title -->
                <text
                    x={width / 2}
                    y={height - 20}
                    text-anchor="middle"
                    font-size="16"
                    fill="black">{option_nutrition}</text
                >
                <!-- Y-Axis Title -->
                <text
                    transform={`translate(${60}, ${height / 2}) rotate(-90)`}
                    text-anchor="middle"
                    font-size="16"
                    fill="black">{"Starbucks Drinks Based on Filters"}</text
                >
                <!-- Chart Title -->
                <text
                    x={width / 2}
                    y={40}
                    text-anchor="middle"
                    font-size="24"
                    fill="black"
                    >{"The Amount of " +
                        option_nutrition +
                        " in Starbucks Drinks"}
                </text>
                <g>
                    {#if hovered !== -1}
                        <g
                            transform="translate({recorded_mouse_position.x - 100}, {recorded_mouse_position.y - 20})"
                            class={hovered === -1
                                ? "tooltip-hidden"
                                : "tooltip-visible"}
                        >
                            <rect
                                width={170}
                                height={55}
                                fill="white"
                                stroke="black"
                                debug={"trying to show"}
                            />
                            <text x={10} y={20} font-size='14px'> Amount of {option_nutrition}:</text>
                            <text x={10} y={40} font-size='12px'>{selected_bar.Data} </text>
                        </g>
                    {/if}
                </g>
            </g></svg
        >
    </div>
    <div class="col_right">
        <u class="writeup"> Write-up: </u>
        <p class="writeup">
            For our visualization project, we decided to focus on Starbucks
            drinks, comparing their major nutritional values: Calories (©), Fat
            (g), Protein (g), and Caffeine (g). We aimed to create an
            interactive visualization that allows users to select these values,
            as well as choose from different sizes (Short, Tall, Grande, Venti),
            and categories (Coffee, Classic Espresso, Signature Espresso Drinks,
            etc).
        </p>
        <p class="writeup">
            In terms of design, we opted to dynamically adjust the title based
            on the selected categories to tailor the visualization. To
            differentiate between drink types, we chose a color scheme that
            enhances readability without any specific meaning attached to the
            colors. We made certain design choices to ensure that the bars on
            the chart align correctly and are easily distinguishable, which made
            it so we couldn’t wrap the titles of our drinks. While we initially
            considered adding zoom functionality, we found that the color scheme
            made it unnecessary since it allowed for easy differentiation
            between all of the drinks. Other decisions that we felt were useful
            included the adding of the filtering of categories at the bottom of
            the page, because it felt both aesthetic and intuitive for the user.
            Other alternatives that we tried but ultimately scraped were trying
            to add colors based on the type of drink, but we found it
            time-consuming and confusing, especially due to the fact that the
            user could already filter based on the drink at the bottom of the
            screen.
        </p>
        <p class="writeup">
            During the development process, we encountered many challenges,
            especially with GitHub integration and data handling. We initially
            thought the process wouldn’t be insanely difficult, because we
            thought the code from d3 would lead us easily. However, as we
            divided the work, with one of us focusing on the main graph and the
            other on the filter-driven smaller graph, we slowly realized how
            time consuming this project took. Our development time totaled
            approximately 25 hours. The most time-consuming tasks were getting
            the visualization to display correctly on GitHub and handling the
            data conversion from d3 to Svelte.
        </p>
        <p class="writeup">
            Overall, we are reasonably satisfied with the project. However, we
            acknowledge that there are aspects we could improve, such as the
            aesthetics. Given the time constraints as well as the learning
            constraints, we found it challenging to experiment with different
            fonts and colors. For us, we found this project challenging and want
            to highlight the complexities of creating visualizations and
            websites, particularly without extensive knowledge of HTML, CSS, and
            JavaScript.
        </p>
    </div>
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
    /> -->
</div>
