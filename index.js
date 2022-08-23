let bar = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",

  config: {
    axis: { disable: true },
    view: { stroke: "transparent" },
    legend: { disable: true },
  },
  width: "container",
  height: "container",

  data: {
    values: [
      { a: "A", b: 28 },
      { a: "B", b: 55 },
      { a: "C", b: 43 },
      { a: "D", b: 91 },
      { a: "E", b: 81 },
      { a: "F", b: 53 },
    ],
  },
  mark: { type: "bar", opacity: 0.4 },
  encoding: {
    x: { field: "a", type: "nominal" },
    y: { field: "b", type: "quantitative" },
    color: { value: "#62CF7D" },
  },
};

let circle = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  description:
    "Horizontally concatenated charts that show different types of discretizing scales.",
  config: {
    axis: { disable: true },
    view: { stroke: "transparent" },
    legend: { disable: true },
  },
  width: "container",
  height: "container",
  data: {
    values: [
      { a: "A", b: 220 },
      { a: "B", b: 120 },
      { a: "C", b: 243 },
      { a: "D", b: 191 },
      { a: "E", b: 181 },
    ],
  },

  mark: { type: "circle", opacity: 0.4 },
  encoding: {
    x: {
      field: "b",
      type: "nominal",
      sort: null,
    },
    size: {
      field: "b",
      type: "quantitative",
      scale: {
        type: "quantize",
      },
    },
    color: {
      value: "#FFA03F",
    },
  },
};

let viz_8_group = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",

  config: {
    axis: { disable: true },
    view: { stroke: "transparent" },
    legend: { disable: true },
  },
  width: "container",
  height: "container",

  data: {
    values: [
      { a: "A", b: 28 },
      { a: "B", b: 28 },
      { a: "C", b: 28 },
      { a: "D", b: 28 },
      { a: "E", b: 28 },
      { a: "F", b: 28 },
      { a: "G", b: 28 },
      { a: "H", b: 28 },
      { a: "I", b: 28 },
    ],
  },
  mark: { type: "bar", height: 20, opacity: 0.5 },
  encoding: {
    x: { field: "a", type: "nominal" },
    y: { field: "b", type: "quantitative" },
    color: { value: "#76B3F2" },
  },
};

vegaEmbed("#viz_8_group", viz_8_group);
vegaEmbed("#viz_8_group2", viz_8_group);
vegaEmbed("#viz_8_group3", viz_8_group);
vegaEmbed("#viz_bar", bar);
vegaEmbed("#viz_bar2", bar);
vegaEmbed("#viz_bar3", bar);
vegaEmbed("#viz_circle", circle);
vegaEmbed("#viz_circle2", circle);
vegaEmbed("#viz_circle3", circle);
d3.selectAll("#goto_1").on("click", function (e) {
  window.location.href = "1.html";
});

d3.selectAll("#goto_2").on("click", function (e) {
  window.location.href = "2.html";
});

d3.selectAll("#goto_3").on("click", function (e) {
  window.location.href = "3.html";
});

let hides = d3.selectAll(".hide");

hides.on("click", function (e) {
  let div = d3.select(this).node().parentNode;
  let parent = d3.select(div).node().parentNode;
  //.parentNode//.node()//.parentNode();
  d3.select(parent).style("display", "none");
  console.log(parent);
});

let show = d3.selectAll(".show");
show.on("click", function () {
  let div = d3.select(this).node().parentNode;
  let parent = d3.select(div).node().parentNode;
  let parent2 = d3.select(parent).node().parentNode;

  d3.select(parent2).selectAll(".content").style("display", null);
});
