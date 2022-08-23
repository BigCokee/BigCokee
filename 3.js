async function draw(data) {
  data.forEach((d) => {
    d.duration = d3.timeMinute.count(
      d3.timeParse("%d/%m/%Y %H:%M:%S")(d.student_enter_time),
      d3.timeParse("%d/%m/%Y %H:%M:%S")(d.student_leave_time)
    );
    d.participation = Math.random();
    d.active_time = new Date(d.student_active_start_time);
  });

  let participation_bar_chart = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: data },
    title: { text: "Participation & Marks", fontSize: 26 },
    width: "container",
    height: "container",
    encoding: {
      x: { field: "student_group_code" },
    },
    layer: [
      {
        mark: { type: "bar", color: "#7093b9", opacity: 0.8, width: 30,legend:{position:'top'} },
        encoding: {
          y: { aggregate: "mean", field: "participation" },
        },
      },
      {
        mark: { type: "bar", color: "#f79d46", opacity: 0.7, width: 15 },
        encoding: {
          y: {
            aggregate: "mean",
            field: "average_marks",
            axis: {
              orient: "right",
              format: "s",
            },
          },
        },
      },
    ],
    resolve: { scale: { y: "independent" } },
  };
  vegaEmbed("#participation_bar_chart", participation_bar_chart);
  const draw_table = () => {
    let tr = d3.select("tbody").selectAll("tr").data(data).join("tr");
    tr.append("td")
      .append("input")
      .attr("class", "uk-checkbox")
      .attr("type", "checkbox");
    tr.append("td").text((d) => d.student_name);
    tr.append("td").text((d) => d.average_marks);
    tr.append("td").text((d) => d.LO1_marks);
    tr.append("td").text((d) => d.LO2_marks);
    tr.append("td").text((d) => d.marks_level);
    tr.append("td").text((d) => d.student_group_code);
    tr.append("td").text((d) => d.student_email);
  };
  draw_table();

  let lod = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: "container",

    title: { text: "Target & Learning Outcomes", fontSize: 26 },
    data: { values: data },

    hconcat: [
      {
        mark: "boxplot",
        encoding: {
          x: { field: "learning_trarget", type: "nominal" },
          color: { field: "learning_trarget", type: "nominal", legend: null },
          y: {
            field: "LO1_marks",
            type: "quantitative",
            scale: { zero: false },
          },
        },
      },
      {
        mark: "boxplot",
        encoding: {
          x: { field: "learning_trarget", type: "nominal" },
          color: { field: "learning_trarget", type: "nominal", legend: null },
          y: {
            field: "LO2_marks",
            type: "quantitative",
            scale: { zero: false },
          },
        },
      },
      {
        mark: "boxplot",
        encoding: {
          x: { field: "learning_trarget", type: "nominal" },
          color: { field: "learning_trarget", type: "nominal", legend: null },
          y: {
            field: "LO3_marks",
            type: "quantitative",
            scale: { zero: false },
          },
        },
      },
      {
        mark: "boxplot",
        encoding: {
          x: { field: "learning_trarget", type: "nominal" },
          color: { field: "learning_trarget", type: "nominal", legend: null ,  scale: {
            domain: ["Academic", "Industrial", "Other"],
            range: ["#537DAB", "#EC7A79", "#F89D54"],
          },},
          y: {
            field: "LO4_marks",
            type: "quantitative",
            scale: { zero: false },
          },
        },
      },
    ],
  };

  vegaEmbed("#Lod", lod);

  let participation_boxplot = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: { text: "Learning Participation", fontSize: 26 },
    width: "container",
    height: "container",
    data: { values: data },
    mark: "line",
    encoding: {
      x: { field: "week", type: "nominal" },
      color: { field: "student_group_code", type: "nominal" ,legend:{title:"Group"}},
      y: {
        field: "participation",
        type: "quantitative",
        scale: { zero: false },
      },
    },
  };
  vegaEmbed("#participation_boxplot", participation_boxplot);
}

document
  .getElementsByClassName("title-1")[0]
  .addEventListener("click", function (e) {
    window.location.href = "1.html";
  });

document
  .getElementsByClassName("title-2")[0]
  .addEventListener("click", function (e) {
    window.location.href = "2.html";
  });

document
  .getElementsByClassName("title-3")[0]
  .addEventListener("click", function (e) {
    window.location.href = "3.html";
  });
document
  .getElementsByClassName("title-5")[0]
  .addEventListener("click", function (e) {
    window.location.href = "index.html";
  });
async function init() {
  let data = await d3.csv("./LAD_simulation_dataset.csv");
  data.forEach((d) => {
    d.major = d.student_pre_major;
    d.group = d.student_group_code;
    d.target = d.learning_trarget;
  });
  draw(data);
  const get_cates = (col) => [...new Set(data.map((d) => d[col]))];
  let filters = {};
  add_select({
    div: d3.select("#week"),
    options: get_cates("week"),
    classname: "week",
    changeEvent,
  });
  add_select({
    div: d3.select("#learning_trarget"),
    options: get_cates("learning_trarget"),
    classname: "target",
    changeEvent,
  });
  add_select({
    div: d3.select("#student_group_code"),
    options: get_cates("student_group_code"),
    classname: "group",
    changeEvent,
  });

  function changeEvent(e, d) {
    let filter_value = { [this.className]: e.target.value };

    Object.assign(filters, filter_value);
    // 循环筛选器的多个条件,筛选数据
    let fiter_func = (d) => {
      let reduce_func = (pre, cur) => {
        return pre && (cur[1] === "All" ? true : d[cur[0]] === cur[1]);
      };
      return Object.entries(filters).reduce(reduce_func, true);
    };

    let chart_data = data.filter((d) => {
      let x = fiter_func(d);
      return x;
    });
    draw(chart_data);
  }

  function add_select({ div, options, classname, changeEvent }) {
    options.unshift("All");
    // label
    div
      .selectAll(`.labelclassname`)
      .data([0])
      .join("label")
      .attr("class", "label" + classname)
      .html(classname);
    // add select
    let select = div
      .selectAll(`.classname`)
      .data([0])
      .join("select")
      .attr("class", classname);
    // opotions
    let option = select
      .selectAll("option")
      .data(options)
      .join("option")
      .attr("value", (d) => d)
      .html((d) => d);

    select.on("change", changeEvent);
  }
}
init();

d3.selectAll(".close").on("click", function (e) {
  window.location.href = "index.html";
});
