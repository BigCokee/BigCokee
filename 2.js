async function draw(data) {
  console.log(data);
  data.forEach((d) => {
    d.duration = d3.timeMinute.count(
      d3.timeParse("%d/%m/%Y %H:%M:%S")(d.student_enter_time),
      d3.timeParse("%d/%m/%Y %H:%M:%S")(d.student_leave_time)
    );
    d.duration = parseInt(d.duration / 10) * 10;

    d.participation = Math.random()/2+0.5;
    d.active_time = new Date(d.student_active_start_time);
  });

  let course_activity = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
      values: data,
    },
    title: { text: "Course Activity", fontSize: 26 },
    width: "container",
    height: "container",

    mark: {
      type: "circle",
      opacity: 0.8,
      stroke: "black",
      strokeWidth: 1,
    },

    encoding: {
      y: {
        field: "student_group_code",
        type: "nominal",
        axis: { grid: true },
      },
      x: {
        field: "active_time",
        type: "temporal",
        axis: { title: "", grid: false },
      },
      size: {
        field: "student_interaction",
        type: "quantitative",
        title: "student_interaction",
        legend: { clipHeight: 20, title: "interaction" },
        scale: { rangeMax: 600 },
      },
      color: { field: "student_group_code", type: "nominal", legend: null },
    },
  };
  vegaEmbed("#course_activity", course_activity);

  let course_participation = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: data },
    title: { text: "Course Participation ", fontSize: 26 },
    width: "container",
    height: "container",
    mark: { type: "line", interpolate: "monotone" },
    encoding: {
      y: { aggregate: "mean", type: "quantitative",field:"participation" },
      x: { field: "active_time", type: "temporal" },
    },
  };
  vegaEmbed("#course_participation", course_participation);

  let participation_boxplot = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: "container",
    title: { text: "Course Participation ", fontSize: 26 },
    data: { values: data },
    mark: "boxplot",
    encoding: {
      x: { field: "student_pre_major", type: "nominal" },
      color: { field: "student_pre_major", type: "nominal", legend: null },
      y: {
        field: "participation",
        type: "quantitative",
        scale: { zero: false },
      },
    },
  };
  vegaEmbed("#participation_boxplot", participation_boxplot);
  const draw_table = () => {
    let tr = d3.select("tbody").selectAll("tr").data(data).join("tr");
    tr.append("td")
      .append("input")
      .attr("class", "uk-checkbox")
      .attr("type", "checkbox");
    tr.append("td").text((d) => d.student_name);

    tr.append("td").text((d) => d.learning_trarget);
    tr.append("td").text((d) => d.student_interaction);
    tr.append("td").text((d) => d.nationality);
    tr.append("td").text((d) => d.student_group_code);
    tr.append("td").text((d) => d.student_email);
  };
  draw_table();
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
    div: d3.select("#student_pre_major"),
    options: get_cates("nationality"),
    classname: "nationality",
    changeEvent,
  });
  add_select({
    div: d3.select("#learning_trarget"),
    options: get_cates("target"),
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

    let chart_data = data.filter(fiter_func);
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

import Chart from "./chart.js";

class Force extends Chart {
  constructor(id, data) {
    super(id, data);
    d3.select("body")
      .append("div")
      .style("display", "none")
      .attr("position", "absolute")
      .attr("class", "d3-tip");

    super.add_svg();
    super.update_chart();
  }

  add_scale() {
    this.svg
      .append("text")
      .attr("x", 120)
      .attr("y", 20)
      .text("Social Networks")
      .attr("font-size", 26)
      .attr("font-weight", "bold");
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        "link",
        d3
          .forceLink(this.links)
          .id((d) => d.id)
          .distance(150)
          .strength(3)
      )
      .force("collid", d3.forceCollide().radius(30))
      .force("x", d3.forceX())
      .force("y", d3.forceY());
  }
  update_data() {
    // 序号,方向,学校,一级单位,二级单位,姓名
    // this._data = d3.group(this.data, (d) => d.student_name_from);
    // this.root = d3.hierarchy(this._data);
    this.nodes = [...new Set(this.data.map((d) => d.student_name_to))].map(
      (d) => {
        return { id: d };
      }
    ); // this.root.descendants();
    this.links = this.data.map((d) => {
      return { source: d.student_name_from, target: d.student_name_to };
    });
  }

  draw_chart() {
    this.ChartArea.attr(
      "transform",
      `translate(${this.innerW / 2},${this.innerH / 1.5})`
    );
    const link = this.ChartArea.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(this.links)
      .join("line");
    const color = d3
      .scaleOrdinal()
      .domain(this.nodes)
      .range(d3.schemeTableau10);
    this.color = color;
 
    const node = this.ChartArea.append("g")
      .attr("fill", "#fff")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(this.nodes)
      .join("circle")
      .attr("fill", (d) => color(d.id))

      .attr("r", 15)
      .call(drag(this.simulation));

    const text = this.ChartArea.append("g")

      .selectAll("text")
      .data(this.nodes)
      .join("text")
      .attr("font-size", 9)
      .text((d) => d.id)
      .call(drag(this.simulation));

    // node
    //   .on("mouseenter", (e, d) => {
    //     let html = `
    //         <p>${d.data.student_name_from}</p>
    //         <p>${d.data.student_name_to}</p>
    //         <p>${d.data.student_interaction}</p>
    //         `;
    //     html = d.depth > 2 ? html : `${d.data[0]}`;
    //     this.tips_show(e, d, html);
    //   })
    //   .on("mouseout", this.tips_hide);

    node.append("title").text((d) => d.id);

    this.simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      text.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    this.add_legend();
  }

  add_legend() {
    let data = this.nodes.map((d) => d.id).sort();

    let g = this.svg
      .append("g")
      .attr("transform", `translate(${this.innerW - 100},0)`);
    g.append("text")
      .text("numbers")
      .attr("x", 20)
      .attr("y", 20)
      .attr("fill", "gray");

    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("x", 20)
      .attr("y", (d, i) => 30 + i * 25)
      .attr("fill", (d) => this.color(d));
    g.selectAll("mytext")
      .data(data)
      .join("text")
      .attr("x", 45)
      .attr("y", (d, i) => 30 + i * 25 + 15)
      .text((d) => d)
      .attr("fill", "gray");
  }
}

async function get_data() {
  const data = await d3.csv("./force.csv");
  new Force("force", data);
}

get_data();

function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

d3.selectAll(".close").on("click", function (e) {
  window.location.href = "index.html";
});
