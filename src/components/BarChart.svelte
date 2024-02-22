<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";

    // Chart Canvas Configurations
    const width = 960;
    const height = 3600;
    const margin = { top: 20, bot: 50, left: 170, right: 30 };

    let data = [];
    let nutritionalValue = "Calories"; // Default selection
    let beverageCategory = "All";
    let drinkSize = "All";
    let addedSugar = 0; // In grams
    let addedMilk = 0; // In milliliters, assuming a simple conversion if needed



    $: {
        if (data.length > 0) {
            console.log("Detect Change: ");
            updateChart(
                data,
                nutritionalValue,
                beverageCategory,
                drinkSize,
                addedSugar,
                addedMilk,
            );
        }
    }

    const fetchData = async () => {
        const response = await fetch("/assets/starbucks.csv");
        const text = await response.text();
        data = d3.csvParse(text, d3.autoType);
        console.log("data: ");
        console.log(data);
        console.log("data: ");
        console.log(data[0]["Beverage"]);

        updateChart(
            data,
            nutritionalValue,
            beverageCategory,
            drinkSize,
            addedSugar,
            addedMilk,
        );
    };

    const updateChart = (
        data,
        nutritionalValue,
        beverageCategory,
        drinkSize,
        addedSugar,
        addedMilk,
    ) => {
        // This function will handle the drawing and updating of the chart
        // You'll need to implement filtering based on beverageCategory, drinkSize, and calculate adjustments for addedSugar and addedMilk
        d3.select(".chart-svg").selectAll("*").remove();

        let plot_data = [];
        data.forEach((row) => {
            // console.log(row)
            if (drinkSize == "All" || row["Size"] == drinkSize) {
                plot_data.push({
                    Drink: row["Beverage"] + " " + row["Size"],
                    Data: row[nutritionalValue],
                });
            }
        });
        plot_data.sort((a, b) => (+a.Data || 0) - (+b.Data || 0));
        console.log(plot_data);

        let svg = d3
            .select(".chart-svg")
            .attr("style", "outline: thin solid black;");
        let width = +svg.attr("width");
        let height = +svg.attr("height");

        let innerWidth = width - margin.left - margin.right;
        let innerHeight = height - margin.top - margin.bot;

        let y = d3
            .scaleBand()
            .range([innerHeight, 0])
            .padding(0.2)
            .domain(plot_data.map((d) => d.Drink));

        let x = d3
            .scaleLinear()
            .range([0, innerWidth])
            .domain([0, d3.max(plot_data, (d) => d.Data)]);

        let g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.right})`);

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x));

        let yAxis = g
            .append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10, "s"));

        // Wrap y-axis labels
        yAxis.selectAll(".tick text").call(wrap, margin.left);

        // Draw bars
        const bars = g.selectAll(".bar").data(plot_data, (d) => d.Drink);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", (d) => y(d.Drink))
            .attr("x", (d) => 0)
            .attr("width", (d) => x(d.Data))
            .attr("height", y.bandwidth())
            .attr("drink_name", (d) => d.Drink)
            .attr("x-value", (d) => d.Data);

        bars.attr("y", (d) => y(d.Drink))
            .attr("x", 0)
            .attr("width", (d) => x(d.Data))
            .attr("height", y.bandwidth());
        
        bars.order();

        bars.exit().remove();
    };

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0.0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text
                    .text(null)
                    .append("tspan")
                    .attr("x", -10)
                    .attr("y", y)
                    .attr("dy", dy + "em");
            while ((word = words.pop())) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width - 20) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text
                        .append("tspan")
                        .attr("x", -10)
                        .attr("y", y)
                        .attr("dy", `${lineHeight}em`)
                        .text(word);
                }
                lineNumber += 1;
            }
        });
    }

    onMount(() => {
        fetchData();
    });
</script>

<select bind:value={nutritionalValue}>
    <!-- Add options here based on your data columns e.g., Calories, Total Fat -->
    <option value="Calories">Calories</option>
    <option value="Total Fat (g)">Total Fat (g)</option>
    <option value="Trans Fat (g)">Trans Fat (g)</option>
    <option value="Saturated Fat (g)">Saturated Fat (g)</option>
    <option value="Sodium (mg)">Sodium (mg)</option>
    <option value="Total Carbohydrates (g)">Total Carbohydrates (g)</option>
    <option value="Cholesterol (mg)">Cholesterol (mg)</option>
    <option value="Dietary Fibre (g)">Dietary Fibre (g)</option>
    <option value="Sugars (g)">Sugars (g)</option>
    <option value="Protein (g)">Protein (g)</option>
    <option value="Vitamin A (% DV)">Vitamin A (% DV)</option>
    <option value="Vitamin C (% DV)">Vitamin C (% DV)</option>
    <option value="Calcium (% DV)">Calcium (% DV)</option>
    <option value="Iron (% DV)">Iron (% DV)</option>
    <option value="Caffeine (mg)">Caffeine (mg)</option>
    <!-- Add more options -->
</select>

<!-- ['Beverage_category', 'Beverage', 'Beverage_prep', 'Size', 'Calories',
       'Total Fat (g)', 'Trans Fat (g)', 'Saturated Fat (g)', 'Sodium (mg)',
       'Total Carbohydrates (g)', 'Cholesterol (mg)', 'Dietary Fibre (g)',
       'Sugars (g)', 'Protein (g)', 'Vitamin A (% DV)', 'Vitamin C (% DV)',
       'Calcium (% DV)', 'Iron (% DV)', 'Caffeine (mg)'] -->

<select bind:value={drinkSize}>
    <!-- Add options here based on your data columns e.g., Calories, Total Fat -->
    <option value="All">All</option>
    <option value="Short">Short</option>
    <option value="Tall">Tall</option>
    <option value="Grande">Grande</option>
    <option value="Venti">Venti</option>
    <!-- Add more options -->
</select>

<!-- Additional dropdowns for beverageCategory and drinkSize similar to above -->

<input
    type="number"
    bind:value={addedSugar}
    min="0"
    placeholder="Add Sugar (g)"
/>
<input
    type="number"
    bind:value={addedMilk}
    min="0"
    placeholder="Add Milk (ml)"
/>

<svg class="chart-svg" {width} {height} stroke="#000" stroke-opacity="0.2"></svg>

<!-- Add tooltip div here -->
